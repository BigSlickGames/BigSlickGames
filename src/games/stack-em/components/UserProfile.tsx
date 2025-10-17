import React from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Crown, Trophy, Coins } from 'lucide-react';

interface UserProfileProps {
  profile: {
    id: string;
    email: string;
    username: string | null;
    chips: number;
    level: number;
    experience: number;
    is_premium: boolean;
    games_played: number;
    games_won: number;
  };
  onSignOut: () => void;
  onShowAuth: () => void;
}

export function UserProfile({ profile, onSignOut, onShowAuth }: UserProfileProps) {
  const winRate = profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/30 min-w-[200px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
          {profile.is_premium ? (
            <Crown className="w-5 h-5 text-yellow-400" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">
            {profile.username || 'Player'}
          </p>
          <p className="text-white/60 text-xs truncate">
            Level {profile.level}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-white/80 text-sm">Chips</span>
          </div>
          <span className="text-emerald-400 font-bold text-sm">
            {profile.chips.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80 text-sm">Win Rate</span>
          </div>
          <span className="text-yellow-400 font-bold text-sm">
            {winRate}%
          </span>
        </div>

        <div className="text-white/60 text-xs">
          {profile.games_played} games played
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSignOut}
        className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </motion.button>
    </div>
  );
}