/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowRight, BookOpen, GraduationCap, Briefcase, Search, User, 
  UserCheck, Heart, Sparkles, Building, Trophy, Bell, ChevronRight, 
  ShieldCheck, FileText, ArrowUpRight, Calendar, MapPin, Check, X,
  Clock, Lock, Users, MessageSquare, Bookmark
} from 'lucide-react';
import { 
  FALLBACK_EXAMS as EXAMS_MOCK, FALLBACK_SCHEMES as SCHEMES_MOCK, 
  FALLBACK_SCHOLARSHIPS as SCHOLARSHIPS_MOCK, FALLBACK_DEPARTMENTS, 
  Exam, Scheme, Scholarship 
} from '@/lib/fallbackData';
import { api } from '@/services/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { getRecommendations } from '@/lib/recommendationEngine';

interface NotifLike {
  id: string;
  title: string;
  benefits?: string | null;
  type?: string | null;
  qualification?: string | null;
  notification_date?: string | null;
  start_date?: string | null;
  vacancies?: number | null;
}

const EDUCATION_MOCK = [
  {
    id: '1',
    name: 'National Institute of Technology (NIT)',
    type: 'Government University',
    details: 'Premier engineering institutes located across India.',
    state: 'All India',
  },
  {
    id: '2',
    name: 'CUET (UG) 2026',
    type: 'Entrance Exam',
    details: 'Common University Entrance Test for undergraduate programs.',
    state: 'All India',
  },
  {
    id: '3',
    name: 'Prime Minister Research Fellowship (PMRF)',
    type: 'Fellowship',
    details: 'Prestigious fellowship for PhD programs in premier institutes.',
    state: 'All India',
  }
];

const TICKER_ITEMS = [
  { text: "🔴 SSC CGL Registration Started", href: "/exams/ae5fd35a-dd1b-4c21-bf05-8b083b8a2d82" },
  { text: "🟢 PM Scholarship Applications Open", href: "/scholarships/142540bf-15ff-485e-ba1d-29c317bf5c83" },
  { text: "🟡 GATE Notification Released", href: "/education" },
  { text: "🔵 UPSC Calendar Updated", href: "/exams/ae5fd35b-dd1b-4c21-bf05-8b083b8a2d81" }
];

const CLOSING_SOON_DATA = [
  {
    id: "cs-1",
    name: "National Insurance Academy (NIA) PGDM Admission 2026",
    deadline: "2026-07-15",
    daysRemaining: 0,
    applyUrl: "https://www.niaindia.org",
  },
  {
    id: "cs-2",
    name: "Indian Navy Agniveer SSR Recruitment 2026",
    deadline: "2026-07-17",
    daysRemaining: 2,
    applyUrl: "https://joinindiannavy.gov.in",
  },
  {
    id: "cs-3",
    name: "Delhi Police Executive Constable Applications",
    deadline: "2026-07-18",
    daysRemaining: 3,
    applyUrl: "https://ssc.gov.in",
  },
  {
    id: "cs-4",
    name: "IIT Bombay Autumn PhD Admissions 2026",
    deadline: "2026-07-20",
    daysRemaining: 5,
    applyUrl: "https://www.iitb.ac.in",
  },
  {
    id: "cs-5",
    name: "CSIR UGC NET June 2026 Examination",
    deadline: "2026-07-22",
    daysRemaining: 7,
    applyUrl: "https://csirnet.nta.ac.in",
  }
];

const UPCOMING_EXAMS_DATA = [
  {
    name: "UPSC Civil Services Examination (CSE) 2027",
    notificationDate: "2027-02-10",
    deadlineDate: "2027-03-12",
    examDate: "2027-06-20",
    status: "Scheduled",
    website: "https://www.upsc.gov.in"
  },
  {
    name: "GATE 2027 (Graduate Aptitude Test in Engineering)",
    notificationDate: "2026-08-30",
    deadlineDate: "2026-10-05",
    examDate: "2027-02-06",
    status: "Active",
    website: "https://gate.iitk.ac.in"
  },
  {
    name: "SSC CGL 2026 (Combined Graduate Level)",
    notificationDate: "2026-06-15",
    deadlineDate: "2026-07-25",
    examDate: "2026-10-15",
    status: "Active",
    website: "https://ssc.gov.in"
  },
  {
    name: "IBPS PO 2026 (Probationary Officers)",
    notificationDate: "2026-08-15",
    deadlineDate: "2026-09-15",
    examDate: "2026-10-20",
    status: "Scheduled",
    website: "https://www.ibps.in"
  }
];

const WHY_CIVICAI_FEATURES = [
  {
    title: "Verified Information",
    description: "Every listing is cross-referenced with official bulletins to ensure data authenticity.",
    icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20"
  },
  {
    title: "AI Career Assistant",
    description: "Converse with our intelligent assistant to resolve application steps and career queries.",
    icon: <Sparkles className="h-6 w-6 text-blue-500" />,
    color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20"
  },
  {
    title: "Government Exams",
    description: "Keep track of notifications, syllabus changes, and key dates for UPSC, SSC, RRB, etc.",
    icon: <Briefcase className="h-6 w-6 text-indigo-500" />,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/20"
  },
  {
    title: "Scholarships",
    description: "Apply for post-matric and professional scholarships from central and state boards.",
    icon: <GraduationCap className="h-6 w-6 text-purple-500" />,
    color: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20"
  },
  {
    title: "Government Schemes",
    description: "Learn your eligibility for welfare, financial aid, and farming subsidy programs.",
    icon: <Heart className="h-6 w-6 text-rose-500" />,
    color: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20"
  },
  {
    title: "Higher Education",
    description: "Find admission portals, entrance exams, and fellowships in central institutes.",
    icon: <Building className="h-6 w-6 text-amber-500" />,
    color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20"
  },
  {
    title: "Personalized Recommendations",
    description: "Opportunities find you. Input your credentials once to receive tailored feeds.",
    icon: <UserCheck className="h-6 w-6 text-cyan-500" />,
    color: "bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/20"
  },
  {
    title: "Secure Authentication",
    description: "Your document profiles and credentials are secure under enterprise standards.",
    icon: <Lock className="h-6 w-6 text-slate-500" />,
    color: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-950/20"
  }
];

