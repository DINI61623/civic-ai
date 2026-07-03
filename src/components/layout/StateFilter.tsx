'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MapPin } from 'lucide-react';

const STATES = [
  "All India", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", 
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function StateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedState, setSelectedState] = useState("All India");
  
  useEffect(() => {
    const stateParam = searchParams.get('state');
    if (stateParam && STATES.includes(stateParam)) {
      setSelectedState(stateParam);
    } else {
      setSelectedState("All India");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    
    // Only redirect if we are on a list page, otherwise just go to /exams to show the filtered results
    const isListPage = ['/exams', '/schemes', '/scholarships', '/education'].some(route => pathname.startsWith(route));
    
    const params = new URLSearchParams(searchParams.toString());
    if (newState === "All India") {
      params.delete('state');
    } else {
      params.set('state', newState);
    }

    if (isListPage) {
      router.push(`${pathname}?${params.toString()}`);
    } else {
      // If on homepage or details page, default to routing to schemes (or keep it contextual)
      router.push(`/schemes?${params.toString()}`);
    }
  };

  return (
    <div className="hidden md:flex items-center gap-1 relative bg-slate-50 rounded-md px-2 py-1 border border-slate-200">
      <MapPin className="h-3.5 w-3.5 text-primary" />
      <select 
        value={selectedState}
        onChange={handleChange}
        className="appearance-none bg-transparent text-sm font-medium pr-5 outline-none cursor-pointer text-slate-700 hover:text-primary transition-colors"
      >
        {STATES.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-slate-500"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  );
}
