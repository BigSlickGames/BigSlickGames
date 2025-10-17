import React from 'react';
import { motion } from 'framer-motion';

export function ScrollingBanner() {
  return (
    <div className="w-full overflow-hidden bg-black/30 backdrop-blur-sm border-y border-white/20 py-1">
      <motion.div
        className="whitespace-nowrap"
        animate={{
          x: ['100%', '-100%']
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <span className="text-white/80 text-sm font-medium">
          🎮 21 Series games are free to play! • ✨ Premium backgrounds now available in Gallery! ✨ 🎮
        </span>
      </motion.div>
    </div>
  );
}