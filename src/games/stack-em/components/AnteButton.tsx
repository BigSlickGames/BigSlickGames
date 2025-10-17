import React from 'react';
import { motion } from 'framer-motion';

interface AnteButtonProps {
  selectedAnte: number;
  onClick: () => void;
  betsLocked: boolean;
}

export function AnteButton({ selectedAnte, onClick, betsLocked }: AnteButtonProps) {
  return (
    <motion.button
      whileHover={!betsLocked ? { scale: 1.02 } : {}}
      whileTap={!betsLocked ? { scale: 0.98 } : {}}
      onClick={!betsLocked ? onClick : undefined}
      disabled={betsLocked}
      className={`bg-slate-800/90 backdrop-blur-xl rounded-lg p-3 border border-amber-500/40 min-w-[120px] shadow-lg hover:shadow-amber-500/30 transition-all duration-300 ${
        betsLocked
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-slate-700/90 hover:border-amber-400/60 cursor-pointer'
      }`}
    >
      <div className="text-center">
        <h3 className="text-slate-300 text-sm font-medium mb-1">Ante</h3>
        <div className="text-lg font-bold text-amber-400">
          {selectedAnte}
        </div>
      </div>
    </motion.button>
  );
}