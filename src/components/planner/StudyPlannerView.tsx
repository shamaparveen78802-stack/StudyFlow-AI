import React, { useState } from 'react';
import { 
  CalendarRange, 
  Sparkles, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Trash2, 
  RotateCcw, 
  Sun, 
  Moon, 
  Sunset, 
  Compass,
  Check,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyPlanConfig, StudyScheduleItem } from '../../types';
import { EmptyState } from '../common/EmptyState';

export const StudyPlannerView: React.FC = () => {
  const { 
    schedule, 
    isGeneratingSchedule, 
    generateSchedule, 
    toggleScheduleItem, 
    deleteScheduleItem, 
    clearSchedule, 
    subjects 
  } = useApp();

  // Generator Form State
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => 
    subjects.slice(0, 3).map(s => s.name)
  );
  const [examOrGoal, setExamOrGoal] = useState('Upcoming Midterms & Finals');
  const [targetDays, setTargetDays] = useState(5);
  const [dailyHours, setDailyHours] = useState(4);
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening' | 'flexible'>('morning');
  const [includeBreaks, setIncludeBreaks] = useState(true);

  const toggleSubjectSelect = (subName: string) => {
    if (selectedSubjects.includes(subName)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subName));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subName]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const config: StudyPlanConfig = {
      subjects: selectedSubjects,
      examOrGoal: examOrGoal.trim() || 'General Coursework',
      targetDays,
      dailyStudyHours: dailyHours,
      preferredTimeOfDay: preferredTime,
      includeBreaks,
    };
    await generateSchedule(config);
  };

  // Group schedule items by day
  const daysGrouped = React.useMemo(() => {
    const map = new Map<string, StudyScheduleItem[]>();
    schedule.forEach(item => {
      const key = item.day;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries());
  }, [schedule]);

  const completedCount = schedule.filter(s => s.completed).length;
  const totalCount = schedule.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              AI Study Planner
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Offline Generator
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate balanced, cognitive-load-optimized daily study schedules automatically.
          </p>
        </div>

        {schedule.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearSchedule}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Schedule</span>
            </button>
          </div>
        )}
      </div>

      {/* Planner Configuration Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Timetable Generator Parameters
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">100% Local Intelligence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Target Goal / Exam */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Exam or Focus Goal
              </label>
              <input
                type="text"
                value={examOrGoal}
                onChange={e => setExamOrGoal(e.target.value)}
                placeholder="e.g., Calculus Midterm + CS Final"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Daily Hours */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Available Daily Study Hours ({dailyHours} hrs)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={dailyHours}
                onChange={e => setDailyHours(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-3"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1h (Light)</span>
                <span>4h (Balanced)</span>
                <span>10h (Intense)</span>
              </div>
            </div>

            {/* Target Duration */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Planning Horizon
              </label>
              <select
                value={targetDays}
                onChange={e => setTargetDays(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>3 Days (Sprint Prep)</option>
                <option value={5}>5 Days (Standard Week)</option>
                <option value={7}>7 Days (Full Week)</option>
              </select>
            </div>
          </div>

          {/* Preferred Time of Day */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Peak Energy & Focus Window
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'morning', label: 'Morning (9am - 12pm)', icon: Sun },
                { id: 'afternoon', label: 'Afternoon (1pm - 5pm)', icon: Sunset },
                { id: 'evening', label: 'Evening (6pm - 10pm)', icon: Moon },
                { id: 'flexible', label: 'Flexible / Mixed', icon: Compass },
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = preferredTime === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPreferredTime(opt.id as any)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                        : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-indigo-500" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Inclusion Chips */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Subjects to Include in Schedule
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => {
                const isSelected = selectedSubjects.includes(s.name);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubjectSelect(s.name)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Generator Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-generate-schedule"
              disabled={isGeneratingSchedule}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-60 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              {isGeneratingSchedule ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Optimal Timetable...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Study Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Schedule Output Display */}
      {schedule.length > 0 ? (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <CalendarRange className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Active Study Plan Progress
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {completedCount} of {totalCount} sessions completed ({progressPercent}%)
                </p>
              </div>
            </div>

            <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Daily Schedule Blocks */}
          <div className="space-y-6">
            {daysGrouped.map(([dayName, items]) => {
              const dayCompleted = items.every(i => i.completed);

              return (
                <div
                  key={dayName}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden"
                >
                  {/* Day Header */}
                  <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base text-slate-900 dark:text-slate-100">{dayName}</span>
                      {items[0]?.date && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {items[0].date}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      dayCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200/70 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {items.filter(i => i.completed).length}/{items.length} Completed
                    </span>
                  </div>

                  {/* Items for this day */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map(item => {
                      const typeBadge = {
                        deep_work: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
                        practice: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
                        revision: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
                        reading: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
                        break: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
                      }[item.taskType] || 'bg-slate-100 text-slate-600';

                      return (
                        <div
                          key={item.id}
                          className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                            item.completed ? 'bg-slate-50/40 dark:bg-slate-900/30 opacity-75' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => toggleScheduleItem(item.id)}
                              aria-label={item.completed ? 'Mark uncompleted' : 'Mark completed'}
                              className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                                item.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                {/* Time window */}
                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {item.startTime} - {item.endTime}
                                </span>

                                {/* Subject */}
                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                  {item.subject}
                                </span>

                                {/* Type */}
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${typeBadge}`}>
                                  {item.taskType.replace('_', ' ')}
                                </span>
                              </div>

                              <h4 className={`text-sm font-semibold ${
                                item.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                              }`}>
                                {item.topic}
                              </h4>

                              {item.notes && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteScheduleItem(item.id)}
                            title="Remove session"
                            aria-label="Remove session"
                            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={CalendarRange}
          title="No study schedule generated yet"
          description="Use the parameters above to configure your subjects, available hours, and target goals. The offline AI engine will calculate your optimized timetable!"
          actionLabel="Generate Schedule Now"
          onAction={() => generateSchedule({
            subjects: selectedSubjects,
            examOrGoal: examOrGoal || 'General Study',
            targetDays,
            dailyStudyHours: dailyHours,
            preferredTimeOfDay: preferredTime,
            includeBreaks,
          })}
        />
      )}
    </div>
  );
};
