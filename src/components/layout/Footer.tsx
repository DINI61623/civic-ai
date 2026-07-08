'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/ai-assistant') return null;

  return (
    <footer className="relative border-t border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Column 1: Brand Profile */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-primary to-secondary p-1.5 rounded-lg shadow-sm">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-primary tracking-tight">CivicAI</span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
              AI-powered Government Exam & Student Opportunity Platform.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Helping students discover government exams, scholarships, welfare schemes, and higher education opportunities through AI.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Quick Links
            </h3>
            <ul className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/" className="hover:text-primary transition-all duration-200 flex items-center hover:translate-x-1">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-primary transition-all duration-200 flex items-center hover:translate-x-1">
                  Government Exams
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-primary transition-all duration-200 flex items-center hover:translate-x-1">
                  Scholarships
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-primary transition-all duration-200 flex items-center hover:translate-x-1">
                  Preparation Resources
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-primary transition-all duration-200 flex items-center hover:translate-x-1">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Contact Info */}
          <div id="contact" className="space-y-4">
            <h3 className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Contact
            </h3>
            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">Developer: Dinesh B</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <a href="mailto:support@civicai.in" className="hover:text-primary transition-colors duration-200">
                  support@civicai.in
                </a>
              </div>
            </div>
            
            <div className="pt-2">
              <a 
                href="https://github.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-primary dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all duration-200 border border-slate-200/50 hover:border-primary/20 shadow-xs cursor-pointer"
                aria-label="GitHub"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
          </div>
          
        </div>
        
        {/* Bottom Line & Disclaimer */}
        <div className="mt-16 pt-8 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed text-center md:text-left max-w-2xl">
            <strong>Disclaimer:</strong> CivicAI is an independent student project. Users should always verify information using official government websites before applying.
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0">
            © 2026 CivicAI • Built by Dinesh B
          </div>
        </div>
      </div>
    </footer>
  );
}
