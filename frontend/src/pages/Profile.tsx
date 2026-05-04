import type React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Heart,
  Activity,
  Pill,
  AlertCircle,
  Target,
  Clock,
  FileText,
  Phone,
  Shield,
  ChevronRight,
  Edit3,
  Droplets,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Extended profile interface for comprehensive health data
interface HealthGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  category: 'fitness' | 'nutrition' | 'mental' | 'medical';
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discontinued' | 'as-needed';
  notes?: string;
}

interface HealthCondition {
  id: string;
  name: string;
  diagnosedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'managed' | 'improving' | 'stable' | 'critical';
  managingDoctor: string;
  notes?: string;
}

interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction: string;
  notes?: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  phone: string;
  lastVisit: string;
  nextAppointment?: string;
}

interface UserProfile {
  // Basic Info
  name: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  height: string;
  weight: string;
  prakriti: string;

  // Health Status
  overallStatus: string;
  statusDescription: string;

  // Emergency
  emergencyContacts: EmergencyContact[];

  // Health Data
  conditions: HealthCondition[];
  allergies: Allergy[];
  medications: Medication[];
  goals: HealthGoal[];

  // History
  healthHistory: {
    year: string;
    month?: string;
    event: string;
    type: 'diagnosis' | 'surgery' | 'procedure' | 'milestone' | 'other';
  }[];

  // Care Team
  doctors: Doctor[];

  // Insurance
  insurance: {
    provider: string;
    policyNumber: string;
    validUntil: string;
  } | null;

  // Preferences
  preferences: {
    diet: string[];
    exercise: string[];
    sleepSchedule: string;
    language: string;
  };
}

const MOCK_PROFILE: UserProfile = {
  name: 'Clara Johnson',
  age: 34,
  dateOfBirth: '1991-03-15',
  gender: 'Female',
  bloodType: 'O+',
  height: '5\'6"',
  weight: '132 lbs',
  prakriti: 'Pitta-Kapha',
  overallStatus: 'Managing Well',
  statusDescription: 'Your health metrics are stable. Continue with your current regimen.',

  emergencyContacts: [
    { name: 'Michael Johnson', relationship: 'Spouse', phone: '+1 (555) 123-4567', isPrimary: true },
    { name: 'Sarah Miller', relationship: 'Sister', phone: '+1 (555) 987-6543', isPrimary: false },
  ],

  conditions: [
    {
      id: '1',
      name: 'Hypertension (Stage 1)',
      diagnosedDate: '2022-06',
      severity: 'moderate',
      status: 'managed',
      managingDoctor: 'Dr. Sarah Johnson',
      notes: 'Well controlled with medication and lifestyle changes. BP averaging 128/82.',
    },
    {
      id: '2',
      name: 'Type 2 Diabetes',
      diagnosedDate: '2023-01',
      severity: 'mild',
      status: 'improving',
      managingDoctor: 'Dr. Sarah Johnson',
      notes: 'HbA1c dropped from 7.2% to 6.8%. Diet and exercise program showing results.',
    },
    {
      id: '3',
      name: 'Seasonal Allergic Rhinitis',
      diagnosedDate: '2018-04',
      severity: 'mild',
      status: 'stable',
      managingDoctor: 'Dr. Emily Chen',
      notes: 'Spring and fall allergies. Antihistamines as needed.',
    },
  ],

  allergies: [
    {
      id: '1',
      allergen: 'Penicillin',
      severity: 'moderate',
      reaction: 'Skin rash, hives, difficulty breathing',
      notes: 'Alternative antibiotics: Azithromycin, Clindamycin',
    },
    {
      id: '2',
      allergen: 'Tree Pollen',
      severity: 'mild',
      reaction: 'Sneezing, runny nose, itchy eyes',
      notes: 'Peak season: March-May',
    },
    {
      id: '3',
      allergen: 'Shellfish',
      severity: 'severe',
      reaction: 'Anaphylaxis risk',
      notes: 'Carry EpiPen at all times',
    },
  ],

  medications: [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      timing: 'Morning with food',
      prescribedBy: 'Dr. Sarah Johnson',
      startDate: '2022-07-15',
      status: 'active',
      notes: 'For blood pressure management',
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      timing: 'With meals',
      prescribedBy: 'Dr. Sarah Johnson',
      startDate: '2023-02-01',
      status: 'active',
      notes: 'For diabetes management',
    },
    {
      id: '3',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      timing: 'Evening',
      prescribedBy: 'Dr. Sarah Johnson',
      startDate: '2023-03-10',
      status: 'active',
      notes: 'For cholesterol management',
    },
    {
      id: '4',
      name: 'Cetirizine',
      dosage: '10mg',
      frequency: 'As needed',
      timing: 'When allergy symptoms occur',
      prescribedBy: 'Dr. Emily Chen',
      startDate: '2022-03-01',
      status: 'active',
      notes: 'Non-drowsy antihistamine',
    },
  ],

  goals: [
    {
      id: '1',
      title: 'Achieve Target Weight',
      description: 'Reach 125 lbs through balanced diet and regular exercise',
      targetDate: '2026-08-15',
      progress: 65,
      status: 'active',
      category: 'fitness',
    },
    {
      id: '2',
      title: 'Lower HbA1c Below 6.5%',
      description: 'Improve diabetes management through diet, exercise, and medication adherence',
      targetDate: '2026-06-30',
      progress: 80,
      status: 'active',
      category: 'medical',
    },
    {
      id: '3',
      title: 'Daily Meditation Practice',
      description: 'Build stress resilience through 20 minutes of daily meditation',
      targetDate: '2026-12-31',
      progress: 45,
      status: 'active',
      category: 'mental',
    },
    {
      id: '4',
      title: 'Consistent Sleep Schedule',
      description: 'Maintain 7-8 hours of quality sleep with regular bedtime',
      targetDate: '2026-05-30',
      progress: 90,
      status: 'active',
      category: 'nutrition',
    },
  ],

  healthHistory: [
    { year: '2024', month: 'Dec', event: 'Annual physical - all metrics stable', type: 'milestone' },
    { year: '2024', month: 'Oct', event: 'Flu vaccination', type: 'procedure' },
    { year: '2023', month: 'Jan', event: 'Diagnosed with Type 2 Diabetes', type: 'diagnosis' },
    { year: '2022', month: 'Jul', event: 'Started hypertension medication', type: 'milestone' },
    { year: '2022', month: 'Jun', event: 'Diagnosed with Stage 1 Hypertension', type: 'diagnosis' },
    { year: '2020', month: 'Mar', event: 'Appendectomy', type: 'surgery' },
    { year: '2018', month: 'Apr', event: 'Allergy testing and diagnosis', type: 'diagnosis' },
  ],

  doctors: [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Internal Medicine',
      clinic: 'City Health Partners',
      phone: '+1 (555) 234-5678',
      lastVisit: '2024-12-10',
      nextAppointment: '2025-03-15',
    },
    {
      id: '2',
      name: 'Dr. Emily Chen',
      specialty: 'Allergist & Immunologist',
      clinic: 'Allergy Care Center',
      phone: '+1 (555) 876-5432',
      lastVisit: '2024-11-05',
    },
    {
      id: '3',
      name: 'Dr. Raj Patel',
      specialty: 'Ayurvedic Practitioner',
      clinic: 'Holistic Wellness Center',
      phone: '+1 (555) 345-6789',
      lastVisit: '2024-10-20',
      nextAppointment: '2025-02-20',
    },
  ],

  insurance: {
    provider: 'BlueCross Health',
    policyNumber: 'BC123456789',
    validUntil: '2025-12-31',
  },

  preferences: {
    diet: ['Vegetarian', 'Low-sodium', 'Diabetic-friendly'],
    exercise: ['Walking', 'Yoga', 'Swimming'],
    sleepSchedule: '10:30 PM - 6:00 AM',
    language: 'English',
  },
};

