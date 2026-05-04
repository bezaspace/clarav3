import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import {
  ChevronLeft,
  Star,
  Clock,
  ShieldCheck,
  Beaker,
  FileText,
  Check,
  Calendar,
  Home,
  Building2,
} from 'lucide-react';

// Mock lab test data
const TEST_DATA = {
  id: '1',
  name: 'Complete Blood Count (CBC)',
  provider: 'Thyrocare',
  price: 499,
  originalPrice: 799,
  rating: 4.8,
  reviews: 892,
  image: '🔬',
  description: 'A complete blood count (CBC) is a blood test used to evaluate your overall health and detect a wide range of disorders.',
  reportTime: '24 hours',
  sampleType: 'Blood',
  fastingRequired: '8-10 hours',
  ageGroup: 'All age groups',
  includes: [
    'Hemoglobin (Hb)',
    'Total RBC Count',
    'Total WBC Count',
    'Platelet Count',
    'MCV, MCH, MCHC',
    'RDW, MPV',
  ],
  preparation: [
    '8-10 hours fasting required',
    'Drink water normally',
    'Avoid alcohol 24 hours prior',
    'Continue medications as usual',
  ],
};

const SAMPLE_COLLECTION_OPTIONS = [
  { id: 'home', icon: Home, label: 'Home Collection', subtitle: 'Free pickup' },
  { id: 'lab', icon: Building2, label: 'Visit Lab', subtitle: 'Walk-in anytime' },
];

export default function LabTestDetail() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [collectionType, setCollectionType] = useState('home');

  return (
    <div className="min-h-screen bg-bg-primary pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-text-primary font-semibold text-lg">Test Details</h1>
        </div>
      </div>

      {/* Test Image */}
      <div className="px-5 mb-6">
        <div className="bg-green-50 rounded-3xl aspect-video flex items-center justify-center relative">
          <span className="text-8xl">{TEST_DATA.image}</span>
          <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            NABL Certified
          </span>
        </div>
      </div>

      {/* Test Info */}
      <div className="px-5 space-y-5">
        {/* Title & Provider */}
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">{TEST_DATA.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">by</span>
            <span className="text-sm font-semibold text-green-600">{TEST_DATA.provider}</span>
            <span className="text-sm text-text-secondary">•</span>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-text-primary">{TEST_DATA.rating}</span>
              <span className="text-xs text-text-secondary">({TEST_DATA.reviews})</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-text-primary">₹{TEST_DATA.price}</span>
          <span className="text-lg text-text-secondary line-through">₹{TEST_DATA.originalPrice}</span>
          <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-lg">
            {Math.round((1 - TEST_DATA.price / TEST_DATA.originalPrice) * 100)}% OFF
          </span>
        </div>

        {/* Quick Info */}
        <div className="flex gap-4">
          <div className="flex-1 bg-card-bg rounded-xl p-3 border border-gray-100 text-center">
            <Clock size={20} className="mx-auto mb-1 text-blue-600" />
            <p className="text-xs text-text-secondary">Report Time</p>
            <p className="text-sm font-semibold text-text-primary">{TEST_DATA.reportTime}</p>
          </div>
          <div className="flex-1 bg-card-bg rounded-xl p-3 border border-gray-100 text-center">
            <Beaker size={20} className="mx-auto mb-1 text-purple-600" />
            <p className="text-xs text-text-secondary">Sample Type</p>
            <p className="text-sm font-semibold text-text-primary">{TEST_DATA.sampleType}</p>
          </div>
          <div className="flex-1 bg-card-bg rounded-xl p-3 border border-gray-100 text-center">
            <ShieldCheck size={20} className="mx-auto mb-1 text-green-600" />
            <p className="text-xs text-text-secondary">Certified</p>
            <p className="text-sm font-semibold text-text-primary">NABL</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card-bg rounded-2xl p-4 border border-gray-100">
          <h3 className="font-semibold text-text-primary mb-2">About the Test</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{TEST_DATA.description}</p>
        </div>

        {/* Test Includes */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Test Includes ({TEST_DATA.includes.length})</h3>
          <div className="grid grid-cols-2 gap-2">
            {TEST_DATA.includes.map((item) => (
              <div key={item} className="flex items-center gap-2 bg-card-bg rounded-xl p-3 border border-gray-100">
                <Check size={16} className="text-green-600" />
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Preparation Required</h3>
          <div className="space-y-2">
            {TEST_DATA.preparation.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-green-600 font-bold">{idx + 1}</span>
                </div>
                <p className="text-sm text-text-secondary">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Collection */}
        <div>
          <h3 className="font-semibold text-text-primary mb-3">Sample Collection</h3>
          <div className="space-y-2">
            {SAMPLE_COLLECTION_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setCollectionType(option.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl transition-all',
                  collectionType === option.id
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-card-bg border border-gray-100'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <option.icon size={22} className="text-text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-text-primary">{option.label}</p>
                  <p className="text-xs text-text-secondary">{option.subtitle}</p>
                </div>
                {collectionType === option.id && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-md mx-auto">
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-xs text-text-secondary">Total Price</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-text-primary">₹{TEST_DATA.price}</p>
              <p className="text-sm text-text-secondary line-through">₹{TEST_DATA.originalPrice}</p>
            </div>
          </div>
          <button className="flex-[2] bg-green-500 text-white rounded-xl font-semibold py-3 hover:bg-green-600 transition active:scale-[0.98]">
            Book Test
          </button>
        </div>
      </div>
    </div>
  );
}
