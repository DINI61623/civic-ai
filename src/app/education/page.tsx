'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, GraduationCap, Building, Trophy, ArrowUpRight, Loader2, Bookmark } from 'lucide-react';
import { api, Education } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';

export default function EducationPage() {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());
  const { user, showAuthModal } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    async function checkAuthAndLoad() {
      if (user) {
        const items = await api.getSavedItems();
        const eduIds = items.filter((i: any) => i.item_type === 'education').map((i: any) => i.item_id);
        setSavedItemIds(new Set(eduIds));
      }
    }
    checkAuthAndLoad();
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data } = await api.getEducation(searchQuery, category);
        setEducationList(data);
      } catch (error) {
        console.error('Error fetching education:', error);
      } finally {
        setLoading(false);
      }
    }
    
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, category]);

  const toggleSave = async (eduId: string) => {
    if (!isAuthenticated) {
      showAuthModal('Sign in to save this opportunity to your dashboard.');
      return;
    }
    
    const isSaved = savedItemIds.has(eduId);
    
    const newSaved = new Set(savedItemIds);
    if (isSaved) newSaved.delete(eduId);
    else newSaved.add(eduId);
    setSavedItemIds(newSaved);

    try {
      if (isSaved) {
        await api.unsaveItem('education', eduId);
      } else {
        await api.saveItem('education', eduId);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      setSavedItemIds(savedItemIds);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-foreground tracking-tight">Higher Education</h1>
        <p className="text-lg text-foreground-muted max-w-3xl">Explore government universities, entrance exams, and prestigious fellowships.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
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
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option>All Categories</option>
                  <option>Universities</option>
                  <option>Entrance Exams</option>
                  <option>Fellowships</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Loading education opportunities...</p>
            </div>
          ) : educationList.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
              <p className="text-foreground-muted">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => { setSearchQuery(''); setCategory('All Categories'); }}
                className="mt-6 text-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            educationList.map(item => {
              const isSaved = savedItemIds.has(item.id);
              return (
                <div key={item.id} className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group relative">
                  
                  <button 
                    onClick={() => toggleSave(item.id)}
                    className="absolute top-6 right-6 md:top-8 md:right-8 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                    title={isSaved ? "Unsave Item" : "Save Item"}
                  >
                    <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-primary text-primary' : 'text-slate-400 hover:text-primary'}`} />
                  </button>

                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5 pr-12">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-lg">
                          {item.states?.name || 'All India'}
                        </span>
                        <span className="text-xs text-foreground-muted font-medium bg-slate-100 px-3 py-1 rounded-lg flex items-center gap-1.5">
                          {item.type === 'University' ? <Building className="h-3.5 w-3.5" /> : item.type === 'Entrance Exam' ? <Trophy className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
                          {item.type}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h2>
                    </div>
                    <Link href={item.official_website || '#'} target="_blank" className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 self-end md:self-start mt-4 md:mt-0">
                      Explore Details <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                  
                  <div className="border-t border-border pt-5 mt-2">
                    <p className="text-[15px] leading-relaxed text-foreground-muted">
                      {item.details}
                    </p>
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
