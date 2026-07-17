'use client';

import { motion } from 'framer-motion';

export default function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col h-full overflow-hidden"
        >
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-16 bg-slate-200 animate-pulse rounded-lg"></div>
            <div className="h-5 w-24 bg-slate-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="h-5 w-3/4 bg-slate-200 animate-pulse rounded-md mb-2"></div>
          <div className="h-5 w-1/2 bg-slate-200 animate-pulse rounded-md mb-6"></div>
          
          <div className="h-10 w-full bg-slate-100 animate-pulse rounded-xl mb-4"></div>
          
          <div className="flex gap-2 mt-auto">
            <div className="h-10 w-full bg-slate-200 animate-pulse rounded-xl"></div>
            <div className="h-10 w-full bg-slate-200 animate-pulse rounded-xl"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
