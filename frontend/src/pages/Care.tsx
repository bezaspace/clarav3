import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import {
  ChevronLeft,
  Search,
  Bell,
  Pill,
  UtensilsCrossed,
  FlaskConical,
  Stethoscope,
  ShoppingBasket,
  ChevronRight,
  Package,
  Apple,
  Heart,
  Baby,
  Plus,
  Star,
  MapPin,
  Video,
  Clock,
  Bike,
  ArrowLeft,
} from 'lucide-react';

type CategoryType = 'home' | 'pharmacy' | 'food' | 'lab-tests' | 'doctors' | 'groceries';

const CATEGORY_BUTTONS = [
  { id: 'pharmacy' as CategoryType, icon: Pill, label: 'Pharmacy', color: 'bg-blue-100 text-blue-600' },
  { id: 'food' as CategoryType, icon: UtensilsCrossed, label: 'Food', color: 'bg-orange-100 text-orange-600' },
  { id: 'lab-tests' as CategoryType, icon: FlaskConical, label: 'Lab Tests', color: 'bg-green-100 text-green-600' },
  { id: 'doctors' as CategoryType, icon: Stethoscope, label: 'Doctors', color: 'bg-purple-100 text-purple-600' },
  { id: 'groceries' as CategoryType, icon: ShoppingBasket, label: 'Groceries', color: 'bg-amber-100 text-amber-600' },
];

const CATEGORIES = [
  { icon: Package, label: 'Health Products', color: 'bg-blue-50 text-blue-600' },
  { icon: Apple, label: 'Nutrition & Snacks', color: 'bg-green-50 text-green-600' },
  { icon: Heart, label: 'Personal Care', color: 'bg-orange-50 text-orange-600' },
  { icon: Baby, label: 'Baby Care', color: 'bg-purple-50 text-purple-600' },
];

// Mock data for each category
const PHARMACY_PRODUCTS = [
  { id: '1', name: 'Omega 3 Fish Oil', price: '₹899', image: '🍶', tag: 'Bestseller', rating: 4.8 },
  { id: '2', name: 'Vitamin D3', price: '₹499', image: '☀️', tag: 'Popular', rating: 4.6 },
  { id: '3', name: 'Multivitamin', price: '₹699', image: '💊', tag: 'New', rating: 4.5 },
  { id: '4', name: 'Probiotics', price: '₹599', image: '🦠', tag: '', rating: 4.4 },
  { id: '5', name: 'Calcium + D3', price: '₹449', image: '🥛', tag: 'Sale', rating: 4.7 },
  { id: '6', name: 'Iron Supplement', price: '₹349', image: '⚡', tag: '', rating: 4.3 },
];

const FOOD_ITEMS = [
  { id: '1', name: 'Organic Oats', price: '₹249', image: '🌾', tag: 'Healthy', rating: 4.9, time: '30 min', restaurant: 'Organic Store' },
  { id: '2', name: 'Quinoa Bowl', price: '₹399', image: '🥗', tag: 'Popular', rating: 4.7, time: '25 min', restaurant: 'Healthy Eats' },
  { id: '3', name: 'Fresh Salad', price: '₹299', image: '🥬', tag: 'Fresh', rating: 4.6, time: '20 min', restaurant: 'Green Kitchen' },
  { id: '4', name: 'Smoothie Bowl', price: '₹349', image: '🥣', tag: 'New', rating: 4.8, time: '15 min', restaurant: 'Fruit Bar' },
];

const LAB_TESTS = [
  { id: '1', name: 'Complete Blood Count', price: '₹499', image: '🔬', provider: 'Thyrocare', rating: 4.8 },
  { id: '2', name: 'Diabetes Panel', price: '₹899', image: '🩸', provider: 'Metropolis', rating: 4.7 },
  { id: '3', name: 'Thyroid Profile', price: '₹699', image: '📊', provider: 'SRL Labs', rating: 4.6 },
  { id: '4', name: 'Lipid Profile', price: '₹599', image: '💉', provider: 'Thyrocare', rating: 4.9 },
];

