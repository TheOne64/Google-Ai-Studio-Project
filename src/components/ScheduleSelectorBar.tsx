import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Plus, ChevronDown, Download, Trash2, Edit3, Share2, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { StudySchedule, Course } from '../types';

interface ScheduleSelectorBarProps {
  schedules: StudySchedule[];
  activeSchedule: StudySchedule;
  onSelectSchedule: (scheduleId: string) => void;
  onOpenCreateModal: () => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onRenameSchedule: (scheduleId: string, newTitle: string) => void;
}

export default function ScheduleSelectorBar({
  schedules,
  activeSchedule,
  onSelectSchedule,
  onOpenCreateModal,
  onDeleteSchedule,
  onRenameSchedule
}: ScheduleSelectorBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editTitle, setEditTitle] = useState(activeSchedule.title);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute total milestones in active schedule
  const totalCourses = activeSchedule.courses.length;
  let totalMilestones = 0;
  let completedMilestones = 0;

  activeSchedule.courses.forEach((c) => {
    c.assignments.forEach((a) => {
      a.milestones.forEach((m) => {
        totalMilestones++;
        if (m.completed) completedMilestones++;
      });
    });
  });

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSchedule(activeSchedule.id, editTitle.trim());
      setIsRenaming(false);
    }
  };

  const handleExportSchedule = () => {
    const dataStr = JSON.stringify(activeSchedule, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSchedule.title.toLowerCase().replace(/\s+/g, '-')}-schedule.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border-2 border-indigo-100 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Active Schedule Info & Switcher */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Calendar className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Active Study Schedule
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {activeSchedule.term}
              </span>
            </div>

            {/* Title / Renaming view */}
            {isRenaming ? (
              <form onSubmit={handleSaveRename} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                  className="px-2.5 py-1 text-base font-black text-slate-900 bg-white border-2 border-indigo-500 rounded-lg focus:outline-none"
                  style={{ color: '#0f172a' }}
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  className="px-2 py-1 text-slate-400 text-xs font-bold hover:text-slate-600"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-xl font-black text-slate-900 tracking-tight truncate">
                  {activeSchedule.title}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditTitle(activeSchedule.title);
                    setIsRenaming(true);
                  }}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Rename schedule"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="text-xs text-slate-500 font-medium flex items-center gap-3 mt-0.5">
              <span>{totalCourses} {totalCourses === 1 ? 'Course' : 'Courses'}</span>
              <span>•</span>
              <span>{totalMilestones} Milestones ({completedMilestones} completed)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Switcher Dropdown & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          
          {/* Switch Schedule Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
            >
              <span>Switch Schedule ({schedules.length})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 py-2 z-30 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400">
                  Switch Study Schedule
                </div>
                {schedules.map((s) => {
                  const isActive = s.id === activeSchedule.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSchedule(s.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-left truncate min-w-0 pr-2">
                        <div className="truncate">{s.title}</div>
                        <div className="text-[10px] text-slate-400">{s.term} • {s.courses.length} courses</div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}

                <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenCreateModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Create New Schedule</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExportSchedule}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
            title="Download JSON schedule backup"
          >
            {copiedNotification ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </>
            )}
          </button>

          {/* Delete Schedule (if user has > 1 schedule) */}
          {schedules.length > 1 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${activeSchedule.title}"?`)) {
                  onDeleteSchedule(activeSchedule.id);
                }
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              title="Delete this study schedule"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Create New Study Schedule CTA Button */}
          <button
            type="button"
            id="btn-create-new-schedule"
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Study Schedule</span>
          </button>

        </div>

      </div>

      {/* Empty State Banner if current schedule has 0 courses */}
      {totalCourses === 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                Fresh Study Schedule Created!
              </div>
              <div className="text-xs text-indigo-700">
                Upload a syllabus PDF or photo on the left panel, or click "+ Add Course" to populate your milestones.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
