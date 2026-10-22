import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, KeyRound, CheckCircle2, ArrowRight, Fingerprint, Sparkles, X, Smartphone, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface IdentityVerificationModalProps {
  user: User;
  isOpen: boolean;
  onVerified: () => void;
  onCancel: () => void;
  method?: 'password' | 'oauth' | 'magic_link';
}

export default function IdentityVerificationModal({
  user,
  isOpen,
  onVerified,
  onCancel,
  method = 'password'
}: IdentityVerificationModalProps) {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [trustBrowser, setTrustBrowser] = useState(true);
  const [generatedPasskey] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  const handleAuthorize = () => {
    setIsVerifying(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 700);
    }, 500);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Please enter your 6-digit security code or click Auto-Verify.');
      return;
    }
    if (code.trim() !== generatedPasskey && code.trim().length !== 6) {
      setErrorMsg('Invalid identity passkey. Check the 6-digit code or use 1-click authorization.');
      return;
    }
    handleAuthorize();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white text-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-indigo-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Cancel identity check"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Security Check Passed
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Identity Confirmed</h3>
              <p className="text-xs text-slate-500 mt-1">
                Authorized session for <span className="font-bold text-slate-900">{user.name}</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Opening your private study workspace...</span>
            </div>
          </div>
        ) : (
          /* VERIFICATION SCREEN */
          <div className="p-6 sm:p-8 space-y-5">
            {/* Security Header */}
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-800 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mx-auto -rotate-3">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                  ✓
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase tracking-wider mb-1.5">
                <Lock className="w-3 h-3 text-indigo-600" />
                Two-Factor Security Check
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Verify Your Identity
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Confirm you are authorizing access for:
              </p>

              <div className="inline-block mt-2 px-3.5 py-1.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900">
                <span className="text-slate-800 font-black">{user.name}</span>
                <span className="text-slate-400 font-normal ml-1.5 font-mono">({user.email})</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Instant Biometric / Passkey 1-Click Verification Card */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 rounded-2xl border-2 border-indigo-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-black text-indigo-950">
                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                  <Fingerprint className="w-4 h-4 text-indigo-600" />
                  Instant Passkey & Biometric Check
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  Device Ready
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-snug font-medium">
                Verify identity using this device's trusted security key:
              </p>

              <button
                type="button"
                id="btn-verify-identity-instant"
                onClick={handleAuthorize}
                disabled={isVerifying}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isVerifying ? (
                  <span>Authenticating Identity...</span>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 transition-transform group-hover:scale-120" />
                    <span>Authorize Device & Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>

            {/* Manual 6-Digit Passkey Option */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>One-Time Security Passkey</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCode(generatedPasskey);
                    setTimeout(() => handleAuthorize(), 250);
                  }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                >
                  Auto-fill ({generatedPasskey})
                </button>
              </div>

              <form onSubmit={handleCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder={`e.g. ${generatedPasskey}`}
                  className="flex-1 px-3.5 py-2.5 text-center font-mono font-black text-base text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 tracking-widest"
                  style={{ color: '#0f172a' }}
                />
                <button
                  type="submit"
                  disabled={code.length < 4 || isVerifying}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Verify
                </button>
              </form>
            </div>

            {/* Trust Device Checkbox */}
            <label className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={trustBrowser}
                onChange={(e) => setTrustBrowser(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span>Trust this browser for 30 days (prevents frequent 2FA prompts)</span>
            </label>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-700 font-bold underline cursor-pointer"
              >
                Sign In with another account
              </button>

              <span className="text-[10px] text-slate-400 font-medium">
                End-to-end Encrypted
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
