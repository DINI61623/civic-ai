import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/services/api';
import { ArrowLeft, Building, ShieldCheck, MapPin, Heart, FileText, ExternalLink, CheckCircle2 } from 'lucide-react';

export default async function SchemeDetailPage({ params }: { params: { id: string } }) {
  let scheme;
  try {
    scheme = await api.getSchemeById(params.id);
  } catch (error) {
    notFound();
  }

  if (!scheme) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/schemes" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Schemes
      </Link>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        {scheme.verification_status === 'Verified' && (
          <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-bl-2xl font-semibold text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Official Data
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold">
            {scheme.departments?.name || 'Government'}
          </span>
          <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {scheme.states?.name || 'All India'}
          </span>
          <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-bold">
            {scheme.category || 'General'}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${scheme.status === 'Active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-600'}`}>
            {scheme.status}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">{scheme.title}</h1>
        <p className="text-lg text-foreground-muted mb-8 leading-relaxed max-w-3xl">{scheme.description}</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {scheme.apply_link && (
            <a href={scheme.apply_link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-primary text-white text-center font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-md flex justify-center items-center gap-2">
              Apply Now <ExternalLink className="h-5 w-5" />
            </a>
          )}
          {scheme.official_website && (
            <a href={scheme.official_website} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border-2 border-border text-foreground text-center font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
              Official Website <Building className="h-5 w-5" />
            </a>
          )}
        </div>

        <hr className="border-border mb-10" />

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" /> Key Benefits
            </h2>
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-green-900 whitespace-pre-wrap font-medium">
              {scheme.benefits}
            </div>
          </div>

          {scheme.eligibility && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" /> Eligibility Criteria
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                {scheme.eligibility}
              </div>
            </div>
          )}

          {scheme.required_documents && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" /> Required Documents
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                {scheme.required_documents}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
