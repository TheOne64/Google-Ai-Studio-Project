import { Assignment, Course, Milestone, SchedulePreferences } from '../types';

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getSystemTodayString(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Normalizes a date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Adds or subtracts days from a date string and returns YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T12:00:00'); // set mid-day to avoid timezone shifting
  date.setDate(date.getDate() + days);
  return formatDateString(date);
}

/**
 * Calculates number of days between two dates
 */
export function daysBetween(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2) return 0;
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Regenerates scheduled dates for all milestones across all assignments
 * based on student preferences: workDays, dailyHourLimit, and study intensity.
 */
export function generateSmartSchedule(
  courses: Course[],
  preferences: SchedulePreferences,
  todayStr: string = getSystemTodayString()
): Course[] {
  // Deep copy courses
  const updatedCourses: Course[] = JSON.parse(JSON.stringify(courses));

  // Map to store total hours scheduled per day
  const dailyHoursMap: Record<string, number> = {};

  // For scheduling, we want to process assignments starting from the earliest due date
  // and prioritize high priority assignments.
  const allAssignments: Assignment[] = [];
  updatedCourses.forEach((c) => {
    c.assignments.forEach((a) => {
      allAssignments.push(a);
    });
  });

  // Sort assignments: earliest first, then highest priority
  allAssignments.sort((a, b) => {
    const dateDiff = daysBetween(a.dueDate, b.dueDate);
    if (dateDiff !== 0) return dateDiff;
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  // Schedule each assignment's milestones
  allAssignments.forEach((assignment) => {
    if (assignment.completed) {
      // If assignment is fully completed, milestones remain at their completed state or default dates
      assignment.milestones.forEach((m) => {
        if (!m.dateScheduled) {
          m.dateScheduled = addDays(assignment.dueDate, -1);
        }
      });
      return;
    }

    assignment.milestones.forEach((milestone) => {
      if (milestone.completed) {
        // Keep completed milestones on their assigned date
        if (milestone.dateScheduled) {
          dailyHoursMap[milestone.dateScheduled] = (dailyHoursMap[milestone.dateScheduled] || 0) + milestone.durationHours;
        }
        return;
      }

      // Determine initial target date based on daysBeforeDue and intensity multiplier
      // Casual intensity spreads tasks earlier. Cram mode packs them closer to the due date.
      let daysOffset = milestone.daysBeforeDue ?? 3;
      if (preferences.intensity === 'casual') {
        daysOffset = Math.round(daysOffset * 1.5);
      } else if (preferences.intensity === 'intense') {
        daysOffset = Math.max(1, Math.round(daysOffset * 0.5));
      }

      let targetDateStr = addDays(assignment.dueDate, -daysOffset);

      // Guard: Cannot schedule in the past relative to "today"
      if (daysBetween(todayStr, targetDateStr) < 0) {
        targetDateStr = todayStr;
      }

      // Now find the best valid study day starting from targetDateStr searching BACKWARDS,
      // but if we hit today, we search FORWARDS up to the due date.
      let scheduledDate = findBestDate(
        targetDateStr,
        assignment.dueDate,
        todayStr,
        milestone.durationHours,
        preferences,
        dailyHoursMap
      );

      milestone.dateScheduled = scheduledDate;
      dailyHoursMap[scheduledDate] = (dailyHoursMap[scheduledDate] || 0) + milestone.durationHours;
    });
  });

  // Re-map scheduled assignments back to their courses
  updatedCourses.forEach((course) => {
    course.assignments = course.assignments.map((origA) => {
      const updatedA = allAssignments.find((a) => a.id === origA.id);
      return updatedA || origA;
    });
  });

  return updatedCourses;
}

/**
 * Finds the best date to schedule a milestone based on available study hours and working days.
 */
function findBestDate(
  targetDateStr: string,
  dueDateStr: string,
  todayStr: string,
  durationHours: number,
  preferences: SchedulePreferences,
  dailyHoursMap: Record<string, number>
): string {
  const maxSearchDays = 30;
  
  // Helper to check if a day is an allowed work day
  const isWorkDayAllowed = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return preferences.workDays.includes(dayOfWeek);
  };

  // 1. Try to find an allowed day searching BACKWARDS from targetDateStr down to todayStr
  // that currently has enough capacity (hours scheduled + duration <= dailyHourLimit).
  let currentDate = targetDateStr;
  while (daysBetween(todayStr, currentDate) >= 0 && daysBetween(currentDate, targetDateStr) <= maxSearchDays) {
    if (isWorkDayAllowed(currentDate)) {
      const scheduledHours = dailyHoursMap[currentDate] || 0;
      if (scheduledHours + durationHours <= preferences.dailyHourLimit) {
        return currentDate;
      }
    }
    currentDate = addDays(currentDate, -1);
  }

  // 2. If capacity was tight, try to find ANY allowed day searching FORWARDS from targetDateStr up to the day before the due date.
  currentDate = targetDateStr;
  const dayBeforeDue = addDays(dueDateStr, -1);
  // Guard: if due date is today, we have to do it today
  const endLimit = daysBetween(todayStr, dayBeforeDue) < 0 ? dueDateStr : dayBeforeDue;

  while (daysBetween(currentDate, endLimit) >= 0) {
    if (isWorkDayAllowed(currentDate)) {
      const scheduledHours = dailyHoursMap[currentDate] || 0;
      if (scheduledHours + durationHours <= preferences.dailyHourLimit) {
        return currentDate;
      }
    }
    currentDate = addDays(currentDate, 1);
  }

  // 3. If still not found (all days are at capacity), find the allowed work day with the least hours
  // between today and the due date, even if it exceeds the limit.
  let bestDate = todayStr;
  let minHours = Infinity;
  currentDate = todayStr;

  while (daysBetween(currentDate, dueDateStr) >= 0) {
    if (isWorkDayAllowed(currentDate)) {
      const hours = dailyHoursMap[currentDate] || 0;
      if (hours < minHours) {
        minHours = hours;
        bestDate = currentDate;
      }
    }
    currentDate = addDays(currentDate, 1);
  }

  // Fallback: If no work days are allowed in the entire range (unlikely configuration),
  // just schedule it on the day before due date, or today.
  if (minHours === Infinity) {
    return daysBetween(todayStr, dayBeforeDue) >= 0 ? dayBeforeDue : todayStr;
  }

  return bestDate;
}
