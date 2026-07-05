'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Landmark, MapPin, Gift, CheckCircle, 
  ExternalLink, ArrowRight, ShieldAlert, FileText, RefreshCw 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FALLBACK_SCHEMES, FALLBACK_STATES, Scheme, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Query Supabase first
        const { data: schemeData, error } = await supabase.from('schemes').select('*').eq('id', id).single();
        
        let targetScheme: Scheme | null = null;

        if (schemeData && !error) {
          const fallback = FALLBACK_SCHEMES.find(fs => 
            fs.title.toLowerCase().split(' ')[0] === schemeData.title.toLowerCase().split(' ')[0]
          ) || FALLBACK_SCHEMES[0];
          
          targetScheme = { ...fallback, ...schemeData };
        } else {
          const fallback = FALLBACK_SCHEMES.find(s => s.id === id);
          if (fallback) targetScheme = fallback;
        }

        if (targetScheme) {
          setScheme(targetScheme);
          
          // Resolve state
          const { data: statesData } = await supabase.from('states').select('*');
          const statesList = statesData && statesData.length > 0 ? statesData : FALLBACK_STATES;
          const matchedState = statesList.find(s => s.id === targetScheme?.state_id);
          if (matchedState) setState(matchedState);
        }
      } catch (err) {
        console.error('Failed to resolve dynamic scheme details:', err);
        const fallback = FALLBACK_SCHEMES.find(s => s.id === id);
        if (fallback) {
          setScheme(fallback);
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

  if (!scheme) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <h2 className="text-2xl font-extrabold text-foreground mb-4">Welfare Scheme Not Found</h2>
        <p className="text-sm text-foreground-muted mb-8">The scheme you are looking for may have been archived or is temporarily unavailable.</p>
        <Button variant="primary" onClick={() => router.push('/schemes')}>Back to Schemes</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl relative">
      {/* Back button */}
      <button 
        onClick={() => router.push('/schemes')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to All Schemes
      </button>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Top Banner Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 md:p-10 text-white relative">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Landmark className="h-64 w-64 -mt-16 -mr-16" />
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 mb-4 relative z-10">
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md">
              Scheme
            </span>
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {state?.name || 'All India'}
            </span>
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md">
              {scheme.category}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight relative z-10 leading-tight mb-3">
            {scheme.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base font-light max-w-3xl leading-relaxed relative z-10">
            {scheme.description || "National or state-sponsored welfare scheme assisting citizens with grants, loans, and resources."}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-100 p-4 text-xs font-medium text-amber-700 text-center flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Verify guidelines, family income ceilings, and offline documentation forms on the official ministry portal.
        </div>

        {/* Body content */}
        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-emerald-600" /> Welfare Guidelines
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl whitespace-pre-line leading-relaxed">
                {scheme.description || "This scheme supports citizens through financial allocations, technical resources, and institutional grants under official criteria."}
              </p>
            </div>

            {/* Scheme benefits */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <Gift className="h-4.5 w-4.5 text-emerald-600" /> Scheme Benefits
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl whitespace-pre-line leading-relaxed">
                {scheme.benefits}
              </p>
            </div>

            {/* Required Documents */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600" /> Required Documents Checklist
              </h3>
              <ul className="space-y-2">
                {(scheme.required_documents || "Aadhaar Card, Identity Proof, Address Proof, Income Certificate, Bank Passbook, Passport photo")
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
                <div className="text-[10px] uppercase font-bold text-slate-400">Target Category</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">{scheme.category}</div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Eligibility Criteria</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5 leading-relaxed">{scheme.eligibility}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Managing Ministry</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5 leading-relaxed">{scheme.ministry || 'State Welfare Board'}</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              {scheme.apply_link && (
                <a href={scheme.apply_link} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant="emerald" fullWidth className="py-3 text-sm font-extrabold shadow-md shadow-emerald-600/10">
                    Apply Online <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </a>
              )}
              {scheme.official_website && (
                <a href={scheme.official_website} target="_blank" rel="noopener noreferrer" className="block w-full">
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
