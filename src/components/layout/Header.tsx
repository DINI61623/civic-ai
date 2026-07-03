'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, Menu, MessageSquareText, Search, User, LogOut, LayoutDashboard, Bookmark } from 'lucide-react';
import StateFilter from './StateFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import GlobalSearch from '@/components/ui/GlobalSearch';

export default function Header() {
  const pathname = usePathname();
  const { user, showAuthModal, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Exams', href: '/exams' },
    { name: 'Schemes', href: '/schemes' },
    { name: 'Scholarships', href: '/scholarships' },
    { name: 'Higher Ed', href: '/education' },
    { name: 'Resources', href: '/resources' },
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

        <div className="flex items-center gap-3 md:gap-4">
          <StateFilter />
          
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex p-2 text-foreground-muted hover:bg-slate-100 rounded-full transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
          
          <Link 
            href="/ai-assistant" 
            className="hidden md:inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 bg-accent text-white h-10 px-5"
          >
            <MessageSquareText className="h-4 w-4" /> Ask CivicAI
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-slate-50 transition-colors focus:outline-none"
            >
              {user ? (
                <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="h-5 w-5 text-foreground-muted" />
              )}
            </button>
            
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 bg-card rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.1)] border border-border overflow-hidden z-50 origin-top-right"
                >
                  {user ? (
                    <div className="p-2">
                      <div className="px-4 py-3 border-b border-border mb-2">
                        <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                        <p className="text-xs text-foreground-muted mt-0.5">Signed in</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-slate-50 rounded-xl transition-colors">
                        <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                      </Link>
                      <button onClick={() => { signOut(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 rounded-xl transition-colors mt-1">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="text-center mb-4">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <User className="h-6 w-6 text-slate-400" />
                        </div>
                        <h4 className="font-bold text-foreground mb-1">Guest Mode</h4>
                        <p className="text-xs text-foreground-muted">Sign in to save opportunities and get personalized alerts.</p>
                      </div>
                      <div className="space-y-2">
                        <button 
                          onClick={() => { setIsProfileOpen(false); showAuthModal(); }}
                          className="w-full bg-primary text-white font-bold py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          Sign In / Register
                        </button>
                        <button 
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full bg-white border border-border text-foreground font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                        >
                          Continue as Guest
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="lg:hidden p-2 text-foreground-muted">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
