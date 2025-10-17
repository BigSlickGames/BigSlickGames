import React from 'react';
import { motion } from 'framer-motion';

interface BankrollDisplayProps {
  chips: number;
  winnings: number;
}

export function BankrollDisplay({ chips, winnings }: BankrollDisplayProps) {
  return (
    <div className="flex gap-2 justify-center">
      <motion.div
        className="bg-slate-800/90 backdrop-blur-md rounded-lg p-2 border border-emerald-500/40 flex-1 max-w-[140px]"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-center">
          <h3 className="text-slate-300 text-xs font-medium mb-1">Bankroll</h3>
          <div className="text-lg font-bold text-emerald-400">
            {chips.toLocaleString()}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-slate-800/90 backdrop-blur-md rounded-lg p-2 border border-amber-500/40 flex-1 max-w-[140px]"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-center">
          <h3 className="text-slate-300 text-xs font-medium mb-1">Winnings</h3>
          <div className={`text-2xl font-bold ${
            winnings > 0 ? 'text-amber-400' : 'text-slate-400'
          }`}>
            {winnings > 0 ? '+' : ''}{winnings.toLocaleString()}
          </div>
        </div>
      </motion.div>
    </div>
  );
}