const STEPS = [
  {
    num: "1",
    title: "Create Account",
    description: "Sign up securely using email or OTP in less than 30 seconds.",
    icon: <User className="h-5 w-5" />
  },
  {
    num: "2",
    title: "Complete Profile",
    description: "Provide qualification details, domicile, and academic interests.",
    icon: <FileText className="h-5 w-5" />
  },
  {
    num: "3",
    title: "AI Finds Opportunities",
    description: "Our agent runs profile matching algorithms to locate active matches.",
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    num: "4",
    title: "Apply Before Deadline",
    description: "Receive reminders and apply directly to official department portals.",
    icon: <Clock className="h-5 w-5" />
  }
];


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  const [trendingExams, setTrendingExams] = useState<Exam[]>([]);
  const [latestSchemes, setLatestSchemes] = useState<Scheme[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [notifications, setNotifications] = useState<Exam[]>([]);
  const [stats, setStats] = useState({ examsCount: 24, schemesCount: 15, scholarshipsCount: 8, usersCount: 142 });
  const [loading, setLoading] = useState(true);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  
  const { user, showAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadHomepageData() {
      try {
        const [statsData, examsList, schemesList, scholarshipsList] = await Promise.all([
          api.getStatistics().catch(() => ({ examsCount: 24, schemesCount: 15, scholarshipsCount: 8, usersCount: 142 })),
          api.getExams(undefined, undefined, undefined, 0, 20).catch(() => ({ data: [], count: 0 })),
          api.getSchemes(undefined, undefined, undefined, 0, 20).catch(() => ({ data: [], count: 0 })),
          api.getScholarships(undefined, undefined, undefined, 0, 20).catch(() => ({ data: [], count: 0 }))
        ]);
        
        const fetchedExams = examsList?.data && examsList.data.length > 0 ? (examsList.data as Exam[]) : EXAMS_MOCK;
        const fetchedSchemes = schemesList?.data && schemesList.data.length > 0 ? (schemesList.data as Scheme[]) : SCHEMES_MOCK;
        const fetchedScholarships = scholarshipsList?.data && scholarshipsList.data.length > 0 ? (scholarshipsList.data as Scholarship[]) : SCHOLARSHIPS_MOCK;

        setAllExams(fetchedExams);
        setAllSchemes(fetchedSchemes);
        setAllScholarships(fetchedScholarships);

        setTrendingExams([...fetchedExams].sort((a, b) => (b.vacancies || 0) - (a.vacancies || 0)).slice(0, 3));
        setLatestSchemes(fetchedSchemes.slice(0, 3));
        setScholarships(fetchedScholarships.slice(0, 3));
        setNotifications([...fetchedExams].sort((a, b) => new Date(b.notification_date || 0).getTime() - new Date(a.notification_date || 0).getTime()).slice(0, 5));
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching homepage data, using mock fallbacks:', error);
        setTrendingExams(EXAMS_MOCK.slice(0, 3));
        setLatestSchemes(SCHEMES_MOCK.slice(0, 3));
        setScholarships(SCHOLARSHIPS_MOCK.slice(0, 3));
        setNotifications(EXAMS_MOCK.slice(0, 5));
        setAllExams(EXAMS_MOCK);
        setAllSchemes(SCHEMES_MOCK);
        setAllScholarships(SCHOLARSHIPS_MOCK);
      } finally {
        setLoading(false);
      }
    }
    
    loadHomepageData();
  }, []);

  useEffect(() => {
    let active = true;
    
    const checkProfile = async () => {
      // Sync saved items list
      if (user) {
        api.getSavedItems().then(items => {
          if (active) setSavedItems(items || []);
        }).catch(() => {});
      } else {
        const localSaved = localStorage.getItem('civicai_saved_items');
        if (localSaved && active) {
          setSavedItems(JSON.parse(localSaved));
        }
      }

      if (!user) {
        const stored = localStorage.getItem('civicai_student_profile');
        if (stored && active) {
          setProfile(JSON.parse(stored));
        }
        return;
      }
      
      if (user.user_metadata?.student_profile) {
        Promise.resolve().then(() => {
          if (active) setProfile(user.user_metadata.student_profile);
        });
      } else {
        const dbProfile = await api.getUserProfile() as any;
        if (dbProfile && active) {
          setProfile({ fullName: dbProfile.full_name, highestQualification: 'Graduate' });
        }
      }
    };
    
    checkProfile();
    
    return () => {
      active = false;
    };
  }, [user]);

  const handleBookmarkToggle = async (opportunityId: string, itemType: string) => {
    try {
      const isSaved = savedItems.some(i => i.item_id === opportunityId);
      if (user) {
        if (isSaved) {
          const savedItem = savedItems.find(i => i.item_id === opportunityId);
          if (savedItem) {
            await api.removeSavedItem(savedItem.id);
            setSavedItems(prev => prev.filter(i => i.item_id !== opportunityId));
          }
        } else {
          await api.saveItem(itemType, opportunityId);
          const updatedItems = await api.getSavedItems();
          setSavedItems(updatedItems);
        }
      } else {
        let local = JSON.parse(localStorage.getItem('civicai_saved_items') || '[]');
        if (isSaved) {
          local = local.filter((i: any) => i.item_id !== opportunityId);
        } else {
          local.push({ id: opportunityId, item_type: itemType, item_id: opportunityId });
        }
        localStorage.setItem('civicai_saved_items', JSON.stringify(local));
        setSavedItems(local);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const computedRecommendations = useMemo(() => {
    if (!profile) return [];
    const list = getRecommendations(allExams, allSchemes, allScholarships, profile);
    if (list.length > 0) {
      return list.slice(0, 3);
    }
    // Fallback if no matching records found
    const rawList = getRecommendations(allExams, allSchemes, allScholarships, {});
    return rawList.slice(0, 3);
  }, [allExams, allSchemes, allScholarships, profile]);

  const tickerHeadlines = useMemo(() => {
    const list: { text: string; link: string; tag: string }[] = [];
    if (trendingExams && trendingExams.length > 0) {
      trendingExams.forEach(e => {
        list.push({
          text: `Exam: ${e.title} is active | Eligibility: ${e.eligibility || 'Any Graduate'} | Vacancies: ${e.vacancies || 'N/A'} | Apply by ${e.last_date || 'closing'}`,
          link: `/exams/${e.id}`,
          tag: 'EXAM'
        });
      });
    }
    if (latestSchemes && latestSchemes.length > 0) {
      latestSchemes.forEach(s => {
        list.push({
          text: `Scheme: ${s.title} (${s.category || 'General'}) | Benefits: ${s.benefits || 'Welfare'} | Eligibility: ${s.eligibility || 'All Citizens'}`,
          link: `/schemes/${s.id}`,
          tag: 'SCHEME'
        });
      });
    }
    if (scholarships && scholarships.length > 0) {
      scholarships.forEach(sc => {
        list.push({
          text: `Scholarship: ${sc.title} (${sc.type || 'State/Central'}) | Apply by: ${sc.last_date || 'closing'} | Eligibility: ${sc.eligibility || 'Students'}`,
          link: `/scholarships/${sc.id}`,
          tag: 'SCHOLARSHIP'
        });
      });
    }
    if (list.length === 0) {
      list.push(
        { text: 'Loading latest announcements...', link: '#', tag: 'NEWS' },
        { text: 'Check back shortly for newly verified opportunities...', link: '#', tag: 'NEWS' }
      );
    }
    return list;
  }, [trendingExams, latestSchemes, scholarships]);

  const duplicatedTickerHeadlines = useMemo(() => {
    const duplicated = [];
    const repeatCount = Math.max(2, Math.ceil(12 / (tickerHeadlines.length || 1)));
    for (let i = 0; i < repeatCount; i++) {
      duplicated.push(...tickerHeadlines);
    }
    return duplicated;
  }, [tickerHeadlines]);

  const handleHomeSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeSearchQuery.trim()) return;
    router.push(`/ai-assistant?query=${encodeURIComponent(homeSearchQuery.trim())}`);
  };

  const getDeptTag = (deptName?: string) => {
    if (!deptName) return 'Govt';
    if (deptName.includes('(')) {
      return deptName.match(/\(([^)]+)\)/)?.[1] || deptName.split(' (')[0];
    }
    return deptName.length > 15 ? deptName.substring(0, 12) + '...' : deptName;
  };

  const getNotifDetails = (notif: NotifLike) => {
    let category = 'Govt Exam';
    let url = `/exams/${notif.id}`;
    
    if (notif.benefits) {
      category = 'Welfare Scheme';
      url = `/schemes/${notif.id}`;
    } else if (notif.type) {
      category = 'Scholarship';
      url = `/scholarships/${notif.id}`;
    } else if (notif.qualification) {
      category = 'Govt Exam';
      url = `/exams/${notif.id}`;
    }
    
    return { category, url };
  };

  const getDeadlineAlert = (days: number) => {
    if (days === 0) {
      return {
        text: "Closing Today",
        bgClass: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
        dotClass: "bg-red-500 animate-pulse",
        cardBorder: "hover:border-red-300 dark:hover:border-red-900/50"
      };
    }
    if (days <= 3) {
      return {
        text: `${days} Days Left`,
        bgClass: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30",
        dotClass: "bg-orange-500",
        cardBorder: "hover:border-orange-300 dark:hover:border-orange-900/50"
      };
    }
    return {
      text: `${days} Days Left`,
      bgClass: "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30",
      dotClass: "bg-yellow-500",
      cardBorder: "hover:border-yellow-300 dark:hover:border-yellow-900/50"
    };
  };

  const handleRecommendationCTA = () => {
    if (user) {
      router.push('/profile');
    } else {
      showAuthModal("Complete your profile to unlock personalized AI recommendations!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-sm font-semibold text-foreground-muted mt-4">Loading CivicAI...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #050816 0%, #0d1b3e 40%, #0a192f 70%, #050816 100%)' }}>
        {/* Background layers */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.45) 0%, transparent 65%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 70% at -5% 65%, rgba(16,185,129,0.3) 0%, transparent 55%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 45% 50% at 105% 80%, rgba(139,92,246,0.35) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Animated glow orbs */}
        <motion.div animate={{ scale:[1,1.35,1], x:[0,50,0] }} transition={{ duration:14, repeat:Infinity, ease:'easeInOut' }}
          className="absolute -top-40 -right-32 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)' }} />
        <motion.div animate={{ scale:[1,1.2,1], y:[0,40,0] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut', delay:3 }}
          className="absolute -bottom-48 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)' }} />

        {/* Floating particles */}
        {[{l:'7%',t:'15%',d:0},{l:'18%',t:'75%',d:1.3},{l:'52%',t:'10%',d:0.7},{l:'75%',t:'80%',d:2},{l:'90%',t:'30%',d:0.4},{l:'40%',t:'90%',d:1.7}].map((p,i)=>(
          <motion.div key={i}
            animate={{ y:[0,-22,0], opacity:[0.2,0.6,0.2] }}
            transition={{ duration:4.5+i*0.6, repeat:Infinity, delay:p.d, ease:'easeInOut' }}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none"
            style={{ left:p.l, top:p.t }}
          />
        ))}

        <div className="container mx-auto px-4 relative z-10 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center max-w-7xl mx-auto">

            {/* LEFT: Copy */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center lg:text-left">

              {/* Announcement pill */}
              <motion.div variants={fadeUp} className="flex justify-center lg:justify-start mb-7">
                <Link href="/exams" className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm text-indigo-300 text-xs font-bold hover:border-indigo-400/50 hover:bg-indigo-500/18 transition-all">
                  <motion.span animate={{ scale:[1,1.6,1], opacity:[0.5,1,0.5] }} transition={{ duration:1.4, repeat:Infinity }} className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  🔥 SSC CGL 2026 — Applications Open
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-[68px] font-black text-white leading-[1.04] tracking-tight mb-6">
                India&apos;s Smartest<br />
                <motion.span
                  animate={{ backgroundPosition: ['0% 50%','100% 50%','0% 50%'] }}
                  transition={{ duration:4, repeat:Infinity, ease:'linear' }}
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage:'linear-gradient(90deg,#6ee7b7,#818cf8,#67e8f9,#a78bfa,#6ee7b7)', backgroundSize:'300% auto' }}
                >
                  Civic Platform
                </motion.span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                Discover <span className="text-white font-semibold">verified government exams</span>, scholarships, and welfare schemes — powered by AI that understands your profile.
              </motion.p>

              {/* CTA row */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-12">
                <motion.div whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.96 }}>
                  <Link href="/ai-assistant" className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-sm overflow-hidden" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 40px rgba(99,102,241,0.5)' }}>
                    <motion.span animate={{ x:['-100%','250%'] }} transition={{ duration:2.2, repeat:Infinity, repeatDelay:3 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    <Sparkles className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Ask Career AI</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.96 }}>
                  <Link href="/exams" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-slate-200 text-sm border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/25 transition-all">
                    <Search className="h-4 w-4" /> Browse Opportunities
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats row */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-7 justify-center lg:justify-start">
                {[
                  { value:`${stats.examsCount}+`,       label:'Active Exams',    color:'text-indigo-400' },
                  { value:`${stats.schemesCount}+`,      label:'Govt Schemes',    color:'text-emerald-400' },
                  { value:`${stats.scholarshipsCount}+`, label:'Scholarships',    color:'text-violet-400' },
                  { value:`${stats.usersCount}+`,        label:'Citizens Helped', color:'text-cyan-400' },
                ].map(s=>(
                  <div key={s.label} className="text-center lg:text-left">
                    <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-slate-500 text-xs font-semibold mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT: Floating UI Cards */}
            <div className="hidden lg:block relative h-[480px]">
              {/* Main exam card */}
              <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.3 }}
                className="absolute top-6 left-0 right-0 rounded-3xl p-5 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                style={{ background:'rgba(15,20,50,0.8)', backdropFilter:'blur(20px)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/15 border border-indigo-500/20 px-2.5 py-1 rounded-full">🏛️ UPSC CSE 2026</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <motion.span animate={{ scale:[1,1.5,1] }} transition={{ duration:1.2, repeat:Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Open
                  </span>
                </div>
                <h3 className="text-white font-bold text-base mb-1">Civil Services Examination 2026</h3>
                <p className="text-slate-400 text-xs mb-4">For IAS, IPS, IFS &amp; 24 allied services across India</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Sep 12, 2026</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> All India</span>
                  </div>
                  <Link href="/exams" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">View <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </div>
              </motion.div>

              {/* Floating scholarship chip */}
              <motion.div
                initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0, y:[0,-10,0] }}
                transition={{ opacity:{ duration:0.6, delay:0.55 }, x:{ duration:0.6, delay:0.55 }, y:{ duration:4, repeat:Infinity, ease:'easeInOut' } }}
                className="absolute top-[210px] right-0 w-[230px] rounded-2xl p-4 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
                style={{ background:'rgba(20,15,55,0.85)', backdropFilter:'blur(20px)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'rgba(139,92,246,0.2)', border:'1px solid rgba(139,92,246,0.3)' }}>
                    <GraduationCap className="h-4 w-4 text-violet-400" />
                  </div>
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-wide">Scholarship</span>
                </div>
                <p className="text-white text-xs font-semibold leading-snug mb-2">PM Scholarship Scheme 2026</p>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <Check className="h-3 w-3" /> ₹36,000/year benefit
                </div>
              </motion.div>

              {/* AI match badge */}
              <motion.div
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:[0,8,0] }}
                transition={{ opacity:{ duration:0.6, delay:0.7 }, y:{ duration:3.5, repeat:Infinity, ease:'easeInOut', delay:1 } }}
                className="absolute bottom-[110px] left-0 rounded-2xl px-4 py-3 border shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                style={{ background:'rgba(6,30,20,0.9)', borderColor:'rgba(16,185,129,0.3)', backdropFilter:'blur(16px)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background:'rgba(16,185,129,0.2)' }}>
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-300 text-[10px] font-black uppercase tracking-wide">AI Match Found</p>
                    <p className="text-white text-xs font-semibold">3 schemes match your profile</p>
                  </div>
                </div>
              </motion.div>

              {/* Scheme card bottom */}
              <motion.div
                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0, y:[0,-6,0] }}
                transition={{ opacity:{ duration:0.6, delay:0.85 }, x:{ duration:0.6, delay:0.85 }, y:{ duration:5, repeat:Infinity, ease:'easeInOut', delay:2 } }}
                className="absolute bottom-4 left-4 right-4 rounded-2xl p-4 border border-white/8"
                style={{ background:'rgba(12,18,42,0.85)', backdropFilter:'blur(16px)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(244,63,94,0.15)', border:'1px solid rgba(244,63,94,0.25)' }}>
                    <Heart className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">Pradhan Mantri Awas Yojana</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Housing assistance for eligible families</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">Active</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Search bar — full width below */}
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.6 }} className="max-w-3xl mx-auto mt-16">
            <form onSubmit={handleHomeSearchSubmit} className="relative group">
              <div className="absolute -inset-px rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-[3px]"
                style={{ background:'linear-gradient(90deg,rgba(99,102,241,0.8),rgba(16,185,129,0.8),rgba(139,92,246,0.8))' }} />
              <div className="relative flex items-center rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl">
                <div className="flex items-center gap-3 flex-1 px-6 h-[60px]">
                  <motion.div animate={{ rotate:[0,360] }} transition={{ duration:6, repeat:Infinity, ease:'linear' }}>
                    <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
                  </motion.div>
                  <input type="text"
                    placeholder="Ask CivicAI — e.g. What schemes are available for farmers in Telangana?"
                    value={homeSearchQuery}
                    onChange={e => setHomeSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm"
                  />
                </div>
                <motion.button type="submit" whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  className="m-2 h-[46px] px-7 rounded-xl text-white font-bold text-sm shrink-0 cursor-pointer"
                  style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 4px 20px rgba(99,102,241,0.4)' }}
                >
                  Search
                </motion.button>
              </div>
            </form>
            {/* Quick chips */}
            <div className="hidden sm:flex flex-wrap gap-2 justify-center mt-4">
              <span className="text-slate-500 text-xs py-1">Try:</span>
              {['UPSC 2026 Dates','PM Kisan Eligibility','SSC CGL Vacancy','Minority Scholarship'].map(q=>(
                <motion.button key={q} whileHover={{ scale:1.05, y:-1 }}
                  onClick={()=>{ setHomeSearchQuery(q); router.push(`/ai-assistant?query=${encodeURIComponent(q)}`); }}
                  className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/25 bg-white/4 hover:bg-white/8 px-3 py-1 rounded-full transition-all cursor-pointer"
                >{q}</motion.button>
              ))}
            </div>
          </motion.div>

          {/* Trust bar */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2, duration:0.8 }}
            className="hidden sm:flex flex-wrap justify-center gap-x-10 gap-y-3 mt-14 pt-10 border-t border-white/6"
          >
            {[
              { icon:ShieldCheck, label:'Verified Government Data',  color:'text-emerald-400' },
              { icon:Sparkles,    label:'AI-Powered Matching',        color:'text-indigo-400'  },
              { icon:Lock,        label:'Secure & Private',           color:'text-violet-400'  },
              { icon:Bell,        label:'Deadline Alerts',            color:'text-amber-400'   },
            ].map(({icon:Icon,label,color})=>(
              <div key={label} className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Icon className={`h-3.5 w-3.5 ${color}`} />{label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live News Ticker Strip */}
      <section className="py-4 border-b border-slate-800/60" style={{ background:'#040815' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee_ticker {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .animate-marquee-ticker {
            display: inline-flex;
            white-space: nowrap;
            animation: marquee_ticker 55s linear infinite;
          }
          .animate-marquee-ticker:hover {
            animation-play-state: paused;
          }
        `}} />
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative flex items-center overflow-hidden border border-white/5 bg-[#080d21] py-3 px-4 rounded-2xl shadow-xl">
            {/* Left Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-indigo-600 text-[10px] font-black tracking-widest text-white px-3.5 py-1.5 rounded-xl uppercase shrink-0 shadow-lg shadow-indigo-500/10 z-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Live Updates
            </div>
            
            {/* Ticker Container */}
            <div className="relative flex-1 overflow-hidden ml-4">
              {/* Fade filters */}
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#080d21] to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#080d21] to-transparent z-10 pointer-events-none" />
              
              {/* Scrolling track */}
              <div className="w-full flex overflow-hidden">
                <div className="animate-marquee-ticker flex items-center gap-12 whitespace-nowrap">
                  {duplicatedTickerHeadlines.map((item, idx) => (
                    <Link key={idx} href={item.link} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 hover:text-indigo-400 font-medium transition-colors group cursor-pointer">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.tag === 'EXAM' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
                        item.tag === 'SCHEME' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
                        item.tag === 'SCHOLARSHIP' ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.tag}
                      </span>
                      <span className="group-hover:underline">{item.text}</span>
                      <span className="text-slate-700 font-normal">★</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT'S NEW */}
      <section className="py-10 sm:py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Latest Highlights</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground">What&apos;s New</h2>
              <p className="text-foreground-muted mt-1">Stay updated with the 5 latest verified announcements.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notif, idx) => {
              const { category, url } = getNotifDetails(notif);
              const pubDate = notif.notification_date || notif.start_date || '2026-07-12';
              return (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-700/60 hover:border-primary/30 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:-translate-y-[2px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider shrink-0 mt-0.5 ${
                      category === 'Govt Exam' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' :
                      category === 'Welfare Scheme' ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' :
                      'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {category}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-foreground group-hover:text-primary transition-colors text-base leading-snug">
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-foreground-muted mt-1.5 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Published: {new Date(pubDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                        </span>
                        {notif.vacancies && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                            {notif.vacancies.toLocaleString()} vacancies
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={url} 
                    className="text-xs font-bold text-primary bg-slate-50 dark:bg-slate-900 group-hover:bg-primary group-hover:text-white hover:bg-primary/95 px-4.5 py-2.5 rounded-xl transition-all border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer shadow-xs"
                  >
                    View Details <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — CLOSING SOON */}
      <section className="py-10 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-red-500 animate-pulse" />
            <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Urgent Action Required</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Closing Soon</h2>
          <p className="text-foreground-muted mb-10">Opportunities with deadlines in the next week. Apply before applications shut.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CLOSING_SOON_DATA.map((item) => {
              const alertStyle = getDeadlineAlert(item.daysRemaining);
              return (
                <div 
                  key={item.id}
                  className={`bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${alertStyle.cardBorder} group min-h-[220px]`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full border ${alertStyle.bgClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${alertStyle.dotClass}`}></span>
                        {alertStyle.text}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Deadline</span>
                    </div>
                    
                    <h3 className="font-extrabold text-foreground group-hover:text-primary transition-colors text-base mb-4 leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
                    <span className="text-xs text-foreground-muted font-bold flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {new Date(item.deadline).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                    </span>
                    <a 
                      href={item.applyUrl?.startsWith('http') ? item.applyUrl : `https://${item.applyUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Apply Now <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5 — UPCOMING EXAMS — hidden on mobile */}
      <section className="hidden sm:block py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-indigo-500" />
            <span className="text-sm font-bold text-indigo-500 uppercase tracking-wider">National Milestones</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Upcoming Exams</h2>
          <p className="text-foreground-muted mb-16">Key national exam schedules and application timelines.</p>

          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-6 pl-8 md:pl-10 space-y-12">
            {UPCOMING_EXAMS_DATA.map((exam, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <span className="absolute -left-[45px] md:-left-[53px] top-1.5 w-9 h-9 rounded-full bg-white dark:bg-slate-950 border-2 border-indigo-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-4 w-4 text-indigo-500" />
                </span>

                <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="font-extrabold text-foreground group-hover:text-primary transition-colors text-lg md:text-xl leading-snug">
                        {exam.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mt-1">Official Schedule</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        exam.status === 'Active' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                        exam.status === 'Closed' ? 'text-slate-500 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' :
                        'text-indigo-700 bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
                      }`}>
                        {exam.status}
                      </span>
                      <a 
                        href={exam.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Official Website <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-foreground-muted font-bold block mb-1">Notification Release</span>
                      <span className="font-extrabold text-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        {new Date(exam.notificationDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                      </span>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-foreground-muted font-bold block mb-1">Apply Deadline</span>
                      <span className="font-extrabold text-danger flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-rose-500" />
                        {new Date(exam.deadlineDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                      </span>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-foreground-muted font-bold block mb-1">Estimated Exam Date</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-emerald-500" />
                        {new Date(exam.examDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Categories — hidden on mobile */}
      <section className="hidden sm:block py-24 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Browse by Category</h2>
            <p className="text-foreground-muted">Select your profile to view personalized opportunities</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'Student', icon: <BookOpen className="h-6 w-6" />, color: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/20' },
              { title: 'Job Aspirant', icon: <Briefcase className="h-6 w-6" />, color: 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/20' },
              { title: 'Farmer', icon: <Heart className="h-6 w-6" />, color: 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/20' },
              { title: 'Women', icon: <User className="h-6 w-6" />, color: 'bg-pink-50 text-pink-600 border border-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/20' },
              { title: 'Senior Citizen', icon: <UserCheck className="h-6 w-6" />, color: 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/20' },
              { title: 'Entrepreneur', icon: <Building className="h-6 w-6" />, color: 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/20' },
              { title: 'PwD', icon: <User className="h-6 w-6" />, color: 'bg-cyan-50 text-cyan-600 border border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/20' },
              { title: 'Graduate', icon: <GraduationCap className="h-6 w-6" />, color: 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20' }
            ].map((cat, i) => (
              <Link key={i} href={`/schemes?category=${cat.title}`} className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/30 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all group cursor-pointer">
                <div className={`${cat.color} p-4 rounded-full group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                <span className="font-semibold text-foreground text-sm">{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — RECOMMENDED FOR YOU — hidden on mobile */}
      <section className="hidden sm:block py-24 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider">AI Powered Feed</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Recommended For You</h2>
              <p className="text-foreground-muted mt-1">
                {profile 
                  ? `Tailored opportunities matching your profile as a ${profile.highestQualification || 'Aspirant'}.`
                  : "Personalized government exams, schemes, and scholarships tailored to your academic background."
                }
              </p>
            </div>
            {profile && (
              <Link href="/profile" className="text-primary font-semibold text-sm hover:underline mt-2 md:mt-0 flex items-center gap-1 cursor-pointer">
                Update Profile Settings <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="relative min-h-[300px]">
            {/* Cards Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${!profile ? 'filter blur-[4px] pointer-events-none select-none opacity-40' : ''}`}>
              {computedRecommendations.map((item) => {
                const isBookmarked = savedItems.some(s => s.item_id === item.id);
                
                // Set match colors
                let scoreColor = 'text-slate-500 bg-slate-100 dark:bg-slate-800';
                if (item.matchScore >= 80) {
                  scoreColor = 'text-emerald-700 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
                } else if (item.matchScore >= 60) {
                  scoreColor = 'text-amber-700 bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
                } else if (item.matchScore > 0) {
                  scoreColor = 'text-rose-700 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
                }

                // Calculate countdown label
                let deadlineLabel = 'Open Indefinitely';
                let alertStyle = { badge: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700', text: 'Ongoing' };
                
                if (item.lastDate && item.lastDate !== 'Open indefinitely') {
                  const deadlineDate = new Date(item.lastDate);
                  const today = new Date("2026-07-15");
                  const diffTime = deadlineDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays === 0) {
                    alertStyle = { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse', text: 'Closing Today' };
                  } else if (diffDays === 1) {
                    alertStyle = { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20', text: 'Closing Tomorrow' };
                  } else if (diffDays > 1 && diffDays <= 3) {
                    alertStyle = { badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20', text: `${diffDays} days left` };
                  } else if (diffDays > 3 && diffDays <= 7) {
                    alertStyle = { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20', text: `${diffDays} days left` };
                  } else {
                    alertStyle = { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', text: `${diffDays} days left` };
                  }
                  deadlineLabel = deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                }

                const detailsUrl = item.type === 'Govt Exam' ? `/exams/${item.id}` : item.type === 'Scholarship' ? `/scholarships/${item.id}` : `/schemes/${item.id}`;
                const apiType = item.type === 'Govt Exam' ? 'exam' : item.type === 'Scholarship' ? 'scholarship' : 'scheme';

                return (
                  <div 
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all min-h-[380px] group relative"
                  >
                    <div>
                      {/* Badge Top Header */}
                      <div className="flex items-center justify-between mb-4.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {item.type}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md">
                            <ShieldCheck className="h-3 w-3 stroke-[2.5]" /> Verified
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${scoreColor}`}>
                            {item.matchScore}% Match
                          </span>
                          
                          <button
                            onClick={() => handleBookmarkToggle(item.id, apiType)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isBookmarked 
                                ? 'bg-primary/10 border-primary/20 text-primary' 
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                            }`}
                            title={isBookmarked ? "Remove Bookmark" : "Bookmark Opportunity"}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Info */}
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-foreground-muted leading-relaxed mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Eligibility Indicators Checklist */}
                      <div className="mb-5 space-y-2 border-t border-slate-100 dark:border-slate-800/50 pt-4">
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-bold">Compatibility Analysis</span>
                        {item.isEligible ? (
                          <div className="space-y-1.5">
                            {item.reasons.slice(0, 3).map((reason, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                <Check className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="space-y-1">
                              {item.blockers.slice(0, 2).map((blocker, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                                  <X className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                  <span className="leading-snug">{blocker}</span>
                                </div>
                              ))}
                            </div>
                            
                            {item.suggestions.length > 0 && (
                              <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 p-2.5 rounded-xl text-[10.5px] text-rose-700 dark:text-rose-300 leading-normal">
                                <span className="font-bold">💡 How to qualify: </span>
                                {item.suggestions[0]}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Apply / Details Panel */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3.5 mt-auto">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold px-0.5">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated 2h ago</span>
                        <span>Source: Official Portal</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground-muted font-bold flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{deadlineLabel}</span>
                        </span>
                        
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${alertStyle.badge}`}>
                          {alertStyle.text}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link 
                          href={detailsUrl}
                          className="text-xs font-bold text-center text-slate-700 bg-slate-50 border border-slate-200/80 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 py-2.5 rounded-xl transition-all block cursor-pointer"
                        >
                          View Details
                        </Link>
                        
                        <a 
                          href={item.officialWebsite?.startsWith('http') ? item.officialWebsite : `https://${item.officialWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-center text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Apply Now <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Non-Logged In Overlay */}
            {!profile && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] rounded-3xl p-4">
                <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800/60 p-8 rounded-3xl shadow-xl max-w-md text-center backdrop-blur-md">
                  <div className="mx-auto w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mb-4 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground mb-2">Personalize Your Opportunities</h3>
                  <p className="text-xs text-foreground-muted leading-relaxed mb-6">
                    Unlock smart matching recommendations tailored precisely to your domicile state, education qualifications, and career interests.
                  </p>
                  <button 
                    onClick={handleRecommendationCTA}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4.5 w-4.5 text-emerald-300" /> Complete Profile to Unlock Recommendations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7 — WHY CHOOSE CIVICAI */}
      <section className="py-10 sm:py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full">Core Strengths</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-4 mb-3">Why Choose CivicAI</h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">A premium platform built to deliver verified opportunities, career planning help, and welfare search for all citizens.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CIVICAI_FEATURES.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-3xl flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div>
                  <div className={`${feature.color} p-3 rounded-2xl w-fit mb-5 border group-hover:scale-105 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-extrabold text-foreground text-base mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-foreground-muted leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — HOW IT WORKS — hidden on mobile */}
      <section className="hidden sm:block py-24 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full">Process Flow</span>
            <h2 className="text-3xl font-extrabold text-foreground mt-4 mb-3">How It Works</h2>
            <p className="text-foreground-muted max-w-xl mx-auto">Get connected to the right programs in four straightforward steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {STEPS.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center group">
                {idx < 3 && (
                  <div className="hidden md:block absolute top-7 left-[60%] right-[-40%] h-[2px] border-t-2 border-dashed border-slate-200 dark:border-slate-850 z-0"></div>
                )}
                {idx < 3 && (
                  <div className="md:hidden absolute top-14 bottom-[-32px] left-[50%] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-slate-850 z-0"></div>
                )}

                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10 relative z-10 group-hover:scale-105 transition-transform select-none">
                  {step.icon}
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-950">
                    {step.num}
                  </span>
                </div>

                <h3 className="font-extrabold text-foreground mt-5 mb-2 text-base leading-snug">{step.title}</h3>
                <p className="text-xs text-foreground-muted leading-relaxed font-medium max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Exams — hidden on mobile */}
      <section className="hidden sm:block py-20 bg-white dark:bg-slate-950 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Verified Opportunities</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Trending Exams</h2>
              <p className="text-foreground-muted">Highly sought-after government job notifications.</p>
            </div>
            <Link href="/exams" className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingExams.map((exam) => {
              const deptTag = getDeptTag((exam as any).departments?.name);
              return (
                <div key={exam.id} className="bg-slate-50/50 dark:bg-slate-900/30 border border-border rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden group min-h-[300px]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  
                  <div className="mb-4 flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">{deptTag}</span>
                    {exam.vacancies && <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 px-2 py-0.5 rounded">{exam.vacancies.toLocaleString()} Posts</span>}
                  </div>

                  <h3 className="text-lg font-extrabold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">{exam.title}</h3>
                  
                  <div className="space-y-2 mb-6 flex-1 text-sm text-foreground-muted">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Education: <strong className="font-bold text-slate-700 dark:text-slate-350">{exam.eligibility?.split(' from ')[0] || exam.qualification}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Region: <strong className="font-bold text-slate-700 dark:text-slate-350">{(exam as any).states?.name || 'All India'}</strong></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Closing Date</span>
                      <span className="font-extrabold text-danger text-xs flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {exam.last_date ? new Date(exam.last_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'Always Open'}
                      </span>
                    </div>
                    <Link href={`/exams/${exam.id}`} className="text-xs font-bold text-primary bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/5 hover:text-primary px-3.5 py-2 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer">
                      Details <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Schemes & Scholarships — hidden on mobile */}
      <section className="hidden sm:block py-24 bg-white dark:bg-slate-950 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Exams</h2>
              <p className="text-foreground-muted">Premium selection of government job opportunities</p>
            </div>
            <Link href="/exams" className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {EXAMS_MOCK.slice(0, 3).map((exam) => {
              const dept = FALLBACK_DEPARTMENTS.find(d => d.id === exam.department_id);
              const deptTag = getDeptTag(dept?.name);
              return (
                <div key={exam.id} className="bg-slate-50/50 dark:bg-slate-900/30 border border-border rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden group min-h-[290px]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  
                  <div className="mb-4">
                    <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">{deptTag}</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">{exam.title}</h3>
                  
                  <div className="space-y-2 mb-6 flex-1 text-sm text-foreground-muted">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Education: <strong className="font-bold text-slate-700 dark:text-slate-350">{exam.eligibility?.split(' from ')[0] || exam.qualification}</strong></span>
                    </div>
                  </div>
                
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Closing Date</span>
                      <span className="font-extrabold text-danger text-xs flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {exam.last_date ? new Date(exam.last_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'Always Open'}
                      </span>
                    </div>
                    <Link href={`/exams/${exam.id}`} className="text-xs font-bold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer">
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Schemes & Scholarships — hidden on mobile */}
      <section className="hidden sm:block py-24 bg-slate-50 dark:bg-slate-900 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Schemes */}
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Latest Schemes</h2>
                </div>
                <Link href="/schemes" className="text-primary font-semibold text-sm hover:underline cursor-pointer">View All</Link>
              </div>
              <div className="space-y-4">
                {latestSchemes.map((scheme) => (
                  <Link key={scheme.id} href={`/schemes/${scheme.id}`} className="block bg-white dark:bg-slate-850 border border-border p-5 rounded-2xl hover:border-primary/30 shadow-[0_2px_10px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm md:text-base">{scheme.title}</h3>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-350 px-2.5 py-1 rounded font-extrabold uppercase tracking-wider">{scheme.category}</span>
                    </div>
                    <p className="text-xs text-foreground-muted truncate">{scheme.benefits}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Scholarships */}
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Featured Scholarships</h2>
                </div>
                <Link href="/scholarships" className="text-primary font-semibold text-sm hover:underline cursor-pointer">View All</Link>
              </div>
              <div className="space-y-4">
                {scholarships.map((scholarship) => (
                  <Link key={scholarship.id} href={`/scholarships/${scholarship.id}`} className="block bg-white dark:bg-slate-850 border border-border p-5 rounded-2xl hover:border-primary/30 shadow-[0_2px_10px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm md:text-base">{scholarship.title}</h3>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-350 px-2.5 py-1 rounded font-extrabold uppercase tracking-wider">{scholarship.type}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 gap-2">
                      <p className="text-xs text-foreground-muted truncate flex-1">{scholarship.eligibility}</p>
                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-2.5 py-1 rounded shrink-0 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {scholarship.last_date ? new Date(scholarship.last_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'Always Open'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Higher Education — hidden on mobile */}
      <section className="hidden sm:block py-24 bg-white dark:bg-slate-950 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Higher Education</h2>
            <p className="text-foreground-muted">Premier institutes, exams, and fellowships</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {EDUCATION_MOCK.map((ed) => (
              <div key={ed.id} className="bg-slate-50/50 dark:bg-slate-900/30 border border-border p-8 rounded-3xl text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  {ed.type.includes('University') ? <Building className="h-8 w-8" /> : ed.type.includes('Exam') ? <Trophy className="h-8 w-8" /> : <GraduationCap className="h-8 w-8" />}
                </div>
                <h3 className="font-extrabold text-lg mb-3 text-foreground">{ed.name}</h3>
                <p className="text-xs text-foreground-muted mb-6 leading-relaxed">{ed.details}</p>
                <Link href={`/education`} className="inline-flex items-center gap-1 text-primary font-bold text-xs hover:underline bg-slate-50 dark:bg-slate-900 hover:bg-primary/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer">
                  Explore Details <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
