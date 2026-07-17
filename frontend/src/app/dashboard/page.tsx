'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api';
import { 
  Bookmark, FileText, ArrowRight, User, Loader2, LogOut, 
  Sparkles, GraduationCap, MapPin, Mail, Calendar, Settings, 
  Bell, BellRing, ClipboardList, Shield, Award, CheckCircle, ChevronRight, Info,
  Briefcase, Heart, Building, Clock, AlertCircle, Trash2, Check, Activity
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
  dreamCareer?: string;
  age?: number;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Reminder Settings state
  const [emailReminders, setEmailReminders] = useState(true);
  const [pushReminders, setPushReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState(5);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [userType, setUserType] = useState<'student' | 'farmer'>('student');
  const [farmerProfile, setFarmerProfile] = useState<any>({
    fullName: '',
    stateId: '',
    stateName: '',
    farmingType: '',
    language: ''
  });

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

        setCurrentUser(user);
        
        // Load profile and bookmarks in parallel
        const [userProfile, items] = await Promise.all([
          api.getUserProfile(),
          api.getSavedItems()
        ]);
        
        setProfile(userProfile || { email: user.email, full_name: user.user_metadata?.full_name || 'Citizen' });

        // Load profile from Supabase user auth metadata (secure DB storage)
        const metaUserType = user.user_metadata?.user_type;
        if (!metaUserType) {
          router.push('/profile-completion');
          return;
        }
        
        setUserType(metaUserType);
        
        if (metaUserType === 'farmer') {
          if (!user.user_metadata?.farmer_profile) {
            router.push('/profile-completion');
            return;
          }
          setFarmerProfile(user.user_metadata.farmer_profile);
        } else {
          if (!user.user_metadata?.student_profile) {
            router.push('/profile-completion');
            return;
          }
          setStudentProfile(user.user_metadata.student_profile);
        }
        
        // Resolve saved items titles dynamically from fallback database
        const resolvedSavedItems = (items || []).map((savedItem: any) => {
          let title = 'Opportunity';
          if (savedItem.item_type === 'Exam') {
            const match = FALLBACK_EXAMS.find(e => e.id === savedItem.item_id);
            if (match) title = match.title;
          } else if (savedItem.item_type === 'Scheme') {
            const match = FALLBACK_SCHEMES.find(s => s.id === savedItem.item_id);
            if (match) title = match.title;
          } else if (savedItem.item_type === 'Scholarship') {
            const match = FALLBACK_SCHOLARSHIPS.find(s => s.id === savedItem.item_id);
            if (match) title = match.title;
          }
          return {
            ...savedItem,
            title
          };
        });

        setSavedItems(resolvedSavedItems);

        // Load Reminder Settings
        const settings = user.user_metadata?.reminder_settings || { email: true, push: true, days: 5 };
        setEmailReminders(settings.email);
        setPushReminders(settings.push);
        setReminderDays(settings.days);

        // Load Recently Viewed list from localStorage
        const storedViewed = localStorage.getItem('civicai_recently_viewed');
        if (storedViewed) {
          setRecentlyViewed(JSON.parse(storedViewed));
        }

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

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Good Morning';
    if (hours >= 12 && hours < 17) return 'Good Afternoon';
    if (hours >= 17 && hours < 22) return 'Good Evening';
    return 'Good Night';
  };

  // Calculate profile completion score percentage
  const calculateCompletion = () => {
    if (userType === 'farmer') {
      let score = 30; // base onboarding account
      if (farmerProfile?.stateId) score += 30;
      if (farmerProfile?.language) score += 20;
      if (farmerProfile?.farmingType) score += 20;
      return Math.min(score, 100);
    }
    let score = 20; // base onboarding account
    if (studentProfile.stateId) score += 20;
    if (studentProfile.highestQualification) score += 20;
    if (studentProfile.age) score += 20;
    if (studentProfile.interests && studentProfile.interests.length > 0) score += 10;
    if (studentProfile.category) score += 5;
    if (studentProfile.dreamCareer) score += 5;
    return Math.min(score, 100);
  };

  // Toggle Applied state via Supabase user metadata
  const handleToggleApplied = async (itemId: string) => {
    if (!currentUser) return;
    const currentApplied = currentUser.user_metadata?.applied_opportunities || [];
    let updatedApplied = [];
    if (currentApplied.includes(itemId)) {
      updatedApplied = currentApplied.filter((id: string) => id !== itemId);
    } else {
      updatedApplied = [...currentApplied, itemId];
    }
    
    const updatedUser = {
      ...currentUser,
      user_metadata: {
        ...currentUser.user_metadata,
        applied_opportunities: updatedApplied
      }
    };
    setCurrentUser(updatedUser);

    const supabase = createClient();
    await supabase.auth.updateUser({
      data: {
        applied_opportunities: updatedApplied
      }
    });
  };

  // Unsave Bookmark trigger
  const handleRemoveSaved = async (id: string, itemType: string, itemId: string) => {
    await api.unsaveItem(itemType, itemId);
    setSavedItems(prev => prev.filter(x => x.id !== id));
  };

  // Save reminder settings in Supabase Auth Meta
  const handleSaveReminderSettings = async (email: boolean, push: boolean, days: number) => {
    setIsSavingSettings(true);
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: {
        reminder_settings: { email, push, days }
      }
    });
    setIsSavingSettings(false);
  };

  // Generate dynamic, filtered recommendations based on profile criteria
  const getPersonalizedFeeds = useCallback(() => {
    const today = new Date('2026-07-15');
    
    // Mock regional arrays
    let schemes = FALLBACK_SCHEMES;
    let exams = FALLBACK_EXAMS;
    let scholarships = FALLBACK_SCHOLARSHIPS;
    let education = FALLBACK_EDUCATION;

    const allIndiaId = '187b6a43-0abd-45b5-a2d3-506743532d80';

    if (userType === 'farmer') {
      const stateId = farmerProfile?.stateId;
      if (stateId) {
        schemes = FALLBACK_SCHEMES.filter(s => s.state_id === stateId || s.state_id === allIndiaId);
      }
      return {
        schemes: schemes.slice(0, 3),
        exams: [],
        scholarships: [],
        education: [],
        recentlyAdded: schemes.slice(0, 2).map(s => ({ ...s, type: 'scheme', displayType: 'Scheme' })),
        closingSoon: schemes.filter(s => s.application_end_date && new Date(s.application_end_date) >= today).slice(0, 2).map(s => ({
          ...s,
          type: 'scheme',
          dateObj: new Date(s.application_end_date!)
        }))
      };
    }

    // Student Filter matches
    const stateId = studentProfile.stateId;
    const qual = studentProfile.highestQualification;
    const category = studentProfile.category;

    if (stateId) {
      exams = FALLBACK_EXAMS.filter(e => e.state_id === stateId || e.state_id === allIndiaId);
      scholarships = FALLBACK_SCHOLARSHIPS.filter(s => s.state_id === stateId || s.state_id === allIndiaId);
      education = FALLBACK_EDUCATION.filter(e => !e.state || e.state === 'All India' || e.state === studentProfile.stateName);
    }

    if (qual) {
      const ranks: Record<string, number> = { '10th Pass': 1, '12th Pass': 2, 'Diploma': 3, 'Graduate': 4, 'Postgraduate': 5 };
      const userRank = ranks[qual] || 4;
      
      exams = exams.filter(e => {
        const tr = ranks[e.qualification || ''] || 1;
        return userRank >= tr;
      });
    }

    return {
      exams: exams.slice(0, 2),
      scholarships: scholarships.slice(0, 2),
      schemes: schemes.slice(0, 2),
      education: education.slice(0, 2),
      recentlyAdded: [...exams, ...scholarships].slice(0, 2).map((x: any) => ({
        ...x,
        type: x.qualification ? 'exam' : 'scholarship',
        displayType: x.qualification ? 'Exam' : 'Scholarship'
      })),
      closingSoon: [...exams, ...scholarships].filter(x => x.last_date && new Date(x.last_date) >= today).slice(0, 3).map((x: any) => ({
        ...x,
        type: x.qualification ? 'exam' : 'scholarship',
        dateObj: new Date(x.last_date!)
      }))
    };
  }, [userType, farmerProfile, studentProfile]);

  const feeds = useMemo(() => getPersonalizedFeeds(), [getPersonalizedFeeds]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-xl flex flex-col items-center justify-center gap-4 bg-background select-none">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-foreground-muted font-bold">Calibrating your customized citizen workspace...</p>
      </div>
    );
  }

  const completionPercent = calculateCompletion();
  const hasRecommendations = userType === 'farmer' 
    ? feeds.schemes.length > 0
    : (feeds.exams.length > 0 || feeds.scholarships.length > 0);

  const appliedIds = currentUser?.user_metadata?.applied_opportunities || [];
  const appliedOpportunities = savedItems.filter(item => appliedIds.includes(item.item_id));

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl relative">
      
      {/* Personalized Header Welcome Banner */}
      <div className="bg-card rounded-3xl p-8 md:p-10 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {getGreeting()}, {userType === 'farmer' ? (farmerProfile?.fullName || profile?.full_name?.split(' ')[0] || 'Farmer Citizen') : (studentProfile.fullName || profile?.full_name?.split(' ')[0] || 'Student Citizen')} 👋
              </h1>
              <p className="text-foreground-muted mt-1 text-sm md:text-base font-medium">Welcome back to CivicAI.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/compare">
              <Button variant="outline" className="min-h-[40px] px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                Compare Opportunities
              </Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut} className="min-h-[40px] px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Feeds */}
        <div className="lg:col-span-2 space-y-8 min-w-0">

          {/* Notification Alert Center */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 dark:bg-slate-900/10 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center select-none">
              <h2 className="text-xs font-extrabold text-foreground uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-primary animate-pulse" /> Notification Center
              </h2>
              <Link href="/notifications" className="text-[10.5px] font-bold text-primary hover:underline flex items-center gap-0.5">
                View Inbox <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {/* Deadline reminders */}
              {feeds.closingSoon.length > 0 && (
                <div className="bg-rose-50 border border-rose-100/60 p-4 rounded-2xl flex items-start gap-3 dark:bg-rose-955/20 dark:border-rose-900/30">
                  <Clock className="h-4.5 w-4.5 text-rose-505 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 dark:text-rose-455">Deadline Reminder</h4>
                    <p className="text-[11px] text-rose-600 dark:text-rose-500 leading-normal mt-0.5">
                      Opportunities are closing soon! Keep track of your documents checklist for <strong>{feeds.closingSoon[0].title}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Profile alerts */}
              {completionPercent < 80 && (
                <div className="bg-amber-50 border border-amber-100/60 p-4 rounded-2xl flex items-start gap-3 dark:bg-amber-955/10 dark:border-amber-900/30">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Calibrate AI Recommendations</h4>
                    <p className="text-[11px] text-amber-600 dark:text-amber-500 leading-normal mt-0.5">
                      Your profile score is currently {completionPercent}%. Complete your categories and career interests in settings to unlock customized matches.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Opportunities Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Recommended Opportunities
              </h2>
              {hasRecommendations && (
                <span className="text-xs text-slate-500 font-bold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded dark:bg-slate-900/40 dark:border-slate-800 select-none">
                  Matches: {userType === 'farmer' ? feeds.schemes.length : (feeds.exams.length + feeds.scholarships.length)}
                </span>
              )}
            </div>

            {!hasRecommendations ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-250 rounded-3xl p-8 text-center dark:bg-slate-900/10 dark:border-slate-800">
                <Sparkles className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-60 animate-pulse" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-350">No recommendations found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Please complete more profile details such as domicile state, qualifications, and categories to calibrate the AI matching engine.</p>
                <Link href="/settings" className="inline-block mt-4">
                  <Button variant="primary" className="text-xs px-4 py-2.5 rounded-xl font-bold cursor-pointer">Complete Profile Details</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userType === 'farmer' ? (
                  /* Farmer Schemes Feed */
                  feeds.schemes.map(scheme => (
                    <div key={scheme.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[180px] dark:bg-slate-850 dark:border-slate-800">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600/70"></div>
                      <div>
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">Scheme</span>
                          {scheme.application_end_date && <span className="text-[10px] font-bold text-slate-400">Ends: {scheme.application_end_date}</span>}
                        </div>
                        <h3 className="font-extrabold text-slate-800 dark:text-white text-sm leading-snug group-hover:text-primary transition-colors pl-2">{scheme.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mt-2 pl-2 line-clamp-2">{scheme.description || 'Verified citizen welfare subsidy and assistance scheme details inside.'}</p>
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 pl-2">
                        <span className="text-[10px] text-slate-400 font-bold">Benefits: {scheme.benefits || 'Financial/Subsidies'}</span>
                        <Link href={`/schemes/${scheme.id}`} className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                          Details <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  /* Student Feed */
                  <>
                    {/* Exams */}
                    {feeds.exams.map(exam => (
                      <div key={exam.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[180px] dark:bg-slate-850 dark:border-slate-800">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/70"></div>
                        <div>
                          <div className="flex justify-between items-start mb-2 pl-2">
                            <span className="text-[9px] uppercase font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 dark:bg-primary/20 dark:text-primary-light">Exam</span>
                            {exam.last_date && <span className="text-[10px] font-bold text-rose-600">{new Date(exam.last_date).toLocaleDateString()}</span>}
                          </div>
                          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm leading-snug group-hover:text-primary transition-colors pl-2">{exam.title}</h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-2 pl-2 line-clamp-2">{exam.description || 'Details inside notification guidelines.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 pl-2">
                          <span className="text-[10px] text-slate-400 font-bold">Qual: {exam.qualification}</span>
                          <Link href={`/exams/${exam.id}`} className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                            Details <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}

                    {/* Scholarships */}
                    {feeds.scholarships.map(schol => (
                      <div key={schol.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[180px] dark:bg-slate-850 dark:border-slate-800">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500/70"></div>
                        <div>
                          <div className="flex justify-between items-start mb-2 pl-2">
                            <span className="text-[9px] uppercase font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30">Scholarship</span>
                            {schol.last_date && <span className="text-[10px] font-bold text-rose-600">{new Date(schol.last_date).toLocaleDateString()}</span>}
                          </div>
                          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm leading-snug group-hover:text-purple-650 transition-colors pl-2">{schol.title}</h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-2 pl-2 line-clamp-2">{schol.eligibility}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 pl-2">
                          <span className="text-[10px] text-slate-400 font-bold">Limit: {schol.income_limit || 'Varies'}</span>
                          <Link href={`/scholarships/${schol.id}`} className="text-xs font-bold text-purple-650 hover:underline flex items-center gap-0.5">
                            Details <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Saved Opportunities Tracking Desk */}
          <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-800">
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" /> Saved Opportunities
            </h2>
            
            {savedItems.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center dark:bg-slate-900/10 dark:border-slate-800">
                <Bookmark className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No saved opportunities yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-normal">
                  Browse government exams or scholarships and bookmark them to monitor statuses here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {savedItems.map(item => {
                  const isApplied = appliedIds.includes(item.item_id);
                  const detailUrl = `/${item.item_type.toLowerCase()}s/${item.item_id}`;

                  return (
                    <div key={item.id} className="bg-white border border-slate-200 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:bg-slate-850 dark:border-slate-800">
                      <div>
                        <span className="text-[8.5px] font-black uppercase bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-150 dark:border-slate-800 text-slate-450 select-none">
                          {item.item_type}
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm mt-1">{item.title}</h4>
                      </div>
                      
                      {/* Action triggers */}
                      <div className="flex items-center gap-2 select-none self-end sm:self-auto">
                        <button
                          onClick={() => handleToggleApplied(item.item_id)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            isApplied 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {isApplied ? '✓ Applied' : 'Mark Applied'}
                        </button>

                        <Link href={detailUrl}>
                          <Button variant="outline" className="text-[10px] font-bold py-1.5 px-3 rounded-xl cursor-pointer">
                            View
                          </Button>
                        </Link>

                        <button 
                          onClick={() => handleRemoveSaved(item.id, item.item_type, item.item_id)}
                          className="p-1.5 border border-rose-100 dark:border-rose-900/30 rounded-xl hover:bg-rose-50 text-rose-455 hover:text-rose-600 cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Applied Opportunities section */}
          {appliedOpportunities.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-800">
              <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600" /> Applied Opportunities ({appliedOpportunities.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {appliedOpportunities.map(item => (
                  <div key={item.id} className="bg-white border border-slate-200 p-4.5 rounded-2xl flex flex-col justify-between dark:bg-slate-850 dark:border-slate-800">
                    <div>
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-150 dark:border-slate-800 inline-block mb-1.5 select-none">
                        {item.item_type}
                      </span>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-xs leading-snug">{item.title}</h4>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 select-none">
                      <span className="text-[9.5px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                        <Check className="h-3.5 w-3.5 shrink-0" /> Application Lodged
                      </span>
                      <Link href={`/${item.item_type.toLowerCase()}s/${item.item_id}`} className="text-xs font-bold text-primary hover:underline">
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed Opportunities */}
          {recentlyViewed.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-800">
              <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-indigo-500 animate-pulse" /> Recently Viewed
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                {recentlyViewed.map(item => {
                  const detailUrl = `/${item.type.toLowerCase()}s/${item.id}`;
                  return (
                    <Link 
                      key={item.id} 
                      href={detailUrl}
                      className="bg-white border border-slate-200 p-4.5 rounded-2xl hover:shadow-xs hover:border-slate-300 transition-all dark:bg-slate-850 dark:border-slate-800 flex justify-between items-center"
                    >
                      <div className="truncate">
                        <span className="text-[8px] uppercase font-extrabold text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-150 px-1.5 py-0.5 rounded dark:border-slate-800">{item.type}</span>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-xs mt-1 truncate max-w-[190px]">{item.title}</h4>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right side stats & settings panels */}
        <div className="space-y-6">
          
          {/* Profile score card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs dark:bg-slate-850 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider text-slate-400">Profile Completion</h3>
              <span className="text-sm font-black text-primary dark:text-accent leading-none">{completionPercent}%</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-4 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
              Complete your profile to unlock better AI recommendations.
            </p>

            <Link href="/settings" className="block mt-5">
              <Button variant="outline" className="w-full text-xs font-extrabold py-2.5 rounded-xl cursor-pointer">
                Manage Profile & Settings
              </Button>
            </Link>
          </div>

          {/* Deadline Alerts and Reminders settings Desk */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs dark:bg-slate-850 dark:border-slate-800 space-y-4 select-none">
            <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-primary" /> Reminder Settings
            </h3>

            <div className="space-y-3 text-xs">
              
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="font-bold text-slate-650 dark:text-slate-350">Email deadline alerts</span>
                <input 
                  type="checkbox" 
                  checked={emailReminders} 
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setEmailReminders(checked);
                    handleSaveReminderSettings(checked, pushReminders, reminderDays);
                  }}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="font-bold text-slate-650 dark:text-slate-350">Browser push notification updates</span>
                <input 
                  type="checkbox" 
                  checked={pushReminders} 
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setPushReminders(checked);
                    handleSaveReminderSettings(emailReminders, checked, reminderDays);
                  }}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
              </label>

              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Remind me before closing</span>
                <select
                  value={reminderDays}
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    setReminderDays(days);
                    handleSaveReminderSettings(emailReminders, pushReminders, days);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-650 cursor-pointer outline-none focus:border-primary"
                >
                  <option value="3">3 Days Prior</option>
                  <option value="5">5 Days Prior</option>
                  <option value="7">7 Days Prior</option>
                  <option value="14">14 Days Prior</option>
                </select>
              </div>

            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs dark:bg-slate-850 dark:border-slate-800">
            <h3 className="font-extrabold text-foreground mb-4 text-xs uppercase tracking-wider text-slate-400">Quick Actions</h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              <Link 
                href="/exams" 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50/50 transition-all group dark:border-slate-800 dark:hover:bg-slate-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/20 dark:text-blue-400">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Government Exams</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Explore recruitment notifications</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
              </Link>

              <Link 
                href="/scholarships" 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-slate-50/50 transition-all group dark:border-slate-800 dark:hover:bg-slate-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl dark:bg-purple-950/20 dark:text-purple-400">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Scholarships</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Explore student financial aids</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
              </Link>

              <Link 
                href="/schemes" 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-slate-50/50 transition-all group dark:border-slate-800 dark:hover:bg-slate-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-950/20 dark:text-emerald-400">
                    <Heart className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Government Schemes</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Welfare yojanas & subsidies</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </Link>

              <Link 
                href="/education" 
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 transition-all group dark:border-slate-800 dark:hover:bg-slate-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-950/20 dark:text-indigo-400">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Higher Education</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Entrance pathways & admissions</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
