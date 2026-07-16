'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import OpportunityDetails from '@/components/opportunity/OpportunityDetails';

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
        const eduData = await api.getEducationById(id);
        
        if (eduData) {
          const eduName = eduData.title || eduData.name || '';
          const fallback = FALLBACK_EDUCATION.find(fe => 
            fe.name.toLowerCase().split(' ')[0] === eduName.toLowerCase().split(' ')[0]
          ) || FALLBACK_EDUCATION[0];
          
          setItem({ ...fallback, ...eduData, state: eduData.states?.name || fallback.state });
        } else {
          const fallback = FALLBACK_EDUCATION.find(e => e.id === id);
          if (fallback) setItem(fallback);
        }
      } catch (err) {
        console.error('Failed to resolve dynamic education details from API:', err);
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
      <div className="container mx-auto px-4 py-32 text-center max-w-xl flex flex-col items-center justify-center gap-4 bg-background">
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
    <OpportunityDetails 
      item={item} 
      itemType="Education" 
      stateName={item.state} 
      deptName={item.type} 
    />
  );
}
