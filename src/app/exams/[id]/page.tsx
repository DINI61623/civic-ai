'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { FALLBACK_EXAMS, FALLBACK_DEPARTMENTS, FALLBACK_STATES, Exam, Department, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';
import OpportunityDetails from '@/components/opportunity/OpportunityDetails';

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
        const examData = await api.getExamById(id);
        
        let targetExam: Exam | null = null;
        let deptName = '';
        let stateName = '';

        if (examData) {
          const fallback = FALLBACK_EXAMS.find(fe => 
            fe.title.toLowerCase().split(' ')[0] === examData.title.toLowerCase().split(' ')[0]
          ) || FALLBACK_EXAMS[0];
          
          targetExam = { ...fallback, ...examData };
          deptName = examData.departments?.name || '';
          stateName = examData.states?.name || '';
        } else {
          const fallback = FALLBACK_EXAMS.find(e => e.id === id);
          if (fallback) {
            targetExam = fallback;
            deptName = FALLBACK_DEPARTMENTS.find(d => d.id === fallback.department_id)?.name || '';
            stateName = FALLBACK_STATES.find(s => s.id === fallback.state_id)?.name || '';
          }
        }

        if (targetExam) {
          setExam(targetExam);
          setDept(deptName ? { id: '', name: deptName, state_id: '', is_central: false } : null);
          setState(stateName ? { id: '', name: stateName } : null);
        }
      } catch (err) {
        console.error('Failed to resolve dynamic details from API:', err);
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
      <div className="container mx-auto px-4 py-32 text-center max-w-xl flex flex-col items-center justify-center gap-4 bg-background">
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

  return (
    <OpportunityDetails 
      item={exam} 
      itemType="Exam" 
      stateName={state?.name} 
      deptName={dept?.name} 
    />
  );
}
