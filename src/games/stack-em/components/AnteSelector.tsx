import React from 'react';
import { motion } from 'framer-motion';
import type { AnteAmount } from '../types/GameTypes';

interface AnteSelectorProps {
  selectedAnte: AnteAmount;
  onAnteSelect: (ante: AnteAmount) => void;
  chips: number;
  betsLocked: boolean;
}

export function AnteSelector({ selectedAnte, onAnteSelect, chips, betsLocked }: AnteSelectorProps) {
  const anteOptions: AnteAmount[] = [5, 10, 20, 50, 100];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
      <h3 className="text-white font-semibold text-center mb-2">Select Ante</h3>
      
      <div className="flex gap-2 overflow-x-auto pb-1">
        {anteOptions.map((ante) => {
          const canAfford = chips >= ante;
          const isSelected = selectedAnte === ante;
          
          return (
            <motion.button
              key={ante}
              whileHover={canAfford && !betsLocked ? { scale: 1.05 } : {}}
              whileTap={canAfford && !betsLocked ? { scale: 0.95 } : {}}
              onClick={() => !betsLocked && canAfford && onAnteSelect(ante)}
              disabled={!canAfford || betsLocked}
              className={`py-2 px-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap min-w-[50px] ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : canAfford && !betsLocked
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
              } ${betsLocked ? 'opacity-60' : ''}`}
            >
              {ante}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}