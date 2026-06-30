import Link from 'next/link';
import { Search, GraduationCap, Building, Trophy, ArrowUpRight } from 'lucide-react';

export const EDUCATION_MOCK = [
  {
    id: '1',
    name: 'National Institute of Technology (NIT)',
    type: 'Government University',
    details: 'Premier engineering institutes located across India.',
    state: 'All India',
  },
  {
    id: '2',
    name: 'CUET (UG) 2026',
    type: 'Entrance Exam',
    details: 'Common University Entrance Test for undergraduate programs.',
    state: 'All India',
  },
  {
    id: '3',
    name: 'Prime Minister Research Fellowship (PMRF)',
    type: 'Fellowship',
    details: 'Prestigious fellowship for PhD programs in premier institutes.',
    state: 'All India',
  }
];

export default function EducationPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-foreground tracking-tight">Higher Education</h1>
        <p className="text-lg text-foreground-muted max-w-3xl">Explore government universities, entrance exams, and prestigious fellowships.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-72 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <h3 className="font-bold text-lg mb-5 text-foreground">Filters</h3>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Category</label>
                <select className="w-full p-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option>All Categories</option>
                  <option>Universities</option>
                  <option>Entrance Exams</option>
                  <option>Fellowships</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          {EDUCATION_MOCK.map(item => (
            <div key={item.id} className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-lg">
                      {item.state}
                    </span>
                    <span className="text-xs text-foreground-muted font-medium bg-slate-100 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      {item.type.includes('University') ? <Building className="h-3.5 w-3.5" /> : item.type.includes('Exam') ? <Trophy className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
                      {item.type}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</h2>
                </div>
                <Link href={`/education/${item.id}`} className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5">
                  View Details <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="border-t border-border pt-5 mt-2">
                <p className="text-[15px] leading-relaxed text-foreground-muted">
                  {item.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
