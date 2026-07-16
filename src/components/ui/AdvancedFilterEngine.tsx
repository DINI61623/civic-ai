'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, SlidersHorizontal, X, RefreshCw, ChevronDown, Check, 
  Clock, ArrowUpDown, HelpCircle, History, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

// Highlight helper
export function HighlightText({ text, search }: { text: string; search: string }) {
  if (!search.trim() || !text) return <>{text}</>;
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 text-slate-800 dark:bg-primary/30 dark:text-white rounded-sm px-0.5 font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

interface AdvancedFilterEngineProps {
  items: any[];
  states: any[];
  itemType: 'Exam' | 'Scheme' | 'Scholarship' | 'Education';
  onFilterChange: (filtered: any[], searchQuery: string) => void;
}

export default function AdvancedFilterEngine({ items, states, itemType, onFilterChange }: AdvancedFilterEngineProps) {
  // Query parameters
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);
  
  // Advanced filters state
  const [selectedQual, setSelectedQual] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedOrg, setSelectedOrg] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [ageInput, setAgeInput] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'alpha' | 'updated' | 'popular'>('newest');

  // Sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from local storage
  useEffect(() => {
    const stored = localStorage.getItem(`recent_searches_${itemType}`);
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, [itemType]);

  // Click outside listener for live search suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync searches to localStorage
  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const filtered = recentSearches.filter(t => t !== term);
    const updated = [term, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(`recent_searches_${itemType}`, JSON.stringify(updated));
  };

  // Popular search tags depending on context
  const popularSearches = (() => {
    if (itemType === 'Exam') return ['UPSC', 'SSC CGL', 'Bank PO', 'Railways'];
    if (itemType === 'Scheme') return ['PM-KISAN', 'Awas Yojana', 'Solar', 'Farming'];
    if (itemType === 'Scholarship') return ['NSP', 'Pre-Matric', 'Post-Matric', 'Merit'];
    return ['NIT Admission', 'CUET', 'Fellowship', 'PMRF'];
  })();

  // Clear all filters
  const handleClearAll = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedQual('All');
    setSelectedState('All');
    setSelectedCategory('All');
    setSelectedDept('All');
    setSelectedOrg('All');
    setSelectedStatus('All');
    setAgeInput('');
    setSortBy('newest');
  };

  // Extract unique departments & organizations from dataset
  const departments = Array.from(new Set(items.map(item => {
    return (item as any).ministry || (item as any).department_id || (item as any).type || '';
  }).filter(Boolean)));

  const organizations = Array.from(new Set(items.map(item => {
    return (item as any).source || (item as any).organization || (item as any).type || '';
  }).filter(Boolean)));

  // Master Filter & Sort Logic
  useEffect(() => {
    const today = new Date('2026-07-15'); // simulated current date

    let result = items.filter(item => {
      // 1. Search Query
      const q = debouncedSearch.toLowerCase();
      const title = (item.title || item.name || '').toLowerCase();
      const desc = (item.description || item.details || '').toLowerCase();
      const elig = (item.eligibility || item.admission_criteria || '').toLowerCase();
      const sourceStr = ((item as any).source || '').toLowerCase();
      const ministryStr = ((item as any).ministry || '').toLowerCase();

      const searchMatches = title.includes(q) || desc.includes(q) || elig.includes(q) || sourceStr.includes(q) || ministryStr.includes(q);
      if (!searchMatches) return false;

      // 2. Qualification
      if (selectedQual !== 'All') {
        const itemQual = item.qualification;
        if (itemQual && itemQual !== 'Any Qualification') {
          const ranks: Record<string, number> = { '10th Pass': 1, '12th Pass': 2, 'Diploma': 3, 'Graduate': 4, 'Postgraduate': 5 };
          const userRank = ranks[selectedQual] || 1;
          const targetRank = ranks[itemQual] || 1;
          if (userRank < targetRank) return false;
        }
      }

      // 3. State
      if (selectedState !== 'All') {
        const itemStateId = item.state_id;
        const itemStateName = item.state || '';
        if (itemStateId) {
          const targetState = states.find(s => s.name === selectedState);
          const allIndiaState = states.find(s => s.name.toLowerCase() === 'all india');
          const allIndiaId = allIndiaState ? allIndiaState.id : '';
          if (targetState && itemStateId !== allIndiaId && itemStateId !== targetState.id) {
            return false;
          }
        } else if (itemStateName && itemStateName !== 'All India' && itemStateName !== selectedState) {
          return false;
        }
      }

      // 4. Category
      if (selectedCategory !== 'All') {
        const itemCat = (item.category || '').toLowerCase();
        if (itemCat && itemCat !== 'all' && !itemCat.includes(selectedCategory.toLowerCase())) return false;
      }

      // 5. Department
      if (selectedDept !== 'All') {
        const dept = (item.ministry || item.department_id || item.type || '');
        if (dept !== selectedDept) return false;
      }

      // 6. Organization
      if (selectedOrg !== 'All') {
        const org = (item.source || item.organization || item.type || '');
        if (org !== selectedOrg) return false;
      }

      // 7. Age Eligibility Check
      if (ageInput) {
        const age = parseInt(ageInput);
        if (age && item.age_limit) {
          const match = item.age_limit.match(/(\d+)\s*-\s*(\d+)/);
          if (match) {
            const minAge = parseInt(match[1]);
            const maxAge = parseInt(match[2]);
            if (age < minAge || age > maxAge) return false;
          }
        }
      }

      // 8. Application Status
      if (selectedStatus !== 'All') {
        const lastDateStr = item.last_date || item.application_end_date;
        const startDateStr = item.start_date || item.application_start_date;
        
        const deadline = lastDateStr ? new Date(lastDateStr) : null;
        const start = startDateStr ? new Date(startDateStr) : null;

        if (selectedStatus === 'open') {
          if (deadline && deadline < today) return false;
          if (start && start > today) return false;
        } else if (selectedStatus === 'closing') {
          if (!deadline || deadline < today) return false;
          const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 7) return false;
        } else if (selectedStatus === 'upcoming') {
          if (!start || start <= today) return false;
        } else if (selectedStatus === 'updated') {
          const updatedDateStr = item.last_updated;
          if (updatedDateStr) {
            const updated = new Date(updatedDateStr);
            const diffTime = Math.abs(today.getTime() - updated.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 30) return false;
          } else {
            return false;
          }
        }
      }

      return true;
    });

    // Sort result
    result.sort((a, b) => {
      const titleA = a.title || a.name || '';
      const titleB = b.title || b.name || '';

      if (sortBy === 'alpha') {
        return titleA.localeCompare(titleB);
      }

      const dateA = a.start_date || a.application_start_date || '';
      const dateB = b.start_date || b.application_start_date || '';
      
      const lastA = a.last_date || a.application_end_date || '';
      const lastB = b.last_date || b.application_end_date || '';

      if (sortBy === 'newest') {
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }

      if (sortBy === 'deadline') {
        if (!lastA) return 1;
        if (!lastB) return -1;
        return new Date(lastA).getTime() - new Date(lastB).getTime();
      }

      if (sortBy === 'updated') {
        const upA = a.last_updated || dateA;
        const upB = b.last_updated || dateB;
        return new Date(upB).getTime() - new Date(upA).getTime();
      }

      if (sortBy === 'popular') {
        // Sort by vacancies or fallback to bookmarks
        const vacA = a.vacancies || 0;
        const vacB = b.vacancies || 0;
        return vacB - vacA;
      }

      return 0;
    });

    onFilterChange(result, search);
  }, [
    items, states, search, selectedQual, selectedState, selectedCategory, 
    selectedDept, selectedOrg, selectedStatus, ageInput, sortBy, onFilterChange
  ]);

  // Live search autocomplete suggestions
  const searchSuggestions = items
    .filter(item => {
      const q = search.toLowerCase();
      if (!q.trim()) return false;
      const title = (item.title || item.name || '').toLowerCase();
      return title.includes(q) && title !== q;
    })
    .slice(0, 5);

  const handleSuggestionClick = (title: string) => {
    setSearch(title);
    setDebouncedSearch(title);
    saveSearch(title);
    setShowSuggestions(false);
  };

  const appliedFiltersCount = [
    selectedQual !== 'All',
    selectedState !== 'All',
    selectedCategory !== 'All',
    selectedDept !== 'All',
    selectedOrg !== 'All',
    selectedStatus !== 'All',
    !!ageInput
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 w-full relative z-40">
      
      {/* Search and Filters Quickbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch relative" ref={containerRef}>
        
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${itemType === 'Exam' ? 'exams' : itemType === 'Scheme' ? 'schemes' : itemType === 'Scholarship' ? 'scholarships' : 'courses'}...`}
            value={search}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveSearch(search);
                setShowSuggestions(false);
              }
            }}
            className="w-full pl-11 pr-10 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
          />
          {search && (
            <button 
              onClick={() => {
                setSearch('');
                setDebouncedSearch('');
                setShowSuggestions(false);
              }}
              className="absolute right-3.5 top-3.5 p-0.5 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Autocomplete & Recent suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                {/* Suggestions List */}
                {searchSuggestions.length > 0 && (
                  <div className="p-3 border-b border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2 mb-1.5">Suggestions</span>
                    {searchSuggestions.map((item, i) => {
                      const title = item.title || item.name;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(title)}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                        >
                          <HighlightText text={title} search={search} />
                          <Check className="h-3 w-3 text-primary opacity-0 hover:opacity-100" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2 mb-1.5 flex items-center gap-1">
                      <History className="h-3 w-3" /> Recent Searches
                    </span>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearch(term);
                            setShowSuggestions(false);
                          }}
                          className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Trigger button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`flex items-center justify-center gap-2 border px-4 py-3 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
            appliedFiltersCount > 0 
              ? 'border-primary bg-primary/5 text-primary' 
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters 
          {appliedFiltersCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center">
              {appliedFiltersCount}
            </span>
          )}
        </button>

        {/* Sorting Dropdown selector */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="appearance-none border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-600 focus:outline-none cursor-pointer outline-none w-full md:w-44"
          >
            <option value="newest">Newest First</option>
            <option value="deadline">Deadline Nearest</option>
            <option value="alpha">Alphabetical</option>
            <option value="updated">Recently Updated</option>
            <option value="popular">Most Popular</option>
          </select>
          <ArrowUpDown className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

      </div>

      {/* Popular search pills (Module 9) */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs py-1 select-none">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Popular Searches:
        </span>
        {popularSearches.map(term => (
          <button
            key={term}
            onClick={() => {
              setSearch(term);
              setDebouncedSearch(term);
              saveSearch(term);
            }}
            className="text-[10px] font-bold border border-slate-200 hover:border-primary/20 bg-white hover:bg-primary/5 text-slate-600 hover:text-primary px-3 py-1 rounded-full transition-all cursor-pointer"
          >
            {term}
          </button>
        ))}
      </div>

      {/* Active Filter Chips row */}
      {appliedFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 select-none">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Filters:</span>
          
          {selectedQual !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 rounded-full pl-2.5 pr-1.5 py-0.5">
              Qual: {selectedQual}
              <button onClick={() => setSelectedQual('All')} className="p-0.5 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}

          {selectedState !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 rounded-full pl-2.5 pr-1.5 py-0.5">
              State: {selectedState}
              <button onClick={() => setSelectedState('All')} className="p-0.5 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}

          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 rounded-full pl-2.5 pr-1.5 py-0.5">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')} className="p-0.5 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}

          {selectedDept !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 rounded-full pl-2.5 pr-1.5 py-0.5">
              Dept: {selectedDept}
              <button onClick={() => setSelectedDept('All')} className="p-0.5 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}

          {selectedOrg !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 rounded-full pl-2.5 pr-1.5 py-0.5">
              Org: {selectedOrg}
              <button onClick={() => setSelectedOrg('All')} className="p-0.5 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}

          {selectedStatus !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 rounded-full pl-2.5 pr-1.5 py-0.5">
              Status: {selectedStatus.toUpperCase()}
              <button onClick={() => setSelectedStatus('All')} className="p-0.5 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}

          {ageInput && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 rounded-full pl-2.5 pr-1.5 py-0.5">
              Age Eligible: {ageInput}
              <button onClick={() => setAgeInput('')} className="p-0.5 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}

          <button 
            onClick={handleClearAll}
            className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-0.5 ml-2 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Clear All
          </button>
        </div>
      )}

      {/* Slide-over Filter Panel Overlay Drawer (UX: Sticky/Drawer filter bar) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs select-none">
            
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setIsSidebarOpen(false)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative w-full max-w-sm h-full bg-white dark:bg-slate-850 shadow-2xl border-l border-slate-200 dark:border-slate-850 flex flex-col z-50"
            >
              {/* Header drawer */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Advanced Filters</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-slate-450 hover:text-slate-650 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Filters forms container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Age Input Check */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-2">Age Eligibility Check</label>
                  <input
                    type="number"
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value)}
                    placeholder="Enter your age (e.g. 24)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  />
                </div>

                {/* Domicile State */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-2">Domicile State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  >
                    <option value="All">All States / All India</option>
                    {states.filter(s => s.name.toLowerCase() !== 'all india').map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Qualification (Students only) */}
                {(itemType === 'Exam' || itemType === 'Scholarship' || itemType === 'Education') && (
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-2">Academic Qualification</label>
                    <select
                      value={selectedQual}
                      onChange={(e) => setSelectedQual(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    >
                      <option value="All">Any Qualification</option>
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                )}

                {/* Category Reservation */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-2">Category / Demographic</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-355"
                  >
                    <option value="All">All Categories</option>
                    <option value="General">General</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="EWS">EWS</option>
                    <option value="Farmers">Farmers / Agriculture</option>
                  </select>
                </div>

                {/* Application status */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-2">Application Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                  >
                    <option value="All">All Opportunities</option>
                    <option value="open">Applications Open</option>
                    <option value="closing">Closing Soon</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="updated">Recently Updated (Last 30d)</option>
                  </select>
                </div>

                {/* Department filter */}
                {departments.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-2">Department / Authority</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    >
                      <option value="All">All Departments</option>
                      {departments.map((dept, i) => (
                        <option key={i} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Organization filter */}
                {organizations.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-2">Organization / Source</label>
                    <select
                      value={selectedOrg}
                      onChange={(e) => setSelectedOrg(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary cursor-pointer font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    >
                      <option value="All">All Organizations</option>
                      {organizations.map((org, i) => (
                        <option key={i} value={org}>{org}</option>
                      ))}
                    </select>
                  </div>
                )}

              </div>

              {/* Bottom drawer buttons action */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <button 
                  onClick={handleClearAll}
                  className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Clear All
                </button>
                <Button 
                  variant="primary" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-xs font-bold py-2 px-5 rounded-xl cursor-pointer"
                >
                  Apply Filters
                </Button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
