import React, { useState, useEffect } from 'react';
import { Target, Star, CheckCircle, Heart, Diamond, Club, Spade, X } from 'lucide-react';

interface MissionsPageProps {
  onClose: () => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'text-green-400 bg-green-400/20 border-green-400/40';
    case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/40';
    case 'hard': return 'text-red-400 bg-red-400/20 border-red-400/40';
    default: return 'text-gray-400 bg-gray-400/20 border-gray-400/40';
  }
};

const getMissionIcon = (missionType: string) => {
  switch (missionType) {
    case 'games_played': return <Target className="w-4 h-4" />;
    case 'chips_won': return <Star className="w-4 h-4 text-yellow-400" />;
    case 'live_bets': return <Target className="w-4 h-4" />;
    case 'win_streak': return <Star className="w-4 h-4" />;
    case 'specific_suit_wins': return <Heart className="w-5 h-5" />;
    case 'total_wagered': return <Target className="w-4 h-4 text-blue-400" />;
    default: return <Target className="w-4 h-4" />;
  }
};

export default function MissionsPage({ onClose }: MissionsPageProps) {
  // Mock missions data for offline mode
  const [missions] = useState([
    {
      id: '1',
      title: 'First Steps',
      description: 'Play your first 5 games',
      mission_type: 'games_played',
      target_value: 5,
      reward_chips: 100,
      difficulty: 'easy' as const,
      sort_order: 1
    },
    {
      id: '2',
      title: 'High Roller',
      description: 'Win 1000 chips in total',
      mission_type: 'chips_won',
      target_value: 1000,
      reward_chips: 500,
      difficulty: 'medium' as const,
      sort_order: 2
    },
    {
      id: '3',
      title: 'Live Betting Pro',
      description: 'Place 20 live bets',
      mission_type: 'live_bets',
      target_value: 20,
      reward_chips: 300,
      difficulty: 'medium' as const,
      sort_order: 3
    }
  ]);

  const [userProgress] = useState({
    '1': { progress: 2, completed: false, claimed: false },
    '2': { progress: 450, completed: false, claimed: false },
    '3': { progress: 8, completed: false, claimed: false }
  });

  const loading = false;

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-white text-lg">Loading missions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="dark-card rounded-2xl max-w-md w-full max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col orange-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-yellow-500/10"></div>
        
        <div className="relative z-10 flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-orange-500/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 orange-gradient rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl lg:text-2xl">Racing Suits Missions</h2>
                <p className="text-white/60 text-xs lg:text-sm">Complete challenges to earn star points</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-orange-500/20 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Missions List */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-0 overscroll-contain" 
               style={{ 
                 WebkitOverflowScrolling: 'touch',
                 scrollbarWidth: 'thin',
                 scrollbarColor: 'rgba(255,165,0,0.3) transparent'
               }}>
            <div className="grid gap-3 pb-4">
              {missions.map((mission) => {
                const missionProgress = userProgress[mission.id as keyof typeof userProgress];
                const progress = missionProgress?.progress || 0;
                const isCompleted = missionProgress?.completed || false;
                const isClaimed = missionProgress?.claimed || false;
                const progressPercentage = getProgressPercentage(progress, mission.target_value);

                return (
                  <div key={mission.id} className="dark-card rounded-lg p-3 lg:p-4 relative overflow-hidden touch-manipulation">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-black/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getMissionIcon(mission.mission_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-bold text-sm lg:text-base">{mission.title}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getDifficultyColor(mission.difficulty)} flex-shrink-0`}>
                                {mission.difficulty.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-white/60 text-xs lg:text-sm mb-2 lg:mb-3">{mission.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-black/20 rounded-full h-2">
                                <div 
                                  className="orange-gradient h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-white/60 text-xs font-mono flex-shrink-0">
                                {progress}/{mission.target_value}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Reward */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 text-orange-400 text-sm lg:text-base">
                            <Star className="w-3 h-3" />
                            {mission.reward_chips}
                          </div>
                          
                          {isClaimed ? (
                            <div className="flex items-center gap-1 text-green-400 text-xs lg:text-sm font-bold">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span>CLAIMED</span>
                            </div>
                          ) : isCompleted ? (
                            <button
                              onClick={() => {/* Handle claim in offline mode */}}
                              disabled={false}
                              className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-400/40
                                       text-green-100 font-bold rounded text-xs lg:text-sm transition-all duration-200
                                       disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation
                                       active:scale-95"
                            >
                              Claim
                            </button>
                          ) : (
                            <div className="text-white/40 text-xs lg:text-sm font-bold">
                              IN PROGRESS
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}