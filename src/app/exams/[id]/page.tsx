import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/services/api';
import { ArrowLeft, Building, Calendar, ShieldCheck, MapPin, Briefcase, FileText, ExternalLink, GraduationCap } from 'lucide-react';

export default async function ExamDetailPage({ params }: { params: { id: string } }) {
  let exam;
  try {
    exam = await api.getExamById(params.id);
  } catch (error) {
    notFound();
  }

  if (!exam) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/exams" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Exams
      </Link>

      <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        {exam.verification_status === 'Verified' && (
          <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-bl-2xl font-semibold text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Official Data
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold">
            {exam.departments?.name || 'Government'}
          </span>
          <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {exam.states?.name || 'All India'}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${exam.status === 'Active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-600'}`}>
            {exam.status}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">{exam.title}</h1>
        <p className="text-lg text-foreground-muted mb-8 leading-relaxed max-w-3xl">{exam.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {exam.vacancies && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs text-foreground-muted font-semibold block mb-1">Total Vacancies</span>
              <span className="text-xl font-bold text-foreground">{exam.vacancies}</span>
            </div>
          )}
          {exam.salary && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs text-foreground-muted font-semibold block mb-1">Salary / Pay Scale</span>
              <span className="text-lg font-bold text-foreground truncate block">{exam.salary}</span>
            </div>
          )}
          <div className="bg-danger/5 p-4 rounded-2xl border border-danger/10">
            <span className="text-xs text-danger font-semibold block mb-1">Last Date to Apply</span>
            <span className="text-xl font-bold text-danger">{exam.last_date}</span>
          </div>
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <span className="text-xs text-primary font-semibold block mb-1">Exam Date</span>
            <span className="text-xl font-bold text-primary">{exam.exam_date || 'To be announced'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {exam.apply_link && (
            <a href={exam.apply_link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-primary text-white text-center font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-md flex justify-center items-center gap-2">
              Apply Now <ExternalLink className="h-5 w-5" />
            </a>
          )}
          {exam.official_website && (
            <a href={exam.official_website} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border-2 border-border text-foreground text-center font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
              Official Website <Building className="h-5 w-5" />
            </a>
          )}
        </div>

        <hr className="border-border mb-10" />

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" /> Eligibility & Qualification
            </h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-foreground">{exam.qualification}</p>
            </div>
          </div>

          {exam.selection_process && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary" /> Selection Process
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                {exam.selection_process}
              </div>
            </div>
          )}

          {exam.exam_pattern && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" /> Exam Pattern
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                {exam.exam_pattern}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
