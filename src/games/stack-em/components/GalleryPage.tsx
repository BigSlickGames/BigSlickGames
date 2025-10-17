import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, Crown, Lock, Check } from 'lucide-react';

interface GalleryPageProps {
  onClose: () => void;
  onBack: () => void;
  chips: number;
  onPurchaseBackground: (backgroundId: string, cost: number) => boolean;
  ownedBackgrounds: string[];
  activeBackground: string;
  onSetActiveBackground: (backgroundId: string) => void;
}

interface BackgroundItem {
  id: string;
  name: string;
  preview: string;
  price: number;
  isPremium: boolean;
  isOwned: boolean;
  isActive: boolean;
}

export function GalleryPage({ 
  onClose, 
  onBack, 
  chips, 
  onPurchaseBackground, 
  ownedBackgrounds, 
  activeBackground, 
  onSetActiveBackground 
}: GalleryPageProps) {
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);

  const backgrounds: Omit<BackgroundItem, 'isOwned' | 'isActive'>[] = [
    {
      id: 'default',
      name: 'Mystic Blue',
      preview: '/images/BlueSplashBlankBackground.png',
      price: 0,
      isPremium: false
    },
    {
      id: 'ocean',
      name: 'Ocean Depths',
      preview: '/images/21 Stack\'em New blackground.jpg',
      price: 299,
      isPremium: true
    },
    {
      id: 'clouds',
      name: 'Cloudy Sky',
      preview: '/images/cloudy sky.jpg',
      price: 99,
      isPremium: false
    },
    {
      id: 'sunshine',
      name: 'Golden Sunshine',
      preview: '/images/GreySplashBlankBackgroundsunshine.png',
      price: 149,
      isPremium: false
    },
    {
      id: 'summer',
      name: 'Summer Days',
      preview: '/images/summer days.jpg',
      price: 199,
      isPremium: false
    }
  ];

  const backgroundsWithStatus: BackgroundItem[] = backgrounds.map(bg => ({
    ...bg,
    isOwned: ownedBackgrounds.includes(bg.id),
    isActive: activeBackground === bg.id
  }));
  const handleBackgroundSelect = (background: BackgroundItem) => {
    if (background.isOwned) {
      onSetActiveBackground(background.id);
    } else {
      setSelectedBackground(background.id);
    }
  };

  const handlePurchase = (backgroundId: string) => {
    const background = backgrounds.find(bg => bg.id === backgroundId);
    if (background && onPurchaseBackground(backgroundId, background.price)) {
      setSelectedBackground(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-30"
    >
      <div className="absolute inset-0">
        <img 
          src="/images/BlueSplashBlankBackground.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <button
        onClick={onClose}
        className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={onBack}
        className="absolute left-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full p-6 pt-16">
          <h1 className="text-3xl font-bold text-center text-white mb-2">Background Gallery</h1>
          <p className="text-white/70 text-center mb-8">Customize your game experience</p>

          <div className="max-w-md mx-auto space-y-4">
            {backgroundsWithStatus.map((background) => (
              <motion.div
                key={background.id}
                whileHover={{ scale: 1.02 }}
                className={`relative bg-white/10 rounded-xl border overflow-hidden ${
                  background.isActive 
                    ? 'border-emerald-400/50 bg-emerald-500/10' 
                    : 'border-white/25 bg-gradient-to-br from-white/15 via-white/8 to-white/3 backdrop-blur-md shadow-lg before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none'
                }`}
              >
                <div className="aspect-video relative">
                  <img 
                    src={background.preview}
                    alt={background.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {background.isPremium && (
                    <div className="absolute top-2 left-2 bg-yellow-500/90 backdrop-blur-sm rounded-full p-1">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {background.isActive && (
                    <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {!background.isOwned && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white/80" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{background.name}</h3>
                    {background.isPremium && (
                      <Crown className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-white/70">
                      {background.price === 0 ? 'Free' : `${background.price} chips`}
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBackgroundSelect(background)}
                      disabled={background.isActive}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        background.isActive
                          ? 'bg-emerald-500/30 text-emerald-300 cursor-default'
                          : background.isOwned
                            ? 'bg-blue-500/80 hover:bg-blue-500 text-white'
                            : chips >= background.price
                              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                              : 'bg-red-500/30 text-red-300 cursor-not-allowed border border-red-400/30'
                      }`}
                    >
                      {background.isActive 
                        ? 'Active' 
                        : background.isOwned 
                          ? 'Select' 
                          : chips >= background.price
                            ? 'Purchase'
                            : 'Not enough chips'
                      }
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              More backgrounds coming soon!
            </p>
          </div>
        </div>
      </div>

      {selectedBackground && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full border border-white/20"
          >
            {(() => {
              const bg = backgrounds.find(b => b.id === selectedBackground);
              return bg ? (
                <>
                  <h2 className="text-xl font-bold text-white mb-4 text-center">
                    Purchase {bg.name}
                  </h2>
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={bg.preview}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white/80 text-center mb-6">
                    Cost: {bg.price} chips
                  </p>
                  <p className="text-white/60 text-center mb-6">
                    Your chips: {chips.toLocaleString()}
                  </p>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBackground(null)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/20"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePurchase(bg.id)}
                      disabled={chips < bg.price}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        chips >= bg.price
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-red-500/50 text-red-200 cursor-not-allowed'
                      }`}
                    >
                      {chips >= bg.price ? 'Purchase' : 'Not enough chips'}
                    </motion.button>
                  </div>
                </>
              ) : null;
            })()}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}