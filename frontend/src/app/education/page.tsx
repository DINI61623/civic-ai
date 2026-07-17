'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, RefreshCw, GraduationCap, Building, Trophy } from 'lucide-react';
import { api } from '@/services/api';
import { FALLBACK_STATES, FALLBACK_EDUCATION, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';
import AdvancedFilterEngine, { HighlightText } from '@/components/ui/AdvancedFilterEngine';

export default function EducationPage() {
  const [education, setEducation] = useState<any[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredEdu, setFilteredEdu] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleFilterChange = useCallback((filtered: any[], q: string) => {
    setFilteredEdu(filtered);
    setSearchQuery(q);
  }, []);

  // Load datasets
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [
          { data: eduData },
          { data: statesData }
        ] = await Promise.all([
          api.getCollection<any>('education'),
          api.getStates()
        ]);
        
        const resolvedEducation = (eduData && eduData.length > 0 ? eduData : FALLBACK_EDUCATION).map((item: any) => {
          const eduName = item.title || item.name || '';
          const fallback = FALLBACK_EDUCATION.find(fe => 
            fe.name.toLowerCase().split(' ')[0] === eduName.toLowerCase().split(' ')[0]
          ) || FALLBACK_EDUCATION[0];
          
          const merged = { ...fallback };
          for (const key in item) {
            if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
              if (key === 'title') {
                merged.name = item[key];
              } else if (key === 'official_website') {
                merged.website = item[key];
              } else {
                (merged as any)[key] = item[key];
              }
            }
          }
          if (item.states?.name) {
            merged.state = item.states.name;
          }
          return merged;
        });

        setEducation(resolvedEducation);
        setStates(statesData && statesData.length > 0 ? statesData : FALLBACK_STATES);
      } catch (err) {
        console.error('Failed to query MongoDB on education, falling back:', err);
        setEducation(FALLBACK_EDUCATION);
        setStates(FALLBACK_STATES);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl relative">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4.5xl font-extrabold mb-2 text-slate-800 dark:text-white tracking-tight">Higher Education</h1>
        <p className="text-foreground-muted text-sm md:text-base max-w-2xl leading-relaxed">Explore admissions pathways at central universities, entrance examinations prep, and research fellowship grants.</p>
      </div>

      {/* Advanced Filter Ticker Bar */}
      <div className="mb-8 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <AdvancedFilterEngine 
          items={education} 
          states={states} 
          itemType="Education" 
          onFilterChange={handleFilterChange} 
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
          {filteredEdu.length === 0 ? (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 p-12 rounded-3xl text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <SlidersHorizontalIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-foreground text-lg mb-2">No higher education pathways match your filters</h3>
              <p className="text-sm text-foreground-muted mb-6">Try changing your category or state bounds to discover matching entrance exams and fellowships.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEdu.map((item) => {
                return (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden dark:bg-slate-850 dark:border-slate-800"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/70"></div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3 select-none">
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border border-indigo-100 flex items-center gap-1 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30">
                        {item.type.includes('University') ? <Building className="h-3 w-3" /> : item.type.includes('Exam') ? <Trophy className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
                        {item.type}
                      </span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border border-blue-100 flex items-center gap-1 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
                        <MapPin className="h-2.5 w-2.5" /> {item.state || 'All India'}
                      </span>
                    </div>

                    <h2 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2 pl-1.5">
                      <HighlightText text={item.name || item.title} search={searchQuery} />
                    </h2>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 pl-1.5 font-medium">
                      <HighlightText text={item.details || item.description || "Admission details for universities and fellowships."} search={searchQuery} />
                    </p>

                    <div className="flex items-center gap-2 mt-auto select-none">
                      <Link href={`/education/${item.id}`} className="flex-1">
                        <Button variant="outline" fullWidth className="text-xs py-2 min-h-[40px] rounded-xl flex items-center justify-center gap-1 font-extrabold cursor-pointer">
                          View Details <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {item.website && (
                        <a href={item.website?.startsWith('http') ? item.website : `https://${item.website}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="primary" fullWidth className="text-xs py-2 min-h-[40px] rounded-xl font-extrabold cursor-pointer">
                            Visit Website
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
