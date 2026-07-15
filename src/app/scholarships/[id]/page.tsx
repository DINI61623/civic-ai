'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FALLBACK_SCHOLARSHIPS, FALLBACK_STATES, Scholarship, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';
import OpportunityDetails from '@/components/opportunity/OpportunityDetails';

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
      <div className="container mx-auto px-4 py-32 text-center max-w-xl flex flex-col items-center justify-center gap-4 bg-background">
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

  return (
    <OpportunityDetails 
      item={scholarship} 
      itemType="Scholarship" 
      stateName={state?.name} 
      deptName={scholarship.type || 'Scholarship Foundation'} 
    />
  );
}
