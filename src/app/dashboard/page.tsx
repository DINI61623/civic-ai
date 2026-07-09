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
  FALLBACK_STATES, FALLBACK_EXAMS, FALLBACK_SCHEMES, 
  FALLBACK_SCHOLARSHIPS, FALLBACK_EDUCATION 
} from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

interface StudentProfile {
  fullName: string;
  dob: string;
  gender: string;
  stateId: string;
  stateName: string;
  district: string;
  category: string;
  pwdStatus: string;
  highestQualification: string;
  currentQualification: string;
  course: string;
  stream: string;
  passingYear: string;
  percentage: string;
  interests: string[];
}

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Student Profile loaded from Supabase Auth Metadata / LocalStorage
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
    interests: []
  });

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

        // Load profile from Supabase user auth metadata (secure DB storage)
        if (user.user_metadata?.student_profile) {
          setStudentProfile(user.user_metadata.student_profile);
        } else {
          // Fallback to local storage
          const stored = localStorage.getItem('civicai_student_profile');
          if (stored) {
            setStudentProfile(JSON.parse(stored));
          } else if (userProfile) {
            setStudentProfile(prev => ({
              ...prev,
              fullName: userProfile.full_name || ''
            }));
          }
        }

        // Fetch database bookmarks
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

  // Calculate profile completion score percentage
  const calculateCompletion = () => {
    let score = 0;
    if (studentProfile.fullName) score += 10;
    if (studentProfile.stateId) score += 10;
    if (studentProfile.category) score += 10;
    if (studentProfile.dob) score += 10;
    if (studentProfile.gender) score += 10;
    if (studentProfile.highestQualification) score += 15;
    if (studentProfile.stream) score += 15;
    if (studentProfile.passingYear) score += 10;
    if (studentProfile.interests && studentProfile.interests.length > 0) score += 10;
    return score;
  };

  // Generate dynamic, filtered recommendations based on profile criteria
  const getPersonalizedFeeds = () => {
    const qual = studentProfile.highestQualification || 'Graduate';
    const stateId = studentProfile.stateId;
    const category = studentProfile.category || 'General';
    const interests = studentProfile.interests || [];

    // 1. Filter Exams
    let matchedExams = FALLBACK_EXAMS.filter(exam => {
      // Qual filter
      if (exam.qualification !== 'Any Qualification') {
        if (qual === '10th Pass' && exam.qualification !== '10th Pass') return false;
        if (qual === '12th Pass' && exam.qualification !== '10th Pass' && exam.qualification !== '12th Pass') return false;
        if (qual === 'Diploma' && exam.qualification !== '10th Pass' && exam.qualification !== '12th Pass' && exam.qualification !== 'Diploma') return false;
      }
      // State filter
      if (exam.state_id && stateId && exam.state_id !== 'all_india' && exam.state_id !== stateId) return false;
      
      // Category/Interests match filter
      if (interests.length > 0) {
        const matchesInterest = interests.some(interest => {
          if (interest === 'UPSC') return exam.title.toLowerCase().includes('upsc');
          if (interest === 'SSC') return exam.title.toLowerCase().includes('ssc');
          if (interest === 'Railways') return exam.title.toLowerCase().includes('railway') || exam.title.toLowerCase().includes('rrb');
          if (interest === 'Banking') return exam.title.toLowerCase().includes('bank') || exam.title.toLowerCase().includes('ibps');
          if (interest === 'Engineering Jobs') return exam.title.toLowerCase().includes('engineer') || exam.title.toLowerCase().includes('je') || exam.qualification === 'Diploma';
          return true;
        });
        if (!matchesInterest) return false;
      }
      return true;
    });

    // 2. Filter Scholarships
    let matchedScholarships = FALLBACK_SCHOLARSHIPS.filter(schol => {
      // State filter
      if (schol.state_id && stateId && schol.state_id !== 'all_india' && schol.state_id !== stateId) return false;
      
      // Qual filter
      if (qual) {
        if (qual === '10th Pass' && schol.eligibility.toLowerCase().includes('graduate')) return false;
        if (qual === '12th Pass' && schol.eligibility.toLowerCase().includes('graduate')) return false;
      }
      return true;
    });

    // 3. Filter Schemes
    let matchedSchemes = FALLBACK_SCHEMES.filter(scheme => {
      // State filter
      if (scheme.state_id && stateId && scheme.state_id !== 'all_india' && scheme.state_id !== stateId) return false;
      
      // Category filter
      if (category && category !== 'General') {
        if (scheme.category && scheme.category !== 'All' && !scheme.category.toLowerCase().includes(category.toLowerCase())) return false;
      }
      return true;
    });

    // 4. Filter Higher Ed
    let matchedEdu = FALLBACK_EDUCATION.filter(edu => {
      if (edu.state && studentProfile.stateName && edu.state !== 'All India' && edu.state.toLowerCase() !== studentProfile.stateName.toLowerCase()) return false;
      return true;
    });

    // Dates matching (Recently Added vs Closing Soon)
    const allItems = [
      ...FALLBACK_EXAMS.map(e => ({ ...e, type: 'exam', displayType: 'Exam', dateObj: e.last_date ? new Date(e.last_date) : null })),
      ...FALLBACK_SCHOLARSHIPS.map(s => ({ ...s, type: 'scholarship', displayType: 'Scholarship', dateObj: s.last_date ? new Date(s.last_date) : null })),
      ...FALLBACK_SCHEMES.map(sc => ({ ...sc, type: 'scheme', displayType: 'Scheme', dateObj: sc.application_end_date ? new Date(sc.application_end_date) : null }))
    ];

    const closingSoon = allItems
      .filter(i => i.dateObj && i.dateObj >= new Date())
      .sort((a, b) => (a.dateObj!.getTime() - b.dateObj!.getTime()))
      .slice(0, 4);

    const recentlyAdded = allItems
      .slice()
      .reverse()
      .slice(0, 4);

    return {
      exams: matchedExams.slice(0, 3),
      scholarships: matchedScholarships.slice(0, 3),
      schemes: matchedSchemes.slice(0, 3),
      education: matchedEdu.slice(0, 3),
      closingSoon,
      recentlyAdded
    };
  };

  const feeds = getPersonalizedFeeds();
  const completionPercent = calculateCompletion();

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl relative">
      
      {/* Welcome Banner Card */}
      <div className="bg-card rounded-3xl p-8 md:p-10 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Good morning, {studentProfile.fullName || profile?.full_name?.split(' ')[0] || 'Citizen'}
              </h1>
              <p className="text-foreground-muted mt-1 text-sm md:text-base font-medium">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="min-h-[40px] px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Recommendations feeds */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          
          {/* Eligibility Banner Info */}
          {completionPercent < 50 ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-amber-800 text-sm">Personalize your eligibility feeds!</h4>
                  <p className="text-xs text-amber-600/90 leading-relaxed mt-0.5">Fill out your district, qualifying course, category, and career fields to activate automatic matching.</p>
                </div>
              </div>
              <Link href="/profile" className="shrink-0">
                <Button variant="primary" className="text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer">Complete Profile</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 p-5 rounded-3xl flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 animate-pulse" />
              <div className="text-xs font-semibold text-slate-700">
                Feeds calibrated for Qualification: <strong className="text-primary">{studentProfile.highestQualification}</strong> • State: <strong className="text-primary">{studentProfile.stateName || 'All India'}</strong> • Category: <strong className="text-primary">{studentProfile.category}</strong>
              </div>
            </div>
          )}

          {/* Recommended For You Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Recommended For You
              </h2>
              <span className="text-xs text-foreground-muted font-bold">Matches: {feeds.exams.length + feeds.scholarships.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exams */}
              {feeds.exams.map(exam => (
                <div key={exam.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/70"></div>
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className="text-[9px] uppercase font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">Exam</span>
                    {exam.last_date && <span className="text-[10px] font-bold text-rose-600">{new Date(exam.last_date).toLocaleDateString()}</span>}
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors pl-2">{exam.title}</h3>
                  <p className="text-xs text-foreground-muted leading-relaxed mt-2 pl-2 line-clamp-2">{exam.description || 'Details inside notification guidelines.'}</p>
                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 pl-2">
                    <span className="text-[10px] text-slate-400 font-bold">Qual: {exam.qualification}</span>
                    <Link href={`/exams/${exam.id}`} className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                      Details <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* Scholarships */}
              {feeds.scholarships.map(schol => (
                <div key={schol.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500/70"></div>
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className="text-[9px] uppercase font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Scholarship</span>
                    {schol.last_date && <span className="text-[10px] font-bold text-rose-600">{new Date(schol.last_date).toLocaleDateString()}</span>}
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-purple-600 transition-colors pl-2">{schol.title}</h3>
                  <p className="text-xs text-foreground-muted leading-relaxed mt-2 pl-2 line-clamp-2">{schol.eligibility}</p>
                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 pl-2">
                    <span className="text-[10px] text-slate-400 font-bold">Limit: {schol.income_limit || 'Varies'}</span>
                    <Link href={`/scholarships/${schol.id}`} className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-0.5">
                      Details <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Government Schemes recommendations */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-foreground">Eligible Schemes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feeds.schemes.map(scheme => (
                <div key={scheme.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block mb-2">Scheme</span>
                    <h4 className="font-bold text-slate-800 text-sm">{scheme.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{scheme.benefits}</p>
                  </div>
                  <Link href={`/schemes/${scheme.id}`} className="text-xs font-bold text-emerald-600 hover:underline mt-4 flex items-center gap-0.5">
                    Explore Details <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Higher Education Pathways */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-foreground">Higher Education Pathways</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feeds.education.map(edu => (
                <div key={edu.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block mb-2">{edu.type}</span>
                    <h4 className="font-bold text-slate-800 text-sm">{edu.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{edu.details}</p>
                  </div>
                  <Link href={`/education/${edu.id}`} className="text-xs font-bold text-indigo-600 hover:underline mt-4 flex items-center gap-0.5">
                    Explore Details <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Added vs Closing Soon Split panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" /> Recently Added
              </h3>
              <div className="space-y-3.5">
                {feeds.recentlyAdded.map((item: any, i) => (
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
              <h3 className="font-extrabold text-danger mb-4 flex items-center gap-1.5">
                <BellRing className="h-4 w-4 text-danger animate-pulse" /> Closing Soon
              </h3>
              <div className="space-y-3.5">
                {feeds.closingSoon.map((item: any, i) => (
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

          {/* Bookmarked / Saved opportunities panel */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <Bookmark className="h-4.5 w-4.5 text-primary" /> Saved Opportunities
            </h2>
            {savedItems.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                <p className="text-xs text-slate-400">No bookmarked entries found. Save notifications to monitor them here.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {savedItems.slice(0, 3).map(item => (
                  <div key={item.id} className="p-4 flex justify-between items-center text-xs">
                    <div className="truncate">
                      <strong className="text-slate-800">{item.title}</strong>
                      <span className="text-slate-400 block mt-0.5">{item.item_type} • {item.tag || 'Saved'}</span>
                    </div>
                    <Link href={item.item_type.toLowerCase() === 'education' ? `/education/${item.item_id}` : `/${item.item_type.toLowerCase()}s/${item.item_id}`} className="text-primary font-bold hover:underline">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right side stats panels */}
        <div className="space-y-6">
          
          {/* Profile score card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h3 className="font-extrabold text-foreground mb-4">Profile Completeness</h3>
            
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-black text-primary leading-none">{completionPercent}%</span>
              <span className="text-xs text-slate-400 font-bold mb-1">Score</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 relative overflow-hidden">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            
            <p className="text-xs text-foreground-muted leading-relaxed font-semibold">
              {completionPercent < 100 
                ? 'Fill personal and education details inside Profile Settings to unlock optimal suggestions.'
                : 'Your profile score is 100%. Career matching feeds are fully calibrated.'}
            </p>

            <Link href="/profile" className="block mt-5">
              <Button variant="outline" className="w-full text-xs font-extrabold py-2.5 rounded-xl cursor-pointer">
                Manage Profile & Settings
              </Button>
            </Link>
          </div>

          {/* AI career suggestions callout banner */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="font-extrabold text-lg mb-2 relative z-10 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" /> Ask Career AI
            </h3>
            <p className="text-white/80 text-xs mb-5 relative z-10 leading-relaxed font-semibold">
              Your profile qualifications and domicile state are fully pre-filled in the AI Assistant chatbot. Just ask "What am I eligible for?" for immediate details.
            </p>
            <Link href="/ai-assistant" className="bg-white text-primary text-xs font-extrabold py-2.5 px-4 rounded-xl inline-block hover:bg-slate-50 transition-colors relative z-10 shadow-xs cursor-pointer">
              Launch Career AI
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
