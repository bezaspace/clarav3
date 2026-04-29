import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Circle,
  HeartPulse,
  ListChecks,
  Moon,
  Tag,
  Target,
  X,
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

const views: { id: JournalView; label: string; icon: typeof HeartPulse }[] = [
  { id: 'today', label: 'Today', icon: HeartPulse },
  { id: 'reflections', label: 'Reflections', icon: BookOpen },
  { id: 'cbt', label: 'CBT', icon: Brain },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
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
      return 'border-red-400/20 bg-red-400/10 text-red-200';
    case 'medium':
      return 'border-ayu-saffron/25 bg-ayu-saffron/10 text-ayu-saffron';
    default:
      return 'border-ayu-green/25 bg-ayu-green/10 text-ayu-green';
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
  if (normalized.includes('happy') || normalized.includes('productive')) {
    return 'border-ayu-green/25 bg-ayu-green/10 text-ayu-green';
  }
  if (normalized.includes('neutral')) {
    return 'border-ayu-saffron/25 bg-ayu-saffron/10 text-ayu-saffron';
  }
  return 'border-stone-500/30 bg-stone-800 text-stone-300';
}

function getEntryThemes(entries: JournalEntry[]) {
  const uniqueTags = new Set(entries.flatMap((entry) => entry.tags));
  return Array.from(uniqueTags).slice(0, 5);
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-stone-800 bg-stone-950/30 p-8 text-center text-sm font-semibold text-stone-600">
      {label}
    </div>
  );
}

