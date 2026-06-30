import Link from 'next/link';
import { Search, CheckCircle, Gift, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const SCHEMES_MOCK = [
  {
    id: '1',
    name: 'PM Kisan Samman Nidhi',
    category: 'Farmers',
    benefits: 'Financial benefit of ₹6000 per year in three equal installments.',
    eligibility: 'All landholding farmers families.',
    state: 'All India',
  },
  {
    id: '2',
    name: 'Sukanya Samriddhi Yojana',
    category: 'Women & Child',
    benefits: 'High interest rate on savings, tax benefits under 80C.',
    eligibility: 'Girl child below 10 years of age.',
    state: 'All India',
  },
  {
    id: '3',
    name: 'Mukhyamantri Kanya Sumangala Yojana',
    category: 'Women & Child',
    benefits: 'Financial assistance of ₹15000 given in phases.',
    eligibility: 'Girl child born after 01/04/2019 in UP.',
    state: 'Uttar Pradesh',
  }
];

export default function SchemesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-foreground tracking-tight">Government Schemes</h1>
        <p className="text-lg text-foreground-muted max-w-3xl">Discover welfare schemes for students, farmers, women, and entrepreneurs tailored to your profile.</p>
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
                  <input type="text" placeholder="e.g. Kisan" className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Category</label>
                <select className="w-full p-2.5 text-sm border border-border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option>All Categories</option>
                  <option>Farmers</option>
                  <option>Women & Child</option>
                  <option>Students</option>
                  <option>Entrepreneurs</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          {SCHEMES_MOCK.map(scheme => (
            <div key={scheme.id} className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-green-50 text-success text-xs font-bold px-3 py-1 rounded-lg">
                      {scheme.state}
                    </span>
                    <span className="text-xs text-foreground-muted font-medium bg-slate-100 px-3 py-1 rounded-lg">{scheme.category}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{scheme.name}</h2>
                </div>
                <Link href={`/schemes/${scheme.id}`} className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5">
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
                    <div className="text-sm font-semibold text-foreground">{scheme.eligibility}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-50 p-2 rounded-lg text-success mt-0.5 shrink-0">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-foreground-muted font-medium mb-1">Benefits</div>
                    <div className="text-sm font-semibold text-foreground">{scheme.benefits}</div>
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
