import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Star, 
  Award, 
  Zap, 
  Crown, 
  Flame, 
  Shield,
  X,
  Lock,
  CheckCircle
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  currentProgress: number;
  isUnlocked: boolean;
  category: 'blackjack' | 'tiles' | 'chips' | 'streak' | 'special';
  reward: {
    chips: number;
    experience: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface StackemMissionsModuleProps {
  playerStats: {
    totalBlackjacks: number;
    totalTilesPlaced: number;
    totalChipsWon: number;
    bestBlackjackCards: number;
    blackjacksToday: number;
    totalGamesPlayed: number;
  };
  onClose: () => void;
  onClaimReward: (achievementId: string, reward: { chips: number; experience: number }) => void;
}

export const StackemMissionsModule: React.FC<StackemMissionsModuleProps> = ({
  playerStats,
  onClose,
  onClaimReward
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [claimedAchievements, setClaimedAchievements] = useState<Set<string>>(new Set());

  // Initialize achievements
  useEffect(() => {
    console.log('🏆 Initializing missions with stats:', playerStats);
    
    // Load claimed achievements from localStorage
    const savedClaimed = localStorage.getItem('claimedAchievements');
    if (savedClaimed) {
      try {
        const claimedArray = JSON.parse(savedClaimed);
        setClaimedAchievements(new Set(claimedArray));
        console.log('✅ Loaded claimed achievements:', claimedArray);
      } catch (error) {
        console.error('❌ Error loading claimed achievements:', error);
      }
    }
    
    const initialAchievements: Achievement[] = [
      // Blackjack Achievements
      {
        id: 'first-blackjack',
        title: 'First Blood',
        description: 'Get your first blackjack',
        icon: <Trophy className="w-6 h-6" />,
        requirement: 1,
        currentProgress: playerStats.totalBlackjacks,
        isUnlocked: playerStats.totalBlackjacks >= 1,
        category: 'blackjack',
        reward: { chips: 50, experience: 5 },
        rarity: 'common'
      },
      {
        id: 'blackjack-master',
        title: 'Blackjack Master',
        description: 'Achieve 10 blackjacks',
        icon: <Crown className="w-6 h-6" />,
        requirement: 10,
        currentProgress: playerStats.totalBlackjacks,
        isUnlocked: playerStats.totalBlackjacks >= 10,
        category: 'blackjack',
        reward: { chips: 250, experience: 10 },
        rarity: 'rare'
      },
      {
        id: 'perfect-21',
        title: 'Perfect 21',
        description: 'Get blackjack with only 2 cards',
        icon: <Target className="w-6 h-6" />,
        requirement: 2,
        currentProgress: playerStats.bestBlackjackCards === 2 ? 2 : 0,
        isUnlocked: playerStats.bestBlackjackCards === 2,
        category: 'blackjack',
        reward: { chips: 100, experience: 5 },
        rarity: 'epic'
      },
      {
        id: 'daily-grind',
        title: 'Daily Grind',
        description: 'Get 5 blackjacks in one day',
        icon: <Flame className="w-6 h-6" />,
        requirement: 5,
        currentProgress: playerStats.blackjacksToday,
        isUnlocked: playerStats.blackjacksToday >= 5,
        category: 'streak',
        reward: { chips: 150, experience: 8 },
        rarity: 'rare'
      },
      
      // Tile Achievements
      {
        id: 'tile-placer',
        title: 'Tile Placer',
        description: 'Place 50 tiles',
        icon: <Shield className="w-6 h-6" />,
        requirement: 50,
        currentProgress: playerStats.totalTilesPlaced,
        isUnlocked: playerStats.totalTilesPlaced >= 50,
        category: 'tiles',
        reward: { chips: 75, experience: 3 },
        rarity: 'common'
      },
      {
        id: 'tile-master',
        title: 'Tile Master',
        description: 'Place 500 tiles',
        icon: <Award className="w-6 h-6" />,
        requirement: 500,
        currentProgress: playerStats.totalTilesPlaced,
        isUnlocked: playerStats.totalTilesPlaced >= 500,
        category: 'tiles',
        reward: { chips: 500, experience: 25 },
        rarity: 'epic'
      },
      
      // Chip Achievements
      {
        id: 'first-win',
        title: 'First Win',
        description: 'Win your first chips',
        icon: <Star className="w-6 h-6" />,
        requirement: 1,
        currentProgress: playerStats.totalChipsWon > 0 ? 1 : 0,
        isUnlocked: playerStats.totalChipsWon > 0,
        category: 'chips',
        reward: { chips: 25, experience: 1 },
        rarity: 'common'
      },
      {
        id: 'high-roller',
        title: 'High Roller',
        description: 'Win 10,000 total chips',
        icon: <Zap className="w-6 h-6" />,
        requirement: 10000,
        currentProgress: playerStats.totalChipsWon,
        isUnlocked: playerStats.totalChipsWon >= 10000,
        category: 'chips',
        reward: { chips: 1000, experience: 50 },
        rarity: 'legendary'
      }
    ];

    console.log('🏆 Created achievements:', initialAchievements.map(a => ({
      id: a.id,
      progress: a.currentProgress,
      requirement: a.requirement,
      unlocked: a.isUnlocked
    })));

    setAchievements(initialAchievements);
  }, [playerStats]);

  const categories = [
    { id: 'all', label: 'All', icon: <Trophy className="w-4 h-4" /> },
    { id: 'blackjack', label: 'Blackjack', icon: <Target className="w-4 h-4" /> },
    { id: 'tiles', label: 'Tiles', icon: <Shield className="w-4 h-4" /> },
    { id: 'chips', label: 'Chips', icon: <Star className="w-4 h-4" /> },
    { id: 'streak', label: 'Streaks', icon: <Flame className="w-4 h-4" /> }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const handleClaimReward = (achievement: Achievement) => {
    if (claimedAchievements.has(achievement.id)) {
      console.log('⚠️ Achievement already claimed:', achievement.id);
      return;
    }
    
    console.log('🏆 Claiming achievement:', achievement.id, achievement.reward);
    
    try {
      onClaimReward(achievement.id, achievement.reward);
      
      // Mark as claimed
      const newClaimed = new Set(claimedAchievements);
      newClaimed.add(achievement.id);
      setClaimedAchievements(newClaimed);
      
      // Save to localStorage
      localStorage.setItem('claimedAchievements', JSON.stringify([...newClaimed]));
      console.log('✅ Achievement claimed successfully:', achievement.title);
    } catch (error) {
      console.error('❌ Error claiming achievement:', error);
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (achievement.isUnlocked) return 100;
    return Math.min((achievement.currentProgress / achievement.requirement) * 100, 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl shadow-black/20 w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Stack'em Missions</h2>
              <p className="text-gray-300 text-sm">Complete achievements to earn rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 p-4 border-b border-white/10">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {category.icon}
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map(achievement => (
              <div
                key={achievement.id}
                className={`bg-gray-800/50 backdrop-blur-xl border-2 rounded-lg p-4 transition-all hover:bg-gray-700/50 ${
                  achievement.isUnlocked 
                    ? `${getRarityBorder(achievement.rarity)} shadow-lg`
                    : 'border-gray-600'
                }`}
              >
                {/* Achievement Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.isUnlocked 
                        ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {achievement.isUnlocked ? achievement.icon : <Lock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className={`font-bold ${achievement.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize">{achievement.rarity}</p>
                    </div>
                  </div>
                  
                  {achievement.isUnlocked && !claimedAchievements.has(achievement.id) && (
                    <button
                      onClick={() => handleClaimReward(achievement)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                    >
                      Claim
                    </button>
                  )}
                  
                  {achievement.isUnlocked && claimedAchievements.has(achievement.id) && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{achievement.currentProgress}/{achievement.requirement}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        achievement.isUnlocked 
                          ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}`
                          : 'bg-gray-600'
                      }`}
                      style={{ width: `${getProgressPercentage(achievement)}%` }}
                    />
                  </div>
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Star className="w-3 h-3" />
                      <span>{achievement.reward.chips}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-400">
                      <Zap className="w-3 h-3" />
                      <span>{achievement.reward.experience} XP</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    achievement.isUnlocked 
                      ? claimedAchievements.has(achievement.id)
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {achievement.isUnlocked 
                      ? claimedAchievements.has(achievement.id) 
                        ? 'Claimed' 
                        : 'Ready to Claim'
                      : 'Locked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="border-t border-white/20 p-4">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center space-x-4">
              <span>Unlocked: {achievements.filter(a => a.isUnlocked).length}/{achievements.length}</span>
              <span>Unclaimed: {achievements.filter(a => a.isUnlocked && !claimedAchievements.has(a.id)).length}</span>
            </div>
            <div className="text-xs text-gray-500">
              Complete achievements to earn chips and experience
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};