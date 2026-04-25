import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import type { CareActivity, DashboardData, DashboardProfile } from '@/src/lib/types';
import { 
  User, 
  ShieldAlert, 
  History, 
  Target, 
  Dna, 
  Fingerprint,
  Stethoscope,
  Brain,
  Dumbbell,
  Utensils,
  Pill,
  Clock,
  CheckCircle2,
  Circle,
  ShoppingBag,
  Truck,
  TestTubes,
  Trash2
} from 'lucide-react';

const EMPTY_PROFILE: DashboardProfile = {
  name: '',
  age: 0,
  bloodType: '',
  prakriti: '',
  status: '',
  allergies: [],
  conditions: [],
  history: [],
  targets: [],
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [careActivity, setCareActivity] = useState<CareActivity[]>([]);
  const [deletingCareId, setDeletingCareId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.dashboard(),
      api.careActivity(true),
    ])
      .then(([payload, activity]) => {
        if (active) {
          setData(payload);
          setCareActivity(activity);
        }
      })
      .catch(() => {
        if (active) {
          setData({ profile: EMPTY_PROFILE, todaysSchedule: [] });
          setCareActivity([]);
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="text-sm text-stone-500">Loading...</div>;
  }

  if (!data) {
    return <div className="text-sm text-stone-500">Unable to load dashboard.</div>;
  }

  const profile = {
    ...EMPTY_PROFILE,
    ...(data.profile ?? {}),
    allergies: Array.isArray(data.profile?.allergies) ? data.profile.allergies : [],
    conditions: Array.isArray(data.profile?.conditions) ? data.profile.conditions : [],
    history: Array.isArray(data.profile?.history) ? data.profile.history : [],
    targets: Array.isArray(data.profile?.targets) ? data.profile.targets : [],
  };
  const todaysSchedule = Array.isArray(data.todaysSchedule) ? data.todaysSchedule : [];

  const getCareIcon = (kind: CareActivity['kind']) => {
    switch (kind) {
      case 'food': return <Truck size={16} />;
      case 'doctor': return <Stethoscope size={16} />;
      case 'lab': return <TestTubes size={16} />;
      default: return <ShoppingBag size={16} />;
    }
  };

  const getCareLabel = (activity: CareActivity) => {
    if (activity.kind === 'food') {
      return activity.eta ? `Delivery in ${activity.eta}` : 'Food delivery';
    }
    if (activity.kind === 'doctor' || activity.kind === 'lab') {
      return activity.scheduledFor || 'Next available slot';
    }
    return 'Shop order';
  };

  const deleteCareActivity = async (activityId: string) => {
    const previous = careActivity;
    setDeletingCareId(activityId);
    setCareActivity((current) => current.filter((activity) => activity.id !== activityId));
    try {
      await api.deleteCareActivity(activityId);
    } catch {
      setCareActivity(previous);
    } finally {
      setDeletingCareId(null);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Mind': return <Brain size={16} />;
      case 'Body': return <Dumbbell size={16} />;
      case 'Diet': return <Utensils size={16} />;
      case 'Medicine': return <Pill size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'Mind': return 'text-purple-400 bg-purple-900/30 border-purple-800/50';
      case 'Body': return 'text-blue-400 bg-blue-900/30 border-blue-800/50';
      case 'Diet': return 'text-orange-400 bg-orange-900/30 border-orange-800/50';
      case 'Medicine': return 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50';
      default: return 'text-stone-400 bg-stone-900/30 border-stone-800/50';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-5xl mx-auto">
      <header className="flex flex-col gap-1">
        <h2 className="text-4xl font-serif text-stone-100 italic">Namaste, {profile.name}</h2>
        <p className="text-stone-500 text-sm">Your Biological Blueprint & Optimization Path</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Identity Section */}
        <Card className="lg:col-span-4 p-6 bg-ayu-bg/50 border-ayu-border flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-ayu-green/10 flex items-center justify-center mb-4 border border-ayu-green/20 relative">
            <User size={48} className="text-ayu-green" />
            <div className="absolute -bottom-1 -right-1 bg-ayu-saffron p-1.5 rounded-lg text-ayu-bg">
              <Fingerprint size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-serif text-stone-100">{profile.name}, {profile.age}</h3>
          <p className="text-xs text-stone-500 uppercase font-bold tracking-widest mt-1">Patient Identifier: #AC-8842</p>
          
          <div className="w-full mt-8">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-ayu-card border border-ayu-border">
              <span className="text-[9px] uppercase font-bold text-stone-600">Blood Type</span>
              <span className="text-sm font-bold text-stone-300">{profile.bloodType}</span>
            </div>
          </div>
        </Card>

        {/* Current Condition & Risks */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies & Sensitivities */}
            <Card className="border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert size={20} className="text-red-500" />
                <h4 className="font-serif text-lg text-stone-200">Allergies</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] uppercase font-bold rounded-full border border-red-500/20">
                    {allergy}
                  </span>
                ))}
              </div>
            </Card>

            {/* Active Conditions */}
            <Card className="border-ayu-saffron/20 bg-ayu-saffron/5">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope size={20} className="text-ayu-saffron" />
                <h4 className="font-serif text-lg text-stone-200">Monitoring</h4>
              </div>
              <ul className="space-y-2">
                {profile.conditions.map((condition, i) => (
                  <li key={i} className="text-xs text-stone-400 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-ayu-saffron" />
                    {condition}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Medical History Timeline */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <History size={20} className="text-ayu-green" />
              <h4 className="font-serif text-lg text-stone-200">Clinical History</h4>
            </div>
            <div className="space-y-4">
              {profile.history.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-ayu-border border border-ayu-green/40 group-hover:bg-ayu-green transition-colors" />
                    {i !== profile.history.length - 1 && <div className="w-[1px] h-full bg-ayu-border" />}
                  </div>
                  <div className="pb-4">
                    <span className="text-[10px] font-bold text-ayu-green uppercase tracking-wider">{item.year}</span>
                    <p className="text-sm text-stone-300 font-medium">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {careActivity.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <ShoppingBag size={22} className="text-ayu-saffron" />
            <h3 className="text-xl font-serif text-stone-100">Upcoming Care</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careActivity.slice(0, 6).map((activity) => (
              <Card key={activity.id} className="flex flex-col gap-3 border-ayu-saffron/20 bg-ayu-saffron/5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-ayu-saffron">
                    {getCareIcon(activity.kind)}
                    <span>{activity.kind}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-ayu-border bg-ayu-card px-2 py-1 text-[10px] font-bold uppercase text-stone-500">
                      {activity.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteCareActivity(activity.id)}
                      disabled={deletingCareId === activity.id}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-wait disabled:opacity-60"
                      aria-label={`Delete ${activity.title}`}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-200">{activity.title}</h4>
                  <p className="mt-1 text-[11px] text-stone-500">
                    {activity.provider ? `${activity.provider} · ` : ''}{getCareLabel(activity)}
                  </p>
                </div>
                <div className="text-xs font-bold text-stone-300">₹{activity.price}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Today's Schedule Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Clock size={22} className="text-ayu-green" />
          <h3 className="text-xl font-serif text-stone-100">Today's Schedule</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysSchedule.map((item) => (
            <Card key={item.id} className={cn(
              "flex flex-col gap-3 group transition-all",
              item.status === 'completed' 
                ? "bg-ayu-green/5 border-ayu-green/20" 
                : "hover:border-ayu-green/30"
            )}>
              <div className="flex justify-between items-center mb-1">
                <div className={cn("px-2 py-1 rounded text-[10px] uppercase font-bold flex items-center gap-1.5 border", getColorForType(item.type))}>
                  {getIconForType(item.type)}
                  <span>{item.type}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-60">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold tracking-wider">{item.time}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                {item.status === 'completed' ? (
                  <CheckCircle2 size={20} className="text-ayu-green shrink-0 mt-0.5" />
                ) : (
                  <Circle size={20} className="text-stone-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={cn(
                    "text-sm font-bold",
                    item.status === 'completed' ? "text-stone-400 line-through decoration-ayu-green/30" : "text-stone-200"
                  )}>{item.title}</h4>
                  <p className="text-[11px] text-stone-500 mt-1">{item.duration}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Strategic Optimization Targets */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 mt-4">
          <Target size={22} className="text-ayu-green" />
          <h3 className="text-xl font-serif text-stone-100">3-Month Optimization Aim</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.targets.map((target, i) => (
            <Card key={i} className="flex flex-col gap-4 group hover:border-ayu-green/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-stone-300 font-bold text-sm tracking-tight">{target.goal}</h5>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mt-0.5">Priority: {target.effort}</p>
                </div>
                <div className="bg-ayu-green/10 p-2 rounded-lg text-ayu-green">
                  <Dna size={18} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-bold text-stone-600 mb-2 uppercase">
                    <span>Base ({target.current})</span>
                    <span>Aim ({target.aim})</span>
                  </div>
                  <div className="h-2 w-full bg-ayu-bg rounded-full overflow-hidden border border-ayu-border relative">
                    <div className="absolute inset-y-0 left-0 bg-ayu-green opacity-40" style={{ width: '65%' }} />
                    <div className="absolute right-[10%] top-0 bottom-0 w-[2px] bg-ayu-green shadow-[0_0_8px_rgba(61,107,53,0.8)]" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>


    </div>
  );
}