const SectionCard = ({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100', className)}>
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
        <Icon size={16} className="text-indigo-600" />
      </div>
      <h3 className="font-semibold text-text-primary">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm text-text-secondary">{label}</span>
    <span className={cn('text-sm font-medium', highlight ? 'text-indigo-600' : 'text-text-primary')}>{value}</span>
  </div>
);

const StatusBadge = ({ status, severity }: { status: string; severity?: string }) => {
  const getColors = () => {
    if (severity === 'life-threatening') return 'bg-red-100 text-red-700';
    if (severity === 'severe') return 'bg-orange-100 text-orange-700';
    if (status === 'managed' || status === 'improving') return 'bg-green-100 text-green-700';
    if (status === 'stable') return 'bg-blue-100 text-blue-700';
    if (status === 'critical') return 'bg-red-100 text-red-700';
    if (status === 'active') return 'bg-indigo-100 text-indigo-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <span className={cn('text-xs font-medium px-2 py-1 rounded-full', getColors())}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-100 rounded-full h-2">
    <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const profile = MOCK_PROFILE;

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Header */}
      <div className="bg-header-yellow px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div className="text-text-primary font-semibold">My Profile</div>
          <button className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition">
            <Edit3 size={18} className="text-text-primary" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary">{profile.name}</h1>
            <p className="text-text-secondary text-sm">
              {profile.age} years • {profile.gender} • {profile.bloodType}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={profile.overallStatus.toLowerCase().replace(' ', '-')} />
              <span className="text-xs text-text-muted">{profile.prakriti}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 py-6 space-y-4">
        {/* Status Description */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
          <p className="text-sm text-indigo-800 font-medium">{profile.statusDescription}</p>
        </div>

        {/* Basic Information */}
        <SectionCard title="Basic Information" icon={User}>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Date of Birth" value={profile.dateOfBirth} />
            <InfoRow label="Blood Type" value={profile.bloodType} highlight />
            <InfoRow label="Height" value={profile.height} />
            <InfoRow label="Weight" value={profile.weight} />
            <InfoRow label="Prakriti" value={profile.prakriti} />
            <InfoRow label="Gender" value={profile.gender} />
          </div>
        </SectionCard>

        {/* Emergency Contacts */}
        <SectionCard title="Emergency Contacts" icon={Phone}>
          <div className="space-y-3">
            {profile.emergencyContacts.map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {contact.name} {contact.isPrimary && <span className="text-xs text-indigo-600">(Primary)</span>}
                  </p>
                  <p className="text-xs text-text-secondary">{contact.relationship}</p>
                </div>
                <a href={`tel:${contact.phone}`} className="text-sm text-indigo-600 font-medium">
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Health Conditions */}
        <SectionCard title="Health Conditions" icon={Activity}>
          <div className="space-y-4">
            {profile.conditions.map((condition) => (
              <div key={condition.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-text-primary text-sm">{condition.name}</h4>
                  <StatusBadge status={condition.status} />
                </div>
                <p className="text-xs text-text-secondary mb-1">
                  Diagnosed: {condition.diagnosedDate} • Managing Doctor: {condition.managingDoctor}
                </p>
                {condition.notes && <p className="text-xs text-text-muted mt-1">{condition.notes}</p>}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Allergies & Sensitivities */}
        <SectionCard title="Allergies & Sensitivities" icon={AlertCircle}>
          <div className="space-y-3">
            {profile.allergies.map((allergy) => (
              <div key={allergy.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    allergy.severity === 'life-threatening'
                      ? 'bg-red-500'
                      : allergy.severity === 'severe'
                        ? 'bg-orange-500'
                        : 'bg-yellow-500'
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary text-sm">{allergy.allergen}</h4>
                    <StatusBadge status="" severity={allergy.severity} />
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">Reaction: {allergy.reaction}</p>
                  {allergy.notes && <p className="text-xs text-text-muted mt-1">{allergy.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Current Medications */}
        <SectionCard title="Current Medications" icon={Pill}>
          <div className="space-y-4">
            {profile.medications
              .filter((m) => m.status === 'active')
              .map((med) => (
                <div key={med.id} className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">{med.name}</h4>
                      <p className="text-xs text-blue-700">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        {med.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1">
                    <p>💊 Take {med.timing.toLowerCase()}</p>
                    <p>👤 Prescribed by: {med.prescribedBy}</p>
                    <p>📅 Since: {med.startDate}</p>
                  </div>
                  {med.notes && <p className="text-xs text-text-muted mt-2 italic">{med.notes}</p>}
                </div>
              ))}
          </div>
        </SectionCard>

        {/* Health Goals */}
        <SectionCard title="Health Goals & Aspirations" icon={Target}>
          <div className="space-y-4">
            {profile.goals.map((goal) => (
              <div key={goal.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-text-primary text-sm">{goal.title}</h4>
                    <p className="text-xs text-text-secondary">{goal.description}</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">{goal.progress}%</span>
                </div>
                <ProgressBar progress={goal.progress} />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-muted">Target: {goal.targetDate}</span>
                  <StatusBadge status={goal.status} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Health History Timeline */}
        <SectionCard title="Health History" icon={Clock}>
          <div className="space-y-0">
            {profile.healthHistory.map((item, idx) => (
              <div key={idx} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  {idx !== profile.healthHistory.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-600">{item.year}</span>
                    {item.month && <span className="text-xs text-text-muted">{item.month}</span>}
                  </div>
                  <p className="text-sm text-text-primary mt-0.5">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Care Team */}
        <SectionCard title="Care Team" icon={Heart}>
          <div className="space-y-3">
            {profile.doctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <h4 className="font-medium text-text-primary text-sm">{doctor.name}</h4>
                  <p className="text-xs text-text-secondary">
                    {doctor.specialty} • {doctor.clinic}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {doctor.nextAppointment && (
                      <span className="text-xs text-green-600 font-medium">Next: {doctor.nextAppointment}</span>
                    )}
                  </div>
                </div>
                <a href={`tel:${doctor.phone}`} className="text-indigo-600">
                  <Phone size={16} />
                </a>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Insurance */}
        {profile.insurance && (
          <SectionCard title="Insurance Information" icon={Shield}>
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-green-600" />
                <span className="font-medium text-text-primary text-sm">{profile.insurance.provider}</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-text-secondary">
                  Policy: <span className="text-text-primary font-medium">{profile.insurance.policyNumber}</span>
                </p>
                <p className="text-text-secondary">
                  Valid until: <span className="text-text-primary">{profile.insurance.validUntil}</span>
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Preferences */}
        <SectionCard title="Preferences & Lifestyle" icon={Sparkles}>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1">Diet Preferences</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.preferences.diet.map((d, i) => (
                  <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1">Preferred Activities</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.preferences.exercise.map((e, i) => (
                  <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <InfoRow label="Sleep Schedule" value={profile.preferences.sleepSchedule} />
            <InfoRow label="Preferred Language" value={profile.preferences.language} />
          </div>
        </SectionCard>

        {/* Medical ID / Export */}
        <button className="w-full bg-gray-900 text-white rounded-2xl py-4 font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition">
          <FileText size={18} />
          Download Medical ID Card
        </button>
      </div>
    </div>
  );
}
