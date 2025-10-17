import React from 'react';
import { motion } from 'framer-motion';
import { User, Crown, Star, Coins } from 'lucide-react';
import type { PlayerProfile } from '../utils/firebase';

interface ProfileHeaderProps {
  profile: PlayerProfile;
  onProfileClick: () => void;
}

export function ProfileHeader({ profile, onProfileClick }: ProfileHeaderProps) {
  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-black/30 backdrop-blur-md border-b border-white/20 p-3"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Profile Info */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onProfileClick}
          className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 hover:bg-white/20 transition-colors"
        >
          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
            {profile.isPremium ? (
              <Crown className="w-5 h-5 text-yellow-400" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="text-left">
            <p className="text-white font-medium text-sm">{profile.username}</p>
            <p className="text-white/60 text-xs">Level {profile.level}</p>
          </div>
        </motion.button>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-sm">
              {profile.chips.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">
              {winRate}%
            </span>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="sm:hidden flex items-center gap-2">
          <div className="text-right">
            <div className="text-emerald-400 font-bold text-sm">
              {profile.chips.toLocaleString()}
            </div>
            <div className="text-yellow-400 text-xs">
              {winRate}% wins
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}