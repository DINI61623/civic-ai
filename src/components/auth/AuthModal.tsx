'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Landmark, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AuthModal({ isOpen, onClose, message }: { isOpen: boolean, onClose: () => void, message?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // On success, AuthProvider will detect session and close modal
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] overflow-hidden pointer-events-auto border border-border"
            >
              <div className="p-8">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-sm">
                    <Landmark className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">CivicAI</h2>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {message || "Sign in to continue"}
                </h3>
                <p className="text-foreground-muted text-sm mb-8">
                  Create a personalized dashboard, save opportunities, and get tailored recommendations.
                </p>

                {error && (
                  <div className="bg-danger/10 text-danger text-sm p-4 rounded-xl mb-6 border border-danger/20 font-medium">
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-foreground font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all mb-6"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Sign in with Google
                </button>

                <div className="relative flex items-center py-2 mb-6">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="shrink-0 px-4 text-slate-400 text-sm font-medium">or continue with email</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 text-sm border-2 border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">Password</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 text-sm border-2 border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                  </button>
                </form>

                <div className="text-center mt-8">
                  <p className="text-sm text-foreground-muted font-medium">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <button 
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-primary font-bold ml-2 hover:underline focus:outline-none"
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
