import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../types/Card';

interface WildSelectionModalProps {
  card: Card;
  availableValues: number[];
  onSelect: (value: number) => void;
  onCancel: () => void;
}

export function WildSelectionModal({ card, availableValues, onSelect, onCancel }: WildSelectionModalProps) {
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
                className="w-20 h-20 object-contain filter drop-shadow-[0_0_8px_rgba(147,51,234,0.8)]"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-black">
                ?
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-purple-400 rounded-full border border-purple-300">
                <div className="absolute inset-0.5 bg-purple-300 rounded-full"></div>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Choose Wild Card Value</h2>
          <p className="text-white/70 text-sm">Select from remaining cards in deck</p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {availableValues.map((value) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(value)}
              className="py-3 bg-purple-500/80 hover:bg-purple-500 text-white rounded-xl font-bold text-lg transition-colors border border-purple-400/30"
            >
              {value}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/20 text-sm"
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
}