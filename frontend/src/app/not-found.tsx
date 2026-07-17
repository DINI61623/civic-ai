'use client';

import Link from 'next/link';
import { Landmark, ArrowLeft, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full text-center bg-white/70 backdrop-blur-md border border-slate-200/80 p-8 sm:p-10 rounded-3xl shadow-xl"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white mb-6 shadow-md border border-primary/20">
          <Landmark className="h-8 w-8" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-4">Page Not Found</h2>
        
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The government registry path or document you are trying to access does not exist or has been relocated.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex-1">
            <button className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold py-3 px-4 rounded-xl transition-all shadow-sm shadow-primary/20 active:scale-95 cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Go Home
            </button>
          </Link>
          
          <Link href="/ai-assistant" className="flex-1">
            <button className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 hover:border-accent bg-white text-slate-700 hover:text-accent text-xs font-extrabold py-3 px-4 rounded-xl transition-all active:scale-95 cursor-pointer">
              <MessageSquareText className="h-4 w-4" /> Ask AI
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
