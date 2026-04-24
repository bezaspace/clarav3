import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Dumbbell, Timer, Trophy } from 'lucide-react';
import { api } from '@/src/lib/api';
import type { WorkoutData, WorkoutDataItem, WorkoutSession, WorkoutMilestone } from '@/src/lib/types';

const fallbackData: WorkoutData = {
  workoutData: [],
  sessions: [],
  milestone: { title: 'No milestone yet', achievedDate: 'Pending' },
};

const ensureWorkoutData = (item: unknown): WorkoutDataItem[] => {
  if (!Array.isArray(item)) {
    return [];
  }
  return item
    .map((entry) => {
      if (entry == null || typeof entry !== 'object') {
        return null;
      }
      const candidate = entry as Partial<WorkoutDataItem>;
      if (
        typeof candidate.subject !== 'string' ||
        typeof candidate.A !== 'number' ||
        typeof candidate.fullMark !== 'number'
      ) {
        return null;
      }
      return {
        subject: candidate.subject,
        A: candidate.A,
        fullMark: candidate.fullMark,
      };
    })
    .filter((row): row is WorkoutDataItem => row !== null);
};

const ensureSessions = (item: unknown): WorkoutSession[] => {
  if (!Array.isArray(item)) {
    return [];
  }
  return item
    .map((entry) => {
      if (entry == null || typeof entry !== 'object') {
        return null;
      }
      const candidate = entry as Partial<WorkoutSession>;
      if (
        typeof candidate.type !== 'string' ||
        typeof candidate.duration !== 'string' ||
        typeof candidate.intensity !== 'string' ||
        typeof candidate.cals !== 'string'
      ) {
        return null;
      }
      return candidate as WorkoutSession;
    })
    .filter((entry): entry is WorkoutSession => entry !== null);
};

const ensureMilestone = (item: unknown): WorkoutMilestone => {
  if (item == null || typeof item !== 'object') {
    return fallbackData.milestone;
  }
  const candidate = item as Partial<WorkoutMilestone>;
  return {
    title: typeof candidate.title === 'string' ? candidate.title : fallbackData.milestone.title,
    achievedDate:
      typeof candidate.achievedDate === 'string'
        ? candidate.achievedDate
        : fallbackData.milestone.achievedDate,
  };
};

export default function Workouts() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<WorkoutData>(fallbackData);

  useEffect(() => {
    let active = true;
    api
      .progressWorkouts()
      .then((data) => {
        if (!active) {
          return;
        }
        setPayload({
          workoutData: ensureWorkoutData(data.workoutData as unknown),
          sessions: ensureSessions(data.sessions as unknown),
          milestone: ensureMilestone(data.milestone as unknown),
        });
      })
      .catch(() => {
        if (active) {
          setPayload(fallbackData);
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

  if (loading) {
    return <div className="text-sm text-stone-500">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="grid grid-cols-1 gap-6">
        <Card className="min-h-[350px] flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg">Fitness Profile</h3>
            <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Holistic Balance</span>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={payload.workoutData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="Fitness"
                  dataKey="A"
                  stroke="#3D6B35"
                  fill="#3D6B35"
                  fillOpacity={0.5}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #222', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-3">
          <h3 className="text-xl">Recent Sessions</h3>
          {payload.sessions.map((session, i) => (
            <Card
              key={session.type + i}
              className="flex justify-between items-center py-3 border-ayu-border hover:border-ayu-green transition-colors"
            >
              <div className="flex gap-3 items-center">
                <div className="bg-stone-900 p-2 rounded-xl text-stone-400">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-stone-200 text-sm">{session.type}</h4>
                  <div className="flex gap-3 text-[10px] text-stone-600 font-bold uppercase">
                    <span className="flex items-center gap-0.5"><Timer size={10} /> {session.duration}</span>
                    <span>{session.intensity}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-serif text-ayu-green">{session.cals}</span>
                <p className="text-[8px] text-stone-600 font-bold uppercase">Burned</p>
              </div>
            </Card>
          ))}
          {payload.sessions.length === 0 && (
            <Card className="p-4 text-sm text-stone-500">No workout sessions yet.</Card>
          )}
        </div>

        <div className="md:col-span-4 self-start">
          <Card className="bg-ayu-green/10 border-ayu-green/20 text-ayu-green flex flex-col items-center text-center py-6">
            <div className="bg-ayu-green text-stone-100 p-3 rounded-2xl mb-3 shadow-lg shadow-ayu-green/20">
              <Trophy size={24} />
            </div>
            <p className="text-[9px] uppercase font-bold tracking-widest opacity-60">Personal Best</p>
            <h4 className="text-xl font-bold text-stone-200 mt-1">{payload.milestone.title}</h4>
            <p className="text-[11px] text-stone-500 mt-2">
              Achieved on {payload.milestone.achievedDate}.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
