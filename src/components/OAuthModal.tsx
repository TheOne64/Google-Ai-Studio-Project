import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ArrowRight, School, Lock, AlertCircle, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { GoogleIcon, MicrosoftIcon, AppleIcon } from './ProviderIcons';
import { User, AuthProvider } from '../types';
import { validateProviderAuth, findRegisteredAccountByEmail } from '../utils/authStorage';

interface OAuthModalProps {
  provider: 'google' | 'microsoft' | 'apple' | null;
  mode: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchMode?: (newMode: 'signin' | 'signup') => void;
  suggestedEmail?: string;
}

export default function OAuthModal({
  provider,
  mode,
  onClose,
  onSuccess,
  onSwitchMode,
  suggestedEmail = 'thompsondemi686@gmail.com'
}: OAuthModalProps) {
  if (!provider) return null;

  // Google State
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState(suggestedEmail || '');
  const [googleError, setGoogleError] = useState('');

  // Microsoft State
  const [msEmail, setMsEmail] = useState('');
  const [msName, setMsName] = useState('');
  const [msIsSchool, setMsIsSchool] = useState(true);
  const [msError, setMsError] = useState('');

  // Apple State
  const [appleName, setAppleName] = useState('');
  const [appleEmail, setAppleEmail] = useState('');
  const [appleEmailMode, setAppleEmailMode] = useState<'share' | 'hide'>('share');
  const [appleError, setAppleError] = useState('');

  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Sync email when provider opens
  useEffect(() => {
    if (provider === 'google' && suggestedEmail) {
      setGoogleEmail(suggestedEmail);
    }
  }, [provider, suggestedEmail]);

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim();
    if (!cleanEmail) {
      setGoogleError('Please enter your email address.');
      return;
    }
    setGoogleError('');
    setIsAuthorizing(true);

    setTimeout(() => {
      setIsAuthorizing(false);
      const name = googleName.trim() || cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      const res = validateProviderAuth(cleanEmail, 'google', mode, name);
      if (!res.success) {
        setGoogleError(res.error || 'Authentication error.');
        return;
      }
      onSuccess(res.user!);
    }, 300);
  };

  const handleMicrosoftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = msEmail.trim();
    if (!cleanEmail) {
      setMsError('Please enter your university or Microsoft email.');
      return;
    }
    setMsError('');
    setIsAuthorizing(true);

    setTimeout(() => {
      setIsAuthorizing(false);
      const name = msName.trim() || cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      const res = validateProviderAuth(
        cleanEmail,
        'microsoft',
        mode,
        name,
        msIsSchool ? 'University School Portal' : 'Microsoft Account'
      );
      if (!res.success) {
        setMsError(res.error || 'Authentication error.');
        return;
      }
      onSuccess(res.user!);
    }, 300);
  };

  const handleAppleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail =
      appleEmailMode === 'hide'
        ? `student.relay.${Math.random().toString(36).substring(2, 8)}@privaterelay.appleid.com`
        : appleEmail.trim() || 'student@icloud.com';

    if (appleEmailMode === 'share' && !appleEmail.trim()) {
      setAppleError('Please enter your Apple ID email.');
      return;
    }
    setAppleError('');
    setIsAuthorizing(true);

    setTimeout(() => {
      setIsAuthorizing(false);
      const name = appleName.trim() || cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      const res = validateProviderAuth(cleanEmail, 'apple', mode, name, 'Apple ID');
      if (!res.success) {
        setAppleError(res.error || 'Authentication error.');
        return;
      }
      onSuccess(res.user!);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white text-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-indigo-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* GOOGLE MODAL CONTENT */}
        {provider === 'google' && (
          <div className="p-6 sm:p-8 text-slate-900">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-3 shadow-xs">
                <GoogleIcon className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase tracking-wider mb-2">
                {mode === 'signin' ? 'Google Account Sign In' : 'Create Account with Google'}
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                {mode === 'signin' ? 'Sign in with Google' : 'Register with Google'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'signin'
                  ? 'Verify your registered Google account to enter your workspace'
                  : 'Link your Google identity to create your new student profile'}
              </p>
            </div>

            {googleError && (
              <div className="mb-4 p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs font-bold text-rose-700 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{googleError}</span>
                </div>
                {onSwitchMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleError('');
                      onSwitchMode(mode === 'signin' ? 'signup' : 'signin');
                    }}
                    className="text-xs text-indigo-700 hover:text-indigo-900 font-extrabold underline block ml-6 cursor-pointer"
                  >
                    {mode === 'signin' ? '👉 Switch to "Create Account" instead' : '👉 Switch to "Sign In" instead'}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleGoogleSubmit} className="space-y-4 mb-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="e.g. Demi Thompson"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="student@gmail.com or university.edu"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  style={{ color: '#0f172a' }}
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {mode === 'signin'
                    ? 'Identifies your registered account and initiates secure 2FA session verification.'
                    : 'Registers your student workspace with Google SSO identity protection.'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isAuthorizing}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthorizing ? (
                  <span>Checking Account Credentials...</span>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Verify & Continue with Google' : 'Create Account with Google'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* MICROSOFT MODAL CONTENT */}
        {provider === 'microsoft' && (
          <div className="p-6 sm:p-8 text-slate-900">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-3 shadow-xs">
                <MicrosoftIcon className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-2">
                {mode === 'signin' ? 'Microsoft 365 Sign In' : 'Create Account with Microsoft'}
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                {mode === 'signin' ? 'Sign in with Microsoft' : 'Register with Microsoft'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your university Microsoft 365 credentials
              </p>
            </div>

            {msError && (
              <div className="mb-4 p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs font-bold text-rose-700 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{msError}</span>
                </div>
                {onSwitchMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setMsError('');
                      onSwitchMode(mode === 'signin' ? 'signup' : 'signin');
                    }}
                    className="text-xs text-blue-700 hover:text-blue-900 font-extrabold underline block ml-6 cursor-pointer"
                  >
                    {mode === 'signin' ? '👉 Switch to "Create Account" instead' : '👉 Switch to "Sign In" instead'}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleMicrosoftSubmit} className="space-y-4 mb-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={msName}
                    onChange={(e) => setMsName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  School / Microsoft Email
                </label>
                <input
                  type="email"
                  required
                  value={msEmail}
                  onChange={(e) => setMsEmail(e.target.value)}
                  placeholder="name@university.edu or student@outlook.com"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                  style={{ color: '#0f172a' }}
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5">
                <School className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Compatible with Office 365 Education, Canvas, and university SSO authentication systems.
                </span>
              </div>

              <button
                type="submit"
                disabled={isAuthorizing}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthorizing ? (
                  <span>Checking Credentials...</span>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Verify & Continue with Microsoft' : 'Create Account with Microsoft'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* APPLE MODAL CONTENT */}
        {provider === 'apple' && (
          <div className="p-6 sm:p-8 text-slate-900">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="p-3.5 bg-black rounded-2xl mb-3 shadow-md">
                <AppleIcon className="w-8 h-8 text-white" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-black uppercase tracking-wider mb-2">
                {mode === 'signin' ? 'Apple ID Sign In' : 'Create Account with Apple'}
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                {mode === 'signin' ? 'Sign in with Apple' : 'Register with Apple'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Authenticate with Face ID, Touch ID, or Apple ID password
              </p>
            </div>

            {appleError && (
              <div className="mb-4 p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs font-bold text-rose-700 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{appleError}</span>
                </div>
                {onSwitchMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setAppleError('');
                      onSwitchMode(mode === 'signin' ? 'signup' : 'signin');
                    }}
                    className="text-xs text-slate-900 hover:text-black font-extrabold underline block ml-6 cursor-pointer"
                  >
                    {mode === 'signin' ? '👉 Switch to "Create Account" instead' : '👉 Switch to "Sign In" instead'}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleAppleSubmit} className="space-y-4 mb-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={appleName}
                    onChange={(e) => setAppleName(e.target.value)}
                    placeholder="e.g. Jordan Vance"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-black placeholder:text-slate-400"
                    style={{ color: '#0f172a' }}
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Apple ID Email
                </label>
                <input
                  type="email"
                  required
                  value={appleEmail}
                  onChange={(e) => setAppleEmail(e.target.value)}
                  placeholder="student@icloud.com"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-black placeholder:text-slate-400"
                  style={{ color: '#0f172a' }}
                />
              </div>

              <button
                type="submit"
                disabled={isAuthorizing}
                className="w-full py-3.5 px-4 bg-black hover:bg-slate-800 active:scale-[0.99] text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthorizing ? (
                  <span>Checking Credentials...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{mode === 'signin' ? 'Verify & Continue with Apple ID' : 'Create Account with Apple ID'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
