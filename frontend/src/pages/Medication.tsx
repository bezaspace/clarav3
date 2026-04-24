import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Pill, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/src/lib/api';
import type { AdherenceDay, MedicationData } from '@/src/lib/types';

interface AdherenceHeatmapProps {
  rows: AdherenceDay[];
}

const AdherenceHeatmap = ({ rows }: AdherenceHeatmapProps) => {
  const days = rows.length ? rows : [];
  const weeks = days.length ? Array.from({ length: Math.ceil(days.length / 7) }, (_, i) =>
    days.slice(i * 7, i * 7 + 7)
  ) : [];

  const getColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-stone-100 dark:bg-stone-800';
      case 2:
        return 'bg-ayu-green/30';
      case 3:
        return 'bg-ayu-green/60';
      case 4:
        return 'bg-ayu-green';
      default:
        return 'bg-stone-100 dark:bg-stone-800';
    }
  };

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div>
        <h3 className="font-bold font-serif text-lg">Adherence History</h3>
        <p className="text-xs text-stone-500">Your daily supplement intake over the last 8 weeks.</p>
      </div>

      <div className="flex overflow-x-auto pb-2">
        <div className="flex gap-2">
          <div className="flex flex-col pt-5">
            <div className="grid grid-rows-7 gap-1 text-[10px] text-stone-400 font-medium py-0.5">
              <div className="flex items-center h-6">Mon</div>
              <div className="flex items-center h-6"></div>
              <div className="flex items-center h-6">Wed</div>
              <div className="flex items-center h-6"></div>
              <div className="flex items-center h-6">Fri</div>
              <div className="flex items-center h-6"></div>
              <div className="flex items-center h-6">Sun</div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex text-[10px] text-stone-400 font-medium mb-1 h-4">
              {weeks.map((week, i) => {
                const firstDay = week[0];
                const prevWeek = i > 0 ? weeks[i - 1] : null;
                const showMonth = i === 0 || firstDay.month !== prevWeek![0].month;

                return (
                  <div key={i} className="w-6 shrink-0" style={{ marginRight: '0.25rem' }}>
                    {showMonth ? firstDay.monthName : ''}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-1 pr-2">
              {weeks.map((week, i) => (
                <div key={`${i}-${week.length}`} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const textColor = day.level >= 3 ? 'text-white' : 'text-stone-700 dark:text-stone-300';
                    return (
                      <div
                        key={day.id}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-medium leading-none ${getColor(
                          day.level,
                        )} transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-ayu-green/50 cursor-pointer ${textColor}`}
                        title={`${day.fullDate}: Level ${day.level}`}
                      >
                        {day.date}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-[10px] text-stone-500 mt-2">
        <span>Less</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-[2px] bg-stone-100 dark:bg-stone-800"></div>
          <div className="w-3 h-3 rounded-[2px] bg-ayu-green/30"></div>
          <div className="w-3 h-3 rounded-[2px] bg-ayu-green/60"></div>
          <div className="w-3 h-3 rounded-[2px] bg-ayu-green"></div>
        </div>
        <span>More</span>
      </div>
    </Card>
  );
};

const fallback: MedicationData = {
  overview: {
    adherence: '0%',
    streak: '0 days',
    refill: '—',
    refillText: 'No refill alert.',
  },
  adherenceRows: [],
};

export default function Medication() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<MedicationData>(fallback);

  useEffect(() => {
    let active = true;
    api
      .progressMedication()
      .then((data) => {
        if (!active) return;
        setPayload(data);
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

  const rows: AdherenceDay[] = payload.adherenceRows || [];

  if (loading) {
    return <div className="text-sm text-stone-500">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-ayu-green/10 border-ayu-green/20 text-ayu-green py-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Adherence</p>
              <h3 className="text-3xl font-bold font-sans">{payload.overview.adherence}</h3>
            </div>
            <div className="bg-ayu-green/20 p-2 rounded-lg">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-[11px] mt-1 opacity-80">{payload.overview.streak} streak achieved.</p>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/20 text-orange-500 py-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Refill Alert</p>
              <h3 className="text-lg font-bold truncate max-w-[150px]">{payload.overview.refillText}</h3>
            </div>
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="text-[11px] mt-1 opacity-80">Refill needed in {payload.overview.refill}.</p>
        </Card>
      </div>

      {rows.length > 0 && <AdherenceHeatmap rows={rows} />}
    </div>
  );
}
