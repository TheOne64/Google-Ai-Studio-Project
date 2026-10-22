import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  School,
  Compass,
  AlertCircle,
  KeyRound,
  Lock,
  UserPlus,
  LogIn,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { GoogleIcon, MicrosoftIcon, AppleIcon } from './ProviderIcons';
import { User } from '../types';
import OAuthModal from './OAuthModal';
import EmailVerificationModal from './EmailVerificationModal';
import IdentityVerificationModal from './IdentityVerificationModal';
import { validateEmailLogin, registerNewAccount, INITIAL_REGISTERED_ACCOUNTS, getRegisteredAccounts } from '../utils/authStorage';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  suggestedEmail?: string;
  isSwitchingAccount?: boolean;
  onCancelSwitch?: () => void;
}

export default function LoginScreen({
  onLoginSuccess,
  suggestedEmail = 'thompsondemi686@gmail.com',
  isSwitchingAccount = false,
  onCancelSwitch
}: LoginScreenProps) {
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<'google' | 'microsoft' | 'apple' | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(suggestedEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Security layer states
  const [pendingIdentityUser, setPendingIdentityUser] = useState<User | null>(null);
  const [pendingMagicLinkUser, setPendingMagicLinkUser] = useState<User | null>(null);

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    if (authMode === 'signin') {
      // 1. Verify that an account has been created with this email
      // 2. Verify if the password is correct or incorrect
      const result = validateEmailLogin(cleanEmail, password);

      if (!result.success) {
        setErrorMsg(result.error || 'Authentication failed.');
        if (result.code === 'WRONG_PASSWORD') {
          setPassword(''); // Clear password on wrong attempt so user can re-try
        }
        return;
      }

      // Valid credentials! Proceed to Identity Verification Security layer
      setPendingIdentityUser(result.user!);
    } else {
      // Create Account (Sign Up) mode
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter your password.');
        return;
      }

      const userName = name.trim() || cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const result = registerNewAccount(userName, cleanEmail, password, institution, 'email');

      if (!result.success) {
        setErrorMsg(result.error || 'Failed to create account.');
        return;
      }

      // New account registered! Proceed to Identity Verification Security layer
      setPendingIdentityUser(result.user!);
    }
  };

  const handleMagicLinkRequest = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email above to receive an instant sign-in link.');
      return;
    }
    setErrorMsg('');

    // In sign-in mode, verify account exists first
    if (authMode === 'signin') {
      const allAccounts = getRegisteredAccounts();
      const existing = allAccounts.find(a => a.user.email.toLowerCase().trim() === cleanEmail);
      if (!existing) {
        setErrorMsg(`No account found with "${cleanEmail}". Please switch to "Create Account" first to register.`);
        return;
      }
      setPendingMagicLinkUser(existing.user);
    } else {
      const userName = name.trim() || cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const newUser: User = {
        id: `user-email-${Date.now()}`,
        name: userName,
        email: cleanEmail,
        provider: 'email',
        institution: institution.trim() || 'Independent Learner',
        role: 'Student',
        joinedAt: new Date().toISOString().split('T')[0]
      };
      setPendingMagicLinkUser(newUser);
    }
  };

  const handleGuestLogin = () => {
    const randomGuestNum = Math.floor(1000 + Math.random() * 9000);
    const guestUser: User = {
      id: `user-guest-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: `Guest Student #${randomGuestNum}`,
      email: `guest-${randomGuestNum}@syllabusstudyroad.app`,
      provider: 'guest',
      institution: 'Independent Learner (Guest)',
      role: 'Guest Student',
      joinedAt: new Date().toISOString().split('T')[0]
    };
    onLoginSuccess(guestUser);
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setConfirmPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white flex flex-col justify-between selection:bg-indigo-500/30">
      {/* Top Header Bar */}
      <div className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 -rotate-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white uppercase">
              Syllabus<span className="text-indigo-400">StudyRoad</span>
            </span>
            <div className="text-[10px] text-indigo-300 font-mono tracking-wider uppercase">Adaptive Study Planner</div>
          </div>
        </div>

        {isSwitchingAccount && onCancelSwitch && (
          <button
            onClick={onCancelSwitch}
            className="text-xs font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white cursor-pointer"
          >
            Return to Active Workspace
          </button>
        )}
      </div>

      {/* Main Grid Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Value Proposition & Educational Features */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Next-Gen Academic Productivity & Identity Protection</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Turn your class syllabus into a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-amber-300">
                  stress-free daily roadmap.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-indigo-200/80 max-w-2xl leading-relaxed">
                Securely sign in with verified credentials to build custom study schedules. Upload course syllabi,
                extract all deadlines, and let smart backwards scheduling pace your prep before every exam.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-white">AI Syllabus Scanner</h4>
                <p className="text-xs text-indigo-200/70 leading-normal">
                  Drop a picture or document of your syllabus to instantly pull deadlines and grade weights.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-white">Backwards Milestones</h4>
                <p className="text-xs text-indigo-200/70 leading-normal">
                  Tasks are scheduled backwards from the deadline, dodging busy days and burnout.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-white">Identity Security</h4>
                <p className="text-xs text-indigo-200/70 leading-normal">
                  Protected with two-factor identity verification and strict credential validation.
                </p>
              </div>
            </div>

            {/* Student Endorsements / Trust */}
            <div className="flex items-center gap-4 pt-2 border-t border-white/10 text-xs text-indigo-200/70">
              <div className="flex -space-x-2">
                <img
                  className="w-8 h-8 rounded-full border-2 border-indigo-950 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Student"
                />
                <img
                  className="w-8 h-8 rounded-full border-2 border-indigo-950 object-cover"
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Student"
                />
                <img
                  className="w-8 h-8 rounded-full border-2 border-indigo-950 object-cover"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Student"
                />
              </div>
              <div>
                <span className="font-bold text-white">100% Student Data Isolation</span> • Verified academic profiles only.
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card with Clear Tabs */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-900 rounded-[2.5rem] p-6 sm:p-9 shadow-2xl border-4 border-indigo-200/40 relative">
              {/* PRIMARY TOGGLE: SIGN IN vs CREATE ACCOUNT TABS */}
              <div className="mb-6">
                <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200 shadow-inner">
                  <button
                    type="button"
                    id="tab-auth-signin"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-white text-indigo-900 shadow-md border border-slate-200/80 scale-[1.02]'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <LogIn className="w-4 h-4 text-indigo-600" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    id="tab-auth-signup"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-white text-indigo-900 shadow-md border border-slate-200/80 scale-[1.02]'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    <span>Create Account</span>
                  </button>
                </div>
              </div>

              {/* Header Title */}
              <div className="mb-5">
                <div className="text-xs font-black uppercase tracking-wider text-indigo-600 mb-1">
                  {authMode === 'signin' ? 'Registered Member Portal' : 'New Student Registration'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {authMode === 'signin' ? 'Sign In to Your Account' : 'Create Student Account'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {authMode === 'signin'
                    ? 'Sign-in requires an existing registered account with correct password.'
                    : 'Register your email & password to create your isolated study workspace.'}
                </p>
              </div>

              {/* THREE MAIN SINGLE-SIGN-ON PROVIDERS */}
              <div className="space-y-2.5 mb-5">
                {/* 1. GOOGLE SIGN IN */}
                <button
                  type="button"
                  id="btn-login-google"
                  onClick={() => {
                    setErrorMsg('');
                    setActiveOAuthProvider('google');
                  }}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-200 hover:border-slate-300 rounded-2xl font-bold text-xs text-slate-800 transition-all shadow-xs flex items-center justify-center gap-3 group cursor-pointer"
                >
                  <GoogleIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>
                    {authMode === 'signin' ? 'Sign In with Google' : 'Register with Google'}
                  </span>
                </button>

                {/* 2. MICROSOFT SIGN IN */}
                <button
                  type="button"
                  id="btn-login-microsoft"
                  onClick={() => {
                    setErrorMsg('');
                    setActiveOAuthProvider('microsoft');
                  }}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-200 hover:border-slate-300 rounded-2xl font-bold text-xs text-slate-800 transition-all shadow-xs flex items-center justify-center gap-3 group cursor-pointer"
                >
                  <MicrosoftIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>
                    {authMode === 'signin' ? 'Sign In with Microsoft' : 'Register with Microsoft'}
                  </span>
                </button>

                {/* 3. APPLE SIGN IN */}
                <button
                  type="button"
                  id="btn-login-apple"
                  onClick={() => {
                    setErrorMsg('');
                    setActiveOAuthProvider('apple');
                  }}
                  className="w-full py-3 px-4 bg-black hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-3 group cursor-pointer"
                >
                  <AppleIcon className="w-4 h-4 text-white transition-transform group-hover:scale-110" />
                  <span>
                    {authMode === 'signin' ? 'Sign In with Apple' : 'Register with Apple'}
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-5">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider relative">
                  or with email & password
                </span>
              </div>

              {/* Error Message Banner */}
              {errorMsg && (
                <div className="mb-4 p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex flex-col gap-1.5 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                  {/* Contextual quick button to switch tabs if account not found */}
                  {errorMsg.includes('Create Account') && authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMsg('');
                      }}
                      className="text-xs text-indigo-700 font-black underline text-left ml-6 cursor-pointer"
                    >
                      👉 Click here to switch to Create Account
                    </button>
                  )}
                  {errorMsg.includes('Sign In') && authMode === 'signup' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMsg('');
                      }}
                      className="text-xs text-indigo-700 font-black underline text-left ml-6 cursor-pointer"
                    >
                      👉 Click here to switch to Sign In
                    </button>
                  )}
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Demi Thompson"
                        className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                        style={{ color: '#0f172a' }}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        School / Institution (Optional)
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. UC Berkeley"
                        className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                        style={{ color: '#0f172a' }}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu or student@gmail.com"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      {authMode === 'signin' ? 'Account Password *' : 'Create Password *'}
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={handleMagicLinkRequest}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Email login link</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                      style={{ color: '#0f172a' }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-auth-submit"
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {authMode === 'signin' ? 'Sign In & Verify Identity' : 'Create Account & Continue'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* DEMO CREDENTIALS HELPER DRAWER */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-indigo-600 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Demo Accounts & Passwords for Testing</span>
                  </span>
                  {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showDemoAccounts && (
                  <div className="mt-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 animate-in fade-in">
                    <div className="text-[10px] font-black uppercase text-slate-400">
                      Pre-registered Accounts:
                    </div>

                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                      <div>
                        <div className="font-bold text-slate-800 text-[11px]">thompsondemi686@gmail.com</div>
                        <div className="text-[10px] text-slate-500 font-mono">Pass: Password123! (Google / Email)</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('thompsondemi686@gmail.com', 'Password123!')}
                        className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                      <div>
                        <div className="font-bold text-slate-800 text-[11px]">alex.johnson@student.edu</div>
                        <div className="text-[10px] text-slate-500 font-mono">Pass: Microsoft123! (Microsoft)</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFillDemo('alex.johnson@student.edu', 'Microsoft123!')}
                        className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-500 italic pt-1">
                      💡 Tip: Try entering the wrong password to test password detection, or an unregistered email on Sign In to test account existence enforcement!
                    </div>
                  </div>
                )}
              </div>

              {/* EXPLORE AS GUEST OPTION */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  id="btn-login-guest"
                  onClick={handleGuestLogin}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 active:scale-[0.99] border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-2xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    <span>Explore as Guest (Independent Preview)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Fresh empty slate • Progress will not save to save RAM & data
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-indigo-300/60 gap-3">
        <div>Protected with end-to-end local student data isolation & 2FA security</div>
        <div>SyllabusStudyRoad • Google • Microsoft • Apple Authentication Ready</div>
      </div>

      {/* OAUTH INTERACTIVE DIALOG MODAL */}
      <OAuthModal
        provider={activeOAuthProvider}
        mode={authMode}
        onClose={() => setActiveOAuthProvider(null)}
        onSwitchMode={(newMode) => setAuthMode(newMode)}
        onSuccess={(user) => {
          setActiveOAuthProvider(null);
          // Pass through Identity Verification Security layer
          setPendingIdentityUser(user);
        }}
        suggestedEmail={suggestedEmail}
      />

      {/* LAYER OF SECURITY: IDENTITY VERIFICATION MODAL */}
      {pendingIdentityUser && (
        <IdentityVerificationModal
          user={pendingIdentityUser}
          isOpen={true}
          onVerified={() => {
            const verified = pendingIdentityUser;
            setPendingIdentityUser(null);
            onLoginSuccess(verified);
          }}
          onCancel={() => setPendingIdentityUser(null)}
        />
      )}

      {/* EMAIL MAGIC LINK DIALOG */}
      {pendingMagicLinkUser && (
        <EmailVerificationModal
          email={pendingMagicLinkUser.email}
          name={pendingMagicLinkUser.name}
          isOpen={true}
          onVerified={() => {
            const verified = pendingMagicLinkUser;
            setPendingMagicLinkUser(null);
            // Also pass through Identity Verification Checkpoint
            setPendingIdentityUser(verified);
          }}
          onCancel={() => setPendingMagicLinkUser(null)}
        />
      )}
    </div>
  );
}
