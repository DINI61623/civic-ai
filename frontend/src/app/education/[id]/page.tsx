'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { FALLBACK_EDUCATION, FALLBACK_STATES } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';
import OpportunityDetails from '@/components/opportunity/OpportunityDetails';

export default function EducationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      setIsLoading(true);
      try {
        const eduData = await api.getEducationById(id);
        
        if (eduData) {
          const eduName = eduData.title || '';
          const fallback = FALLBACK_EDUCATION.find(fe => 
            fe.name.toLowerCase().split(' ')[0] === eduName.toLowerCase().split(' ')[0]
          ) || FALLBACK_EDUCATION[0];
          
          const eduDataAny = eduData as any;
          const merged = { ...fallback } as any;
          for (const key in eduDataAny) {
            if (eduDataAny[key] !== null && eduDataAny[key] !== undefined && eduDataAny[key] !== '') {
              if (key === 'title') {
                merged.name = eduDataAny[key];
              } else if (key === 'official_website') {
                merged.website = eduDataAny[key];
              } else {
                merged[key] = eduDataAny[key];
              }
            }
          }
          if (eduData.states?.name) {
            merged.state = eduData.states.name;
          }
          setItem(merged);
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
