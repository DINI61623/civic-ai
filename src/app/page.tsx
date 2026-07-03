'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, GraduationCap, Briefcase, Search, User, UserCheck, Heart, Sparkles, Building, Trophy, Bell, ShieldCheck, FileText, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { api, Exam, Scheme, Scholarship, Education } from '@/services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
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
  const [stats, setStats] = useState({ examsCount: 0, schemesCount: 0, scholarshipsCount: 0, usersCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomepageData() {
      try {
        const [examsData, schemesData, scholarshipsData, notificationsData, statsData] = await Promise.all([
          api.getTrendingExams(3),
          api.getLatestSchemes(3),
          api.getScholarships(undefined, undefined, 0, 3),
          api.getLatestNotifications(5),
          api.getStatistics()
        ]);
        
        setTrendingExams(examsData);
        setLatestSchemes(schemesData);
        setScholarships(scholarshipsData.data); // getScholarships returns {data, count}
        setNotifications(notificationsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadHomepageData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* 1. Hero Section & AI Search Bar & Official Badge */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-10 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" 
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-medium mb-8 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> Verified Government Data Platform
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
              India's AI-Powered <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-200">
                Citizen Assistant
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Discover verified government exams, scholarships, welfare schemes, and public services from one intelligent platform. No signup required to browse.
            </motion.p>

            {/* AI Search Box */}
            <motion.div variants={fadeUp} className="bg-white/10 backdrop-blur-xl p-2 md:p-3 rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-center gap-2 transition-transform hover:scale-[1.01]">
              <div className="flex-1 flex items-center gap-3 px-4 w-full h-14">
                <Sparkles className="h-6 w-6 text-white/70 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Ask CivicAI... e.g. What schemes are available for farmers?"
                  className="w-full bg-transparent border-none focus:ring-0 outline-none text-white placeholder:text-white/60 text-base"
                />
              </div>
              <Link 
                href="/ai-assistant"
                className="w-full sm:w-auto bg-white text-primary hover:bg-slate-50 px-8 h-14 rounded-xl font-bold flex items-center justify-center transition-all shadow-md shrink-0"
              >
                Search AI
              </Link>
            </motion.div>

            {/* Popular Searches */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              <span className="text-sm text-white/70 font-medium py-1.5 px-2">Popular Searches:</span>
              {['UPSC Notification 2026', 'PM Kisan Check', 'Minority Scholarship', 'Railway Jobs'].map((chip) => (
                <Link key={chip} href="#" className="text-sm bg-white/5 border border-white/10 text-white hover:bg-white/20 rounded-full px-4 py-1.5 transition-colors backdrop-blur-sm">
                  {chip}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Latest Notifications Marquee */}
      <div className="bg-white border-b border-border shadow-sm py-3 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <span className="font-bold text-foreground shrink-0 flex items-center gap-2"><Bell className="h-4 w-4 text-warning" /> Latest Notifications:</span>
          <div className="flex-1 whitespace-nowrap overflow-x-auto no-scrollbar text-sm flex gap-8 items-center text-foreground-muted font-medium">
            {notifications.map((notif, i) => (
              <Link key={notif.id} href={`/exams/${notif.id}`} className="hover:text-primary flex items-center gap-2 transition-colors">
                <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-danger animate-pulse' : 'bg-primary'}`}></span> 
                {notif.title}
              </Link>
            ))}
            {notifications.length === 0 && (
              <span className="text-slate-400 italic">No new notifications today.</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Quick Access Cards & Stats */}
      <section className="py-16 bg-background relative -mt-8 z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            <Link href="/exams" className="bg-white p-6 rounded-2xl border border-border shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform flex flex-col items-center text-center group">
              <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-3 group-hover:scale-110 transition-transform"><Briefcase className="h-6 w-6" /></div>
              <h3 className="font-bold text-foreground">Exams</h3>
              <p className="text-sm text-foreground-muted">{stats.examsCount}+ Updates</p>
            </Link>
            <Link href="/schemes" className="bg-white p-6 rounded-2xl border border-border shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform flex flex-col items-center text-center group">
              <div className="bg-green-50 p-4 rounded-full text-green-600 mb-3 group-hover:scale-110 transition-transform"><Heart className="h-6 w-6" /></div>
              <h3 className="font-bold text-foreground">Schemes</h3>
              <p className="text-sm text-foreground-muted">{stats.schemesCount}+ Active</p>
            </Link>
            <Link href="/scholarships" className="bg-white p-6 rounded-2xl border border-border shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform flex flex-col items-center text-center group">
              <div className="bg-purple-50 p-4 rounded-full text-purple-600 mb-3 group-hover:scale-110 transition-transform"><FileText className="h-6 w-6" /></div>
              <h3 className="font-bold text-foreground">Scholarships</h3>
              <p className="text-sm text-foreground-muted">{stats.scholarshipsCount}+ Listed</p>
            </Link>
            <Link href="/education" className="bg-white p-6 rounded-2xl border border-border shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform flex flex-col items-center text-center group">
              <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-3 group-hover:scale-110 transition-transform"><GraduationCap className="h-6 w-6" /></div>
              <h3 className="font-bold text-foreground">Higher Ed</h3>
              <p className="text-sm text-foreground-muted">Universities</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Trending Exams */}
      <section className="py-20 bg-white border-t border-border">
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
            <Link href="/exams" className="text-primary font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingExams.map((exam) => (
              <div key={exam.id} className="bg-card border border-border rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="mb-5 flex justify-between items-start">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{exam.departments?.name || 'Govt'}</span>
                  {exam.vacancies && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{exam.vacancies} Posts</span>}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{exam.title}</h3>
                <p className="text-sm text-foreground-muted mb-8 flex-1">Qualification: <span className="font-medium text-foreground">{exam.eligibility}</span></p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-sm">
                    <span className="text-foreground-muted block mb-0.5 text-xs">Closing Date</span>
                    <span className="font-semibold text-danger">{exam.last_date}</span>
                  </div>
                  <Link href={`/exams/${exam.id}`} className="text-sm font-semibold text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                    Details <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Government Categories */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Browse by Category</h2>
            <p className="text-foreground-muted">Select your profile to view personalized opportunities</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'Student', icon: <BookOpen className="h-6 w-6" />, color: 'bg-blue-50 text-blue-600' },
              { title: 'Job Aspirant', icon: <Briefcase className="h-6 w-6" />, color: 'bg-indigo-50 text-indigo-600' },
              { title: 'Farmer', icon: <Heart className="h-6 w-6" />, color: 'bg-green-50 text-green-600' },
              { title: 'Women', icon: <User className="h-6 w-6" />, color: 'bg-pink-50 text-pink-600' },
              { title: 'Senior Citizen', icon: <UserCheck className="h-6 w-6" />, color: 'bg-amber-50 text-amber-600' },
              { title: 'Entrepreneur', icon: <Building className="h-6 w-6" />, color: 'bg-purple-50 text-purple-600' },
              { title: 'PwD', icon: <User className="h-6 w-6" />, color: 'bg-cyan-50 text-cyan-600' },
              { title: 'Graduate', icon: <GraduationCap className="h-6 w-6" />, color: 'bg-rose-50 text-rose-600' }
            ].map((cat, i) => (
              <Link key={i} href={`/schemes?category=${cat.title}`} className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/30 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group">
                <div className={`${cat.color} p-4 rounded-full group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                <span className="font-semibold text-foreground">{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Latest Schemes & Scholarships Split */}
      <section className="py-24 bg-white border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Schemes */}
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Latest Schemes</h2>
                </div>
                <Link href="/schemes" className="text-primary font-semibold text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {latestSchemes.map((scheme) => (
                  <Link key={scheme.id} href={`/schemes/${scheme.id}`} className="block bg-card border border-border p-5 rounded-2xl hover:border-primary/30 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{scheme.title}</h3>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">{scheme.category}</span>
                    </div>
                    <p className="text-sm text-foreground-muted truncate">{scheme.benefits}</p>
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
                <Link href="/scholarships" className="text-primary font-semibold text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {scholarships.map((scholarship) => (
                  <Link key={scholarship.id} href={`/scholarships/${scholarship.id}`} className="block bg-card border border-border p-5 rounded-2xl hover:border-primary/30 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{scholarship.title}</h3>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">{scholarship.type}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-foreground-muted truncate flex-1 pr-4">{scholarship.eligibility}</p>
                      <span className="text-xs font-semibold text-danger bg-danger/10 px-2 py-1 rounded-md shrink-0">By: {scholarship.last_date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
