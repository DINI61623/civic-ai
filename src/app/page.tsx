'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, GraduationCap, Briefcase, Search, User, UserCheck, Heart, Sparkles, Building, Trophy, Bell, ChevronRight } from 'lucide-react';
import { FALLBACK_EXAMS as EXAMS_MOCK, FALLBACK_SCHEMES as SCHEMES_MOCK, FALLBACK_SCHOLARSHIPS as SCHOLARSHIPS_MOCK, FALLBACK_DEPARTMENTS } from '@/lib/fallbackData';

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
  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary">
        {/* Abstract Shapes & Glassmorphism Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" as const }}
          className="absolute top-0 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" as const }}
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
              <Sparkles className="h-4 w-4 text-accent" /> Premium AI Assistant for Citizens
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
              India&apos;s AI-Powered <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-200">
                Citizen Assistant
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Discover government exams, scholarships, welfare schemes, higher education opportunities, and official public services from one intelligent platform.
            </motion.p>

            {/* AI Search Box (Glassmorphism) */}
            <motion.div variants={fadeUp} className="bg-white/10 backdrop-blur-xl p-2 md:p-3 rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-center gap-2 transition-transform hover:scale-[1.01]">
              <div className="flex-1 flex items-center gap-3 px-4 w-full h-14">
                <Search className="h-6 w-6 text-white/70 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Ask CivicAI... e.g. Which government jobs can I apply for after B.Tech?"
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

            {/* Suggestion Chips */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              <span className="text-sm text-white/70 font-medium py-1.5 px-2">Popular:</span>
              {['Government Jobs', 'Scholarships', 'Schemes', 'Higher Education'].map((chip) => (
                <Link key={chip} href="#" className="text-sm bg-white/5 border border-white/10 text-white hover:bg-white/20 rounded-full px-4 py-1.5 transition-colors backdrop-blur-sm">
                  {chip}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Latest Government Updates (Marquee) */}
      <div className="bg-white border-b border-border shadow-sm py-3 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <span className="font-bold text-foreground shrink-0 flex items-center gap-2"><Bell className="h-4 w-4 text-warning" /> Updates:</span>
          <div className="flex-1 whitespace-nowrap overflow-x-auto no-scrollbar text-sm flex gap-8 items-center text-foreground-muted font-medium">
            <Link href="#" className="hover:text-primary flex items-center gap-1 transition-colors"><span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span> UPSC CSE 2026 Notification Released</Link>
            <Link href="#" className="hover:text-primary flex items-center gap-1 transition-colors"><span className="w-2 h-2 rounded-full bg-success"></span> PM Kisan 15th Installment Dates</Link>
            <Link href="#" className="hover:text-primary flex items-center gap-1 transition-colors"><span className="w-2 h-2 rounded-full bg-accent"></span> CUET UG Registration Closes Next Week</Link>
          </div>
        </div>
      </div>

      {/* Explore By Category */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">I am a...</h2>
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

      {/* Featured Exams */}
      <section className="py-24 bg-white border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Exams</h2>
              <p className="text-foreground-muted">Premium selection of government job opportunities</p>
            </div>
            <Link href="/exams" className="text-primary font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {EXAMS_MOCK.map((exam) => {
              const dept = FALLBACK_DEPARTMENTS.find(d => d.id === exam.department_id);
              const deptName = dept ? dept.name.split(' (')[0] : 'Govt Department';
              return (
                <div key={exam.id} className="bg-card border border-border rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="mb-5">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{deptName}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{exam.title}</h3>
                  <p className="text-sm text-foreground-muted mb-8 flex-1">Qualification: <span className="font-medium text-foreground">{exam.eligibility}</span></p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-sm">
                    <span className="text-foreground-muted block mb-0.5 text-xs">Closing Date</span>
                    <span className="font-semibold text-danger">{exam.last_date}</span>
                  </div>
                  <Link href={`/exams/${exam.id}`} className="text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-5 py-2.5 rounded-lg transition-colors shadow-sm">
                    Apply Now
                  </Link>
                </div>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Featured Schemes & Scholarships */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Schemes */}
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Government Schemes</h2>
                </div>
                <Link href="/schemes" className="text-primary font-semibold text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {SCHEMES_MOCK.slice(0, 3).map((scheme) => (
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
                  <h2 className="text-2xl font-bold text-foreground mb-2">Scholarships</h2>
                </div>
                <Link href="/scholarships" className="text-primary font-semibold text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {SCHOLARSHIPS_MOCK.slice(0, 3).map((scholarship) => (
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

      {/* Higher Education */}
      <section className="py-24 bg-white border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Higher Education</h2>
            <p className="text-foreground-muted">Premier institutes, exams, and fellowships</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {EDUCATION_MOCK.map((ed) => (
              <div key={ed.id} className="bg-card border border-border p-8 rounded-2xl text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  {ed.type.includes('University') ? <Building className="h-8 w-8" /> : ed.type.includes('Exam') ? <Trophy className="h-8 w-8" /> : <GraduationCap className="h-8 w-8" />}
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">{ed.name}</h3>
                <p className="text-sm text-foreground-muted mb-6">{ed.details}</p>
                <Link href={`/education/${ed.id}`} className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
                  Explore Details <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
