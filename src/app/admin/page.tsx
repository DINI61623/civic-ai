'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { ShieldCheck, UploadCloud, Users, FileText, Database, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const profile = await api.getUserProfile();
        if (profile?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push('/dashboard');
        }
      } catch (err) {
        setIsAdmin(false);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10 flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-foreground-muted">Manage records, import data, and verify opportunities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-foreground">Total Exams</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">24</p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-foreground">Total Schemes</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">15</p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-foreground">Total Users</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">142</p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-foreground">Pending Verifications</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">8</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
            <h2 className="text-xl font-bold mb-4">Recent Submissions (Pending)</h2>
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-border rounded-xl">
              <p>No pending records to verify.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
            <h2 className="text-xl font-bold mb-4">Bulk Data Import</h2>
            <p className="text-sm text-foreground-muted mb-6">Upload official CSV or JSON files to bulk ingest government opportunities.</p>
            
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group">
              <UploadCloud className="h-10 w-10 mx-auto text-slate-400 group-hover:text-primary mb-3 transition-colors" />
              <p className="text-sm font-semibold text-foreground">Click to upload or drag & drop</p>
              <p className="text-xs text-foreground-muted mt-1">CSV, JSON (Max 10MB)</p>
            </div>
            
            <button className="w-full mt-4 bg-primary text-white font-semibold py-2.5 rounded-xl opacity-50 cursor-not-allowed">
              Process Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
