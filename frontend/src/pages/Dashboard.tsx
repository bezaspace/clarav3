import { Card } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';
import { 
  User, 
  ShieldAlert, 
  History, 
  Target, 
  Dna, 
  Fingerprint,
  Stethoscope,
  Brain,
  Dumbbell,
  Utensils,
  Pill,
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';

export default function Dashboard() {
  const profile = {
    name: "Harsha",
    age: 32,
    bloodType: "O+ Positive",
    prakriti: "Vata-Pitta",
    status: "Metabolic Reset Phase",
    allergies: ["Peanuts", "Dust Mites", "Penicillin"],
    conditions: ["Mild Hypertension (Managed)", "Seasonal Asthma"],
    history: [
      { year: "2021", event: "ACL Reconstruction (Right Knee)" },
      { year: "2018", event: "Appendectomy" }
    ],
    targets: [
      { goal: "HbA1c Optimization", current: "6.2%", aim: "5.4%", effort: "High" },
      { goal: "CRP Reduction", current: "3.2 mg/L", aim: "1.0 mg/L", effort: "Medium" }
    ]
  };

  const todaysSchedule = [
    { id: 1, time: '06:00 AM', title: 'Morning Meditation & Pranayama', type: 'Mind', duration: '25 min', status: 'completed' },
    { id: 2, time: '06:30 AM', title: 'Yoga & Core Workout', type: 'Body', duration: '45 min', status: 'completed' },
    { id: 3, time: '07:30 AM', title: 'Morning Tea: Ginger Masala & Almonds', type: 'Diet', duration: '80 kcal', status: 'completed' },
    { id: 4, time: '08:00 AM', title: 'Triphala Churna', type: 'Medicine', duration: 'Empty Stomach', status: 'completed' },
    { id: 5, time: '09:00 AM', title: 'Breakfast: Vegetable Poha & Curd', type: 'Diet', duration: '320 kcal', status: 'completed' },
    { id: 6, time: '09:30 AM', title: 'Multivitamin', type: 'Medicine', duration: 'After Breakfast', status: 'completed' },
    { id: 7, time: '11:30 AM', title: 'Mid-Day Snack: 1 Seasonal Fruit', type: 'Diet', duration: '90 kcal', status: 'pending' },
    { id: 8, time: '01:30 PM', title: 'Lunch: Jowar Rotis, Dal Tadka, Salad', type: 'Diet', duration: '450 kcal', status: 'pending' },
    { id: 9, time: '04:30 PM', title: 'Evening Snack: Sprouted Moong Salad', type: 'Diet', duration: '150 kcal', status: 'pending' },
    { id: 10, time: '08:00 PM', title: 'Dinner: Khichdi & Buttermilk', type: 'Diet', duration: '350 kcal', status: 'pending' },
    { id: 11, time: '09:30 PM', title: 'Gratitude Journal & Reflection', type: 'Mind', duration: '15 min', status: 'pending' },
    { id: 12, time: '09:45 PM', title: 'Ashwagandha', type: 'Medicine', duration: 'Before Sleep', status: 'pending' },
    { id: 13, time: '10:00 PM', title: 'Screen Down Time', type: 'Mind', duration: '1 hour before sleep', status: 'pending' },
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Mind': return <Brain size={16} />;
      case 'Body': return <Dumbbell size={16} />;
      case 'Diet': return <Utensils size={16} />;
      case 'Medicine': return <Pill size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'Mind': return 'text-purple-400 bg-purple-900/30 border-purple-800/50';
      case 'Body': return 'text-blue-400 bg-blue-900/30 border-blue-800/50';
      case 'Diet': return 'text-orange-400 bg-orange-900/30 border-orange-800/50';
      case 'Medicine': return 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50';
      default: return 'text-stone-400 bg-stone-900/30 border-stone-800/50';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-5xl mx-auto">
      <header className="flex flex-col gap-1">
        <h2 className="text-4xl font-serif text-stone-100 italic">Namaste, {profile.name}</h2>
        <p className="text-stone-500 text-sm">Your Biological Blueprint & Optimization Path</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Identity Section */}
        <Card className="lg:col-span-4 p-6 bg-ayu-bg/50 border-ayu-border flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-ayu-green/10 flex items-center justify-center mb-4 border border-ayu-green/20 relative">
            <User size={48} className="text-ayu-green" />
            <div className="absolute -bottom-1 -right-1 bg-ayu-saffron p-1.5 rounded-lg text-ayu-bg">
              <Fingerprint size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-serif text-stone-100">{profile.name}, {profile.age}</h3>
          <p className="text-xs text-stone-500 uppercase font-bold tracking-widest mt-1">Patient Identifier: #AC-8842</p>
          
          <div className="w-full mt-8">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-ayu-card border border-ayu-border">
              <span className="text-[9px] uppercase font-bold text-stone-600">Blood Type</span>
              <span className="text-sm font-bold text-stone-300">{profile.bloodType}</span>
            </div>
          </div>
        </Card>

        {/* Current Condition & Risks */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies & Sensitivities */}
            <Card className="border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert size={20} className="text-red-500" />
                <h4 className="font-serif text-lg text-stone-200">Allergies</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] uppercase font-bold rounded-full border border-red-500/20">
                    {allergy}
                  </span>
                ))}
              </div>
            </Card>

            {/* Active Conditions */}
            <Card className="border-ayu-saffron/20 bg-ayu-saffron/5">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope size={20} className="text-ayu-saffron" />
                <h4 className="font-serif text-lg text-stone-200">Monitoring</h4>
              </div>
              <ul className="space-y-2">
                {profile.conditions.map((condition, i) => (
                  <li key={i} className="text-xs text-stone-400 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-ayu-saffron" />
                    {condition}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Medical History Timeline */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <History size={20} className="text-ayu-green" />
              <h4 className="font-serif text-lg text-stone-200">Clinical History</h4>
            </div>
            <div className="space-y-4">
              {profile.history.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-ayu-border border border-ayu-green/40 group-hover:bg-ayu-green transition-colors" />
                    {i !== profile.history.length - 1 && <div className="w-[1px] h-full bg-ayu-border" />}
                  </div>
                  <div className="pb-4">
                    <span className="text-[10px] font-bold text-ayu-green uppercase tracking-wider">{item.year}</span>
                    <p className="text-sm text-stone-300 font-medium">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Today's Schedule Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Clock size={22} className="text-ayu-green" />
          <h3 className="text-xl font-serif text-stone-100">Today's Schedule</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysSchedule.map((item) => (
            <Card key={item.id} className={cn(
              "flex flex-col gap-3 group transition-all",
              item.status === 'completed' 
                ? "bg-ayu-green/5 border-ayu-green/20" 
                : "hover:border-ayu-green/30"
            )}>
              <div className="flex justify-between items-center mb-1">
                <div className={cn("px-2 py-1 rounded text-[10px] uppercase font-bold flex items-center gap-1.5 border", getColorForType(item.type))}>
                  {getIconForType(item.type)}
                  <span>{item.type}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-60">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold tracking-wider">{item.time}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                {item.status === 'completed' ? (
                  <CheckCircle2 size={20} className="text-ayu-green shrink-0 mt-0.5" />
                ) : (
                  <Circle size={20} className="text-stone-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={cn(
                    "text-sm font-bold",
                    item.status === 'completed' ? "text-stone-400 line-through decoration-ayu-green/30" : "text-stone-200"
                  )}>{item.title}</h4>
                  <p className="text-[11px] text-stone-500 mt-1">{item.duration}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Strategic Optimization Targets */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2 mt-4">
          <Target size={22} className="text-ayu-green" />
          <h3 className="text-xl font-serif text-stone-100">3-Month Optimization Aim</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.targets.map((target, i) => (
            <Card key={i} className="flex flex-col gap-4 group hover:border-ayu-green/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-stone-300 font-bold text-sm tracking-tight">{target.goal}</h5>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mt-0.5">Priority: {target.effort}</p>
                </div>
                <div className="bg-ayu-green/10 p-2 rounded-lg text-ayu-green">
                  <Dna size={18} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-bold text-stone-600 mb-2 uppercase">
                    <span>Base ({target.current})</span>
                    <span>Aim ({target.aim})</span>
                  </div>
                  <div className="h-2 w-full bg-ayu-bg rounded-full overflow-hidden border border-ayu-border relative">
                    <div className="absolute inset-y-0 left-0 bg-ayu-green opacity-40" style={{ width: '65%' }} />
                    <div className="absolute right-[10%] top-0 bottom-0 w-[2px] bg-ayu-green shadow-[0_0_8px_rgba(61,107,53,0.8)]" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>


    </div>
  );
}
