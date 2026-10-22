import { User, StudySchedule, SchedulePreferences, Course, RegisteredAccount, AuthProvider } from '../types';
import { generateSmartSchedule, getSystemTodayString } from './scheduleGenerator';

const BASELINE_TODAY = getSystemTodayString();

export const DEFAULT_PREFERENCES: SchedulePreferences = {
  intensity: 'balanced',
  workDays: [1, 2, 3, 4, 5], // Monday - Friday
  dailyHourLimit: 3
};

// Preset demo user accounts for rapid testing & realistic authentication
export const DEMO_USERS: User[] = [
  {
    id: 'user-google-demi',
    name: 'Demi Thompson',
    email: 'thompsondemi686@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
    provider: 'google',
    institution: 'UC Berkeley',
    role: 'Cognitive Science & CS',
    joinedAt: '2026-01-15'
  },
  {
    id: 'user-ms-alex',
    name: 'Alex Johnson',
    email: 'alex.johnson@student.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&h=160&q=80',
    provider: 'microsoft',
    institution: 'University of Washington',
    role: 'Computer Science Major',
    joinedAt: '2026-02-10'
  },
  {
    id: 'user-apple-jordan',
    name: 'Jordan Vance',
    email: 'jordan.vance@icloud.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&h=160&q=80',
    provider: 'apple',
    institution: 'Columbia University',
    role: 'Pre-Med & Biology',
    joinedAt: '2026-03-01'
  }
];

// Sample course templates for new schedule creation
export const SCHEDULE_TEMPLATES: Record<string, { title: string; desc: string; icon: string; courses: Course[] }> = {
  blank: {
    title: 'Blank Schedule',
    desc: 'Start clean with zero classes. Perfect for uploading your own syllabus PDFs or photos.',
    icon: 'Sparkles',
    courses: []
  },
  stem: {
    title: 'Computer Science & Math',
    desc: 'Pre-loaded with Algorithms & Data Structures and Discrete Math tracks.',
    icon: 'Code',
    courses: [
      {
        id: 'c-cs-1',
        name: 'Algorithms & Data Structures',
        code: 'CS 204',
        color: 'bg-indigo-600 text-white border-2 border-indigo-700 shadow-sm',
        assignments: [
          {
            id: 'a-cs-1',
            courseId: 'c-cs-1',
            courseName: 'Algorithms & Data Structures',
            title: 'Binary Search Trees & Balancing',
            dueDate: '2026-07-14',
            description: 'Implement node rotations and recursive tree traversals.',
            weight: '15%',
            priority: 'high',
            completed: false,
            milestones: [
              {
                id: 'm-cs-1-1',
                title: 'Review tree traversal pseudocode',
                description: 'Read chapter 4 and write notes on BST height limits.',
                durationHours: 1.5,
                daysBeforeDue: 5,
                completed: false,
                dateScheduled: '2026-07-09'
              },
              {
                id: 'm-cs-1-2',
                title: 'Implement tree balancing methods',
                description: 'Write unit tests to verify rotation balance factor calculation.',
                durationHours: 2.5,
                daysBeforeDue: 3,
                completed: false,
                dateScheduled: '2026-07-11'
              },
              {
                id: 'm-cs-1-3',
                title: 'Benchmarking & documentation',
                description: 'Run benchmark timing tests and package repository for upload.',
                durationHours: 1.0,
                daysBeforeDue: 1,
                completed: false,
                dateScheduled: '2026-07-13'
              }
            ]
          }
        ]
      },
      {
        id: 'c-math-1',
        name: 'Discrete Mathematics',
        code: 'MATH 150',
        color: 'bg-blue-600 text-white border-2 border-blue-700 shadow-sm',
        assignments: [
          {
            id: 'a-math-1',
            courseId: 'c-math-1',
            courseName: 'Discrete Mathematics',
            title: 'Combinatorics & Graph Proofs Set',
            dueDate: '2026-07-16',
            description: 'Solve 10 induction proofs and bipartite graph theorems.',
            weight: '10%',
            priority: 'medium',
            completed: false,
            milestones: [
              {
                id: 'm-math-1-1',
                title: 'Draft proof induction steps',
                description: 'Base case and inductive hypothesis verification.',
                durationHours: 2.0,
                daysBeforeDue: 4,
                completed: false,
                dateScheduled: '2026-07-12'
              },
              {
                id: 'm-math-1-2',
                title: 'Final LaTeX formatting',
                description: 'Typeset equations and export PDF for submission.',
                durationHours: 1.0,
                daysBeforeDue: 1,
                completed: false,
                dateScheduled: '2026-07-15'
              }
            ]
          }
        ]
      }
    ]
  },
  premed: {
    title: 'Pre-Med & Natural Sciences',
    desc: 'Pre-loaded with General Chemistry and Human Physiology syllabi.',
    icon: 'FlaskConical',
    courses: [
      {
        id: 'c-chem-1',
        name: 'Organic Chemistry Lab',
        code: 'CHEM 212',
        color: 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-sm',
        assignments: [
          {
            id: 'a-chem-1',
            courseId: 'c-chem-1',
            courseName: 'Organic Chemistry Lab',
            title: 'Distillation & Chromatography Report',
            dueDate: '2026-07-13',
            description: 'Calculate percent yield and interpret NMR spectrum charts.',
            weight: '12%',
            priority: 'high',
            completed: false,
            milestones: [
              {
                id: 'm-chem-1-1',
                title: 'Analyze spectroscopic peaks',
                description: 'Compare retention times and identify functional groups.',
                durationHours: 2.0,
                daysBeforeDue: 4,
                completed: false,
                dateScheduled: '2026-07-09'
              },
              {
                id: 'm-chem-1-2',
                title: 'Draft lab report discussion',
                description: 'Explain experimental sources of error and summarize findings.',
                durationHours: 1.5,
                daysBeforeDue: 1,
                completed: false,
                dateScheduled: '2026-07-12'
              }
            ]
          }
        ]
      }
    ]
  },
  business: {
    title: 'Economics & Humanities',
    desc: 'Pre-loaded with Macroeconomic Analysis and Modern Philosophy essays.',
    icon: 'Briefcase',
    courses: [
      {
        id: 'c-econ-1',
        name: 'Macroeconomic Principles',
        code: 'ECON 102',
        color: 'bg-amber-500 text-white border-2 border-amber-600 shadow-sm',
        assignments: [
          {
            id: 'a-econ-1',
            courseId: 'c-econ-1',
            courseName: 'Macroeconomic Principles',
            title: 'Monetary Policy Policy Brief',
            dueDate: '2026-07-15',
            description: 'Evaluate federal interest rate adjustments and inflation targeting models.',
            weight: '20%',
            priority: 'medium',
            completed: false,
            milestones: [
              {
                id: 'm-econ-1-1',
                title: 'Gather central bank economic indicators',
                description: 'Chart CPI, unemployment, and treasury yields.',
                durationHours: 1.5,
                daysBeforeDue: 4,
                completed: false,
                dateScheduled: '2026-07-11'
              },
              {
                id: 'm-econ-1-2',
                title: 'Write policy recommendation brief',
                description: 'Formulate 3-page executive summary with fiscal outlook.',
                durationHours: 2.0,
                daysBeforeDue: 1,
                completed: false,
                dateScheduled: '2026-07-14'
              }
            ]
          }
        ]
      }
    ]
  }
};

