import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../types/Card';

interface AceSelectionModalProps {
  card: Card;
  onSelect: (value: 1 | 11) => void;
  onCancel: () => void;
}

export function AceSelectionModal({ card, onSelect, onCancel }: AceSelectionModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full border border-white/40 shadow-2xl relative z-10 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-white/5 before:pointer-events-none"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src="/images/21-stackem-card-tile.png" 
                alt={`${card.rank} of ${card.suit}`}
                className="w-20 h-20 object-contain"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-black">
                A
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Choose Ace Value</h2>
          <p className="text-white/70 text-sm">What value should this Ace have?</p>
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(1)}
            className="flex-1 py-4 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl font-bold text-2xl transition-colors border border-blue-400/30"
          >
            1
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(11)}
            className="flex-1 py-4 bg-red-500/80 hover:bg-red-500 text-white rounded-xl font-bold text-2xl transition-colors border border-red-400/30"
          >
            11
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/20 text-sm"
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
}