const DOCTORS = [
  { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', price: '₹800', image: '👩‍⚕️', rating: 4.9, reviews: 128, experience: '15 years', isOnline: true, availability: 'Today' },
  { id: '2', name: 'Dr. Michael Chen', specialty: 'General Physician', price: '₹500', image: '👨‍⚕️', rating: 4.7, reviews: 95, experience: '10 years', isOnline: false, availability: 'Tomorrow' },
  { id: '3', name: 'Dr. Priya Sharma', specialty: 'Dermatologist', price: '₹700', image: '👩‍⚕️', rating: 4.8, reviews: 156, experience: '12 years', isOnline: true, availability: 'Today' },
];

const GROCERY_ITEMS = [
  { id: '1', name: 'Organic Rice', price: '₹199', image: '�', tag: 'Organic', rating: 4.8 },
  { id: '2', name: 'Whole Wheat Flour', price: '₹149', image: '🌾', tag: 'Popular', rating: 4.6 },
  { id: '3', name: 'Cold Pressed Oil', price: '₹399', image: '🫒', tag: 'Healthy', rating: 4.7 },
  { id: '4', name: 'Organic Dal', price: '₹179', image: '🥘', tag: 'Sale', rating: 4.5 },
  { id: '5', name: 'Honey', price: '₹299', image: '🍯', tag: 'Pure', rating: 4.9 },
  { id: '6', name: 'Dry Fruits Mix', price: '₹499', image: '🥜', tag: '', rating: 4.7 },
];

const TOP_PICKS = [
  { id: '1', name: 'Omega 3 Fish Oil', price: '₹899', image: '🍶', tag: 'Bestseller' },
  { id: '2', name: 'Organic Oats', price: '₹249', image: '🌾', tag: 'Popular' },
  { id: '3', name: 'Vitamin D3', price: '₹499', image: '☀️', tag: 'New' },
  { id: '4', name: 'Protein Powder', price: '₹1,299', image: '💪', tag: 'Sale' },
];

export default function Care() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('pharmacy');

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'pharmacy':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveCategory('home')}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <ArrowLeft size={18} className="text-text-primary" />
              </button>
              <h2 className="text-xl font-bold text-text-primary">Pharmacy</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {PHARMACY_PRODUCTS.map((product) => (
                <button
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition"
                >
                  <div className="aspect-square bg-blue-50 rounded-xl flex items-center justify-center text-4xl mb-3 relative">
                    {product.image}
                    {product.tag && (
                      <span className="absolute top-2 left-2 bg-blue-500 text-white text-[8px] uppercase font-bold px-1.5 py-0.5 rounded">
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs text-text-secondary">{product.rating}</span>
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">{product.price}</span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart logic
                      }}
                      className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition"
                    >
                      <Plus size={18} className="text-blue-600" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'food':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveCategory('home')}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <ArrowLeft size={18} className="text-text-primary" />
              </button>
              <h2 className="text-xl font-bold text-text-primary">Food Delivery</h2>
            </div>
            <div className="space-y-4">
              {FOOD_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/food-item/${item.id}`)}
                  className="w-full bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-orange-50 rounded-xl flex items-center justify-center text-4xl shrink-0">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs text-text-secondary">{item.rating}</span>
                        {item.tag && (
                          <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-text-primary text-base mb-1">{item.name}</h3>
                      <p className="text-xs text-text-secondary mb-2">{item.restaurant}</p>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {item.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bike size={12} /> Free delivery
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-text-primary">{item.price}</span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to order logic
                          }}
                          className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold hover:bg-orange-200 transition"
                        >
                          Add
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'lab-tests':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveCategory('home')}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <ArrowLeft size={18} className="text-text-primary" />
              </button>
              <h2 className="text-xl font-bold text-text-primary">Lab Tests</h2>
            </div>
            <div className="space-y-4">
              {LAB_TESTS.map((test) => (
                <button
                  key={test.id}
                  onClick={() => navigate(`/lab-test/${test.id}`)}
                  className="w-full bg-card-bg rounded-2xl p-5 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      {test.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs text-text-secondary">{test.rating}</span>
                      </div>
                      <h3 className="font-semibold text-text-primary text-base mb-1">{test.name}</h3>
                      <p className="text-xs text-text-secondary mb-3">{test.provider}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary">{test.price}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            // Quick book logic
                          }}
                          className="px-5 py-2 bg-green-500 text-white rounded-xl text-xs font-semibold hover:bg-green-600 transition"
                        >
                          Book Now
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'doctors':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveCategory('home')}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <ArrowLeft size={18} className="text-text-primary" />
              </button>
              <h2 className="text-xl font-bold text-text-primary">Doctors</h2>
            </div>
            <div className="space-y-4">
              {DOCTORS.map((doctor) => (
                <div key={doctor.id} className="bg-card-bg rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center text-4xl shrink-0">
                      {doctor.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-text-primary text-base">{doctor.name}</h3>
                          <p className="text-xs text-purple-600">{doctor.specialty}</p>
                        </div>
                        {doctor.isOnline && (
                          <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                            <Video size={10} /> Online
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          {doctor.rating} ({doctor.reviews})
                        </span>
                        <span>{doctor.experience}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-text-secondary uppercase">Consultation</p>
                          <p className="font-bold text-text-primary">{doctor.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-text-secondary">Earliest Slot</p>
                          <p className="text-xs text-green-600 font-semibold">{doctor.availability}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/book-appointment/${doctor.id}`)}
                        className="w-full mt-3 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'groceries':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveCategory('home')}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <ArrowLeft size={18} className="text-text-primary" />
              </button>
              <h2 className="text-xl font-bold text-text-primary">Groceries</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {GROCERY_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition"
                >
                  <div className="aspect-square bg-amber-50 rounded-xl flex items-center justify-center text-4xl mb-3 relative">
                    {item.image}
                    {item.tag && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] uppercase font-bold px-1.5 py-0.5 rounded">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs text-text-secondary">{item.rating}</span>
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-1">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">{item.price}</span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart logic
                      }}
                      className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-200 transition"
                    >
                      <Plus size={18} className="text-amber-600" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Featured Banner */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Featured</h2>
              <div className="bg-green-50 rounded-2xl p-5 border border-green-100 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-green-600 text-sm font-medium mb-1">Up to 20% off</p>
                  <h3 className="text-xl font-bold text-text-primary mb-4">Health Essentials</h3>
                  <button className="bg-text-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-text-primary/90 transition">
                    Shop Now
                  </button>
                </div>
                <div className="absolute right-2 bottom-2 text-6xl opacity-30">🍶</div>
                <div className="absolute right-16 top-2 text-4xl opacity-20">💊</div>
              </div>
            </div>

            {/* Categories Grid */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Categories</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.label}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-2xl transition-all hover:shadow-md',
                      category.color,
                      'bg-opacity-30 border border-current border-opacity-20'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
                      <category.icon size={20} />
                    </div>
                    <span className="text-sm font-semibold text-text-primary">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Picks */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Top Picks</h2>
              <div className="grid grid-cols-2 gap-4">
                {TOP_PICKS.map((product) => (
                  <div key={product.id} className="bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-4xl mb-3 relative">
                      {product.image}
                      {product.tag && (
                        <span className="absolute top-2 left-2 bg-green-500 text-white text-[8px] uppercase font-bold px-1.5 py-0.5 rounded">
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary">{product.price}</span>
                      <button className="w-8 h-8 rounded-full bg-header-yellow flex items-center justify-center hover:bg-accent-yellow transition active:scale-95">
                        <Plus size={18} className="text-text-primary" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
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
          <h1 className="text-text-primary font-semibold text-lg">Care</h1>
          <button className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition relative">
            <Bell size={20} className="text-text-primary" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* Search bar - only show on home */}
        {activeCategory === 'home' && (
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search products, doctors, labs..."
              className="w-full bg-white/60 rounded-full py-3 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        )}

        {/* Category icons */}
        <div className="flex justify-between items-start">
          {CATEGORY_BUTTONS.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'flex flex-col items-center gap-2 group',
                activeCategory === category.id && 'opacity-100',
                activeCategory !== 'home' && activeCategory !== category.id && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center transition-transform group-active:scale-95',
                  category.color,
                  activeCategory === category.id && 'ring-2 ring-offset-2 ring-text-primary'
                )}
              >
                <category.icon size={24} />
              </div>
              <span className="text-xs font-medium text-text-primary">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 py-6">
        {renderCategoryContent()}
      </div>
    </div>
  );
}
