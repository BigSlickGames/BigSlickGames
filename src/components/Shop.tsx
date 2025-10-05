import React, { useState, useEffect } from 'react';
import { ShoppingCart, Coins, Star, Zap, Crown, Gem, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  chips: number;
  created_at: string;
  country?: string | null;
  level?: number;
  experience?: number;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  item_type: string;
  price_real_money: number;
  chip_amount: number;
  image_url?: string;
  sort_order: number;
  popular?: boolean;
  bonus_percentage?: number;
}

interface ShopProps {
  profile: UserProfile;
  onPurchase: (newChipAmount: number) => void;
  onBack: () => void;
}

const chipPackages: ShopItem[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Starter Pack',
    description: 'Perfect for beginners',
    item_type: 'chips',
    price_real_money: 0.99,
    chip_amount: 1000,
    sort_order: 1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Value Pack',
    description: 'Most popular choice',
    item_type: 'chips',
    price_real_money: 4.99,
    chip_amount: 5000,
    sort_order: 2,
    popular: true,
    bonus_percentage: 10,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Premium Pack',
    description: 'Great value for serious players',
    item_type: 'chips',
    price_real_money: 9.99,
    chip_amount: 12000,
    sort_order: 3,
    bonus_percentage: 20,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Mega Pack',
    description: 'Maximum chips for pros',
    item_type: 'chips',
    price_real_money: 19.99,
    chip_amount: 25000,
    sort_order: 4,
    bonus_percentage: 25,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Ultimate Pack',
    description: 'The ultimate gaming experience',
    item_type: 'chips',
    price_real_money: 49.99,
    chip_amount: 75000,
    sort_order: 5,
    bonus_percentage: 50,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Legendary Pack',
    description: 'For the ultimate high roller',
    item_type: 'chips',
    price_real_money: 99.99,
    chip_amount: 200000,
    sort_order: 6,
    bonus_percentage: 100,
  },
];

const getPackageIcon = (packageId: string) => {
  switch (packageId) {
    case 'starter': return Coins;
    case 'value': return Star;
    case 'premium': return Zap;
    case 'mega': return Crown;
    case 'ultimate': return Gem;
    case 'legendary': return Crown;
    default: return Coins;
  }
};

const getPackageColor = (packageId: string) => {
  switch (packageId) {
    case 'starter': return 'from-gray-500 to-gray-600';
    case 'value': return 'from-blue-500 to-blue-600';
    case 'premium': return 'from-purple-500 to-purple-600';
    case 'mega': return 'from-pink-500 to-pink-600';
    case 'ultimate': return 'from-yellow-500 to-orange-500';
    case 'legendary': return 'from-gradient-to-r from-purple-600 via-pink-600 to-red-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

export default function Shop({ profile, onPurchase, onBack }: ShopProps) {
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const handlePurchase = async (item: ShopItem) => {
    setLoading(true);
    
    try {
      // Update chips in database
      const newChipAmount = profile.chips + item.chip_amount;
      
      const { error } = await supabase
        .from('profiles')
        .update({ chips: newChipAmount })
        .eq('id', profile.id);
      
      if (error) {
        console.error('Error updating chips:', error);
        throw error;
      }
      
      onPurchase(newChipAmount);
      
      setPurchaseSuccess(item.name);
      
      setTimeout(() => setPurchaseSuccess(null), 3000);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Games Hub</span>
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">Chip Shop</h2>
        <p className="text-gray-400 text-sm sm:text-lg">Get free chips to power up your gaming! (Payment integration coming soon)</p>
      </div>

      {purchaseSuccess && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 sm:p-4 text-center shadow-lg shadow-green-500/20">
          <p className="text-green-400 font-semibold">
            Successfully claimed {purchaseSuccess} chips! 🎉
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {chipPackages.map((item) => {
          const IconComponent = getPackageIcon(item.id);
          const colorClass = getPackageColor(item.id);
          
          return (
            <div
              key={item.id}
              className={`relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-4 sm:p-6 hover:bg-gradient-to-br hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 hover:scale-105 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/20 touch-manipulation ${
                item.popular ? 'ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/20' : ''
              }`}
            >
              {item.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/50">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {item.bonus_percentage && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                    +{item.bonus_percentage}% BONUS
                  </div>
                </div>
              )}

              <div className="text-center space-y-3 sm:space-y-4">
                <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${colorClass} rounded-2xl flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">{item.description}</p>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <span className="text-xl sm:text-2xl font-bold text-yellow-400">
                      {item.chip_amount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    ${item.price_real_money}
                  </div>
                  
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {Math.round(item.chip_amount / item.price_real_money).toLocaleString()} chips per $1
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${colorClass} text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/30 touch-manipulation text-sm sm:text-base`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Get Free Chips</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl shadow-orange-500/10">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Secure Payment</h3>
          <p className="text-gray-400">
            All transactions are processed securely. Your payment information is never stored on our servers.
          </p>
          <div className="flex justify-center space-x-4 text-gray-400">
            <span>🔒 SSL Encrypted</span>
            <span>💳 Stripe Powered</span>
            <span>🛡️ PCI Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}