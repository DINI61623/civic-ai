import Link from 'next/link';
import { Briefcase, Calendar, GraduationCap, Search, ArrowUpRight } from 'lucide-react';

export const EXAMS_MOCK = [
  {
    id: '1',
    name: 'UPSC Civil Services Examination (CSE) 2026',
    department: 'Union Public Service Commission',
    eligibility: 'Any Graduate',
    ageLimit: '21 to 32 Years',
    startDate: '2026-02-01',
    lastDate: '2026-03-05',
    state: 'All India',
  },
  {
    id: '2',
    name: 'SSC CGL 2026 (Combined Graduate Level)',
    department: 'Staff Selection Commission',
    eligibility: 'Any Graduate',
    ageLimit: '18 to 32 Years',
    startDate: '2026-04-10',
    lastDate: '2026-05-12',
    state: 'All India',
  },
  {
    id: '3',
    name: 'UPPSC PCS 2026',
    department: 'Uttar Pradesh Public Service Commission',
    eligibility: 'Any Graduate',
    ageLimit: '21 to 40 Years',
    startDate: '2026-01-15',
    lastDate: '2026-02-14',
    state: 'Uttar Pradesh',
  }
];

export default function ExamsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-foreground tracking-tight">Government Exams</h1>
        <p className="text-lg text-foreground-muted max-w-3xl">Discover and apply for the latest government job opportunities across India.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-72 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <h3 className="font-bold text-lg mb-5 text-foreground">Filters</h3>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="e.g. UPSC" className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Qualification</label>
                <select className="w-full p-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option>Any Qualification</option>
                  <option>10th Pass</option>
                  <option>12th Pass</option>
                  <option>Graduate</option>
                  <option>Post Graduate</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-5">
          {EXAMS_MOCK.map(exam => (
            <div key={exam.id} className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-50 text-primary text-xs font-bold px-3 py-1 rounded-lg">
                      {exam.state}
                    </span>
                    <span className="text-xs text-foreground-muted font-medium bg-slate-100 px-3 py-1 rounded-lg">{exam.department}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{exam.name}</h2>
                </div>
                <Link href={`/exams/${exam.id}`} className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5">
                  View Details <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-5 mt-2">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted font-medium">Eligibility</div>
                    <div className="text-sm font-semibold text-foreground">{exam.eligibility}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted font-medium">Age Limit</div>
                    <div className="text-sm font-semibold text-foreground">{exam.ageLimit}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded-lg text-danger">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted font-medium">Last Date</div>
                    <div className="text-sm font-bold text-danger">{exam.lastDate}</div>
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
