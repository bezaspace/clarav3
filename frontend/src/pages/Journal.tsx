import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Circle,
  ChevronLeft,
  Bell,
  ListChecks,
  Sparkles,
  Tag,
  Target,
  X,
  TrendingUp,
  Heart,
  Clock,
  ArrowRight,
  Moon,
} from 'lucide-react';

import { Card } from '@/src/components/ui/Card';
import { api } from '@/src/lib/api';
import type { CbtNote, JournalData, JournalEntry, Task } from '@/src/lib/types';
import { cn } from '@/src/lib/utils';

const fallbackData: JournalData = {
  tasks: [],
  entries: [],
  cbtNotes: [],
};

type JournalView = 'today' | 'reflections' | 'cbt' | 'tasks';
type LoadGroup = 'heavy' | 'today' | 'done';

const views: { id: JournalView; label: string; icon: typeof Sparkles; color: string }[] = [
  { id: 'today', label: 'Today', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
  { id: 'reflections', label: 'Reflections', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  { id: 'cbt', label: 'CBT', icon: Brain, color: 'bg-orange-100 text-orange-600' },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, color: 'bg-green-100 text-green-600' },
];

function getWeight(task: Task) {
  switch (task.priority) {
    case 'high':
      return 'Heavy';
    case 'medium':
      return 'Medium';
    default:
      return 'Light';
  }
}

function getWeightClass(task: Task) {
  switch (task.priority) {
    case 'high':
      return 'bg-red-100 text-red-600';
    case 'medium':
      return 'bg-amber-100 text-amber-600';
    default:
      return 'bg-green-100 text-green-600';
  }
}

function getTaskGroup(task: Task): LoadGroup {
  if (task.status === 'completed') {
    return 'done';
  }

  if (task.priority === 'high' || task.status === 'todo') {
    return 'heavy';
  }

  return 'today';
}

function getMoodTone(mood: string) {
  const normalized = mood.toLowerCase();
  if (normalized.includes('happy') || normalized.includes('productive') || normalized.includes('good')) {
    return 'bg-green-100 text-green-600';
  }
  if (normalized.includes('neutral') || normalized.includes('okay')) {
    return 'bg-amber-100 text-amber-600';
  }
  if (normalized.includes('sad') || normalized.includes('anxious') || normalized.includes('stressed')) {
    return 'bg-red-100 text-red-600';
  }
  return 'bg-blue-100 text-blue-600';
}

function getEntryThemes(entries: JournalEntry[]) {
  const uniqueTags = new Set(entries.flatMap((entry) => entry.tags));
  return Array.from(uniqueTags).slice(0, 5);
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[150px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm font-medium text-text-secondary">
      {label}
    </div>
  );
}

function TaskRow({ task }: { task: Task; key?: string }) {
  const isDone = task.status === 'completed';

  return (
    <div className="rounded-2xl border border-gray-100 bg-card-bg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {isDone ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-accent-green" size={20} />
        ) : (
          <Circle className="mt-0.5 shrink-0 text-text-muted" size={20} />
        )}
        <div className="min-w-0 flex-1">
          <h4
            className={cn(
              'text-sm font-semibold leading-snug',
              isDone ? 'text-text-muted line-through' : 'text-text-primary'
            )}
          >
            {task.title}
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider',
                getWeightClass(task)
              )}
            >
              {getWeight(task)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-text-secondary">
              <Tag size={10} />
              {task.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-text-secondary">
              <Calendar size={10} />
              {task.dueDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReflectionCard({
  entry,
  compact = false,
}: {
  entry: JournalEntry;
  compact?: boolean;
  key?: string;
}) {
  return (
    <Card className={cn('border-gray-100 bg-card-bg shadow-sm', compact ? 'p-4' : 'p-5')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">{entry.date}</p>
          <h3 className="mt-1 text-base font-semibold leading-tight text-text-primary">{entry.title}</h3>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider',
            getMoodTone(entry.mood)
          )}
        >
          {entry.mood}
        </span>
      </div>

      <p className={cn('text-sm leading-6 text-text-secondary', compact ? 'mt-3 line-clamp-2' : 'mt-4')}>
        {entry.excerpt}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-medium text-purple-600">
          {entry.source === 'assistant' ? 'AI-saved' : 'Manual'}
        </span>
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default function Journal() {
  const navigate = useNavigate();
  const [journalData, setJournalData] = useState<JournalData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<JournalView>('today');
  const [selectedCbtNote, setSelectedCbtNote] = useState<CbtNote | null>(null);

  useEffect(() => {
    let active = true;
    api
      .journal()
      .then((payload) => {
        if (!active) return;
        setJournalData(payload);
      })
      .catch(() => {
        if (active) {
          setJournalData(fallbackData);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const latestEntry = journalData.entries[0];
  const themes = useMemo(() => getEntryThemes(journalData.entries), [journalData.entries]);
  const openTasks = journalData.tasks.filter((task) => task.status !== 'completed');
  const heavyTasks = openTasks.filter((task) => task.priority === 'high');
  const taskGroups = useMemo(
    () => ({
      heavy: journalData.tasks.filter((task) => getTaskGroup(task) === 'heavy'),
      today: journalData.tasks.filter((task) => getTaskGroup(task) === 'today'),
      done: journalData.tasks.filter((task) => getTaskGroup(task) === 'done'),
    }),
    [journalData.tasks]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Header with yellow background */}
      <div className="bg-header-yellow rounded-b-[32px] px-5 pt-12 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-text-primary font-semibold text-lg">Journal</h1>
          <button className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition relative">
            <Bell size={20} className="text-text-primary" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* View tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {views.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveView(id)}
              className={cn(
                'inline-flex min-w-fit items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all',
                activeView === id
                  ? 'bg-text-primary text-white shadow-md'
                  : 'bg-white/60 text-text-secondary hover:bg-white/80'
              )}
            >
              <div className={cn('w-5 h-5 rounded-full flex items-center justify-center', color)}>
                <Icon size={12} />
              </div>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 py-6 space-y-6">

        {activeView === 'today' && (
          <div className="space-y-5">
            {/* Today's Mood Card */}
            <Card className="bg-card-purple border-indigo-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Heart size={16} className="text-white" />
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Today's Mood
                    </p>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">
                    {latestEntry ? latestEntry.mood : 'No check-in yet'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {latestEntry
                      ? latestEntry.excerpt
                      : 'When the assistant saves a reflection, the latest one will appear here.'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                  <Moon size={24} className="text-indigo-600" />
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card-teal rounded-2xl p-4 shadow-sm border border-teal-100">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center mb-3">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <p className="text-xs text-text-secondary mb-1">Mental Load</p>
                <p className="text-lg font-bold text-text-primary">
                  {heavyTasks.length ? 'High' : openTasks.length ? 'Medium' : 'Low'}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-teal-200">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${Math.min(100, 28 + openTasks.length * 12)}%` }}
                  />
                </div>
              </div>

              <div className="bg-card-green rounded-2xl p-4 shadow-sm border border-green-100">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-3">
                  <Tag size={16} className="text-white" />
                </div>
                <p className="text-xs text-text-secondary mb-1">Pattern</p>
                <p className="text-lg font-bold text-text-primary truncate">
                  {themes[0] || 'Reflection'}
                </p>
                <p className="mt-1 text-[10px] text-green-600">Most recent theme</p>
              </div>

              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-header-yellow flex items-center justify-center mb-3">
                  <Target size={16} className="text-text-primary" />
                </div>
                <p className="text-xs text-text-secondary mb-1">Next Step</p>
                <p className="text-lg font-bold text-text-primary">Clear one</p>
                <p className="mt-1 text-[10px] text-text-secondary">Smallest action</p>
              </div>
            </div>

            {/* Suggested Tasks */}
            <Card className="p-5 border-gray-100">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold text-accent-orange uppercase tracking-wider">
                    Suggested Next Step
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-text-primary">Make today feel lighter</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Target size={20} className="text-orange-600" />
                </div>
              </div>
              <div className="space-y-3">
                {(openTasks.length ? openTasks.slice(0, 3) : journalData.tasks.slice(0, 3)).map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {journalData.tasks.length === 0 && (
                  <EmptyState label="No tasks have been saved yet." />
                )}
              </div>
            </Card>
          </div>
        )}

        {activeView === 'reflections' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Saved Reflections</h3>
                <p className="text-xs text-text-secondary">Your journal entries and thoughts</p>
              </div>
            </div>
            {journalData.entries.length ? (
              <div className="space-y-4">
                {journalData.entries.map((entry) => (
                  <ReflectionCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <EmptyState label="No journal entries yet. Start writing your thoughts!" />
            )}
          </div>
        )}

        {activeView === 'cbt' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Brain size={20} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">CBT Notes</h3>
                <p className="text-xs text-text-secondary">Cognitive behavioral therapy exercises</p>
              </div>
              <span className="ml-auto text-xs font-semibold text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                {journalData.cbtNotes.length} notes
              </span>
            </div>

            {journalData.cbtNotes.length ? (
              <div className="space-y-3">
                {journalData.cbtNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setSelectedCbtNote(note)}
                    className="w-full bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        <Clock size={18} className="text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold text-text-muted">{note.time}</p>
                          {note.linkedEntryId && (
                            <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                              Linked
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-text-primary text-sm mb-2">{note.situation}</h4>
                        <p className="text-xs text-text-secondary line-clamp-2">{note.thought}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                            {note.feeling}
                          </span>
                          <ArrowRight size={12} className="text-text-muted" />
                          <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full line-clamp-1">
                            {note.action}
                          </span>
                        </div>
                      </div>
                      <ChevronLeft size={20} className="text-text-muted rotate-180 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState label="No CBT notes yet. Your therapist can help you create these." />
            )}
          </div>
        )}

        {selectedCbtNote && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cbt-note-title"
            onClick={() => setSelectedCbtNote(null)}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-card-bg shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-600">CBT Note</p>
                  <h3 id="cbt-note-title" className="mt-1 text-base font-semibold text-text-primary">
                    {selectedCbtNote.situation}
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary">{selectedCbtNote.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCbtNote(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-text-secondary transition hover:bg-gray-200"
                  aria-label="Close CBT note"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-2">Thought</p>
                  <p className="text-sm leading-6 text-text-secondary">{selectedCbtNote.thought}</p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-2">Feeling</p>
                  <p className="text-sm leading-6 text-text-secondary">{selectedCbtNote.feeling}</p>
                </div>
                <div className="p-4 bg-green-50/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600 mb-2">Kinder Reframe</p>
                  <p className="text-sm leading-6 text-text-secondary">{selectedCbtNote.reframe}</p>
                </div>
                <div className="p-4 bg-orange-50/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 mb-2">Small Action</p>
                  <p className="text-sm font-semibold leading-6 text-text-primary">{selectedCbtNote.action}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <ListChecks size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Task Board</h3>
                <p className="text-xs text-text-secondary">Organize and track your tasks</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  id: 'heavy' as LoadGroup,
                  title: 'Heavy on My Mind',
                  icon: Brain,
                  color: 'bg-red-100 text-red-600',
                  bgColor: 'bg-red-50/50',
                  borderColor: 'border-red-100',
                  empty: 'Nothing heavy is waiting right now.',
                },
                {
                  id: 'today' as LoadGroup,
                  title: 'Can Handle Today',
                  icon: Target,
                  color: 'bg-amber-100 text-amber-600',
                  bgColor: 'bg-amber-50/50',
                  borderColor: 'border-amber-100',
                  empty: 'No manageable tasks yet.',
                },
                {
                  id: 'done' as LoadGroup,
                  title: 'Done',
                  icon: CheckCircle2,
                  color: 'bg-green-100 text-green-600',
                  bgColor: 'bg-green-50/50',
                  borderColor: 'border-green-100',
                  empty: 'Completed tasks will appear here.',
                },
              ].map(({ id, title, icon: Icon, color, bgColor, borderColor, empty }) => (
                <div key={id} className={cn('rounded-2xl border p-4', bgColor, borderColor)}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', color)}>
                        <Icon size={16} />
                      </div>
                      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-text-secondary">
                      {taskGroups[id].length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {taskGroups[id].map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                    {taskGroups[id].length === 0 && <EmptyState label={empty} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
