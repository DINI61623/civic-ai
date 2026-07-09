'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('CivicAI uncaught rendering boundary error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full text-center bg-white/70 backdrop-blur-md border border-slate-200/80 p-8 sm:p-10 rounded-3xl shadow-xl"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white mb-6 shadow-md border border-rose-500/20">
          <ShieldAlert className="h-8 w-8" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">System Notice</h1>
        <h2 className="text-sm font-bold text-slate-500 mb-6">An unexpected error occurred during rendering.</h2>
        
        <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-8 text-left font-mono break-all max-h-32 overflow-y-auto">
          {error.message || 'No specific details returned. Recovering application state.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold py-3 px-4 rounded-xl transition-all shadow-sm shadow-primary/20 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          
          <Link href="/" className="flex-1">
            <button className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-extrabold py-3 px-4 rounded-xl transition-all active:scale-95 cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Go Home
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
