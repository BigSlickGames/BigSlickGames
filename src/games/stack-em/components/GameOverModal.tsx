import React from 'react';
import { motion } from 'framer-motion';
import type { Difficulty } from '../types/GameTypes';

interface GameOverModalProps {
  winnings: number;
  difficulty: Difficulty;
  onPlayAgain: () => void;
  onCancel: () => void;
  reason: string;
}

export function GameOverModal({ winnings, difficulty, onPlayAgain, onCancel, reason }: GameOverModalProps) {
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
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Game Over</h2>
        
        <div className="text-center mb-6">
          <p className="text-slate-300 mb-2">
            Final winnings: <span className="text-orange-300 font-bold">{winnings > 0 ? `+${winnings.toLocaleString()}` : '0'}</span>
          </p>
          <p className="text-slate-400 text-sm">Difficulty: {difficulty}</p>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 py-3 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300"
          >
            Continue
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 py-3 rounded-xl border border-orange-500/40 hover:border-orange-400/60 transition-all duration-300"
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}