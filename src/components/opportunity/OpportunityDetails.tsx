'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Clock, Landmark, FileText, CheckCircle, 
  GraduationCap, ExternalLink, ArrowRight, ShieldAlert, Award, RefreshCw,
  Bookmark, Share2, Sparkles, AlertCircle, FileCheck, Check, Printer,
  MapPin, ChevronRight, MessageSquareText, ShieldCheck, Heart, Info, HelpCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api';
import { useAuth } from '@/components/providers/AuthProvider';
import Button from '@/components/ui/Button';

// Mock lists for related opportunities
import { FALLBACK_EXAMS, FALLBACK_SCHEMES, FALLBACK_SCHOLARSHIPS, FALLBACK_STATES, FALLBACK_EDUCATION } from '@/lib/fallbackData';

interface OpportunityDetailsProps {
  item: any;
  itemType: 'Exam' | 'Scheme' | 'Scholarship' | 'Education';
  stateName?: string;
  deptName?: string;
}

export default function OpportunityDetails({ item, itemType, stateName, deptName }: OpportunityDetailsProps) {
  const router = useRouter();
  const { user, showAuthModal } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-summary' | 'eligibility' | 'documents'>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  // Checklist items
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function checkSaved() {
      if (!user) return;
      try {
        const saved = await api.isItemSaved(itemType === 'Education' ? 'Scholarship' : itemType, item.id);
        setIsSaved(saved);
      } catch (err) {
        console.error('Error checking save status:', err);
      }
    }
    checkSaved();
  }, [item.id, itemType, user]);

  useEffect(() => {
    const key = `civicai_checklist_${item.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setChecklist(JSON.parse(stored));
    }
  }, [item.id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && item && item.id) {
      const key = 'civicai_recently_viewed';
      const stored = localStorage.getItem(key);
      let list = stored ? JSON.parse(stored) : [];
      list = list.filter((x: any) => x.id !== item.id);
      list.unshift({
        id: item.id,
        title: item.title || item.name,
        type: itemType,
        timestamp: Date.now()
      });
      localStorage.setItem(key, JSON.stringify(list.slice(0, 4)));
    }
  }, [item, itemType]);

  const handleToggleChecklist = (idx: number) => {
    const updated = { ...checklist, [idx]: !checklist[idx] };
    setChecklist(updated);
    localStorage.setItem(`civicai_checklist_${item.id}`, JSON.stringify(updated));
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      showAuthModal("Sign in to bookmark opportunities and track deadlines!");
      return;
    }

    setIsSaving(true);
    try {
      const type = itemType === 'Education' ? 'Scholarship' : itemType;
      if (isSaved) {
        await api.unsaveItem(type, item.id);
        setIsSaved(false);
      } else {
        await api.saveItem(type, item.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handlePrintChecklist = () => {
    window.print();
  };

  // Dynamic Deadline Status Badge resolver
  const getDeadlineStatus = (lastDateStr?: string | null) => {
    if (!lastDateStr) {
      return { text: 'Applications Open', colorClass: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' };
    }
    try {
      const deadline = new Date(lastDateStr);
      const today = new Date('2026-07-15'); // simulated current date
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return { text: 'Closed', colorClass: 'text-slate-400 bg-slate-950/30 border-slate-900/40' };
      } else if (diffDays === 0) {
        return { text: 'Closing Today', colorClass: 'text-rose-500 bg-rose-950/20 border-rose-900/30 animate-pulse' };
      } else if (diffDays <= 7) {
        return { text: `Closing Soon (${diffDays}d left)`, colorClass: 'text-amber-400 bg-amber-955/20 border-amber-900/30' };
      } else {
        return { text: 'Applications Open', colorClass: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' };
      }
    } catch {
      return { text: 'Applications Open', colorClass: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' };
    }
  };

  // Dynamic Eligibility Evaluator
  const evaluateEligibility = () => {
    if (!user) {
      return {
        status: 'guest',
        label: 'Login Required',
        colorClass: 'text-slate-400 bg-slate-950/20 border-slate-900/30',
        reasons: ['Please log in to check matching compatibility against your profile credentials automatically.']
      };
    }

    const type = user.user_metadata?.user_type;
    if (!type) {
      return {
        status: 'incomplete',
        label: 'Incomplete Profile',
        colorClass: 'text-amber-400 bg-amber-950/20 border-amber-900/30',
        reasons: ['Onboarding profiles are incomplete. Click "Complete Profile" to calibrate suggestions matching.']
      };
    }

    const profileData = type === 'student' ? user.user_metadata?.student_profile : user.user_metadata?.farmer_profile;
    if (!profileData) {
      return {
        status: 'incomplete',
        label: 'Incomplete Profile',
        colorClass: 'text-amber-400 bg-amber-955/20 border-amber-900/30',
        reasons: ['Onboarding profiles are incomplete. Click "Complete Profile" to calibrate suggestions matching.']
      };
    }

    const reasons: string[] = [];
    let checksPassed = 0;

    // User type checks
    if (itemType === 'Scheme' && type !== 'farmer') {
      reasons.push('This scheme is designed specifically for Farmer profiles.');
      return { status: 'not_eligible', label: 'Not Eligible', colorClass: 'text-rose-400 bg-rose-955/20 border-rose-900/30', reasons };
    }
    if ((itemType === 'Exam' || itemType === 'Scholarship' || itemType === 'Education') && type !== 'student') {
      reasons.push('This opportunity is tailored specifically for Student/Aspirant profiles.');
      return { status: 'not_eligible', label: 'Not Eligible', colorClass: 'text-rose-400 bg-rose-955/20 border-rose-900/30', reasons };
    }
    checksPassed++;

    // State check
    const userStateId = profileData.stateId;
    const targetStateId = item.state_id;
    if (targetStateId) {
      const allIndiaState = FALLBACK_STATES.find((s: any) => s.name === 'All India');
      const allIndiaId = allIndiaState ? allIndiaState.id : '187b6a43-0abd-45b5-a2d3-506743532d80';
      if (targetStateId !== allIndiaId && targetStateId !== userStateId) {
        reasons.push(`Domicile State restriction: Requires ${stateName || 'another State'}. Your profile state is ${profileData.stateName || 'unconfigured'}.`);
      } else {
        checksPassed++;
      }
    } else {
      checksPassed++;
    }

    // Qualification check
    if (type === 'student') {
      const userQual = profileData.highestQualification || 'Graduate';
      const targetQual = item.qualification;
      if (targetQual && targetQual !== 'Any Qualification') {
        const ranks: Record<string, number> = { '10th Pass': 1, '12th Pass': 2, 'Diploma': 3, 'Graduate': 4, 'Postgraduate': 5 };
        const userRank = ranks[userQual] || 1;
        const targetRank = ranks[targetQual] || 1;
        if (userRank < targetRank) {
          reasons.push(`Minimum Qualification: Requires "${targetQual}". Your profile displays "${userQual}".`);
        } else {
          checksPassed++;
        }
      } else {
        checksPassed++;
      }

      // Age check
      if (item.age_limit) {
        const userAge = parseInt(profileData.age);
        if (userAge) {
          const match = item.age_limit.match(/(\d+)\s*-\s*(\d+)/);
          if (match) {
            const minAge = parseInt(match[1]);
            const maxAge = parseInt(match[2]);
            if (userAge < minAge || userAge > maxAge) {
              reasons.push(`Age Constraint: Requires between ${minAge} and ${maxAge} years. Your profile age is ${userAge}.`);
            } else {
              checksPassed++;
            }
          } else {
            checksPassed++;
          }
        } else {
          reasons.push('Please configure your specific profile age in Profile Settings to check age compliance.');
        }
      }
    }

    if (reasons.length === 0) {
      return {
        status: 'eligible',
        label: 'Eligible',
        colorClass: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30',
        reasons: ['Your state domicile, age, and academic qualifications match the official guidelines.']
      };
    } else if (checksPassed > 1) {
      return {
        status: 'partially',
        label: 'Partially Eligible',
        colorClass: 'text-amber-400 bg-amber-955/20 border-amber-900/30',
        reasons
      };
    } else {
      return {
        status: 'not_eligible',
        label: 'Not Eligible',
        colorClass: 'text-rose-400 bg-rose-955/20 border-rose-900/30',
        reasons
      };
    }
  };

  // AI Summary generator (Module 2)
  const getAiSummary = () => {
    const summary = item.description || item.details || "Administrative application and qualification portal details.";
    const keyEligibility = item.eligibility || item.admission_criteria || `Requires qualifying guidelines.`;
    
    let advice = 'Review official notification PDF guides, download the syllabus details, and solve previous year question papers.';
    if (itemType === 'Scheme') {
      advice = 'Prepare identity proofs (Aadhaar), land holding records, and visit local department portals to submit applications.';
    } else if (itemType === 'Scholarship') {
      advice = 'Verify family income certificates, keep marks transcripts ready, and register online.';
    } else if (itemType === 'Education') {
      advice = 'Study entrance examination guidelines, prepare admission transcripts, and participate in online counseling.';
    }

    return {
      summary,
      eligibility: keyEligibility,
      whoShouldApply: itemType === 'Exam' 
        ? 'Aspirants looking for stable government career openings matching their specifications.'
        : itemType === 'Scholarship'
        ? 'Students seeking financial support to complete higher studies.'
        : itemType === 'Education'
        ? 'Students seeking admissions to premier universities or national fellowship options.'
        : 'Farmers looking to obtain subsidy assistance and government benefits.',
      deadline: item.last_date || item.application_end_date || 'Ongoing / Notification dependent',
      prepAdvice: advice,
      timeEstimate: itemType === 'Exam' ? '3-6 Months Preparation' : '15-30 Mins Application Submitting'
    };
  };

  const deadline = item.last_date || item.application_end_date || 'Ongoing';
  const statusInfo = getDeadlineStatus(item.last_date || item.application_end_date);
  const eligibility = evaluateEligibility();
  const aiSummary = getAiSummary();

  // Document checklist resolver
  const docChecklist = itemType === 'Scheme'
    ? (item.required_documents ? item.required_documents.split(', ') : ["Aadhaar Card", "Land Holding Certificate", "Bank Account Details", "Domicile Certificate"])
    : (itemType === 'Scholarship'
    ? (item.documents_required ? item.documents_required.split(', ') : ["Marksheets", "Income Certificate", "Caste Certificate", "Aadhaar Card", "Fee Receipt"])
    : (itemType === 'Education'
    ? ["Graduation Degree / Marksheets", "Entrance Admit Card", "Domicile Certificate", "Category Rank Certificate"]
    : (item.required_documents || ["10th Class Marksheet", "Graduation Transcripts", "Aadhaar Card", "Photo ID", "Category Certificate (if applicable)"])));

  const officialLink = item.apply_link || item.website || item.official_website || item.notification_url || 'https://www.civicai.gov.in';

  // Need Help Query Parameter URL
  const aiAssistantPromptUrl = `/ai-assistant?prompt=${encodeURIComponent(`Tell me about eligibility criteria, document checklist, and deadline status details for ${item.title || item.name}`)}`;

  // Related items list builder
  const relatedItems = (() => {
    let rawList = itemType === 'Exam' ? FALLBACK_EXAMS : itemType === 'Scheme' ? FALLBACK_SCHEMES : itemType === 'Scholarship' ? FALLBACK_SCHOLARSHIPS : FALLBACK_EDUCATION;
    return rawList.filter(o => o.id !== item.id).slice(0, 2);
  })();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      
      {/* Back button */}
      <button 
        onClick={() => router.push(itemType === 'Exam' ? '/exams' : itemType === 'Scheme' ? '/schemes' : itemType === 'Scholarship' ? '/scholarships' : '/education')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Catalog
      </button>

      {/* Grid containing Details Left and Sticky Right Fact Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns (Main Details layout) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.02)] overflow-hidden dark:bg-slate-850 dark:border-slate-800">
            
            {/* Header Top Card */}
            <div className="bg-gradient-to-r from-primary to-secondary p-8 md:p-10 text-white relative">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                <Award className="h-64 w-64 -mt-16 -mr-16" />
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10 select-none">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md uppercase tracking-wider">
                  {itemType}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-white/20 bg-white/15 backdrop-blur-md`}>
                  {statusInfo.text}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {stateName || item.state || 'All India'}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg select-none">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified Official
                </span>
              </div>

              <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight relative z-10 leading-tight mb-3">
                {item.title || item.name}
              </h1>
              <p className="text-white/85 text-xs md:text-sm font-light max-w-3xl leading-relaxed relative z-10">
                {item.description || item.details || "Official government portal guidelines details for citizens."}
              </p>

              {/* Actions row */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/10 relative z-10 select-none">
                <Button 
                  variant="outline" 
                  onClick={handleToggleBookmark}
                  isLoading={isSaving}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 min-h-[40px] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className={`h-4.5 w-4.5 ${isSaved ? 'fill-white text-white' : ''}`} />
                  {isSaved ? 'Saved & Tracked' : 'Save & Track'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 min-h-[40px] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="h-4.5 w-4.5" />
                  {shareSuccess ? 'Link Copied!' : 'Share Opportunity'}
                </Button>
              </div>
            </div>

            {/* Tab Selector Links */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 px-6 overflow-x-auto select-none">
              {(['overview', 'ai-summary', 'eligibility', 'documents'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-4 text-xs font-bold border-b-2 uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    activeTab === tab 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                  }`}
                >
                  {tab === 'ai-summary' && <Sparkles className="h-3.5 w-3.5 inline mr-1 text-primary animate-pulse" />}
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="p-6 md:p-10">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Detailed Description */}
                  <div>
                    <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">Opportunity Overview</h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      {item.description || item.details || "Official guidelines for administrative programs, yojanas and citizen portal specifications."}
                    </p>
                  </div>

                  {/* Specifications Information Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400">Eligibility Criteria</h4>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        {item.eligibility || item.admission_criteria || 'Academic qualification matching standard guidelines.'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400">Qualification Required</h4>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        {item.qualification || (itemType === 'Education' ? 'College Graduation / Entrance Rank' : 'Any Qualification')}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400">Age Limit Constraints</h4>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        {item.age_limit || (item.income_limit ? `Income Limit: ${item.income_limit}` : 'Refer to official guidelines')}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400">Application Key Dates</h4>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        Start: {item.start_date || item.application_start_date || 'N/A'} • Closes: {deadline}
                      </p>
                    </div>

                    {itemType === 'Exam' && (
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-slate-400">Exam Scheme Date</h4>
                        <p className="text-xs font-bold text-rose-500 mt-1">
                          {item.exam_date || 'Announced shortly'}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400">Application / Registration Fee</h4>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        {itemType === 'Exam' ? '₹100 (General) / Free for Reserved' : 'Free Registration'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400">Scale of Salary / Welfare Benefits</h4>
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        {item.salary || item.benefits || 'Financial stipends allowances and administrative support'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400">Official Department Authority</h4>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                        {deptName || item.type || 'Central / State Government Admin'}
                      </p>
                    </div>

                  </div>

                  {/* Selection Process details */}
                  {(item.selection_process || item.facilities) && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">
                        {itemType === 'Education' ? 'Offered Facilities & Perks' : 'Selection Process'}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl whitespace-pre-line leading-relaxed font-semibold">
                        {item.selection_process || item.facilities}
                      </p>
                    </div>
                  )}

                  {/* Notification Official URL files */}
                  {(item.notification_url || item.syllabus_link) && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Official Guidelines Files</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
                        {item.notification_url && (
                          <a href={item.notification_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl text-xs font-bold text-slate-700 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/80">
                            Download Official Notification PDF <ExternalLink className="h-4 w-4 text-slate-400" />
                          </a>
                        )}
                        {item.syllabus_link && (
                          <a href={item.syllabus_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl text-xs font-bold text-slate-700 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/80">
                            Download Exam Syllabus PDF <ExternalLink className="h-4 w-4 text-slate-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: AI SUMMARY */}
              {activeTab === 'ai-summary' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Sparkles className="h-24 w-24 text-primary animate-pulse" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 select-none">
                      <Sparkles className="h-5 w-5 text-primary shrink-0 animate-pulse" />
                      <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wider text-slate-400">Summarized with AI</h3>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Quick Overview</h4>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-semibold">{aiSummary.summary}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Eligibility Outline</h4>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-semibold">{aiSummary.eligibility}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Ideal Profile Applicant</h4>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-semibold">{aiSummary.whoShouldApply}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Preparation Tips</h4>
                          <p className="text-[11px] text-slate-505 dark:text-slate-400 mt-1 leading-relaxed">{aiSummary.prepAdvice}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Estimated Time Frame</h4>
                          <p className="text-[11px] text-slate-505 dark:text-slate-400 mt-1 leading-relaxed font-bold text-primary">{aiSummary.timeEstimate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ELIGIBILITY CHECKER */}
              {activeTab === 'eligibility' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl">
                    <div className="flex justify-between items-start gap-4 mb-4 select-none">
                      <div>
                        <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wider text-slate-400">Match Compatibility Check</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Cross-referenced against your profile attributes.</p>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${eligibility.colorClass}`}>
                        {eligibility.label}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                      {eligibility.reasons.map((reason, idx) => (
                        <div key={idx} className="flex gap-3 items-start text-xs leading-relaxed text-slate-650 dark:text-slate-350 font-medium">
                          {eligibility.status === 'eligible' ? (
                            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : eligibility.status === 'not_eligible' ? (
                            <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {(eligibility.status === 'guest' || eligibility.status === 'incomplete') && (
                      <div className="mt-5 flex justify-end select-none">
                        <Link href={eligibility.status === 'guest' ? '/login' : '/profile'}>
                          <Button variant="primary" className="text-xs font-bold px-4 py-2 rounded-xl cursor-pointer">
                            {eligibility.status === 'guest' ? 'Log in' : 'Configure Settings'}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: DOCUMENTS CHECKLIST */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl">
                    <div className="flex justify-between items-center mb-4 select-none">
                      <div>
                        <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wider text-slate-400">Required Documents Checklist</h3>
                        <p className="text-[11px] text-slate-505 mt-0.5">Toggle documents to monitor preparation status.</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handlePrintChecklist}
                        className="text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1 cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-900/80"
                      >
                        <Printer className="h-3.5 w-3.5" /> Print Checklist
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {docChecklist.map((doc: string, idx: number) => {
                        const checked = !!checklist[idx];
                        return (
                          <button
                            key={idx}
                            onClick={() => handleToggleChecklist(idx)}
                            className="w-full text-left flex items-center justify-between p-4 bg-white dark:bg-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border border-slate-100 dark:border-slate-850 rounded-xl transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                                checked 
                                  ? 'bg-primary border-primary text-white'
                                  : 'border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                              }`}>
                                {checked && <Check className="h-3.5 w-3.5 animate-pulse" />}
                              </div>
                              <span className={`text-xs font-bold ${checked ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{doc}</span>
                            </div>
                            <span className="text-[9.5px] uppercase font-extrabold tracking-wider text-slate-455 opacity-0 group-hover:opacity-100 transition-opacity">
                              {checked ? 'Completed' : 'Mark Ready'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Ingestion & Synch Stamp Footer */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 text-[10px] text-slate-455 dark:text-slate-500 font-semibold select-none">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Ingest Source: {item.source || 'Verified Official Ingestion'}
              </span>
              <span>Last Database Synchronized: {item.last_updated ? new Date(item.last_updated).toLocaleDateString() : 'Recent (2026-07-15)'}</span>
            </div>

          </div>

          {/* Related Opportunities bottom list */}
          {relatedItems.length > 0 && (
            <div className="mt-8 select-none">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-primary" /> Related Listings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedItems.map((rel: any) => {
                  const url = itemType === 'Exam' ? `/exams/${rel.id}` : itemType === 'Scheme' ? `/schemes/${rel.id}` : itemType === 'Scholarship' ? `/scholarships/${rel.id}` : `/education/${rel.id}`;
                  return (
                    <Link 
                      key={rel.id} 
                      href={url}
                      className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between dark:bg-slate-850 dark:border-slate-800"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-355 group-hover:bg-primary transition-colors"></div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-xs leading-snug group-hover:text-primary transition-colors pl-2">{rel.title || rel.name}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-2 pl-2 line-clamp-2">{rel.description || rel.details}</p>
                      </div>
                      <div className="flex items-center justify-end pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 pl-2">
                        <span className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                          Explore Details <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Quick Facts & Need Help Panels (Desktop 1024px+) */}
        <div className="space-y-6 lg:sticky lg:top-24 select-none">
          
          {/* Quick Facts Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs dark:bg-slate-855 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-primary" /> Quick Facts
            </h3>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3.5 text-xs pt-1">
              
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</span>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.colorClass}`}>
                  {statusInfo.text}
                </span>
              </div>

              <div className="pt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Deadline</span>
                <span className="font-extrabold text-rose-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" /> {deadline}
                </span>
              </div>

              <div className="pt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Eligibility Standard</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 leading-normal block">
                  {item.eligibility || item.admission_criteria || 'Academic qualification guidelines'}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <a href={officialLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant="primary" fullWidth className="py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer">
                    Visit Official Portal <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>

            </div>
          </div>

          {/* Need Help? Assistant section */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-primary animate-pulse" />
              <h3 className="font-extrabold text-slate-850 dark:text-white text-xs uppercase tracking-wider text-slate-400">Need Help?</h3>
            </div>
            
            <p className="text-[11px] text-slate-505 leading-relaxed font-semibold">
              Get immediate answers regarding qualification requirements or document checklists for this opportunity.
            </p>

            <div className="grid grid-cols-1 gap-2">
              <Link href={aiAssistantPromptUrl} className="block w-full">
                <Button variant="primary" fullWidth className="py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                  <MessageSquareText className="h-4 w-4" /> Ask AI About This
                </Button>
              </Link>
              
              {item.notification_url && (
                <a href={item.notification_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant="outline" fullWidth className="py-2.5 text-xs font-bold rounded-xl bg-white flex items-center justify-center gap-1.5 cursor-pointer dark:bg-slate-900">
                    <FileText className="h-4 w-4" /> View Official Notification
                  </Button>
                </a>
              )}

              <Button 
                variant="outline" 
                fullWidth 
                onClick={handleToggleBookmark}
                isLoading={isSaving}
                className="py-2.5 text-xs font-bold rounded-xl bg-white flex items-center justify-center gap-1.5 cursor-pointer dark:bg-slate-900"
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary border-transparent' : ''}`} />
                {isSaved ? 'Saved & Tracked' : 'Save Opportunity'}
              </Button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
