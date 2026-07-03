'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowUpRight, CheckCircle2, Loader2, Bookmark } from 'lucide-react';
import { api, Scholarship } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState('All Types');
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());
  const { user, showAuthModal } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    async function checkAuthAndLoad() {
      if (user) {
        const items = await api.getSavedItems();
        const scholarshipIds = items.filter((i: any) => i.item_type === 'scholarship').map((i: any) => i.item_id);
        setSavedItemIds(new Set(scholarshipIds));
      }
    }
    checkAuthAndLoad();
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data } = await api.getScholarships(searchQuery, type);
        setScholarships(data);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
      } finally {
        setLoading(false);
      }
    }
    
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, type]);

  const toggleSave = async (scholarshipId: string) => {
    if (!isAuthenticated) {
      showAuthModal('Sign in to save this scholarship to your dashboard.');
      return;
    }
    
    const isSaved = savedItemIds.has(scholarshipId);
    
    const newSaved = new Set(savedItemIds);
    if (isSaved) newSaved.delete(scholarshipId);
    else newSaved.add(scholarshipId);
    setSavedItemIds(newSaved);

    try {
      if (isSaved) {
        await api.unsaveItem('scholarship', scholarshipId);
      } else {
        await api.saveItem('scholarship', scholarshipId);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      setSavedItemIds(savedItemIds);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-foreground tracking-tight">Scholarships</h1>
        <p className="text-lg text-foreground-muted max-w-3xl">Access central and state scholarships to support your education.</p>
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
                <label className="text-sm font-semibold text-foreground block mb-2">Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option>All Types</option>
                  <option>Central</option>
                  <option>State</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Loading scholarships...</p>
            </div>
          ) : scholarships.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No scholarships found</h3>
              <p className="text-foreground-muted">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => { setSearchQuery(''); setType('All Types'); }}
                className="mt-6 text-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            scholarships.map(scholarship => {
              const isSaved = savedItemIds.has(scholarship.id);
              return (
                <div key={scholarship.id} className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group relative">
                  
                  <button 
                    onClick={() => toggleSave(scholarship.id)}
                    className="absolute top-6 right-6 md:top-8 md:right-8 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                    title={isSaved ? "Unsave Scholarship" : "Save Scholarship"}
                  >
                    <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-primary text-primary' : 'text-slate-400 hover:text-primary'}`} />
                  </button>

                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5 pr-12">
                    <div>
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-lg">
                          {scholarship.states?.name || 'All India'}
                        </span>
                        <span className="text-xs text-foreground-muted font-medium bg-slate-100 px-3 py-1 rounded-lg">{scholarship.type} Scholarship</span>
                        {scholarship.income_limit && (
                          <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-lg">{scholarship.income_limit}</span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{scholarship.title}</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-5 mt-2">
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-500 mt-0.5 shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-foreground-muted font-medium mb-1">Eligibility</div>
                        <div className="text-sm font-semibold text-foreground">{scholarship.eligibility}</div>
                      </div>
                    </div>
                    <div className="flex items-start justify-between col-span-1">
                      <div className="flex items-start gap-3 pr-4">
                        <div className="bg-red-50 p-2 rounded-lg text-danger mt-0.5 shrink-0">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs text-foreground-muted font-medium mb-1">Last Date</div>
                          <div className="text-sm font-bold text-danger">{scholarship.last_date}</div>
                        </div>
                      </div>
                      <Link href={scholarship.official_website || '#'} target="_blank" className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 self-end">
                        Details <ArrowUpRight className="h-4 w-4" />
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
