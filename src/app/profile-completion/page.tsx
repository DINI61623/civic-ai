'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Loader2, GraduationCap, Leaf, Landmark, 
  AlertCircle, CheckCircle, ChevronRight
} from 'lucide-react';
import { FALLBACK_STATES } from '@/lib/fallbackData';
import Button from '@/components/ui/Button';

const STUDENT_INTERESTS = [
  'UPSC', 'SSC', 'Banking', 'Railways', 'Defence', 'PSU', 
  'State Government Jobs', 'Engineering Jobs', 'IT Jobs', 
  'Scholarships', 'Higher Education', 'Skill Development'
];

const LANGUAGES = [
  'English', 'Hindi', 'Telugu', 'Tamil', 'Marathi', 
  'Bengali', 'Kannada', 'Odia', 'Punjabi', 'Gujarati'
];

export default function ProfileCompletionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1); // Step 1: User Type, Step 2: Form
  const [userType, setUserType] = useState<'student' | 'farmer' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Student specific state
  const [qualification, setQualification] = useState('Graduate');
  const [studentStateId, setStudentStateId] = useState('');
  const [studentStateName, setStudentStateName] = useState('');
  const [age, setAge] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [dreamCareer, setDreamCareer] = useState('');

  // Farmer specific state
  const [farmerStateId, setFarmerStateId] = useState('');
  const [farmerStateName, setFarmerStateName] = useState('');
  const [farmingType, setFarmingType] = useState('');
  const [language, setLanguage] = useState('English');

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let profileData = {};
      
      if (userType === 'student') {
        if (!studentStateId) throw new Error("Please select your Domicile State.");
        if (!age || isNaN(parseInt(age))) throw new Error("Please input a valid numeric age.");
        
        profileData = {
          fullName: user.user_metadata?.full_name || 'Citizen Student',
          highestQualification: qualification,
          stateId: studentStateId,
          stateName: studentStateName,
          age: parseInt(age),
          category: category || 'General',
          interests: selectedInterests,
          dreamCareer: dreamCareer.trim() || undefined,
          dob: new Date(new Date().getFullYear() - parseInt(age), 6, 15).toISOString().split('T')[0] // approximate DOB
        };
      } else {
        if (!farmerStateId) throw new Error("Please select your Domicile State.");
        
        profileData = {
          fullName: user.user_metadata?.full_name || 'Citizen Farmer',
          stateId: farmerStateId,
          stateName: farmerStateName,
          farmingType: farmingType.trim() || 'General Farming',
          language,
          interests: ['Welfare Schemes', 'Agriculture Helper']
        };
      }

      // Update Supabase Auth metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          user_type: userType,
          [userType === 'student' ? 'student_profile' : 'farmer_profile']: profileData
        }
      });

      if (metaError) throw metaError;

      // Upsert into profiles DB table
      const { error: dbError } = await (supabase.from('profiles') as any)
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || (userType === 'student' ? 'Citizen Student' : 'Citizen Farmer'),
          role: 'citizen',
          updated_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      setSuccess("Profile settings saved successfully!");
      
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Failed to update profile onboarding settings.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-slate-850 p-8 sm:p-10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-200/80 dark:border-slate-800 z-10">
        
        {/* Logo and Progress Header */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-primary to-secondary p-3.5 inline-flex rounded-2xl shadow-md shadow-primary/10 mb-4">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Set up your CivicAI Profile
          </h2>
          <p className="mt-2 text-xs md:text-sm text-foreground-muted max-w-xs mx-auto leading-relaxed">
            Quickly customize your experience in under a minute.
          </p>

          {/* Stepper progress indicator */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
              <span>{step === 1 ? "Step 1 of 2: Select Profile Mode" : "Step 2 of 2: Configure Details"}</span>
              <span>{step === 1 ? "50%" : "100%"}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: step === 1 ? "50%" : "100%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
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

        {/* STEP 1: CHOOSE PROFILE USER TYPE */}
        {step === 1 && (
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Mode Card */}
              <button 
                onClick={() => {
                  setUserType('student');
                  setStep(2);
                }}
                className="bg-slate-50 hover:bg-slate-100/50 border-2 border-slate-200 hover:border-primary/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 transition-all group focus:outline-none cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:border-primary/45"
              >
                <div className="p-4 rounded-full bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 group-hover:scale-105 transition-transform">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Student / Aspirant</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal mt-1 max-w-[170px] mx-auto">Find government job exams, higher education details, and scholarships.</p>
                </div>
              </button>

              {/* Farmer Mode Card */}
              <button 
                onClick={() => {
                  setUserType('farmer');
                  setStep(2);
                }}
                className="bg-slate-50 hover:bg-slate-100/50 border-2 border-slate-200 hover:border-emerald-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 transition-all group focus:outline-none cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:border-emerald-950/45"
              >
                <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 group-hover:scale-105 transition-transform">
                  <Leaf className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-855 dark:text-white text-base">Farmer / Citizen</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal mt-1 max-w-[170px] mx-auto">Unlock welfare schemes, crop subsidies, and citizen assistance tools.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS INPUT FORMS */}
        {step === 2 && (
          <form onSubmit={handleSaveProfile} className="space-y-6 pt-2">
            
            {/* STUDENT FORM FIELDS */}
            {userType === 'student' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Domicile State */}
                  <div>
                    <label className="block text-xs font-bold text-slate-555 dark:text-slate-455 mb-1.5 uppercase">Domicile State</label>
                    <select 
                      required
                      value={studentStateId}
                      onChange={(e) => {
                        const match = FALLBACK_STATES.find(s => s.id === e.target.value);
                        setStudentStateId(e.target.value);
                        setStudentStateName(match ? match.name : '');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    >
                      <option value="">Select State</option>
                      {FALLBACK_STATES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="block text-xs font-bold text-slate-555 dark:text-slate-455 mb-1.5 uppercase">Highest Qualification</label>
                    <select 
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    >
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="Diploma">Diploma / Polytechnic</option>
                      <option value="Graduate">Graduate / Degree</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-slate-555 dark:text-slate-455 mb-1.5 uppercase">Age (Years)</label>
                    <input 
                      type="number"
                      required
                      min={10}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 21"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    />
                  </div>

                  {/* Dream Career */}
                  <div>
                    <label className="block text-xs font-bold text-slate-555 dark:text-slate-455 mb-1.5 uppercase">Dream Career (Optional)</label>
                    <input 
                      type="text"
                      value={dreamCareer}
                      onChange={(e) => setDreamCareer(e.target.value)}
                      placeholder="e.g. IAS Officer, Architect"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    />
                  </div>
                </div>

                {/* Career Interests Pills selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-555 dark:text-slate-455 mb-2 uppercase">Career Interests (Select multi)</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {STUDENT_INTERESTS.map((opt) => {
                      const active = selectedInterests.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInterestToggle(opt)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            active 
                              ? 'bg-primary/5 border-primary text-primary shadow-xs'
                              : 'bg-slate-50 border-slate-250 text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-455'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* FARMER FORM FIELDS */}
            {userType === 'farmer' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-slate-555 dark:text-slate-455 mb-1.5 uppercase">Domicile State</label>
                    <select 
                      required
                      value={farmerStateId}
                      onChange={(e) => {
                        const match = FALLBACK_STATES.find(s => s.id === e.target.value);
                        setFarmerStateId(e.target.value);
                        setFarmerStateName(match ? match.name : '');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    >
                      <option value="">Select State</option>
                      {FALLBACK_STATES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Language */}
                  <div>
                    <label className="block text-xs font-bold text-slate-555 dark:text-slate-455 mb-1.5 uppercase">Preferred Language</label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none cursor-pointer font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  {/* Farming Type */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-555 dark:text-slate-455 mb-1.5 uppercase">Farming Type (Optional)</label>
                    <input 
                      type="text"
                      value={farmingType}
                      onChange={(e) => setFarmingType(e.target.value)}
                      placeholder="e.g. Rice, Wheat, Cotton, Sugarcane, Dairy Farming"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-primary transition-colors outline-none font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setUserType(null);
                  setError(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
              >
                Back
              </button>
              
              <Button
                type="submit"
                isLoading={loading}
                variant="primary"
                className="font-extrabold px-6 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                Save profile <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
