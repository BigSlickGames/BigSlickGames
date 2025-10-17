import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PlayAgainAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
}

export function PlayAgainAdModal({ isOpen, onClose, onPlayAgain }: PlayAgainAdModalProps) {
  const [timeLeft, setTimeLeft] = useState(7);
  const [currentAd, setCurrentAd] = useState(0);

  const ads = [
    {
      id: 'sinkem',
      image: "/images/Sink'em Logo.PNG",
      title: "21 Sink'em",
      description: "Sink your cards to make 21!"
    },
    {
      id: 'multiup',
      image: "/images/21 Multiup logo.png",
      title: "21 Multi'up",
      description: "Multiple ways to stack 21!"
    },
    {
      id: 'holdem',
      image: "/images/new 21 Holdem Logo.png",
      title: "21 Hold'em",
      description: "Hold'em meets 21!"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      // Reset timer and select random ad
      setTimeLeft(7);
      setCurrentAd(Math.floor(Math.random() * ads.length));
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onPlayAgain();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, onPlayAgain]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full border border-white/30 shadow-2xl relative z-10"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 flex items-center justify-center">
                <img 
                  src={ads[currentAd].image}
                  alt={ads[currentAd].title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {ads[currentAd].title}
            </h2>
            <p className="text-white/80 mb-4">
              {ads[currentAd].description}
            </p>
            <p className="text-white/60 text-sm">
              Coming Soon from Big Slick Games!
            </p>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full border-2 border-emerald-400/50 mb-2">
              <span className="text-2xl font-bold text-emerald-400">
                {timeLeft}
              </span>
            </div>
            <p className="text-white/70 text-sm">
              Starting new game in {timeLeft} seconds...
            </p>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/20"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPlayAgain}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
            >
              Play Now
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}