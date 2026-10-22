import React from 'react';
import { Calendar, Clock, AlertTriangle, BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import { Course, Assignment, Milestone } from '../types';
import { daysBetween } from '../utils/scheduleGenerator';

interface DashboardStatsProps {
  courses: Course[];
  todayStr: string;
}

export default function DashboardStats({ courses, todayStr }: DashboardStatsProps) {
  // Aggregate all assignments
  const allAssignments: Assignment[] = [];
  courses.forEach(c => {
    c.assignments.forEach(a => {
      allAssignments.push({ ...a, courseName: c.name });
    });
  });

  const activeAssignments = allAssignments.filter(a => !a.completed);
  const completedAssignmentsCount = allAssignments.filter(a => a.completed).length;

  // Next deadline countdown
  let nextAssignment: Assignment | null = null;
  let minDaysToDue = Infinity;

  activeAssignments.forEach(a => {
    const days = daysBetween(todayStr, a.dueDate);
    if (days >= 0 && days < minDaysToDue) {
      minDaysToDue = days;
      nextAssignment = a;
    }
  });

  // Calculate study hours planned (total uncompleted milestone hours)
  let totalStudyHoursPlanned = 0;
  let completedStudyHours = 0;
  let todayScheduledHours = 0;
  let todayCompletedHours = 0;

  activeAssignments.forEach(a => {
    a.milestones.forEach(m => {
      if (m.completed) {
        completedStudyHours += m.durationHours;
      } else {
        totalStudyHoursPlanned += m.durationHours;
      }

      if (m.dateScheduled === todayStr) {
        todayScheduledHours += m.durationHours;
        if (m.completed) {
          todayCompletedHours += m.durationHours;
        }
      }
    });
  });

  // Calculate daily workload peaks and generate alert if any day has too much work
  const dailyWorkload: Record<string, number> = {};
  allAssignments.forEach(a => {
    a.milestones.forEach(m => {
      if (!m.completed && m.dateScheduled) {
        dailyWorkload[m.dateScheduled] = (dailyWorkload[m.dateScheduled] || 0) + m.durationHours;
      }
    });
  });

  let maxWorkloadDayStr = '';
  let maxWorkloadHours = 0;
  Object.entries(dailyWorkload).forEach(([date, hours]) => {
    // Only care about today or future peaks
    if (daysBetween(todayStr, date) >= 0 && hours > maxWorkloadHours) {
      maxWorkloadHours = hours;
      maxWorkloadDayStr = date;
    }
  });

  // Format readable date for the max workload day
  const formatReadableDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const hasHighWorkload = maxWorkloadHours > 4;

  return (
    <div id="dashboard-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Total Course & Load - Vibrant Slate/Indigo border */}
      <div id="stat-card-courses" className="bg-white border-4 border-indigo-100 rounded-[2rem] p-6 flex items-center gap-4 shadow-xl text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg transform -rotate-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <span className="text-indigo-400 text-xs font-black uppercase tracking-wider block">Course Load</span>
          <span className="text-2xl font-black text-slate-900 block mt-0.5">{courses.length} <span className="text-sm font-bold text-slate-500">active</span></span>
          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{allAssignments.length} total deliverables</span>
        </div>
      </div>

      {/* Hours Scheduled - Vibrant Emerald border */}
      <div id="stat-card-hours" className="bg-white border-4 border-emerald-100 rounded-[2rem] p-6 flex items-center gap-4 shadow-xl text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-emerald-900 flex items-center justify-center flex-shrink-0 shadow-lg transform rotate-3">
          <Clock className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <span className="text-emerald-500 text-xs font-black uppercase tracking-wider block">Prep Study Hours</span>
          <span className="text-2xl font-black text-slate-900 block mt-0.5">
            {totalStudyHoursPlanned.toFixed(1)} <span className="text-xs font-bold text-slate-500">hrs left</span>
          </span>
          <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(completedStudyHours + totalStudyHoursPlanned) > 0 ? (completedStudyHours / (completedStudyHours + totalStudyHoursPlanned)) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-bold mt-1.5 block">
            {completedStudyHours.toFixed(1)} hrs completed
          </span>
        </div>
      </div>

      {/* Today's Tasks Progress - Vibrant Amber border */}
      <div id="stat-card-today-progress" className="bg-white border-4 border-yellow-200 rounded-[2rem] p-6 flex items-center gap-4 shadow-xl text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg transform -rotate-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <span className="text-yellow-700 text-xs font-black uppercase tracking-wider block">Today's Focus</span>
          <span className="text-2xl font-black text-slate-900 block mt-0.5">
            {todayScheduledHours > 0 ? `${todayCompletedHours.toFixed(1)}/${todayScheduledHours.toFixed(1)}` : '0/0'} <span className="text-xs font-bold text-slate-500">hrs</span>
          </span>
          <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-yellow-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${todayScheduledHours > 0 ? (todayCompletedHours / todayScheduledHours) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-bold mt-1.5 block">
            {todayScheduledHours > 0 ? `${Math.round((todayCompletedHours / todayScheduledHours) * 100)}% of today's plan` : 'No study blocks scheduled'}
          </span>
        </div>
      </div>

      {/* Next Deadline Countdown - Vibrant Rose border */}
      <div id="stat-card-deadline" className="bg-white border-4 border-rose-100 rounded-[2rem] p-6 flex items-center gap-4 shadow-xl text-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg transform rotate-3">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="overflow-hidden flex-1">
          <span className="text-rose-500 text-xs font-black uppercase tracking-wider block">Next Deadline</span>
          {nextAssignment ? (
            <>
              <span className="text-base font-black text-slate-900 block mt-0.5 truncate" title={(nextAssignment as Assignment).title}>
                {(nextAssignment as Assignment).title}
              </span>
              <span className={`text-[10px] font-black mt-1 block uppercase ${minDaysToDue <= 2 ? 'text-rose-600 animate-pulse' : minDaysToDue <= 5 ? 'text-amber-500' : 'text-slate-500'}`}>
                {minDaysToDue === 0 ? '💥 DUE TODAY' : minDaysToDue === 1 ? '⏰ Due Tomorrow' : `📅 Due in ${minDaysToDue} days`}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-slate-400 block mt-1.5">No upcoming deadlines</span>
          )}
        </div>
      </div>

      {/* Peak Workload Warning */}
      {hasHighWorkload && (
        <div id="workload-alert-banner" className="md:col-span-2 lg:col-span-4 bg-amber-50 border-4 border-yellow-200 rounded-[2rem] p-6 flex items-start gap-4 mt-2 shadow-lg text-slate-800">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h4 className="text-base font-black text-yellow-800 uppercase tracking-tight">Peak Workload Warning</h4>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed font-bold">
              You have a high concentration of work scheduled on <span className="text-slate-900 font-black">{formatReadableDate(maxWorkloadDayStr)}</span> with <span className="text-indigo-600 font-black">{maxWorkloadHours.toFixed(1)} study hours</span> planned. 
              To make your preparation more manageable, open the <span className="text-indigo-600 font-black">Study Planner Settings</span> below and change your intensity to <span className="text-indigo-600 font-black">Casual</span> or increase your allowed work days to spread your study milestones more evenly!
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
