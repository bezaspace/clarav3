import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Diet from '@/src/pages/Diet';
import Medication from '@/src/pages/Medication';
import MentalHealth from '@/src/pages/MentalHealth';
import Workouts from '@/src/pages/Workouts';
import Biomarkers from '@/src/pages/Biomarkers';
import { cn } from '@/src/lib/utils';
import { Activity, ShieldCheck } from 'lucide-react';

const MetricsSection = () => (
  <div className="flex flex-col hide-scrollbar">
    <div id="diet"><Diet /></div>
    <div id="meds"><Medication /></div>
    <div id="mind"><MentalHealth /></div>
    <div id="body"><Workouts /></div>
  </div>
);

export default function Progress() {
  const [activeTab, setActiveTab] = useState('metrics');
  const location = useLocation();
  const navigate = useNavigate();

  // Handle URL hash for deep linking (e.g., /progress#optimization)
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['metrics', 'optimization'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    navigate(`#${id}`, { replace: true });
  };

  const tabs = [
    { id: 'metrics', label: 'Metrics', icon: Activity, component: MetricsSection },
    { id: 'optimization', label: 'Optimization', icon: ShieldCheck, component: Biomarkers },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || MetricsSection;

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-6">
      {/* Sub Navigation */}
      <div className="overflow-x-auto pb-0 mb-6 scrollbar-hide border-b border-ayu-border">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 transition-all border-b-2 font-medium text-sm",
                  isActive
                    ? "border-ayu-green text-ayu-green"
                    : "border-transparent text-stone-500 hover:text-stone-300"
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Component Area */}
      <div className="flex-1 animate-in fade-in duration-500">
        <ActiveComponent />
      </div>
    </div>
  );
}
