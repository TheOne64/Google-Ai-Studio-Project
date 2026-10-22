import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, BookOpen, Calendar, Settings, Compass, Info, Github, Plus, Layers, ArrowLeft } from 'lucide-react';
import SyllabusUpload from './components/SyllabusUpload';
import DashboardStats from './components/DashboardStats';
import ScheduleView from './components/ScheduleView';
import AssignmentList from './components/AssignmentList';
import SettingsPanel from './components/SettingsPanel';
import LoginScreen from './components/LoginScreen';
import UserMenu from './components/UserMenu';
import ScheduleSelectorBar from './components/ScheduleSelectorBar';
import ScheduleModal from './components/ScheduleModal';
import { Course, SchedulePreferences, Assignment, Milestone, User, StudySchedule } from './types';
import { generateSmartSchedule, getSystemTodayString } from './utils/scheduleGenerator';
import {
  getCurrentUser,
  setCurrentUser,
  getUserSchedules,
  saveUserSchedules,
  getActiveScheduleId,
  setActiveScheduleId as saveActiveScheduleId,
  DEFAULT_PREFERENCES
} from './utils/authStorage';

const PALETTE = [
  'bg-indigo-600 text-white border-2 border-indigo-700 shadow-sm',
  'bg-rose-500 text-white border-2 border-rose-600 shadow-sm',
  'bg-amber-400 text-slate-900 border-2 border-amber-500 shadow-sm',
  'bg-emerald-500 text-white border-2 border-emerald-600 shadow-sm',
  'bg-blue-600 text-white border-2 border-blue-700 shadow-sm',
  'bg-fuchsia-500 text-white border-2 border-fuchsia-600 shadow-sm',
  'bg-sky-400 text-slate-900 border-2 border-sky-500 shadow-sm'
];

