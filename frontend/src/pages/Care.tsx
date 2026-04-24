import { useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { 
  ShoppingBag, Search, Filter, Plus, Zap, Star,
  MapPin, Video, GraduationCap, Building2, Store, Stethoscope, TestTubes,
  Utensils, Clock, Bike
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// --- DATA: SHOP ---
interface Product {
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

const products: Product[] = [
  // Groceries
  { id: '1', name: 'A2 Desi Cow Ghee', category: 'Groceries', price: 950, originalPrice: 1100, unit: '500ml', rating: 4.9, image: '🍯', tag: 'Best Seller', isOffer: true },
  { id: '2', name: 'Organic Ragi (Finger Millet)', category: 'Groceries', price: 85, unit: '1kg', rating: 4.7, image: '🌾' },
  { id: '3', name: 'Cold Pressed Groundnut Oil', category: 'Groceries', price: 240, unit: '1L', rating: 4.8, image: '🫗' },
  { id: '4', name: 'High Protein Paneer', category: 'Groceries', price: 120, unit: '200g', rating: 4.6, image: '🧀' },
  { id: '5', name: 'Sourdough Whole Wheat Bread', category: 'Groceries', price: 75, unit: '400g', rating: 4.5, image: '🍞' },
  { id: '6', name: 'Organic Turmeric (Lakadong)', category: 'Groceries', price: 180, unit: '200g', rating: 5.0, image: '🫚', tag: 'High Curcumin' },
  { id: '7', name: 'Pink Himalayan Salt', category: 'Groceries', price: 95, unit: '1kg', rating: 4.7, image: '🧂' },
  { id: '8', name: 'Stevia Natural Sweetener', category: 'Groceries', price: 350, unit: '100g', rating: 4.4, image: '🍃' },

  // Ayurveda
  { id: '9', name: 'Ashwagandha Gold Capsules', category: 'Ayurveda', price: 499, originalPrice: 599, unit: '60 caps', rating: 4.8, image: '💊', isOffer: true },
  { id: '10', name: 'Chyawanprash (Sugar-Free)', category: 'Ayurveda', price: 550, unit: '500g', rating: 4.9, image: '🏺' },
  { id: '11', name: 'Triphala Effervescent Tabs', category: 'Ayurveda', price: 299, unit: '15 tabs', rating: 4.7, image: '🥤' },
  { id: '12', name: 'Brahmi Brain Tonic', category: 'Ayurveda', price: 180, unit: '200ml', rating: 4.6, image: '🧪' },
  { id: '13', name: 'Neem & Tulsi Skin Elixir', category: 'Ayurveda', price: 250, unit: '100ml', rating: 4.5, image: '🌿' },
  { id: '14', name: 'Shilajit (Pure Resin)', category: 'Ayurveda', price: 1250, unit: '20g', rating: 5.0, image: '🖤', tag: 'Premium' },
  { id: '15', name: 'Amrit Kalash 5-in-1', category: 'Ayurveda', price: 890, unit: '600g', rating: 4.8, image: '✨' },

  // Fitness
  { id: '16', name: 'Eco-Friendly Cork Yoga Mat', category: 'Fitness', price: 1850, originalPrice: 2200, unit: '6mm', rating: 4.9, image: '🧘', isOffer: true },
  { id: '17', name: 'Copper Water Bottle (Lacquered)', category: 'Fitness', price: 750, unit: '1L', rating: 4.7, image: '🧴' },
  { id: '18', name: 'Resistance Band Set (5)', category: 'Fitness', price: 950, unit: 'Set', rating: 4.6, image: '🎗️' },
  { id: '19', name: 'Whey Protein Isolate (Kulfi)', category: 'Fitness', price: 2850, unit: '1kg', rating: 4.8, image: '💪', tag: 'New Flavor' },
  { id: '20', name: 'Creatine Monohydrate', category: 'Fitness', price: 850, unit: '250g', rating: 4.7, image: '⚡' },
  { id: '21', name: 'Massage Foam Roller', category: 'Fitness', price: 550, unit: '1 unit', rating: 4.5, image: '🩹' },
  { id: '22', name: 'BPA-Free Gym Shaker', category: 'Fitness', price: 299, unit: '700ml', rating: 4.4, image: '🥤' },

  // Medication
  { id: '23', name: 'Multivitamin for Men/Women', category: 'Medication', price: 650, originalPrice: 850, unit: '60 tabs', rating: 4.8, image: '💊', isOffer: true },
  { id: '24', name: 'Vitamin D3 60K IU', category: 'Medication', price: 120, unit: '4 softgels', rating: 4.9, image: '☀️' },
  { id: '25', name: 'Omega-3 Fish Oil', category: 'Medication', price: 950, unit: '60 caps', rating: 4.7, image: '🐟' },
  { id: '26', name: 'Melatonin Sleep Support', category: 'Medication', price: 350, unit: '30 gummies', rating: 4.6, image: '🌙' },
  { id: '27', name: 'Quick Relief Digestion Fizz', category: 'Medication', price: 45, unit: '6 sachets', rating: 4.5, image: '🧊' },
  { id: '28', name: 'Organic Eye Drops', category: 'Medication', price: 150, unit: '10ml', rating: 4.6, image: '💧' },
  { id: '29', name: 'Ayurvedic Anti-Cold Balm', category: 'Medication', price: 65, unit: '25g', rating: 4.8, image: '💆' },
  { id: '30', name: 'Blood Pressure Monitor', category: 'Medication', price: 2450, unit: 'Digital', rating: 4.9, image: '🩺', tag: 'Certified' },
];

// --- DATA: DOCTORS & LABS ---
interface Professional {
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

const professionals: Professional[] = [
  // Doctors
  { id: '1', name: 'Dr. Aarav Sharma', specialty: 'Cardiologist', type: 'Doctor', experience: '15 years', rating: 4.9, reviews: 1200, location: 'Gurugram, HR', price: 1000, availability: 'Today', image: '👨‍⚕️', isOnline: true },
  { id: '2', name: 'Dr. Ishani Patel', specialty: 'Psychiatrist', type: 'Doctor', experience: '10 years', rating: 4.8, reviews: 850, location: 'Mumbai, MH', price: 1500, availability: 'Tomorrow', image: '👩‍⚕️', isOnline: true },
  { id: '3', name: 'Dr. Vikram Reddy', specialty: 'Endocrinologist', type: 'Doctor', experience: '20 years', rating: 5.0, reviews: 2100, location: 'Hyderabad, TS', price: 1200, availability: 'Today', image: '👨‍⚕️', isOnline: false },
  { id: '4', name: 'Dr. Ananya Iyer', specialty: 'Dermatologist', type: 'Doctor', experience: '8 years', rating: 4.7, reviews: 600, location: 'Chennai, TN', price: 800, availability: '24 Apr', image: '👩‍⚕️', isOnline: true },
  { id: '5', name: 'Dr. Sameer Khan', specialty: 'General Physician', type: 'Doctor', experience: '12 years', rating: 4.6, reviews: 1500, location: 'Delhi, DL', price: 500, availability: 'Today', image: '👨‍⚕️', isOnline: true },
  { id: '10', name: 'Dr. Kavita Nair', specialty: 'Psychiatrist', type: 'Doctor', experience: '14 years', rating: 4.9, reviews: 1100, location: 'Bangalore, KA', price: 2000, availability: 'Today', image: '👩‍⚕️', isOnline: true },
  { id: '11', name: 'Dr. Siddharth Malhotra', specialty: 'Clinical Psychologist', type: 'Doctor', experience: '9 years', rating: 4.8, reviews: 750, location: 'Pune, MH', price: 1800, availability: 'Tomorrow', image: '👨‍⚕️', isOnline: true },
  { id: '12', name: 'Dr. Riya Sen', specialty: 'Child Psychologist', type: 'Doctor', experience: '6 years', rating: 4.7, reviews: 320, location: 'Kolkata, WB', price: 1200, availability: '25 Apr', image: '👩‍⚕️', isOnline: true },
  { id: '13', name: 'Dr. Amit Trivedi', specialty: 'Addiction Psychiatrist', type: 'Doctor', experience: '18 years', rating: 5.0, reviews: 900, location: 'Ahmedabad, GJ', price: 2500, availability: 'Today', image: '👨‍⚕️', isOnline: false },
  { id: '14', name: 'Dr. Neha Kapoor', specialty: 'Gynecologist', type: 'Doctor', experience: '16 years', rating: 4.9, reviews: 3400, location: 'Chandigarh, CH', price: 1200, availability: 'Today', image: '👩‍⚕️', isOnline: true },
  { id: '15', name: 'Dr. Arjun Mehra', specialty: 'Orthopedic Surgeon', type: 'Doctor', experience: '22 years', rating: 4.8, reviews: 2800, location: 'Ludhiana, PB', price: 1500, availability: 'Tomorrow', image: '👨‍⚕️', isOnline: false },
  { id: '16', name: 'Dr. Priya Varma', specialty: 'Neurologist', type: 'Doctor', experience: '13 years', rating: 4.9, reviews: 1200, location: 'Jaipur, RJ', price: 1800, availability: 'Today', image: '👩‍⚕️', isOnline: true },
  { id: '17', name: 'Dr. Rajesh Bansal', specialty: 'Gastroenterologist', type: 'Doctor', experience: '19 years', rating: 4.7, reviews: 1900, location: 'Indore, MP', price: 1000, availability: '26 Apr', image: '👨‍⚕️', isOnline: true },
  { id: '18', name: 'Dr. Sunita Deshmukh', specialty: 'Ayurvedic MD', type: 'Doctor', experience: '25 years', rating: 5.0, reviews: 4500, location: 'Nashik, MH', price: 800, availability: 'Today', image: '👩‍⚕️', isOnline: true },
  { id: '19', name: 'Dr. Varun Joshi', specialty: 'Urologist', type: 'Doctor', experience: '10 years', rating: 4.6, reviews: 800, location: 'Surat, GJ', price: 1200, availability: 'Tomorrow', image: '👨‍⚕️', isOnline: false },
  { id: '20', name: 'Dr. Shalini Singh', specialty: 'ENT Specialist', type: 'Doctor', experience: '11 years', rating: 4.8, reviews: 1300, location: 'Lucknow, UP', price: 700, availability: 'Today', image: '👩‍⚕️', isOnline: true },

  // Labs
  { id: 'l1', name: 'AyuCare Diagnostics', specialty: 'Full Body Checkup', type: 'Lab', rating: 4.8, reviews: 5000, location: 'Indiranagar, Bangalore', price: 2999, availability: 'Home Collection', image: '🔬', isOnline: false },
  { id: 'l2', name: 'ThyroCloud Labs', specialty: 'Thyroid & Hormones', type: 'Lab', rating: 4.7, reviews: 12000, location: 'Multiple Locations', price: 499, availability: 'Home Collection', image: '🧪', isOnline: false },
  { id: 'l3', name: 'Metric Pathology', specialty: 'Biomarker Specialist', type: 'Lab', rating: 4.9, reviews: 3200, location: 'Whitefield, Bangalore', price: 1500, availability: 'Walk-in', image: '🧬', isOnline: false },
  { id: 'l4', name: 'Wellness Path Labs', specialty: 'Advanced Imaging', type: 'Lab', rating: 4.6, reviews: 2100, location: 'South Delhi', price: 5000, availability: 'Appointment Only', image: '📡', isOnline: false },
  { id: 'l5', name: 'Dr. Lal PathLabs', specialty: 'NABL Certified', type: 'Lab', rating: 4.8, reviews: 45000, location: 'Pan-India', price: 1200, availability: 'Home Collection', image: '🏢', isOnline: false },
  { id: 'l6', name: 'Metropolis Healthcare', specialty: 'Comprehensive Profiles', type: 'Lab', rating: 4.7, reviews: 38000, location: 'Pan-India', price: 1800, availability: 'Home Collection', image: '🔬', isOnline: false },
  { id: 'l7', name: 'Apollo Diagnostics', specialty: 'Specialized Testing', type: 'Lab', rating: 4.9, reviews: 15000, location: 'Mumbai & Chennai', price: 2500, availability: 'Walk-in', image: '🏥', isOnline: false },
  { id: 'l8', name: 'SRL Diagnostics', specialty: 'Reference Lab', type: 'Lab', rating: 4.6, reviews: 22000, location: 'Pan-India', price: 900, availability: 'Appointment Only', image: '🧪', isOnline: false },
  { id: 'l9', name: 'Suburban Diagnostics', specialty: 'Home Collection Expert', type: 'Lab', rating: 4.5, reviews: 9000, location: 'Pune & Mumbai', price: 600, availability: 'Home Collection', image: '🏢', isOnline: false },
  { id: 'l10', name: 'Hitech Diagnostics', specialty: 'Genetics & IVF', type: 'Lab', rating: 4.8, reviews: 4000, location: 'Hyderabad', price: 4500, availability: 'Advanced Booking', image: '🧬', isOnline: false },
];

// --- DATA: FOOD ---
interface FoodItem {
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

const foodItems: FoodItem[] = [
  { id: 'f1', restaurant: 'FitKitchen', name: 'Quinoa Paneer Salad', category: 'Healthy', price: 299, rating: 4.6, time: '30 min', image: '🥗', offer: 'Free Delivery', veg: true },
  { id: 'f2', restaurant: 'AyurDine', name: 'Sattvic Thali', category: 'Indian', price: 250, rating: 4.8, time: '40 min', image: '🍱', veg: true },
  { id: 'f3', restaurant: 'ProteinHouse', name: 'Grilled Chicken Breast', category: 'Keto', price: 350, rating: 4.5, time: '25 min', image: '🍗', offer: '20% OFF', veg: false },
  { id: 'f4', restaurant: 'SmoothieBar', name: 'Green Detox Smoothie', category: 'Beverages', price: 150, rating: 4.7, time: '15 min', image: '🥤', veg: true },
  { id: 'f5', restaurant: 'Leafy', name: 'Millet Khichdi', category: 'Comfort Food', price: 180, rating: 4.9, time: '35 min', image: '🍲', veg: true },
  { id: 'f6', restaurant: 'OvenStory', name: 'Multigrain Veg Pizza', category: 'Italian', price: 320, rating: 4.4, time: '45 min', image: '🍕', veg: true },
  { id: 'f7', restaurant: 'BowlCompany', name: 'Teriyaki Tofu Bowl', category: 'Asian', price: 280, rating: 4.5, time: '30 min', image: '🍜', veg: true },
  { id: 'f8', restaurant: 'WrapIt', name: 'Egg White Wholewheat Wrap', category: 'Snacks', price: 190, rating: 4.6, time: '20 min', image: '🌯', veg: false },
  { id: 'f9', restaurant: 'SweetTruth', name: 'Sugar-free Oat Cookies', category: 'Dessert', price: 120, rating: 4.7, time: '25 min', image: '🍪', offer: 'Buy 1 Get 1', veg: true },
  { id: 'f10', restaurant: 'SushiGo', name: 'Salmon Avocado Roll', category: 'Japanese', price: 450, rating: 4.8, time: '50 min', image: '🍣', veg: false },
];

export default function Care() {
  const [activeTab, setActiveTab] = useState<'shop' | 'doctors' | 'labs' | 'food'>('shop');
  const [cartCount, setCartCount] = useState(0);

  const renderShop = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      {products.map((product) => (
        <Card key={product.id} className="p-0 border-ayu-border group hover:border-ayu-saffron/30 transition-all flex flex-col">
          <div className="aspect-square bg-ayu-bg/50 flex items-center justify-center text-4xl relative overflow-hidden">
             {product.image}
             {product.tag && (
               <span className="absolute top-2 left-2 bg-ayu-green text-white text-[8px] uppercase font-bold px-1.5 py-0.5 rounded shadow-sm">
                 {product.tag}
               </span>
             )}
             {product.isOffer && (
               <div className="absolute top-2 right-2 bg-ayu-saffron/20 text-ayu-saffron p-1 rounded-full">
                  <Zap size={10} />
               </div>
             )}
          </div>

          <div className="p-3 flex flex-col flex-1">
            <div className="flex items-center gap-1 mb-1">
              <Star size={10} className="fill-ayu-saffron text-ayu-saffron" />
              <span className="text-[10px] font-bold text-stone-500">{product.rating}</span>
              <span className="text-[10px] text-stone-700 ml-1 uppercase font-bold tracking-tighter">({product.category})</span>
            </div>
            
            <h4 className="text-sm font-bold text-stone-200 line-clamp-1 mb-0.5 group-hover:text-ayu-saffron transition-colors">
              {product.name}
            </h4>
            <p className="text-[10px] text-stone-600 font-medium mb-3">{product.unit}</p>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex flex-col">
                {product.originalPrice && (
                  <span className="text-[10px] text-stone-700 line-through">₹{product.originalPrice}</span>
                )}
                <span className="text-sm font-bold text-stone-100">₹{product.price}</span>
              </div>
              <button 
                onClick={() => setCartCount(c => c + 1)}
                className="bg-ayu-card border border-ayu-border hover:bg-ayu-saffron hover:text-ayu-bg hover:border-ayu-saffron p-2 rounded-xl transition-all shadow-sm"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </motion.div>
  );

  const renderProfessionals = (typeFilter: 'Doctor' | 'Lab') => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {professionals.filter(p => p.type === typeFilter).map((item) => (
        <Card key={item.id} className="p-0 border-ayu-border overflow-hidden hover:border-ayu-green/30 transition-all group">
          <div className="p-5 flex gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-ayu-bg rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-ayu-border">
              {item.image}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="text-base font-bold text-stone-200 group-hover:text-ayu-green transition-colors">{item.name}</h4>
                  <p className="text-xs text-ayu-saffron font-medium">{item.specialty}</p>
                </div>
                {item.isOnline && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-ayu-green bg-ayu-green/10 px-2 py-0.5 rounded-full border border-ayu-green/20">
                    <Video size={10} />
                    ONLINE
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-y-2 gap-x-4 mt-3">
                <div className="flex items-center gap-1 text-[11px] text-stone-500">
                  <Star size={12} className="fill-ayu-saffron text-ayu-saffron" />
                  <span className="font-bold text-stone-300">{item.rating}</span>
                  <span className="opacity-60">({item.reviews})</span>
                </div>
                {item.experience && (
                  <div className="flex items-center gap-1 text-[11px] text-stone-500">
                    <GraduationCap size={12} />
                    <span>{item.experience} exp.</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[11px] text-stone-500">
                  <MapPin size={12} />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-ayu-bg/50 border-t border-ayu-border px-5 py-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-stone-600 uppercase font-bold tracking-widest">
                {item.type === 'Doctor' ? 'Consultation' : 'Test Price'}
              </span>
              <span className="text-sm font-bold text-stone-200">₹{item.price}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-stone-600 uppercase font-bold">Earliest Slot</p>
                <p className="text-xs text-ayu-green font-bold">{item.availability}</p>
              </div>
              <button className="px-5 py-2 bg-ayu-card hover:bg-ayu-green hover:text-white border border-ayu-border hover:border-ayu-green rounded-xl text-xs font-bold transition-all">
                Book Now
              </button>
            </div>
          </div>
        </Card>
      ))}
    </motion.div>
  );

  const renderFood = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {foodItems.map((item) => (
        <Card key={item.id} className="p-0 border-ayu-border hover:border-red-400/30 transition-all flex flex-col group overflow-hidden bg-ayu-card">
          <div className="h-36 bg-ayu-bg/80 flex items-center justify-center text-7xl relative">
             {item.image}
             {item.offer && (
               <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm">
                 {item.offer}
               </span>
             )}
          </div>

          <div className="p-4 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-1 gap-2">
              <div className="flex items-start gap-1.5 flex-1">
                <div className={cn("w-3 h-3 rounded-[2px] border mt-1.5 shrink-0 flex items-center justify-center", item.veg ? "border-green-600" : "border-red-600")}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", item.veg ? "bg-green-600" : "bg-red-600")}></div>
                </div>
                <h4 className="text-base font-bold text-stone-200 line-clamp-1 group-hover:text-red-400 transition-colors">
                  {item.name}
                </h4>
              </div>
              <div className="flex shrink-0 justify-center items-center gap-1 bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                 <Star size={10} className="fill-green-400 text-green-400" />
                 {item.rating}
              </div>
            </div>
            
            <p className="text-xs text-stone-500 font-medium truncate mb-3">{item.restaurant} • {item.category}</p>

            <div className="flex items-center gap-4 text-[11px] text-stone-400 font-medium mb-4 mt-auto">
               <div className="flex items-center gap-1">
                 <Clock size={12} className="text-stone-500" />
                 {item.time}
               </div>
               <div className="flex items-center gap-1">
                 <Bike size={12} className="text-stone-500" />
                 Free delivery
               </div>
            </div>

            <div className="border-t border-ayu-border pt-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-stone-100">₹{item.price}</span>
              </div>
              <button 
                onClick={() => setCartCount(c => c + 1)}
                className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                ADD
              </button>
            </div>
          </div>
        </Card>
      ))}
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <header className="flex items-center justify-between gap-5">
        {/* Custom Tab Navigation */}
        <div className="inline-flex bg-ayu-card p-1 items-center rounded-2xl border border-ayu-border shadow-sm flex-wrap w-full md:w-auto">
          <button
            onClick={() => setActiveTab('shop')}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === 'shop' 
                ? "bg-ayu-bg text-ayu-saffron shadow-sm" 
                : "text-stone-500 hover:text-stone-300"
            )}
          >
            <Store size={16} />
            Shop
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === 'doctors' 
                ? "bg-ayu-bg text-ayu-green shadow-sm" 
                : "text-stone-500 hover:text-stone-300"
            )}
          >
            <Stethoscope size={16} />
            Doctors Network
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === 'labs' 
                ? "bg-ayu-bg text-blue-400 shadow-sm" 
                : "text-stone-500 hover:text-stone-300"
            )}
          >
            <TestTubes size={16} />
            Testing Labs
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === 'food' 
                ? "bg-ayu-bg text-red-500 shadow-sm" 
                : "text-stone-500 hover:text-stone-300"
            )}
          >
            <Utensils size={16} />
            Food Delivery
          </button>
        </div>

        {['shop', 'food'].includes(activeTab) && (
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="bg-ayu-saffron text-ayu-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute -top-2 -right-2 z-10 shadow border border-ayu-bg">
              {cartCount}
            </div>
            <button className="p-2.5 border border-ayu-border rounded-xl bg-ayu-card hover:bg-ayu-bg transition-all">
              <ShoppingBag size={20} className="text-stone-300" />
            </button>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'shop' && renderShop()}
        {activeTab === 'doctors' && renderProfessionals('Doctor')}
        {activeTab === 'labs' && renderProfessionals('Lab')}
        {activeTab === 'food' && renderFood()}
      </AnimatePresence>
    </div>
  );
}
