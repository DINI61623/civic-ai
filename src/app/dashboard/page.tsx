'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api';
import { Bookmark, FileText, ArrowRight, User, Loader2, LogOut, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }

        const userProfile = await api.getUserProfile();
        setProfile(userProfile || { email: user.email, full_name: user.user_metadata?.full_name || 'Citizen' });

        const items = await api.getSavedItems();
        setSavedItems(items || []);

      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Welcome Section */}
      <div className="bg-card rounded-3xl p-8 md:p-10 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Good morning, {profile?.full_name?.split(' ')[0] || 'Citizen'}</h1>
              <p className="text-foreground-muted mt-1 text-sm md:text-base font-medium">{profile?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="min-h-[40px] px-4 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Saved Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Saved Opportunities</h2>
          
          {savedItems.length === 0 ? (
            <div className="bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Bookmark className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No saved items yet</h3>
              <p className="text-foreground-muted mb-6">Browse government exams and schemes to save them here for later.</p>
              <Link href="/exams" className="inline-block">
                <Button variant="primary">Browse Opportunities</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] divide-y divide-border animate-fade-in">
              {savedItems.map((item) => (
                <div key={item.id} className="p-4 md:p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors w-full">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-start sm:items-center w-full pr-4">
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 w-auto sm:w-24 text-center ${
                      item.item_type === 'Exam' ? 'bg-blue-50 text-blue-700' :
                      item.item_type === 'Scheme' ? 'bg-green-50 text-green-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {item.item_type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base md:text-lg mb-1 truncate">
                        {item.title || `${item.item_type} Opportunity`}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-foreground-muted font-medium">
                        <span>{item.tag || 'Saved Item'}</span>
                        {item.date && (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <span className={item.date?.includes('Closes') ? 'text-danger' : ''}>{item.date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href={`/${item.item_type?.toLowerCase()}s/${item.item_id}`} className="text-primary hover:bg-primary/10 p-2.5 rounded-xl transition-colors shrink-0">
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics / Stats */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Your Profile</h2>
          
          <div className="bg-card rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
            <h3 className="font-bold text-foreground mb-4">Profile Completion</h3>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
              <div className="bg-success h-2.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
            <p className="text-sm text-foreground-muted">40% Complete - Add your qualification and state to get better recommendations.</p>
            <button className="mt-4 w-full border border-border hover:bg-slate-50 text-foreground font-semibold py-2 rounded-xl transition-colors text-sm">
              Complete Profile
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Ask CivicAI</h3>
            <p className="text-white/80 text-sm mb-4 relative z-10">Get personalized guidance based on your profile.</p>
            <Link href="/ai-assistant" className="bg-white text-primary text-sm font-bold py-2 px-4 rounded-xl inline-block hover:bg-slate-50 transition-colors relative z-10 shadow-sm">
              Open Assistant
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}
