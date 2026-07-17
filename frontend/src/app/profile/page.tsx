/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api';
import { 
  User, Bookmark, FileText, ChevronRight, GraduationCap, MapPin, 
  Mail, Calendar, Settings, Bell, BellRing, Award, CheckCircle, 
  AlertCircle, Loader2, ShieldCheck, Trash2, ClipboardList, Sparkles
} from 'lucide-react';
import { FALLBACK_STATES, FALLBACK_EXAMS, FALLBACK_SCHEMES, FALLBACK_SCHOLARSHIPS } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const INTEREST_OPTIONS = [
  'UPSC', 'SSC', 'Banking', 'Railways', 'Defence', 'PSU', 
  'State Government Jobs', 'Engineering Jobs', 'IT Jobs', 
  'Scholarships', 'Higher Education', 'Skill Development'
];

interface StudentProfile {
  // Personal
  fullName: string;
  dob: string;
  gender: string;
  stateId: string;
  stateName: string;
  district: string;
  category: string;
  pwdStatus: string;
  // Academic
  highestQualification: string;
  currentQualification: string;
  course: string;
  stream: string;
  passingYear: string;
  percentage: string;
  // Interests
  interests: string[];
  // Alerts
  newExams: boolean;
  newScholarships: boolean;
  newSchemes: boolean;
  deadlines: boolean;
  pushNotifications: boolean;
  // AI recommendations
  preferredSector: string;
  income: string;
  skills: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const router = useRouter();

  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    fullName: '',
    dob: '',
    gender: '',
    stateId: '',
    stateName: '',
    district: '',
    category: 'General',
    pwdStatus: 'No',
    highestQualification: 'Graduate',
    currentQualification: '',
    course: '',
    stream: '',
    passingYear: '',
    percentage: '',
    interests: [],
    newExams: true,
    newScholarships: true,
    newSchemes: true,
    deadlines: true,
    pushNotifications: false,
    preferredSector: 'Any',
    income: '',
    skills: ''
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        // Setup initial saved items if guest
        const localSaved = localStorage.getItem('civicai_saved_items');
        
