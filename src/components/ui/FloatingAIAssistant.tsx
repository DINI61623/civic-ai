'use client';
import { useState } from 'react';
import { MessageSquareText, X, Send, Bot, ShieldAlert, Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsOpen(false);
    router.push(`/ai-assistant?query=${encodeURIComponent(input.trim())}`);
    setInput('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 h-16 w-16 bg-gradient-to-br from-secondary to-primary text-white rounded-2xl shadow-[0_8px_30px_rgb(79,70,229,0.3)] flex items-center justify-center z-50 transition-all ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Ask CivicAI"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/50 to-secondary/50 blur-lg -z-10 animate-pulse"></div>
        <MessageSquareText className="h-7 w-7" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-8 right-8 w-[calc(100vw-32px)] max-w-[420px] h-[550px] bg-card rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.12)] border border-border flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Sparkles className="h-24 w-24" />
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-sm">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Ask CivicAI</h3>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span> Online & Ready
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors relative z-10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 p-2.5 text-xs font-medium text-amber-700 flex items-center justify-center gap-2 border-b border-amber-100/50">
              <ShieldAlert className="h-3.5 w-3.5" /> AI can make mistakes. Verify official links.
            </div>

            {/* Body */}
            <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-sm text-sm text-foreground shadow-sm">
                  <p className="font-medium mb-1">Namaste! I am your Premium CivicAI assistant.</p>
                  <p className="text-foreground-muted">How can I help you find government opportunities today?</p>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs font-semibold text-foreground-muted px-1 mb-1">Suggested prompts:</span>
                  {['Government jobs after 12th', 'Scholarships for girl child', 'Latest farmer schemes'].map((prompt, i) => (
                    <motion.button 
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/ai-assistant?query=${encodeURIComponent(prompt)}`);
                      }}
                      className="text-left text-sm bg-white border border-primary/20 hover:border-primary/50 text-primary py-2.5 px-4 rounded-xl flex items-center justify-between shadow-sm transition-colors cursor-pointer"
                    >
                      {prompt} <ChevronRight className="h-4 w-4 opacity-50" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Footer/Input */}
            <div className="p-4 border-t border-border bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <input 
                  type="text" 
                  placeholder="Ask anything..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-slate-100 border border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pl-4 pr-12 py-3 text-sm outline-none transition-all"
                />
                <button type="submit" className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-primary/90 text-white w-10 flex items-center justify-center rounded-lg shadow-sm transition-colors cursor-pointer">
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="text-center mt-3">
                <Link href="/ai-assistant" onClick={() => setIsOpen(false)} className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
                  Open Full Screen Assistant <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
