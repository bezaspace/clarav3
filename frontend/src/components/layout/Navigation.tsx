import { NavLink } from 'react-router-dom';
import { Activity, BookText, Home, Mic, ShieldPlus } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function Navigation() {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Activity, label: 'Progress', path: '/progress' },
    { icon: ShieldPlus, label: 'Care', path: '/care' },
    { icon: BookText, label: 'Journal', path: '/journal' },
    { icon: Mic, label: 'Voice', path: '/voice-assistant' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ayu-card border-t border-ayu-border px-4 py-2 pb-6 md:pb-2 md:relative md:border-t-0 md:border-r md:w-56 md:h-screen md:flex-col md:justify-start md:py-6 z-50">
      <div className="hidden md:flex flex-col mb-10 px-2">
        <h1 className="text-2xl font-serif text-ayu-green font-semibold">AyuCare</h1>
        <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">Holistic Wellness</p>
      </div>
      
      <div className="flex justify-between md:flex-col md:gap-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-300 md:flex-row md:gap-3 md:px-3 md:py-2.5",
              isActive 
                ? "text-ayu-green bg-ayu-green/10 font-medium" 
                : "text-stone-500 hover:text-stone-300 hover:bg-stone-900/50"
            )}
          >
            <Icon size={20} />
            <span className="text-[9px] md:text-sm">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
