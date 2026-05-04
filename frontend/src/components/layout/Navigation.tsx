import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Home, Mic, BookOpen, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function Navigation() {
  const navigate = useNavigate();

  const leftNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Activity, label: 'Progress', path: '/progress' },
  ];

  const rightNavItems = [
    { icon: BookOpen, label: 'Journal', path: '/journal' },
    { icon: User, label: 'Care', path: '/care' },
  ];

  return (
    <>
      {/* Main bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-nav-bg px-4 py-2 pb-6 z-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Left nav items */}
          <div className="flex items-center gap-6">
            {leftNavItems.map(({ icon: Icon, label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-nav-active'
                      : 'text-gray-400 hover:text-gray-300'
                  )
                }
              >
                <Icon size={22} strokeWidth={isActive => isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Center - Empty space for FAB */}
          <div className="w-14" />

          {/* Right nav items */}
          <div className="flex items-center gap-6">
            {rightNavItems.map(({ icon: Icon, label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-nav-active'
                      : 'text-gray-400 hover:text-gray-300'
                  )
                }
              >
                <Icon size={22} strokeWidth={isActive => isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Floating Action Button (Mic) */}
      <button
        onClick={() => navigate('/voice-assistant')}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-fab-bg shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 border-4 border-bg-primary"
        aria-label="Voice Assistant"
      >
        <Mic size={24} className="text-text-primary" />
      </button>
    </>
  );
}

