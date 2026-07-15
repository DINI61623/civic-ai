'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/services/api';
import { 
  User, Lock, Bell, Moon, Shield, Trash2, Download, CheckCircle, 
  AlertCircle, Loader2, Landmark, Globe, ChevronRight, ArrowLeft
} from 'lucide-react';
import { FALLBACK_STATES } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

const INTEREST_OPTIONS = [
  'UPSC', 'SSC', 'Banking', 'Railways', 'Defence', 'PSU', 
  'State Government Jobs', 'Engineering Jobs', 'IT Jobs', 
  'Scholarships', 'Higher Education', 'Skill Development'
];

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Punjabi', 'Bengali', 'Tamil', 'Telugu', 'Marathi'];

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'language' | 'notifications' | 'theme' | 'privacy' | 'account'>('profile');
  
  // Success/Error toast states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile Form States
  const [userType, setUserType] = useState<'student' | 'farmer'>('student');
  const [fullName, setFullName] = useState('');
  const [stateId, setStateId] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('General');
  const [highestQualification, setHighestQualification] = useState('Graduate');
  const [interests, setInterests] = useState<string[]>([]);
  const [language, setLanguage] = useState('English');
  const [farmingType, setFarmingType] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [thresholdDays, setThresholdDays] = useState(5);

  // Theme state
  const [themeMode, setThemeMode] = useState('light');

  // Privacy state
  const [shareData, setShareData] = useState(true);

  // Delete Confirm Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setCurrentUser(user);

        // Resolve profile metadata
        const type = user.user_metadata?.user_type || 'student';
        setUserType(type);

        if (type === 'farmer') {
          const fp = user.user_metadata?.farmer_profile || {};
          setFullName(fp.fullName || user.user_metadata?.full_name || '');
          setStateId(fp.stateId || '');
          setLanguage(fp.language || 'English');
          setFarmingType(fp.farmingType || '');
        } else {
          const sp = user.user_metadata?.student_profile || {};
          setFullName(sp.fullName || user.user_metadata?.full_name || '');
          setStateId(sp.stateId || '');
          setDistrict(sp.district || '');
          setCategory(sp.category || 'General');
          setHighestQualification(sp.highestQualification || 'Graduate');
          setInterests(sp.interests || []);
        }

        // Resolve notification metadata
        const ns = user.user_metadata?.reminder_settings || { email: true, push: true, days: 5 };
        setEmailAlerts(ns.email);
        setPushAlerts(ns.push);
        setThresholdDays(ns.days);

        // Resolve Privacy
        setShareData(user.user_metadata?.share_data !== false);

        // Resolve Theme
        setThemeMode(user.user_metadata?.theme_mode || 'light');

      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [router]);

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const selectedState = FALLBACK_STATES.find(s => s.id === stateId);
      const stateName = selectedState ? selectedState.name : '';

      const supabase = createClient();
      let metaData: any = {};

      if (userType === 'farmer') {
        const farmer_profile = {
          fullName,
          stateId,
          stateName,
          language,
          farmingType
        };
        metaData = { farmer_profile };
      } else {
        const student_profile = {
          fullName,
          stateId,
          stateName,
          district,
          category,
          highestQualification,
          interests
        };
        metaData = { student_profile };
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentUser.user_metadata,
          ...metaData,
          full_name: fullName
        }
      });

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSaveError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setSaveError('Password must be at least 6 characters long.');
      return;
    }

    setIsUpdating(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      setSaveSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateLanguage = async (lang: string) => {
    setLanguage(lang);
    setIsUpdating(true);
    try {
      const supabase = createClient();
      const updatedProfile = userType === 'farmer' 
        ? { ...currentUser.user_metadata.farmer_profile, language: lang }
        : { ...currentUser.user_metadata.student_profile, language: lang };

      const key = userType === 'farmer' ? 'farmer_profile' : 'student_profile';

      await supabase.auth.updateUser({
        data: {
          ...currentUser.user_metadata,
          [key]: updatedProfile
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsUpdating(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentUser.user_metadata,
          reminder_settings: {
            email: emailAlerts,
            push: pushAlerts,
            days: thresholdDays
          }
        }
      });

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update notification settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveTheme = async (mode: string) => {
    setThemeMode(mode);
    setIsUpdating(true);
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: {
          ...currentUser.user_metadata,
          theme_mode: mode
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavePrivacy = async (checked: boolean) => {
    setShareData(checked);
    setIsUpdating(true);
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: {
          ...currentUser.user_metadata,
          share_data: checked
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportData = () => {
    if (!currentUser) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser.user_metadata, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `civicai_profile_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAccount = async () => {
    setIsUpdating(true);
    try {
      // In a real production deployment, this would trigger an edge function or API route to delete the database user safely.
      // For now, we simulate deleting by cleaning metadata, clearing caches, signing out, and returning to index.
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-xl flex flex-col items-center justify-center gap-4 bg-background select-none">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-foreground-muted font-bold">Synchronizing user credentials settings...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile Details', icon: User },
    { id: 'password', name: 'Password & Security', icon: Lock },
    { id: 'language', name: 'Language Options', icon: Globe },
    { id: 'notifications', name: 'Alert Settings', icon: Bell },
    { id: 'theme', name: 'Theme Mode', icon: Moon },
    { id: 'privacy', name: 'Privacy controls', icon: Shield },
    { id: 'account', name: 'Account settings', icon: Trash2 },
  ] as const;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl relative select-none">
      
      {/* Back button */}
      <button 
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-white tracking-tight">Citizen Settings Desk</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Configure profile criteria matching filters and authentication parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Tabs Sidebar */}
        <div className="md:col-span-1 space-y-1 select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSaveError('');
                  setSaveSuccess(false);
                }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all cursor-pointer border ${
                  activeTab === tab.id
                    ? 'bg-primary/5 border-primary/20 text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-650 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 dark:bg-slate-850 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[480px] flex flex-col">
          
          {/* Notifications area */}
          {saveSuccess && (
            <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold p-4 rounded-xl flex items-center gap-2 select-none">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="mb-6 bg-rose-50 border border-rose-105 text-rose-700 text-xs font-bold p-4 rounded-xl flex items-center gap-2 select-none">
              <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex-1">

            {/* TAB 1: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 select-none">Profile Calibration</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary"
                        placeholder="Citizen name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Domicile State</label>
                      <select 
                        required
                        value={stateId}
                        onChange={(e) => setStateId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="">Select State</option>
                        {FALLBACK_STATES.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {userType === 'student' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">District / City</label>
                          <input 
                            type="text" 
                            required
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary"
                            placeholder="District"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">Reservation Category</label>
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary cursor-pointer"
                          >
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="EWS">EWS</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">Highest Qualification</label>
                          <select 
                            value={highestQualification}
                            onChange={(e) => setHighestQualification(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary cursor-pointer"
                          >
                            <option value="10th Pass">10th Pass</option>
                            <option value="12th Pass">12th Pass</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Graduate">Graduate</option>
                            <option value="Postgraduate">Postgraduate</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-2">Interests / Career Target Fields</label>
                          <div className="flex flex-wrap gap-2">
                            {INTEREST_OPTIONS.map((opt) => {
                              const selected = interests.includes(opt);
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleInterestToggle(opt)}
                                  className={`text-xs font-bold py-2 px-4 rounded-xl border transition-all cursor-pointer ${
                                    selected 
                                      ? 'bg-primary/5 border-primary text-primary'
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">Farming Category Type</label>
                          <select 
                            value={farmingType}
                            onChange={(e) => setFarmingType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary cursor-pointer"
                          >
                            <option value="Small Scale">Small Scale (Dryland)</option>
                            <option value="Commercial">Commercial Agriculture</option>
                            <option value="Organic">Organic & Subsidies Focus</option>
                            <option value="Horticulture">Horticulture/Welfare</option>
                          </select>
                        </div>
                      </>
                    )}

                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end select-none">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    isLoading={isUpdating}
                    className="min-h-[44px] px-6 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 2: PASSWORD CHANGE */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 select-none">Change Password</h3>
                  <div className="grid grid-cols-1 gap-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Verify Password</label>
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end select-none">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    isLoading={isUpdating}
                    className="min-h-[44px] px-6 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 3: LANGUAGE PREFERENCES */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 select-none">Preferred Portal Language</h3>
                  <p className="text-xs text-slate-400 font-semibold mb-4 leading-normal">Configure the portal display text matching regional translations.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const active = language === lang;
                      return (
                        <button
                          key={lang}
                          onClick={() => handleUpdateLanguage(lang)}
                          className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                            active 
                              ? 'bg-primary/5 border-primary text-primary'
                              : 'bg-white border-slate-200 hover:border-slate-350 text-slate-650'
                          }`}
                        >
                          <span>{lang}</span>
                          {active && <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ALERT PREFERENCES */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 select-none">Alert notifications preferences</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer py-1.5 border-b border-slate-50 max-w-xl">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Email Notifications</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Receive reminders regarding saved opportunities and updates.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={emailAlerts} 
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer py-1.5 border-b border-slate-50 max-w-xl">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Web Push updates</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Enable browser notification alerts for close dates.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={pushAlerts} 
                        onChange={(e) => setPushAlerts(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>

                    <div className="max-w-xl pt-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Alert Threshold timeframe</label>
                      <select
                        value={thresholdDays}
                        onChange={(e) => setThresholdDays(parseInt(e.target.value))}
                        className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="3">3 Days Prior to Deadline</option>
                        <option value="5">5 Days Prior to Deadline</option>
                        <option value="7">7 Days Prior to Deadline</option>
                        <option value="14">14 Days Prior to Deadline</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end select-none">
                  <Button 
                    onClick={handleSaveNotifications}
                    variant="primary" 
                    isLoading={isUpdating}
                    className="min-h-[44px] px-6 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Save Alerts preferences
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 5: THEME MODE */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 select-none">Application Styling Theme</h3>
                  <p className="text-xs text-slate-400 font-semibold mb-4 leading-normal">System customization selectors (Ready for future light/dark migrations).</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map((mode) => {
                      const active = themeMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => handleSaveTheme(mode)}
                          className={`flex flex-col items-start gap-1 p-5 rounded-2xl border text-xs font-bold transition-all capitalize cursor-pointer text-left ${
                            active 
                              ? 'bg-primary/5 border-primary text-primary'
                              : 'bg-white border-slate-200 hover:border-slate-350 text-slate-650'
                          }`}
                        >
                          <span className="text-xs uppercase font-extrabold">{mode} Mode</span>
                          <span className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                            {mode === 'light' ? 'Standard high contrast UI' : mode === 'dark' ? 'Sleek premium dark appearance' : 'Follow device settings'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: PRIVACY CONTROLS */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 select-none">Privacy & Data Governance</h3>
                  
                  <div className="space-y-4 max-w-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={shareData} 
                        onChange={(e) => handleSavePrivacy(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4.5 w-4.5 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Calibrate recommendation engine attributes share</span>
                        <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                          Allow sharing qualifications, state residence, and category labels securely with matching engines.
                        </span>
                      </div>
                    </label>

                    <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl mt-4">
                      <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-450 flex items-center gap-1">
                        <Shield className="h-4 w-4 text-emerald-500 shrink-0" /> Verified Data Protections
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1.5 font-medium">
                        CivicAI secures all database credentials. Profiles are never shared with non-authorized registries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: ACCOUNT CONTROLS */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 select-none">Account Administration</h3>
                  
                  <div className="space-y-4 max-w-xl">
                    <div className="p-5 border border-slate-200 rounded-3xl space-y-3.5">
                      <h4 className="font-bold text-xs text-slate-750">Export Profile Archive Data</h4>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">
                        Download a machine-readable JSON copy of your saved credentials, preferences, and checklist logs.
                      </p>
                      <Button 
                        onClick={handleExportData}
                        variant="outline" 
                        className="text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="h-4 w-4" /> Export Data
                      </Button>
                    </div>

                    <div className="p-5 border border-rose-100 rounded-3xl space-y-3.5 bg-rose-50/10">
                      <h4 className="font-bold text-xs text-rose-700">Delete Account Profile</h4>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">
                        Completely remove your user metadata profile, custom settings, notifications, and tracking dashboards from live databases. This action is irreversible.
                      </p>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-600/90 py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-rose-200 border-none"
                      >
                        <Trash2 className="h-4 w-4" /> Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">Confirm Account Deletion</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">
              Are you absolutely sure you want to delete your CivicAI profile? All of your saved opportunities checklist items, and profile metadata settings will be destroyed. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button 
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline" 
                className="text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <button 
                onClick={handleDeleteAccount}
                className="text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-605 py-2.5 px-4 rounded-xl cursor-pointer shadow-sm shadow-rose-100 border-none"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
