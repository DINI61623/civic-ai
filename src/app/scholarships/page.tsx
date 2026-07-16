'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FALLBACK_SCHOLARSHIPS, FALLBACK_STATES, Scholarship, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';
import AdvancedFilterEngine, { HighlightText } from '@/components/ui/AdvancedFilterEngine';

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate lists
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [
          { data: scholarshipsData },
          { data: statesData }
        ] = await Promise.all([
          supabase.from('scholarships').select('*'),
          supabase.from('states').select('*')
        ]);

        const scholarshipsList = (scholarshipsData && scholarshipsData.length > 0 ? scholarshipsData : FALLBACK_SCHOLARSHIPS).map(s => {
          const fallback = FALLBACK_SCHOLARSHIPS.find(fs => fs.title.toLowerCase().split(' ')[0] === s.title.toLowerCase().split(' ')[0]);
          return { ...fallback, ...s };
        });

        setScholarships(scholarshipsList as any);
        setStates(statesData && statesData.length > 0 ? statesData : FALLBACK_STATES);
      } catch (err) {
        console.error('Failed to query Supabase on scholarships, falling back:', err);
        setScholarships(FALLBACK_SCHOLARSHIPS);
        setStates(FALLBACK_STATES);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (lastDateStr: string | null) => {
    if (!lastDateStr) return { label: 'Open', color: 'bg-green-50 text-green-700 border-green-200' };
    const lastDate = new Date(lastDateStr);
    const today = new Date('2026-07-15'); // simulated current date
    today.setHours(0,0,0,0);
    lastDate.setHours(0,0,0,0);

    if (lastDate < today) {
      return { label: 'Closed', color: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse-once' };
    }

    const diffDays = Math.ceil(Math.abs(lastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return { label: `Closing in ${diffDays}d`, color: 'bg-amber-50 text-amber-700 border-amber-250' };
    }

    return { label: 'Open', color: 'bg-green-50 text-green-700 border-green-200' };
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl relative">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4.5xl font-extrabold mb-2 text-slate-800 dark:text-white tracking-tight">Scholarships Catalog</h1>
        <p className="text-foreground-muted text-sm md:text-base max-w-2xl leading-relaxed">Browse merit-based and need-based scholarships, financial aid schemes, and stipend allowances programs.</p>
      </div>

      {/* Advanced Filter Ticker Bar */}
      <div className="mb-8 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <AdvancedFilterEngine 
          items={scholarships} 
          states={states} 
          itemType="Scholarship" 
          onFilterChange={(filtered, q) => {
            setFilteredScholarships(filtered);
            setSearchQuery(q);
          }} 
        />
      </div>

      {/* Content Feeds */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-background select-none">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-foreground-muted font-bold">Synchronizing with live notification database...</p>
        </div>
      ) : (
        <>
          {filteredScholarships.length === 0 ? (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 p-12 rounded-3xl text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <SlidersHorizontalIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-foreground text-lg mb-2">No scholarships match your filters</h3>
              <p className="text-sm text-foreground-muted mb-6">Try changing your state or qualification to discover matching financial aid programs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScholarships.map((schol) => {
                const status = getStatusBadge(schol.last_date);
                const stateObj = states.find(s => s.id === schol.state_id);

                return (
                  <motion.div 
                    key={schol.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden dark:bg-slate-850 dark:border-slate-800"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500/70"></div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3 select-none">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border border-blue-100 flex items-center gap-1 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
                        <MapPin className="h-2.5 w-2.5" /> {stateObj?.name || 'All India'}
                      </span>
                    </div>

                    <h2 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-purple-650 transition-colors leading-snug mb-2 line-clamp-2 pl-1.5">
                      <HighlightText text={schol.title} search={searchQuery} />
                    </h2>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 pl-1.5 font-medium">
                      <HighlightText text={schol.eligibility || "Scholarship benefits and guidelines criteria specs."} search={searchQuery} />
                    </p>

                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 text-center mb-5 mt-auto select-none">
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Type</div>
                        <div className="text-[10.5px] font-extrabold text-slate-700 dark:text-slate-300 truncate">{schol.type}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Income Limit</div>
                        <div className="text-[10.5px] font-extrabold text-slate-700 dark:text-slate-300 truncate">{schol.income_limit}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Deadline</div>
                        <div className="text-[10.5px] font-extrabold text-rose-505 truncate">
                          {schol.last_date ? new Date(schol.last_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'Always Open'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      <Link href={`/scholarships/${schol.id}`} className="flex-1">
                        <Button variant="outline" fullWidth className="text-xs py-2 min-h-[40px] rounded-xl flex items-center justify-center gap-1 font-extrabold cursor-pointer">
                          View Details <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {schol.apply_link && status.label !== 'Closed' && (
                        <a href={schol.apply_link?.startsWith('http') ? schol.apply_link : `https://${schol.apply_link}`} target="_blank" rel="noopener noreferrer" className="flex-1">
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