const STORAGE_KEYS = {
  CURRENT_USER: 'syllabus_auth_current_user',
  SCHEDULES_PREFIX: 'syllabus_schedules_user_',
  ACTIVE_SCHEDULE_PREFIX: 'syllabus_active_sched_user_',
  REGISTERED_ACCOUNTS: 'syllabus_registered_accounts_v1'
};

export const INITIAL_REGISTERED_ACCOUNTS: RegisteredAccount[] = [
  {
    user: {
      id: 'user-google-demi',
      name: 'Demi Thompson',
      email: 'thompsondemi686@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
      provider: 'google',
      institution: 'UC Berkeley',
      role: 'Cognitive Science & CS',
      joinedAt: '2026-01-15'
    },
    password: 'Password123!',
    twoFactorEnabled: true,
    registeredAt: '2026-01-15'
  },
  {
    user: {
      id: 'user-ms-alex',
      name: 'Alex Johnson',
      email: 'alex.johnson@student.edu',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&h=160&q=80',
      provider: 'microsoft',
      institution: 'University of Washington',
      role: 'Computer Science Major',
      joinedAt: '2026-02-10'
    },
    password: 'Microsoft123!',
    twoFactorEnabled: true,
    registeredAt: '2026-02-10'
  },
  {
    user: {
      id: 'user-apple-jordan',
      name: 'Jordan Vance',
      email: 'jordan.vance@icloud.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&h=160&q=80',
      provider: 'apple',
      institution: 'Columbia University',
      role: 'Pre-Med & Biology',
      joinedAt: '2026-03-01'
    },
    password: 'Apple123!',
    twoFactorEnabled: true,
    registeredAt: '2026-03-01'
  }
];

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(INITIAL_REGISTERED_ACCOUNTS));
      return INITIAL_REGISTERED_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_REGISTERED_ACCOUNTS;
  } catch {
    return INITIAL_REGISTERED_ACCOUNTS;
  }
}

