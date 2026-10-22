import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, ShieldCheck, ExternalLink, Sparkles, X, Clock, Key, Inbox } from 'lucide-react';

interface EmailVerificationModalProps {
  email: string;
  name?: string;
  isOpen: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export default function EmailVerificationModal({
  email,
  name,
  isOpen,
  onVerified,
  onCancel
}: EmailVerificationModalProps) {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(15);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  // Detect email provider for quick webmail shortcut
  const isGmail = email.toLowerCase().includes('gmail.com');
  const isOutlook = email.toLowerCase().includes('outlook.com') || email.toLowerCase().includes('hotmail.com');
  const webmailUrl = isGmail
    ? 'https://mail.google.com'
    : isOutlook
    ? 'https://outlook.live.com'
    : `mailto:${email}`;

  // Countdown timer for resending
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifySuccess = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 700);
    }, 400);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length >= 4) {
      handleVerifySuccess();
    }
  };

  const handleResend = () => {
    setResendTimer(15);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border-2 border-indigo-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Cancel verification"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600 shadow-md">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Email Verified!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your email <span className="font-bold text-slate-800">{email}</span> has been confirmed.
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Logging you into your personal study schedule...</span>
            </div>
          </div>
        ) : (
          /* VERIFICATION PROMPT */
          <div className="p-6 sm:p-8 space-y-5">
            {/* Header Icon */}
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 bg-indigo-50 border-2 border-indigo-200 rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm mx-auto">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                  ✓
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Instant Sign-In Link</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Direct authentication link generated for:
              </p>
              <div className="inline-block mt-1 px-3 py-1 bg-slate-100 rounded-xl text-xs font-black text-slate-800 border border-slate-200 font-mono">
                {email}
              </div>
            </div>

            {/* Direct Instant Access Card */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50 rounded-2xl border-2 border-indigo-200/80 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-950">
                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Instant Magic Link (Ready)
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  Active Now
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-snug">
                Click below to instantly activate your session and enter your study workspace:
              </p>

              {/* Primary 1-Click Verification Link Button */}
              <button
                type="button"
                id="btn-confirm-magic-link"
                onClick={handleVerifySuccess}
                disabled={isVerifying}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isVerifying ? (
                  <span>Activating session...</span>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>Sign In Now as {email.split('@')[0]}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Optional external webmail button */}
              <div className="pt-1 flex items-center justify-center">
                <a
                  href={webmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Open {isGmail ? 'Gmail' : isOutlook ? 'Outlook' : 'Email App'}</span>
                </a>
              </div>
            </div>

            {/* Alternatively: 6-digit Code */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Or enter 6-digit passcode
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCode(generatedCode);
                    setTimeout(() => handleVerifySuccess(), 250);
                  }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                >
                  Auto-fill & verify ({generatedCode})
                </button>
              </div>

              <form onSubmit={handleCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder={`e.g. ${generatedCode}`}
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

            {/* Direct continue without waiting */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={handleVerifySuccess}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>Continue directly to Workspace →</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-700 font-semibold text-[11px] underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-[10px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Preview Environment: Direct 1-click token activation enabled.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
