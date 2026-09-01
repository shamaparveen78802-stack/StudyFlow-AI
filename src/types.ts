export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // ISO string or YYYY-MM-DD
  dueTime?: string;
  estimatedMinutes?: number;
  completedAt?: string;
  createdAt: string;
  notes?: string;
  tags?: string[];
}

export interface SubjectInfo {
  id: string;
  name: string;
  color: string; // Tailwind color or hex
  icon?: string;
}

export interface StudyScheduleItem {
  id: string;
  day: string; // e.g. "Monday", "Tuesday", etc. or Date
  date?: string;
  startTime: string;
  endTime: string;
  subject: string;
  topic: string;
  taskType: 'deep_work' | 'revision' | 'practice' | 'reading' | 'break';
  completed: boolean;
  notes?: string;
}

export interface StudyPlanConfig {
  subjects: string[];
  examOrGoal: string;
  targetDays: number;
  dailyStudyHours: number;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
  includeBreaks: boolean;
  priorityFocusSubject?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  category?: 'math' | 'science' | 'writing' | 'study_skill' | 'general';
}

export interface AssignmentStep {
  id: string;
  title: string;
  phase: 'Research & Planning' | 'Drafting & Execution' | 'Review & Refinement' | 'Final Submission';
  estimatedHours: number;
  suggestedDeadline: string;
  completed: boolean;
  details?: string;
}

export interface AssignmentProject {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'major_project';
  description?: string;
  steps: AssignmentStep[];
  createdAt: string;
}

export type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  customMinutes: number;
  soundEnabled: boolean;
  ambientSound: 'none' | 'white_noise' | 'brown_noise' | 'rain_tones';
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface FocusSessionLog {
  id: string;
  timestamp: string;
  durationMinutes: number;
  subject?: string;
  mode: TimerMode;
}

export interface ActivityLog {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_deleted' | 'schedule_generated' | 'assignment_breakdown' | 'focus_completed' | 'data_reset';
  message: string;
  timestamp: string;
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  userName: string;
  enableSounds: boolean;
}

export type NavTab = 'dashboard' | 'tasks' | 'planner' | 'tutor' | 'timer' | 'breakdown' | 'settings';

