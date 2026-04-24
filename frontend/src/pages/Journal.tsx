import { useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { 
  Book, Pencil, Plus, Search, Calendar, 
  CheckCircle2, Clock, Circle, Filter, 
  Trash2, ChevronRight, Hash, Star, Layout,
  ListTodo
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
}

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  mood: string;
  tags: string[];
}

const initialTasks: Task[] = [
  { id: '1', title: 'Morning Vipassana Meditation', status: 'completed', priority: 'high', category: 'Mind', dueDate: 'Today' },
  { id: '2', title: 'Buy high-protein groceries', status: 'in-progress', priority: 'medium', category: 'Shopping', dueDate: 'Today' },
  { id: '3', title: 'Consultation with Dr. Ishani', status: 'todo', priority: 'high', category: 'Health', dueDate: 'Tomorrow' },
  { id: '4', title: 'Update biomarker tracking', status: 'todo', priority: 'medium', category: 'Optimization', dueDate: '25 Apr' },
  { id: '5', title: 'Read 20 pages of "Atomic Habits"', status: 'in-progress', priority: 'low', category: 'Growth', dueDate: 'Today' },
  { id: '6', title: 'Pre-workout meal prep', status: 'todo', priority: 'medium', category: 'Body', dueDate: 'Today' },
  { id: '7', title: 'Book full body lab test', status: 'completed', priority: 'high', category: 'Health', dueDate: 'Yesterday' },
];

const journalEntries: JournalEntry[] = [
  { 
    id: '1', 
    date: '23 April, 2026', 
    title: 'Morning Clarity', 
    excerpt: 'Woke up feeling exceptionally refreshed today. The new sleep routine is clearly working...', 
    mood: 'Happy', 
    tags: ['Sleep', 'Mindfulness'] 
  },
  { 
    id: '2', 
    date: '22 April, 2026', 
    title: 'Post-Workout Reflection', 
    excerpt: 'Felt strong during the session, but noticed some tightness in the lower back. Need to focus on mobility tomorrow...', 
    mood: 'Productive', 
    tags: ['Fitness', 'Reflection'] 
  },
  { 
    id: '3', 
    date: '21 April, 2026', 
    title: 'Balanced Diet Struggles', 
    excerpt: 'Had a slight slip up with the diet today at the office party. Choosing to forgive myself and get back on track...', 
    mood: 'Neutral', 
    tags: ['Diet', 'Self-Care'] 
  },
];

