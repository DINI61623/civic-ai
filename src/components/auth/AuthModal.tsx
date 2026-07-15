'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Landmark, Loader2, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

// Friendly error messages mapped to user-friendly format
const getFriendlyErrorMessage = (error: any) => {
  if (!error) return null;
  const message = error.message || String(error);
  
  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials') || message.includes('Invalid email or password')) {
    return 'Incorrect email or password. Please verify your credentials and try again.';
  }
  if (message.includes('User already registered') || message.includes('already registered')) {
    return 'This email address is already registered. Please sign in instead.';
  }
  if (message.includes('Password should be at least')) {
    return 'Password is too weak. It must be at least 8 characters long.';
  }
  if (message.includes('Network request failed') || message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your network connection and try again.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many login attempts. Please wait a few minutes before trying again.';
  }
  return message;
};

export default function AuthModal({ isOpen, onClose, message }: { isOpen: boolean, onClose: () => void, message?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // Password Strength parameters
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-rose-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500"];

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Initial Form Validations
    if (!email.trim() || !password.trim()) {
      setError("Please fill out all credentials.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Please input your full name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (strength < 2) {
        setError("Password must meet complexity rules.");
        return;
      }
      if (!termsAccepted) {
        setError("You must agree to the Terms and Privacy Policy.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });
        if (error) throw error;
        
        setSuccess("Account provisioned!");
        setTimeout(() => {
          onClose();
          router.push('/profile-completion');
          router.refresh();
        }, 1000);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        
        if (error) throw error;
        
        setSuccess("Success! Logging in...");
        
        setTimeout(() => {
          onClose();
          const loggedUser = data.user;
          const hasProfile = loggedUser?.user_metadata?.student_profile || loggedUser?.user_metadata?.farmer_profile || loggedUser?.user_metadata?.user_type;
          
          if (!hasProfile) {
            router.push('/profile-completion');
          } else {
            router.push('/dashboard');
          }
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
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
              className="bg-card w-full max-w-md rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] overflow-y-auto max-h-[90vh] pointer-events-auto border border-border"
            >
              <div className="p-8 relative">
                <button 
                  type="button"
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
 
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-primary to-secondary p-2.5 rounded-xl shadow-sm">
                    <Landmark className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">CivicAI</h2>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-1.5">
                  {message || (isSignUp ? "Create your account" : "Sign in to continue")}
                </h3>
                <p className="text-foreground-muted text-xs mb-6">
                  Uncover personalized assistance programs, save opportunities, and compute matching scores.
                </p>

                {error && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30 text-xs p-3.5 rounded-xl mb-5 font-semibold flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900/30 text-xs p-3.5 rounded-xl mb-5 font-semibold flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Google Sign-in Styled as Prominent Action */}
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/95 hover:to-secondary/95 text-white font-extrabold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 text-xs cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg focus:outline-none mb-5"
                >
                  <div className="bg-white p-1 rounded-lg">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-3.5 h-3.5" alt="Google" />
                  </div>
                  Continue with Google
                </button>

                <div className="relative flex items-center py-1 mb-5">
                  <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
                  <span className="shrink-0 px-3 text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider">or email access</span>
                  <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="text-xs font-bold text-slate-550 dark:text-slate-455 block mb-1.5 uppercase">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 text-xs border border-slate-205 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" 
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-550 dark:text-slate-455 block mb-1.5 uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 text-xs border border-slate-205 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" 
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-550 dark:text-slate-455 block mb-1.5 uppercase">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-2.5 text-xs border border-slate-205 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" 
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {isSignUp && password.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className="text-slate-400 uppercase">Password Strength</span>
                          <span className={`px-2 py-0.5 rounded-md text-white ${strengthColors[strength - 1] || 'bg-slate-300'}`}>
                            {strengthLabels[strength - 1] || "Too Short"}
                          </span>
                        </div>
                        <div className="flex gap-1 h-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div 
                              key={step} 
                              className={`flex-1 rounded-full transition-colors ${
                                step <= strength ? strengthColors[strength - 1] : 'bg-slate-100 dark:bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isSignUp && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-550 dark:text-slate-455 block mb-1.5 uppercase">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-11 pr-11 py-2.5 text-xs border border-slate-205 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" 
                            placeholder="Re-type password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <input
                          id="modal-terms"
                          type="checkbox"
                          required
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer dark:bg-slate-900 dark:border-slate-800"
                        />
                        <label htmlFor="modal-terms" className="ml-2 block text-[10.5px] text-slate-550 dark:text-slate-450 leading-normal select-none cursor-pointer">
                          I agree to the Terms of Service and Privacy Policy.
                        </label>
                      </div>
                    </>
                  )}
                  
                  <Button
                    type="submit" 
                    isLoading={loading}
                    variant="primary"
                    fullWidth
                    className="font-extrabold rounded-xl py-3 cursor-pointer mt-4"
                  >
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <p className="text-xs text-foreground-muted font-bold">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <button 
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-primary font-extrabold ml-1.5 hover:underline focus:outline-none cursor-pointer"
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
