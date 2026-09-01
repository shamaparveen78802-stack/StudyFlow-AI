import React, { useState } from 'react';
import { 
  ListTree, 
  Sparkles, 
  Plus, 
  Check, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Trash2, 
  RotateCcw, 
  Layers, 
  FileText,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssignmentProject } from '../../types';
import { formatDate } from '../../utils/date';
import { EmptyState } from '../common/EmptyState';

export const AssignmentBreakdownView: React.FC = () => {
  const { 
    assignments, 
    isGeneratingBreakdown, 
    createAssignmentBreakdown, 
    toggleAssignmentStep, 
    deleteAssignmentProject, 
    exportStepsToTasks, 
    subjects 
  } = useApp();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.name || 'Calculus & Linear Algebra');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [complexity, setComplexity] = useState<AssignmentProject['complexity']>('complex');
  const [description, setDescription] = useState('');
  const [activeProjectId, setActiveProjectId] = useState<string>(() => assignments[0]?.id || '');

  // Keep activeProjectId valid
  React.useEffect(() => {
    if (assignments.length > 0 && (!activeProjectId || !assignments.some(a => a.id === activeProjectId))) {
      setActiveProjectId(assignments[0].id);
    }
  }, [assignments, activeProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isGeneratingBreakdown) return;

    await createAssignmentBreakdown({
      title: title.trim(),
      subject,
      dueDate,
      complexity,
      description: description.trim() || undefined,
    });

    setTitle('');
    setDescription('');
  };

  const currentProject = assignments.find(p => p.id === activeProjectId);

  const completedSteps = currentProject ? currentProject.steps.filter(s => s.completed).length : 0;
  const totalSteps = currentProject ? currentProject.steps.length : 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Assignment Breakdown
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Smart Roadmap
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Deconstruct intimidating research papers, labs, and projects into manageable milestones.
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ListTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Deconstruct New Major Assignment
              </h3>
            </div>
            <span className="text-xs text-slate-400">Phase-Based Milestone Decomposition</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Assignment / Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 10-Page Research Paper on Renewable Energy, or OS Kernel Project"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Final Submission Deadline
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Complexity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Scope & Depth
              </label>
              <select
                value={complexity}
                onChange={e => setComplexity(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="simple">Simple (3-4 concise steps)</option>
                <option value="moderate">Moderate (5-6 steps)</option>
                <option value="complex">Complex Paper/Lab (6-8 milestones)</option>
                <option value="major_project">Major Term Project (Full Roadmap)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              id="btn-breakdown-assignment"
              disabled={!title.trim() || isGeneratingBreakdown}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              {isGeneratingBreakdown ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Deconstructing Project Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Actionable Steps</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Projects Tabs / Selector */}
      {assignments.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {assignments.map(p => {
              const isSelected = p.id === activeProjectId;
              const pCompleted = p.steps.filter(s => s.completed).length;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProjectId(p.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="max-w-[180px] truncate">{p.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {pCompleted}/{p.steps.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Project Card */}
          {currentProject && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
              {/* Project Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {currentProject.subject}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Final Due: {formatDate(currentProject.dueDate)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {currentProject.title}
                  </h3>

                  {currentProject.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                      {currentProject.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => exportStepsToTasks(currentProject.id)}
                    title="Add remaining steps to your Task Manager"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Export to Tasks</span>
                  </button>

                  <button
                    onClick={() => deleteAssignmentProject(currentProject.id)}
                    title="Delete project"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Milestone Completion</span>
                  <span>{completedSteps}/{totalSteps} Steps ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {currentProject.steps.map((step, idx) => {
                  const phaseColors = {
                    'Research & Planning': 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
                    'Drafting & Execution': 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
                    'Review & Refinement': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
                    'Final Submission': 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
                  }[step.phase] || 'text-slate-600 bg-slate-100';

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        step.completed
                          ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => toggleAssignmentStep(currentProject.id, step.id)}
                          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                            step.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${phaseColors}`}>
                              {step.phase}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Target: {formatDate(step.suggestedDeadline)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{step.estimatedHours}h
                            </span>
                          </div>

                          <h4 className={`text-sm font-semibold ${
                            step.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            Step {idx + 1}: {step.title}
                          </h4>

                          {step.details && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {step.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={ListTree}
          title="No assignment breakdowns generated"
          description="Enter your essay prompt, research topic, or course project above to generate a phased step-by-step roadmap."
        />
      )}
    </div>
  );
};
