'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Calendar, GraduationCap, Search, ArrowUpRight, Loader2, Bookmark } from 'lucide-react';
import { api, Exam } from '@/services/api';
import { createClient } from '@/lib/supabase/client';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [qualification, setQualification] = useState('Any Qualification');
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoad() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        const items = await api.getSavedItems();
        const examIds = items.filter(i => i.item_type === 'exam').map(i => i.item_id);
        setSavedItemIds(new Set(examIds));
      }
    }
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data } = await api.getExams(searchQuery, qualification);
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    }
    
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, qualification]);

  const toggleSave = async (examId: string) => {
    if (!isAuthenticated) return alert('Please sign in to save opportunities!');
    
    const isSaved = savedItemIds.has(examId);
    
    // Optimistic UI update
    const newSaved = new Set(savedItemIds);
    if (isSaved) newSaved.delete(examId);
    else newSaved.add(examId);
    setSavedItemIds(newSaved);

    try {
      if (isSaved) {
        await api.unsaveItem('exam', examId);
      } else {
        await api.saveItem('exam', examId);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      // Revert on error
      setSavedItemIds(savedItemIds);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-foreground tracking-tight">Government Exams</h1>
        <p className="text-lg text-foreground-muted max-w-3xl">Discover and apply for the latest government job opportunities across India.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-72 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] sticky top-24">
            <h3 className="font-bold text-lg mb-5 text-foreground">Filters</h3>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. UPSC" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Qualification</label>
                <select 
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full p-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option>Any Qualification</option>
                  <option>10th Pass</option>
                  <option>12th Pass</option>
                  <option>Graduate</option>
                  <option>Post Graduate</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-5 min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Loading opportunities...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No exams found</h3>
              <p className="text-foreground-muted">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => { setSearchQuery(''); setQualification('Any Qualification'); }}
                className="mt-6 text-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            exams.map(exam => {
              const isSaved = savedItemIds.has(exam.id);
              return (
                <div key={exam.id} className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden group">
                  
                  {/* Bookmark Button */}
                  <button 
                    onClick={() => toggleSave(exam.id)}
                    className="absolute top-6 right-6 md:top-8 md:right-8 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                    title={isSaved ? "Unsave Exam" : "Save Exam"}
                  >
                    <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-primary text-primary' : 'text-slate-400 hover:text-primary'}`} />
                  </button>

                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5 pr-12">
                    <div>
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="bg-blue-50 text-primary text-xs font-bold px-3 py-1 rounded-lg">
                          {exam.states?.name || 'All India'}
                        </span>
                        <span className="text-xs text-foreground-muted font-medium bg-slate-100 px-3 py-1 rounded-lg">{exam.departments?.name || 'Govt'}</span>
                        {exam.vacancies && (
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg">{exam.vacancies} Vacancies</span>
                        )}
                        {exam.salary && (
                          <span className="text-xs text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-lg">{exam.salary}</span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{exam.title}</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-5 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-foreground-muted font-medium">Eligibility</div>
                        <div className="text-sm font-semibold text-foreground">{exam.eligibility}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-foreground-muted font-medium">Age Limit</div>
                        <div className="text-sm font-semibold text-foreground">{exam.age_limit}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between col-span-1 md:col-span-1">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-2 rounded-lg text-danger">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs text-foreground-muted font-medium">Last Date</div>
                          <div className="text-sm font-bold text-danger">{exam.last_date}</div>
                        </div>
                      </div>
                      <Link href={exam.apply_link || '#'} target="_blank" className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 ml-4">
                        Apply <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
