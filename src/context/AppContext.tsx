import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Task, 
  StudyScheduleItem, 
  StudyPlanConfig, 
  ChatMessage, 
  AssignmentProject, 
  AssignmentStep, 
  TimerMode, 
  TimerSettings, 
  FocusSessionLog, 
  ActivityLog, 
  AppPreferences, 
  SubjectInfo, 
  Priority 
} from '../types';
import { 
  INITIAL_TASKS, 
  INITIAL_SCHEDULE, 
  INITIAL_ASSIGNMENT_PROJECT, 
  INITIAL_LOGS, 
  INITIAL_PREFERENCES, 
  INITIAL_FOCUS_LOGS, 
  DEFAULT_SUBJECTS 
} from '../constants/initialData';
import { INITIAL_CHAT_MESSAGES, queryLocalAITutor } from '../constants/tutorKnowledge';
import { loadFromStorage, saveToStorage, clearAllAppData } from '../utils/storage';
import { sound } from '../utils/sound';
import { fireCelebration } from '../utils/confetti';
import { useToast } from './ToastContext';

interface AppContextValue {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  editTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Study Schedule
  schedule: StudyScheduleItem[];
  isGeneratingSchedule: boolean;
  generateSchedule: (config: StudyPlanConfig) => Promise<void>;
  toggleScheduleItem: (id: string) => void;
  deleteScheduleItem: (id: string) => void;
  clearSchedule: () => void;

  // AI Tutor
  chatMessages: ChatMessage[];
  isTutorTyping: boolean;
  sendTutorMessage: (userText: string) => Promise<void>;
  clearChatHistory: () => void;

  // Pomodoro Focus Timer
  timerMode: TimerMode;
  timeLeft: number;
  isTimerRunning: boolean;
  completedPomodoros: number;
  timerSettings: TimerSettings;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchTimerMode: (mode: TimerMode) => void;
  updateTimerSettings: (newSettings: Partial<TimerSettings>) => void;
  focusLogs: FocusSessionLog[];

  // Assignment Breakdown
  assignments: AssignmentProject[];
  isGeneratingBreakdown: boolean;
  createAssignmentBreakdown: (projectData: { title: string; subject: string; dueDate: string; complexity: AssignmentProject['complexity']; description?: string }) => Promise<void>;
  toggleAssignmentStep: (projectId: string, stepId: string) => void;
  deleteAssignmentProject: (id: string) => void;
  exportStepsToTasks: (projectId: string) => void;

  // Subjects & Activity
  subjects: SubjectInfo[];
  activityLogs: ActivityLog[];

  // Preferences & System
  preferences: AppPreferences;
  updatePreferences: (updates: Partial<AppPreferences>) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;

  // Computed Metrics
  metrics: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    highPriorityTasks: number;
    todayTasksCount: number;
    studyProgressPercent: number;
    totalFocusMinutes: number;
    upcomingDeadlinesCount: number;
  };
}

