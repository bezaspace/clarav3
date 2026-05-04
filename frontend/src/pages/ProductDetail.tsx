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
  Truck,
  ShieldCheck,
  Clock,
} from 'lucide-react';

// Mock product data - in real app would fetch by ID
const PRODUCT_DATA = {
  id: '1',
  name: 'Omega 3 Fish Oil',
  brand: 'HealthVit',
  price: 899,
  originalPrice: 1299,
  rating: 4.8,
  reviews: 324,
  image: '🍶',
  description: 'Premium quality Omega-3 fish oil capsules with EPA & DHA for heart, brain and joint health.',
  benefits: [
    'Supports heart health',
    'Promotes brain function',
    'Reduces inflammation',
    'Improves joint mobility',
  ],
  dosage: 'Take 1 capsule daily with meals',
  deliveryTime: '1-2 days',
  inStock: true,
};

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
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

      {/* Product Image */}
      <div className="px-5 mb-6">
        <div className="bg-blue-50 rounded-3xl aspect-square flex items-center justify-center relative">
          <span className="text-[120px]">{PRODUCT_DATA.image}</span>
          {PRODUCT_DATA.originalPrice > PRODUCT_DATA.price && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {Math.round((1 - PRODUCT_DATA.price / PRODUCT_DATA.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-5 space-y-5">
        {/* Title & Rating */}
        <div>
          <p className="text-sm text-text-secondary mb-1">{PRODUCT_DATA.brand}</p>
          <h1 className="text-xl font-bold text-text-primary mb-2">{PRODUCT_DATA.name}</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-lg">
              <Star size={14} className="text-amber-600 fill-amber-600" />
              <span className="text-sm font-semibold text-amber-700">{PRODUCT_DATA.rating}</span>
            </div>
            <span className="text-sm text-text-secondary">({PRODUCT_DATA.reviews} reviews)</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-text-primary">₹{PRODUCT_DATA.price}</span>
          {PRODUCT_DATA.originalPrice > PRODUCT_DATA.price && (
            <>
              <span className="text-lg text-text-secondary line-through">
                ₹{PRODUCT_DATA.originalPrice}
              </span>
              <span className="text-sm text-green-600 font-medium">
                Save ₹{PRODUCT_DATA.originalPrice - PRODUCT_DATA.price}
              </span>
            </>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-card-bg rounded-2xl p-4 border border-gray-100">
          <h3 className="font-semibold text-text-primary mb-3">Key Benefits</h3>
          <ul className="space-y-2">
            {PRODUCT_DATA.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Dosage */}
        <div className="bg-card-bg rounded-2xl p-4 border border-gray-100">
          <h3 className="font-semibold text-text-primary mb-1">Dosage</h3>
          <p className="text-sm text-text-secondary">{PRODUCT_DATA.dosage}</p>
        </div>

        {/* Delivery Info */}
        <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Truck size={18} className="text-green-600" />
            <span>Free delivery</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock size={18} className="text-blue-600" />
            <span>{PRODUCT_DATA.deliveryTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <ShieldCheck size={18} className="text-purple-600" />
            <span>Authentic</span>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-text-primary">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <Minus size={18} className="text-text-primary" />
            </button>
            <span className="w-8 text-center font-semibold text-text-primary">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <Plus size={18} className="text-text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-md mx-auto">
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-xs text-text-secondary">Total Price</p>
            <p className="text-lg font-bold text-text-primary">₹{PRODUCT_DATA.price * quantity}</p>
          </div>
          <button className="flex-[2] bg-blue-500 text-white rounded-xl font-semibold py-3 hover:bg-blue-600 transition active:scale-[0.98]">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
