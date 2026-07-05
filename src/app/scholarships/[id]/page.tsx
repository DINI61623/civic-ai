'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Landmark, MapPin, GraduationCap, Calendar, 
  ExternalLink, ArrowRight, ShieldAlert, FileText, CheckCircle, RefreshCw 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FALLBACK_SCHOLARSHIPS, FALLBACK_STATES, Scholarship, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Query Supabase first
        const { data: scholarshipData, error } = await supabase.from('scholarships').select('*').eq('id', id).single();
        
        let targetScholarship: Scholarship | null = null;

        if (scholarshipData && !error) {
          const fallback = FALLBACK_SCHOLARSHIPS.find(fs => 
            fs.title.toLowerCase().split(' ')[0] === scholarshipData.title.toLowerCase().split(' ')[0]
          ) || FALLBACK_SCHOLARSHIPS[0];
          
          targetScholarship = { ...fallback, ...scholarshipData };
        } else {
          const fallback = FALLBACK_SCHOLARSHIPS.find(s => s.id === id);
          if (fallback) targetScholarship = fallback;
        }

        if (targetScholarship) {
          setScholarship(targetScholarship);
          
          // Resolve state
          const { data: statesData } = await supabase.from('states').select('*');
          const statesList = statesData && statesData.length > 0 ? statesData : FALLBACK_STATES;
          const matchedState = statesList.find(s => s.id === targetScholarship?.state_id);
          if (matchedState) setState(matchedState);
        }
      } catch (err) {
        console.error('Failed to resolve dynamic scholarship details:', err);
        const fallback = FALLBACK_SCHOLARSHIPS.find(s => s.id === id);
        if (fallback) {
          setScholarship(fallback);
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

  if (!scholarship) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <h2 className="text-2xl font-extrabold text-foreground mb-4">Scholarship Profile Not Found</h2>
        <p className="text-sm text-foreground-muted mb-8">The scholarship you are looking for may have closed or is temporarily offline.</p>
        <Button variant="primary" onClick={() => router.push('/scholarships')}>Back to Scholarships</Button>
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

  const status = getStatusLabel(scholarship.last_date);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl relative">
      {/* Back button */}
      <button 
        onClick={() => router.push('/scholarships')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-purple-600 mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to All Scholarships
      </button>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Top Banner Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 p-6 md:p-10 text-white relative">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <GraduationCap className="h-64 w-64 -mt-16 -mr-16" />
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 mb-4 relative z-10">
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md">
              Scholarship
            </span>
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {state?.name || 'All India'}
            </span>
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md">
              {scholarship.type} Scheme
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight relative z-10 leading-tight mb-3">
            {scholarship.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base font-light max-w-3xl leading-relaxed relative z-10">
            {scholarship.description || "State/Central education sponsorship to support student tuition fees and hostel charges for academic programs."}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-100 p-4 text-xs font-medium text-amber-700 text-center flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Check category eligibility (SC/ST/OBC/EWS) and household income limit requirements before filling the forms.
        </div>

        {/* Body content */}
        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-purple-600" /> Scholarship Guidelines
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl whitespace-pre-line leading-relaxed">
                {scholarship.description || "Direct benefit transfers are credited directly into students' bank accounts following verification of active college enrollment and performance records."}
              </p>
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600" /> Required Documents Checklist
              </h3>
              <ul className="space-y-2">
                {(scholarship.documents_required || "Student Photograph, Caste/Category Certificate, Household Income Certificate, Fee receipt of current course, Bank Account details, Previous year transcripts marksheet")
                  .split(', ')
                  .map((doc, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                      <span>{doc}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Quick Specifications sidebar */}
          <div className="space-y-6">
            
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-foreground text-base tracking-tight mb-2">Scheme Specs</h3>
              
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Eligibility Limit</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5 leading-relaxed">{scholarship.eligibility}</div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Income Criteria</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5 leading-relaxed">{scholarship.income_limit || 'Family Income Limit applies'}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Application Deadline</div>
                <div className="text-sm font-extrabold text-rose-600 mt-0.5 font-bold">
                  {scholarship.last_date ? new Date(scholarship.last_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              {scholarship.apply_link && status.label !== 'Closed' && (
                <a href={scholarship.apply_link} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant="purple" fullWidth className="py-3 text-sm font-extrabold shadow-md shadow-purple-600/10">
                    Apply Online <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </a>
              )}
              {scholarship.official_website && (
                <a href={scholarship.official_website} target="_blank" rel="noopener noreferrer" className="block w-full">
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