export function saveRegisteredAccounts(accounts: RegisteredAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save registered accounts', err);
  }
}

export function findRegisteredAccountByEmail(email: string): RegisteredAccount | undefined {
  const cleanEmail = email.toLowerCase().trim();
  const accounts = getRegisteredAccounts();
  return accounts.find((a) => a.user.email.toLowerCase().trim() === cleanEmail);
}

/**
 * Validates email & password for Sign In.
 * Fails if account has not been created yet or if password is wrong.
 */
export function validateEmailLogin(
  email: string,
  passwordAttempt: string
): { success: boolean; user?: User; error?: string; code?: 'NOT_FOUND' | 'WRONG_PASSWORD' } {
  const cleanEmail = email.toLowerCase().trim();
  const account = findRegisteredAccountByEmail(cleanEmail);

  if (!account) {
    return {
      success: false,
      code: 'NOT_FOUND',
      error: `No registered account found with "${email}". Please switch to "Create Account" first to register.`
    };
  }

  // If password was stored for this account, verify it strictly
  if (account.password) {
    if (account.password !== passwordAttempt) {
      return {
        success: false,
        code: 'WRONG_PASSWORD',
        error: 'Incorrect password. Please verify your password and try again.'
      };
    }
  } else if (!passwordAttempt || passwordAttempt.length < 4) {
    return {
      success: false,
      code: 'WRONG_PASSWORD',
      error: 'Please enter a valid password of at least 4 characters.'
    };
  }

  return {
    success: true,
    user: account.user
  };
}

/**
 * Registers a brand new student account in the persistent registry.
 */
export function registerNewAccount(
  name: string,
  email: string,
  password: string,
  institution: string = '',
  provider: AuthProvider = 'email'
): { success: boolean; user?: User; error?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const existing = findRegisteredAccountByEmail(cleanEmail);

  if (existing) {
    return {
      success: false,
      error: `An account with "${email}" has already been created. Please switch to "Sign In" to continue.`
    };
  }

  const cleanName = name.trim() || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const newUser: User = {
    id: `user-${provider}-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    provider,
    institution: institution.trim() || (provider === 'google' ? 'Google Account' : provider === 'microsoft' ? 'Microsoft School Portal' : provider === 'apple' ? 'Apple ID' : 'Independent Learner'),
    role: 'Student',
    joinedAt: new Date().toISOString().split('T')[0]
  };

  const newAccount: RegisteredAccount = {
    user: newUser,
    password: password || undefined,
    twoFactorEnabled: true,
    registeredAt: new Date().toISOString()
  };

  const allAccounts = getRegisteredAccounts();
  const updatedAccounts = [newAccount, ...allAccounts];
  saveRegisteredAccounts(updatedAccounts);

  return {
    success: true,
    user: newUser
  };
}

/**
 * Validates OAuth provider sign-in / registration
 * Sign-in fails if the account hasn't been created yet for that provider/email.
 */
export function validateProviderAuth(
  email: string,
  provider: AuthProvider,
  mode: 'signin' | 'signup',
  name?: string,
  institution?: string
): { success: boolean; user?: User; error?: string; code?: 'NOT_FOUND' | 'ALREADY_EXISTS' } {
  const cleanEmail = email.toLowerCase().trim();
  const existing = findRegisteredAccountByEmail(cleanEmail);

  if (mode === 'signin') {
    if (!existing) {
      return {
        success: false,
        code: 'NOT_FOUND',
        error: `No existing account found with ${provider.toUpperCase()} for "${email}". Please click "Create Account" first to register your profile.`
      };
    }
    return {
      success: true,
      user: existing.user
    };
  } else {
    // mode === 'signup'
    if (existing) {
      return {
        success: false,
        code: 'ALREADY_EXISTS',
        error: `An account already exists for "${email}". Please switch to "Sign In" instead.`
      };
    }
    return registerNewAccount(name || '', cleanEmail, '', institution || '', provider);
  }
}

export function isGuestUser(userOrId: User | string | null | undefined): boolean {
  if (!userOrId) return false;
  if (typeof userOrId === 'string') {
    return userOrId.startsWith('user-guest') || userOrId.includes('guest');
  }
  return userOrId.provider === 'guest' || userOrId.id.startsWith('user-guest');
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    const user = JSON.parse(raw);
    // If it's a guest user left in localStorage, purge it to save storage and RAM
    if (isGuestUser(user)) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    // If guest, do not persist to localStorage so each guest account is independent and does not save
    if (isGuestUser(user)) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getUserSchedules(userId: string): StudySchedule[] {
  // Each guest account is completely independent and guest progress is not saved to save RAM and data
  if (isGuestUser(userId)) {
    return [createInitialScheduleForUser(userId)];
  }

  try {
    const key = `${STORAGE_KEYS.SCHEDULES_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: StudySchedule[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out any old preloaded default template courses (e.g. c-cs-1, c-math-1, c-chem-1, c-econ-1)
        const hasLegacyDefault = parsed.some(s => 
          (s.courses || []).some(c => c.id === 'c-cs-1' || c.id === 'c-math-1' || c.id === 'c-chem-1' || c.id === 'c-econ-1')
        );
        if (hasLegacyDefault) {
          const cleaned = parsed.map(s => ({
            ...s,
            courses: (s.courses || []).filter(c => 
              c.id !== 'c-cs-1' && 
              c.id !== 'c-math-1' && 
              c.id !== 'c-chem-1' && 
              c.id !== 'c-econ-1'
            )
          }));
          saveUserSchedules(userId, cleaned);
          return cleaned;
        }
        return parsed;
      }
    }

    // Default starter schedule with 0 courses and 0 milestones
    const defaultSchedule = createInitialScheduleForUser(userId);
    saveUserSchedules(userId, [defaultSchedule]);
    return [defaultSchedule];
  } catch {
    const defaultSchedule = createInitialScheduleForUser(userId);
    return [defaultSchedule];
  }
}

