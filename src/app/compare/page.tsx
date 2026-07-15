'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, BarChart2, ShieldCheck, HelpCircle } from 'lucide-react';
import { FALLBACK_EXAMS, FALLBACK_SCHOLARSHIPS } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

export default function CompareOpportunitiesPage() {
  const router = useRouter();
  const [compareType, setCompareType] = useState<'Exam' | 'Scholarship'>('Exam');
  const [itemIdA, setItemIdA] = useState('');
  const [itemIdB, setItemIdB] = useState('');

  const opportunities = compareType === 'Exam' ? FALLBACK_EXAMS : FALLBACK_SCHOLARSHIPS;
  const itemA = opportunities.find(o => o.id === itemIdA);
  const itemB = opportunities.find(o => o.id === itemIdB);

  // Helper to resolve dynamic difficulty/fees/salary mock stats if missing
  const getComparisonStats = (item: any) => {
    if (!item) return null;
    
    let difficulty = 'Medium';
    if (item.title.toLowerCase().includes('upsc') || item.title.toLowerCase().includes('gate')) {
      difficulty = 'High / Hard';
    } else if (item.title.toLowerCase().includes('ssc')) {
      difficulty = 'Medium';
    } else if (item.title.toLowerCase().includes('national')) {
      difficulty = 'Low';
    }

    const fee = compareType === 'Exam' 
      ? (item.title.toLowerCase().includes('upsc') ? '₹100 (General)' : '₹100 (General) / Free for Reserved')
      : 'Free (No Application Fee)';

    return {
      title: item.title,
      eligibility: item.eligibility,
      qualification: (item as any).qualification || 'Academic marks eligibility guidelines',
      ageLimit: (item as any).age_limit || (item as any).income_limit || 'Varies',
      salary: (item as any).salary || 'Financial Grant / Stiped Allowances',
      difficulty,
      fee,
      selection: (item as any).selection_process || 'Academic Merit Screening',
      date: item.last_date ? new Date(item.last_date).toLocaleDateString() : 'Notification dependent'
    };
  };

  const statsA = getComparisonStats(itemA);
  const statsB = getComparisonStats(itemB);

  const handleReset = () => {
    setItemIdA('');
    setItemIdB('');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      
      {/* Back to dashboard */}
      <button 
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Side-by-side comparison</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Compare Opportunities</h1>
          <p className="text-foreground-muted text-sm mt-1">Select and compare exam syllabus, eligibility standards, fees, and scales side-by-side.</p>
        </div>

        {/* Compare type toggle selector */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1.5 self-start md:self-auto select-none">
          <button
            onClick={() => {
              setCompareType('Exam');
              handleReset();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              compareType === 'Exam' 
                ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            Exams
          </button>
          <button
            onClick={() => {
              setCompareType('Scholarship');
              handleReset();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              compareType === 'Scholarship' 
                ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            Scholarships
          </button>
        </div>
      </div>

      {/* Selectors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl mb-8">
        <div>
          <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wide mb-2">Select Opportunity A</label>
          <select
            value={itemIdA}
            onChange={(e) => setItemIdA(e.target.value)}
            className="w-full bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary cursor-pointer outline-none font-bold text-slate-700 dark:text-slate-300"
          >
            <option value="">Choose first item...</option>
            {opportunities.filter(o => o.id !== itemIdB).map(o => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wide mb-2">Select Opportunity B</label>
          <select
            value={itemIdB}
            onChange={(e) => setItemIdB(e.target.value)}
            className="w-full bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary cursor-pointer outline-none font-bold text-slate-700 dark:text-slate-300"
          >
            <option value="">Choose second item...</option>
            {opportunities.filter(o => o.id !== itemIdA).map(o => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison results */}
      {!statsA || !statsB ? (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
          <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-3 opacity-60" />
          <h3 className="font-extrabold text-slate-700 dark:text-white text-base">Select two opportunities to compare</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Use the dropdown menus above to load details side-by-side and evaluate their eligibility guidelines.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="p-5 w-1/4">Specification</th>
                <th className="p-5 w-3/8 border-l border-slate-200 dark:border-slate-800 text-primary">{statsA.title}</th>
                <th className="p-5 w-3/8 border-l border-slate-200 dark:border-slate-800 text-secondary">{statsB.title}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              
              <tr>
                <td className="p-5 font-bold text-slate-400">Eligibility Criteria</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{statsA.eligibility}</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{statsB.eligibility}</td>
              </tr>

              <tr>
                <td className="p-5 font-bold text-slate-400">Required Education</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">{statsA.qualification}</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">{statsB.qualification}</td>
              </tr>

              <tr>
                <td className="p-5 font-bold text-slate-400">Age / Income Limits</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">{statsA.ageLimit}</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">{statsB.ageLimit}</td>
              </tr>

              <tr>
                <td className="p-5 font-bold text-slate-400">Salary Scale / Benefits</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">{statsA.salary}</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">{statsB.salary}</td>
              </tr>

              <tr>
                <td className="p-5 font-bold text-slate-400">Exam Difficulty Score</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 font-extrabold text-primary">{statsA.difficulty}</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 font-extrabold text-secondary">{statsB.difficulty}</td>
              </tr>

              <tr>
                <td className="p-5 font-bold text-slate-400">Registration Fee</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">{statsA.fee}</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">{statsB.fee}</td>
              </tr>

              <tr>
                <td className="p-5 font-bold text-slate-400">Selection Process</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-line">{statsA.selection}</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-line">{statsB.selection}</td>
              </tr>

              <tr>
                <td className="p-5 font-bold text-slate-400">Application Deadline</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-rose-500 font-extrabold">{statsA.date}</td>
                <td className="p-5 border-l border-slate-200 dark:border-slate-800 text-rose-500 font-extrabold">{statsB.date}</td>
              </tr>

            </tbody>
          </table>
          
          <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <Button variant="outline" onClick={handleReset} className="text-xs font-bold py-2 rounded-xl cursor-pointer">
              Clear Comparison
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
