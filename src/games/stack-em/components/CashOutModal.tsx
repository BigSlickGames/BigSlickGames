import React from 'react';
import { motion } from 'framer-motion';

interface CollectModalProps {
  chips: number;
  winnings: number;
  onCollect: () => void;
  onCancel: () => void;
}

export function CollectModal({ chips, winnings, onCollect, onCancel }: CollectModalProps) {
  const totalCollect = chips + winnings;

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
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full border border-white/30 shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Collect Winnings</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Bankroll:</span>
              <span className="text-xl font-bold text-white">{chips}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Winnings:</span>
              <span className="text-xl font-bold text-emerald-400">+{winnings}</span>
            </div>
            <div className="border-t border-white/20 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total Collected:</span>
                <span className="text-3xl font-bold text-emerald-400">{totalCollect}</span>
              </div>
            </div>
          </div>
          <p className="text-white/80">
            Are you sure you want to collect your winnings and end this game?
          </p>
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/20"
          >
            Continue Playing
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCollect}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg"
          >
            Collect
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}