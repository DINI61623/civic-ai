'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api';
import { 
  Bookmark, FileText, ArrowRight, User, Loader2, LogOut, 
  Sparkles, GraduationCap, MapPin, Mail, Calendar, Settings, 
  Bell, BellRing, ClipboardList, Shield, Award, CheckCircle, ChevronRight, Info
} from 'lucide-react';
import { 
  FALLBACK_STATES, FALLBACK_DEPARTMENTS, FALLBACK_EXAMS, 
  FALLBACK_SCHEMES, FALLBACK_SCHOLARSHIPS, FALLBACK_EDUCATION 
} from '@/lib/fallbackData';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Mock list of Career Interest Options
const INTEREST_OPTIONS = [
  'UPSC', 'SSC', 'Banking', 'Railways', 'Defence', 'PSU', 
  'Engineering Jobs', 'Scholarships', 'Higher Education'
];

interface StudentProfile {
  // Personal
  fullName: string;
  stateId: string;
  stateName: string;
  category: string;
  dob: string;
  gender: string;
  // Education
  qualification: string;
  currentCourse: string;
  stream: string;
  passingYear: string;
  // Interests
  interests: string[];
}

interface NotificationPrefs {
  browser: boolean;
  fcm: boolean;
  email: boolean;
  emailAddress: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'profile' | 'notifications'>('recommendations');
  const router = useRouter();

