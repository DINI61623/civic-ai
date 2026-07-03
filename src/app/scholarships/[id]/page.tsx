import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/services/api';
import { ArrowLeft, Building, ShieldCheck, MapPin, GraduationCap, FileText, ExternalLink, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';

export default async function ScholarshipDetailPage({ params }: { params: { id: string } }) {
  let scholarship;
  try {
    scholarship = await api.getScholarshipById(params.id);
  } catch (error) {
    notFound();
  }

  if (!scholarship) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/scholarships" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Scholarships
      </Link>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        {scholarship.verification_status === 'Verified' && (
          <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-bl-2xl font-semibold text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Official Data
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
            <GraduationCap className="h-4 w-4" /> {scholarship.type || 'General'}
          </span>
          <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {scholarship.states?.name || 'All India'}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${scholarship.status === 'Active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-600'}`}>
            {scholarship.status}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">{scholarship.title}</h1>
        <p className="text-lg text-foreground-muted mb-8 leading-relaxed max-w-3xl">{scholarship.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl"><IndianRupee className="h-6 w-6 text-emerald-600" /></div>
            <div>
              <span className="text-xs text-foreground-muted font-semibold block mb-1">Scholarship Amount</span>
              <span className="text-xl font-bold text-foreground block">{scholarship.amount || 'Variable'}</span>
            </div>
          </div>
          <div className="bg-danger/5 p-6 rounded-2xl border border-danger/10 flex items-start gap-4">
            <div className="bg-danger/10 p-3 rounded-xl"><Clock className="h-6 w-6 text-danger" /></div>
            <div>
              <span className="text-xs text-danger font-semibold block mb-1">Last Date to Apply</span>
              <span className="text-xl font-bold text-danger block">{scholarship.last_date}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {scholarship.apply_link && (
            <a href={scholarship.apply_link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-primary text-white text-center font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-md flex justify-center items-center gap-2">
              Apply Now <ExternalLink className="h-5 w-5" />
            </a>
          )}
          {scholarship.official_website && (
            <a href={scholarship.official_website} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border-2 border-border text-foreground text-center font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
              Official Website <Building className="h-5 w-5" />
            </a>
          )}
        </div>

        <hr className="border-border mb-10" />

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" /> Eligibility
            </h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
              {scholarship.eligibility}
            </div>
          </div>

          {scholarship.income_limit && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <IndianRupee className="h-6 w-6 text-primary" /> Income Limit
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                {scholarship.income_limit}
              </div>
            </div>
          )}

          {scholarship.documents_required && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" /> Required Documents
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                {scholarship.documents_required}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