function TaskRow({ task }: { task: Task; key?: string }) {
  const isDone = task.status === 'completed';

  return (
    <div className="rounded-xl border border-ayu-border bg-ayu-bg/45 p-4">
      <div className="flex items-start gap-3">
        {isDone ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-ayu-green" size={18} />
        ) : (
          <Circle className="mt-0.5 shrink-0 text-stone-600" size={18} />
        )}
        <div className="min-w-0 flex-1">
          <h4
            className={cn(
              'text-sm font-bold leading-snug',
              isDone ? 'text-stone-500 line-through decoration-ayu-green/30' : 'text-stone-200'
            )}
          >
            {task.title}
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={cn(
                'rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
                getWeightClass(task)
              )}
            >
              {getWeight(task)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-ayu-border bg-stone-950/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <Tag size={11} />
              {task.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-ayu-border bg-stone-950/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <Calendar size={11} />
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
    <Card className={cn('border-ayu-border bg-ayu-card/90', compact ? 'p-4' : 'p-5')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{entry.date}</p>
          <h3 className="mt-1 text-lg font-serif leading-tight text-stone-100">{entry.title}</h3>
        </div>
        <span
          className={cn(
            'rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
            getMoodTone(entry.mood)
          )}
        >
          {entry.mood}
        </span>
      </div>

      <p className={cn('text-sm leading-6 text-stone-400', compact ? 'mt-3 line-clamp-2' : 'mt-4')}>
        {entry.excerpt}
      </p>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-ayu-border/60 pt-4">
        <span className="rounded-lg border border-ayu-green/20 bg-ayu-green/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ayu-green">
          {entry.source === 'assistant' ? 'AI-saved reflection' : 'Saved reflection'}
        </span>
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-lg border border-ayu-border bg-ayu-bg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500"
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default function Journal() {
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
    return <div className="text-sm text-stone-500">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <header>
        <div className="flex w-full gap-1 overflow-x-auto rounded-xl border border-ayu-border bg-stone-900 p-1 md:w-fit">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveView(id)}
              className={cn(
                'inline-flex min-w-fit items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all',
                activeView === id
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-300'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </header>

      {activeView === 'today' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card className="border-ayu-green/20 bg-ayu-green/5 p-5 lg:col-span-7">
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ayu-green">
                    Today
                  </p>
                  <h3 className="mt-2 text-2xl font-serif text-stone-100">
                    {latestEntry ? latestEntry.mood : 'No check-in yet'}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-stone-400">
                    {latestEntry
                      ? latestEntry.excerpt
                      : 'When the assistant saves a reflection, the latest one will appear here.'}
                  </p>
                </div>
                <div className="rounded-xl border border-ayu-border bg-ayu-bg/80 p-3 text-ayu-green">
                  <Moon size={22} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-ayu-border bg-ayu-bg/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Mental load</p>
                  <p className="mt-2 text-xl font-bold text-stone-100">
                    {heavyTasks.length ? 'High' : openTasks.length ? 'Manageable' : 'Light'}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-900">
                    <div
                      className="h-full rounded-full bg-ayu-saffron"
                      style={{ width: `${Math.min(100, 28 + openTasks.length * 12)}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-ayu-border bg-ayu-bg/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Pattern</p>
                  <p className="mt-2 text-xl font-bold text-stone-100">
                    {themes[0] || 'Reflection'}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-stone-500">Most recent recurring theme.</p>
                </div>
                <div className="rounded-xl border border-ayu-border bg-ayu-bg/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Next step</p>
                  <p className="mt-2 text-xl font-bold text-stone-100">Clear one thing</p>
                  <p className="mt-2 text-xs leading-5 text-stone-500">Choose the smallest open action.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 lg:col-span-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ayu-saffron">
                  Suggested next step
                </p>
                <h3 className="mt-2 text-xl font-serif text-stone-100">Make today feel lighter</h3>
              </div>
              <Target className="text-ayu-saffron" size={22} />
            </div>
            <div className="mt-5 space-y-3">
              {(openTasks.length ? openTasks.slice(0, 3) : journalData.tasks.slice(0, 3)).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
              {journalData.tasks.length === 0 && (
                <EmptyState label="No mental-load tasks have been saved yet." />
              )}
            </div>
          </Card>

        </div>
      )}

      {activeView === 'reflections' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <BookOpen className="text-ayu-green" size={21} />
            <h3 className="text-xl font-serif text-stone-100">Saved reflections</h3>
          </div>
          {journalData.entries.length ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {journalData.entries.map((entry) => (
                <ReflectionCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <EmptyState label="No approved journal entries are available yet." />
          )}
        </div>
      )}

      {activeView === 'cbt' && (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-ayu-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Brain className="text-ayu-saffron" size={16} />
              <h3 className="text-sm font-bold text-stone-200">CBT notes</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
              {journalData.cbtNotes.length} rows
            </span>
          </div>

          {journalData.cbtNotes.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                <thead className="bg-stone-950/70 text-[10px] uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="border-b border-r border-ayu-border px-3 py-2 font-bold">Time</th>
                    <th className="border-b border-r border-ayu-border px-3 py-2 font-bold">Situation</th>
                    <th className="border-b border-r border-ayu-border px-3 py-2 font-bold">Thought</th>
                    <th className="border-b border-r border-ayu-border px-3 py-2 font-bold">Feeling</th>
                    <th className="border-b border-r border-ayu-border px-3 py-2 font-bold">Kinder reframe</th>
                    <th className="border-b border-ayu-border px-3 py-2 font-bold">Small action</th>
                  </tr>
                </thead>
                <tbody>
                  {journalData.cbtNotes.map((note) => (
                    <tr
                      key={note.id}
                      tabIndex={0}
                      role="button"
                      onClick={() => setSelectedCbtNote(note)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedCbtNote(note);
                        }
                      }}
                      className="cursor-pointer border-b border-ayu-border/70 text-stone-300 transition hover:bg-ayu-green/5 focus:bg-ayu-green/5 focus:outline-none"
                    >
                      <td className="whitespace-nowrap border-r border-ayu-border/70 px-3 py-2 text-stone-500">
                        {note.time}
                      </td>
                      <td className="max-w-[220px] border-r border-ayu-border/70 px-3 py-2 font-semibold text-stone-200">
                        {note.situation}
                      </td>
                      <td className="max-w-[190px] border-r border-ayu-border/70 px-3 py-2 text-stone-400">
                        <span className="line-clamp-1">{note.thought}</span>
                      </td>
                      <td className="max-w-[140px] border-r border-ayu-border/70 px-3 py-2 text-stone-400">
                        {note.feeling}
                      </td>
                      <td className="max-w-[240px] border-r border-ayu-border/70 px-3 py-2 text-stone-400">
                        <span className="line-clamp-1">{note.reframe}</span>
                      </td>
                      <td className="max-w-[230px] px-3 py-2 text-stone-400">
                        <span className="line-clamp-1">{note.action}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4">
              <EmptyState label="No CBT notes have been saved yet." />
            </div>
          )}
        </Card>
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
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-ayu-border bg-ayu-card shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ayu-border px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ayu-saffron">CBT note</p>
                <h3 id="cbt-note-title" className="mt-1 text-lg font-serif text-stone-100">
                  {selectedCbtNote.situation}
                </h3>
                <p className="mt-1 text-xs font-semibold text-stone-500">{selectedCbtNote.time}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCbtNote(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ayu-border text-stone-500 transition hover:text-stone-100"
                aria-label="Close CBT note"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 divide-y divide-ayu-border md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Thought</p>
                  <p className="mt-1 text-sm leading-6 text-stone-300">{selectedCbtNote.thought}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Feeling</p>
                  <p className="mt-1 text-sm leading-6 text-stone-300">{selectedCbtNote.feeling}</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ayu-green">Kinder reframe</p>
                  <p className="mt-1 text-sm leading-6 text-stone-300">{selectedCbtNote.reframe}</p>
                </div>
                <div className="rounded-lg border border-ayu-border bg-ayu-bg/70 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Small action</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-stone-200">{selectedCbtNote.action}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'tasks' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {[
            {
              id: 'heavy' as LoadGroup,
              title: 'Heavy on my mind',
              icon: Brain,
              tone: 'text-red-300',
              empty: 'Nothing heavy is waiting right now.',
            },
            {
              id: 'today' as LoadGroup,
              title: 'Can handle today',
              icon: Target,
              tone: 'text-ayu-saffron',
              empty: 'No manageable next actions yet.',
            },
            {
              id: 'done' as LoadGroup,
              title: 'Done',
              icon: CheckCircle2,
              tone: 'text-ayu-green',
              empty: 'Completed mental-load tasks will appear here.',
            },
          ].map(({ id, title, icon: Icon, tone, empty }) => (
            <div key={id} className="rounded-2xl border border-ayu-border/70 bg-stone-900/25 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon className={tone} size={18} />
                  <h3 className="text-base font-bold text-stone-200">{title}</h3>
                </div>
                <span className="rounded-full border border-ayu-border bg-ayu-bg px-2.5 py-1 text-xs font-bold text-stone-500">
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
      )}
    </div>
  );
}