const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  customMinutes: 30,
  soundEnabled: true,
  ambientSound: 'none',
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data loaded from safe LocalStorage
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage<Task[]>('tasks', INITIAL_TASKS));
  const [schedule, setSchedule] = useState<StudyScheduleItem[]>(() => loadFromStorage<StudyScheduleItem[]>('schedule', INITIAL_SCHEDULE));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadFromStorage<ChatMessage[]>('chat_messages', INITIAL_CHAT_MESSAGES));
  const [assignments, setAssignments] = useState<AssignmentProject[]>(() => loadFromStorage<AssignmentProject[]>('assignments', [INITIAL_ASSIGNMENT_PROJECT]));
  const [focusLogs, setFocusLogs] = useState<FocusSessionLog[]>(() => loadFromStorage<FocusSessionLog[]>('focus_logs', INITIAL_FOCUS_LOGS));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadFromStorage<ActivityLog[]>('activity_logs', INITIAL_LOGS));
  const [subjects] = useState<SubjectInfo[]>(() => loadFromStorage<SubjectInfo[]>('subjects', DEFAULT_SUBJECTS));
  const [preferences, setPreferences] = useState<AppPreferences>(() => loadFromStorage<AppPreferences>('preferences', INITIAL_PREFERENCES));
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => loadFromStorage<TimerSettings>('timer_settings', DEFAULT_TIMER_SETTINGS));

  // Async Loading States
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState<boolean>(false);
  const [isTutorTyping, setIsTutorTyping] = useState<boolean>(false);
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState<boolean>(false);

  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(() => timerSettings.pomodoroMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(() => loadFromStorage<number>('completed_pomodoros', 3));

  // Persist Data automatically on change
  useEffect(() => { saveToStorage('tasks', tasks); }, [tasks]);
  useEffect(() => { saveToStorage('schedule', schedule); }, [schedule]);
  useEffect(() => { saveToStorage('chat_messages', chatMessages); }, [chatMessages]);
  useEffect(() => { saveToStorage('assignments', assignments); }, [assignments]);
  useEffect(() => { saveToStorage('focus_logs', focusLogs); }, [focusLogs]);
  useEffect(() => { saveToStorage('activity_logs', activityLogs); }, [activityLogs]);
  useEffect(() => { saveToStorage('preferences', preferences); }, [preferences]);
  useEffect(() => { saveToStorage('timer_settings', timerSettings); }, [timerSettings]);
  useEffect(() => { saveToStorage('completed_pomodoros', completedPomodoros); }, [completedPomodoros]);

  // Sync Theme with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [preferences.theme]);

  // Activity Logger Helper
  const logActivity = useCallback((type: ActivityLog['type'], message: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50
  }, []);

  // ==========================================
  // TASK MANAGEMENT
  // ==========================================
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    logActivity('task_created', `Added task: "${newTask.title}"`);
    toast.success(`Task "${newTask.title}" created successfully!`, 'Task Added');
  }, [logActivity, toast]);

  const editTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    toast.info('Task updated successfully.', 'Task Saved');
  }, [toast]);

  const deleteTask = useCallback((id: string) => {
    const target = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (target) {
      logActivity('task_deleted', `Deleted task: "${target.title}"`);
      toast.info(`Task "${target.title}" removed.`, 'Task Deleted');
    }
  }, [tasks, logActivity, toast]);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        const isNowCompleted = nextStatus === 'completed';
        
        if (isNowCompleted) {
          if (preferences.enableSounds) sound.playTick();
          fireCelebration();
          logActivity('task_completed', `Completed task: "${t.title}"`);
          toast.success(`Completed "${t.title}"! Great job!`, 'Task Completed');
        } else {
          toast.info(`Marked "${t.title}" as pending.`, 'Task Updated');
        }

        return {
          ...t,
          status: nextStatus,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    }));
  }, [preferences.enableSounds, logActivity, toast]);

  // ==========================================
  // STUDY SCHEDULE GENERATOR (Offline Smart)
  // ==========================================
  const generateSchedule = useCallback(async (config: StudyPlanConfig) => {
    setIsGeneratingSchedule(true);
    
    // Simulate smart algorithmic processing
    await new Promise(res => setTimeout(res, 900));

    try {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, Math.min(config.targetDays, 7));
      const generatedItems: StudyScheduleItem[] = [];

      const startHours = config.preferredTimeOfDay === 'morning' ? [9, 11, 14] 
        : config.preferredTimeOfDay === 'afternoon' ? [13, 15, 17]
        : config.preferredTimeOfDay === 'evening' ? [17, 19, 21]
        : [10, 14, 18];

      const topicTemplates: Record<string, string[]> = {
        'Calculus & Linear Algebra': ['Limits & Continuity Proofs', 'Derivatives Problem Set', 'Matrix Eigenvalues & Eigenvectors', 'Integration Techniques'],
        'Computer Science': ['Data Structures & Tree Traversal', 'Dynamic Programming Challenges', 'Algorithm Time Complexity', 'System Design Fundamentals'],
        'Physics & Mechanics': ['Kinematics & Projectile Motion', 'Torque & Rotational Inertia', 'Energy Conservation Problems', 'Thermodynamics Review'],
        'Literature & Composition': ['Thesis Formulation & Research', 'Drafting Argumentative Essays', 'Textual Analysis & Quotes', 'Peer Review & Proofreading'],
        'Microeconomics': ['Supply & Elasticity Formulas', 'Monopoly vs Perfect Competition', 'Game Theory Payoff Matrices', 'Fiscal Policy Impacts'],
        'Molecular Biology': ['Cellular Respiration Pathways', 'DNA Replication & Polymerase', 'Genetics & Punnett Squares', 'Enzyme Kinetics'],
      };

      let itemCounter = 1;
      const today = new Date();

      days.forEach((dayName, dayIndex) => {
        const itemDate = new Date(today);
        itemDate.setDate(today.getDate() + dayIndex);
        const dateStr = itemDate.toISOString().split('T')[0];

        // Pick 2-3 subject blocks per day depending on daily hours
        const blocksPerDay = Math.max(1, Math.min(4, Math.round(config.dailyStudyHours / 1.5)));

        for (let b = 0; b < blocksPerDay; b++) {
          const subject = config.subjects[b % config.subjects.length] || 'Calculus & Linear Algebra';
          const topics = topicTemplates[subject] || ['Concept Review & Flashcards', 'Practice Problems', 'Deep Work & Summary Notes'];
          const topic = topics[(dayIndex + b) % topics.length];
          const taskType: StudyScheduleItem['taskType'] = b === 0 ? 'deep_work' : (b === 1 ? 'practice' : 'revision');

          const hour = startHours[b % startHours.length] || (9 + b * 2);
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:30`;

          generatedItems.push({
            id: `sched-gen-${Date.now()}-${itemCounter++}`,
            day: dayName,
            date: dateStr,
            startTime,
            endTime,
            subject,
            topic: `${topic} (${config.examOrGoal || 'Core Syllabus'})`,
            taskType,
            completed: false,
            notes: `Focus on active recall & key textbook questions.`,
          });
        }
      });

      setSchedule(generatedItems);
      logActivity('schedule_generated', `AI Study Planner generated a ${days.length}-day schedule (${generatedItems.length} blocks) for "${config.examOrGoal || 'General Study'}".`);
      toast.success(`Generated ${generatedItems.length} personalized study sessions!`, 'Schedule Ready');
    } catch (err) {
      toast.error('Could not generate schedule. Please try again.', 'Generation Failed');
    } finally {
      setIsGeneratingSchedule(false);
    }
  }, [logActivity, toast]);

  const toggleScheduleItem = useCallback((id: string) => {
    setSchedule(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState) {
          if (preferences.enableSounds) sound.playTick();
          toast.success(`Marked "${item.topic}" as completed!`, 'Session Done');
        }
        return { ...item, completed: nextState };
      }
      return item;
    }));
  }, [preferences.enableSounds, toast]);

  const deleteScheduleItem = useCallback((id: string) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
    toast.info('Schedule item removed.', 'Item Removed');
  }, [toast]);

  const clearSchedule = useCallback(() => {
    setSchedule([]);
    toast.info('Study schedule cleared.', 'Schedule Cleared');
  }, [toast]);

  // ==========================================
  // AI TUTOR (Offline / Local Knowledge Base)
  // ==========================================
  const sendTutorMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsTutorTyping(true);

    // Natural simulated typing latency (1000ms = 1 sec)
    await new Promise(res => setTimeout(res, 1000));

    const result = queryLocalAITutor(userText);

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      sender: 'assistant',
      text: result.response,
      timestamp: new Date().toISOString(),
      suggestedQuestions: result.suggestedQuestions,
      category: result.category,
    };

    setChatMessages(prev => [...prev, assistantMsg]);
    setIsTutorTyping(false);
  }, []);

  const clearChatHistory = useCallback(() => {
    setChatMessages(INITIAL_CHAT_MESSAGES);
    toast.info('AI Tutor chat history reset.', 'Chat Cleared');
  }, [toast]);

  // ==========================================
  // POMODORO TIMER ENGINE
  // ==========================================
  const getDurationForMode = useCallback((mode: TimerMode, settings: TimerSettings): number => {
    switch (mode) {
      case 'pomodoro': return settings.pomodoroMinutes * 60;
      case 'short_break': return settings.shortBreakMinutes * 60;
      case 'long_break': return settings.longBreakMinutes * 60;
      case 'custom': return settings.customMinutes * 60;
      default: return 25 * 60;
    }
  }, []);

  const switchTimerMode = useCallback((mode: TimerMode) => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setTimeLeft(getDurationForMode(mode, timerSettings));
    sound.stopAmbient();
    toast.info(`Switched to ${mode.replace('_', ' ').toUpperCase()}`, 'Timer Mode');
  }, [timerSettings, getDurationForMode, toast]);

  const startTimer = useCallback(() => {
    if (preferences.enableSounds) sound.playStartTone();
    if (timerSettings.ambientSound !== 'none') {
      sound.startAmbient(timerSettings.ambientSound as any);
    }
    setIsTimerRunning(true);
    toast.info('Focus timer running.', 'Timer Started');
  }, [preferences.enableSounds, timerSettings.ambientSound, toast]);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
    sound.stopAmbient();
    toast.info('Timer paused.', 'Timer Paused');
  }, [toast]);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    sound.stopAmbient();
    setTimeLeft(getDurationForMode(timerMode, timerSettings));
    toast.info('Timer reset.', 'Timer Reset');
  }, [timerMode, timerSettings, getDurationForMode, toast]);

  const updateTimerSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setTimerSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (!isTimerRunning) {
        setTimeLeft(getDurationForMode(timerMode, updated));
      }
      return updated;
    });
    toast.success('Timer settings updated.', 'Settings Saved');
  }, [isTimerRunning, timerMode, getDurationForMode, toast]);

  // Timer interval ref & target end time ref for background tab precision
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);

  // Timer Tick Interval
  useEffect(() => {
    if (isTimerRunning) {
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const remaining = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));

        if (remaining <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          targetEndTimeRef.current = null;
          setIsTimerRunning(false);
          setTimeLeft(0);
          sound.stopAmbient();

          if (preferences.enableSounds) {
            sound.playChime();
          }

          if (timerMode === 'pomodoro') {
            fireCelebration();
            setCompletedPomodoros(c => c + 1);
            const durationMin = timerSettings.pomodoroMinutes;
            const newFocusLog: FocusSessionLog = {
              id: `focus-${Date.now()}`,
              timestamp: new Date().toISOString(),
              durationMinutes: durationMin,
              mode: 'pomodoro',
            };
            setFocusLogs(logs => [newFocusLog, ...logs]);
            logActivity('focus_completed', `Finished ${durationMin}-minute Pomodoro session!`);
            toast.success(`Pomodoro completed! Take a well-deserved break.`, 'Session Finished 🎉');

            if (timerSettings.autoStartBreaks) {
              switchTimerMode('short_break');
              startTimer();
            }
          } else {
            toast.info(`Break time is over! Ready to get back into focus?`, 'Break Complete');
            if (timerSettings.autoStartPomodoros) {
              switchTimerMode('pomodoro');
              startTimer();
            }
          }
        } else {
          setTimeLeft(remaining);
        }
      }, 500);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      targetEndTimeRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [
    isTimerRunning,
    timerMode,
    timerSettings,
    preferences.enableSounds,
    logActivity,
    toast,
    switchTimerMode,
    startTimer
  ]);

  // Update Document Title with Timer status
  useEffect(() => {
    if (isTimerRunning) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const modeLabel = timerMode === 'pomodoro' ? 'Focus' : 'Break';
      document.title = `(${formatted}) ${modeLabel} - StudyPulse`;
    } else {
      document.title = 'StudyPulse - Your Study Companion';
    }
  }, [isTimerRunning, timeLeft, timerMode]);

  // ==========================================
  // ASSIGNMENT BREAKDOWN ENGINE (Offline Smart)
  // ==========================================
  const createAssignmentBreakdown = useCallback(async (projectData: {
    title: string;
    subject: string;
    dueDate: string;
    complexity: AssignmentProject['complexity'];
    description?: string;
  }) => {
    setIsGeneratingBreakdown(true);
    await new Promise(res => setTimeout(res, 800));

    try {
      const targetDate = new Date(projectData.dueDate.includes('T') ? projectData.dueDate : `${projectData.dueDate}T00:00:00`);
      const now = new Date();
      const totalDays = Math.max(2, Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      const getDateOffset = (fraction: number) => {
        const d = new Date(now);
        d.setDate(now.getDate() + Math.max(1, Math.round(totalDays * fraction)));
        return d.toISOString().split('T')[0];
      };

      const steps: AssignmentStep[] = [
        {
          id: `step-${Date.now()}-1`,
          title: `Define Scope & Core Objectives for ${projectData.title}`,
          phase: 'Research & Planning',
          estimatedHours: 2,
          suggestedDeadline: getDateOffset(0.2),
          completed: false,
          details: 'Clarify project rubric, expected deliverables, and core methodology.',
        },
        {
          id: `step-${Date.now()}-2`,
          title: 'Literature Review & Source Gathering',
          phase: 'Research & Planning',
          estimatedHours: 4,
          suggestedDeadline: getDateOffset(0.35),
          completed: false,
          details: 'Gather primary data, textbook sections, academic papers, and benchmark examples.',
        },
        {
          id: `step-${Date.now()}-3`,
          title: 'Draft Structural Outline & Key Arguments',
          phase: 'Research & Planning',
          estimatedHours: 2.5,
          suggestedDeadline: getDateOffset(0.5),
          completed: false,
          details: 'Organize logical sequence of sections, headings, formulas, or code architecture.',
        },
        {
          id: `step-${Date.now()}-4`,
          title: 'Execute Primary Draft / Core Deliverables',
          phase: 'Drafting & Execution',
          estimatedHours: projectData.complexity === 'major_project' ? 8 : (projectData.complexity === 'complex' ? 5 : 3),
          suggestedDeadline: getDateOffset(0.7),
          completed: false,
          details: 'Write the primary body text, build components, or solve core calculations.',
        },
        {
          id: `step-${Date.now()}-5`,
          title: 'Self-Review, Proofreading & Refinement',
          phase: 'Review & Refinement',
          estimatedHours: 3,
          suggestedDeadline: getDateOffset(0.85),
          completed: false,
          details: 'Check for clarity, citation compliance (APA/MLA/IEEE), and formatting.',
        },
        {
          id: `step-${Date.now()}-6`,
          title: 'Final Export, Submission & Checklist Verification',
          phase: 'Final Submission',
          estimatedHours: 1,
          suggestedDeadline: projectData.dueDate,
          completed: false,
          details: 'Verify upload format (PDF/Zip), submission confirmation, and rubric alignment.',
        },
      ];

      const newProject: AssignmentProject = {
        id: `proj-${Date.now()}`,
        ...projectData,
        steps,
        createdAt: new Date().toISOString(),
      };

      setAssignments(prev => [newProject, ...prev]);
      logActivity('assignment_breakdown', `Decomposed "${projectData.title}" into ${steps.length} actionable milestones.`);
      toast.success(`Generated ${steps.length} roadmap steps for "${projectData.title}"!`, 'Breakdown Ready');
    } catch {
      toast.error('Failed to create assignment breakdown.', 'Error');
    } finally {
      setIsGeneratingBreakdown(false);
    }
  }, [logActivity, toast]);

  const toggleAssignmentStep = useCallback((projectId: string, stepId: string) => {
    setAssignments(prev => prev.map(proj => {
      if (proj.id === projectId) {
        const updatedSteps = proj.steps.map(step => {
          if (step.id === stepId) {
            const nextCompleted = !step.completed;
            if (nextCompleted) {
              if (preferences.enableSounds) sound.playTick();
              toast.success(`Completed step: "${step.title}"`, 'Step Completed');
            }
            return { ...step, completed: nextCompleted };
          }
          return step;
        });
        return { ...proj, steps: updatedSteps };
      }
      return proj;
    }));
  }, [preferences.enableSounds, toast]);

  const deleteAssignmentProject = useCallback((id: string) => {
    setAssignments(prev => prev.filter(p => p.id !== id));
    toast.info('Assignment project deleted.', 'Project Removed');
  }, [toast]);

  const exportStepsToTasks = useCallback((projectId: string) => {
    const project = assignments.find(p => p.id === projectId);
    if (!project) return;

    const uncompletedSteps = project.steps.filter(s => !s.completed);
    if (uncompletedSteps.length === 0) {
      toast.info('All steps in this assignment are already completed!', 'No Tasks to Export');
      return;
    }

    const newTasks: Task[] = uncompletedSteps.map((s, idx) => ({
      id: `task-from-proj-${Date.now()}-${idx}`,
      title: `[${project.title.substring(0, 20)}...] ${s.title}`,
      subject: project.subject,
      priority: idx < 2 ? 'high' : 'medium' as Priority,
      status: 'pending',
      dueDate: s.suggestedDeadline,
      estimatedMinutes: s.estimatedHours * 60,
      createdAt: new Date().toISOString(),
      notes: `${s.phase}: ${s.details || ''}`,
      tags: ['Project Step', project.subject],
    }));

    setTasks(prev => [...newTasks, ...prev]);
    toast.success(`Exported ${newTasks.length} steps to your Task Manager!`, 'Exported to Tasks');
  }, [assignments, toast]);

  // ==========================================
  // PREFERENCES & RESET DATA
  // ==========================================
  const updatePreferences = useCallback((updates: Partial<AppPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
    toast.success('Preferences saved.', 'Preferences');
  }, [toast]);

  const resetToDemoData = useCallback(() => {
    setTasks(INITIAL_TASKS);
    setSchedule(INITIAL_SCHEDULE);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setAssignments([INITIAL_ASSIGNMENT_PROJECT]);
    setFocusLogs(INITIAL_FOCUS_LOGS);
    setActivityLogs(INITIAL_LOGS);
    setCompletedPomodoros(3);
    setTimerSettings(DEFAULT_TIMER_SETTINGS);
    setPreferences(INITIAL_PREFERENCES);
    setTimeLeft(25 * 60);
    setIsTimerRunning(false);
    sound.stopAmbient();

    logActivity('data_reset', 'Reset all application data to realistic demo state.');
    toast.success('All data has been reset to default demo content.', 'Data Reset Complete');
  }, [logActivity, toast]);

  const clearAllData = useCallback(() => {
    clearAllAppData();
    setTasks([]);
    setSchedule([]);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setAssignments([]);
    setFocusLogs([]);
    setActivityLogs([]);
    setCompletedPomodoros(0);
    setTimeLeft(25 * 60);
    setIsTimerRunning(false);
    sound.stopAmbient();

    toast.info('All local data cleared. You have a fresh clean slate.', 'Data Cleared');
  }, [toast]);

  // ==========================================
  // LIVE COMPUTED METRICS
  // ==========================================
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const highPriorityTasks = tasks.filter(t => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'completed').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasksCount = tasks.filter(t => t.dueDate === todayStr && t.status !== 'completed').length;

    const studyProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalFocusMinutes = focusLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const upcomingDeadlinesCount = tasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false;
      const d = new Date(t.dueDate.includes('T') ? t.dueDate : `${t.dueDate}T00:00:00`);
      const now = new Date();
      const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
      todayTasksCount,
      studyProgressPercent,
      totalFocusMinutes,
      upcomingDeadlinesCount,
    };
  }, [tasks, focusLogs]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tasks,
        addTask,
        editTask,
        deleteTask,
        toggleTaskComplete,
        schedule,
        isGeneratingSchedule,
        generateSchedule,
        toggleScheduleItem,
        deleteScheduleItem,
        clearSchedule,
        chatMessages,
        isTutorTyping,
        sendTutorMessage,
        clearChatHistory,
        timerMode,
        timeLeft,
        isTimerRunning,
        completedPomodoros,
        timerSettings,
        startTimer,
        pauseTimer,
        resetTimer,
        switchTimerMode,
        updateTimerSettings,
        focusLogs,
        assignments,
        isGeneratingBreakdown,
        createAssignmentBreakdown,
        toggleAssignmentStep,
        deleteAssignmentProject,
        exportStepsToTasks,
        subjects,
        activityLogs,
        preferences,
        updatePreferences,
        resetToDemoData,
        clearAllData,
        metrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
