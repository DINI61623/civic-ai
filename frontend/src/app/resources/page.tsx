'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, BookOpen, GraduationCap, ExternalLink, 
  FileText, Landmark, Library, Sparkles, SlidersHorizontal, RefreshCw 
} from 'lucide-react';
import { FALLBACK_EXAMS, Exam } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

// Mock list of general prep platforms and materials
const GENERAL_RESOURCES = [
  {
    name: "NCERT Books (Class VI to XII)",
    category: "General Studies",
    description: "Official NCERT e-books in English and Hindi, essential for UPSC, state PSCs, and SSC exams.",
    url: "https://ncert.nic.in/textbook.php"
  },
  {
    name: "Press Information Bureau (PIB) News",
    category: "Current Affairs",
    description: "Official releases from Government of India, crucial for staying updated on policies, schemes, and news.",
    url: "https://pib.gov.in"
  },
  {
    name: "UPSC Previous Year Papers",
    category: "Exam Archives",
    description: "Official repository of UPSC Civil Services question papers and answer keys from previous years.",
    url: "https://www.upsc.gov.in/examinations/previous-question-papers"
  },
  {
    name: "SSC Previous Year Question Papers",
    category: "Exam Archives",
    description: "Question papers and practice test databases for various SSC graduate and clerical level exams.",
    url: "https://ssc.gov.in"
  },
  {
    name: "National Digital Library of India (NDLI)",
    category: "Library",
    description: "A virtual repository of learning resources with single-window search facility for students of all levels.",
    url: "https://ndl.iitkgp.ac.in"
  },
  {
    name: "Swayam Online Courses Portal",
    category: "Courses",
    description: "Government of India's free online education program offering undergraduate, post-graduate, and skill courses.",
    url: "https://swayam.gov.in"
  }
];

export default function ResourcesPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  useEffect(() => {
    // Populate exams lists
    setExams(FALLBACK_EXAMS);
  }, []);

  const categories = [
    'All Categories', 
    'Official Syllabus', 
    'Study Materials', 
    'Previous Year Papers', 
    'General Studies', 
    'Current Affairs'
  ];

  // Aggregate resources list
  const examResources = exams.flatMap(exam => {
    const list = [] as any[];
    
    if (exam.syllabus_link) {
      list.push({
        name: `${exam.title.split(' 202')[0]} Official Syllabus`,
        category: "Official Syllabus",
        examName: exam.title,
        description: `Official detailed syllabus path and notification documentation for ${exam.title}.`,
        url: exam.syllabus_link
      });
    }
    
    if (exam.previous_papers_link) {
      list.push({
        name: `${exam.title.split(' 202')[0]} Previous Papers`,
        category: "Previous Year Papers",
        examName: exam.title,
        description: `Archives of official question papers and answers key for ${exam.title}.`,
        url: exam.previous_papers_link
      });
    }
    
    if (exam.preparation_resources) {
      exam.preparation_resources.forEach(res => {
        list.push({
          name: `${exam.title.split(' 202')[0]} - ${res.name}`,
          category: "Study Materials",
          examName: exam.title,
          description: `Recommended textbook, standard reference book, or guide for ${exam.title}.`,
          url: res.url
        });
      });
    }
    
    return list;
  });

  const allResources = [...GENERAL_RESOURCES, ...examResources];

  // Filter logic
  const filteredResources = allResources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(search.toLowerCase()) ||
                          res.description.toLowerCase().includes(search.toLowerCase()) ||
                          (res.examName && res.examName.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || res.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      
      {/* Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
          <Library className="h-8 w-8 text-primary" /> Preparation & Study Resources
        </h1>
        <p className="text-sm md:text-base text-foreground-muted max-w-2xl leading-relaxed">
          Access verified syllabus guides, previous year papers, official government study platforms, and handpicked reference materials.
        </p>
      </div>

      {/* Main container */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.02)] sticky top-24">
            <h3 className="font-extrabold text-lg mb-5 text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-primary" /> Filter Categories
            </h3>
            
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === cat
                      ? 'bg-primary/5 border-primary/20 text-primary'
                      : 'border-transparent text-foreground-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {(search || selectedCategory !== 'All Categories') && (
              <button 
                onClick={() => { setSearch(''); setSelectedCategory('All Categories'); }}
                className="w-full text-xs font-bold text-slate-500 hover:text-danger bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-6"
              >
                <RefreshCw className="h-3 w-3" /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          
          {/* Search bar */}
          <div className="bg-card p-4 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources, e.g. UPSC syllabus, NCERT books, railway papers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Listings */}
          {filteredResources.length === 0 ? (
            <div className="bg-card border border-border p-12 rounded-3xl text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <Library className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-foreground text-lg mb-2">No Matching Resources Found</h3>
              <p className="text-sm text-foreground-muted mb-6">Try refining your search keyword or selected category filter.</p>
              <Button variant="outline" onClick={() => { setSearch(''); setSelectedCategory('All Categories'); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResources.map((res, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card border border-border rounded-3xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all flex flex-col h-full relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80"></div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/15">
                      {res.category}
                    </span>
                    {res.examName && (
                      <span className="text-[10px] font-semibold text-slate-500 max-w-[180px] truncate" title={res.examName}>
                        For: {res.examName.split(' 202')[0]}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                    {res.name}
                  </h3>

                  <p className="text-xs text-foreground-muted leading-relaxed mb-6 flex-1">
                    {res.description}
                  </p>

                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full mt-auto"
                  >
                    <Button 
                      variant="outline" 
                      fullWidth 
                      className="text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold"
                    >
                      Access Material <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </motion.div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
