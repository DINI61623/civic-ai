'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, Menu, MessageSquareText, X, ChevronRight, User } from 'lucide-react';
import StateFilter from './StateFilter';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Exams', href: '/exams' },
    { name: 'Schemes', href: '/schemes' },
    { name: 'Scholarships', href: '/scholarships' },
    { name: 'Higher Ed', href: '/education' },
    { name: 'Resources', href: '/resources' },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm min-h-[4rem] flex items-center">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between w-full">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-gradient-to-br from-primary to-secondary p-1.5 rounded-xl shadow-sm">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <Link href="/" className="text-xl font-extrabold text-foreground tracking-tight hover:opacity-90 transition-opacity">
            CivicAI
          </Link>
        </div>
        
        {/* Navigation Links - Desktop (1024px+) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`relative px-4 py-2 text-sm font-bold transition-colors rounded-full hover:bg-slate-50 ${
                  isActive ? 'text-primary' : 'text-foreground-muted'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="header-active-tab"
                    className="absolute inset-0 bg-primary/5 rounded-full border border-primary/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Global Toolbar and Controls */}
        <div className="flex items-center gap-3">
          
          {/* Desktop/Tablet State Filter */}
          <div className="hidden sm:block">
            <Suspense fallback={<div className="h-10 w-28 bg-slate-100 animate-pulse rounded-2xl" />}>
              <StateFilter />
            </Suspense>
          </div>

          <Link 
            href="/ai-assistant" 
            className="hidden md:inline-flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 bg-accent text-white h-[40px] px-5"
          >
            <MessageSquareText className="h-4 w-4" /> Ask Career AI
          </Link>

          <Link 
            href="/login" 
            className="hidden md:inline-flex items-center justify-center rounded-full text-xs font-bold transition-all border border-slate-200 hover:bg-slate-50 text-slate-700 h-[40px] px-5"
          >
            Login
          </Link>

          {/* Hamburger menu button - Visible on screens < 1024px */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Slide-out Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop with higher z-index to clear page overlays */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-xs"
            />

            {/* Sliding Menu Sheet - Left Aligned with z-[110] */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] sm:w-[320px] bg-white z-[110] border-r border-slate-200 p-6 flex flex-col justify-between shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="space-y-6">
                
                {/* Drawer Header */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-primary to-secondary p-1 rounded-lg">
                      <Landmark className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-extrabold text-foreground tracking-tight">Navigation Menu</span>
                  </div>
                  <button 
                    onClick={closeMenu}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile State Filter */}
                <div className="sm:hidden block p-1 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block px-3 pt-2 pb-1">Filter Region</span>
                  <Suspense fallback={<div className="h-10 w-full bg-slate-100 animate-pulse rounded-2xl" />}>
                    <StateFilter />
                  </Suspense>
                </div>

                {/* Vertical Navigation Links */}
                <nav className="flex flex-col gap-1.5">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                      <Link 
                        key={link.name} 
                        href={link.href}
                        onClick={closeMenu}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                          isActive 
                            ? 'bg-primary/5 border-primary/20 text-primary' 
                            : 'border-transparent text-foreground-muted hover:bg-slate-50 hover:text-foreground'
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronRight className={`h-4 w-4 opacity-50 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer / Account Controls */}
              <div className="border-t border-slate-100 pt-6 space-y-3">
                <Link href="/ai-assistant" onClick={closeMenu} className="block w-full">
                  <button className="w-full bg-accent text-white py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm shadow-accent/10 active:scale-95 transition-all cursor-pointer">
                    <MessageSquareText className="h-4 w-4" /> Ask Career AI
                  </button>
                </Link>
                <Link href="/login" onClick={closeMenu} className="block w-full">
                  <button className="w-full border border-slate-200 text-slate-700 py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer">
                    <User className="h-4 w-4" /> Login Profile
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
