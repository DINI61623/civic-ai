'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Landmark, MapPin, Building, Trophy, GraduationCap, 
  ExternalLink, ShieldAlert, Award, FileText, RefreshCw 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';

// Mock list matching page
const FALLBACK_EDUCATION = [
  {
    id: '1',
    name: 'National Institute of Technology (NIT)',
    type: 'Government University',
    details: 'Premier engineering institutes located across India offering Undergraduate, Postgraduate, and Doctorate degrees in various engineering and technology branches.',
    state: 'All India',
    website: 'https://www.nitcouncil.org.in',
    admission_criteria: 'Admissions are made based on ranks secured in Joint Entrance Examination - Main (JEE Main) through JoSAA counseling.',
    programs: 'B.Tech, M.Tech, MCA, MBA, Ph.D.',
    facilities: 'Hostel accommodation, state-of-the-art libraries, high-performance computing centers, research laboratories, sports complexes.'
  },
  {
    id: '2',
    name: 'CUET (UG) 2026',
    type: 'Entrance Exam',
    details: 'Common University Entrance Test for admission to undergraduate programs in Central, State, Private, and Deemed Universities across India.',
    state: 'All India',
    website: 'https://cuet.samarth.ac.in',
    admission_criteria: 'Computer-based examination testing Section IA & IB (Languages), Section II (Domain Specific Subjects), Section III (General Test).',
    programs: 'Undergraduate degrees (BA, B.Sc, B.Com, BBA, BCA, etc.) in participating institutions.',
    facilities: 'Exam help centers, reservations as per government norms, online mock test platforms.'
  },
  {
    id: '3',
    name: 'Prime Minister Research Fellowship (PMRF)',
    type: 'Fellowship',
    details: 'PMRF scheme has been designed for improving the quality of research in various higher educational institutions in the country.',
    state: 'All India',
    website: 'https://pmrf.in',
    admission_criteria: 'Direct entry or Lateral entry for students who have completed or are pursuing B.Tech/M.Sc/M.Tech in IISc, IITs, NITs, IISERs, IIITs with high CGPA/GATE score.',
    programs: 'Ph.D. fellowships in science and technology fields.',
    facilities: 'Fellowship of ₹70,000 - ₹80,000 per month, research contingency grant of ₹2 Lakhs per year.'
  }
];

export default function EducationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Query Supabase first
        const { data: eduData, error } = await supabase.from('education').select('*').eq('id', id).single();
        
        if (eduData && !error) {
          const fallback = FALLBACK_EDUCATION.find(fe => 
            fe.name.toLowerCase().split(' ')[0] === eduData.name.toLowerCase().split(' ')[0]
          ) || FALLBACK_EDUCATION[0];
          
          setItem({ ...fallback, ...eduData });
        } else {
          const fallback = FALLBACK_EDUCATION.find(e => e.id === id);
          if (fallback) setItem(fallback);
        }
      } catch (err) {
        console.error('Failed to resolve dynamic education details:', err);
        const fallback = FALLBACK_EDUCATION.find(e => e.id === id);
        if (fallback) setItem(fallback);
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

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <h2 className="text-2xl font-extrabold text-foreground mb-4">Higher Education Record Not Found</h2>
        <p className="text-sm text-foreground-muted mb-8">The university or fellowship you are looking for is currently offline or under maintenance.</p>
        <Button variant="primary" onClick={() => router.push('/education')}>Back to Catalog</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl relative">
      {/* Back button */}
      <button 
        onClick={() => router.push('/education')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Higher Education
      </button>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 p-6 md:p-10 text-white relative">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Building className="h-64 w-64 -mt-16 -mr-16" />
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 mb-4 relative z-10">
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-1">
              {item.type.includes('University') ? <Building className="h-3 w-3" /> : item.type.includes('Exam') ? <Trophy className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
              {item.type}
            </span>
            <span className="text-[10px] md:text-xs font-bold px-3 py-1 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {item.state}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight relative z-10 leading-tight mb-3">
            {item.name}
          </h1>
          <p className="text-white/80 text-sm md:text-base font-light max-w-3xl leading-relaxed relative z-10">
            {item.details}
          </p>
        </div>

        {/* Info */}
        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Admission Criteria */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-600" /> Admission / Selection Criteria
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl whitespace-pre-line leading-relaxed">
                {item.admission_criteria}
              </p>
            </div>

            {/* Offerings */}
            <div>
              <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                <GraduationCap className="h-4.5 w-4.5 text-indigo-600" /> Offered Programs / Support
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl whitespace-pre-line leading-relaxed">
                {item.programs}
              </p>
            </div>

            {/* Infrastructure / Grants */}
            {item.facilities && (
              <div>
                <h3 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-indigo-600" /> Hostels, Libraries & Infrastructure
                </h3>
                <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl whitespace-pre-line leading-relaxed">
                  {item.facilities}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-foreground text-base tracking-tight mb-2">Specs</h3>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Category Type</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">{item.type}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Geographic Bounds</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">{item.state}</div>
              </div>
            </div>

            {item.website && (
              <a href={item.website} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button variant="primary" fullWidth className="py-3 text-sm font-extrabold shadow-md shadow-primary/10">
                  Visit Official Website <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