export function saveUserSchedules(userId: string, schedules: StudySchedule[]): void {
  // As requested: each guest account is independent and guest progress will NOT save to save RAM and data
  if (isGuestUser(userId)) {
    return;
  }

  try {
    const key = `${STORAGE_KEYS.SCHEDULES_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify(schedules));
  } catch (err) {
    console.error('Failed to save schedules to localStorage', err);
  }
}

export function getActiveScheduleId(userId: string, schedules: StudySchedule[]): string {
  if (isGuestUser(userId)) {
    return schedules[0]?.id || '';
  }

  try {
    const key = `${STORAGE_KEYS.ACTIVE_SCHEDULE_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);
    if (stored && schedules.some((s) => s.id === stored)) {
      return stored;
    }
  } catch {
    // fallback
  }
  return schedules[0]?.id || '';
}

export function setActiveScheduleId(userId: string, scheduleId: string): void {
  // As requested: do not persist guest active schedule to save RAM and storage
  if (isGuestUser(userId)) {
    return;
  }

  try {
    const key = `${STORAGE_KEYS.ACTIVE_SCHEDULE_PREFIX}${userId}`;
    localStorage.setItem(key, scheduleId);
  } catch (err) {
    console.error('Failed to set active schedule ID', err);
  }
}

export function createInitialScheduleForUser(userId: string): StudySchedule {
  // Fresh schedule with 0 courses and 0 milestones as requested
  return {
    id: `sched-${Date.now()}-1`,
    userId,
    title: 'Fall 2026 Semester',
    term: 'Fall 2026',
    description: 'Custom academic study roadmap with personal milestones',
    color: 'indigo',
    icon: 'GraduationCap',
    courses: [], // Set to 0 courses and 0 milestones
    preferences: DEFAULT_PREFERENCES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function createNewSchedule(
  userId: string,
  title: string,
  term: string,
  templateKey: string,
  color: string = 'indigo',
  description?: string,
  customPreferences?: SchedulePreferences
): StudySchedule {
  const template = SCHEDULE_TEMPLATES[templateKey] || SCHEDULE_TEMPLATES.blank;
  const prefs = customPreferences || DEFAULT_PREFERENCES;
  const initialCourses = JSON.parse(JSON.stringify(template.courses));
  const scheduledCourses = generateSmartSchedule(initialCourses, prefs, BASELINE_TODAY);

  return {
    id: `sched-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    title: title.trim() || 'My Study Schedule',
    term: term.trim() || 'Current Term',
    description: description?.trim() || `Personal study schedule (${term})`,
    color,
    icon: 'Calendar',
    courses: scheduledCourses,
    preferences: prefs,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
