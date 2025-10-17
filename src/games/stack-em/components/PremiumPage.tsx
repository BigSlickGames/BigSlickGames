import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, Crown, Music2, Palette, Image } from 'lucide-react';

interface PremiumPageProps {
  onClose: () => void;
  onBack: () => void;
  onShowGallery: () => void;
}

export function PremiumPage({ onClose, onBack, onShowGallery }: PremiumPageProps) {
  const premiumFeatures = [
    {
      icon: <Image className="w-6 h-6 text-emerald-400" />,
      title: "Background Gallery",
      description: "Access to premium backgrounds and themes",
      action: onShowGallery,
      buttonText: "Open Gallery"
    },
    {
      icon: <Music2 className="w-6 h-6 text-emerald-400" />,
      title: "Premium Music",
      description: "Unlock additional background music tracks",
      action: null,
      buttonText: "Coming Soon"
    },
    {
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      title: "Special Card Designs",
      description: "Unique card designs and animations",
      action: null,
      buttonText: "Coming Soon"
    }
  ];

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
        <div className="min-h-full p-6">
          <h1 className="text-3xl font-bold text-center text-white mb-8">Premium Features</h1>

          <div className="max-w-md mx-auto space-y-6">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-6 rounded-xl border border-white/30 backdrop-blur-md shadow-lg relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/15 before:to-transparent before:pointer-events-none"
              >
                <div className="flex items-center gap-3 mb-2">
                  {feature.icon}
                  <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
                </div>
                <p className="text-white/80">{feature.description}</p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={feature.action || undefined}
                  disabled={!feature.action}
                  className={`w-full mt-4 py-2 rounded-lg font-medium transition-colors ${
                    feature.action
                      ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white'
                      : 'bg-white/10 text-white/60 cursor-not-allowed'
                  }`}
                >
                  {feature.buttonText}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}