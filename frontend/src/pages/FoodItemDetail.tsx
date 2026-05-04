import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  Plus,
  Minus,
  Clock,
  Bike,
  Leaf,
  Flame,
  Info,
} from 'lucide-react';

// Mock food item data
const FOOD_DATA = {
  id: '1',
  name: 'Organic Quinoa Bowl',
  restaurant: 'Healthy Eats',
  price: 399,
  rating: 4.7,
  reviews: 156,
  image: '🥗',
  description: 'Fresh organic quinoa bowl with roasted vegetables, chickpeas, and tahini dressing.',
  isVeg: true,
  calories: 450,
  prepTime: '25 min',
  tags: ['Healthy', 'High Protein', 'Gluten Free'],
  customization: [
    { name: 'Extra Dressing', price: 30 },
    { name: 'Add Avocado', price: 50 },
    { name: 'Add Grilled Tofu', price: 80 },
  ],
};

export default function FoodItemDetail() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const toggleAddon = (name: string) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const addonTotal = FOOD_DATA.customization
    .filter((c) => selectedAddons.includes(c.name))
    .reduce((sum, c) => sum + c.price, 0);

  const totalPrice = (FOOD_DATA.price + addonTotal) * quantity;

  return (
    <div className="min-h-screen bg-bg-primary pb-32">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition"
        >
          <ChevronLeft size={20} className="text-text-primary" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition',
              isWishlisted ? 'bg-red-100' : 'bg-white shadow-sm hover:bg-gray-50'
            )}
          >
            <Heart
              size={20}
              className={cn(isWishlisted ? 'text-red-500 fill-red-500' : 'text-text-primary')}
            />
          </button>
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition">
            <Share2 size={20} className="text-text-primary" />
          </button>
        </div>
      </div>

      {/* Food Image */}
      <div className="px-5 mb-6">
        <div className="bg-green-50 rounded-3xl aspect-square flex items-center justify-center relative">
          <span className="text-[120px]">{FOOD_DATA.image}</span>
          {FOOD_DATA.tags.map((tag, idx) => (
            <span
              key={tag}
              className={cn(
                'absolute text-xs font-bold px-3 py-1 rounded-full',
                idx === 0 && 'top-4 left-4 bg-green-500 text-white',
                idx === 1 && 'top-4 right-4 bg-amber-500 text-white',
                idx === 2 && 'bottom-4 left-4 bg-blue-500 text-white'
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Food Info */}
      <div className="px-5 space-y-5">
        {/* Title & Rating */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            {FOOD_DATA.isVeg ? (
              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <Leaf size={14} /> Vegetarian
              </span>
            ) : null}
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-1">{FOOD_DATA.name}</h1>
          <p className="text-sm text-text-secondary">by {FOOD_DATA.restaurant}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-lg">
              <Star size={14} className="text-amber-600 fill-amber-600" />
              <span className="text-sm font-semibold text-amber-700">{FOOD_DATA.rating}</span>
            </div>
            <span className="text-sm text-text-secondary">({FOOD_DATA.reviews} reviews)</span>
            <span className="text-sm text-text-secondary">•</span>
            <div className="flex items-center gap-1 text-sm text-text-secondary">
              <Flame size={14} className="text-orange-500" />
              {FOOD_DATA.calories} kcal
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-text-primary">₹{FOOD_DATA.price}</span>
        </div>

        {/* Delivery Info */}
        <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock size={18} className="text-blue-600" />
            <span>{FOOD_DATA.prepTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Bike size={18} className="text-green-600" />
            <span>Free delivery</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-text-primary mb-2">About</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{FOOD_DATA.description}</p>
        </div>

        {/* Customization */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-text-primary">Add-ons</h3>
            <span className="text-xs text-text-secondary">(Optional)</span>
          </div>
          <div className="space-y-2">
            {FOOD_DATA.customization.map((addon) => (
              <button
                key={addon.name}
                onClick={() => toggleAddon(addon.name)}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-xl transition-all',
                  selectedAddons.includes(addon.name)
                    ? 'bg-orange-50 border-2 border-orange-200'
                    : 'bg-card-bg border border-gray-100'
                )}
              >
                <span className="text-sm font-medium text-text-primary">{addon.name}</span>
                <span className="text-sm font-semibold text-text-primary">+₹{addon.price}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-md mx-auto">
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm"
            >
              <Minus size={18} className="text-text-primary" />
            </button>
            <span className="w-8 text-center font-semibold text-text-primary">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm"
            >
              <Plus size={18} className="text-text-primary" />
            </button>
          </div>
          <button className="flex-1 bg-orange-500 text-white rounded-xl font-semibold py-3.5 hover:bg-orange-600 transition active:scale-[0.98]">
            Add to Order • ₹{totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
}
