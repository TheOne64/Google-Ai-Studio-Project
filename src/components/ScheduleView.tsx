import React, { useState } from 'react';
import { CheckSquare, Square, Calendar, AlertCircle, Clock, BookOpen, ChevronRight, CornerDownRight, Plus, Trash2, X, Sparkles } from 'lucide-react';
import { Course, Assignment, Milestone } from '../types';
import { daysBetween, formatDateString, addDays } from '../utils/scheduleGenerator';

interface ScheduleViewProps {
  courses: Course[];
  todayStr: string;
  onToggleMilestone: (courseId: string, assignmentId: string, milestoneId: string) => void;
  onRescheduleMilestone: (courseId: string, assignmentId: string, milestoneId: string, newDate: string) => void;
  onDeleteMilestone?: (courseId: string, assignmentId: string, milestoneId: string) => void;
  onCreateMilestone?: (
    courseIdOrName: string,
    assignmentIdOrTitle: string,
    milestoneTitle: string,
    dateScheduled: string,
    durationHours: number,
    description?: string
  ) => void;
}

export default function ScheduleView({
  courses,
  todayStr,
  onToggleMilestone,
  onRescheduleMilestone,
  onDeleteMilestone,
  onCreateMilestone
}: ScheduleViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [customCourseName, setCustomCourseName] = useState<string>('');
  const [customAssignmentTitle, setCustomAssignmentTitle] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(todayStr);
  const [newDuration, setNewDuration] = useState<number>(1.5);
  const [newDesc, setNewDesc] = useState<string>('');

  // Flatten milestones with their related info
  interface FlattenedMilestone {
    milestone: Milestone;
    courseId: string;
    courseName: string;
    courseColor: string;
    assignmentId: string;
    assignmentTitle: string;
    assignmentDueDate: string;
  }

  const allMilestones: FlattenedMilestone[] = [];

  courses.forEach(c => {
    (c.assignments || []).forEach(a => {
      (a.milestones || []).forEach(m => {
        allMilestones.push({
          milestone: m,
          courseId: c.id,
          courseName: c.name,
          courseColor: c.color,
          assignmentId: a.id,
          assignmentTitle: a.title,
          assignmentDueDate: a.dueDate
        });
      });
    });
  });

  // Categories
  const overdue: FlattenedMilestone[] = [];
  const today: FlattenedMilestone[] = [];
  const tomorrow: FlattenedMilestone[] = [];
  const thisWeek: FlattenedMilestone[] = [];
  const future: FlattenedMilestone[] = [];

  allMilestones.forEach(fm => {
    const date = fm.milestone.dateScheduled;
    const completed = fm.milestone.completed;
    const daysDiff = daysBetween(todayStr, date);

    if (!completed && daysDiff < 0) {
      overdue.push(fm);
    } else if (daysDiff === 0) {
      today.push(fm);
    } else if (daysDiff === 1) {
      tomorrow.push(fm);
    } else if (daysDiff > 1 && daysDiff <= 7) {
      thisWeek.push(fm);
    } else if (daysDiff > 7 || (completed && daysDiff < 0)) {
      future.push(fm);
    }
  });

  // Sort function: by date, then course
  const sortByDateAndCourse = (a: FlattenedMilestone, b: FlattenedMilestone) => {
    const dateDiff = daysBetween(a.milestone.dateScheduled, b.milestone.dateScheduled);
    if (dateDiff !== 0) return dateDiff;
    return a.courseName.localeCompare(b.courseName);
  };

  overdue.sort(sortByDateAndCourse);
  today.sort(sortByDateAndCourse);
  tomorrow.sort(sortByDateAndCourse);
  thisWeek.sort(sortByDateAndCourse);
  future.sort(sortByDateAndCourse);

  // Generate date options for rescheduling (Today + next 14 days)
  const rescheduleDateOptions = Array.from({ length: 15 }, (_, i) => {
    const dateStr = addDays(todayStr, i);
    const date = new Date(dateStr + 'T12:00:00');
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { value: dateStr, label };
  });

  const handleOpenAddModal = () => {
    if (courses.length > 0) {
      const firstCourse = courses[0];
      setSelectedCourseId(firstCourse.id);
      if (firstCourse.assignments.length > 0) {
        setSelectedAssignmentId(firstCourse.assignments[0].id);
      } else {
        setSelectedAssignmentId('');
      }
    } else {
      setSelectedCourseId('');
      setSelectedAssignmentId('');
    }
    setNewTitle('');
    setNewDate(todayStr);
    setNewDuration(1.5);
    setNewDesc('');
    setCustomCourseName('');
    setCustomAssignmentTitle('');
    setIsAddModalOpen(true);
  };

  const handleCreateMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !onCreateMilestone) return;

    let targetCourse = selectedCourseId;
    let targetAssignment = selectedAssignmentId;

    if (!targetCourse || targetCourse === 'NEW') {
      targetCourse = customCourseName.trim() || 'My Course';
    }
    if (!targetAssignment || targetAssignment === 'NEW') {
      targetAssignment = customAssignmentTitle.trim() || 'Deliverable / Exam';
    }

    onCreateMilestone(
      targetCourse,
      targetAssignment,
      newTitle.trim(),
      newDate,
      Number(newDuration) || 1.5,
      newDesc.trim()
    );

    setIsAddModalOpen(false);
  };

  const selectedCourseObj = courses.find(c => c.id === selectedCourseId);

  const renderMilestoneCard = (fm: FlattenedMilestone, isOverdueContext: boolean = false) => {
    const { milestone, courseId, courseName, courseColor, assignmentId, assignmentTitle, assignmentDueDate } = fm;
    
    // Format milestone date for easy reading
    const milestoneDate = new Date(milestone.dateScheduled + 'T12:00:00');
    const formattedDate = milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

    return (
      <div 
        key={milestone.id} 
        id={`milestone-card-${milestone.id}`}
        className={`${milestone.completed ? 'bg-slate-50 border-2 border-slate-200 opacity-75' : isOverdueContext ? 'bg-white border-4 border-rose-300 shadow-lg' : 'bg-white border-4 border-slate-100 hover:border-indigo-100 shadow-md'} rounded-2xl p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        <div className="flex items-start gap-3.5 flex-1">
          <button 
            id={`toggle-milestone-btn-${milestone.id}`}
            onClick={() => onToggleMilestone(courseId, assignmentId, milestone.id)}
            className={`mt-1.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer ${milestone.completed ? 'text-emerald-500 hover:text-emerald-600' : isOverdueContext ? 'text-rose-400 hover:text-rose-600' : ''}`}
            title={milestone.completed ? 'Mark incomplete' : 'Mark completed'}
          >
            {milestone.completed ? (
              <CheckSquare className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Square className="w-6 h-6 stroke-[2]" />
            )}
          </button>
          
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-sm ${courseColor}`}>
                {courseName}
              </span>
              <span className="text-slate-400 font-extrabold text-xs flex items-center gap-1.5">
                <CornerDownRight className="w-4 h-4 text-slate-300" />
                {assignmentTitle} {assignmentDueDate ? `(Due ${new Date(assignmentDueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : ''}
              </span>
            </div>
            <h4 className={`text-base font-black text-slate-950 ${milestone.completed ? 'line-through text-slate-400' : ''}`}>
              {milestone.title}
            </h4>
            {milestone.description && (
              <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-xl">
                {milestone.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t border-slate-100 pt-3 sm:pt-0 sm:border-0">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-black">
            <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border-2 border-slate-200 text-slate-600 font-mono">
              <Clock className="w-4 h-4 text-indigo-500" />
              {milestone.durationHours} hrs
            </span>
            <span className={`flex items-center gap-1 ${isOverdueContext ? 'text-rose-600' : ''}`}>
              <Calendar className="w-4 h-4 text-slate-400" />
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor={`reschedule-${milestone.id}`} className="sr-only">Reschedule milestone</label>
            <select
              id={`reschedule-${milestone.id}`}
              value={milestone.dateScheduled}
              onChange={(e) => onRescheduleMilestone(courseId, assignmentId, milestone.id, e.target.value)}
              className="bg-white border-2 border-slate-200 rounded-xl py-1.5 px-3 text-[11px] font-bold text-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm hover:border-indigo-300 transition-colors"
            >
              {rescheduleDateOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.value === milestone.dateScheduled ? 'Move to...' : opt.label}
                </option>
              ))}
            </select>

            {onDeleteMilestone && (
              <button
                id={`delete-milestone-btn-${milestone.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMilestone(courseId, assignmentId, milestone.id);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete milestone"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const totalUncompleted = overdue.length + today.length + tomorrow.length + thisWeek.length;

  return (
    <div id="schedule-view-container" className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-indigo-100">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Your Study Road Schedule
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Track daily study blocks and manage milestones leading to your due dates.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-indigo-700 font-black bg-indigo-50 border-2 border-indigo-200 px-3.5 py-2 rounded-xl shadow-sm">
            {allMilestones.length} milestones ({totalUncompleted} active)
          </span>

          {onCreateMilestone && (
            <button
              id="schedule-view-add-milestone-btn"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Milestone
            </button>
          )}
        </div>
      </div>

      {/* Fresh Clean Slate Zero-State */}
      {allMilestones.length === 0 ? (
        <div id="schedule-zero-milestones-card" className="bg-white border-4 border-dashed border-indigo-200 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border-2 border-indigo-200 text-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <Sparkles className="w-8 h-8 animate-pulse text-indigo-500" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-xl font-black text-slate-900">0 Milestones Scheduled</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Your study road is currently a clean slate with 0 milestones. You have full freedom to create your own custom study milestones or scan your syllabus to auto-schedule prep.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onCreateMilestone && (
              <button
                id="create-first-milestone-cta-btn"
                onClick={handleOpenAddModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-2xl text-xs uppercase cursor-pointer transition-all shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Create Your First Milestone
              </button>
            )}
            <a
              href="#assignment-list-container"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl text-xs uppercase cursor-pointer transition-all border border-slate-200 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              Manage Curriculum Courses
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Overdue Section */}
          {overdue.length > 0 && (
            <div id="schedule-section-overdue" className="space-y-3">
              <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                Overdue Study Milestones ({overdue.length})
              </h4>
              <div className="space-y-2">
                {overdue.map(fm => renderMilestoneCard(fm, true))}
              </div>
            </div>
          )}

          {/* Today Section */}
          <div id="schedule-section-today" className="space-y-3">
            <h4 className="text-xs font-black text-yellow-600 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              Today's Plan ({today.length})
            </h4>
            {today.length > 0 ? (
              <div className="space-y-2">
                {today.map(fm => renderMilestoneCard(fm))}
              </div>
            ) : (
              <div className="bg-white border-4 border-dashed border-slate-200 rounded-[1.5rem] p-6 text-center text-slate-400 font-bold text-xs shadow-sm">
                🎉 No study blocks scheduled for today. Take time to rest or get ahead!
              </div>
            )}
          </div>

          {/* Tomorrow Section */}
          <div id="schedule-section-tomorrow" className="space-y-3">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              Tomorrow's Focus ({tomorrow.length})
            </h4>
            {tomorrow.length > 0 ? (
              <div className="space-y-2">
                {tomorrow.map(fm => renderMilestoneCard(fm))}
              </div>
            ) : (
              <div className="bg-white border-4 border-dashed border-slate-200 rounded-[1.5rem] p-6 text-center text-slate-400 font-bold text-xs shadow-sm">
                No focus blocks scheduled for tomorrow yet.
              </div>
            )}
          </div>

          {/* This Week Section */}
          <div id="schedule-section-week" className="space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Later This Week ({thisWeek.length})
            </h4>
            {thisWeek.length > 0 ? (
              <div className="space-y-2">
                {thisWeek.map(fm => renderMilestoneCard(fm))}
              </div>
            ) : (
              <div className="bg-white border-4 border-dashed border-slate-200 rounded-[1.5rem] p-6 text-center text-slate-400 font-bold text-xs shadow-sm">
                No other study milestones scheduled for this week.
              </div>
            )}
          </div>

          {/* Future / Completed Section */}
          {future.length > 0 && (
            <details id="schedule-section-future" className="group">
              <summary className="text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest cursor-pointer transition-colors list-none flex items-center gap-1.5 select-none">
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-slate-400" />
                Completed & Long-term Milestones ({future.length})
              </summary>
              <div className="space-y-2 mt-3 pl-4 border-l-4 border-slate-200">
                {future.map(fm => renderMilestoneCard(fm))}
              </div>
            </details>
          )}
        </>
      )}

      {/* Add Custom Milestone Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Create Study Milestone</h4>
                  <p className="text-xs text-slate-500 font-medium">Add a step to pace your academic preparation</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestoneSubmit} className="p-6 space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Class / Course *
                </label>
                {courses.length > 0 ? (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      const course = courses.find(c => c.id === e.target.value);
                      if (course && course.assignments.length > 0) {
                        setSelectedAssignmentId(course.assignments[0].id);
                      } else {
                        setSelectedAssignmentId('NEW');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ''}</option>
                    ))}
                    <option value="NEW">+ Add to a new course...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cognitive Science 101"
                    value={customCourseName}
                    onChange={(e) => setCustomCourseName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                )}
                {selectedCourseId === 'NEW' && courses.length > 0 && (
                  <input
                    type="text"
                    required
                    placeholder="New course name..."
                    value={customCourseName}
                    onChange={(e) => setCustomCourseName(e.target.value)}
                    className="mt-2 w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                )}
              </div>

              {/* Assignment / Deliverable Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deliverable / Exam *
                </label>
                {selectedCourseObj && selectedCourseObj.assignments.length > 0 && selectedCourseId !== 'NEW' ? (
                  <select
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {selectedCourseObj.assignments.map(a => (
                      <option key={a.id} value={a.id}>{a.title} (Due {a.dueDate})</option>
                    ))}
                    <option value="NEW">+ Add to a new deliverable...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm Exam Prep, Term Paper 1"
                    value={customAssignmentTitle}
                    onChange={(e) => setCustomAssignmentTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                )}
                {selectedAssignmentId === 'NEW' && selectedCourseObj && selectedCourseObj.assignments.length > 0 && (
                  <input
                    type="text"
                    required
                    placeholder="New deliverable title..."
                    value={customAssignmentTitle}
                    onChange={(e) => setCustomAssignmentTitle(e.target.value)}
                    className="mt-2 w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                )}
              </div>

              {/* Milestone Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Milestone Action Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outline chapter 3 & practice formulas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                />
              </div>

              {/* Date & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseFloat(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Objectives (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Pages to read, problem sets to solve, or draft goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-sm"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