const BASELINE_TODAY = getSystemTodayString();
const USER_EMAIL = 'thompsondemi686@gmail.com';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [schedules, setSchedules] = useState<StudySchedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<string>('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Initialize auth state on mount - sign out of all preview accounts for clean public preview
  useEffect(() => {
    try {
      // Clean sign out of preview accounts so users can see how it looks to sign in and log in
      const hasPreviewInit = localStorage.getItem('syllabus_preview_clean_signout_done_v2');
      if (!hasPreviewInit) {
        localStorage.removeItem('syllabus_auth_current_user');
        sessionStorage.removeItem('syllabus_active_session');
        localStorage.setItem('syllabus_preview_clean_signout_done_v2', 'true');
        setCurrentUserState(null);
      }

      // Ensure zero courses and zero milestones start fresh
      const hasZeroInit = localStorage.getItem('syllabus_zero_courses_init_v4');
      if (!hasZeroInit) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('syllabus_schedules_user_') || key.startsWith('syllabus_active_sched_user_')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem('syllabus_zero_courses_init_v4', 'true');
      }

      const isSessionActive = sessionStorage.getItem('syllabus_active_session');
      if (!isSessionActive) {
        localStorage.removeItem('syllabus_auth_current_user');
        setCurrentUserState(null);
      } else {
        const user = getCurrentUser();
        if (user) {
          setCurrentUserState(user);
          const userScheds = getUserSchedules(user.id);
          setSchedules(userScheds);
          const activeId = getActiveScheduleId(user.id, userScheds);
          setActiveScheduleId(activeId);
        } else {
          setCurrentUserState(null);
        }
      }
    } catch {
      setCurrentUserState(null);
    }
    setLoaded(true);
  }, []);

  // Sync active schedule id to storage
  const handleSelectSchedule = (scheduleId: string) => {
    if (!currentUser) return;
    setActiveScheduleId(scheduleId);
    saveActiveScheduleId(currentUser.id, scheduleId);
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    try {
      sessionStorage.setItem('syllabus_active_session', 'true');
    } catch {}
    setCurrentUserState(user);
    setCurrentUser(user);
    setIsSwitchingAccount(false);

    const userScheds = getUserSchedules(user.id);
    setSchedules(userScheds);
    const activeId = getActiveScheduleId(user.id, userScheds);
    setActiveScheduleId(activeId);
  };

  // Logout handler
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('syllabus_active_session');
    } catch {}
    setCurrentUser(null);
    setCurrentUserState(null);
    setIsSwitchingAccount(false);
  };

  // Switch account (opens login screen while keeping previous data safe)
  const handleSwitchAccount = () => {
    setIsSwitchingAccount(true);
  };

  // Schedule creation handler
  const handleScheduleCreated = (newSchedule: StudySchedule) => {
    if (!currentUser) return;
    const updated = [newSchedule, ...schedules];
    setSchedules(updated);
    saveUserSchedules(currentUser.id, updated);
    setActiveScheduleId(newSchedule.id);
    saveActiveScheduleId(currentUser.id, newSchedule.id);
  };

  // Delete schedule
  const handleDeleteSchedule = (scheduleId: string) => {
    if (!currentUser || schedules.length <= 1) return;
    const updated = schedules.filter((s) => s.id !== scheduleId);
    setSchedules(updated);
    saveUserSchedules(currentUser.id, updated);
    if (activeScheduleId === scheduleId) {
      setActiveScheduleId(updated[0].id);
      saveActiveScheduleId(currentUser.id, updated[0].id);
    }
  };

  // Rename schedule
  const handleRenameSchedule = (scheduleId: string, newTitle: string) => {
    if (!currentUser) return;
    const updated = schedules.map((s) => {
      if (s.id !== scheduleId) return s;
      return { ...s, title: newTitle, updatedAt: new Date().toISOString() };
    });
    setSchedules(updated);
    saveUserSchedules(currentUser.id, updated);
  };

  // Get active schedule object
  const activeSchedule = schedules.find((s) => s.id === activeScheduleId) || schedules[0];
  const courses = activeSchedule?.courses || [];
  const preferences = activeSchedule?.preferences || DEFAULT_PREFERENCES;

  // Helper to update active schedule's courses
  const updateCourses = (coursesUpdater: (prev: Course[]) => Course[]) => {
    if (!currentUser || !activeSchedule) return;

    setSchedules((prevSchedules) => {
      const updated = prevSchedules.map((s) => {
        if (s.id !== activeSchedule.id) return s;
        const newCourses = coursesUpdater(s.courses);
        return {
          ...s,
          courses: newCourses,
          updatedAt: new Date().toISOString()
        };
      });
      saveUserSchedules(currentUser.id, updated);
      return updated;
    });
  };

  // Handler for syllabus upload
  const handleSyllabusUploadSuccess = (uploadedCourse: Partial<Course>) => {
    const paletteIndex = courses.length % PALETTE.length;
    const courseColor = PALETTE[paletteIndex];

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: uploadedCourse.name || 'New Syllabus Course',
      code: uploadedCourse.code || '',
      color: courseColor,
      assignments: (uploadedCourse.assignments || []).map((a) => ({
        ...a,
        courseName: uploadedCourse.name || 'New Syllabus Course'
      }))
    };

    updateCourses((prevCourses) => {
      const updated = [...prevCourses, newCourse];
      return generateSmartSchedule(updated, preferences, BASELINE_TODAY);
    });
  };

  // Toggle milestone completion
  const handleToggleMilestone = (courseId: string, assignmentId: string, milestoneId: string) => {
    updateCourses((prevCourses) => {
      return prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        const updatedAssignments = course.assignments.map((assign) => {
          if (assign.id !== assignmentId) return assign;

          const updatedMilestones = assign.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            return { ...m, completed: !m.completed };
          });

          const allMilestonesCompleted = updatedMilestones.every((m) => m.completed);

          return {
            ...assign,
            milestones: updatedMilestones,
            completed: allMilestonesCompleted
          };
        });

        return { ...course, assignments: updatedAssignments };
      });
    });
  };

  // Reschedule milestone
  const handleRescheduleMilestone = (
    courseId: string,
    assignmentId: string,
    milestoneId: string,
    newDate: string
  ) => {
    updateCourses((prevCourses) => {
      return prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        const updatedAssignments = course.assignments.map((assign) => {
          if (assign.id !== assignmentId) return assign;

          const updatedMilestones = assign.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            return { ...m, dateScheduled: newDate };
          });

          return { ...assign, milestones: updatedMilestones };
        });

        return { ...course, assignments: updatedAssignments };
      });
    });
  };

  // Toggle parent assignment completion
  const handleToggleAssignment = (courseId: string, assignmentId: string) => {
    updateCourses((prevCourses) => {
      return prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        const updatedAssignments = course.assignments.map((assign) => {
          if (assign.id !== assignmentId) return assign;

          const targetCompleted = !assign.completed;
          const updatedMilestones = assign.milestones.map((m) => ({
            ...m,
            completed: targetCompleted
          }));

          return {
            ...assign,
            completed: targetCompleted,
            milestones: updatedMilestones
          };
        });

        return { ...course, assignments: updatedAssignments };
      });
    });
  };

  // Add custom milestone to an assignment
  const handleAddMilestone = (
    courseId: string,
    assignmentId: string,
    milestoneData: { title: string; dateScheduled: string; durationHours: number; description?: string }
  ) => {
    updateCourses((prevCourses) => {
      return prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        const updatedAssignments = course.assignments.map((assign) => {
          if (assign.id !== assignmentId) return assign;

          const newMilestone: Milestone = {
            id: `milestone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: milestoneData.title.trim(),
            description: milestoneData.description?.trim() || '',
            durationHours: Number(milestoneData.durationHours) || 1.5,
            dateScheduled: milestoneData.dateScheduled || BASELINE_TODAY,
            completed: false
          };

          return {
            ...assign,
            milestones: [...assign.milestones, newMilestone]
          };
        });

        return { ...course, assignments: updatedAssignments };
      });
    });
  };

  // Delete individual milestone
  const handleDeleteMilestone = (
    courseId: string,
    assignmentId: string,
    milestoneId: string
  ) => {
    updateCourses((prevCourses) => {
      return prevCourses.map((course) => {
        // Direct match or check if this course contains the milestone
        const hasMilestone = (course.assignments || []).some((a) =>
          (a.milestones || []).some((m) => m.id === milestoneId)
        );
        if (course.id !== courseId && !hasMilestone) return course;

        const updatedAssignments = (course.assignments || []).map((assign) => {
          const assignHasMilestone = (assign.milestones || []).some((m) => m.id === milestoneId);
          if (assign.id !== assignmentId && !assignHasMilestone) return assign;

          const filtered = (assign.milestones || []).filter((m) => m.id !== milestoneId);
          return {
            ...assign,
            milestones: filtered,
            completed: filtered.length > 0 && filtered.every((m) => m.completed)
          };
        });

        return { ...course, assignments: updatedAssignments };
      });
    });
  };

  // Quick milestone creator from roadmap view
  const handleCreateQuickMilestone = (
    courseIdOrName: string,
    assignmentIdOrTitle: string,
    milestoneTitle: string,
    dateScheduled: string,
    durationHours: number,
    description?: string
  ) => {
    updateCourses((prevCourses) => {
      let targetCourse = prevCourses.find(
        (c) => c.id === courseIdOrName || c.name.toLowerCase() === courseIdOrName.trim().toLowerCase()
      );
      let updatedCourses = [...prevCourses];

      if (!targetCourse) {
        const paletteIndex = updatedCourses.length % PALETTE.length;
        targetCourse = {
          id: `course-${Date.now()}`,
          name: courseIdOrName.trim() || 'General Studies',
          code: '',
          color: PALETTE[paletteIndex],
          assignments: []
        };
        updatedCourses = [...updatedCourses, targetCourse];
      }

      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: milestoneTitle.trim(),
        description: description?.trim() || '',
        durationHours: Number(durationHours) || 1.5,
        dateScheduled: dateScheduled || BASELINE_TODAY,
        completed: false
      };

      let targetAssignment = targetCourse.assignments.find(
        (a) => a.id === assignmentIdOrTitle || a.title.toLowerCase() === assignmentIdOrTitle.trim().toLowerCase()
      );

      if (!targetAssignment) {
        targetAssignment = {
          id: `assign-${Date.now()}`,
          courseId: targetCourse.id,
          courseName: targetCourse.name,
          title: assignmentIdOrTitle.trim() || 'Course Deliverable',
          dueDate: dateScheduled || BASELINE_TODAY,
          description: description?.trim() || '',
          weight: '10%',
          priority: 'medium',
          completed: false,
          milestones: [newMilestone]
        };
        targetCourse.assignments = [...targetCourse.assignments, targetAssignment];
      } else {
        targetAssignment.milestones = [...targetAssignment.milestones, newMilestone];
      }

      return updatedCourses.map(c => c.id === targetCourse!.id ? targetCourse! : c);
    });
  };

  // Add course manually
  const handleAddCourse = (courseName: string, courseCode: string) => {
    const paletteIndex = courses.length % PALETTE.length;
    const courseColor = PALETTE[paletteIndex];

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: courseName,
      code: courseCode,
      color: courseColor,
      assignments: []
    };

    updateCourses((prev) => [...prev, newCourse]);
  };

  // Delete course completely
  const handleDeleteCourse = (courseId: string) => {
    updateCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  // Add assignment manually
  const handleAddAssignment = (
    courseId: string,
    assignmentData: Omit<Assignment, 'id' | 'milestones'>,
    customMilestonesCount: number
  ) => {
    const rawMilestones: Omit<Milestone, 'id' | 'dateScheduled' | 'completed'>[] = [];

    if (customMilestonesCount === 0) {
      // 0 milestones so users can create their own milestones manually
    } else if (customMilestonesCount === 1) {
      rawMilestones.push({
        title: 'Review content & execute task',
        description: 'Read the prompt requirements and draft your core deliverable.',
        durationHours: 2.0,
        daysBeforeDue: 2
      });
    } else if (customMilestonesCount === 2) {
      rawMilestones.push({
        title: 'Initial drafting & problem solving',
        description: 'Establish the core layout, balance formula, or compose paragraphs.',
        durationHours: 2.0,
        daysBeforeDue: 4
      });
      rawMilestones.push({
        title: 'Proofreading & final revisions',
        description: 'Scan your draft for formatting mistakes or logic gaps.',
        durationHours: 1.0,
        daysBeforeDue: 1
      });
    } else if (customMilestonesCount === 3) {
      rawMilestones.push({
        title: 'Source research & scheduling plan',
        description: 'Outline the deliverable components and compile references.',
        durationHours: 1.5,
        daysBeforeDue: 6
      });
      rawMilestones.push({
        title: 'Drafting core assignment',
        description: 'Compose the primary body, write the scripts, or finish lab graphs.',
        durationHours: 2.5,
        daysBeforeDue: 3
      });
      rawMilestones.push({
        title: 'Final feedback polish',
        description: 'Double check grade criteria and execute final submissions.',
        durationHours: 1.0,
        daysBeforeDue: 1
      });
    } else {
      rawMilestones.push({
        title: 'Topic outlining & structure design',
        description: 'Decide core thesis directions or study chapter targets.',
        durationHours: 1.5,
        daysBeforeDue: 10
      });
      rawMilestones.push({
        title: 'Drafting Section 1 & data collection',
        description: 'Write early segments and gather supporting evidence/equations.',
        durationHours: 3.0,
        daysBeforeDue: 7
      });
      rawMilestones.push({
        title: 'Second pass polish & calculations',
        description: 'Refine complex formulas, write explanations, or debug processes.',
        durationHours: 2.0,
        daysBeforeDue: 3
      });
      rawMilestones.push({
        title: 'Final formatting proofread',
        description: 'Align citations, run final checks, and finalize export files.',
        durationHours: 1.0,
        daysBeforeDue: 1
      });
    }

    const newAssignment: Assignment = {
      ...assignmentData,
      id: `assign-${Date.now()}`,
      completed: false,
      milestones: rawMilestones.map((rm, idx) => ({
        ...rm,
        id: `milestone-${Date.now()}-${idx}`,
        completed: false,
        dateScheduled: ''
      }))
    };

    updateCourses((prevCourses) => {
      const updated = prevCourses.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          assignments: [...c.assignments, newAssignment]
        };
      });
      return generateSmartSchedule(updated, preferences, BASELINE_TODAY);
    });
  };

  // Delete assignment
  const handleDeleteAssignment = (courseId: string, assignmentId: string) => {
    updateCourses((prevCourses) => {
      return prevCourses.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          assignments: c.assignments.filter((a) => a.id !== assignmentId)
        };
      });
    });
  };

  // Update schedule preferences
  const handleUpdatePreferences = (updatedPrefs: SchedulePreferences) => {
    if (!currentUser || !activeSchedule) return;

    setSchedules((prevSchedules) => {
      const updated = prevSchedules.map((s) => {
        if (s.id !== activeSchedule.id) return s;
        const recalculated = generateSmartSchedule(s.courses, updatedPrefs, BASELINE_TODAY);
        return {
          ...s,
          preferences: updatedPrefs,
          courses: recalculated,
          updatedAt: new Date().toISOString()
        };
      });
      saveUserSchedules(currentUser.id, updated);
      return updated;
    });
  };

  const handleResetToDefaults = () => {
    handleUpdatePreferences(DEFAULT_PREFERENCES);
  };

  // Loading state
  if (!loaded) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-indigo-400 animate-bounce" />
          <span className="font-bold text-lg">Loading your study roadmap...</span>
        </div>
      </div>
    );
  }

  // If no user is logged in or user explicitly requested to switch accounts:
  if (!currentUser || isSwitchingAccount) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        suggestedEmail={USER_EMAIL}
        isSwitchingAccount={isSwitchingAccount}
        onCancelSwitch={() => setIsSwitchingAccount(false)}
      />
    );
  }

  return (
    <div id="app-root-container" className="min-h-screen bg-indigo-50 text-slate-800 selection:bg-indigo-500/30 font-sans antialiased">
      
      {/* Header Bar */}
      <header id="app-header" className="h-20 bg-white border-b-4 border-indigo-200 px-4 sm:px-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-11 sm:w-12 h-11 sm:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 shrink-0">
            <GraduationCap className="h-6 sm:h-7 w-6 sm:w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-indigo-900 uppercase leading-none">
              Syllabus<span className="text-indigo-500">StudyRoad</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">
              Adaptive Work Planner
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
          <a
            href="#schedule-view-container"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Roadmap</span>
          </a>
          <a
            href="#assignment-list-container"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Classes</span>
          </a>
          <a
            href="#syllabus-upload-container"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Upload Syllabus</span>
          </a>
          <a
            href="#settings-panel-container"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-500" />
            <span>Pace</span>
          </a>
        </nav>

        {/* User Account & Provider Dropdown */}
        <div className="flex items-center gap-3">
          <UserMenu
            user={currentUser}
            onLogout={handleLogout}
            onSwitchAccount={handleSwitchAccount}
            schedules={schedules}
            activeScheduleId={activeScheduleId}
            onSelectSchedule={handleSelectSchedule}
            onOpenCreateSchedule={() => setIsScheduleModalOpen(true)}
          />
        </div>
      </header>

      {/* Main Workspace Area */}
      <main id="app-main-workspace" className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Multi-Schedule Selector & Switcher Bar */}
        {activeSchedule && (
          <ScheduleSelectorBar
            schedules={schedules}
            activeSchedule={activeSchedule}
            onSelectSchedule={handleSelectSchedule}
            onOpenCreateModal={() => setIsScheduleModalOpen(true)}
            onDeleteSchedule={handleDeleteSchedule}
            onRenameSchedule={handleRenameSchedule}
          />
        )}

        {/* Statistics Dashboard Banner */}
        <div className="mb-8">
          <DashboardStats courses={courses} todayStr={BASELINE_TODAY} />
        </div>

        {/* Bento Grid Layout */}
        <div id="app-bento-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Upload & Setup Settings) - takes 4/12 columns */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Syllabus Upload card */}
            <SyllabusUpload onUploadSuccess={handleSyllabusUploadSuccess} />

            {/* Study preferences config panel */}
            <SettingsPanel 
              preferences={preferences} 
              onUpdatePreferences={handleUpdatePreferences} 
              onResetToDefaults={handleResetToDefaults}
            />

            {/* Workflow Guidance card */}
            <div id="syllabus-advice-card" className="bg-white rounded-[2rem] p-6 shadow-xl border-4 border-indigo-100 space-y-3">
              <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2 uppercase tracking-tight">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Personal Schedule Engine
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your schedule <span className="font-bold text-slate-800">"{activeSchedule?.title}"</span> calculates prep dates backwards from the syllabus deadline. Need a separate schedule for next term or another exam? Use the <strong>"Create Study Schedule"</strong> button anytime.
              </p>
            </div>

          </div>

          {/* Right Column (Daily Schedule & Master Curriculum list) - takes 8/12 columns */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Daily schedule timelines */}
            <ScheduleView 
              courses={courses} 
              todayStr={BASELINE_TODAY}
              onToggleMilestone={handleToggleMilestone}
              onRescheduleMilestone={handleRescheduleMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onCreateMilestone={handleCreateQuickMilestone}
            />

            {/* Master Courses & assignment list */}
            <AssignmentList 
              courses={courses} 
              todayStr={BASELINE_TODAY}
              onAddCourse={handleAddCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddAssignment={handleAddAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onToggleAssignment={handleToggleAssignment}
              onAddMilestone={handleAddMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onToggleMilestone={handleToggleMilestone}
            />

          </div>

        </div>

      </main>

      {/* Page Footer */}
      <footer id="app-footer" className="h-16 bg-white px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] shrink-0 border-t-2 border-slate-100 gap-2 mt-20">
        <div>v2.5.0 Student Edition • Signed in via {currentUser.provider}</div>
        <div>2026 SyllabusStudyRoad Inc. • Stay Organized, Be Legend</div>
      </footer>

      {/* Create New Study Schedule Modal */}
      <ScheduleModal
        userId={currentUser.id}
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleCreated={handleScheduleCreated}
      />

    </div>
  );
}
