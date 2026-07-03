import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/services/api';
import { ArrowLeft, Building, ShieldCheck, MapPin, GraduationCap, ExternalLink } from 'lucide-react';

export default async function EducationDetailPage({ params }: { params: { id: string } }) {
  let education;
  try {
    education = await api.getEducationById(params.id);
  } catch (error) {
    notFound();
  }

  if (!education) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/education" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Higher Education
      </Link>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        {education.verification_status === 'Verified' && (
          <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-bl-2xl font-semibold text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Official Data
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
            <GraduationCap className="h-4 w-4" /> {education.type || 'Institution'}
          </span>
          <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {education.states?.name || 'All India'}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${education.status === 'Active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-600'}`}>
            {education.status}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">{education.title}</h1>
        <p className="text-lg text-foreground-muted mb-8 leading-relaxed max-w-3xl">{education.details}</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {education.official_website && (
            <a href={education.official_website} target="_blank" rel="noopener noreferrer" className="flex-1 bg-primary text-white text-center font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-md flex justify-center items-center gap-2">
              Official Website <Building className="h-5 w-5" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
