import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import {
  ChevronLeft,
  Search,
  Bell,
  Moon,
  Footprints,
  Heart,
  ChevronRight,
  Leaf,
  Activity,
  Clock,
  Star,
  Coffee,
  Monitor,
  Footprints as Walk,
  Sparkles,
  ArrowDown,
  ArrowUp,
  Flame,
  Dumbbell,
  Timer,
  Trophy,
  TrendingUp,
  Bike,
  Waves,
  Target,
  Zap,
  Calendar,
  Droplets,
} from 'lucide-react';

const TABS = ['Medication', 'Nutrition', 'Fitness', 'Mind'];

const TRENDS_DATA = [
  { icon: Moon, label: 'Sleep', value: '7h 30m', color: 'bg-blue-500' },
  { icon: Footprints, label: 'Steps', value: '6,432', color: 'bg-green-500' },
  { icon: Heart, label: 'Heart Rate', value: '72 bpm', color: 'bg-red-500' },
];

export default function Progress() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Medication');

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
          <h1 className="text-text-primary font-semibold text-lg">Progress</h1>
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

        {/* Tab pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab
                  ? 'bg-text-primary text-white shadow-md'
                  : 'bg-white/50 text-text-secondary hover:bg-white/70'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 py-6 space-y-6">
        {activeTab === 'Nutrition' ? (
          <>
            {/* Nutrition Overview - Unified Macro Card with Donut Chart */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Today</h2>
              <div className="bg-card-bg rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  {/* Donut Chart */}
                  <div className="relative w-28 h-28 shrink-0">
                    <svg className="w-28 h-28 -rotate-90">
                      {/* Background circle */}
                      <circle cx="56" cy="56" r="44" fill="none" stroke="#F3F4F6" strokeWidth="10" />
                      {/* Carbs - Green (largest portion) */}
                      <circle
                        cx="56"
                        cy="56"
                        r="44"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="10"
                        strokeDasharray={`${(198 / 398) * 276} 276`}
                        strokeLinecap="round"
                      />
                      {/* Protein - Blue */}
                      <circle
                        cx="56"
                        cy="56"
                        r="44"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="10"
                        strokeDasharray={`${(142 / 398) * 276} 276`}
                        strokeDashoffset={-(198 / 398) * 276}
                        strokeLinecap="round"
                      />
                      {/* Fats - Yellow */}
                      <circle
                        cx="56"
                        cy="56"
                        r="44"
                        fill="none"
                        stroke="#EAB308"
                        strokeWidth="10"
                        strokeDasharray={`${(58 / 398) * 276} 276`}
                        strokeDashoffset={-((198 + 142) / 398) * 276}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Center content - Calories */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-text-primary">1,840</span>
                      <span className="text-[10px] text-text-secondary">/ 2,200</span>
                      <span className="text-[10px] text-orange-500">kcal</span>
                    </div>
                  </div>

                  {/* Macro Details */}
                  <div className="flex-1 space-y-3">
                    {/* Protein */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-sm text-text-secondary">Protein</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-text-primary">142</span>
                        <span className="text-xs text-text-secondary"> / 160g</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '89%' }}></div>
                    </div>

                    {/* Carbs */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-sm text-text-secondary">Carbs</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-text-primary">198</span>
                        <span className="text-xs text-text-secondary"> / 250g</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '79%' }}></div>
                    </div>

                    {/* Fats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-sm text-text-secondary">Fats</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-text-primary">58</span>
                        <span className="text-xs text-text-secondary"> / 73g</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '79%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Water Intake */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Waves size={16} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">Water intake</p>
                </div>
                <p className="text-xs text-text-secondary">1.8 / 2.5 L</p>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-lg ${i < 6 ? 'bg-blue-400' : 'bg-gray-100'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-text-secondary">6 of 8 glasses</p>
            </div>

            {/* Macros Chart - 30 Days */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-text-primary">Macronutrients (30 days)</p>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Protein
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Carbs
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Fats
                  </span>
                </div>
              </div>
              <div className="h-32 relative">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#E5E7EB" strokeWidth="0.5" />
                  <line x1="0" y1="40" x2="300" y2="40" stroke="#E5E7EB" strokeWidth="0.5" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#E5E7EB" strokeWidth="0.5" />

                  {/* Protein line (blue) */}
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    points="10,35 20,30 30,32 40,28 50,30 60,25 70,32 80,28 90,30 100,26 110,28 120,24 130,30 140,27 150,25 160,28 170,30 180,26 190,28 200,24 210,30 220,28 230,25 240,27 250,30 260,26 270,28 280,24 290,30"
                  />

                  {/* Carbs line (green) */}
                  <polyline
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="2"
                    points="10,45 20,50 30,42 40,48 50,45 60,50 70,48 80,52 90,45 100,50 110,48 120,52 130,45 140,48 150,50 160,45 170,48 180,52 190,45 200,48 210,50 220,45 230,48 240,52 250,45 260,48 270,50 280,45 290,48"
                  />

                  {/* Fats line (yellow) */}
                  <polyline
                    fill="none"
                    stroke="#EAB308"
                    strokeWidth="2"
                    points="10,55 20,58 30,55 40,60 50,55 60,58 70,55 80,60 90,55 100,58 110,55 120,60 130,55 140,58 150,55 160,60 170,55 180,58 190,55 200,60 210,55 220,58 230,55 240,60 250,55 260,58 270,55 280,60 290,55"
                  />
                </svg>
                {/* X-axis labels - show every 5 days */}
                <div className="flex justify-between text-[10px] text-text-secondary mt-1">
                  <span>Apr 5</span>
                  <span>Apr 10</span>
                  <span>Apr 15</span>
                  <span>Apr 20</span>
                  <span>Apr 25</span>
                  <span>Apr 30</span>
                  <span>May 5</span>
                </div>
              </div>
            </div>

            {/* Micronutrients Chart - 30 Days */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-text-primary">Micronutrients (30 days)</p>
                <button className="text-xs text-text-secondary hover:text-text-primary transition">
                  View all
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Iron
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  Calcium
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  Vit C
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Vit D
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Magnesium
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Zinc
                </span>
              </div>
              <div className="h-32 relative">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="15" x2="300" y2="15" stroke="#E5E7EB" strokeWidth="0.5" />
                  <line x1="0" y1="30" x2="300" y2="30" stroke="#E5E7EB" strokeWidth="0.5" />
                  <line x1="0" y1="45" x2="300" y2="45" stroke="#E5E7EB" strokeWidth="0.5" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#E5E7EB" strokeWidth="0.5" />

                  {/* Iron (purple) */}
                  <polyline
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="1.5"
                    points="10,40 20,35 30,38 40,32 50,35 60,30 70,33 80,28 90,35 100,30 110,33 120,28 130,35 140,32 150,30 160,33 170,35 180,30 190,32 200,28 210,35 220,32 230,30 240,28 250,35 260,30 270,32 280,28 290,35"
                  />

                  {/* Calcium (cyan) */}
                  <polyline
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="1.5"
                    points="10,45 20,48 30,45 40,50 50,45 60,48 70,45 80,50 90,45 100,48 110,45 120,50 130,45 140,48 150,45 160,50 170,45 180,48 190,45 200,50 210,45 220,48 230,45 240,50 250,45 260,48 270,45 280,50 290,45"
                  />

                  {/* Vitamin C (pink) */}
                  <polyline
                    fill="none"
                    stroke="#EC4899"
                    strokeWidth="1.5"
                    points="10,25 20,20 30,22 40,18 50,25 60,20 70,22 80,18 90,25 100,20 110,22 120,18 130,25 140,20 150,22 160,18 170,25 180,20 190,22 200,18 210,25 220,20 230,22 240,18 250,25 260,20 270,22 280,18 290,25"
                  />

                  {/* Vitamin D (amber) */}
                  <polyline
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    points="10,55 20,58 30,55 40,60 50,55 60,58 70,55 80,60 90,55 100,58 110,55 120,60 130,55 140,58 150,55 160,60 170,55 180,58 190,55 200,60 210,55 220,58 230,55 240,60 250,55 260,58 270,55 280,60 290,55"
                  />

                  {/* Magnesium (teal) */}
                  <polyline
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                    points="10,35 20,38 30,35 40,40 50,35 60,38 70,35 80,40 90,35 100,38 110,35 120,40 130,35 140,38 150,35 160,40 170,35 180,38 190,35 200,40 210,35 220,38 230,35 240,40 250,35 260,38 270,35 280,40 290,35"
                  />

                  {/* Zinc (indigo) */}
                  <polyline
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="1.5"
                    points="10,50 20,52 30,50 40,53 50,50 60,52 70,50 80,53 90,50 100,52 110,50 120,53 130,50 140,52 150,50 160,53 170,50 180,52 190,50 200,53 210,50 220,52 230,50 240,53 250,50 260,52 270,50 280,53 290,50"
                  />
                </svg>
                {/* X-axis labels */}
                <div className="flex justify-between text-[10px] text-text-secondary mt-1">
                  <span>Apr 5</span>
                  <span>Apr 10</span>
                  <span>Apr 15</span>
                  <span>Apr 20</span>
                  <span>Apr 25</span>
                  <span>Apr 30</span>
                  <span>May 5</span>
                </div>
              </div>
            </div>

          </>
        ) : activeTab === 'Fitness' ? (
          <>
            {/* Fitness Overview Stats */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">This Week</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Timer size={16} className="text-blue-600" />
                    </div>
                    <p className="text-xs text-text-secondary">Active minutes</p>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">232</p>
                  <p className="text-xs text-text-secondary">min</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-secondary">Goal 300 min</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '77%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Dumbbell size={16} className="text-green-600" />
                    </div>
                    <p className="text-xs text-text-secondary">Workouts</p>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">5</p>
                  <p className="text-xs text-text-secondary">This week</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-secondary">Goal 5</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Flame size={16} className="text-orange-600" />
                    </div>
                    <p className="text-xs text-text-secondary">Calories burned</p>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">1,642</p>
                  <p className="text-xs text-text-secondary">kcal</p>
                </div>

                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Zap size={16} className="text-amber-600" />
                    </div>
                    <p className="text-xs text-text-secondary">Exercise streak</p>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">12</p>
                  <p className="text-xs text-text-secondary">days 🔥</p>
                </div>
              </div>
            </div>

            {/* Weekly Goal Progress */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">Weekly goal progress</p>
                  <p className="text-2xl font-bold text-text-primary">77%</p>
                  <p className="text-xs text-text-secondary">232 of 300 min</p>
                </div>
                {/* Circular progress */}
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${(77 / 100) * 176} 176`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">77%</span>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '77%' }}></div>
              </div>
            </div>

            {/* Training Balance */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-text-primary">Training balance</p>
                <p className="text-xs text-text-secondary">This week</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-secondary">Strength</span>
                    <span className="font-medium text-text-primary">45%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-secondary">Cardio</span>
                    <span className="font-medium text-text-primary">35%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-secondary">Mobility</span>
                    <span className="font-medium text-text-primary">20%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-300 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Training Load */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">Weekly training load</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-text-primary">632</p>
                    <span className="text-xs text-text-secondary">Load score</span>
                  </div>
                  <p className="text-xs text-green-600">+12% vs last week</p>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">High</span>
              </div>
              {/* Training load line chart */}
              <div className="h-16">
                <svg className="w-full h-full" viewBox="0 0 200 40">
                  <polyline
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    points="20,25 45,20 70,28 95,18 120,22 145,15 170,20"
                  />
                  <circle cx="20" cy="25" r="3" fill="#8B5CF6" />
                  <circle cx="45" cy="20" r="3" fill="#8B5CF6" />
                  <circle cx="70" cy="28" r="3" fill="#8B5CF6" />
                  <circle cx="95" cy="18" r="3" fill="#8B5CF6" />
                  <circle cx="120" cy="22" r="3" fill="#8B5CF6" />
                  <circle cx="145" cy="15" r="3" fill="#8B5CF6" />
                  <circle cx="170" cy="20" r="3" fill="#8B5CF6" />
                </svg>
              </div>
            </div>

            {/* Workouts Over Time */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-text-primary">Workouts over time</p>
                <p className="text-xs text-text-secondary">This week</p>
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">6 <span className="text-sm text-green-600 font-normal">+1 vs last week</span></p>
              {/* Bar chart */}
              <div className="flex items-end justify-between gap-2 h-20 mt-3">
                {[
                  { day: 'M', value: 2 },
                  { day: 'T', value: 3 },
                  { day: 'W', value: 2 },
                  { day: 'T', value: 4 },
                  { day: 'F', value: 2 },
                  { day: 'S', value: 3 },
                  { day: 'S', value: 4 },
                ].map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full bg-purple-400 rounded-t-lg"
                      style={{ height: `${d.value * 20}%` }}
                    ></div>
                    <span className="text-xs text-text-secondary">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Minutes Trend */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-text-primary">Active minutes</p>
                <p className="text-xs text-text-secondary">This week</p>
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">232 <span className="text-sm text-green-600 font-normal">+18% vs last week</span></p>
              {/* Bar chart with gradient */}
              <div className="flex items-end justify-between gap-2 h-24 mt-3">
                {[
                  { day: 'M', value: 25 },
                  { day: 'T', value: 35 },
                  { day: 'W', value: 40 },
                  { day: 'T', value: 30 },
                  { day: 'F', value: 50 },
                  { day: 'S', value: 35 },
                  { day: 'S', value: 32 },
                ].map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full bg-green-400 rounded-t-lg"
                      style={{ height: `${(d.value / 50) * 100}%` }}
                    ></div>
                    <span className="text-xs text-text-secondary">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-text-secondary mb-1">Avg workout duration</p>
                <p className="text-xl font-bold text-text-primary">42</p>
                <p className="text-xs text-text-secondary">min</p>
                <p className="text-xs text-green-600 mt-1">+5 min</p>
              </div>
              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-text-secondary mb-1">Total volume lifted</p>
                <p className="text-xl font-bold text-text-primary">14,280</p>
                <p className="text-xs text-text-secondary">lbs</p>
                <p className="text-xs text-green-600 mt-1">+8%</p>
              </div>
              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-text-secondary mb-1">Distance</p>
                <p className="text-xl font-bold text-text-primary">18.6</p>
                <p className="text-xs text-text-secondary">mi</p>
                <p className="text-xs text-green-600 mt-1">+1.6 mi</p>
              </div>
              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-text-secondary mb-1">Calories burned</p>
                <p className="text-xl font-bold text-text-primary">1,642</p>
                <p className="text-xs text-text-secondary">kcal</p>
                <p className="text-xs text-green-600 mt-1">+210 kcal</p>
              </div>
            </div>

            {/* Workout Type Split */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-text-primary">Workout-type split</p>
                <p className="text-xs text-text-secondary">This week</p>
              </div>
              <div className="flex items-center gap-6">
                {/* Donut chart */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90">
                    {/* Background */}
                    <circle cx="48" cy="48" r="36" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                    {/* Strength - Purple */}
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      fill="none"
                      stroke="#A855F7"
                      strokeWidth="12"
                      strokeDasharray={`${(45 / 100) * 226} 226`}
                      strokeLinecap="round"
                    />
                    {/* Cardio - Green */}
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="12"
                      strokeDasharray={`${(35 / 100) * 226} 226`}
                      strokeDashoffset={-(45 / 100) * 226}
                      strokeLinecap="round"
                    />
                    {/* Mobility - Blue */}
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="12"
                      strokeDasharray={`${(15 / 100) * 226} 226`}
                      strokeDashoffset={-((45 + 35) / 100) * 226}
                      strokeLinecap="round"
                    />
                    {/* HIIT - Orange */}
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      fill="none"
                      stroke="#FB923C"
                      strokeWidth="12"
                      strokeDasharray={`${(5 / 100) * 226} 226`}
                      strokeDashoffset={-((45 + 35 + 15) / 100) * 226}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                {/* Legend */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span className="text-xs text-text-secondary flex-1">Strength</span>
                    <span className="text-xs font-medium text-text-primary">45%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-text-secondary flex-1">Cardio</span>
                    <span className="text-xs font-medium text-text-primary">35%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="text-xs text-text-secondary flex-1">Mobility</span>
                    <span className="text-xs font-medium text-text-primary">15%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span className="text-xs text-text-secondary flex-1">HIIT</span>
                    <span className="text-xs font-medium text-text-primary">5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Trend */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-text-primary">Performance trend</p>
                <p className="text-xs text-text-secondary">4 weeks</p>
              </div>
              <div className="h-20">
                <svg className="w-full h-full" viewBox="0 0 200 50">
                  <line x1="0" y1="10" x2="200" y2="10" stroke="#E5E7EB" strokeWidth="0.5" />
                  <line x1="0" y1="25" x2="200" y2="25" stroke="#E5E7EB" strokeWidth="0.5" />
                  <line x1="0" y1="40" x2="200" y2="40" stroke="#E5E7EB" strokeWidth="0.5" />
                  <polyline
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    points="20,30 55,35 90,20 125,25 160,15"
                  />
                  <circle cx="20" cy="30" r="3" fill="#8B5CF6" />
                  <circle cx="55" cy="35" r="3" fill="#8B5CF6" />
                  <circle cx="90" cy="20" r="3" fill="#8B5CF6" />
                  <circle cx="125" cy="25" r="3" fill="#8B5CF6" />
                  <circle cx="160" cy="15" r="3" fill="#8B5CF6" />
                </svg>
                <div className="flex justify-between text-[10px] text-text-secondary mt-1">
                  <span>Apr 21</span>
                  <span>Apr 28</span>
                  <span>May 5</span>
                  <span>May 12</span>
                  <span>May 19</span>
                </div>
              </div>
            </div>

            {/* Monthly Goals */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-text-primary">Monthly goals</p>
                <button className="text-xs text-text-secondary hover:text-text-primary transition">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                    <Dumbbell size={18} className="text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">Workouts this month</span>
                      <span className="text-xs text-text-secondary">16 / 20</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-text-primary">80%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <Timer size={18} className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">Active minutes</span>
                      <span className="text-xs text-text-secondary">920 / 1,200 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '77%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-text-primary">77%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <Flame size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">Run 5K</span>
                      <span className="text-xs text-text-secondary">3 / 4 runs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-text-primary">75%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Trophy size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">Strength sessions</span>
                      <span className="text-xs text-text-secondary">8 / 10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-text-primary">80%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Records */}
            <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-text-primary">Personal records</p>
                <button className="text-xs text-text-secondary hover:text-text-primary transition">
                  View all
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Dumbbell size={16} className="text-text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Bench press</p>
                  </div>
                  <p className="text-sm font-bold text-text-primary">185 lbs</p>
                  <p className="text-xs text-text-secondary">May 10</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Flame size={16} className="text-text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">5K run</p>
                  </div>
                  <p className="text-sm font-bold text-text-primary">26:18</p>
                  <p className="text-xs text-text-secondary">May 8</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Trophy size={16} className="text-text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Deadlift</p>
                  </div>
                  <p className="text-sm font-bold text-text-primary">225 lbs</p>
                  <p className="text-xs text-text-secondary">May 6</p>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'Mind' ? (
          <>
            {/* Mental Health Section */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Mental Health</h2>

              {/* Mind Balance & Average Mood Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">Mind balance score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-text-primary">82</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">Good</p>
                  <Leaf size={20} className="text-green-500" />
                </div>

                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">Average mood</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-text-primary">7.6</span>
                    <span className="text-sm text-text-secondary mb-2">/ 10</span>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">This week</p>
                  <span className="text-2xl">🙂</span>
                </div>
              </div>

              {/* High-stress & Mindfulness Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">High-stress episodes</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-text-primary">3</span>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">This week</p>
                  <Activity size={20} className="text-red-500" />
                </div>

                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">Mindfulness minutes</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-text-primary">94</span>
                    <span className="text-sm text-text-secondary mb-2">min</span>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">This week</p>
                  <Leaf size={20} className="text-green-500" />
                </div>
              </div>

              {/* Mood Stability Chart */}
              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-text-primary">Mood stability (7 days)</p>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Mood
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      Stability
                    </span>
                  </div>
                </div>
                {/* Chart placeholder */}
                <div className="h-24 relative">
                  <svg className="w-full h-full" viewBox="0 0 200 60">
                    {/* Grid lines */}
                    <line x1="0" y1="15" x2="200" y2="15" stroke="#E5E7EB" strokeWidth="0.5" />
                    <line x1="0" y1="30" x2="200" y2="30" stroke="#E5E7EB" strokeWidth="0.5" />
                    <line x1="0" y1="45" x2="200" y2="45" stroke="#E5E7EB" strokeWidth="0.5" />

                    {/* Mood line (purple) */}
                    <polyline
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      points="20,20 45,25 70,15 95,30 120,20 145,15 170,20"
                    />
                    {/* Stability line (green dashed) */}
                    <polyline
                      fill="none"
                      stroke="#86EFAC"
                      strokeWidth="2"
                      strokeDasharray="4,2"
                      points="20,35 45,30 70,40 95,35 120,45 145,35 170,40"
                    />

                    {/* Points */}
                    <circle cx="20" cy="20" r="3" fill="#8B5CF6" />
                    <circle cx="45" cy="25" r="3" fill="#8B5CF6" />
                    <circle cx="70" cy="15" r="3" fill="#8B5CF6" />
                    <circle cx="95" cy="30" r="3" fill="#8B5CF6" />
                    <circle cx="120" cy="20" r="3" fill="#8B5CF6" />
                    <circle cx="145" cy="15" r="3" fill="#8B5CF6" />
                    <circle cx="170" cy="20" r="3" fill="#8B5CF6" />
                  </svg>
                  {/* X-axis labels */}
                  <div className="flex justify-between px-2 text-xs text-text-secondary mt-1">
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </div>
                </div>
              </div>

              {/* Stress Load Bar Chart */}
              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-text-primary mb-3">Stress load by day</p>
                <div className="flex justify-between text-xs text-text-secondary mb-2">
                  <span>High</span>
                  <span>Med</span>
                  <span>Low</span>
                </div>
                {/* Bar chart */}
                <div className="flex items-end justify-between gap-2 h-24">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-orange-400 rounded-t-lg" style={{ height: '80%' }}></div>
                    <span className="text-xs text-text-secondary">M</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-orange-400 rounded-t-lg" style={{ height: '60%' }}></div>
                    <span className="text-xs text-text-secondary">T</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-orange-400 rounded-t-lg" style={{ height: '45%' }}></div>
                    <span className="text-xs text-text-secondary">W</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-orange-400 rounded-t-lg" style={{ height: '70%' }}></div>
                    <span className="text-xs text-text-secondary">T</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-green-400 rounded-t-lg" style={{ height: '40%' }}></div>
                    <span className="text-xs text-text-secondary">F</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-green-400 rounded-t-lg" style={{ height: '30%' }}></div>
                    <span className="text-xs text-text-secondary">S</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-green-400 rounded-t-lg" style={{ height: '25%' }}></div>
                    <span className="text-xs text-text-secondary">S</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sleep Section */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Sleep</h2>

              {/* Sleep Stats Grid 1 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">Sleep duration</p>
                  <p className="text-2xl font-bold text-text-primary">7h 42m</p>
                </div>
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">Sleep quality</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-text-primary">78</span>
                    <span className="text-sm text-text-secondary">Good</span>
                  </div>
                  <Star size={18} className="text-amber-400 fill-amber-400 mt-1" />
                </div>
              </div>

              {/* Sleep Stats Grid 2 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">Bedtime consistency</p>
                  <p className="text-2xl font-bold text-text-primary">87%</p>
                  <p className="text-sm text-text-secondary">Great</p>
                  <Clock size={18} className="text-blue-500 mt-1" />
                </div>
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">Sleep debt</p>
                  <p className="text-2xl font-bold text-text-primary">25</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-text-secondary">min</span>
                    <span className="text-xs text-text-secondary">Low</span>
                  </div>
                  <ArrowDown size={18} className="text-green-500 mt-1" />
                </div>
              </div>

              {/* Sleep Stats Grid 3 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">Time asleep</p>
                  <p className="text-2xl font-bold text-text-primary">7h 18m</p>
                </div>
                <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-text-secondary mb-1">Restfulness</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-text-primary">7.6</span>
                    <span className="text-sm text-text-secondary">/ 10</span>
                  </div>
                  <p className="text-sm text-text-secondary">Good</p>
                  <Heart size={18} className="text-pink-400 fill-pink-400 mt-1" />
                </div>
              </div>

              {/* Sleep Stages */}
              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                <p className="text-sm font-medium text-text-primary mb-3">Sleep stages (last night)</p>

                {/* Stage bars */}
                <div className="flex h-8 rounded-lg overflow-hidden mb-4">
                  <div className="bg-purple-500" style={{ width: '21%' }}></div>
                  <div className="bg-blue-400" style={{ width: '58%' }}></div>
                  <div className="bg-gray-400" style={{ width: '17%' }}></div>
                  <div className="bg-pink-300" style={{ width: '4%' }}></div>
                </div>

                {/* Stage legend */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span className="text-text-secondary">Deep</span>
                    <span className="font-medium text-text-primary">1h 32m</span>
                    <span className="text-text-secondary">21%</span>
                    <span className="text-xs text-green-600">1h min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                    <span className="text-text-secondary">Core</span>
                    <span className="font-medium text-text-primary">4h 16m</span>
                    <span className="text-text-secondary">58%</span>
                    <span className="text-xs text-green-600">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                    <span className="text-text-secondary">REM</span>
                    <span className="font-medium text-text-primary">1h 24m</span>
                    <span className="text-text-secondary">4%</span>
                    <span className="text-xs text-amber-600">30m ⚠️</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-300"></span>
                    <span className="text-text-secondary">Awake</span>
                    <span className="font-medium text-text-primary">30m</span>
                    <span className="text-text-secondary">4%</span>
                  </div>
                </div>
              </div>

              {/* Sleep Trend */}
              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                <p className="text-sm font-medium text-text-primary mb-3">Sleep trend (7 days)</p>
                <div className="h-24 relative">
                  <svg className="w-full h-full" viewBox="0 0 200 60">
                    {/* Grid lines */}
                    <line x1="0" y1="10" x2="200" y2="10" stroke="#E5E7EB" strokeWidth="0.5" />
                    <line x1="0" y1="25" x2="200" y2="25" stroke="#E5E7EB" strokeWidth="0.5" />
                    <line x1="0" y1="40" x2="200" y2="40" stroke="#E5E7EB" strokeWidth="0.5" />

                    {/* Sleep duration line */}
                    <polyline
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      points="20,15 45,20 70,10 95,15 120,25 145,10 170,5"
                    />
                    {/* Area fill */}
                    <polygon
                      fill="url(#purpleGradient)"
                      opacity="0.3"
                      points="20,60 20,15 45,20 70,10 95,15 120,25 145,10 170,5 170,60"
                    />

                    <defs>
                      <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Points */}
                    <circle cx="20" cy="15" r="3" fill="#8B5CF6" />
                    <circle cx="45" cy="20" r="3" fill="#8B5CF6" />
                    <circle cx="70" cy="10" r="3" fill="#8B5CF6" />
                    <circle cx="95" cy="15" r="3" fill="#8B5CF6" />
                    <circle cx="120" cy="25" r="3" fill="#8B5CF6" />
                    <circle cx="145" cy="10" r="3" fill="#8B5CF6" />
                    <circle cx="170" cy="5" r="3" fill="#8B5CF6" />
                  </svg>
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[10px] text-text-secondary">
                    <span>9h</span>
                    <span>6h</span>
                    <span>3h</span>
                    <span>0h</span>
                  </div>
                  {/* X-axis labels */}
                  <div className="flex justify-between px-2 text-xs text-text-secondary mt-1">
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </div>
                </div>
              </div>

              {/* Sleep Factors */}
              <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-text-primary mb-3">Sleep factors</p>
                <div className="space-y-3">
                  {/* Late caffeine - negative impact */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Coffee size={18} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Late caffeine</p>
                        <p className="text-xs text-text-secondary">After 2 PM</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">- Impact</span>
                  </div>

                  {/* Screen time - negative impact */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Monitor size={18} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Screen time</p>
                        <p className="text-xs text-text-secondary">High</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">- Impact</span>
                  </div>

                  {/* Evening walk - positive impact */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Walk size={18} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Evening walk</p>
                        <p className="text-xs text-text-secondary">30 min</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">+ Impact</span>
                  </div>

                  {/* Meditation - positive impact */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Sparkles size={18} className="text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Meditation</p>
                        <p className="text-xs text-text-secondary">10 min</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">+ Impact</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Health Score Card */}
            <div className="bg-card-bg rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  Your Health Score
                </h2>
                <button className="text-text-muted hover:text-text-primary transition">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex items-center gap-6">
                {/* Circular progress */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(78 / 100) * 251} 251`}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22C55E" />
                        <stop offset="100%" stopColor="#FDE68A" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-text-primary">78</span>
                    <span className="text-xs text-text-secondary">Good</span>
                  </div>
                </div>

                {/* Score details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-600 font-semibold">Good</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-green-600">+12%</span>
                    <span className="text-text-secondary">vs last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trends Section */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Trends</h2>
              <div className="grid grid-cols-3 gap-3">
                {TRENDS_DATA.map((trend) => (
                  <div
                    key={trend.label}
                    className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center mb-3',
                        trend.color
                      )}
                    >
                      <trend.icon size={18} className="text-white" />
                    </div>
                    <p className="text-xs text-text-secondary mb-1">{trend.label}</p>
                    <p className="text-lg font-bold text-text-primary">
                      {trend.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medication Adherence - GitHub Calendar Heatmap Style */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  Medication Adherence
                </h2>
                <button className="text-text-secondary text-sm font-medium hover:text-text-primary transition flex items-center gap-1">
                  Last 10 doses <ChevronRight size={16} />
                </button>
              </div>

              <div className="bg-card-bg rounded-2xl p-5 shadow-sm border border-gray-100">
                {/* Month Labels - Horizontal Axis (aligned to columns) */}
                <div className="flex mb-2 ml-6">
                  <span className="text-[10px] text-text-secondary w-[4.5rem] text-left">Apr</span>
                  <span className="text-[10px] text-text-secondary flex-1 text-left">May</span>
                </div>

                {/* Calendar Grid - Days as rows, weeks as columns */}
                <div className="space-y-2">
                  {/* Metformin */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-4">M</span>
                    <div className="flex gap-1.5">
                      {['100', '100', '75', '100', '100', '50', '75', '100', '100', '100'].map((level, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-6 h-6 rounded-md',
                            level === '100' && 'bg-emerald-500',
                            level === '75' && 'bg-emerald-300',
                            level === '50' && 'bg-amber-300',
                            level === '0' && 'bg-rose-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Lisinopril */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-4">T</span>
                    <div className="flex gap-1.5">
                      {['100', '75', '100', '75', '100', '100', '75', '100', '75', '100'].map((level, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-6 h-6 rounded-md',
                            level === '100' && 'bg-emerald-500',
                            level === '75' && 'bg-emerald-300',
                            level === '50' && 'bg-amber-300',
                            level === '0' && 'bg-rose-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Atorvastatin */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-4">W</span>
                    <div className="flex gap-1.5">
                      {['75', '100', '100', '100', '75', '100', '100', '75', '100', '100'].map((level, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-6 h-6 rounded-md',
                            level === '100' && 'bg-emerald-500',
                            level === '75' && 'bg-emerald-300',
                            level === '50' && 'bg-amber-300',
                            level === '0' && 'bg-rose-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Vitamin D3 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-4">T</span>
                    <div className="flex gap-1.5">
                      {['100', '100', '75', '100', '50', '75', '100', '100', '50', '75'].map((level, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-6 h-6 rounded-md',
                            level === '100' && 'bg-emerald-500',
                            level === '75' && 'bg-emerald-300',
                            level === '50' && 'bg-amber-300',
                            level === '0' && 'bg-rose-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Omega-3 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-4">F</span>
                    <div className="flex gap-1.5">
                      {['100', '100', '100', '75', '100', '100', '100', '75', '100', '100'].map((level, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-6 h-6 rounded-md',
                            level === '100' && 'bg-emerald-500',
                            level === '75' && 'bg-emerald-300',
                            level === '50' && 'bg-amber-300',
                            level === '0' && 'bg-rose-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Multivitamin */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-4">S</span>
                    <div className="flex gap-1.5">
                      {['50', '100', '75', '100', '100', '50', '75', '100', '50', '75'].map((level, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-6 h-6 rounded-md',
                            level === '100' && 'bg-emerald-500',
                            level === '75' && 'bg-emerald-300',
                            level === '50' && 'bg-amber-300',
                            level === '0' && 'bg-rose-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Calcium */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary w-4">S</span>
                    <div className="flex gap-1.5">
                      {['100', '75', '100', '100', '75', '100', '100', '100', '75', '100'].map((level, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-6 h-6 rounded-md',
                            level === '100' && 'bg-emerald-500',
                            level === '75' && 'bg-emerald-300',
                            level === '50' && 'bg-amber-300',
                            level === '0' && 'bg-rose-300'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-emerald-500"></div>
                    <span className="text-xs text-text-secondary">100%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-emerald-300"></div>
                    <span className="text-xs text-text-secondary">75%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-amber-300"></div>
                    <span className="text-xs text-text-secondary">50%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-rose-300"></div>
                    <span className="text-xs text-text-secondary">0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Biomarkers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">Biomarkers</h2>
                <button 
                  onClick={() => navigate('/biomarkers')}
                  className="text-text-secondary text-sm font-medium hover:text-text-primary transition"
                >
                  View all
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Blood Pressure */}
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                  <p className="text-xs text-green-600 font-medium mb-1">
                    Blood Pressure
                  </p>
                  <p className="text-xl font-bold text-text-primary">120/80</p>
                  <p className="text-xs text-text-secondary mt-1">Normal</p>
                </div>

                {/* Blood Sugar */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <p className="text-xs text-amber-600 font-medium mb-1">
                    Blood Sugar
                  </p>
                  <p className="text-xl font-bold text-text-primary">98 mg/dL</p>
                  <p className="text-xs text-text-secondary mt-1">Normal</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
