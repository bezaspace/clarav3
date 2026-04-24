import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Apple, Activity, Zap } from 'lucide-react';
import { api } from '@/src/lib/api';
import type { DietData } from '@/src/lib/types';

const fallback: DietData = {
  historyData: [],
  sattvicGoal: 0,
};

export default function Diet() {
  const [view, setView] = useState<'macros' | 'micros'>('macros');
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<DietData>(fallback);

  useEffect(() => {
    let active = true;
    api
      .progressDiet()
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

  const { historyData, sattvicGoal } = payload;

  if (loading) {
    return <div className="text-sm text-stone-500">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-12 p-6 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-serif text-stone-100">Monthly Consumption History</h3>
              <p className="text-xs text-stone-500">Tracking your nutrition trends over the last 30 days</p>
            </div>

            <div className="flex bg-ayu-bg p-1 rounded-lg border border-ayu-border">
              <button
                onClick={() => setView('macros')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  view === 'macros'
                    ? 'bg-ayu-green text-white shadow-lg'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <Activity size={14} />
                Macros
              </button>
              <button
                onClick={() => setView('micros')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  view === 'micros'
                    ? 'bg-ayu-saffron text-white shadow-lg'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                <Zap size={14} />
                Micros
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
                  label={{ value: view === 'macros' ? 'Grams (g)' : 'Value', angle: -90, position: 'insideLeft', style: { fill: '#555', fontSize: '10px' } }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #1F1F1F', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />

                {view === 'macros' ? (
                  <>
                    <Line type="monotone" dataKey="carbs" stroke="#F4A261" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Carbs (g)" />
                    <Line type="monotone" dataKey="protein" stroke="#3D6B35" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Protein (g)" />
                    <Line type="monotone" dataKey="fats" stroke="#8D6E63" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Fats (g)" />
                  </>
                ) : (
                  <>
                    <Line type="monotone" dataKey="fiber" stroke="#E08E45" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Fiber (g)" />
                    <Line type="monotone" dataKey="vitamins" stroke="#4a90e2" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Vitamins (score)" />
                    <Line type="monotone" dataKey="minerals" stroke="#9b59b6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Minerals (score)" />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="bg-ayu-saffron/10 border-ayu-saffron/20 text-ayu-saffron">
        <div className="flex justify-between items-center px-2">
          <div className="flex gap-3 items-center">
            <Apple size={20} />
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide">Sattvic Goal</h4>
              <p className="text-xs opacity-70">Focus on fresh, living foods today.</p>
            </div>
          </div>
          <div className="text-2xl font-serif font-bold">{sattvicGoal}</div>
        </div>
      </Card>
    </div>
  );
}
