'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { FALLBACK_SCHEMES, FALLBACK_STATES, Scheme, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';
import OpportunityDetails from '@/components/opportunity/OpportunityDetails';

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      setIsLoading(true);
      try {
        const schemeData = await api.getSchemeById(id);
        
        let targetScheme: Scheme | null = null;
        let stateName = '';

        if (schemeData) {
          const fallback = FALLBACK_SCHEMES.find(fs => 
            fs.title.toLowerCase().split(' ')[0] === schemeData.title.toLowerCase().split(' ')[0]
          ) || FALLBACK_SCHEMES[0];
          
          targetScheme = { ...fallback } as any;
          const schemeDataAny = schemeData as any;
          for (const key in schemeDataAny) {
            if (schemeDataAny[key] !== null && schemeDataAny[key] !== undefined && schemeDataAny[key] !== '') {
              (targetScheme as any)[key] = schemeDataAny[key];
            }
          }
          stateName = schemeData.states?.name || '';
        } else {
          const fallback = FALLBACK_SCHEMES.find(s => s.id === id);
          if (fallback) {
            targetScheme = fallback;
            stateName = FALLBACK_STATES.find(s => s.id === fallback.state_id)?.name || '';
          }
        }

        if (targetScheme) {
          setScheme(targetScheme);
          setState(stateName ? { id: '', name: stateName } : null);
        }
      } catch (err) {
        console.error('Failed to resolve dynamic scheme details from API:', err);
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
      <div className="container mx-auto px-4 py-32 text-center max-w-xl flex flex-col items-center justify-center gap-4 bg-background">
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
    <OpportunityDetails 
      item={scheme} 
      itemType="Scheme" 
      stateName={state?.name} 
      deptName={scheme.ministry || 'Govt Ministry'} 
    />
  );
}
