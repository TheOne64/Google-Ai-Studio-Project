export type AuthProvider = 'google' | 'microsoft' | 'apple' | 'email' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: AuthProvider;
  institution?: string;
  role?: string;
  joinedAt: string;
}

export interface RegisteredAccount {
  user: User;
  password?: string;
  twoFactorEnabled?: boolean;
  registeredAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  durationHours: number;
  dateScheduled: string; // YYYY-MM-DD
  completed: boolean;
  daysBeforeDue?: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  description: string;
  weight: string; // e.g. "10%"
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  milestones: Milestone[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind color class, e.g., 'border-blue-500 text-blue-500'
  assignments: Assignment[];
}

export interface SchedulePreferences {
  intensity: 'casual' | 'balanced' | 'intense'; // casual = more days spread out, balanced = average, intense = shorter timeline
  workDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  dailyHourLimit: number;
}

export interface StudySchedule {
  id: string;
  userId: string;
  title: string;
  term: string; // e.g. "Fall 2026", "Spring 2027", "Summer Term", "Self-Paced"
  description?: string;
  color: string;
  icon?: string;
  courses: Course[];
  preferences: SchedulePreferences;
  createdAt: string;
  updatedAt: string;
}
