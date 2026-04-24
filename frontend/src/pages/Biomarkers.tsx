import { useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { 
  Activity, Target, Beaker, TrendingDown, TrendingUp, Minus, 
  Info, AlertTriangle, CheckCircle2, ShieldCheck, HeartPulse,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Biomarker {
  id: string;
  name: string;
  category: 'Metabolic' | 'Nutrients' | 'Inflammation' | 'Hormones' | 'Physiology';
  baseline: number;
  goal: number;
  unit: string;
  status: 'normal' | 'concerning' | 'critical';
  description: string;
}

const biomarkers: Biomarker[] = [
  { id: '1', name: 'HbA1c', category: 'Metabolic', baseline: 6.2, goal: 5.4, unit: '%', status: 'concerning', description: 'Average blood sugar over 3 months.' },
  { id: '2', name: 'Vitamin D3', category: 'Nutrients', baseline: 18.5, goal: 50.0, unit: 'ng/mL', status: 'critical', description: 'Bone health and immunity.' },
  { id: '3', name: 'Vitamin B12', category: 'Nutrients', baseline: 210, goal: 500, unit: 'pg/mL', status: 'concerning', description: 'Nerve function and energy.' },
  { id: '4', name: 'Total Cholesterol', category: 'Metabolic', baseline: 240, goal: 190, unit: 'mg/dL', status: 'concerning', description: 'Overall lipid levels.' },
  { id: '5', name: 'HDL Cholesterol', category: 'Metabolic', baseline: 38, goal: 55, unit: 'mg/dL', status: 'concerning', description: '"Good" cholesterol.' },
  { id: '6', name: 'LDL Cholesterol', category: 'Metabolic', baseline: 160, goal: 110, unit: 'mg/dL', status: 'concerning', description: '"Bad" cholesterol.' },
  { id: '7', name: 'Triglycerides', category: 'Metabolic', baseline: 185, goal: 140, unit: 'mg/dL', status: 'concerning', description: 'Blood fats.' },
  { id: '8', name: 'hs-CRP', category: 'Inflammation', baseline: 3.2, goal: 1.0, unit: 'mg/L', status: 'critical', description: 'Systemic inflammation marker.' },
  { id: '9', name: 'Ferritin', category: 'Nutrients', baseline: 25, goal: 80, unit: 'ng/mL', status: 'concerning', description: 'Iron stores.' },
  { id: '10', name: 'TSH', category: 'Hormones', baseline: 4.8, goal: 2.5, unit: 'mIU/L', status: 'concerning', description: 'Thyroid function.' },
  { id: '11', name: 'Morning Cortisol', category: 'Hormones', baseline: 22, goal: 15, unit: 'mcg/dL', status: 'concerning', description: 'Stress hormone levels.' },
  { id: '12', name: 'Fasting Insulin', category: 'Metabolic', baseline: 15.0, goal: 5.0, unit: 'μIU/mL', status: 'concerning', description: 'Insulin sensitivity.' },
  { id: '13', name: 'Hemoglobin', category: 'Nutrients', baseline: 12.5, goal: 14.5, unit: 'g/dL', status: 'normal', description: 'Oxygen transport.' },
  { id: '14', name: 'Magnesium', category: 'Nutrients', baseline: 1.7, goal: 2.2, unit: 'mg/dL', status: 'concerning', description: 'Muscle and nerve function.' },
  { id: '15', name: 'Omega-3 Index', category: 'Nutrients', baseline: 3.5, goal: 8.0, unit: '%', status: 'critical', description: 'Cardiovascular protection.' },
  { id: '16', name: 'VO2 Max', category: 'Physiology', baseline: 32, goal: 40, unit: 'mL/kg/min', status: 'concerning', description: 'Aerobic fitness capacity.' },
  { id: '17', name: 'Resting Heart Rate', category: 'Physiology', baseline: 78, goal: 62, unit: 'BPM', status: 'concerning', description: 'Cardiovascular efficiency.' },
  { id: '18', name: 'HRV', category: 'Physiology', baseline: 25, goal: 45, unit: 'ms', status: 'concerning', description: 'Resilience to stress.' },
  { id: '19', name: 'Bone T-Score', category: 'Physiology', baseline: -1.8, goal: -1.0, unit: '', status: 'concerning', description: 'Bone density comparison.' },
  { id: '20', name: 'ALT (Liver)', category: 'Metabolic', baseline: 45, goal: 25, unit: 'U/L', status: 'concerning', description: 'Liver health indicator.' },
];

export default function Biomarkers() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-ayu-green" size={32} />
          <h2 className="text-3xl font-serif text-stone-100">Biological Optimization</h2>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-ayu-green/5 border-ayu-green/20">
          <div className="flex flex-col gap-1">
             <Target className="text-ayu-green mb-2" size={24} />
             <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Optimization Goal</p>
             <p className="text-2xl font-bold text-stone-100">Phase 1</p>
             <p className="text-xs text-ayu-green">Metabolic Health Focus</p>
          </div>
        </Card>
        
        <Card>
          <div className="flex flex-col gap-1">
             <Beaker className="text-ayu-saffron mb-2" size={24} />
             <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Current Baseline</p>
             <p className="text-2xl font-bold text-stone-100 italic font-serif">April 2026</p>
             <p className="text-xs text-stone-500">20 Metrics Analyzed</p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-1">
             <Activity className="text-blue-400 mb-2" size={24} />
             <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Next Re-test</p>
             <p className="text-2xl font-bold text-stone-100 italic font-serif">July 2026</p>
             <p className="text-xs text-stone-500">92 Days Remaining</p>
          </div>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20">
          <div className="flex flex-col gap-1">
             <AlertTriangle className="text-red-500 mb-2" size={24} />
             <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Priority Risks</p>
             <p className="text-2xl font-bold text-stone-100">03</p>
             <p className="text-xs text-red-400">Inflammation & Vit D</p>
          </div>
        </Card>
      </div>

      {/* Biomarkers Accordion List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2 mb-2">
           <h3 className="text-lg font-serif text-stone-200">The 20 Optimization Markers</h3>
           <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest text-stone-500">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-ayu-saffron"></div> Baseline</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-ayu-green"></div> 3M Aim</div>
           </div>
        </div>

        {biomarkers.map((bm) => (
          <Card 
            key={bm.id} 
            className={cn(
              "p-0 overflow-hidden transition-all duration-300 border-ayu-border",
              expandedId === bm.id ? "ring-1 ring-ayu-green/30" : "hover:border-stone-700"
            )}
          >
            <button 
              onClick={() => toggleAccordion(bm.id)}
              className="w-full text-left px-4 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn(
                  "p-2 rounded-xl shrink-0",
                  bm.status === 'normal' ? "bg-ayu-green/10 text-ayu-green" : 
                  bm.status === 'concerning' ? "bg-ayu-saffron/10 text-ayu-saffron" : 
                  "bg-red-500/10 text-red-400"
                )}>
                  {bm.status === 'normal' ? <CheckCircle2 size={18} /> : 
                   bm.status === 'concerning' ? <AlertTriangle size={18} /> : 
                   <HeartPulse size={18} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-sm font-bold text-stone-200 truncate">{bm.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded border border-stone-800 text-stone-600 font-bold uppercase shrink-0">
                      {bm.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <span className="text-ayu-saffron font-bold">{bm.baseline}</span>
                      <TrendingUp size={10} className="text-stone-700" />
                      <span className="text-ayu-green font-bold">{bm.goal}</span>
                      <span className="text-stone-600 ml-0.5">{bm.unit}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block w-24 h-1.5 bg-ayu-bg rounded-full overflow-hidden border border-ayu-border">
                  <div 
                    className="h-full bg-ayu-saffron opacity-50" 
                    style={{ width: '40%' }}
                  ></div>
                </div>
                {expandedId === bm.id ? <ChevronUp size={20} className="text-stone-600" /> : <ChevronDown size={20} className="text-stone-600" />}
              </div>
            </button>

            <AnimatePresence>
              {expandedId === bm.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-4 pb-5 pt-2 border-t border-ayu-border bg-ayu-bg/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div>
                        <p className="text-xs text-stone-400 italic mb-4 leading-relaxed">
                          {bm.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-ayu-bg/40 p-3 rounded-xl border border-ayu-border">
                            <p className="text-[9px] uppercase font-bold text-stone-500 mb-1">Baseline Value</p>
                            <p className="text-lg font-mono text-ayu-saffron font-bold tracking-tight">
                              {bm.baseline} <span className="text-[10px] opacity-40">{bm.unit}</span>
                            </p>
                          </div>
                          <div className="bg-ayu-bg/40 p-3 rounded-xl border border-ayu-border">
                            <p className="text-[9px] uppercase font-bold text-stone-500 mb-1">Target Optimization</p>
                            <p className="text-lg font-mono text-ayu-green font-bold tracking-tight">
                              {bm.goal} <span className="text-[10px] opacity-40">{bm.unit}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-ayu-bg/40 p-4 rounded-2xl border border-ayu-border flex flex-col items-center justify-center min-h-[120px]">
                        <p className="text-[10px] uppercase font-bold text-stone-500 mb-4 text-center">Gap Analysis</p>
                        <div className="w-full h-8 bg-ayu-bg rounded-lg overflow-hidden relative border border-ayu-border">
                          {/* Richer progress/gap visual */}
                          <div 
                            className="absolute inset-y-0 left-0 bg-ayu-saffron opacity-20" 
                            style={{ width: '40%' }}
                          ></div>
                          <div 
                            className="absolute inset-y-0 left-[40%] bg-ayu-green/10" 
                            style={{ width: '45%' }}
                          ></div>
                          <div 
                            className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-ayu-saffron shadow-[0_0_10px_rgba(224,142,69,0.5)]"
                          ></div>
                          <div 
                            className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-ayu-green shadow-[0_0_10px_rgba(61,107,53,0.5)]"
                          ></div>
                        </div>
                        <p className="text-[10px] text-stone-600 mt-3 text-center">
                          A {Math.abs(bm.baseline - bm.goal).toFixed(1)} {bm.unit} change required for peak cellular efficiency.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </div>
  );
}
