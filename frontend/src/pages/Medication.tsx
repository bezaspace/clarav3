import { Card } from '@/src/components/ui/Card';
import { Pill, Leaf, CheckCircle2, AlertCircle } from 'lucide-react';

const AdherenceHeatmap = () => {
  // Generate 56 days (8 full weeks) to create a perfect 7-row grid
  const today = new Date();
  const days = Array.from({ length: 56 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (55 - i));
    
    // 92% adherence means mostly level 4
    const rand = Math.random();
    let level = 4;
    // Lower level for older days optionally, but keep it mostly green
    if (rand < 0.05) level = 1; // Missed
    else if (rand < 0.1) level = 2; // Low
    else if (rand < 0.15) level = 3; // Good
    
    return {
      id: i,
      level,
      date: d.getDate(),
      month: d.getMonth(),
      monthName: d.toLocaleDateString('default', { month: 'short' }),
      fullDate: d.toLocaleDateString(),
    };
  });

  const weeks = Array.from({ length: 8 }, (_, i) => days.slice(i * 7, i * 7 + 7));

  const getColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-stone-100 dark:bg-stone-800'; // Empty/Missed
      case 2: return 'bg-ayu-green/30'; 
      case 3: return 'bg-ayu-green/60';
      case 4: return 'bg-ayu-green'; // Perfect
      default: return 'bg-stone-100 dark:bg-stone-800';
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
          {/* Day of week labels */}
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
          
          {/* Heatmap grid */}
          <div className="flex flex-col">
            {/* Months row */}
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
                <div key={i} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const TextColor = day.level >= 3 ? 'text-white' : 'text-stone-700 dark:text-stone-300';
                    return (
                      <div 
                        key={day.id} 
                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-medium leading-none ${getColor(day.level)} transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-ayu-green/50 cursor-pointer ${TextColor}`}
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

export default function Medication() {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-ayu-green/10 border-ayu-green/20 text-ayu-green py-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Adherence</p>
              <h3 className="text-3xl font-bold font-sans">92%</h3>
            </div>
            <div className="bg-ayu-green/20 p-2 rounded-lg">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-[11px] mt-1 opacity-80">12 day streak achieved.</p>
        </Card>
        
        <Card className="bg-orange-500/10 border-orange-500/20 text-orange-500 py-3">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Refill Alert</p>
              <h3 className="text-lg font-bold truncate max-w-[150px]">Ashwagandha</h3>
            </div>
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="text-[11px] mt-1 opacity-80">Refill needed in 4 days.</p>
        </Card>
      </div>

      <AdherenceHeatmap />
    </div>
  );
}
