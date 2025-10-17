import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins } from 'lucide-react';

interface CollectSuccessModalProps {
  winnings: number;
  onPlayAgain: () => void;
  onCancel: () => void;
}

export function CollectSuccessModal({ winnings, onPlayAgain, onCancel }: CollectSuccessModalProps) {
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
        className="bg-gradient-to-br from-orange-500/20 via-orange-600/15 to-orange-700/10 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full border border-orange-500/40 shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-400/50">
              <Trophy className="w-10 h-10 text-orange-400" />
            </div>
          </div>
          
          <motion.h2 
            className="text-3xl font-bold text-white mb-2"
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 10px rgba(251, 146, 60, 0.5)",
                "0 0 20px rgba(251, 146, 60, 0.8)",
                "0 0 10px rgba(251, 146, 60, 0.5)"
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            Congrats!
          </motion.h2>
          
          <p className="text-white/80 mb-4">
            You've successfully collected your winnings!
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins className="w-6 h-6 text-orange-400" />
            <span className="text-2xl font-bold text-orange-400">
              +{winnings.toLocaleString()} Chips!
            </span>
          </div>
          
          <p className="text-white/60 text-sm">
            Ready for another round?
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-medium transition-colors border border-red-500/30"
          >
            End Session
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors shadow-lg"
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}