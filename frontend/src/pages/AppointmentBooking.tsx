import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import {
  ChevronLeft,
  Star,
  Building2,
  Video,
  Check,
} from 'lucide-react';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DATES = [20, 21, 22, 23, 24];

const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
  '04:30 PM',
  '06:00 PM',
];

const CONSULTATION_TYPES = [
  {
    id: 'in-clinic',
    icon: Building2,
    label: 'In Clinic',
    subtitle: 'Visit at clinic',
  },
  {
    id: 'video-call',
    icon: Video,
    label: 'Video Call',
    subtitle: 'Consult from home',
  },
];

// Mock doctor data - in real app would fetch by ID
const DOCTOR_DATA = {
  id: '1',
  name: 'Dr. Sarah Johnson',
  specialty: 'Cardiologist',
  experience: '12+ years experience',
  rating: 4.8,
  reviews: 120,
  image: '👩‍⚕️',
};

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [selectedDate, setSelectedDate] = useState(0); // Index of selected date
  const [selectedTime, setSelectedTime] = useState(1); // Index of selected time slot
  const [consultationType, setConsultationType] = useState('in-clinic');

  return (
    <div className="min-h-screen bg-bg-primary pb-6">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-text-primary font-semibold text-lg">
            Book Appointment
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 space-y-6">
        {/* Doctor Info Card */}
        <div className="bg-card-bg rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-purple-50 rounded-xl flex items-center justify-center text-4xl shrink-0">
              {DOCTOR_DATA.image}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-text-primary text-lg mb-0.5">
                {DOCTOR_DATA.name}
              </h2>
              <p className="text-sm text-purple-600 mb-1">
                {DOCTOR_DATA.specialty}
              </p>
              <p className="text-xs text-text-secondary mb-2">
                {DOCTOR_DATA.experience}
              </p>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-text-primary">
                  {DOCTOR_DATA.rating}
                </span>
                <span className="text-xs text-text-secondary">
                  ({DOCTOR_DATA.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Select Date */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">
              Select Date
            </h2>
            <span className="text-sm text-text-secondary">May 2024</span>
          </div>
          <div className="flex gap-3">
            {WEEK_DAYS.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDate(index)}
                className={cn(
                  'flex flex-col items-center py-3 px-3 rounded-xl transition-all min-w-[60px]',
                  selectedDate === index
                    ? 'bg-green-200 text-text-primary'
                    : 'bg-card-bg text-text-secondary border border-gray-100'
                )}
              >
                <span className="text-xs mb-1">{day}</span>
                <span
                  className={cn(
                    'text-lg font-bold',
                    selectedDate === index
                      ? 'text-text-primary'
                      : 'text-text-primary'
                  )}
                >
                  {DATES[index]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Select Time */}
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Select Time
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {TIME_SLOTS.map((time, index) => (
              <button
                key={time}
                onClick={() => setSelectedTime(index)}
                className={cn(
                  'py-3 px-2 rounded-xl text-sm font-medium transition-all',
                  selectedTime === index
                    ? 'bg-header-yellow text-text-primary'
                    : 'bg-card-bg text-text-secondary border border-gray-100'
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Consultation Type */}
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Consultation Type
          </h2>
          <div className="space-y-3">
            {CONSULTATION_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setConsultationType(type.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl transition-all',
                  consultationType === type.id
                    ? 'bg-card-bg border-2 border-header-yellow'
                    : 'bg-card-bg border border-gray-100'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <type.icon size={22} className="text-text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-text-primary">{type.label}</p>
                  <p className="text-xs text-text-secondary">{type.subtitle}</p>
                </div>
                {consultationType === type.id && (
                  <div className="w-6 h-6 rounded-full bg-header-yellow flex items-center justify-center">
                    <Check size={14} className="text-text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <button className="w-full py-4 bg-header-yellow rounded-xl font-semibold text-text-primary hover:bg-accent-yellow transition active:scale-[0.98] mt-8">
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
