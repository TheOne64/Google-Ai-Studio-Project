import React, { useState } from 'react';
import { BookOpen, Calendar, Trash2, Plus, ChevronDown, ChevronRight, CheckSquare, Square, ClipboardList, AlertCircle, Clock, X, Sparkles } from 'lucide-react';
import { Course, Assignment, Milestone } from '../types';
import { daysBetween } from '../utils/scheduleGenerator';

interface AssignmentListProps {
  courses: Course[];
  todayStr: string;
  onAddCourse: (courseName: string, courseCode: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddAssignment: (courseId: string, assignment: Omit<Assignment, 'id' | 'milestones'>, customMilestonesCount: number) => void;
  onDeleteAssignment: (courseId: string, assignmentId: string) => void;
  onToggleAssignment: (courseId: string, assignmentId: string) => void;
  onAddMilestone?: (courseId: string, assignmentId: string, milestone: { title: string; dateScheduled: string; durationHours: number; description?: string }) => void;
  onDeleteMilestone?: (courseId: string, assignmentId: string, milestoneId: string) => void;
  onToggleMilestone?: (courseId: string, assignmentId: string, milestoneId: string) => void;
}

const PALETTE = [
  'border-blue-500/30 text-blue-400 bg-blue-500/5',
  'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
  'border-indigo-500/30 text-indigo-400 bg-indigo-500/5',
  'border-amber-500/30 text-amber-400 bg-amber-500/5',
  'border-rose-500/30 text-rose-400 bg-rose-500/5',
  'border-sky-500/30 text-sky-400 bg-sky-500/5',
  'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/5'
];

export default function AssignmentList({
  courses,
  todayStr,
  onAddCourse,
  onDeleteCourse,
  onAddAssignment,
  onDeleteAssignment,
  onToggleAssignment,
  onAddMilestone,
  onDeleteMilestone,
  onToggleMilestone
}: AssignmentListProps) {
  
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  
  // Assignment creation states
  const [activeCourseIdForNewAssignment, setActiveCourseIdForNewAssignment] = useState<string | null>(null);
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignDate, setNewAssignDate] = useState('');
  const [newAssignDesc, setNewAssignDesc] = useState('');
  const [newAssignWeight, setNewAssignWeight] = useState('10%');
  const [newAssignPriority, setNewAssignPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newAssignMilestoneSteps, setNewAssignMilestoneSteps] = useState(0); // Default to 0 so users create their own milestones

