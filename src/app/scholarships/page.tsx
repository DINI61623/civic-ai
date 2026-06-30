import Link from 'next/link';
import { Search, GraduationCap, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const SCHOLARSHIPS_MOCK = [
  {
    id: '1',
    name: 'National Means Cum Merit Scholarship',
    type: 'Central',
    eligibility: 'Class 8 passed students with min 55% marks',
    lastDate: '2026-10-31',
    state: 'All India',
  },
  {
    id: '2',
    name: 'Post Matric Scholarship for SC Students',
    type: 'State',
    eligibility: 'SC students in class 11 and above, family income < 2.5 LPA',
    lastDate: '2026-11-15',
    state: 'Maharashtra',
  },
  {
    id: '3',
    name: 'AICTE Pragati Scholarship for Girls',
    type: 'Central',
    eligibility: 'Girl students admitted to first year of Degree/Diploma',
    lastDate: '2026-12-31',
    state: 'All India',
  }
];

export default function ScholarshipsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-foreground tracking-tight">Scholarships</h1>
        <p className="text-lg text-foreground-muted max-w-3xl">Access central and state scholarships to support your education.</p>
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
                <label className="text-sm font-semibold text-foreground block mb-2">Type</label>
                <select className="w-full p-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option>All Types</option>
                  <option>Central</option>
                  <option>State</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          {SCHOLARSHIPS_MOCK.map(scholarship => (
            <div key={scholarship.id} className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-lg">
                      {scholarship.state}
                    </span>
                    <span className="text-xs text-foreground-muted font-medium bg-slate-100 px-3 py-1 rounded-lg">{scholarship.type} Scholarship</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{scholarship.name}</h2>
                </div>
                <Link href={`/scholarships/${scholarship.id}`} className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5">
                  View Details <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-5 mt-2">
                <div className="flex items-start gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500 mt-0.5 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted font-medium mb-1">Eligibility</div>
                    <div className="text-sm font-semibold text-foreground">{scholarship.eligibility}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-50 p-2 rounded-lg text-danger mt-0.5 shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted font-medium mb-1">Last Date</div>
                    <div className="text-sm font-bold text-danger">{scholarship.lastDate}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
