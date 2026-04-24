import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Target,
  Beaker,
  TrendingDown,
  TrendingUp,
  Minus,
  Info,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/src/lib/api';
import type { Biomarker, BiomarkerData } from '@/src/lib/types';

const colorByStatus: Record<Biomarker['status'], string> = {
  normal: '#3D6B35',
  concerning: '#E08E45',
  critical: '#EF4444',
};

export default function Biomarkers() {
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [payload, setPayload] = useState<BiomarkerData>({
    biomarkers: [],
    summary: {},
  });

  useEffect(() => {
    let active = true;
    api
      .progressBiomarkers()
      .then((data) => {
        if (active) {
          setPayload(data);
        }
      })
      .catch(() => {
        if (active) {
          setPayload({ biomarkers: [], summary: {} });
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

  const { biomarkers, summary } = payload;
  const safeSummary = {
    title: summary.title || 'Biological Optimization',
    optimizationGoal: summary.optimizationGoal || 'Metabolic Health Focus',
    phase: summary.phase || 'Phase 1',
    currentBaselineLabel: summary.currentBaselineLabel || 'April 2026',
    metricsAnalyzed: summary.metricsAnalyzed || 0,
    nextRetest: summary.nextRetest || 'July 2026',
    daysRemaining: summary.daysRemaining || 0,
    priorityRisks: summary.priorityRisks || 0,
    priorityRisksLabel: summary.priorityRisksLabel || 'Review Required',
  };

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div className="text-sm text-stone-500">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-ayu-green" size={32} />
          <h2 className="text-3xl font-serif text-stone-100">{safeSummary.title}</h2>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-ayu-green/5 border-ayu-green/20">
          <div className="flex flex-col gap-1">
            <Target className="text-ayu-green mb-2" size={24} />
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
              Optimization Goal
            </p>
            <p className="text-2xl font-bold text-stone-100">{safeSummary.phase}</p>
            <p className="text-xs text-ayu-green">{safeSummary.optimizationGoal}</p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-1">
            <Beaker className="text-ayu-saffron mb-2" size={24} />
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
              Current Baseline
            </p>
            <p className="text-2xl font-bold text-stone-100 italic font-serif">
              {safeSummary.currentBaselineLabel}
            </p>
            <p className="text-xs text-stone-500">{safeSummary.metricsAnalyzed} Metrics Analyzed</p>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-1">
            <Activity className="text-blue-400 mb-2" size={24} />
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Next Re-test</p>
            <p className="text-2xl font-bold text-stone-100 italic font-serif">{safeSummary.nextRetest}</p>
            <p className="text-xs text-stone-500">{safeSummary.daysRemaining} Days Remaining</p>
          </div>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20">
          <div className="flex flex-col gap-1">
            <AlertTriangle className="text-red-500 mb-2" size={24} />
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Priority Risks</p>
            <p className="text-2xl font-bold text-stone-100">{safeSummary.priorityRisks}</p>
            <p className="text-xs text-red-400">{safeSummary.priorityRisksLabel}</p>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-2 mb-2">
          <h3 className="text-lg font-serif text-stone-200">The Optimization Markers</h3>
          <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest text-stone-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-ayu-saffron"></div> Baseline
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-ayu-green"></div> 3M Aim
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Card className="p-4 border-ayu-border">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={biomarkers}>
                  <CartesianGrid stroke="#222" />
                  <XAxis dataKey="name" stroke="#555" tickLine={false} axisLine={false} />
                  <YAxis stroke="#555" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141414',
                      border: '1px solid #222',
                      borderRadius: '8px',
                    }}
                  />
                  <ReferenceLine y={0} stroke="#444" />
                  <Bar dataKey="baseline" name="Current">
                    {biomarkers.map((entry) => (
                      <Cell key={entry.id} fill={colorByStatus[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          {biomarkers.length === 0 && (
            <Card>
              <div className="p-4 text-sm text-stone-500">No biomarker data available.</div>
            </Card>
          )}
        </div>

        {biomarkers.map((bm) => (
          <Card
            key={bm.id}
            className={cn(
              'p-0 overflow-hidden transition-all duration-300 border-ayu-border',
              expandedId === bm.id ? 'ring-1 ring-ayu-green/30' : 'hover:border-stone-700',
            )}
          >
            <button
              onClick={() => toggleAccordion(bm.id)}
              className="w-full text-left px-4 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={cn(
                    'p-2 rounded-xl shrink-0',
                    bm.status === 'normal'
                      ? 'bg-ayu-green/10 text-ayu-green'
                      : bm.status === 'concerning'
                        ? 'bg-ayu-saffron/10 text-ayu-saffron'
                        : 'bg-red-500/10 text-red-400',
                  )}
                >
                  {bm.status === 'normal' ? <CheckCircle2 size={18} /> : bm.status === 'concerning' ? <AlertTriangle size={18} /> : <Info size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-stone-200 font-bold text-sm">{bm.name}</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">{bm.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'text-[9px] uppercase font-bold tracking-wider rounded px-2 py-0.5 border',
                        bm.status === 'normal'
                          ? 'text-ayu-green bg-ayu-green/10 border-ayu-green/20'
                          : bm.status === 'concerning'
                            ? 'text-ayu-saffron bg-ayu-saffron/10 border-ayu-saffron/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20',
                      )}
                    >
                      {bm.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center text-xs text-stone-400 gap-2">
                  {bm.baseline > bm.goal ? <TrendingDown size={14} /> : bm.baseline < bm.goal ? <TrendingUp size={14} /> : <Minus size={14} />}
                  <span className="hidden sm:inline">gap</span>
                </div>
                {expandedId === bm.id ? (
                  <ChevronUp size={20} className="text-stone-600" />
                ) : (
                  <ChevronDown size={20} className="text-stone-600" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {expandedId === bm.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
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
                          <div className="absolute inset-y-0 left-0 bg-ayu-saffron opacity-20" style={{ width: '40%' }}></div>
                          <div className="absolute inset-y-0 left-[40%] bg-ayu-green/10" style={{ width: '45%' }}></div>
                          <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-ayu-saffron shadow-[0_0_10px_rgba(224,142,69,0.5)]"></div>
                          <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-ayu-green shadow-[0_0_10px_rgba(61,107,53,0.5)]"></div>
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
