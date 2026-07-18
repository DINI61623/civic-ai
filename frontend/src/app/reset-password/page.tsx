'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Lock, Landmark, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

// Friendly error messages mapped to user-friendly format
const getFriendlyErrorMessage = (error: any) => {
  if (!error) return null;
  const message = error.message || String(error);
  
  if (message.includes('Password should be at least')) {
    return 'Password is too weak. It must be at least 8 characters long.';
  }
  if (message.includes('Network request failed') || message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your network connection and try again.';
  }
  if (message.includes('Session expired') || message.includes('invalid flow') || message.includes('auth_callback_failed')) {
    return 'Your reset session has expired or is invalid. Please request a new password recovery link.';
  }
  return message;
};

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Re-type passwords.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (strength < 2) {
      setError("Please configure a stronger password meeting complexity rules.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess("Your password has been reset successfully! Redirecting...");
      
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
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
            Reset Your Password
          </h2>
          <p className="mt-2 text-xs md:text-sm text-foreground-muted max-w-xs mx-auto leading-relaxed">
            Choose a strong new password for your CivicAI account.
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

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="text-xs font-bold text-slate-550 dark:text-slate-450 block mb-1.5 uppercase">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-655 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
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
                  
                  {/* Strength guidelines details */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px] font-semibold text-slate-455 mt-1">
                    <div className="flex items-center gap-1">
                      <span className={password.length >= 8 ? "text-emerald-500" : "text-slate-350"}>✔</span> 8+ Characters
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={/[A-Z]/.test(password) ? "text-emerald-500" : "text-slate-350"}>✔</span> 1+ Uppercase
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={/[0-9]/.test(password) ? "text-emerald-500" : "text-slate-350"}>✔</span> 1+ Number
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-500" : "text-slate-350"}>✔</span> 1+ Special Character
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-550 dark:text-slate-450 block mb-1.5 uppercase">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                  placeholder="Re-type password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-655 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Reset Password */}
          <div>
            <Button
              type="submit"
              isLoading={loading}
              variant="primary"
              fullWidth
              className="font-extrabold rounded-xl py-3 cursor-pointer"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
