import React from 'react';
import { motion } from 'framer-motion';

interface EndGameModalProps {
  winnings: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EndGameModal({ winnings, onConfirm, onCancel }: EndGameModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6 max-w-md w-full mx-4 shadow-2xl shadow-orange-500/20"
      >
        <h2 className="text-2xl font-bold text-white mb-4 text-center">End Game?</h2>
        
        <p className="text-slate-300 text-center mb-6">
          Are you sure you want to end this game? You have {winnings > 0 ? `+${winnings.toLocaleString()}` : '0'} winnings to collect.
        </p>
        
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 py-3 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300"
          >
            Continue Playing
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 py-3 rounded-xl border border-orange-500/40 hover:border-orange-400/60 transition-all duration-300"
          >
            End Game
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}