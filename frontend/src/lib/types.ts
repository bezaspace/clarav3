export type ScheduleStatus = 'completed' | 'pending';
export type ScheduleType = 'Mind' | 'Body' | 'Diet' | 'Medicine';
export type ActivityCardKind = 'schedule' | 'task';
export type ActivityCardStatus = 'completed' | 'pending' | 'in-progress';

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

export interface ActivityCard {
  id: string;
  kind: ActivityCardKind;
  title: string;
  category: string;
  status: ActivityCardStatus;
  timeLabel: string;
  supportingText: string;
  scheduledFor?: string | null;
}

export interface CurrentActivityPayload {
  type: 'current_activity';
  message?: string;
  activityCard?: ActivityCard | null;
  currentItem?: ActivityCard | null;
  upcomingItem?: ActivityCard | null;
  pendingTasks?: ActivityCard[];
}

export interface ScheduleSnapshotPayload {
  type: 'schedule_snapshot';
  message?: string;
  items: ActivityCard[];
  pendingTasks?: ActivityCard[];
}

export interface CareRecommendation {
  id: string;
  kind: CareActivityKind;
  title: string;
  provider: string;
  detail: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  offer: string;
  eta: string;
  isOnline: boolean;
  reviews: number;
  location: string;
  availability: string;
}

export interface CareRecommendationsPayload {
  type: 'care_recommendations' | 'care_activity_confirmation_required';
  status: string;
  message?: string;
  kind?: CareActivityKind;
  query?: string;
  recommendations: CareRecommendation[];
}

export interface CareActivityCreatedPayload {
  type: 'care_activity_created';
  status: 'success';
  message?: string;
  activity: CareActivity;
}

export type JournalItemType = 'reflection' | 'cbt_note' | 'task';

export interface JournalConfirmationPayload {
  type: 'journal_confirmation_required';
  status: 'confirmation_required';
  itemType: JournalItemType;
  message?: string;
  preview: Record<string, unknown>;
}

export interface JournalCreatedPayload {
  type:
    | 'journal_entry_created'
    | 'journal_cbt_note_created'
    | 'journal_task_created'
    | 'journal_task_updated'
    | 'journal_task_deleted';
  status: 'success';
  message?: string;
  entry?: JournalEntry;
  cbtNote?: CbtNote;
  task?: Task | { id: string; status: 'deleted' };
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

export type CareActivityKind = 'product' | 'food' | 'doctor' | 'lab';
export type CareActivityStatus = 'ordered' | 'confirmed' | 'scheduled' | 'preparing' | 'in-transit' | 'completed' | 'cancelled';

export interface CareActivity {
  id: string;
  kind: CareActivityKind;
  status: CareActivityStatus;
  title: string;
  provider: string;
  scheduledFor: string;
  eta: string;
  price: number;
  sourceItemId: string;
  createdAt: string;
  note: string;
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
  createdAt?: string;
  updatedAt?: string;
  source?: 'assistant' | 'manual';
}

export interface JournalEntry {
  id: string;
  createdAt?: string;
  date: string;
  time?: string;
  title: string;
  excerpt: string;
  content?: string;
  mood: string;
  tags: string[];
  source?: 'assistant' | 'manual';
}

export interface CbtNote {
  id: string;
  createdAt: string;
  date: string;
  time: string;
  situation: string;
  thought: string;
  feeling: string;
  reframe: string;
  action: string;
  source: 'assistant' | 'manual';
  linkedEntryId?: string;
}

export interface JournalData {
  tasks: Task[];
  entries: JournalEntry[];
  cbtNotes: CbtNote[];
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
