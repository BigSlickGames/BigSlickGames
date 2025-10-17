import React from 'react';
import { motion } from 'framer-motion';

interface AntePopupProps {
  selectedAnte: number;
  onAnteSelect: (ante: number) => void;
  chips: number;
  onClose: () => void;
  isOpen: boolean;
}

export function AntePopup({ selectedAnte, onAnteSelect, chips, onClose, isOpen }: AntePopupProps) {
  if (!isOpen) return null;

  const anteOptions = [1, 5, 10, 25, 50, 100];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6 max-w-md w-full mx-4 shadow-2xl shadow-orange-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Select Ante</h2>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {anteOptions.map((ante) => (
            <motion.button
              key={ante}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onAnteSelect(ante);
                onClose();
              }}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedAnte === ante
                  ? 'bg-orange-500/30 border-orange-400 text-orange-300'
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:border-slate-500'
              }`}
            >
              <div className="text-lg font-bold">{ante}</div>
            </motion.button>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 py-3 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300"
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
}