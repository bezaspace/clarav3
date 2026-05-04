import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/lib/api';
import type { CareActivity, DashboardData, DashboardProfile } from '@/src/lib/types';
import {
  User,
  Clock,
  ChevronRight,
  Moon,
  Footprints,
  Smile,
  CheckCircle2,
  Circle,
  MapPin,
  Stethoscope,
  Pill,
  Activity,
} from 'lucide-react';

const EMPTY_PROFILE: DashboardProfile = {
  name: 'Clara',
  age: 0,
  bloodType: '',
  prakriti: '',
  status: '',
  allergies: [],
  conditions: [],
  history: [],
  targets: [],
};

// Mock schedule data matching the screenshot
const MOCK_SCHEDULE = [
  {
    id: '1',
    time: '10:30 AM',
    title: 'Dr. Sarah Johnson',
    subtitle: 'Cardiology Consultation',
    type: 'doctor',
    status: 'upcoming',
  },
  {
    id: '2',
    time: '01:00 PM',
    title: 'Take Aspirin',
    subtitle: '1 tablet after lunch',
    type: 'medicine',
    status: 'pending',
  },
  {
    id: '3',
    time: '07:30 PM',
    title: 'Evening Walk',
    subtitle: '30 min • Outdoor',
    type: 'activity',
    status: 'pending',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [careActivity] = useState<CareActivity[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([api.dashboard(), api.careActivity(true)])
      .then(([payload]) => {
        if (active) {
          setData(payload);
        }
      })
      .catch(() => {
        if (active) {
          setData({ profile: EMPTY_PROFILE, todaysSchedule: [] });
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  const profile = data?.profile ?? EMPTY_PROFILE;

  const getScheduleIcon = (type: string) => {
    switch (type) {
      case 'doctor':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Stethoscope size={18} className="text-amber-600" />
          </div>
        );
      case 'medicine':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Pill size={18} className="text-green-600" />
          </div>
        );
      case 'activity':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Activity size={18} className="text-green-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Clock size={18} className="text-gray-600" />
          </div>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle2 size={20} className="text-accent-green shrink-0" />;
    }
    return <Circle size={20} className="text-text-muted shrink-0" />;
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Header with yellow background */}
      <div className="bg-header-yellow rounded-b-[32px] px-5 pt-12 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-text-primary font-semibold text-sm">Home</div>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition"
          >
            <User size={20} className="text-text-primary" />
          </button>
        </div>

        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary leading-tight">
            Good Morning,
          </h1>
          <h1 className="text-3xl font-bold text-text-primary leading-tight">
            {profile.name}!
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Here&apos;s your health overview
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 py-6 space-y-6">
        {/* Today's Schedule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">
              Today&apos;s Schedule
            </h2>
            <button
              onClick={() => navigate('/schedule')}
              className="text-text-secondary text-sm font-medium hover:text-text-primary transition"
            >
              View all
            </button>
          </div>

          {/* Closely packed schedule items as one component */}
          <div className="bg-card-bg rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {MOCK_SCHEDULE.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 p-4",
                  index !== MOCK_SCHEDULE.length - 1 && "border-b border-gray-100"
                )}
              >
                {getScheduleIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-text-muted">
                      {item.time}
                    </span>
                    {getStatusIcon(item.status)}
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary">{item.subtitle}</p>
                  {item.type === 'activity' && (
                    <p className="text-xs text-accent-green font-medium mt-1">
                      30 min • Outdoor
                    </p>
                  )}
                </div>
                <ChevronRight size={20} className="text-text-muted shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Health Summary */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">
              Health Summary
            </h2>
            <button className="text-text-secondary text-sm font-medium hover:text-text-primary transition">
              View all
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Sleep Card */}
            <div className="bg-card-purple rounded-2xl p-4 shadow-sm border border-indigo-100">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center mb-3">
                <Moon size={18} className="text-white" />
              </div>
              <p className="text-xs text-text-secondary mb-1">Sleep</p>
              <p className="text-lg font-bold text-text-primary">7h 30m</p>
              <p className="text-xs text-indigo-600 font-medium mt-1">Good</p>
            </div>

            {/* Steps Card */}
            <div className="bg-card-green rounded-2xl p-4 shadow-sm border border-green-100">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-3">
                <Footprints size={18} className="text-white" />
              </div>
              <p className="text-xs text-text-secondary mb-1">Steps</p>
              <p className="text-lg font-bold text-text-primary">6,432</p>
              <p className="text-xs text-green-600 font-medium mt-1">
                Goal: 10,000
              </p>
            </div>

            {/* Mood Card */}
            <div className="bg-card-teal rounded-2xl p-4 shadow-sm border border-teal-100">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center mb-3">
                <Smile size={18} className="text-white" />
              </div>
              <p className="text-xs text-text-secondary mb-1">Mood</p>
              <p className="text-lg font-bold text-text-primary">Good</p>
              <p className="text-xs text-teal-600 font-medium mt-1">😊</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {careActivity.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Upcoming Care
            </h2>
            <div className="space-y-3">
              {careActivity.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-accent-orange uppercase tracking-wider">
                        {activity.kind}
                      </p>
                      <h3 className="font-semibold text-text-primary mt-1">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {activity.provider}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-1 rounded-full',
                          activity.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {activity.status}
                      </span>
                    </div>
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

