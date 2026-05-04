import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import {
  ChevronLeft,
  Search,
  Bell,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Beaker,
  AlertCircle,
  CheckCircle2,
  Info,
  Droplets,
  Heart,
  Zap,
  Brain,
  Bone,
  Thermometer,
  Gauge,
  Microscope,
  FlaskConical,
  Dna,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';

// Extended biomarker with last measured date
interface BiomarkerDetail {
  id: string;
  name: string;
  category: 'Metabolic' | 'Nutrients' | 'Inflammation' | 'Hormones' | 'Physiology' | 'Cardiovascular' | 'Liver' | 'Kidney';
  lastValue: number;
  targetValue: number;
  unit: string;
  status: 'optimal' | 'normal' | 'borderline' | 'concerning' | 'critical';
  lastMeasured: string; // ISO date string
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  trend: 'up' | 'down' | 'stable';
}

// Mock data for 20 important biomarkers
const BIOMARKERS_DATA: BiomarkerDetail[] = [
  {
    id: '1',
    name: 'HbA1c',
    category: 'Metabolic',
    lastValue: 5.4,
    targetValue: 5.0,
    unit: '%',
    status: 'normal',
    lastMeasured: '2026-04-15',
    description: '3-month average blood sugar. Key indicator for diabetes risk.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '2',
    name: 'Fasting Glucose',
    category: 'Metabolic',
    lastValue: 92,
    targetValue: 85,
    unit: 'mg/dL',
    status: 'normal',
    lastMeasured: '2026-04-15',
    description: 'Blood sugar after 8+ hours of fasting.',
    frequency: 'quarterly',
    trend: 'down',
  },
  {
    id: '3',
    name: 'Total Cholesterol',
    category: 'Cardiovascular',
    lastValue: 185,
    targetValue: 180,
    unit: 'mg/dL',
    status: 'optimal',
    lastMeasured: '2026-04-15',
    description: 'Sum of all cholesterol types. Lower is generally better.',
    frequency: 'quarterly',
    trend: 'down',
  },
  {
    id: '4',
    name: 'LDL Cholesterol',
    category: 'Cardiovascular',
    lastValue: 110,
    targetValue: 100,
    unit: 'mg/dL',
    status: 'borderline',
    lastMeasured: '2026-04-15',
    description: '"Bad" cholesterol. High levels increase heart disease risk.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '5',
    name: 'HDL Cholesterol',
    category: 'Cardiovascular',
    lastValue: 55,
    targetValue: 60,
    unit: 'mg/dL',
    status: 'normal',
    lastMeasured: '2026-04-15',
    description: '"Good" cholesterol. Higher levels protect heart health.',
    frequency: 'quarterly',
    trend: 'up',
  },
  {
    id: '6',
    name: 'Triglycerides',
    category: 'Cardiovascular',
    lastValue: 95,
    targetValue: 100,
    unit: 'mg/dL',
    status: 'optimal',
    lastMeasured: '2026-04-15',
    description: 'Blood fat levels. Elevated with high sugar/carb intake.',
    frequency: 'quarterly',
    trend: 'down',
  },
  {
    id: '7',
    name: 'Vitamin D',
    category: 'Nutrients',
    lastValue: 32,
    targetValue: 50,
    unit: 'ng/mL',
    status: 'concerning',
    lastMeasured: '2026-04-15',
    description: 'Essential for bone health, immunity, and mood regulation.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '8',
    name: 'Vitamin B12',
    category: 'Nutrients',
    lastValue: 450,
    targetValue: 400,
    unit: 'pg/mL',
    status: 'optimal',
    lastMeasured: '2026-04-15',
    description: 'Critical for nerve function and red blood cell formation.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '9',
    name: 'Iron (Ferritin)',
    category: 'Nutrients',
    lastValue: 85,
    targetValue: 100,
    unit: 'ng/mL',
    status: 'normal',
    lastMeasured: '2026-04-15',
    description: 'Iron storage protein. Low levels indicate iron deficiency.',
    frequency: 'quarterly',
    trend: 'up',
  },
  {
    id: '10',
    name: 'C-Reactive Protein',
    category: 'Inflammation',
    lastValue: 2.8,
    targetValue: 1.0,
    unit: 'mg/L',
    status: 'borderline',
    lastMeasured: '2026-04-15',
    description: 'Marker of systemic inflammation. Lower is better.',
    frequency: 'quarterly',
    trend: 'down',
  },
  {
    id: '11',
    name: 'Homocysteine',
    category: 'Inflammation',
    lastValue: 9.5,
    targetValue: 8.0,
    unit: 'μmol/L',
    status: 'normal',
    lastMeasured: '2026-04-15',
    description: 'Linked to heart disease and cognitive decline when elevated.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '12',
    name: 'Thyroid (TSH)',
    category: 'Hormones',
    lastValue: 2.2,
    targetValue: 2.0,
    unit: 'mIU/L',
    status: 'optimal',
    lastMeasured: '2026-04-15',
    description: 'Thyroid stimulating hormone. Controls metabolism.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '13',
    name: 'Testosterone',
    category: 'Hormones',
    lastValue: 680,
    targetValue: 700,
    unit: 'ng/dL',
    status: 'normal',
    lastMeasured: '2026-04-15',
    description: 'Primary male hormone. Affects energy, muscle, and mood.',
    frequency: 'quarterly',
    trend: 'up',
  },
  {
    id: '14',
    name: 'Cortisol',
    category: 'Hormones',
    lastValue: 14,
    targetValue: 12,
    unit: 'μg/dL',
    status: 'normal',
    lastMeasured: '2026-04-15',
    description: 'Stress hormone. Chronic elevation affects health negatively.',
    frequency: 'quarterly',
    trend: 'down',
  },
  {
    id: '15',
    name: 'eGFR',
    category: 'Kidney',
    lastValue: 95,
    targetValue: 90,
    unit: 'mL/min',
    status: 'optimal',
    lastMeasured: '2026-04-15',
    description: 'Estimated glomerular filtration rate. Kidney function marker.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '16',
    name: 'Blood Urea Nitrogen',
    category: 'Kidney',
    lastValue: 16,
    targetValue: 15,
    unit: 'mg/dL',
    status: 'normal',
    lastMeasured: '2026-04-15',
    description: 'Waste product filtered by kidneys.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '17',
    name: 'ALT',
    category: 'Liver',
    lastValue: 28,
    targetValue: 30,
    unit: 'U/L',
    status: 'optimal',
    lastMeasured: '2026-04-15',
    description: 'Liver enzyme. Elevated levels may indicate liver stress.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '18',
    name: 'AST',
    category: 'Liver',
    lastValue: 24,
    targetValue: 25,
    unit: 'U/L',
    status: 'optimal',
    lastMeasured: '2026-04-15',
    description: 'Liver and muscle enzyme. Elevated with liver damage.',
    frequency: 'quarterly',
    trend: 'stable',
  },
  {
    id: '19',
    name: 'Resting Heart Rate',
    category: 'Physiology',
    lastValue: 64,
    targetValue: 60,
    unit: 'bpm',
    status: 'normal',
    lastMeasured: '2026-05-01',
    description: 'Heart beats per minute at rest. Lower indicates better fitness.',
    frequency: 'daily',
    trend: 'down',
  },
  {
    id: '20',
    name: 'Blood Pressure',
    category: 'Physiology',
    lastValue: 118,
    targetValue: 120,
    unit: '/78 mmHg',
    status: 'optimal',
    lastMeasured: '2026-05-02',
    description: 'Systolic/diastolic pressure. Key cardiovascular health marker.',
    frequency: 'daily',
    trend: 'stable',
  },
];

const CATEGORIES = ['All', 'Metabolic', 'Cardiovascular', 'Nutrients', 'Inflammation', 'Hormones', 'Liver', 'Kidney', 'Physiology'] as const;

type Category = typeof CATEGORIES[number];

const statusConfig = {
  optimal: { color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', icon: CheckCircle2, label: 'Optimal' },
  normal: { color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100', icon: CheckCircle2, label: 'Normal' },
  borderline: { color: 'bg-amber-400', textColor: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', icon: Info, label: 'Borderline' },
  concerning: { color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-100', icon: AlertCircle, label: 'Concerning' },
  critical: { color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-100', icon: AlertCircle, label: 'Critical' },
};

const categoryIcons: Record<string, React.ElementType> = {
  Metabolic: FlaskConical,
  Cardiovascular: Heart,
  Nutrients: Dna,
  Inflammation: Microscope,
  Hormones: Zap,
  Liver: Beaker,
  Kidney: Droplets,
  Physiology: Activity,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date('2026-05-04'); // Current date in app
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDifference(biomarker: BiomarkerDetail): { value: number; text: string; direction: 'above' | 'below' | 'at' } {
  const diff = biomarker.lastValue - biomarker.targetValue;
  const absDiff = Math.abs(diff);
  
  if (Math.abs(diff) < 0.01 * biomarker.targetValue) {
    return { value: 0, text: 'On target', direction: 'at' };
  }
  
  return {
    value: absDiff,
    text: `${absDiff.toFixed(biomarker.lastValue < 10 ? 1 : 0)} ${biomarker.unit}`,
    direction: diff > 0 ? 'above' : 'below',
  };
}

export default function BiomarkersList() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredBiomarkers = useMemo(() => {
    return BIOMARKERS_DATA.filter((b) => {
      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           b.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    const optimal = BIOMARKERS_DATA.filter(b => b.status === 'optimal').length;
    const normal = BIOMARKERS_DATA.filter(b => b.status === 'normal').length;
    const borderline = BIOMARKERS_DATA.filter(b => b.status === 'borderline').length;
    const concerning = BIOMARKERS_DATA.filter(b => b.status === 'concerning' || b.status === 'critical').length;
    const improving = BIOMARKERS_DATA.filter(b => b.trend === 'up' && (b.status === 'normal' || b.status === 'optimal')).length;
    
    return { optimal, normal, borderline, concerning, improving };
  }, []);

  const nextRetestDate = 'July 15, 2026';
  const daysUntilRetest = 72;

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Header with yellow background */}
      <div className="bg-header-yellow rounded-b-[32px] px-5 pt-12 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-text-primary font-semibold text-lg">Biomarkers</h1>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition">
              <Search size={20} className="text-text-primary" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition relative">
              <Bell size={20} className="text-text-primary" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/60 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-xl font-bold text-emerald-600">{stats.optimal}</span>
            </div>
            <p className="text-[10px] text-text-secondary">Optimal</p>
          </div>
          <div className="bg-white/60 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Info size={16} className="text-amber-500" />
              <span className="text-xl font-bold text-amber-600">{stats.borderline}</span>
            </div>
            <p className="text-[10px] text-text-secondary">Borderline</p>
          </div>
          <div className="bg-white/60 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle size={16} className="text-orange-500" />
              <span className="text-xl font-bold text-orange-600">{stats.concerning}</span>
            </div>
            <p className="text-[10px] text-text-secondary">Needs Attention</p>
          </div>
        </div>

        {/* Next Retest Info */}
        <div className="bg-white/50 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Calendar size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Next Full Retest</p>
              <p className="text-sm font-semibold text-text-primary">{nextRetestDate}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600">{daysUntilRetest}</p>
            <p className="text-[10px] text-text-secondary">days away</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search biomarkers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-100 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                selectedCategory === category
                  ? 'bg-text-primary text-white'
                  : 'bg-white text-text-secondary border border-gray-100 hover:bg-gray-50'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Biomarkers List */}
      <div className="px-5 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-text-primary">
            {filteredBiomarkers.length} Biomarkers
          </h2>
          <span className="text-xs text-text-secondary">Last measured Apr 15</span>
        </div>

        {filteredBiomarkers.map((biomarker) => {
          const config = statusConfig[biomarker.status];
          const StatusIcon = config.icon;
          const CategoryIcon = categoryIcons[biomarker.category] || Activity;
          const difference = getDifference(biomarker);
          const isExpanded = expandedId === biomarker.id;

          return (
            <div
              key={biomarker.id}
              className={cn(
                'bg-card-bg rounded-2xl border transition-all overflow-hidden',
                config.borderColor,
                isExpanded ? 'shadow-md' : 'shadow-sm'
              )}
            >
              {/* Main Row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : biomarker.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Icon & Status */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    config.bgColor
                  )}>
                    <StatusIcon size={20} className={config.textColor} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-text-primary text-sm">{biomarker.name}</h3>
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                        config.bgColor,
                        config.textColor
                      )}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary truncate">{biomarker.category}</p>
                    
                    {/* Values Row */}
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <p className="text-[10px] text-text-secondary">Current</p>
                        <p className="text-base font-bold text-text-primary">
                          {biomarker.lastValue} <span className="text-xs font-normal">{biomarker.unit}</span>
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-text-secondary rotate-90" />
                      <div>
                        <p className="text-[10px] text-text-secondary">Target</p>
                        <p className="text-base font-bold text-emerald-600">
                          {biomarker.targetValue} <span className="text-xs font-normal">{biomarker.unit}</span>
                        </p>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-[10px] text-text-secondary">
                          {difference.direction === 'at' ? 'Status' : difference.direction === 'above' ? 'Above by' : 'Below by'}
                        </p>
                        <p className={cn(
                          'text-sm font-medium',
                          difference.direction === 'at' ? 'text-emerald-600' : 
                          difference.direction === 'above' ? 'text-orange-500' : 'text-amber-500'
                        )}>
                          {difference.text}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <ChevronRight 
                    size={20} 
                    className={cn(
                      'text-text-secondary shrink-0 transition-transform',
                      isExpanded && 'rotate-90'
                    )} 
                  />
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                    {biomarker.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar size={12} className="text-text-secondary" />
                        <span className="text-[10px] text-text-secondary uppercase font-medium">Last Measured</span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">
                        {formatDate(biomarker.lastMeasured)}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Target size={12} className="text-text-secondary" />
                        <span className="text-[10px] text-text-secondary uppercase font-medium">Check Frequency</span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary capitalize">
                        {biomarker.frequency}
                      </p>
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex items-center gap-2 bg-white rounded-xl p-3">
                    <span className="text-[10px] text-text-secondary uppercase font-medium">Trend:</span>
                    {biomarker.trend === 'up' ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <TrendingUp size={14} /> Improving
                      </span>
                    ) : biomarker.trend === 'down' ? (
                      <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                        <TrendingDown size={14} /> Decreasing
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-text-secondary text-sm font-medium">
                        <Minus size={14} /> Stable
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredBiomarkers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Search size={24} className="text-text-secondary" />
            </div>
            <p className="text-text-secondary text-sm">No biomarkers found</p>
            <p className="text-text-secondary text-xs mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="px-5 mt-6">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary mb-1">Understanding Your Biomarkers</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                Biomarkers are measured quarterly (every 3 months) to track your health optimization progress. 
                Daily metrics like blood pressure and heart rate can be tracked more frequently through wearables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
