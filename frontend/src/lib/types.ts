export type ScheduleStatus = 'completed' | 'pending';
export type ScheduleType = 'Mind' | 'Body' | 'Diet' | 'Medicine';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface DashboardProfile {
  name: string;
  age: number;
  bloodType: string;
  prakriti: string;
  status: string;
  allergies: string[];
  conditions: string[];
  history: {
    year: string;
    event: string;
  }[];
  targets: {
    goal: string;
    current: string;
    aim: string;
    effort: string;
  }[];
}

export interface DashboardScheduleItem {
  id: number;
  time: string;
  title: string;
  type: ScheduleType;
  duration: string;
  status: ScheduleStatus;
}

export interface DashboardData {
  profile: DashboardProfile;
  todaysSchedule: DashboardScheduleItem[];
}

export interface Product {
  id: string;
  name: string;
  category: 'Groceries' | 'Ayurveda' | 'Fitness' | 'Medication';
  price: number;
  originalPrice?: number;
  unit: string;
  rating: number;
  image: string;
  tag?: string;
  isOffer?: boolean;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  type: 'Doctor' | 'Lab';
  experience?: string;
  rating: number;
  reviews: number;
  location: string;
  price: number;
  availability: string;
  image: string;
  isOnline: boolean;
}

export interface FoodItem {
  id: string;
  restaurant: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  time: string;
  image: string;
  offer?: string;
  veg?: boolean;
}

export interface CareData {
  products: Product[];
  professionals: Professional[];
  foodItems: FoodItem[];
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  mood: string;
  tags: string[];
}

export interface JournalData {
  tasks: Task[];
  entries: JournalEntry[];
}

export interface Biomarker {
  id: string;
  name: string;
  category: 'Metabolic' | 'Nutrients' | 'Inflammation' | 'Hormones' | 'Physiology';
  baseline: number;
  goal: number;
  unit: string;
  status: 'normal' | 'concerning' | 'critical';
  description: string;
}

export interface BiomarkerSummary {
  title?: string;
  optimizationGoal?: string;
  phase?: string;
  currentBaselineLabel?: string;
  metricsAnalyzed?: number;
  nextRetest?: string;
  daysRemaining?: number;
  priorityRisks?: number;
  priorityRisksLabel?: string;
}

export interface BiomarkerData {
  biomarkers: Biomarker[];
  summary: BiomarkerSummary;
}

export interface HistoryPoint {
  date: string;
  carbs?: number;
  protein?: number;
  fats?: number;
  fiber?: number;
  vitamins?: number;
  minerals?: number;
  moodScore?: number;
  sleepHours?: number;
  deepSleepHours?: number;
}

export interface DietData {
  historyData: HistoryPoint[];
  sattvicGoal: number;
}

export interface AdherenceDatum {
  subject: string;
  A: number;
  fullMark: number;
}

export interface MentalData {
  historyData: HistoryPoint[];
  adherenceData: AdherenceDatum[];
  quickStats: {
    zenStreak: string;
    avgSleep: string;
    moodIndex: string;
  };
}

export interface WorkoutDataItem {
  subject: string;
  A: number;
  fullMark: number;
}

export interface WorkoutSession {
  type: string;
  duration: string;
  intensity: string;
  cals: string;
}

export interface WorkoutMilestone {
  title: string;
  achievedDate: string;
}

export interface WorkoutData {
  workoutData: WorkoutDataItem[];
  sessions: WorkoutSession[];
  milestone: WorkoutMilestone;
}

export interface AdherenceDay {
  id: number;
  level: number;
  date: number;
  month: number;
  monthName: string;
  fullDate: string;
}

export interface MedicationOverview {
  adherence: string;
  streak: string;
  refill: string;
  refillText: string;
}

export interface MedicationData {
  overview: MedicationOverview;
  adherenceRows: AdherenceDay[];
}