export default function Journal() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeView, setActiveView] = useState<'todo' | 'in-progress' | 'completed' | 'journal'>('todo');

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-ayu-saffron bg-ayu-saffron/10 border-ayu-saffron/20';
      default: return 'text-ayu-green bg-ayu-green/10 border-ayu-green/20';
    }
  };

  const TaskGrid = ({ title, status, icon: Icon, color }: { title: string, status: Task['status'], icon: any, color: string }) => {
    const sectionTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className="flex-1 bg-stone-900/30 rounded-2xl p-4 sm:p-6 border border-ayu-border/50 flex flex-col w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icon className={color} size={18} />
            <h3 className="text-base font-bold text-stone-300">{title}</h3>
          </div>
          <span className="text-xs font-bold text-stone-500 bg-ayu-bg px-2.5 py-1 rounded-full border border-ayu-border">{sectionTasks.length} tasks</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 content-start">
          {sectionTasks.map(task => (
            <Card key={task.id} className="p-4 border-ayu-border hover:border-ayu-green/20 transition-all group flex flex-col bg-ayu-bg/50 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border",
                  getPriorityColor(task.priority)
                )}>
                  {task.priority}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-stone-500 hover:text-stone-300">
                    <Pencil size={12} />
                  </button>
                  <button className="text-stone-500 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              
              <h4 className={cn(
                "text-sm font-bold leading-snug mb-3",
                task.status === 'completed' ? "text-stone-500 line-through" : "text-stone-200"
              )}>
                {task.title}
              </h4>
              
              <div className="flex items-center gap-2 mt-auto">
                <span className="flex items-center gap-1 text-[10px] text-stone-500 font-medium bg-stone-900/80 px-2 py-1 rounded">
                  <Hash size={10} /> {task.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-stone-500 font-medium bg-stone-900/80 px-2 py-1 rounded">
                  <Calendar size={10} /> {task.dueDate}
                </span>
              </div>
            </Card>
          ))}
          {sectionTasks.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-stone-600 border border-dashed border-stone-800 rounded-xl flex-1 min-h-[160px]">
              <span className="text-sm font-bold">No tasks</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col pb-20 md:pb-6">
      <header className="flex flex-col gap-4 mb-6">
        {/* View Toggle */}
        <div className="flex flex-wrap sm:flex-nowrap bg-stone-900 border border-ayu-border rounded-xl p-1 w-full lg:w-fit gap-1 sm:gap-0">
          <button 
            onClick={() => setActiveView('todo')}
            className={cn("flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all", activeView === 'todo' ? "bg-stone-800 text-stone-100 shadow-sm" : "text-stone-500 hover:text-stone-300")}
          >
            <Circle size={14} /> To Do
          </button>
          <button 
            onClick={() => setActiveView('in-progress')}
            className={cn("flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all", activeView === 'in-progress' ? "bg-stone-800 text-stone-100 shadow-sm" : "text-stone-500 hover:text-stone-300")}
          >
            <Clock size={14} /> In Progress
          </button>
          <button 
            onClick={() => setActiveView('completed')}
            className={cn("flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all", activeView === 'completed' ? "bg-stone-800 text-stone-100 shadow-sm" : "text-stone-500 hover:text-stone-300")}
          >
            <CheckCircle2 size={14} /> Completed
          </button>
          <button 
            onClick={() => setActiveView('journal')}
            className={cn("flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all", activeView === 'journal' ? "bg-stone-800 text-stone-100 shadow-sm" : "text-stone-500 hover:text-stone-300")}
          >
            <Book size={14} /> Journal
          </button>
        </div>
      </header>

      {/* View Content Area */}
      <div className="flex-1">
        {activeView !== 'journal' ? (
          <div className="flex flex-col h-full gap-4">
            <div className="flex flex-col gap-4 h-full pb-4 items-start w-full transition-all duration-300">
              <AnimatePresence mode="wait">
                {activeView === 'todo' && (
                  <motion.div 
                    key="todo"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex"
                  >
                    <TaskGrid title="To Do" status="todo" icon={Circle} color="text-stone-500" />
                  </motion.div>
                )}
                {activeView === 'in-progress' && (
                  <motion.div 
                    key="in-progress"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex"
                  >
                    <TaskGrid title="In Progress" status="in-progress" icon={Clock} color="text-ayu-saffron" />
                  </motion.div>
                )}
                {activeView === 'completed' && (
                  <motion.div 
                    key="completed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex"
                  >
                    <TaskGrid title="Completed" status="completed" icon={CheckCircle2} color="text-ayu-green" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {journalEntries.map((entry) => (
                <Card key={entry.id} className="p-6 border-ayu-border hover:border-ayu-green/20 flex flex-col group transition-all">
                  <div className="flex justify-between items-start w-full mb-4">
                    <div>
                      <p className="text-[10px] text-ayu-saffron font-bold uppercase tracking-widest">{entry.date}</p>
                      <h4 className="text-lg font-serif text-stone-100 mt-1">{entry.title}</h4>
                    </div>
                    <div className="bg-ayu-bg border border-ayu-border px-2 py-1 rounded-lg text-[10px] font-bold text-ayu-green uppercase">
                      {entry.mood}
                    </div>
                  </div>
                  
                  <p className="text-sm text-stone-400 leading-relaxed italic mb-6">
                    "{entry.excerpt}"
                  </p>
                  
                  <div className="flex justify-between items-center w-full mt-auto pt-4 border-t border-ayu-border/50">
                    <div className="flex gap-2 flex-wrap">
                      {entry.tags.map(tag => (
                        <span key={tag} className="text-[9px] text-stone-600 bg-ayu-bg border border-ayu-border px-2 py-0.5 rounded italic">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <button className="text-xs font-bold text-ayu-green flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      Read <ChevronRight size={14} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