  // Student Profile State
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    fullName: '',
    stateId: '',
    stateName: '',
    category: 'General',
    dob: '',
    gender: '',
    qualification: 'Graduate',
    currentCourse: '',
    stream: '',
    passingYear: '',
    interests: []
  });

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    browser: false,
    fcm: false,
    email: false,
    emailAddress: ''
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }

        const userProfile = await api.getUserProfile() as any;
        setProfile(userProfile || { email: user.email, full_name: user.user_metadata?.full_name || 'Citizen' });

        // Seed default email for notification preferences
        setNotifPrefs(prev => ({
          ...prev,
          emailAddress: user.email || ''
        }));

        // Load Student Profile from localStorage
        const storedProfile = localStorage.getItem('civicai_student_profile');
        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile);
            setStudentProfile(parsed);
          } catch (e) {
            console.error('Failed parsing student profile', e);
          }
        } else if (userProfile) {
          // prefill full name from user account
          setStudentProfile(prev => ({
            ...prev,
            fullName: userProfile.full_name || ''
          }));
        }

        // Load Notification Prefs from localStorage
        const storedPrefs = localStorage.getItem('civicai_notification_prefs');
        if (storedPrefs) {
          try {
            setNotifPrefs(JSON.parse(storedPrefs));
          } catch (e) {
            console.error('Failed parsing notification prefs', e);
          }
        }

        const items = await api.getSavedItems();
        setSavedItems(items || []);

      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let score = 0;
    if (studentProfile.fullName) score += 10;
    if (studentProfile.stateId) score += 10;
    if (studentProfile.category) score += 10;
    if (studentProfile.dob) score += 10;
    if (studentProfile.gender) score += 10;
    if (studentProfile.qualification) score += 15;
    if (studentProfile.stream) score += 15;
    if (studentProfile.passingYear) score += 10;
    if (studentProfile.interests && studentProfile.interests.length > 0) score += 10;
    return score;
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('civicai_student_profile', JSON.stringify(studentProfile));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleNotifSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('civicai_notification_prefs', JSON.stringify(notifPrefs));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleInterestToggle = (interest: string) => {
    setStudentProfile(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleBrowserNotifToggle = async (checked: boolean) => {
    if (checked && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifPrefs(prev => ({
        ...prev,
        browser: permission === 'granted'
      }));
    } else {
      setNotifPrefs(prev => ({
        ...prev,
        browser: false
      }));
    }
  };

  // Generate Personalized Recommendations
  const getPersonalizedItems = () => {
    const qual = studentProfile.qualification;
    const stateId = studentProfile.stateId;
    const interests = studentProfile.interests || [];

    // 1. Recommended Exams
    const recExams = FALLBACK_EXAMS.filter(exam => {
      // Qual filter
      if (exam.qualification !== 'Any Qualification') {
        if (qual === '10th Pass' && exam.qualification !== '10th Pass') return false;
        if (qual === '12th Pass' && exam.qualification !== '10th Pass' && exam.qualification !== '12th Pass') return false;
        if (qual === 'Diploma' && exam.qualification !== '10th Pass' && exam.qualification !== '12th Pass' && exam.qualification !== 'Diploma') return false;
      }
      // State filter
      if (exam.state_id && stateId && exam.state_id !== 'all_india' && exam.state_id !== stateId) return false;
      return true;
    });

    // 2. Recommended Scholarships
    const recScholarships = FALLBACK_SCHOLARSHIPS.filter(schol => {
      if (schol.state_id && stateId && schol.state_id !== 'all_india' && schol.state_id !== stateId) return false;
      if (qual) {
        if (qual === '10th Pass' && schol.eligibility.toLowerCase().includes('graduate')) return false;
        if (qual === '12th Pass' && schol.eligibility.toLowerCase().includes('graduate')) return false;
      }
      return true;
    });

    // 3. Recommended Schemes
    const recSchemes = FALLBACK_SCHEMES.filter(scheme => {
      if (scheme.state_id && stateId && scheme.state_id !== 'all_india' && scheme.state_id !== stateId) return false;
      if (studentProfile.category && studentProfile.category !== 'General') {
        if (scheme.category && scheme.category !== 'All' && !scheme.category.toLowerCase().includes(studentProfile.category.toLowerCase())) return false;
      }
      return true;
    });

    // 4. Higher Education opportunities
    const recEdu = FALLBACK_EDUCATION.filter(edu => {
      if (edu.state && studentProfile.stateName && edu.state !== 'All India' && edu.state.toLowerCase() !== studentProfile.stateName.toLowerCase()) return false;
      return true;
    });

    // Sort dates
    const allOpps = [
      ...FALLBACK_EXAMS.map(e => ({ ...e, type: 'exam', displayType: 'Exam', dateObj: e.last_date ? new Date(e.last_date) : null })),
      ...FALLBACK_SCHOLARSHIPS.map(s => ({ ...s, type: 'scholarship', displayType: 'Scholarship', dateObj: s.last_date ? new Date(s.last_date) : null })),
      ...FALLBACK_SCHEMES.map(sc => ({ ...sc, type: 'scheme', displayType: 'Scheme', dateObj: sc.application_end_date ? new Date(sc.application_end_date) : null }))
    ];

    const closingSoon = allOpps
      .filter(o => o.dateObj && o.dateObj >= new Date())
      .sort((a, b) => (a.dateObj!.getTime() - b.dateObj!.getTime()))
      .slice(0, 3);

    const recentlyAdded = allOpps
      .slice()
      .reverse()
      .slice(0, 3);

    return {
      exams: recExams.slice(0, 3),
      scholarships: recScholarships.slice(0, 3),
      schemes: recSchemes.slice(0, 3),
      education: recEdu.slice(0, 3),
      closingSoon,
      recentlyAdded
    };
  };

  const recs = getPersonalizedItems();
  const completionPercentage = calculateCompletion();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl relative">
      
      {/* Dynamic Success Notification */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-success text-white px-6 py-3.5 rounded-2xl shadow-xl z-50 flex items-center gap-2 font-bold text-sm"
          >
            <CheckCircle className="h-5 w-5" /> Settings Saved Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Welcome banner */}
      <div className="bg-card rounded-3xl p-8 md:p-10 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Good morning, {studentProfile.fullName || profile?.full_name?.split(' ')[0] || 'Citizen'}</h1>
              <p className="text-foreground-muted mt-1 text-sm md:text-base font-medium">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="min-h-[40px] px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Dashboard Sub Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'recommendations'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4.5 w-4.5" /> Personalized Dashboard
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <GraduationCap className="h-4.5 w-4.5" /> Student Profile ({completionPercentage}%)
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'notifications'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground-muted hover:text-foreground'
          }`}
        >
          <Bell className="h-4.5 w-4.5" /> Alert Preferences
        </button>
      </div>

      {/* Active Tab Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side 2-Column Content */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          
          {/* TAB 1: Recommendations Feed */}
          {activeTab === 'recommendations' && (
            <div className="space-y-8">
              
              {/* Profile Completion Callout Banner if profile < 60% */}
              {completionPercentage < 60 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-800 text-sm">Complete your profile for precise matching!</h4>
                      <p className="text-xs text-amber-600/90 leading-relaxed mt-0.5">Fill details like qualification, categories, and career paths to activate your eligibility feeds.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Set Profile
                  </button>
                </div>
              )}

              {/* dynamic Feeds */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-extrabold text-foreground">You are eligible for...</h2>
                </div>
                <p className="text-xs text-foreground-muted mb-5 font-semibold">Recommended matches based on qualification: {studentProfile.qualification || 'Graduate'} & State: {studentProfile.stateName || 'All India'}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recs.exams.map((exam) => (
                    <div key={exam.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/70"></div>
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <span className="text-[9px] uppercase font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">Exam</span>
                        {exam.last_date && <span className="text-[10px] font-bold text-rose-600">{new Date(exam.last_date).toLocaleDateString()}</span>}
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors pl-2">{exam.title}</h3>
                      <p className="text-xs text-foreground-muted leading-relaxed mt-2 pl-2 line-clamp-2">{exam.description || 'Details inside notification guidelines.'}</p>
                      <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 pl-2">
                        <span className="text-[10px] text-slate-400 font-bold">Age: {exam.age_limit || 'Open'}</span>
                        <Link href={`/exams/${exam.id}`} className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                          View details <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {recs.scholarships.map((schol) => (
                    <div key={schol.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500/70"></div>
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <span className="text-[9px] uppercase font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Scholarship</span>
                        {schol.last_date && <span className="text-[10px] font-bold text-rose-600">{new Date(schol.last_date).toLocaleDateString()}</span>}
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-purple-600 transition-colors pl-2">{schol.title}</h3>
                      <p className="text-xs text-foreground-muted leading-relaxed mt-2 pl-2 line-clamp-2">{schol.eligibility}</p>
                      <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 pl-2">
                        <span className="text-[10px] text-slate-400 font-bold">Amt: {schol.income_limit || 'Varies'}</span>
                        <Link href={`/scholarships/${schol.id}`} className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-0.5">
                          View details <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Schemes */}
              <div>
                <h2 className="text-lg font-extrabold text-foreground mb-4">Recommended Schemes</h2>
                <div className="space-y-3">
                  {recs.schemes.map((scheme) => (
                    <Link key={scheme.id} href={`/schemes/${scheme.id}`} className="block bg-white border border-slate-200/80 p-4.5 rounded-2xl hover:border-emerald-300 transition-colors group">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 group-hover:text-emerald-600 transition-colors mb-1">{scheme.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{scheme.benefits}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Higher Education Directory */}
              <div>
                <h2 className="text-lg font-extrabold text-foreground mb-4">Higher Education Pathways</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recs.education.map((edu) => (
                    <div key={edu.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block mb-2">{edu.type}</span>
                        <h4 className="font-bold text-slate-800 text-sm">{edu.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{edu.details}</p>
                      </div>
                      <Link href={`/education/${edu.id}`} className="text-xs font-bold text-indigo-600 hover:underline mt-4 flex items-center gap-0.5">
                        Explore Admissions <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Added & Closing Soon split panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> Recently Added</h3>
                  <div className="space-y-3.5">
                    {recs.recentlyAdded.map((item: any, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <Link href={`/${item.type}s/${item.id}`} className="font-semibold text-slate-700 hover:text-primary transition-colors truncate max-w-[190px]">
                          {item.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{item.displayType}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-danger mb-4 flex items-center gap-1.5"><BellRing className="h-4 w-4 text-danger animate-pulse" /> Closing Soon</h3>
                  <div className="space-y-3.5">
                    {recs.closingSoon.map((item: any, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <Link href={`/${item.type}s/${item.id}`} className="font-semibold text-slate-700 hover:text-primary transition-colors truncate max-w-[190px]">
                          {item.title}
                        </Link>
                        <span className="text-[10px] text-rose-600 font-bold shrink-0 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                          {item.dateObj ? item.dateObj.toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Student Profile Form */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <form onSubmit={handleProfileSave} className="space-y-8">
                
                {/* Personal Category */}
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
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Domicile State</label>
                      <select 
                        required
                        value={studentProfile.stateId}
                        onChange={(e) => {
                          const stateObj = FALLBACK_STATES.find(s => s.id === e.target.value);
                          setStudentProfile(prev => ({ 
                            ...prev, 
                            stateId: e.target.value,
                            stateName: stateObj ? stateObj.name : '' 
                          }));
                        }}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer"
                      >
                        <option value="">Select Region</option>
                        {FALLBACK_STATES.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Reservation Category</label>
                      <select 
                        value={studentProfile.category}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer"
                      >
                        <option value="General">General (UR)</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Date of Birth</label>
                      <input 
                        type="date" 
                        required
                        value={studentProfile.dob}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Gender (Optional)</label>
                      <select 
                        value={studentProfile.gender}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education Category */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Educational Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Highest Qualification</label>
                      <select 
                        value={studentProfile.qualification}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, qualification: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer"
                      >
                        <option value="10th Pass">10th Pass</option>
                        <option value="12th Pass">12th Pass</option>
                        <option value="Diploma">Diploma / Polytechnic</option>
                        <option value="Graduate">Graduate / Degree</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Current Course</label>
                      <input 
                        type="text" 
                        placeholder="e.g. B.Tech, Class XII, B.Sc"
                        value={studentProfile.currentCourse}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, currentCourse: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Branch / Stream</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mechanical, Science, Commerce"
                        value={studentProfile.stream}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, stream: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Passing Year</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 2026"
                        value={studentProfile.passingYear}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, passingYear: e.target.value }))}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Career Interests Category */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Career Interests
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {INTEREST_OPTIONS.map((interest) => {
                      const isSelected = studentProfile.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-primary/5 border-primary text-primary' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button type="submit" variant="primary" className="font-extrabold px-6 rounded-xl cursor-pointer">
                    Save Profile Settings
                  </Button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 3: Alert Preferences Form */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <form onSubmit={handleNotifSave} className="space-y-8">
                
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-3 flex items-center gap-2">
                    <BellRing className="h-4.5 w-4.5 text-primary" /> Notification Settings
                  </h3>
                  <p className="text-xs text-foreground-muted mb-6 leading-relaxed">Prepare support structures for automated alerts. We mock FCM and web triggers to let you choose targets.</p>
                  
                  <div className="space-y-5">
                    
                    {/* Browser alert */}
                    <div className="flex items-start justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">Browser Push Notifications</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Opt-in to local desktop browser popup notifications for urgent updates.</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifPrefs.browser}
                        onChange={(e) => handleBrowserNotifToggle(e.target.checked)}
                        className="h-4.5 w-4.5 text-primary border-slate-300 rounded focus:ring-primary/25 cursor-pointer mt-1"
                      />
                    </div>

                    {/* Firebase cloud alert */}
                    <div className="flex items-start justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">Firebase Cloud Messaging (FCM)</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Toggle background notification sync triggers using FCM push microservices.</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifPrefs.fcm}
                        onChange={(e) => setNotifPrefs(prev => ({ ...prev, fcm: e.target.checked }))}
                        className="h-4.5 w-4.5 text-primary border-slate-300 rounded focus:ring-primary/25 cursor-pointer mt-1"
                      />
                    </div>

                    {/* Email alert */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">Email Notifications</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Get a weekly recap of active government exams and schemes direct to inbox.</p>
                        </div>
                        <input 
                          type="checkbox"
                          checked={notifPrefs.email}
                          onChange={(e) => setNotifPrefs(prev => ({ ...prev, email: e.target.checked }))}
                          className="h-4.5 w-4.5 text-primary border-slate-300 rounded focus:ring-primary/25 cursor-pointer mt-1"
                        />
                      </div>
                      {notifPrefs.email && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Target Email Address</label>
                          <input 
                            type="email"
                            required
                            value={notifPrefs.emailAddress}
                            onChange={(e) => setNotifPrefs(prev => ({ ...prev, emailAddress: e.target.value }))}
                            className="w-full max-w-md bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-primary transition-colors outline-none"
                            placeholder="your_email@example.com"
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button type="submit" variant="primary" className="font-extrabold px-6 rounded-xl cursor-pointer">
                    Save Preference Rules
                  </Button>
                </div>

              </form>
            </div>
          )}

          {/* Saved Opportunities List (Always visible underneath tab selections on Recommendations) */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-extrabold text-foreground">Saved Opportunities</h2>
              
              {savedItems.length === 0 ? (
                <div className="bg-card border-2 border-dashed border-border rounded-3xl p-10 text-center shadow-xs">
                  <div className="mx-auto w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
                    <Bookmark className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">No saved items yet</h3>
                  <p className="text-xs text-foreground-muted mb-4">Click bookmark icons on exams or schemes pages to preserve notifications.</p>
                  <Link href="/exams">
                    <Button variant="outline" className="text-xs font-extrabold py-2 px-4 rounded-xl cursor-pointer">Browse Opportunities</Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] divide-y divide-border">
                  {savedItems.map((item) => (
                    <div key={item.id} className="p-4 md:p-5 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors w-full">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-start sm:items-center w-full pr-4">
                        <div className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg shrink-0 w-auto sm:w-24 text-center border uppercase tracking-wider ${
                          item.item_type === 'Exam' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                          item.item_type === 'Scheme' ? 'bg-green-50 border-green-100 text-green-700' :
                          'bg-purple-50 border-purple-100 text-purple-700'
                        }`}>
                          {item.item_type}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-foreground group-hover:text-primary transition-colors text-sm md:text-base mb-0.5 truncate">
                            {item.title || `${item.item_type} Opportunity`}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted font-medium">
                            <span>{item.tag || 'Saved Notification'}</span>
                            {item.date && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className={item.date?.includes('Closes') ? 'text-danger font-bold' : ''}>{item.date}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/${item.item_type?.toLowerCase()}s/${item.item_id}`} className="text-primary hover:bg-primary/10 p-2 rounded-xl transition-colors shrink-0">
                        <ArrowRight className="h-4.5 w-4.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side Column Panels */}
        <div className="space-y-6">
          
          {/* Profile Completion Indicator Card */}
          <div className="bg-card rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
            <h3 className="font-extrabold text-foreground mb-4">Profile Completion</h3>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 relative overflow-hidden">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-foreground-muted font-semibold leading-relaxed">
              {completionPercentage}% Complete - {
                completionPercentage === 100 
                  ? 'Your profile is fully completed. Recommendations are optimized.' 
                  : 'Add qualification details, regions, and streams to optimize AI filters.'
              }
            </p>
            {activeTab !== 'profile' && (
              <button 
                onClick={() => setActiveTab('profile')}
                className="mt-4 w-full border border-border hover:bg-slate-50 text-foreground font-extrabold py-2.5 rounded-xl transition-colors text-xs cursor-pointer"
              >
                Complete Profile Setup
              </button>
            )}
          </div>
          
          {/* AI Advisor Promotion Widget */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="font-extrabold text-lg mb-2 relative z-10">Ask CivicAI</h3>
            <p className="text-white/80 text-xs mb-5 relative z-10 leading-relaxed font-semibold">Get structured suggestions and eligibility summaries directly from the AI chatbot advisor.</p>
            <Link href="/ai-assistant" className="bg-white text-primary text-xs font-extrabold py-2.5 px-4 rounded-xl inline-block hover:bg-slate-50 transition-colors relative z-10 shadow-xs cursor-pointer">
              Launch Career AI
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}
