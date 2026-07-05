'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Gift, ArrowUpRight, CheckCircle2, MapPin, 
  SlidersHorizontal, X, RefreshCw, Bookmark 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FALLBACK_SCHEMES, FALLBACK_STATES, Scheme, State } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedState, setSelectedState] = useState('All India');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase or Fallback
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [
          { data: schemesData },
          { data: statesData }
        ] = await Promise.all([
          supabase.from('schemes').select('*'),
          supabase.from('states').select('*')
        ]);
        
        const schemesList = (schemesData && schemesData.length > 0 ? schemesData : FALLBACK_SCHEMES).map(scheme => {
          const fallback = FALLBACK_SCHEMES.find(fs => fs.title.toLowerCase().split(' ')[0] === scheme.title.toLowerCase().split(' ')[0]);
          return { ...fallback, ...scheme };
        });

        setSchemes(schemesList);
        setStates(statesData && statesData.length > 0 ? statesData : FALLBACK_STATES);
      } catch (err) {
        console.error('Failed to query Supabase on schemes, falling back:', err);
        setSchemes(FALLBACK_SCHEMES);
        setStates(FALLBACK_STATES);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter schemes
  const filteredSchemes = schemes.filter(scheme => {
    const searchLower = search.toLowerCase();
    const titleMatch = scheme.title.toLowerCase().includes(searchLower) || 
                       (scheme.description && scheme.description.toLowerCase().includes(searchLower)) ||
                       scheme.eligibility.toLowerCase().includes(searchLower);

    let catMatch = true;
    if (selectedCategory !== 'All Categories') {
      // Map display labels to schema labels
      const categoryMap: { [key: string]: string[] } = {
        'Farmers': ['Farmers'],
        'Women & Child': ['Women', 'Child', 'Women & Child'],
        'Students': ['Students', 'General', 'Education'],
        'Entrepreneurs': ['Entrepreneurs', 'General']
      };
      const allowed = categoryMap[selectedCategory] || [selectedCategory];
      catMatch = allowed.some(a => scheme.category.toLowerCase().includes(a.toLowerCase()));
    }

    let stateMatch = true;
    if (selectedState !== 'All India') {
      const stateObj = states.find(s => s.name === selectedState);
      const allIndiaState = states.find(s => s.name.toLowerCase() === 'all india');
      const allIndiaId = allIndiaState ? allIndiaState.id : '187b6a43-0abd-45b5-a2d3-506743532d80';
      if (stateObj) {
        stateMatch = scheme.state_id === allIndiaId || scheme.state_id === stateObj.id;
      }
    }

    return titleMatch && catMatch && stateMatch;
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All Categories');
    setSelectedState('All India');
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block mb-2">Search Schemes</label>
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="e.g. Kisan, Awas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block mb-2">Category</label>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer outline-none"
        >
          <option>All Categories</option>
          <option>Farmers</option>
          <option>Women & Child</option>
          <option>Students</option>
          <option>Entrepreneurs</option>
        </select>
      </div>
      <div>
        <label className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block mb-2">Target State</label>
        <select 
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer outline-none"
        >
          <option>All India</option>
          {states.filter(s => s.name.toLowerCase() !== 'all india').map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {(search || selectedCategory !== 'All Categories' || selectedState !== 'All India') && (
        <button 
          onClick={clearFilters}
          className="w-full text-xs font-bold text-slate-500 hover:text-danger bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" /> Reset Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-foreground tracking-tight">Government Schemes</h1>
        <p className="text-sm md:text-base text-foreground-muted max-w-2xl leading-relaxed">Discover welfare programs, grants, subsidies, and citizen support yojanas tailored to your demographic profile.</p>
      </div>

      {/* Main container */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.02)] sticky top-24">
            <h3 className="font-extrabold text-lg mb-5 text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-primary" /> Filter Options
            </h3>
            <FiltersContent />
          </div>
        </div>

        {/* Content Feeds */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-foreground-muted font-bold">Retrieving government schemes catalog...</p>
            </div>
          ) : (
            <>
              {filteredSchemes.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                  <SlidersHorizontal className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-bold text-foreground text-lg mb-2">No Schemes Found</h3>
                  <p className="text-sm text-foreground-muted mb-6">Modify filter parameters to discover wider opportunities.</p>
                  <Button variant="outline" onClick={clearFilters}>Reset Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredSchemes.map((scheme) => {
                    const stateObj = states.find(s => s.id === scheme.state_id);

                    return (
                      <motion.div 
                        key={scheme.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col h-full group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-100">
                            Scheme
                          </span>
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" /> {stateObj?.name || 'All India'}
                          </span>
                        </div>

                        <h2 className="text-lg font-extrabold text-foreground group-hover:text-emerald-600 transition-colors leading-snug mb-2 line-clamp-2">
                          {scheme.title}
                        </h2>

                        <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2 mb-4">
                          {scheme.description || "National direct benefit transfer and citizen support scheme designed for eligible profiles."}
                        </p>

                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-5 mt-auto text-xs">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">Benefits</div>
                            <div className="font-extrabold text-slate-700 truncate">{scheme.benefits}</div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400">Eligibility</div>
                            <div className="font-extrabold text-slate-700 truncate">{scheme.eligibility}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/schemes/${scheme.id}`} className="flex-1">
                            <Button variant="outline" fullWidth className="text-xs py-2 min-h-[40px] rounded-xl flex items-center justify-center gap-1 font-extrabold">
                              View Details <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          {scheme.apply_link && (
                            <a href={scheme.apply_link} target="_blank" rel="noopener noreferrer" className="flex-1">
                              <Button variant="emerald" fullWidth className="text-xs py-2 min-h-[40px] rounded-xl font-extrabold">
                                Apply Now
                              </Button>
                            </a>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Filter Button - Tablet/Mobile */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-600/95 text-white shadow-[0_8px_30px_rgb(5,150,105,0.4)] hover:shadow-lg py-3 px-6 rounded-full font-bold flex items-center gap-2 text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filter Schemes ({filteredSchemes.length})
        </button>
      </div>

      {/* Bottom Sheet Drawer - Tablet/Mobile */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-[32px] border-t border-slate-200 z-50 p-6 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-primary" /> Filter Options
                </h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 pb-16">
                <FiltersContent />
              </div>
              <div className="absolute bottom-4 left-6 right-6">
                <Button variant="emerald" fullWidth onClick={() => setIsFilterOpen(false)}>
                  Show {filteredSchemes.length} Schemes
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
