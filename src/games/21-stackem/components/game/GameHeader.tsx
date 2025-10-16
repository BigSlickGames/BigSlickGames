import React from 'react';
import { Gamepad2, Coins, LogOut, Layers, Trophy, Star, Zap } from 'lucide-react';
import type { Profile } from '../../lib/supabase';

interface GameHeaderProps {
  profile: Profile;
  localChips: number;
  onLogout: () => void;
  onShowStats?: () => void;
  onShowMissions?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  profile,
  localChips,
  onLogout,
  onShowStats,
  onShowMissions
}) => {
  // Calculate total XP needed for each level (progressive system)
  const getTotalXPForLevel = (level: number) => {
    if (level === 0) return 0;
    let totalXP = 0;
    for (let i = 1; i <= level; i++) {
      totalXP += i * 1000; // Level 1 needs 1000, Level 2 needs +2000, Level 3 needs +3000, etc.
    }
    return totalXP;
  };
  
  // Calculate what level a player should be based on total XP
  const getLevelFromXP = (totalXP: number) => {
    let level = 0;
    let xpNeeded = 0;
    
    while (xpNeeded <= totalXP) {
      level++;
      xpNeeded += level * 1000;
    }
    
    return level - 1; // Return the last completed level
  };
  
  const getCurrentLevelProgress = () => {
    const actualLevel = getLevelFromXP(profile.experience);
    const currentLevelTotalXP = getTotalXPForLevel(actualLevel);
    const nextLevelTotalXP = getTotalXPForLevel(actualLevel + 1);
    const progressInLevel = profile.experience - currentLevelTotalXP;
    const xpNeededForLevel = nextLevelTotalXP - currentLevelTotalXP;
    
    return {
      actualLevel,
      current: Math.max(0, progressInLevel),
      needed: xpNeededForLevel,
      percentage: Math.min(100, Math.max(0, (progressInLevel / xpNeededForLevel) * 100))
    };
  };
  
  const levelProgress = getCurrentLevelProgress();

  return (
    <header className="bg-gray-900/95 backdrop-blur-xl border-b border-orange-500/20 shadow-lg flex-shrink-0 touch-none fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
        <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Layers className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
              
              {/* Player Info with Level */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xs sm:text-sm font-bold text-white">
                    {profile.username || profile.email?.split('@')[0] || 'Player'}
                  </h1>
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-purple-600 px-2 py-0.5 rounded-full">
                    <span className="text-xs font-bold text-white">LVL {levelProgress.actualLevel}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className="w-20 sm:w-24 bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${levelProgress.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    {levelProgress.current}/{levelProgress.needed} XP
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Star Points (Spendable Currency) */}
            <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 px-2 py-1 rounded-full border border-blue-500/40">
              <Star className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-semibold">
                {profile.chips_balance || 0}
              </span>
            </div>
            
            {/* DB Chips Display */}
            <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 px-2 py-1 rounded-full border border-yellow-500/40">
              <Coins className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-semibold">
                {(profile.chips + localChips).toLocaleString()}
              </span>
            </div>
            
            {onShowStats && (
              <button
                onClick={onShowStats}
                className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors whitespace-nowrap"
              >
                <Gamepad2 className="w-3 h-3" />
                <span className="text-xs hidden sm:inline">Stats</span>
              </button>
            )}
            
            {onShowMissions && (
              <button
                onClick={onShowMissions}
                className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors whitespace-nowrap"
              >
                <Trophy className="w-3 h-3" />
                <span className="text-xs hidden sm:inline">Missions</span>
              </button>
            )}
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-xs hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};