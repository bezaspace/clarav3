import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Stethoscope, Pill, Activity, Smile, Frown, Meh } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = [12, 13, 14, 15, 16, 17, 18];

const TODAY_EVENTS = [
  {
    id: '1',
    time: '7:30 AM',
    title: 'Morning check-in',
    subtitle: 'Feeling good',
    type: 'checkin',
    status: 'completed',
    mood: 'happy',
    tag: { label: 'Low stress', color: 'green' },
  },
  {
    id: '2',
    time: '10:30 AM',
    title: 'Dr. Sarah Johnson',
    subtitle: 'Cardiology Consultation',
    type: 'doctor',
    status: 'completed',
    tag: { label: 'Done', color: 'green' },
  },
  {
    id: '3',
    time: '1:00 PM',
    title: 'Take Aspirin',
    subtitle: '1 tablet after lunch',
    type: 'medicine',
    status: 'completed',
    tag: { label: 'Taken', color: 'green' },
  },
  {
    id: '4',
    time: '7:30 PM',
    title: 'Evening Walk',
    subtitle: '30 min • Outdoor',
    type: 'activity',
    status: 'upcoming',
    tag: { label: '30 min', color: 'green' },
  },
];

const UPCOMING_EVENTS = [
  {
    id: '5',
    time: '9:00 PM',
    title: 'Sleep wind-down',
    subtitle: 'Wind-down routine',
    type: 'routine',
    tag: { label: 'Routine', color: 'purple' },
  },
];

const HISTORY_EVENTS = [
  {
    id: '6',
    time: 'Yesterday',
    title: 'Skipped evening walk',
    subtitle: 'Tap to add',
    type: 'missed',
    tag: { label: 'Missed', color: 'gray' },
  },
];

export default function Schedule() {
  const navigate = useNavigate();

  const getEventIcon = (type: string, mood?: string) => {
    if (type === 'checkin') {
      if (mood === 'happy') {
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Smile size={20} className="text-amber-500" />
          </div>
        );
      }
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Meh size={20} className="text-amber-500" />
        </div>
      );
    }
    if (type === 'doctor') {
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Stethoscope size={18} className="text-green-600" />
        </div>
      );
    }
    if (type === 'medicine') {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Pill size={18} className="text-blue-600" />
        </div>
      );
    }
    if (type === 'activity') {
      return (
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
          <Activity size={18} className="text-teal-600" />
        </div>
      );
    }
    if (type === 'routine') {
      return (
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <Calendar size={18} className="text-purple-600" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <Activity size={18} className="text-gray-600" />
      </div>
    );
  };

  const getTagColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-700';
      case 'purple':
        return 'bg-purple-100 text-purple-700';
      case 'orange':
        return 'bg-orange-100 text-orange-700';
      case 'gray':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getCardBg = (type: string) => {
    switch (type) {
      case 'checkin':
        return 'bg-amber-50 border-amber-100';
      case 'doctor':
        return 'bg-green-50 border-green-100';
      case 'medicine':
        return 'bg-blue-50 border-blue-100';
      case 'activity':
        return 'bg-teal-50 border-teal-100';
      case 'routine':
        return 'bg-purple-50 border-purple-100';
      case 'missed':
        return 'bg-gray-50 border-gray-100';
      default:
        return 'bg-white border-gray-100';
    }
  };

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
          <h1 className="text-text-primary font-semibold text-lg">Timeline</h1>
          <button className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition">
            <Calendar size={20} className="text-text-primary" />
          </button>
        </div>

        {/* Month indicator */}
        <p className="text-text-secondary text-sm mb-4">May</p>

        {/* Date selector */}
        <div className="flex justify-between items-center">
          {WEEK_DAYS.map((day, index) => (
            <button
              key={day}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all',
                index === 3
                  ? 'bg-text-primary text-white'
                  : 'text-text-secondary hover:bg-white/50'
              )}
            >
              <span className="text-[10px] font-medium">{day}</span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  index === 3 ? 'text-white' : 'text-text-primary'
                )}
              >
                {DATES[index]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 py-6">
        {/* Today indicator */}
        <div className="mb-4">
          <span className="text-text-primary font-semibold">Today</span>
          <span className="text-text-secondary text-sm ml-2">• May 15</span>
        </div>

        {/* Timeline events */}
        <div>
          {/* Today events - closely packed */}
          <div className="bg-card-bg rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {TODAY_EVENTS.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  'flex gap-4 p-4 relative',
                  index !== TODAY_EVENTS.length - 1 && 'border-b border-gray-100'
                )}
              >
                {/* Time */}
                <div className="w-12 shrink-0">
                  <span className="text-xs font-medium text-text-muted">
                    {event.time}
                  </span>
                </div>

                {/* Card content */}
                <div className="flex-1 flex items-start gap-3">
                  {getEventIcon(event.type, event.mood)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm">
                      {event.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {event.subtitle}
                    </p>
                  </div>
                  {event.tag && (
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-2 py-1 rounded-full shrink-0',
                        getTagColor(event.tag.color)
                      )}
                    >
                      {event.tag.label}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming section */}
          <div className="mt-8 mb-4">
            <span className="text-text-primary font-semibold">Upcoming</span>
          </div>

          <div className="bg-card-bg rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {UPCOMING_EVENTS.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  'flex gap-4 p-4',
                  index !== UPCOMING_EVENTS.length - 1 && 'border-b border-gray-100'
                )}
              >
                <div className="w-12 shrink-0">
                  <span className="text-xs font-medium text-text-muted">
                    {event.time}
                  </span>
                </div>
                <div className="flex-1 flex items-start gap-3">
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm">
                      {event.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {event.subtitle}
                    </p>
                  </div>
                  {event.tag && (
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-2 py-1 rounded-full shrink-0',
                        getTagColor(event.tag.color)
                      )}
                    >
                      {event.tag.label}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* History section */}
          <div className="mt-8 mb-4">
            <span className="text-text-primary font-semibold">History</span>
          </div>

          <div className="bg-card-bg rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-70">
            {HISTORY_EVENTS.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  'flex gap-4 p-4',
                  index !== HISTORY_EVENTS.length - 1 && 'border-b border-gray-100'
                )}
              >
                <div className="w-12 shrink-0">
                  <span className="text-xs font-medium text-text-muted">
                    {event.time}
                  </span>
                </div>
                <div className="flex-1 flex items-start gap-3">
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm">
                      {event.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {event.subtitle}
                    </p>
                  </div>
                  {event.tag && (
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-2 py-1 rounded-full shrink-0',
                        getTagColor(event.tag.color)
                      )}
                    >
                      {event.tag.label}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
