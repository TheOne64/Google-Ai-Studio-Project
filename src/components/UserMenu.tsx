import React, { useState, useRef, useEffect } from 'react';
import { LogOut, UserCircle, ChevronDown, Sparkles, School, Plus, Check, Shield, Calendar, BookOpen, Layers } from 'lucide-react';
import { User, StudySchedule } from '../types';
import { GoogleIcon, MicrosoftIcon, AppleIcon } from './ProviderIcons';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  onSwitchAccount: () => void;
  schedules: StudySchedule[];
  activeScheduleId: string;
  onSelectSchedule: (scheduleId: string) => void;
  onOpenCreateSchedule: () => void;
}

export default function UserMenu({
  user,
  onLogout,
  onSwitchAccount,
  schedules,
  activeScheduleId,
  onSelectSchedule,
  onOpenCreateSchedule
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getProviderIcon = () => {
    switch (user.provider) {
      case 'google':
        return <GoogleIcon className="w-3.5 h-3.5" />;
      case 'microsoft':
        return <MicrosoftIcon className="w-3.5 h-3.5" />;
      case 'apple':
        return <AppleIcon className="w-3.5 h-3.5" />;
      case 'guest':
        return <UserCircle className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getProviderLabel = () => {
    switch (user.provider) {
      case 'google':
        return 'Google Account';
      case 'microsoft':
        return 'Microsoft 365';
      case 'apple':
        return 'Apple ID';
      case 'guest':
        return 'Guest (Not Saved)';
      default:
        return 'Email Account';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const activeSchedule = schedules.find((s) => s.id === activeScheduleId) || schedules[0];

  return (
    <div className="relative" ref={menuRef}>
      {/* Navigation Trigger Button */}
      <button
        type="button"
        id="user-nav-menu-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl transition-all border ${
          isOpen
            ? 'bg-indigo-50 border-indigo-300 shadow-sm'
            : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
        }`}
      >
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover border-2 border-indigo-200 shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {getInitials(user.name)}
            </div>
          )}

          {/* Provider Badge Icon */}
          <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-md shadow-xs border border-slate-200 flex items-center justify-center">
            {getProviderIcon()}
          </div>
        </div>

        <div className="text-left">
          <div className="text-xs font-black text-slate-900 leading-tight flex items-center gap-1">
            <span className="truncate max-w-[110px] sm:max-w-[150px]">{user.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate max-w-[110px] sm:max-w-[150px]">
            {user.institution || user.email}
          </div>
        </div>
      </button>

      {/* Navigation Dropdown Menu */}
      {isOpen && (
        <div
          id="user-nav-dropdown"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white text-slate-900 rounded-3xl shadow-2xl border-2 border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User Profile Header Card */}
          <div className="px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2.5">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-black text-sm text-slate-900 truncate">{user.name}</div>
                <div className="text-xs text-slate-600 font-medium truncate">{user.email}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                  Student Account
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-800 border border-slate-200">
                {getProviderIcon()}
                <span>{getProviderLabel()}</span>
              </span>
              {user.institution && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-100 truncate max-w-[150px]">
                  {user.institution}
                </span>
              )}
            </div>
          </div>

          {/* Study Schedules Switcher Section */}
          <div className="px-3 py-2.5 border-b border-slate-100">
            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>My Schedules ({schedules.length})</span>
              </span>
              <span className="text-indigo-600 font-semibold">{activeSchedule?.term}</span>
            </div>

            <div className="space-y-1 mt-1.5 max-h-44 overflow-y-auto">
              {schedules.map((sched) => {
                const isActive = sched.id === activeScheduleId;
                return (
                  <button
                    key={sched.id}
                    type="button"
                    onClick={() => {
                      onSelectSchedule(sched.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-950 font-bold border border-indigo-200'
                        : 'text-slate-800 hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate text-slate-900 font-bold">{sched.title}</div>
                      <div className="text-[10px] text-slate-500">{sched.term} • {sched.courses.length} courses</div>
                    </div>
                    {isActive ? (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold">Switch</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateSchedule();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create New Study Schedule</span>
            </button>
          </div>

          {/* Quick Page Jump Links */}
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Quick Navigation
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <a
                href="#schedule-view-container"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Timeline</span>
              </a>
              <a
                href="#assignment-list-container"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Classes</span>
              </a>
              <a
                href="#syllabus-upload-container"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Syllabus AI</span>
              </a>
              <a
                href="#settings-panel-container"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pace Settings</span>
              </a>
            </div>
          </div>

          {/* Account Actions */}
          <div className="px-3 pt-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onSwitchAccount();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors text-left"
            >
              <UserCircle className="w-4 h-4 text-slate-500" />
              <span>Switch Account (Google / MS / Apple)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
