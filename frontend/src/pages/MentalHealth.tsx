import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Smile, Wind, Moon, Brain, Bed, BookOpen, Sparkles, Pencil } from 'lucide-react';
import { api } from '@/src/lib/api';
import type { MentalData } from '@/src/lib/types';

const fallback: MentalData = {
  historyData: [],
  adherenceData: [],
  quickStats: {
    zenStreak: '0 Days',
    avgSleep: '0 Hrs',
    moodIndex: 'N/A',
  },
};

export default function MentalHealth() {
  const [view, setView] = useState<'mental' | 'sleep'>('mental');
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<MentalData>(fallback);

  useEffect(() => {
    let active = true;
    api
      .progressMental()
      .then((data) => {
        if (active) {
          setPayload(data);
        }
      })
      .catch(() => {
        if (active) {
          setPayload(fallback);
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

  const { historyData, adherenceData, quickStats } = payload;

  if (loading) {
    return <div className="text-sm text-stone-500">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 py-6">
          <div className="bg-ayu-green/20 text-ayu-green p-3 rounded-xl">
            <Wind size={24} />
          </div>
          <div>
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Zen Streak</p>
            <p className="text-2xl font-bold text-stone-100 font-serif">{quickStats.zenStreak}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-6">
          <div className="bg-purple-500/20 text-purple-400 p-3 rounded-xl">
            <Moon size={24} />
          </div>
          <div>
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Avg. Sleep</p>
            <p className="text-2xl font-bold text-stone-100 font-serif">{quickStats.avgSleep}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-6">
          <div className="bg-ayu-saffron/20 text-ayu-saffron p-3 rounded-xl">
            <Smile size={24} />
          </div>
          <div>
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Mood Index</p>
            <p className="text-2xl font-bold text-stone-100 font-serif">{quickStats.moodIndex}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-serif text-stone-100 uppercase tracking-tight">Wellness History</h3>
              <p className="text-xs text-stone-500 italic">
                Monthly overview of your {view === 'mental' ? 'mental well-being' : 'sleep quality'}
              </p>
            </div>

            <div className="flex bg-ayu-bg p-1 rounded-lg border border-ayu-border">
              <button
                onClick={() => setView('mental')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  view === 'mental'
                    ? 'bg-ayu-green text-white shadow-lg'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <Brain size={14} />
                Focus
              </button>
              <button
                onClick={() => setView('sleep')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  view === 'sleep'
                    ? 'bg-ayu-saffron text-white shadow-lg'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <Bed size={14} />
                Sleep
              </button>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#555"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  stroke="#555"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={view === 'mental' ? [0, 10] : [0, 10]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #1F1F1F', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />

                {view === 'mental' ? (
                  <Line
                    type="monotone"
                    dataKey="moodScore"
                    stroke="#3D6B35"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="Mental Health Score"
                  />
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="sleepHours"
                      stroke="#E08E45"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                      name="Total Sleep (Hrs)"
                    />
                    <Line
                      type="monotone"
                      dataKey="deepSleepHours"
                      stroke="#4a90e2"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Deep Sleep (Hrs)"
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-serif text-stone-100 uppercase tracking-tight">Routine Adherence</h3>
            <p className="text-xs text-stone-500 italic">Consistency across mindfulness pillars</p>
          </div>

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={adherenceData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Adherence"
                  dataKey="A"
                  stroke="#E08E45"
                  fill="#E08E45"
                  fillOpacity={0.5}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #1F1F1F', borderRadius: '12px', fontSize: '10px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-2 mt-4">
            <div className="flex flex-col items-center gap-1">
              <div className="p-1.5 rounded-lg bg-ayu-green/10 text-ayu-green">
                <Wind size={12} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="p-1.5 rounded-lg bg-ayu-saffron/10 text-ayu-saffron">
                <Sparkles size={12} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Pencil size={12} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Moon size={12} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="p-1.5 rounded-lg bg-stone-500/10 text-stone-400">
                <BookOpen size={12} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
