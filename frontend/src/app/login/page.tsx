'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Eye, EyeOff, Mail, Lock, Landmark, 
  AlertCircle, CheckCircle 
} from 'lucide-react';
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
    return 'Password is too weak. It must be at least 8 characters long and contain numbers, symbols, and uppercase letters.';
  }
  if (message.includes('Email not confirmed') || message.includes('email_not_confirmed')) {
    return 'Your email has not been verified yet. Please check your inbox for the confirmation link.';
  }
  if (message.includes('Network request failed') || message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your network connection and try again.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many login attempts. Please wait a few minutes before trying again.';
  }
  return message;
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Forgot Password state toggle
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const supabase = createClient();
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const hasProfile = user?.user_metadata?.student_profile || user?.user_metadata?.farmer_profile;
      if (!hasProfile) {
        router.push('/profile-completion');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) throw error;

      setSuccess("Logged in successfully! Redirecting...");
      
      const loggedUser = data.user;
      const hasProfile = loggedUser?.user_metadata?.student_profile || loggedUser?.user_metadata?.farmer_profile;
      
      setTimeout(() => {
        if (!hasProfile) {
          router.push('/profile-completion');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }, 1000);

    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!forgotEmail.trim()) {
      setError("Please input your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      setSuccess("A recovery link has been sent to your email address!");
      setForgotEmail('');
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-850 p-8 sm:p-10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-200/80 dark:border-slate-800 z-10">
        
        {/* Header Section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-primary to-secondary p-3.5 inline-flex rounded-2xl shadow-md shadow-primary/10 mb-5">
            <Landmark className="h-7 w-7 text-white" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {isForgotMode ? "Reset Password" : "Welcome Back 👋"}
          </h2>
          <p className="mt-2 text-xs md:text-sm text-foreground-muted max-w-xs mx-auto leading-relaxed">
            {isForgotMode 
              ? "Provide your email address to receive password recovery guidelines."
              : "Sign in to continue your CivicAI journey."
            }
          </p>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="bg-rose-50 border border-rose-200/60 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs p-4 rounded-xl flex items-start gap-2.5 font-medium leading-relaxed">
            <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs p-4 rounded-xl flex items-start gap-2.5 font-medium leading-relaxed">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {isForgotMode ? (
          <form onSubmit={handleForgotPasswordSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="text-xs font-bold text-slate-550 dark:text-slate-450 block mb-1.5 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-primary transition-colors outline-none font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                isLoading={forgotLoading}
                variant="primary"
                fullWidth
                className="font-extrabold rounded-xl py-3 cursor-pointer"
              >
                Send Reset Link
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-1 transition-colors focus:outline-none cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* REGULAR LOGIN FORM */
          <div className="space-y-6">
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-xs font-bold text-slate-550 dark:text-slate-450 block mb-1.5 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-primary transition-colors outline-none font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-slate-550 dark:text-slate-450 uppercase">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-xs font-bold text-primary hover:underline focus:outline-none bg-transparent border-0 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-primary transition-colors outline-none font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 cursor-pointer focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-350 text-primary focus:ring-primary/25 cursor-pointer dark:bg-slate-900 dark:border-slate-800"
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-xs font-semibold text-slate-650 dark:text-slate-450 select-none cursor-pointer">
                  Remember my session on this device
                </label>
              </div>

              {/* Submit Sign In */}
              <div>
                <Button
                  type="submit"
                  isLoading={loading}
                  variant="primary"
                  fullWidth
                  className="font-extrabold rounded-xl py-3 cursor-pointer"
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-foreground-muted font-bold">
                New to CivicAI?
                <Link 
                  href="/signup" 
                  className="text-primary hover:underline ml-1.5 font-extrabold cursor-pointer"
                >
                  Create an account today
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
