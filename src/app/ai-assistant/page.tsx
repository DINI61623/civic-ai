'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Send, Bot, User, ShieldAlert, Sparkles, ChevronRight, 
  MapPin, Calendar, Clock, Landmark, ExternalLink, Info, 
  BookOpen, FileText, CheckCircle, GraduationCap, RefreshCw, X, ArrowRight, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  FALLBACK_STATES, FALLBACK_DEPARTMENTS, FALLBACK_EXAMS, FALLBACK_SCHEMES, FALLBACK_SCHOLARSHIPS, FALLBACK_EDUCATION,
  Exam, Scheme, Scholarship, State, Department 
} from '@/lib/fallbackData';
import { 
  ConversationFilters, parseUserQuery, filterOpportunities, getFallbackRecommendations, getAIResponseText
} from '@/lib/assistantLogic';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isOpportunityFeed?: boolean;
  opportunities?: {
    exams: Exam[];
    schemes: Scheme[];
    scholarships: Scholarship[];
    education: any[];
  };
  filtersApplied?: ConversationFilters;
  isDefenceFallback?: boolean;
}

function AIAssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! I am your AI Government Career Advisor. I can help you discover which government exams, schemes, scholarships, and higher education programs you are eligible for.\n\nTell me about your qualification, age, state, or what career fields you are interested in!"
    }
  ]);
  const [input, setInput] = useState('');
  const [activeFilters, setActiveFilters] = useState<ConversationFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<{
    type: 'exam' | 'scheme' | 'scholarship' | 'education';
    item: any;
  } | null>(null);

  // Cache database data
  const [dbData, setDbData] = useState<{
    exams: Exam[];
    schemes: Scheme[];
    scholarships: Scholarship[];
    education: any[];
    states: State[];
    departments: Department[];
  }>({
    exams: [],
    schemes: [],
    scholarships: [],
    education: [],
    states: [],
    departments: []
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [
          { data: examsData },
          { data: schemesData },
          { data: scholarshipsData },
          { data: statesData },
          { data: deptsData },
          { data: eduData }
        ] = await Promise.all([
          supabase.from('exams').select('*'),
          supabase.from('schemes').select('*'),
          supabase.from('scholarships').select('*'),
          supabase.from('states').select('*'),
          supabase.from('departments').select('*'),
          supabase.from('education').select('*')
        ]);

        const statesList = statesData && statesData.length > 0 ? statesData : FALLBACK_STATES;
        const deptsList = deptsData && deptsData.length > 0 ? deptsData : FALLBACK_DEPARTMENTS;
        
        const examsList = (examsData && examsData.length > 0 ? examsData : FALLBACK_EXAMS).map(exam => {
          const fallback = FALLBACK_EXAMS.find(fe => fe.title.toLowerCase().split(' ')[0] === exam.title.toLowerCase().split(' ')[0]);
          return { ...fallback, ...exam };
        });

        const schemesList = (schemesData && schemesData.length > 0 ? schemesData : FALLBACK_SCHEMES).map(scheme => {
          const fallback = FALLBACK_SCHEMES.find(fs => fs.title.toLowerCase().split(' ')[0] === scheme.title.toLowerCase().split(' ')[0]);
          return { ...fallback, ...scheme };
        });

        const scholarshipsList = (scholarshipsData && scholarshipsData.length > 0 ? scholarshipsData : FALLBACK_SCHOLARSHIPS).map(s => {
          const fallback = FALLBACK_SCHOLARSHIPS.find(fs => fs.title.toLowerCase().split(' ')[0] === s.title.toLowerCase().split(' ')[0]);
          return { ...fallback, ...s };
        });

        const eduList = (eduData && eduData.length > 0 ? eduData : FALLBACK_EDUCATION).map(ed => {
          const fallback = FALLBACK_EDUCATION.find(fe => fe.name.toLowerCase().split(' ')[0] === ed.title?.toLowerCase().split(' ')[0]);
          return {
            ...fallback,
            ...ed,
            name: ed.title || ed.name || fallback?.name
          };
        });

        setDbData({
          exams: examsList,
          schemes: schemesList,
          scholarships: scholarshipsList,
          education: eduList,
          states: statesList,
          departments: deptsList
        });
      } catch (err) {
        console.error('Supabase query failed, falling back to local database replica:', err);
        setDbData({
          exams: FALLBACK_EXAMS,
          schemes: FALLBACK_SCHEMES,
          scholarships: FALLBACK_SCHOLARSHIPS,
          education: FALLBACK_EDUCATION,
          states: FALLBACK_STATES,
          departments: FALLBACK_DEPARTMENTS
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Strict scrolling only when a new message actually arrives
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const submitMessage = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const updatedFilters = parseUserQuery(queryText, activeFilters, dbData.states);
      setActiveFilters(updatedFilters);

      const filterResult = filterOpportunities(updatedFilters, dbData);

      let replyContent = '';
      let isOpportunityFeed = false;
      let isDefenceFallback = false;
      let replyOpportunities = { exams: [], schemes: [], scholarships: [], education: [] } as any;

      if (queryText.toLowerCase().includes('clear') || queryText.toLowerCase().includes('reset')) {
        replyContent = "I have reset your profile filters. Let's start fresh! Tell me your qualification, age, or state.";
        setActiveFilters({});
      } else if (filterResult.isDefenceQuery) {
        isDefenceFallback = true;
        const recommendations = getFallbackRecommendations(updatedFilters, dbData);
        const count = recommendations.length;
        replyContent = getAIResponseText(queryText, updatedFilters, count);
        replyOpportunities = {
          exams: recommendations,
          schemes: [],
          scholarships: [],
          education: []
        };
        isOpportunityFeed = true;
      } else if (
        filterResult.exams.length === 0 && 
        filterResult.schemes.length === 0 && 
        filterResult.scholarships.length === 0 &&
        filterResult.education.length === 0
      ) {
        const recommendations = getFallbackRecommendations(updatedFilters, dbData);
        replyContent = `Based on your criteria (Qualification: ${updatedFilters.qualification || 'Any'}, State: ${updatedFilters.stateName || 'All India'}, Age: ${updatedFilters.age || 'Any'}), I couldn't find an exact matching opportunity in the database.\n\nHowever, here are similar premium notifications that you might be eligible for:`;
        replyOpportunities = {
          exams: recommendations,
          schemes: [],
          scholarships: [],
          education: []
        };
        isOpportunityFeed = true;
      } else {
        isOpportunityFeed = true;
        replyOpportunities = {
          exams: filterResult.exams,
          schemes: filterResult.schemes,
          scholarships: filterResult.scholarships,
          education: filterResult.education
        };

        const count = filterResult.exams.length + filterResult.schemes.length + filterResult.scholarships.length + filterResult.education.length;
        replyContent = getAIResponseText(queryText, updatedFilters, count);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: replyContent,
        isOpportunityFeed,
        opportunities: replyOpportunities,
        filtersApplied: updatedFilters,
        isDefenceFallback
      }]);
      setIsLoading(false);
    }, 800);
  };

  // Run initial query on mount when database data is loaded
  useEffect(() => {
    if (initialQuery && dbData.exams.length > 0 && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      submitMessage(initialQuery);
    }
  }, [initialQuery, dbData]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(input);
  };

  const handleSuggestionClick = (promptText: string) => {
    submitMessage(promptText);
  };

  const getOpportunityStatus = (lastDateStr: string | null) => {
    if (!lastDateStr) return { label: 'Open', color: 'bg-green-50 text-green-700 border-green-200' };
    const lastDate = new Date(lastDateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    lastDate.setHours(0,0,0,0);

    if (lastDate < today) {
      return { label: 'Closed', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }

    const diffDays = Math.ceil(Math.abs(lastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return { label: `Closes in ${diffDays}d`, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }

    return { label: 'Open', color: 'bg-green-50 text-green-700 border-green-200' };
  };

  // Render assistant text with bold formatting and list items
  const formatMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let cleanLine = line.trim();
      if (!cleanLine) return <div key={idx} className="h-2" />;

      if (cleanLine.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-extrabold text-primary mt-3 mb-1">{parseBoldText(cleanLine.substring(4))}</h4>;
      }
      if (cleanLine.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-black text-foreground mt-4 mb-2">{parseBoldText(cleanLine.substring(3))}</h3>;
      }

      const isBulletList = cleanLine.startsWith('• ') || cleanLine.startsWith('- ') || cleanLine.startsWith('* ');
      const isNumList = /^\d+\.\s/.test(cleanLine);

      if (isBulletList) {
        const listContent = cleanLine.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 pl-4 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
            <span className="text-slate-700 text-sm leading-relaxed">{parseBoldText(listContent)}</span>
          </div>
        );
      }

      if (isNumList) {
        const match = cleanLine.match(/^(\d+\.)\s(.*)/);
        if (match) {
          const num = match[1];
          const listContent = match[2];
          return (
            <div key={idx} className="flex items-start gap-2 pl-4 mt-1.5">
              <span className="font-extrabold text-primary text-sm shrink-0">{num}</span>
              <span className="text-slate-700 text-sm leading-relaxed">{parseBoldText(listContent)}</span>
            </div>
          );
        }
      }

      return (
        <p key={idx} className="text-slate-700 text-sm leading-relaxed mt-1">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      return index % 2 === 1 ? <strong key={index} className="font-extrabold text-slate-900">{part}</strong> : part;
    });
  };

  const demoPrompts = [
    { text: "I'm a B.Tech student", label: "B.Tech Guide" },
    { text: "Which exams am I eligible for?", label: "Eligible Exams" },
    { text: "Scholarships after Degree", label: "Scholarships after Degree" },
    { text: "Government jobs after Diploma", label: "Jobs after Diploma" },
    { text: "Engineering scholarships", label: "Engineering Scholarships" },
    { text: "Central Government Jobs", label: "Central Jobs" },
    { text: "UPSC after Engineering", label: "UPSC after Engineering" }
  ];

  return (
    <div className="flex-1 bg-background relative overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      
      {/* Mobile-only collapsed profile header banner */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-6 py-3.5 shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4.5 w-4.5 text-primary" />
          <span className="text-xs font-bold text-slate-700">
            {activeFilters.qualification || 'No qualification set'} • {activeFilters.stateName || 'All India'}
          </span>
        </div>
        <button 
          onClick={() => setIsProfileSidebarOpen(!isProfileSidebarOpen)}
          className="text-xs font-bold text-primary hover:text-primary/95 flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-slate-100/50 py-1.5 px-3 rounded-lg border border-slate-200 transition-colors"
        >
          {isProfileSidebarOpen ? 'Hide Profile' : 'View Profile'}
          <ChevronRight className={`h-3 w-3 transform transition-transform ${isProfileSidebarOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Collapsible Mobile Profile Content Drawer */}
      <AnimatePresence>
        {isProfileSidebarOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden w-full bg-white border-b border-slate-200 px-6 py-5 shrink-0 z-20 shadow-md flex flex-col gap-4 overflow-y-auto max-h-[300px]"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">Qualification</div>
                <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {activeFilters.qualification || 'Not set'}
                </span>
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">Domicile State</div>
                <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {activeFilters.stateName || 'All India'}
                </span>
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">Category</div>
                <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {activeFilters.category || 'General'}
                </span>
              </div>
              <div>
                <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">Sector Interest</div>
                <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded text-wrap">
                  {activeFilters.interest || 'All Sectors'}
                </span>
              </div>
            </div>
            {Object.keys(activeFilters).length > 0 && (
              <button 
                onClick={() => { submitMessage("clear"); setIsProfileSidebarOpen(false); }}
                className="w-full text-xs font-bold text-slate-500 hover:text-danger bg-slate-50 border border-slate-200 py-2 rounded-xl transition-colors cursor-pointer text-center"
              >
                Reset Chat Profile Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Candidate Profile (Desktop layout) */}
      <div className="hidden lg:flex w-80 bg-white border-r border-border p-6 flex-col gap-6 relative z-10 shrink-0 h-full overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <h2 className="font-extrabold text-lg text-foreground tracking-tight">Active Candidate Profile</h2>
          </div>
          <p className="text-xs text-foreground-muted">The AI maps your inputs dynamically to match criteria from official databases.</p>
        </div>

        <div className="flex flex-col gap-4 bg-slate-50 border border-border p-5 rounded-2xl">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Qualification</div>
            {activeFilters.qualification ? (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg border border-primary/20">
                <GraduationCap className="h-3.5 w-3.5" /> {activeFilters.qualification}
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-400 italic">Not specified</span>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Age Limit</div>
            {activeFilters.age ? (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200">
                <Clock className="h-3.5 w-3.5" /> {activeFilters.age} Years Old
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-400 italic">Not specified</span>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Domicile State</div>
            {activeFilters.stateName ? (
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-200">
                <MapPin className="h-3.5 w-3.5" /> {activeFilters.stateName}
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-400 italic">All India</span>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Category</div>
            {activeFilters.category ? (
              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-200">
                {activeFilters.category}
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-400 italic">General</span>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Target Fields</div>
            {activeFilters.interest ? (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200">
                {activeFilters.interest}
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-400 italic">All Sectors</span>
            )}
          </div>
        </div>

        {Object.keys(activeFilters).length > 0 && (
          <button 
            onClick={() => submitMessage("clear")} 
            className="w-full text-xs font-bold text-slate-500 hover:text-danger bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Reset Profile Filters
          </button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
        
        {/* Banner */}
        <div className="bg-amber-50 border-b border-amber-100/50 p-3 text-xs font-medium text-amber-700 text-center flex items-center justify-center gap-2 shrink-0">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Always verify exam pattern details & deadlines with official government notification URLs before applying.
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-3 max-w-[85%] sm:max-w-[75%]`}>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed border ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white border-primary rounded-tr-sm' 
                      : 'bg-white text-slate-800 border-slate-200 rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      formatMessageContent(msg.content)
                    )}
                  </div>

                  {/* Render inline cards list */}
                  {msg.role === 'assistant' && msg.isOpportunityFeed && msg.opportunities && (
                    <div className="grid grid-cols-1 gap-5 w-full mt-2">
                      {/* 1. Render Exams */}
                      {msg.opportunities.exams && msg.opportunities.exams.map((exam) => {
                        const status = getOpportunityStatus(exam.last_date);
                        const dept = dbData.departments.find(d => d.id === exam.department_id);
                        const state = dbData.states.find(s => s.id === exam.state_id);

                        return (
                          <div 
                            key={exam.id} 
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all w-full flex flex-col gap-4 relative overflow-hidden group text-left"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                            
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${status.color}`}>
                                    {status.label}
                                  </span>
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5" /> {state?.name || 'All India'}
                                  </span>
                                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                    {dept?.name ? dept.name.split(' (')[0] : 'Govt Department'}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-foreground text-base group-hover:text-primary transition-colors">
                                  {exam.title}
                                </h3>
                              </div>
                            </div>

                            {exam.description && (
                              <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                                {exam.description}
                              </p>
                            )}

                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <div>
                                <div className="text-[9px] uppercase font-bold text-slate-400">Eligibility</div>
                                <div className="text-[11px] font-bold text-slate-700 truncate">{exam.qualification}</div>
                              </div>
                              <div>
                                <div className="text-[9px] uppercase font-bold text-slate-400">Age Limit</div>
                                <div className="text-[11px] font-bold text-slate-700 truncate">{exam.age_limit}</div>
                              </div>
                              <div>
                                <div className="text-[9px] uppercase font-bold text-slate-400">Last Date</div>
                                <div className="text-[11px] font-bold text-rose-600 truncate">
                                  {exam.last_date ? new Date(exam.last_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'Always Open'}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mt-auto border-t border-slate-100">
                              <div className="flex gap-2">
                                {exam.official_website && (
                                  <a 
                                    href={exam.official_website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-2 border border-slate-200 hover:border-primary text-slate-500 hover:text-primary rounded-xl transition-colors"
                                    title="Official Website"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                <button 
                                  onClick={() => setSelectedOpportunity({ type: 'exam', item: exam })}
                                  className="text-xs font-bold text-slate-600 hover:text-primary bg-slate-100 hover:bg-slate-200/50 py-2 px-4 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Info className="h-3.5 w-3.5" /> Details
                                </button>
                              </div>

                              {exam.apply_link && status.label !== 'Closed' && (
                                <a 
                                  href={exam.apply_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs font-bold bg-primary hover:bg-primary/95 text-white py-2 px-5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1"
                                >
                                  Apply Now <ChevronRight className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* 2. Render Schemes */}
                      {msg.opportunities.schemes && msg.opportunities.schemes.map((scheme) => {
                        const state = dbData.states.find(s => s.id === scheme.state_id);

                        return (
                          <div 
                            key={scheme.id} 
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all w-full flex flex-col gap-4 relative overflow-hidden group text-left"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                                    Scheme
                                  </span>
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5" /> {state?.name || 'All India'}
                                  </span>
                                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                    {scheme.category}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-foreground text-base group-hover:text-emerald-600 transition-colors">
                                  {scheme.title}
                                </h3>
                              </div>
                            </div>

                            {scheme.description && (
                              <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                                {scheme.description}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                <div className="text-[9px] uppercase font-bold text-slate-400">Benefits</div>
                                <div className="text-[11px] font-semibold text-slate-700 truncate">{scheme.benefits}</div>
                              </div>
                              <div>
                                <div className="text-[9px] uppercase font-bold text-slate-400">Eligibility</div>
                                <div className="text-[11px] font-semibold text-slate-700 truncate">{scheme.eligibility}</div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mt-auto border-t border-slate-100">
                              <div className="flex gap-2">
                                {scheme.official_website && (
                                  <a 
                                    href={scheme.official_website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-2 border border-slate-200 hover:border-emerald-500 text-slate-500 hover:text-emerald-500 rounded-xl transition-colors"
                                    title="Official Website"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                <button 
                                  onClick={() => setSelectedOpportunity({ type: 'scheme', item: scheme })}
                                  className="text-xs font-bold text-slate-600 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200/50 py-2 px-4 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Info className="h-3.5 w-3.5" /> Details
                                </button>
                              </div>

                              {scheme.apply_link && (
                                <a 
                                  href={scheme.apply_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-600/95 text-white py-2 px-5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1"
                                >
                                  Apply Now <ChevronRight className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* 3. Render Scholarships */}
                      {msg.opportunities.scholarships && msg.opportunities.scholarships.map((scholarship) => {
                        const state = dbData.states.find(s => s.id === scholarship.state_id);
                        const status = getOpportunityStatus(scholarship.last_date);

                        return (
                          <div 
                            key={scholarship.id} 
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all w-full flex flex-col gap-4 relative overflow-hidden group text-left"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>

                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${status.color}`}>
                                    {status.label}
                                  </span>
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5" /> {state?.name || 'All India'}
                                  </span>
                                  <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-100">
                                    Scholarship ({scholarship.type})
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-foreground text-base group-hover:text-purple-600 transition-colors">
                                  {scholarship.title}
                                </h3>
                              </div>
                            </div>

                            {scholarship.description && (
                              <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                                {scholarship.description}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                <div className="text-[9px] uppercase font-bold text-slate-400">Eligibility</div>
                                <div className="text-[11px] font-semibold text-slate-700 truncate">{scholarship.eligibility}</div>
                              </div>
                              <div>
                                <div className="text-[9px] uppercase font-bold text-slate-400">Deadline</div>
                                <div className="text-[11px] font-bold text-rose-600 truncate">
                                  {scholarship.last_date ? new Date(scholarship.last_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'Always Open'}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mt-auto border-t border-slate-100">
                              <div className="flex gap-2">
                                {scholarship.official_website && (
                                  <a 
                                    href={scholarship.official_website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-2 border border-slate-200 hover:border-purple-500 text-slate-500 hover:text-purple-500 rounded-xl transition-colors"
                                    title="Official Website"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                <button 
                                  onClick={() => setSelectedOpportunity({ type: 'scholarship', item: scholarship })}
                                  className="text-xs font-bold text-slate-600 hover:text-purple-600 bg-slate-100 hover:bg-slate-200/50 py-2 px-4 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Info className="h-3.5 w-3.5" /> Details
                                </button>
                              </div>

                              {scholarship.apply_link && status.label !== 'Closed' && (
                                <a 
                                  href={scholarship.apply_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs font-bold bg-purple-600 hover:bg-purple-600/95 text-white py-2 px-5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1"
                                >
                                  Apply Now <ChevronRight className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* 4. Render Higher Education */}
                      {msg.opportunities.education && msg.opportunities.education.map((edu) => {
                        const state = dbData.states.find(s => s.name === edu.state || s.id === edu.state_id);

                        return (
                          <div 
                            key={edu.id} 
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all w-full flex flex-col gap-4 relative overflow-hidden group text-left"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>

                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100">
                                    Higher Education
                                  </span>
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5" /> {state?.name || edu.state || 'All India'}
                                  </span>
                                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                    {edu.type}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-foreground text-base group-hover:text-indigo-600 transition-colors">
                                  {edu.name || edu.title}
                                </h3>
                              </div>
                            </div>

                            {edu.details && (
                              <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                                {edu.details}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mt-auto border-t border-slate-100">
                              <div className="flex gap-2">
                                {edu.website && (
                                  <a 
                                    href={edu.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-2 border border-slate-200 hover:border-indigo-500 text-slate-500 hover:text-indigo-500 rounded-xl transition-colors"
                                    title="Official Website"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                <button 
                                  onClick={() => setSelectedOpportunity({ type: 'education', item: edu })}
                                  className="text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/50 py-2 px-4 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Info className="h-3.5 w-3.5" /> Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}

            {/* Loader */}
            {isLoading && (
              <div className="flex gap-3 w-full justify-start">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm shrink-0">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input box - fixed at bottom */}
        <div className="p-6 border-t border-border bg-white relative z-10 shrink-0">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 px-1 -mx-1 scrollbar-thin">
              {demoPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(prompt.text)}
                  className="shrink-0 text-xs bg-slate-100 hover:bg-slate-200/60 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-primary py-2 px-3.5 rounded-xl transition-all cursor-pointer font-medium"
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-3 relative">
              <input 
                type="text" 
                placeholder="Ask your Career Advisor: e.g. What government jobs are available after Diploma?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl pl-5 pr-14 py-3.5 text-sm outline-none transition-all shadow-inner"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/95 disabled:bg-slate-200 text-white w-11 flex items-center justify-center rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Details Slide-over Modal Drawer */}
      <AnimatePresence>
        {selectedOpportunity && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOpportunity(null)}
              className="fixed inset-0 bg-black z-40"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 border-l border-border flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-slate-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl text-white ${
                    selectedOpportunity.type === 'exam' ? 'bg-primary' :
                    selectedOpportunity.type === 'scheme' ? 'bg-emerald-600' :
                    selectedOpportunity.type === 'scholarship' ? 'bg-purple-600' : 'bg-indigo-600'
                  }`}>
                    {selectedOpportunity.type === 'exam' ? <BookOpen className="h-5 w-5" /> : 
                     selectedOpportunity.type === 'scheme' ? <Landmark className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-base tracking-tight leading-tight">
                      Opportunity Details
                    </h3>
                    <span className="text-xs text-foreground-muted font-bold capitalize">
                      {selectedOpportunity.type} Overview
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOpportunity(null)} 
                  className="p-1.5 hover:bg-slate-200/50 border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable details content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground leading-snug">
                    {selectedOpportunity.item.title || selectedOpportunity.item.name}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  {selectedOpportunity.type === 'exam' && (
                    <>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Qualification</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.qualification}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Age Criteria</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.age_limit}</div>
                      </div>
                      <div className="mt-2">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Estimated Salary</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.salary || 'Varies'}</div>
                      </div>
                      <div className="mt-2">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total Vacancies</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.vacancies || 'Notification Dependent'}</div>
                      </div>
                    </>
                  )}

                  {selectedOpportunity.type === 'scheme' && (
                    <>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Target Benefits</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.benefits}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Eligibility Category</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.category}</div>
                      </div>
                      <div className="mt-2">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Ministry/Authority</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.ministry || 'State Authority'}</div>
                      </div>
                    </>
                  )}

                  {selectedOpportunity.type === 'scholarship' && (
                    <>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Scholarship Type</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.type}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Application Limit</div>
                        <div className="text-xs font-extrabold text-rose-600 font-bold">
                          {selectedOpportunity.item.last_date ? new Date(selectedOpportunity.item.last_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div className="mt-2 text-wrap col-span-2">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Income Limit</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.income_limit || 'Varies by applicant'}</div>
                      </div>
                    </>
                  )}

                  {selectedOpportunity.type === 'education' && (
                    <>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Education Type</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.type}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Jurisdiction</div>
                        <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.state || 'All India'}</div>
                      </div>
                      {selectedOpportunity.item.programs && (
                        <div className="mt-2 col-span-2">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Programs Offered</div>
                          <div className="text-xs font-extrabold text-foreground">{selectedOpportunity.item.programs}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2">Description</h4>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {selectedOpportunity.item.description || selectedOpportunity.item.details || "Official government portal description of requirements, guidelines, and candidate registration information."}
                  </p>
                </div>

                {selectedOpportunity.type === 'exam' && (
                  <>
                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" /> Selection Process
                      </h4>
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl whitespace-pre-line leading-relaxed">
                        {selectedOpportunity.item.detailed_selection_process || selectedOpportunity.item.selection_process}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" /> Exam Pattern
                      </h4>
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl whitespace-pre-line leading-relaxed">
                        {selectedOpportunity.item.detailed_exam_pattern || selectedOpportunity.item.exam_pattern}
                      </p>
                    </div>
                  </>
                )}

                {selectedOpportunity.type === 'education' && (
                  <>
                    {selectedOpportunity.item.admission_criteria && (
                      <div>
                        <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-indigo-500" /> Admission Criteria
                        </h4>
                        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl whitespace-pre-line leading-relaxed">
                          {selectedOpportunity.item.admission_criteria}
                        </p>
                      </div>
                    )}
                    {selectedOpportunity.item.facilities && (
                      <div>
                        <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-indigo-500" /> Facilities & Amenities
                        </h4>
                        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl whitespace-pre-line leading-relaxed">
                          {selectedOpportunity.item.facilities}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Required Application Documents
                  </h4>
                  <ul className="space-y-2">
                    {(selectedOpportunity.item.required_documents && Array.isArray(selectedOpportunity.item.required_documents) 
                      ? selectedOpportunity.item.required_documents 
                      : (selectedOpportunity.item.required_documents || selectedOpportunity.item.documents_required || "1. Aadhaar Card / Identity proof\n2. Age proof\n3. Educational qualifying marks sheets\n4. Caste/Category certificate if applicable")
                          .split('\n')
                    ).map((doc: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100 text-left">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedOpportunity.type === 'exam' && selectedOpportunity.item.preparation_resources && (
                  <div>
                    <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-primary" /> Preparation Resources
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedOpportunity.item.preparation_resources.map((res: any, idx: number) => (
                        <a 
                          key={idx} 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-primary font-bold hover:underline flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-100 p-3 rounded-xl transition-all text-left font-semibold"
                        >
                          {res.name} <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="p-6 border-t border-border bg-slate-50 flex gap-3 shrink-0">
                {selectedOpportunity.item.official_website && (
                  <a 
                    href={selectedOpportunity.item.official_website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 py-3 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1"
                  >
                    Official Website <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {(selectedOpportunity.item.apply_link || selectedOpportunity.item.website) && (
                  <a 
                    href={selectedOpportunity.item.apply_link || selectedOpportunity.item.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 bg-primary hover:bg-primary/95 text-white py-3 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-1"
                  >
                    Apply Now <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex h-[80vh] items-center justify-center bg-background">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <AIAssistantContent />
    </Suspense>
  );
}