  // Inline milestone creation states
  const [activeAssignmentForMilestone, setActiveAssignmentForMilestone] = useState<{ courseId: string; assignmentId: string } | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState(todayStr);
  const [newMilestoneDuration, setNewMilestoneDuration] = useState(1.5);
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    onAddCourse(newCourseName.trim(), newCourseCode.trim());
    setNewCourseName('');
    setNewCourseCode('');
    setShowAddCourse(false);
  };

  const handleAddAssignmentSubmit = (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    if (!newAssignTitle.trim() || !newAssignDate) return;

    onAddAssignment(courseId, {
      courseId,
      courseName: courses.find(c => c.id === courseId)?.name || '',
      title: newAssignTitle.trim(),
      dueDate: newAssignDate,
      description: newAssignDesc.trim(),
      weight: newAssignWeight || '10%',
      priority: newAssignPriority,
      completed: false
    }, newAssignMilestoneSteps);

    // Reset fields
    setNewAssignTitle('');
    setNewAssignDate('');
    setNewAssignDesc('');
    setNewAssignWeight('10%');
    setNewAssignPriority('medium');
    setNewAssignMilestoneSteps(0);
    setActiveCourseIdForNewAssignment(null);

    // Ensure expanded
    setExpandedCourses(prev => ({ ...prev, [courseId]: true }));
  };

  const handleOpenInlineMilestone = (courseId: string, assignment: Assignment) => {
    setActiveAssignmentForMilestone({ courseId, assignmentId: assignment.id });
    setNewMilestoneTitle('');
    setNewMilestoneDate(assignment.dueDate || todayStr);
    setNewMilestoneDuration(1.5);
    setNewMilestoneDesc('');
  };

  const handleInlineMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentForMilestone || !newMilestoneTitle.trim() || !onAddMilestone) return;

    onAddMilestone(
      activeAssignmentForMilestone.courseId,
      activeAssignmentForMilestone.assignmentId,
      {
        title: newMilestoneTitle.trim(),
        dateScheduled: newMilestoneDate || todayStr,
        durationHours: Number(newMilestoneDuration) || 1.5,
        description: newMilestoneDesc.trim()
      }
    );

    setActiveAssignmentForMilestone(null);
    setNewMilestoneTitle('');
  };

  return (
    <div id="assignment-list-container" className="space-y-6">
      
      {/* Course management header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-500" />
            Curriculum Courses & Deliverables
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Manage your academic modules, exams, papers, and homework milestones.
          </p>
        </div>
        
        <button
          id="toggle-add-course-btn"
          onClick={() => setShowAddCourse(!showAddCourse)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Course
        </button>
      </div>

      {/* Add Course Form */}
      {showAddCourse && (
        <form 
          id="add-course-form"
          onSubmit={handleAddCourseSubmit}
          className="bg-white border-4 border-indigo-200 rounded-[2rem] p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
              Create Academic Course
            </h4>
            <button
              type="button"
              onClick={() => setShowAddCourse(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="new-course-name" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Course Name *
              </label>
              <input
                id="new-course-name"
                type="text"
                required
                placeholder="e.g. Cognitive Science, Linear Algebra, General Chem"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label htmlFor="new-course-code" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Course Code (Optional)
              </label>
              <input
                id="new-course-code"
                type="text"
                placeholder="e.g. COGSCI 1, MATH 54"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs pt-2">
            <button
              type="button"
              onClick={() => setShowAddCourse(false)}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              id="submit-create-course-btn"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl cursor-pointer shadow-sm uppercase"
            >
              Save Course
            </button>
          </div>
        </form>
      )}

      {/* Fresh Clean Slate: 0 Courses & 0 Milestones Banner */}
      {courses.length === 0 && (
        <div id="no-courses-empty-card" className="bg-white border-4 border-dashed border-indigo-200 rounded-[2rem] p-10 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 border-2 border-indigo-200 text-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <BookOpen className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-xl font-black text-slate-900">Course Load: 0 Active Courses</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              You are starting with a clean slate of 0 courses and 0 milestones. Add your courses or scan your syllabus to start building your own custom study milestones.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="empty-add-course-btn"
              onClick={() => setShowAddCourse(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-2xl text-xs uppercase cursor-pointer transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Your First Course
            </button>
            <a
              href="#syllabus-upload-container"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl text-xs uppercase cursor-pointer transition-all border border-slate-200 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Upload Syllabus Image
            </a>
          </div>
        </div>
      )}

      {/* Courses Accordion List */}
      <div id="courses-accordion-list" className="space-y-5">
        {courses.map((course) => {
          const isExpanded = expandedCourses[course.id] ?? false;
          const completedCount = course.assignments.filter(a => a.completed).length;
          const totalCount = course.assignments.length;
          const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const totalCourseMilestones = course.assignments.reduce((sum, a) => sum + (a.milestones?.length || 0), 0);

          return (
            <div key={course.id} id={`course-card-${course.id}`} className="bg-white border-4 border-indigo-100 rounded-[2rem] overflow-hidden shadow-md">
              
              {/* Course Header Bar */}
              <div 
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border-b-2 border-slate-100 cursor-pointer select-none"
                onClick={() => toggleCourseExpand(course.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border-2 ${course.color || PALETTE[0]}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      {course.name}
                      {course.code && <span className="text-xs text-slate-400 font-black">({course.code})</span>}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                      {completedCount} of {totalCount} deliverables completed • {totalCourseMilestones} milestones
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-200/40 pt-3 sm:pt-0 sm:border-0">
                  <div className="flex items-center gap-2 w-32">
                    <span className="text-[10px] text-slate-500 font-black">{progressPercentage}%</span>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border-2 border-white shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${progressPercentage === 100 ? 'bg-emerald-400' : 'bg-indigo-500'}`} 
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      id={`course-add-assign-btn-${course.id}`}
                      onClick={() => {
                        setActiveCourseIdForNewAssignment(course.id);
                        setExpandedCourses(prev => ({ ...prev, [course.id]: true }));
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Add Deliverable to Course"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span className="hidden sm:inline">Deliverable</span>
                    </button>

                    <button
                      id={`delete-course-btn-${course.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCourse(course.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title={`Delete Course ${course.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment adding form overlay */}
              {activeCourseIdForNewAssignment === course.id && (
                <div className="p-6 bg-slate-50/50 border-b-2 border-slate-100 space-y-4">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-500 stroke-[3]" />
                    New Assignment for {course.name}
                  </h5>
                  <form onSubmit={(e) => handleAddAssignmentSubmit(e, course.id)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor="assign-title" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Assignment / Deliverable Title *</label>
                        <input
                          id="assign-title"
                          type="text"
                          required
                          placeholder="e.g. Lab Report 2: Enzyme Activity, Midterm Exam"
                          value={newAssignTitle}
                          onChange={e => setNewAssignTitle(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label htmlFor="assign-date" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Due Date *</label>
                        <input
                          id="assign-date"
                          type="date"
                          required
                          value={newAssignDate}
                          onChange={e => setNewAssignDate(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label htmlFor="assign-weight" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Weight <span className="text-slate-400 font-bold">(e.g. 15%)</span></label>
                        <input
                          id="assign-weight"
                          type="text"
                          placeholder="10%"
                          value={newAssignWeight}
                          onChange={e => setNewAssignWeight(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label htmlFor="assign-priority" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                        <select
                          id="assign-priority"
                          value={newAssignPriority}
                          onChange={e => setNewAssignPriority(e.target.value as any)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                        >
                          <option value="high">🔴 High Priority</option>
                          <option value="medium">🟡 Medium Priority</option>
                          <option value="low">🟢 Low Priority</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="assign-milestones" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                          Starter study milestones
                        </label>
                        <select
                          id="assign-milestones"
                          value={newAssignMilestoneSteps}
                          onChange={e => setNewAssignMilestoneSteps(Number(e.target.value))}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                        >
                          <option value={0}>0 milestones (I will create custom milestones manually)</option>
                          <option value={1}>1 step (Review & submit)</option>
                          <option value={2}>2 steps (Drafting & revisions)</option>
                          <option value={3}>3 steps (Research + draft + final polish)</option>
                          <option value={4}>4 steps (Multi-stage study & review)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="assign-desc" className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Guidelines / Description</label>
                      <input
                        id="assign-desc"
                        type="text"
                        placeholder="Topics covered, prompt questions, or specific reading references..."
                        value={newAssignDesc}
                        onChange={e => setNewAssignDesc(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>

                    <div className="flex justify-end gap-2 text-xs pt-1">
                      <button
                        type="button"
                        id="cancel-add-assign-btn"
                        onClick={() => setActiveCourseIdForNewAssignment(null)}
                        className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        id="submit-add-assign-btn"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2.5 rounded-xl cursor-pointer shadow-sm uppercase text-xs"
                      >
                        Schedule Deliverable
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Assignments List Area */}
              {isExpanded && (
                <div className="p-6 space-y-4">
                  {course.assignments.length === 0 ? (
                    <div id="no-assigns-empty" className="text-center py-8 text-slate-400 font-bold text-xs border-4 border-dashed border-slate-100 rounded-2xl space-y-2">
                      <p>No assignments or exams added to this course yet.</p>
                      <button
                        onClick={() => setActiveCourseIdForNewAssignment(course.id)}
                        className="text-indigo-600 hover:underline font-black text-xs inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        Schedule first deliverable
                      </button>
                    </div>
                  ) : (
                    <div id="course-assignments-list" className="divide-y-2 divide-slate-100 space-y-4">
                      {course.assignments.map((assignment) => {
                        const isOverdue = daysBetween(todayStr, assignment.dueDate) < 0 && !assignment.completed;
                        const readableDueDate = new Date(assignment.dueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const isInlineAddingMilestone = activeAssignmentForMilestone?.assignmentId === assignment.id;

                        return (
                          <div 
                            key={assignment.id} 
                            id={`assign-row-${assignment.id}`}
                            className={`pt-4 first:pt-0 space-y-3 ${assignment.completed ? 'opacity-60' : ''}`}
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <button
                                  id={`toggle-assignment-btn-${assignment.id}`}
                                  onClick={() => onToggleAssignment(course.id, assignment.id)}
                                  className={`mt-1 text-slate-400 hover:text-indigo-600 cursor-pointer ${assignment.completed ? 'text-emerald-500 hover:text-emerald-600' : ''}`}
                                  title={assignment.completed ? 'Mark as incomplete' : 'Mark as completed'}
                                >
                                  {assignment.completed ? (
                                    <CheckSquare className="w-6 h-6 stroke-[2.5]" />
                                  ) : (
                                    <Square className="w-6 h-6 stroke-[2]" />
                                  )}
                                </button>

                                <div className="space-y-1">
                                  <h5 className={`text-base font-black text-slate-900 ${assignment.completed ? 'line-through text-slate-400' : ''}`}>
                                    {assignment.title}
                                  </h5>
                                  {assignment.description && (
                                    <p className="text-xs text-slate-600 font-semibold max-w-xl">
                                      {assignment.description}
                                    </p>
                                  )}
                                  
                                  {/* Milestones pill grid with delete and toggle */}
                                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                                    {(!assignment.milestones || assignment.milestones.length === 0) && (
                                      <span className="text-[10px] text-slate-400 font-bold italic mr-1">
                                        No milestones yet
                                      </span>
                                    )}

                                    {assignment.milestones?.map(m => (
                                      <div 
                                        key={m.id}
                                        id={`milestone-pill-${m.id}`}
                                        className={`group text-[10px] pl-2.5 pr-1.5 py-1 rounded-xl flex items-center gap-1.5 border-2 transition-all ${m.completed ? 'bg-emerald-50 border-emerald-200 text-emerald-800 line-through font-bold shadow-xs' : 'bg-white border-slate-200 text-slate-800 font-extrabold shadow-xs hover:border-indigo-400'}`}
                                      >
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleMilestone && onToggleMilestone(course.id, assignment.id, m.id);
                                          }}
                                          className="cursor-pointer"
                                          title={m.completed ? 'Mark milestone incomplete' : 'Mark milestone completed'}
                                        >
                                          <span className={`w-2 h-2 rounded-full inline-block ${m.completed ? 'bg-emerald-500' : 'bg-indigo-600'}`} />
                                        </button>
                                        <span>{m.title}</span>
                                        <span className="text-slate-400 font-medium">({m.durationHours}h)</span>
                                        {m.dateScheduled && (
                                          <span className="text-indigo-600 font-mono text-[9px] bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                                            {m.dateScheduled.slice(5)}
                                          </span>
                                        )}
                                        {onDeleteMilestone && (
                                          <button
                                            type="button"
                                            id={`delete-milestone-${m.id}`}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              onDeleteMilestone(course.id, assignment.id, m.id);
                                            }}
                                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded p-1 transition-all ml-0.5 cursor-pointer"
                                            title={`Delete milestone "${m.title}"`}
                                            aria-label={`Delete milestone ${m.title}`}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    ))}

                                    {/* Inline Add Milestone Button */}
                                    <button
                                      id={`btn-add-milestone-${assignment.id}`}
                                      onClick={() => handleOpenInlineMilestone(course.id, assignment)}
                                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                    >
                                      <Plus className="w-3 h-3 stroke-[3]" />
                                      Create Milestone
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Badges & Actions */}
                              <div className="flex items-center justify-between md:justify-end gap-3.5 pt-2.5 md:pt-0 border-t-2 border-slate-100 md:border-0 font-black">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] px-2.5 py-1 rounded-lg uppercase border-2 ${assignment.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm' : assignment.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm' : 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm'}`}>
                                    {assignment.priority}
                                  </span>
                                  <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-50 border-2 border-slate-100 font-mono text-slate-500 shadow-sm">
                                    WT: {assignment.weight}
                                  </span>
                                  <span className={`text-xs flex items-center gap-1.5 font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>{readableDueDate}</span>
                                    {!assignment.completed && (
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                        daysBetween(todayStr, assignment.dueDate) < 0 
                                          ? 'bg-rose-100 text-rose-700' 
                                          : daysBetween(todayStr, assignment.dueDate) <= 3 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-indigo-50 text-indigo-700'
                                      }`}>
                                        {daysBetween(todayStr, assignment.dueDate) < 0 
                                          ? `${Math.abs(daysBetween(todayStr, assignment.dueDate))}d overdue` 
                                          : daysBetween(todayStr, assignment.dueDate) === 0 
                                            ? 'Due Today' 
                                            : daysBetween(todayStr, assignment.dueDate) === 1 
                                              ? 'Due Tomorrow' 
                                              : `${daysBetween(todayStr, assignment.dueDate)}d left`}
                                      </span>
                                    )}
                                  </span>
                                </div>

                                <button
                                  id={`delete-assignment-btn-${assignment.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteAssignment(course.id, assignment.id);
                                  }}
                                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                                  title={`Delete deliverable "${assignment.title}"`}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            {/* Inline Form to Add a Milestone directly to this assignment */}
                            {isInlineAddingMilestone && (
                              <form 
                                onSubmit={handleInlineMilestoneSubmit}
                                className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-4 mt-2 space-y-3 animate-in fade-in"
                              >
                                <div className="text-[11px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                  Add Custom Milestone to {assignment.title}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Milestone Title *</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Draft introduction & problem statement"
                                      value={newMilestoneTitle}
                                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Scheduled Date *</label>
                                    <input
                                      type="date"
                                      required
                                      value={newMilestoneDate}
                                      onChange={(e) => setNewMilestoneDate(e.target.value)}
                                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Duration (Hours)</label>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0.5"
                                      max="10"
                                      value={newMilestoneDuration}
                                      onChange={(e) => setNewMilestoneDuration(parseFloat(e.target.value) || 1)}
                                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Description / Target (Optional)</label>
                                    <input
                                      type="text"
                                      placeholder="Notes or targets for this session..."
                                      value={newMilestoneDesc}
                                      onChange={(e) => setNewMilestoneDesc(e.target.value)}
                                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2 text-xs pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setActiveAssignmentForMilestone(null)}
                                    className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-1.5 rounded-xl cursor-pointer shadow-sm uppercase text-xs"
                                  >
                                    Save Milestone
                                  </button>
                                </div>
                              </form>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