        if (authUser) {
          setUser(authUser);
          
          // Read from Supabase user auth metadata
          if (authUser.user_metadata?.student_profile) {
            setStudentProfile(prev => ({
              ...prev,
              ...authUser.user_metadata.student_profile
            }));
          } else {
            // prefill name from registration profile if metadata is blank
            const dbProfile = await api.getUserProfile() as any;
            if (dbProfile) {
              setStudentProfile(prev => ({
                ...prev,
                fullName: dbProfile.full_name || ''
              }));
            }
          }

          // Fetch database saved bookmarks
          const items = await api.getSavedItems();
          setSavedItems(items || []);
        } else {
          // If guest, try pre-filling from localStorage
          const stored = localStorage.getItem('civicai_student_profile');
          if (stored) {
            setStudentProfile(prev => ({
              ...prev,
              ...JSON.parse(stored)
            }));
          }
          
          // Local guest saved bookmarks
          if (localSaved) {
            setSavedItems(JSON.parse(localSaved));
          }
        }
      } catch (err) {
        console.error('Failed to load profile settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleInterestToggle = (interest: string) => {
    setStudentProfile(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('civicai_student_profile', JSON.stringify(studentProfile));
      
      if (user) {
        const supabase = createClient();
        
        // Store profile securely inside Supabase user Auth Metadata
        const { error } = await supabase.auth.updateUser({
          data: { student_profile: studentProfile }
        });
        if (error) throw error;

        // Sync name changes to public profiles
        await (supabase.from('profiles') as any).update({ full_name: studentProfile.fullName }).eq('id', user.id);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Remove saved opportunity item
  const handleRemoveBookmark = async (id: string, itemId: string) => {
    try {
      if (user) {
        await api.removeSavedItem(id);
        setSavedItems(prev => prev.filter(i => i.id !== id));
      } else {
        // Guest bookmarks update
        const updated = savedItems.filter(i => i.id !== id);
        setSavedItems(updated);
        localStorage.setItem('civicai_saved_items', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  // Compute profile completion score & missing fields suggestions list
  const getProfileCompletionStats = () => {
    let score = 0;
    const missing = [];

    // Personal details (40%)
    if (studentProfile.fullName) score += 10; else missing.push('Full Name');
    if (studentProfile.dob) score += 10; else missing.push('Date of Birth');
    if (studentProfile.stateId) score += 10; else missing.push('Domicile State');
    if (studentProfile.category) score += 10; else missing.push('Reservation Category');

    // Optional district details tip
    if (!studentProfile.district) {
      missing.push('District (helps filter local state postings)');
    }
    if (!studentProfile.pwdStatus) {
      missing.push('PwD Status (optional)');
    }

    // Academics (40%)
    if (studentProfile.highestQualification) score += 10; else missing.push('Highest Qualification');
    if (studentProfile.currentQualification) score += 10; else missing.push('Current Qualification');
    if (studentProfile.course) score += 10; else missing.push('Qualifying Course');
    if (studentProfile.passingYear) score += 10; else missing.push('Passing Year');

    if (!studentProfile.stream) {
      missing.push('Branch / Stream (helps match core engineering roles)');
    }
    if (!studentProfile.percentage) {
      missing.push('Percentage / CGPA (optional)');
    }

    // Interests (10%)
    if (studentProfile.interests && studentProfile.interests.length > 0) {
      score += 10;
    } else {
      missing.push('At least one Career Interest');
    }

    // Alerts config (10%)
    score += 10; // Defaults are configured on load

    return { score, missing: missing.slice(0, 3) }; // Show max 3 suggestions
  };

  const { score: completionScore, missing: missingSuggestions } = getProfileCompletionStats();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl relative">
      
      {/* Toast Save Confirmation */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-success text-white px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 font-bold text-sm"
          >
            <CheckCircle className="h-5 w-5" /> Profile Settings Synced Safely!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
          <Settings className="h-8 w-8 text-primary" /> Manage Student Profile
        </h1>
        <p className="text-sm md:text-base text-foreground-muted max-w-2xl leading-relaxed">
          Configure academic qualifications, reservation details, domicile settings, and push notifications to optimize career suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <form onSubmit={handleSave} className="space-y-8">
              
              {/* SECTION 1: Personal Details */}
              <div>
                <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={studentProfile.fullName}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Date of Birth</label>
                    <input 
                      type="date" 
                      required
                      value={studentProfile.dob}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Gender (Optional)</label>
                    <select 
                      value={studentProfile.gender}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Domicile State</label>
                    <select 
                      required
                      value={studentProfile.stateId}
                      onChange={(e) => {
                        const match = FALLBACK_STATES.find(s => s.id === e.target.value);
                        setStudentProfile(prev => ({
                          ...prev,
                          stateId: e.target.value,
                          stateName: match ? match.name : ''
                        }));
                      }}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium"
                    >
                      <option value="">Select Domicile State</option>
                      {FALLBACK_STATES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">District (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hyderabad, Pune"
                      value={studentProfile.district}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Category</label>
                    <select 
                      value={studentProfile.category}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium"
                    >
                      <option value="General">General (UR)</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">PwD Reservation Status</label>
                    <select 
                      value={studentProfile.pwdStatus}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, pwdStatus: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Academic Details */}
              <div>
                <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Academic Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Highest Qualification</label>
                    <select 
                      value={studentProfile.highestQualification}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, highestQualification: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium"
                    >
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Diploma">Diploma / Polytechnic</option>
                      <option value="Graduate">Graduate / Degree</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Current Qualification Status</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pursuing B.Tech / Final Year"
                      required
                      value={studentProfile.currentQualification}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, currentQualification: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Course / Major</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mechanical Engineering, B.Sc"
                      required
                      value={studentProfile.course}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, course: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Branch / Stream</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Computer Science, Science, Commerce"
                      required
                      value={studentProfile.stream}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, stream: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Passing Year</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 2026"
                      required
                      value={studentProfile.passingYear}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, passingYear: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Percentage / CGPA (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 8.4 CGPA or 82%"
                      value={studentProfile.percentage}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, percentage: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2.5: AI Recommendation Preferences */}
              <div>
                <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> AI Recommendation Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Preferred Sector</label>
                    <select 
                      value={studentProfile.preferredSector || 'Any'}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, preferredSector: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium"
                    >
                      <option value="Any">Any Sector</option>
                      <option value="Central Government">Central Government</option>
                      <option value="State Government">State Government</option>
                      <option value="Banking">Banking Sector</option>
                      <option value="Public Sector">Public Sector Und. (PSUs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Annual Family Income (Optional)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 250000"
                      value={studentProfile.income || ''}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, income: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Your Skills (Optional, Comma Separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Typing, Computer Literacy, Coding, Tally"
                      value={studentProfile.skills || ''}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, skills: e.target.value }))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Career Interests */}
              <div>
                <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Career Interests
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {INTEREST_OPTIONS.map((opt) => {
                    const active = studentProfile.interests.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleInterestToggle(opt)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          active 
                            ? 'bg-primary/5 border-primary text-primary shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: Alerts Settings preferences */}
              <div>
                <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-primary" /> Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-xs text-slate-700">New Exam Notifications</h4>
                      <p className="text-[10px] text-slate-400">Receive alerts when new exams are announced.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={studentProfile.newExams}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, newExams: e.target.checked }))}
                      className="h-4.5 w-4.5 text-primary focus:ring-primary/25 cursor-pointer rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-xs text-slate-700">New Scholarship Alerts</h4>
                      <p className="text-[10px] text-slate-400">Receive notices for state and central scholarships.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={studentProfile.newScholarships}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, newScholarships: e.target.checked }))}
                      className="h-4.5 w-4.5 text-primary focus:ring-primary/25 cursor-pointer rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-xs text-slate-700">Government Welfare Schemes</h4>
                      <p className="text-[10px] text-slate-400">Alerts when citizen benefits are updated.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={studentProfile.newSchemes}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, newSchemes: e.target.checked }))}
                      className="h-4.5 w-4.5 text-primary focus:ring-primary/25 cursor-pointer rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-xs text-slate-700">Application Deadlines Warnings</h4>
                      <p className="text-[10px] text-slate-400">Urgent notifications when deadlines are closing within 7 days.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={studentProfile.deadlines}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, deadlines: e.target.checked }))}
                      className="h-4.5 w-4.5 text-primary focus:ring-primary/25 cursor-pointer rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div>
                      <h4 className="font-bold text-xs text-slate-700">Future Push Notifications</h4>
                      <p className="text-[10px] text-slate-400">Request permission to sync local service-worker notifications.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={studentProfile.pushNotifications}
                      onChange={(e) => setStudentProfile(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                      className="h-4.5 w-4.5 text-primary focus:ring-primary/25 cursor-pointer rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button type="submit" disabled={saving} variant="primary" className="font-extrabold px-6 rounded-xl cursor-pointer">
                  {saving ? 'Syncing...' : 'Save Profile Details'}
                </Button>
                
                {user && (
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Stored securely in Supabase RLS
                  </span>
                )}
              </div>

            </form>
          </div>

          {/* SECTION 5: Saved Opportunities Bookmarks list */}
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" /> Bookmarked & Saved Listings
            </h2>
            
            {savedItems.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xs">
                <Bookmark className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm mb-1">No bookmarks stored yet</h4>
                <p className="text-xs text-slate-500 mb-5">Click bookmark icons on government exams, schemes, and scholarships to save them here.</p>
                <Link href="/exams">
                  <Button variant="outline" className="text-xs py-2 px-4 rounded-xl cursor-pointer">Find Opportunities</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
                {savedItems.map((item) => (
                  <div key={item.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0 pr-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded border shrink-0 w-24 text-center ${
                        item.item_type === 'Exam' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                        item.item_type === 'Scheme' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        'bg-purple-50 border-purple-100 text-purple-700'
                      }`}>
                        {item.item_type}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-primary transition-colors truncate">
                          {item.title || `${item.item_type} Opportunity`}
                        </h4>
                        <span className="text-xs text-slate-400">{item.tag || 'Saved Notification'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={item.item_type.toLowerCase() === 'education' ? `/education/${item.item_id}` : `/${item.item_type.toLowerCase()}s/${item.item_id}`} className="p-2 border border-slate-200 hover:border-primary text-slate-400 hover:text-primary rounded-xl transition-all">
                        <ChevronRight className="h-4.5 w-4.5" />
                      </Link>
                      <button 
                        onClick={() => handleRemoveBookmark(item.id, item.item_id)}
                        className="p-2 border border-transparent hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Score Card & Completion Box */}
        <div className="space-y-6">
          
          {/* completion score widgets */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 mb-2">Profile Completion</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-black text-primary leading-none">{completionScore}%</span>
              <span className="text-xs text-slate-400 font-bold mb-1">Completed</span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 relative overflow-hidden">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500" 
                style={{ width: `${completionScore}%` }}
              />
            </div>

            {/* suggestion boxes */}
            {missingSuggestions.length > 0 ? (
              <div className="space-y-3 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" /> Suggestions
                </h4>
                <ul className="space-y-2">
                  {missingSuggestions.map((m, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></span>
                      <span>Add **{m}** details.</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-4.5 rounded-2xl text-center">
                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-800 text-xs">Excellent Work!</h4>
                <p className="text-[10px] text-emerald-600/90 leading-relaxed mt-0.5">Your profile is fully completed. Personalized AI suggestions are now fully calibrated.</p>
              </div>
            )}
          </div>

          {/* dynamic AI recommendations callout widget */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="font-extrabold text-lg mb-2 relative z-10 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" /> AI Assistant
            </h3>
            <p className="text-white/80 text-xs mb-5 relative z-10 leading-relaxed font-semibold">Your completed profile is loaded into the assistant. Simply ask what you qualify for in one click.</p>
            <Link href="/ai-assistant" className="bg-white text-primary text-xs font-extrabold py-2.5 px-5 rounded-xl inline-block hover:bg-slate-50 transition-colors relative z-10 shadow-xs cursor-pointer">
              Launch Career AI
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
