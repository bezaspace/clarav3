import { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { 
  ShoppingBag, Plus, Zap, Star,
  MapPin, Video, GraduationCap, Store, Stethoscope, TestTubes,
  Utensils, Clock, Bike
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '@/src/lib/api';
import type { FoodItem, Professional, Product } from '@/src/lib/types';

const fallbackProducts: Product[] = [];
const fallbackProfessionals: Professional[] = [];
const fallbackFoodItems: FoodItem[] = [];

export default function Care() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shop' | 'doctors' | 'labs' | 'food'>('shop');
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [professionals, setProfessionals] = useState<Professional[]>(fallbackProfessionals);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(fallbackFoodItems);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      api.careProducts(),
      api.careProfessionals(),
      api.careFood(),
    ])
      .then(([productsData, professionalsData, foodData]) => {
        if (!isActive) return;
        setProducts(productsData);
        setProfessionals(professionalsData);
        setFoodItems(foodData);
      })
      .catch(() => {
        if (!isActive) return;
        setProducts(fallbackProducts);
        setProfessionals(fallbackProfessionals);
        setFoodItems(fallbackFoodItems);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (loading) {
    return <div className="text-sm text-stone-500">Loading...</div>;
  }

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
