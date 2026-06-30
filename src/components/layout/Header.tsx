'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, Menu, MessageSquareText } from 'lucide-react';
import StateFilter from './StateFilter';
import { motion } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Exams', href: '/exams' },
    { name: 'Schemes', href: '/schemes' },
    { name: 'Scholarships', href: '/scholarships' },
    { name: 'Higher Ed', href: '/education' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-secondary p-1.5 rounded-lg shadow-sm">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <Link href="/" className="text-xl font-bold text-foreground tracking-tight">
            CivicAI
          </Link>
        </div>
        
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-slate-100 ${
                  isActive ? 'text-primary' : 'text-foreground-muted'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="header-active-tab"
                    className="absolute inset-0 bg-primary/5 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <StateFilter />
          <Link 
            href="/ai-assistant" 
            className="hidden md:inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 bg-accent text-white h-10 px-5"
          >
            <MessageSquareText className="h-4 w-4" /> Ask CivicAI
          </Link>
          <Link 
            href="/login" 
            className="hidden md:inline-flex items-center justify-center rounded-full text-sm font-medium transition-all border border-border hover:bg-slate-50 text-foreground h-10 px-5"
          >
            Login
          </Link>
          <button className="lg:hidden p-2 text-foreground-muted">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
