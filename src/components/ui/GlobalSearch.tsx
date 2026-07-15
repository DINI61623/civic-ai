'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowRight, X, FileText, Gift, GraduationCap, Briefcase, Clock, Sparkles } from 'lucide-react';
import { api } from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const POPULAR_SEARCHES = [
  { term: 'UPSC', label: 'UPSC Civil Services' },
  { term: 'Kisan', label: 'PM Kisan Subsidies' },
  { term: 'Scholarship', label: 'Merit Scholarships' },
  { term: 'Railway', label: 'Railway Recruitment' },
  { term: 'GATE', label: 'GATE 2026' }
];

export default function GlobalSearch({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ exams: any[], schemes: any[], scholarships: any[], education: any[] }>({ exams: [], schemes: [], scholarships: [], education: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches on open
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      const stored = localStorage.getItem('civicai_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } else {
      setQuery('');
      setResults({ exams: [], schemes: [], scholarships: [], education: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced API search triggers
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ exams: [], schemes: [], scholarships: [], education: [] });
      return;
    }

    const fetchSearch = async () => {
      setLoading(true);
      try {
        const data = await api.globalSearch(query.trim());
        setResults(data);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSearch();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const addRecentSearch = (term: string) => {
    if (!term || term.trim().length < 2) return;
    const trimmed = term.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('civicai_recent_searches', JSON.stringify(next));
      return next;
    });
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('civicai_recent_searches');
  };

  const handleResultClick = (term: string) => {
    addRecentSearch(term);
    onClose();
  };

  const hasResults = Object.values(results).some((arr: any) => arr.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-20 px-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.15 }}
              className="bg-card w-full max-w-3xl rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.18)] overflow-hidden pointer-events-auto border border-border flex flex-col max-h-[75vh]"
            >
              {/* Search Bar Input */}
              <div className="relative border-b border-border p-4 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                <Search className="h-5.5 w-5.5 text-slate-400 shrink-0 ml-2" />
                <input 
                  ref={inputRef}
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search government exams, welfare schemes, scholarships..."
                  className="w-full bg-transparent border-none focus:ring-0 outline-none text-base text-foreground placeholder:text-slate-400 font-medium"
                />
                {loading && <Loader2 className="h-4.5 w-4.5 text-primary animate-spin shrink-0" />}
                <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Suggestions / Results container */}
              <div className="overflow-y-auto p-5 flex-1 custom-scrollbar bg-white dark:bg-slate-950">
                
                {query.trim().length < 2 ? (
                  /* SUGGESTIONS AND RECENT SEARCHES */
                  <div className="space-y-6">
                    
                    {/* Recent Searches */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                          <Clock className="h-3.5 w-3.5" /> Recent Searches
                        </span>
                        {recentSearches.length > 0 && (
                          <button 
                            onClick={clearRecent}
                            className="text-[10.5px] font-extrabold text-primary hover:underline focus:outline-none cursor-pointer"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {recentSearches.length === 0 ? (
                        <p className="text-xs text-foreground-muted italic pl-1 font-medium">No recent searches found.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((term, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setQuery(term);
                                addRecentSearch(term);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-650 flex items-center gap-1.5 transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              <Clock className="h-3 w-3 text-slate-400" />
                              {term}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Popular Searches */}
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3 font-bold">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Popular Searches
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setQuery(item.term);
                              addRecentSearch(item.term);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-650 flex items-center gap-1.5 transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : !hasResults && !loading ? (
                  /* NO RESULTS */
                  <div className="text-center py-12">
                    <Search className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-foreground font-extrabold mb-1 text-sm">No matches found for &quot;{query}&quot;</p>
                    <p className="text-xs text-foreground-muted">Re-check spelling or try broader terms (e.g. UPSC, Kisan, Agriculture).</p>
                  </div>
                ) : (
                  /* MATCHED RESULTS */
                  <div className="space-y-6 pb-2">
                    
                    {results.exams.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-1.5">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Government Exams</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {results.exams.map((exam: any) => (
                            <Link 
                              onClick={() => handleResultClick(exam.title)} 
                              href={`/exams/${exam.id}`} 
                              key={exam.id} 
                              className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors group cursor-pointer"
                            >
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-250 text-sm leading-snug group-hover:text-primary transition-colors">{exam.title}</h4>
                                <p className="text-[11px] text-foreground-muted mt-1 font-semibold">Region: {exam.states?.name || 'All India'}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.schemes.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-1.5">
                          <Gift className="h-4 w-4 text-emerald-500" />
                          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Welfare Schemes</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {results.schemes.map((scheme: any) => (
                            <Link 
                              onClick={() => handleResultClick(scheme.title)} 
                              href={`/schemes/${scheme.id}`} 
                              key={scheme.id} 
                              className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors group cursor-pointer"
                            >
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-250 text-sm leading-snug group-hover:text-emerald-500 transition-colors">{scheme.title}</h4>
                                <p className="text-[11px] text-foreground-muted mt-1 font-semibold">Region: {scheme.states?.name || 'All India'}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.scholarships.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-1.5">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Scholarships</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {results.scholarships.map((sch: any) => (
                            <Link 
                              onClick={() => handleResultClick(sch.title)} 
                              href={`/scholarships/${sch.id}`} 
                              key={sch.id} 
                              className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors group cursor-pointer"
                            >
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-250 text-sm leading-snug group-hover:text-purple-655 transition-colors">{sch.title}</h4>
                                <p className="text-[11px] text-foreground-muted mt-1 font-semibold">Region: {sch.states?.name || 'All India'}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-purple-655 transition-colors" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
              <div className="border-t border-border bg-slate-50 dark:bg-slate-900 p-3 text-center">
                <span className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">Press <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">ESC</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
