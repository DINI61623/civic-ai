'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Landmark, Menu, MessageSquareText, X, ChevronRight, User, Bell,
  Home, FileText, Heart, Award, GraduationCap, Library, Settings, Sparkles,
  Sun, Moon
} from 'lucide-react';
import { createPortal } from 'react-dom';
import StateFilter from './StateFilter';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const NAV_DEFS = [
  { key: 'nav.home',         href: '/',            icon: Home },
  { key: 'nav.exams',        href: '/exams',        icon: FileText },
  { key: 'nav.schemes',      href: '/schemes',      icon: Heart },
  { key: 'nav.scholarships', href: '/scholarships', icon: Award },
  { key: 'nav.education',    href: '/education',    icon: GraduationCap },
  { key: 'nav.resources',    href: '/resources',    icon: Library },
  { key: 'nav.settings',     href: '/settings',     icon: Settings },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const { scrollY } = useScroll();

  // Build nav links using translated names
  const navLinks = NAV_DEFS.map(d => ({ ...d, name: t(d.key) }));

  // Header changes style after scrolling 40px
  const headerBg = useTransform(
    scrollY,
    [0, 60],
    ['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)']
  );
  const headerBgDark = useTransform(
    scrollY,
    [0, 60],
    ['rgba(2,6,23,0)', 'rgba(2,6,23,0.85)']
  );
  const headerShadow = useTransform(
    scrollY,
    [0, 60],
    ['0 0 0 rgba(0,0,0,0)', '0 4px 30px rgba(0,0,0,0.08)']
  );
  const headerBorderOpacity = useTransform(scrollY, [0, 60], [0, 1]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const drawerContent = (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
            style={{ zIndex: 9998 }}
          />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed left-0 top-0 bottom-0 w-[270px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col justify-between shadow-2xl lg:hidden overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="bg-gradient-to-br from-primary to-secondary p-1.5 rounded-xl shadow-sm">
                    <Landmark className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-extrabold text-foreground tracking-tight">CivicAI</span>
                </motion.div>
                <button onClick={closeMenu} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-all cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile State Filter */}
              <div className="sm:hidden p-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block px-3 pt-2 pb-1">Region</span>
                <Suspense fallback={<div className="h-10 w-full bg-slate-100 animate-pulse rounded-2xl" />}>
                  <StateFilter />
                </Suspense>
              </div>

              {/* Nav Links — staggered animation */}
              <nav className="flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                          isActive
                            ? 'bg-primary/5 border-primary/20 text-primary'
                            : 'border-transparent text-foreground-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground dark:hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {link.name}
                        </span>
                        <ChevronRight className={`h-4 w-4 opacity-40 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2.5"
            >
              <Link href="/ai-assistant" onClick={closeMenu} className="block w-full">
                <button className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer active:scale-95 transition-all">
                  <Sparkles className="h-4 w-4" /> {t('nav.ask_ai')}
                </button>
              </Link>
              <Link href={user ? '/dashboard' : '/login'} onClick={closeMenu} className="block w-full">
                <button className="w-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer active:scale-95 transition-all">
                  <User className="h-4 w-4" /> {user ? t('nav.dashboard') : t('auth.login')}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.header
        style={{ boxShadow: headerShadow }}
        className="fixed top-0 left-0 right-0 z-50 w-full"
      >
        {/* Glassmorphic backdrop that appears on scroll */}
        <motion.div
          className="absolute inset-0 dark:hidden"
          style={{ backgroundColor: headerBg, backdropFilter: 'blur(20px)' }}
        />
        <motion.div
          className="absolute inset-0 hidden dark:block"
          style={{ backgroundColor: headerBgDark, backdropFilter: 'blur(20px)' }}
        />
        {/* Subtle bottom border that fades in on scroll */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"
          style={{ opacity: headerBorderOpacity }}
        />

        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 relative z-10">

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="relative bg-gradient-to-br from-primary to-secondary p-1.5 rounded-xl shadow-md shadow-primary/30"
            >
              {/* Animated glow ring */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-xl bg-primary/40"
              />
              <Landmark className="h-5 w-5 text-white relative z-10" />
            </motion.div>
            <motion.span
              className="text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200"
            >
              Civic<span className="text-primary group-hover:text-secondary transition-colors duration-300">AI</span>
            </motion.span>
          </Link>

          {/* Desktop Icon-only Nav — pill container */}
          <nav className="hidden lg:flex items-center bg-slate-100/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl p-1 gap-0.5 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <Link
                    href={link.href}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-150 ${
                      isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'
                    }`}
                  >
                    {/* Animated background pill */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-md"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}

                    {/* Hover glow */}
                    <AnimatePresence>
                      {hoveredLink === link.name && !isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 bg-primary/8 dark:bg-primary/15 rounded-xl"
                        />
                      )}
                    </AnimatePresence>

                    <motion.div
                      whileHover={{ scale: 1.25, y: -2 }}
                      whileTap={{ scale: 0.85 }}
                      transition={{ type: 'spring', stiffness: 550, damping: 18 }}
                      className="relative z-10"
                    >
                      <Icon className={`h-[17px] w-[17px] transition-all ${isActive ? 'stroke-[2.5] drop-shadow-sm' : ''}`} />
                    </motion.div>
                  </Link>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredLink === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.85 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-bold rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-xl"
                      >
                        {link.name}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45 rounded-[1px]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* State Filter */}
            <div className="hidden sm:block">
              <Suspense fallback={<div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />}>
                <StateFilter />
              </Suspense>
            </div>

            {/* Ask AI — glowing gradient button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/ai-assistant"
                className="hidden md:inline-flex relative items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white h-9 px-4 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-accent via-emerald-400 to-primary" />
                <motion.span
                  animate={{ x: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
                <Sparkles className="h-3.5 w-3.5 relative z-10" />
                <span className="relative z-10">{t('nav.ask_ai')}</span>
              </Link>
            </motion.div>

            {/* Notifications bell */}
            {user && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="/notifications"
                  className="relative p-2 text-slate-500 hover:text-primary rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <motion.div
                    animate={{ rotate: [0, 12, -12, 8, -8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
                  >
                    <Bell className="h-5 w-5" />
                  </motion.div>
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-950"
                  />
                </Link>
              </motion.div>
            )}

            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer outline-none"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -12, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 12, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Dashboard / Login */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={user ? '/dashboard' : '/login'}
                className="hidden md:inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 hover:border-primary/40 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 h-9 px-4 transition-all shadow-sm"
              >
                <User className="h-3.5 w-3.5" />
                {user ? t('nav.dashboard') : t('auth.login')}
              </Link>
            </motion.div>

            {/* Hamburger */}
            <motion.button
              whileTap={{ scale: 0.88, rotate: 5 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-primary rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <motion.div
                animate={isMobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Spacer to offset fixed header */}
      <div className="h-16" />

      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
