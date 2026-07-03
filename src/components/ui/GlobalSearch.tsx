'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowRight, X, FileText, Gift, GraduationCap, Briefcase } from 'lucide-react';
import { api } from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GlobalSearch({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ exams: [], schemes: [], scholarships: [], education: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
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

  useEffect(() => {
    if (query.length < 2) {
      setResults({ exams: [], schemes: [], scholarships: [], education: [] });
      return;
    }

    const fetchSearch = async () => {
      setLoading(true);
      try {
        const data = await api.globalSearch(query);
        setResults(data);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSearch();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const hasResults = Object.values(results).some((arr: any) => arr.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-20 px-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-card w-full max-w-3xl rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.2)] overflow-hidden pointer-events-auto border border-border flex flex-col max-h-[80vh]"
            >
              {/* Search Input Bar */}
              <div className="relative border-b border-border p-4 flex items-center gap-3 bg-slate-50/50">
                <Search className="h-6 w-6 text-slate-400 shrink-0 ml-2" />
                <input 
                  ref={inputRef}
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search exams, schemes, scholarships..."
                  className="w-full bg-transparent border-none focus:ring-0 outline-none text-lg text-foreground placeholder:text-slate-400"
                />
                {loading && <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />}
                <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Results Area */}
              <div className="overflow-y-auto p-4 flex-1 custom-scrollbar bg-white">
                {query.length < 2 ? (
                  <div className="text-center py-12">
                    <p className="text-foreground-muted">Type at least 2 characters to search across all government opportunities.</p>
                  </div>
                ) : !hasResults && !loading ? (
                  <div className="text-center py-12">
                    <Search className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-1">No results found for "{query}"</p>
                    <p className="text-sm text-foreground-muted">Try using different keywords or check spelling.</p>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    
                    {results.exams.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-bold text-foreground">Exams</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {results.exams.map((exam: any) => (
                            <Link onClick={onClose} href={`/exams/${exam.id}`} key={exam.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                              <div>
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{exam.title}</h4>
                                <p className="text-xs text-foreground-muted">{exam.states?.name || 'All India'}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.schemes.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-2">
                          <Gift className="h-4 w-4 text-success" />
                          <h3 className="text-sm font-bold text-foreground">Schemes</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {results.schemes.map((scheme: any) => (
                            <Link onClick={onClose} href={`/schemes/${scheme.id}`} key={scheme.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                              <div>
                                <h4 className="font-semibold text-foreground group-hover:text-success transition-colors">{scheme.title}</h4>
                                <p className="text-xs text-foreground-muted">{scheme.states?.name || 'All India'}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-success transition-colors" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.scholarships.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-2">
                          <FileText className="h-4 w-4 text-purple-500" />
                          <h3 className="text-sm font-bold text-foreground">Scholarships</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {results.scholarships.map((sch: any) => (
                            <Link onClick={onClose} href={`/scholarships/${sch.id}`} key={sch.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                              <div>
                                <h4 className="font-semibold text-foreground group-hover:text-purple-600 transition-colors">{sch.title}</h4>
                                <p className="text-xs text-foreground-muted">{sch.states?.name || 'All India'}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
              <div className="border-t border-border bg-slate-50 p-3 text-center">
                <span className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">Press <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">ESC</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
