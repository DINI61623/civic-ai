'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Landmark, FileText, CheckCircle, 
  GraduationCap, ExternalLink, ArrowRight, ShieldAlert, Award, RefreshCw 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FALLBACK_EXAMS, FALLBACK_DEPARTMENTS, FALLBACK_STATES, Exam, Department, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [dept, setDept] = useState<Department | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Query Supabase first
        const { data: examData, error } = await supabase.from('exams').select('*').eq('id', id).single();
        
        let targetExam: Exam | null = null;

        if (examData && !error) {
          // Match matching fallback information using title prefix matching
          const fallback = FALLBACK_EXAMS.find(fe => 
            fe.title.toLowerCase().split(' ')[0] === examData.title.toLowerCase().split(' ')[0]
          ) || FALLBACK_EXAMS[0];
          
          targetExam = { ...fallback, ...examData };
        } else {
          // If not found by ID in DB, try matching in fallback list (since direct page urls may use fallback IDs)
          const fallback = FALLBACK_EXAMS.find(e => e.id === id);
          if (fallback) targetExam = fallback;
        }

        if (targetExam) {
          setExam(targetExam);
          
          // Resolve state and dept
          const [
            { data: deptsData },
            { data: statesData }
          ] = await Promise.all([
            supabase.from('departments').select('*'),
            supabase.from('states').select('*')
          ]);

          const deptsList = deptsData && deptsData.length > 0 ? deptsData : FALLBACK_DEPARTMENTS;
          const statesList = statesData && statesData.length > 0 ? statesData : FALLBACK_STATES;

          const matchedDept = deptsList.find(d => d.id === targetExam?.department_id);
          const matchedState = statesList.find(s => s.id === targetExam?.state_id);
          
          if (matchedDept) setDept(matchedDept);
          if (matchedState) setState(matchedState);
        }
      } catch (err) {
        console.error('Failed to resolve dynamic details from Supabase:', err);
        // Clean fallback fallback
        const fallback = FALLBACK_EXAMS.find(e => e.id === id);
        if (fallback) {
          setExam(fallback);
          setDept(FALLBACK_DEPARTMENTS.find(d => d.id === fallback.department_id) || null);
          setState(FALLBACK_STATES.find(s => s.id === fallback.state_id) || null);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-xl flex flex-col items-center justify-center gap-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-foreground-muted font-bold">Synchronizing with live notification database...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <h2 className="text-2xl font-extrabold text-foreground mb-4">Exam Notification Not Found</h2>
        <p className="text-sm text-foreground-muted mb-8">The notification you are looking for may have expired or is currently unavailable.</p>
        <Button variant="primary" onClick={() => router.push('/exams')}>Back to Exams</Button>
      </div>
    );
  }

  const getStatusLabel = (lastDateStr: string | null) => {
    if (!lastDateStr) return { label: 'Open', color: 'bg-green-50 text-green-700 border-green-200' };
    const lastDate = new Date(lastDateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    lastDate.setHours(0,0,0,0);
    if (lastDate < today) return { label: 'Closed', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    return { label: 'Open', color: 'bg-green-50 text-green-700 border-green-200' };
  };

  const status = getStatusLabel(exam.last_date);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl relative">
      {/* Back button */}
      <button 
        onClick={() => router.push('/exams')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to All Exams
      </button>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Top Banner Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-10 text-white relative">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Award className="h-64 w-64 -mt-16 -mr-16" />
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 mb-4 relative z-10">
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md">
              {status.label}
            </span>
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {state?.name || 'All India'}
            </span>
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md">
              {dept?.name ? dept.name.split(' (')[0] : 'Govt Department'}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight relative z-10 leading-tight mb-3">
            {exam.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base font-light max-w-3xl leading-relaxed relative z-10">
            {exam.description || "Official registration notification for administrative posts under national services."}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-100 p-4 text-xs font-medium text-amber-700 text-center flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Ensure to download the official syllabus guidelines PDF and verify eligibility criteria on the official portal before registering.
        </div>

        {/* Body content */}
        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Selection Process */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" /> Selection Process
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl whitespace-pre-line leading-relaxed">
                {exam.detailed_selection_process || exam.selection_process || "1. Computer-based Written Examination.\n2. Skill/Physical Standard tests (if applicable).\n3. Document Verification and Medical evaluation."}
              </p>
            </div>

            {/* Exam Pattern */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-primary" /> Exam Scheme & Pattern
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl whitespace-pre-line leading-relaxed">
                {exam.detailed_exam_pattern || exam.exam_pattern || "Multiple choice objective screening tests consisting of General Studies, Numerical Aptitude, and Language comprehensions."}
              </p>
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600" /> Required Documents Checklist
              </h3>
              <ul className="space-y-2">
                {(exam.required_documents || [
                  "10th Class Passing Certificate (for Date of Birth proof)",
                  "Graduation / qualifying degree transcripts and marksheets",
                  "Aadhaar Card or other government-approved Photo Identity Proof",
                  "Scanned Copy of passport size photo & signature",
                  "Reservation Category certificate (SC/ST/OBC/EWS) if applicable"
                ]).map((doc, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation guide & links */}
            {exam.preparation_resources && (
              <div>
                <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4.5 w-4.5 text-primary" /> Handpicked Study & Preparation Resources
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exam.preparation_resources.map((res, idx) => (
                    <a 
                      key={idx} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-primary font-bold hover:underline flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-100 p-4 rounded-xl transition-all"
                    >
                      {res.name} <ExternalLink className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats sidebar details */}
          <div className="space-y-6">
            
            {/* Quick specifications grid */}
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-foreground text-base tracking-tight mb-2">Notification Specs</h3>
              
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Eligibility Standard</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">{exam.qualification}</div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Age limit window</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">{exam.age_limit}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total vacancies</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">{exam.vacancies || 'Notification Dependent'}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Basic Scale Pay</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">{exam.salary || 'Standard Grade Pay'}</div>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-foreground-muted">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Registration Starts:</span>
                  <span className="font-extrabold text-slate-700">{exam.start_date ? new Date(exam.start_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground-muted">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Registration Closes:</span>
                  <span className="font-extrabold text-rose-600">{exam.last_date ? new Date(exam.last_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              {exam.apply_link && status.label !== 'Closed' && (
                <a href={exam.apply_link} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant="primary" fullWidth className="py-3 text-sm font-extrabold shadow-md shadow-primary/10">
                    Apply Now <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </a>
              )}
              {exam.official_website && (
                <a href={exam.official_website} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant="outline" fullWidth className="py-3 text-sm font-extrabold">
                    Visit Official Portal <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
