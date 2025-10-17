import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  className?: string;
}

export function XPProgressBar({ currentXP, level, className = "" }: XPProgressBarProps) {
  // Calculate XP needed for current level (level 1 = 1000, level 2 = 2000, etc.)
  const xpForCurrentLevel = level * 1000;
  
  // Calculate total XP needed up to current level
  const totalXPForPreviousLevels = ((level - 1) * level * 1000) / 2;
  
  // XP progress in current level
  const xpInCurrentLevel = currentXP - totalXPForPreviousLevels;
  const progressPercentage = Math.max(0, Math.min(100, (xpInCurrentLevel / xpForCurrentLevel) * 100));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Level Star */}
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="text-white font-bold text-sm">{level}</span>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 bg-slate-700/40 rounded-full h-2 overflow-hidden border border-orange-500/30">
        <div className="xp-progress-bar w-full h-full">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/50"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        </div>
      </div>

      {/* XP Text */}
      <span className="text-slate-300 text-xs font-medium">
        {Math.max(0, xpInCurrentLevel)}/{xpForCurrentLevel}
      </span>
    </div>
  );
}