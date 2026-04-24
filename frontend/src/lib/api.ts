import type {
  DashboardData,
  DietData,
  BiomarkerData,
  FoodItem,
  JournalData,
  MedicationData,
  MentalData,
  Product,
  Professional,
  WorkoutData,
} from './types';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}): ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}

export const api = {
  dashboard: () => fetchJson<DashboardData>('/api/dashboard'),
  careProducts: () => fetchJson<Product[]>('/api/care/products'),
  careProfessionals: () => fetchJson<Professional[]>('/api/care/professionals'),
  careFood: () => fetchJson<FoodItem[]>('/api/care/food'),
  journal: () => fetchJson<JournalData>('/api/journal'),
  progressBiomarkers: () => fetchJson<BiomarkerData>('/api/progress/biomarkers'),
  progressDiet: () => fetchJson<DietData>('/api/progress/diet'),
  progressMental: () => fetchJson<MentalData>('/api/progress/mental'),
  progressWorkouts: () => fetchJson<WorkoutData>('/api/progress/workouts'),
  progressMedication: () => fetchJson<MedicationData>('/api/progress/medication'),
};
