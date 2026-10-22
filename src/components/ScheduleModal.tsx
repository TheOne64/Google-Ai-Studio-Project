import React, { useState } from 'react';
import { X, Calendar, Plus, Sparkles, Check, BookOpen, Layers, Flame, Clock } from 'lucide-react';
import { StudySchedule, SchedulePreferences } from '../types';
import { SCHEDULE_TEMPLATES, DEFAULT_PREFERENCES, createNewSchedule } from '../utils/authStorage';

interface ScheduleModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduleCreated: (schedule: StudySchedule) => void;
}

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600', ring: 'ring-indigo-400' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-600', ring: 'ring-emerald-400' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-600', ring: 'ring-blue-400' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', ring: 'ring-amber-400' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-600', ring: 'ring-rose-400' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-600', ring: 'ring-violet-400' }
];

const TERM_SUGGESTIONS = [
  'Fall 2026',
  'Spring 2027',
  'Summer Term',
  'Winter Quarter',
  'Self-Paced / Exam Prep'
];

export default function ScheduleModal({
  userId,
  isOpen,
  onClose,
  onScheduleCreated
}: ScheduleModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [selectedTemplate, setSelectedTemplate] = useState<'blank' | 'stem' | 'premed' | 'business'>('blank');
  
  // Custom preferences
  const [intensity, setIntensity] = useState<'casual' | 'balanced' | 'intense'>('balanced');
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [dailyHourLimit, setDailyHourLimit] = useState(3);

  const toggleDay = (dayIndex: number) => {
    if (workDays.includes(dayIndex)) {
      if (workDays.length > 1) {
        setWorkDays(workDays.filter((d) => d !== dayIndex));
      }
    } else {
      setWorkDays([...workDays, dayIndex].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || `${term} Schedule`;
    const prefs: SchedulePreferences = {
      intensity,
      workDays,
      dailyHourLimit
    };

    const newSchedule = createNewSchedule(
      userId,
      finalTitle,
      term,
      selectedTemplate,
      selectedColor,
      description,
      prefs
    );

    onScheduleCreated(newSchedule);
    onClose();
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Create Study Schedule</h3>
              <p className="text-xs text-slate-500">
                Design a new semester, term, or custom study roadmap
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Schedule Title & Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Schedule Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fall 2026 - CS & Science"
                className="w-full px-4 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                style={{ color: '#0f172a' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Term / Period
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Fall 2026"
                className="w-full px-4 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                style={{ color: '#0f172a' }}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {TERM_SUGGESTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTerm(t)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Goal / Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Core degree milestones, midterm pacing, and lab assignments"
              className="w-full px-4 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              style={{ color: '#0f172a' }}
            />
          </div>

          {/* Schedule Theme Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center text-white transition-transform ${
                    selectedColor === c.id ? 'scale-110 ring-4 ring-offset-2 ' + c.ring : 'hover:scale-105 opacity-80'
                  }`}
                  title={c.label}
                >
                  {selectedColor === c.id && <Check className="w-5 h-5 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Starter Course Template */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Starting Curriculum Template
              </label>
              <span className="text-[11px] text-slate-400">You can always add or upload syllabi later</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(SCHEDULE_TEMPLATES).map(([key, item]) => {
                const isSelected = selectedTemplate === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTemplate(key as any)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">{item.title}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">
                          {item.courses.length} courses
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Study Pace & Habits */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Schedule Study Habits & Pace
            </h4>

            {/* Intensity */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Work Intensity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['casual', 'balanced', 'intense'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setIntensity(mode)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      intensity === mode
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Days */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Available Study Days
              </label>
              <div className="flex items-center gap-1.5">
                {dayLabels.map((lbl, idx) => {
                  const isActive = workDays.includes(idx);
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Hour Limit */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Target Daily Study Limit
                </label>
                <span className="text-xs font-black text-indigo-600">{dailyHourLimit} Hours / Day</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={dailyHourLimit}
                onChange={(e) => setDailyHourLimit(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-[0.99] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
