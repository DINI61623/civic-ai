'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api';
import { Bookmark, FileText, ArrowRight, User, Loader2, LogOut } from 'lucide-react';

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
        setSavedItems(items);

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
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Good morning, {profile?.full_name?.split(' ')[0] || 'Citizen'}</h1>
              <p className="text-foreground-muted mt-1 font-medium">{profile?.email}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {profile?.role === 'admin' && (
              <Link href="/admin" className="flex-1 md:flex-none text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Admin Panel
              </Link>
            )}
            <button onClick={handleSignOut} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger font-semibold px-5 py-2.5 rounded-xl transition-colors">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
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
              <Link href="/exams" className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-block">
                Browse Exams
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedItems.map((item) => (
                <div key={item.id} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-foreground-muted bg-slate-100 px-2 py-0.5 rounded">{item.item_type}</span>
                        <span className="text-xs text-foreground-muted">Saved on {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">{item.item_id}</h3>
                    </div>
                  </div>
                  <Link href={`/${item.item_type}s/${item.item_id}`} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
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
