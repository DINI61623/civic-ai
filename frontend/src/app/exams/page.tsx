'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { FALLBACK_EXAMS, FALLBACK_STATES, Exam, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';
import AdvancedFilterEngine, { HighlightText } from '@/components/ui/AdvancedFilterEngine';
import SkeletonGrid from '@/components/ui/SkeletonGrid';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleFilterChange = useCallback((filtered: Exam[], q: string) => {
    setFilteredExams(filtered);
    setSearchQuery(q);
  }, []);

  // Hydrate data from Supabase or Fallback
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [
          { data: examsData },
          { data: statesData }
        ] = await Promise.all([
          api.getCollection<any>('exams'),
          api.getStates()
        ]);
        
        const examsList = (examsData && examsData.length > 0 ? examsData : FALLBACK_EXAMS).map(exam => {
          const fallback = FALLBACK_EXAMS.find(fe => fe.title.toLowerCase().split(' ')[0] === exam.title.toLowerCase().split(' ')[0]);
          if (!fallback) return exam;
          
          const merged = { ...fallback };
          for (const key in exam) {
            if (exam[key] !== null && exam[key] !== undefined && exam[key] !== '') {
              (merged as any)[key] = exam[key];
            }
          }
          return merged;
        });
        
        setExams(examsList as any);
        setStates(statesData && statesData.length > 0 ? statesData : FALLBACK_STATES);
      } catch (err) {
        console.error('Failed to query MongoDB on exams, falling back:', err);
        setExams(FALLBACK_EXAMS);
        setStates(FALLBACK_STATES);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (lastDateStr: string | null, startDateStr?: string | null) => {
    const today = new Date('2026-07-15');
    today.setHours(0,0,0,0);

    if (startDateStr) {
      const startDate = new Date(startDateStr);
      startDate.setHours(0,0,0,0);
      if (startDate > today) {
        return { label: 'Upcoming', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      }
    }

    if (!lastDateStr) return { label: 'Open', color: 'bg-green-50 text-green-700 border-green-200' };
    const lastDate = new Date(lastDateStr);
    lastDate.setHours(0,0,0,0);

    if (lastDate < today) {
      return { label: 'Closed', color: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse-once' };
    }

    const diffDays = Math.ceil(Math.abs(lastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return { label: `Closing in ${diffDays}d`, color: 'bg-amber-50 text-amber-750 border-amber-250' };
    }

    return { label: 'Open', color: 'bg-green-50 text-green-700 border-green-200' };
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl relative">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4.5xl font-extrabold mb-2 text-slate-800 dark:text-white tracking-tight">Government Exams</h1>
        <p className="text-foreground-muted text-sm md:text-base max-w-2xl leading-relaxed">Discover, check eligibility criteria, and apply for the latest central and state notifications.</p>
      </div>

      {/* Advanced Filter Ticker Bar */}
      <div className="mb-8 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <AdvancedFilterEngine 
          items={exams} 
          states={states} 
          itemType="Exam" 
          onFilterChange={handleFilterChange} 
        />
      </div>

      {/* Content Feeds */}
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : (
        <>
          {filteredExams.length === 0 ? (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 p-12 rounded-3xl text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] max-w-2xl mx-auto mt-8">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5">
                <SlidersHorizontalIcon className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="font-bold text-foreground text-xl mb-3">No matching exams found</h3>
              <p className="text-sm text-foreground-muted mb-8 leading-relaxed">We couldn&apos;t find any exams matching your exact criteria. Try adjusting your domicile state or academic qualification to discover more notifications.</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="font-bold">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => {
                const status = getStatusBadge(exam.last_date, exam.start_date);
                const stateObj = states.find(s => s.id === exam.state_id);

                return (
                  <motion.div 
                    key={exam.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden dark:bg-slate-850 dark:border-slate-800"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/70"></div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3 select-none">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border border-blue-100 flex items-center gap-1 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
                        <MapPin className="h-2.5 w-2.5" /> {stateObj?.name || 'All India'}
                      </span>
                    </div>

                    <h2 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2 pl-1.5">
                      <HighlightText text={exam.title} search={searchQuery} />
                    </h2>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 pl-1.5 font-medium">
                      <HighlightText text={exam.description || "Active recruitment notification from Central/State boards."} search={searchQuery} />
                    </p>

                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 text-center mb-5 mt-auto select-none">
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Eligibility</div>
                        <div className="text-[10.5px] font-extrabold text-slate-700 dark:text-slate-300 truncate">{exam.qualification}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Age Limit</div>
                        <div className="text-[10.5px] font-extrabold text-slate-700 dark:text-slate-300 truncate">{exam.age_limit}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Deadline</div>
                        <div className="text-[10.5px] font-extrabold text-rose-500 truncate">
                          {exam.last_date ? new Date(exam.last_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'Always Open'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      <Link href={`/exams/${exam.id}`} className="flex-1">
                        <Button variant="outline" fullWidth className="text-xs py-2 min-h-[40px] rounded-xl flex items-center justify-center gap-1 font-extrabold cursor-pointer">
                          View Details <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {exam.apply_link && status.label !== 'Closed' && (
                        <a href={exam.apply_link?.startsWith('http') ? exam.apply_link : `https://${exam.apply_link}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="primary" fullWidth className="text-xs py-2 min-h-[40px] rounded-xl font-extrabold cursor-pointer">
                            Apply Now
                          </Button>
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}

function SlidersHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="14" y1="4" y2="4" />
      <line x1="4" x2="10" y1="12" y2="12" />
      <line x1="4" x2="20" y1="20" y2="20" />
      <line x1="18" x2="20" y1="4" y2="4" />
      <line x1="14" x2="20" y1="12" y2="12" />
      <line x1="10" x2="12" y1="20" y2="20" />
      <circle cx="16" cy="4" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="8" cy="20" r="2" />
    </svg>
  );
}
