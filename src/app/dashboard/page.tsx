'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bookmark, Bell, Calendar, ChevronRight, TrendingUp, Sparkles, UserCircle2, ArrowUpRight, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Personalized Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 text-white p-1">
            <div className="h-full w-full border-2 border-white/20 rounded-full flex items-center justify-center">
              <UserCircle2 className="h-10 w-10" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-1">Good morning, Anjali</h1>
            <p className="text-foreground-muted">Here's your personal opportunity overview for today.</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground-muted mb-0.5">Profile Completion</div>
            <div className="text-xs text-primary font-bold">85%</div>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-primary border-r-primary flex items-center justify-center shadow-inner">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { title: 'Saved Items', value: '12', icon: <Bookmark className="h-6 w-6" />, color: 'text-primary bg-blue-50', trend: '+2 this week' },
          { title: 'Deadlines', value: '3', icon: <Calendar className="h-6 w-6" />, color: 'text-warning bg-amber-50', trend: 'Next in 5 days' },
          { title: 'Notifications', value: '5', icon: <Bell className="h-6 w-6" />, color: 'text-accent bg-green-50', trend: '3 unread' },
          { title: 'Matches', value: '8', icon: <Sparkles className="h-6 w-6" />, color: 'text-secondary bg-indigo-50', trend: 'High probability' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-6 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-300" />
            </div>
            <div className="text-3xl font-bold mb-1 text-foreground">{stat.value}</div>
            <div className="text-sm font-semibold text-foreground-muted mb-2">{stat.title}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-auto">
              <Activity className="h-3 w-3" /> {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Saved Opportunities */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-foreground">Saved Opportunities</h2>
              <Link href="#" className="text-sm text-primary font-medium hover:underline">View All</Link>
            </div>
            
            <div className="divide-y divide-border">
              {[
                { id: 1, type: 'Exam', title: 'UPSC Civil Services Examination (CSE) 2026', tag: 'All India', date: 'Closes Mar 5' },
                { id: 2, type: 'Scheme', title: 'PM Kisan Samman Nidhi', tag: 'Farmers', date: 'Always Open' },
                { id: 3, type: 'Scholarship', title: 'National Means Cum Merit Scholarship', tag: 'Central', date: 'Closes Oct 31' }
              ].map((item, idx) => (
                <div key={item.id} className="p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex gap-5 items-start w-full">
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 w-24 text-center mt-0.5 ${
                      item.type === 'Exam' ? 'bg-blue-50 text-blue-700' :
                      item.type === 'Scheme' ? 'bg-green-50 text-green-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {item.type}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg mb-1">{item.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-foreground-muted font-medium">
                        <span>{item.tag}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className={item.date.includes('Closes') ? 'text-danger' : ''}>{item.date}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Timeline & Progress Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-border bg-slate-50/50">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Application Timeline
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Timeline Item 1 */}
              <div className="relative pl-6 border-l-2 border-primary/20 pb-2">
                <div className="absolute w-3 h-3 bg-danger rounded-full -left-[7px] top-1 border-2 border-white shadow-sm ring-2 ring-danger/20"></div>
                <h4 className="font-bold text-sm text-foreground mb-0.5">UPPSC PCS 2026</h4>
                <p className="text-xs font-medium text-danger mb-1">Closes in 5 days (Feb 14)</p>
                <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-md mt-2 font-medium hover:bg-primary/90 transition-colors">Complete Draft</button>
              </div>
              {/* Timeline Item 2 */}
              <div className="relative pl-6 border-l-2 border-slate-100 pb-2">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1 border-2 border-white shadow-sm"></div>
                <h4 className="font-bold text-sm text-foreground mb-0.5">UPSC CSE 2026</h4>
                <p className="text-xs font-medium text-foreground-muted">Registration Open</p>
                <p className="text-xs text-slate-400 mt-1">Closes Mar 05</p>
              </div>
              {/* Timeline Item 3 */}
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-slate-200 rounded-full -left-[7px] top-1 border-2 border-white shadow-sm"></div>
                <h4 className="font-bold text-sm text-slate-400 mb-0.5">SSC CGL 2026</h4>
                <p className="text-xs font-medium text-slate-400">Opens Apr 10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
