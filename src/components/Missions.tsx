import React, { useState } from 'react';
import { Target, ArrowLeft, Trophy, Star, Gift, RotateCcw, Layers } from 'lucide-react';
import SpinWheel from './SpinWheel';
import { supabase } from '../lib/supabase';

interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  gameType: string;
  completed: boolean;
  claimed: boolean;
}

interface StackemMission {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_progress: number;
  reward_chips: number;
  reward_xp: number;
  mission_type: string;
  is_completed: boolean;
  is_claimed: boolean;
  created_at: string;
}

interface MissionsProps {
  profile: any;
  onBack: () => void;
}

export default function Missions({ profile, onBack }: MissionsProps) {
  const [missionPoints, setMissionPoints] = useState(150); // Mock mission points
  const [showWheel, setShowWheel] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'stackem'>('general');
  const [stackemMissions, setStackemMissions] = useState<StackemMission[]>([]);
  const [loading, setLoading] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: '1',
      title: 'Deck Builder',
      description: 'Create 3 custom decks in Deck Realms',
      progress: 1,
      target: 3,
      reward: 30,
      gameType: 'deck-realms',
      completed: false,
      claimed: false
    },
    {
      id: '2',
      title: 'Multi Champion',
      description: 'Reach level 5 in Multi\'Up',
      progress: 3,
      target: 5,
      reward: 75,
      gameType: 'multi-up',
      completed: false,
      claimed: false
    },
    {
      id: '3',
      title: 'Poker\'oply Pioneer',
      description: 'Play your first game of Poker\'oply',
      progress: 0,
      target: 1,
      reward: 40,
      gameType: 'pokeroply',
      completed: false,
      claimed: false
    },
    {
      id: '4',
      title: 'Hold\'em Starter',
      description: 'Play 10 hands in 21 Hold\'em',
      progress: 7,
      target: 10,
      reward: 25,
      gameType: 'hold-em',
      completed: false,
      claimed: false
    },
    {
      id: '5',
      title: 'High Roller',
      description: 'Win 10,000 chips in any game',
      progress: 6500,
      target: 10000,
      reward: 100,
      gameType: 'any',
      completed: false,
      claimed: false
    }
  ]);
  
  // Load Stack'em missions when tab is selected
  React.useEffect(() => {
    if (activeTab === 'stackem') {
      loadStackemMissions();
    }
  }, [activeTab]);

  const loadStackemMissions = async () => {
    setLoading(true);
    try {
      // For now, we'll create mock Stack'em missions based on the schema
      // In the future, these would come from the database
      const mockStackemMissions: StackemMission[] = [
        {
          id: '1',
          title: 'First Stack',
          description: 'Place your first tile in Stack\'em',
          target_value: 1,
          current_progress: 0,
          reward_chips: 100,
          reward_xp: 50,
          mission_type: 'tiles_placed',
          is_completed: false,
          is_claimed: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Stack Builder',
          description: 'Place 50 tiles total',
          target_value: 50,
          current_progress: 23,
          reward_chips: 500,
          reward_xp: 200,
          mission_type: 'tiles_placed',
          is_completed: false,
          is_claimed: false,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'First Victory',
          description: 'Win your first Stack\'em game',
          target_value: 1,
          current_progress: 1,
          reward_chips: 250,
          reward_xp: 100,
          mission_type: 'games_won',
          is_completed: true,
          is_claimed: false,
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Blackjack Master',
          description: 'Get 5 blackjacks in Stack\'em',
          target_value: 5,
          current_progress: 2,
          reward_chips: 1000,
          reward_xp: 300,
          mission_type: 'blackjacks',
          is_completed: false,
          is_claimed: false,
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          title: 'Chip Collector',
          description: 'Win 5,000 chips in Stack\'em',
          target_value: 5000,
          current_progress: 2800,
          reward_chips: 2000,
          reward_xp: 500,
          mission_type: 'chips_won',
          is_completed: false,
          is_claimed: false,
          created_at: new Date().toISOString()
        },
        {
          id: '6',
          title: 'Perfect Stack',
          description: 'Get a blackjack with 7 cards',
          target_value: 7,
          current_progress: 5,
          reward_chips: 5000,
          reward_xp: 1000,
          mission_type: 'best_blackjack_cards',
          is_completed: false,
          is_claimed: false,
          created_at: new Date().toISOString()
        }
      ];
      
      setStackemMissions(mockStackemMissions);
    } catch (error) {
      console.error('Error loading Stack\'em missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = (missionId: string, reward: number) => {
    setMissions(prev => prev.map(mission => 
      mission.id === missionId 
        ? { ...mission, claimed: true }
        : mission
    ));
    setMissionPoints(prev => prev + reward);
  };

  const claimStackemReward = (missionId: string, rewardChips: number, rewardXp: number) => {
    setStackemMissions(prev => prev.map(mission => 
      mission.id === missionId 
        ? { ...mission, is_claimed: true }
        : mission
    ));
    setMissionPoints(prev => prev + Math.floor(rewardXp / 10)); // Convert XP to mission points
  };

  const canSpin = missionPoints >= 100;

  const handleSpinComplete = (prize: string) => {
    setMissionPoints(prev => prev - 100);
    setShowWheel(false);
    // Handle prize logic here
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-500/40">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">{missionPoints} Mission Points</span>
          </div>
          
          <button
            onClick={() => setShowWheel(true)}
            disabled={!canSpin}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              canSpin
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Spin Wheel (100 pts)</span>
          </button>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Mission Control</h2>
        <p className="text-gray-400 text-lg">Complete missions to earn points and spin the reward wheel!</p>
      </div>

      {/* Mission Tabs */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'general'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <Target className="w-5 h-5" />
          <span>General Missions</span>
        </button>
        
        <button
          onClick={() => setActiveTab('stackem')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'stackem'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
              : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>21 Stack'em</span>
        </button>
      </div>

      {/* Mission Content */}
      {activeTab === 'general' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:scale-105 ${
                mission.completed
                  ? 'border-green-500/40 shadow-green-500/20'
                  : 'border-orange-500/20 shadow-orange-500/10 hover:border-orange-500/40'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{mission.title}</h3>
                    <p className="text-gray-400 text-sm">{mission.description}</p>
                  </div>
                  {mission.completed ? (
                    <Trophy className="w-6 h-6 text-green-400 flex-shrink-0" />
                  ) : (
                    <Target className="w-6 h-6 text-orange-400 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-semibold">
                      {mission.progress}/{mission.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        mission.completed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                      style={{ width: `${Math.min((mission.progress / mission.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-semibold">{mission.reward} pts</span>
                  </div>
                  
                  {mission.claimed ? (
                    <span className="text-gray-400 text-sm font-semibold">Claimed</span>
                  ) : mission.completed ? (
                    <button
                      onClick={() => claimReward(mission.id, mission.reward)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm shadow-lg shadow-green-500/30"
                    >
                      Claim Reward
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">In Progress</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading Stack'em missions...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stackemMissions.map((mission) => (
                <div
                  key={mission.id}
                  className={`bg-gradient-to-br from-green-800/20 to-emerald-900/20 backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:scale-105 ${
                    mission.is_completed
                      ? 'border-green-500/40 shadow-green-500/20'
                      : 'border-green-500/20 shadow-green-500/10 hover:border-green-500/40'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{mission.title}</h3>
                        <p className="text-gray-400 text-sm">{mission.description}</p>
                      </div>
                      {mission.is_completed ? (
                        <Trophy className="w-6 h-6 text-green-400 flex-shrink-0" />
                      ) : (
                        <Layers className="w-6 h-6 text-green-400 flex-shrink-0" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-semibold">
                          {mission.current_progress}/{mission.target_value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            mission.is_completed
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-green-600 to-green-400'
                          }`}
                          style={{ width: `${Math.min((mission.current_progress / mission.target_value) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">{mission.reward_chips} chips</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-400 font-semibold">{mission.reward_xp} XP</span>
                        </div>
                      </div>
                      
                      {mission.is_claimed ? (
                        <span className="text-gray-400 text-sm font-semibold">Claimed</span>
                      ) : mission.is_completed ? (
                        <button
                          onClick={() => claimStackemReward(mission.id, mission.reward_chips, mission.reward_xp)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm shadow-lg shadow-green-500/30"
                        >
                          Claim Reward
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">In Progress</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily/Weekly Mission Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-800/20 to-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Daily Missions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white">Play any game</span>
              <span className="text-blue-400 font-semibold">+10 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Win 3 games</span>
              <span className="text-blue-400 font-semibold">+25 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Chat with friends</span>
              <span className="text-blue-400 font-semibold">+5 pts</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-800/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Weekly Challenges</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white">Win 50 games</span>
              <span className="text-purple-400 font-semibold">+200 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Earn 100k chips</span>
              <span className="text-purple-400 font-semibold">+300 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Try all games</span>
              <span className="text-purple-400 font-semibold">+150 pts</span>
            </div>
          </div>
        </div>
      </div>

      {showWheel && (
        <SpinWheel
          onClose={() => setShowWheel(false)}
          onSpinComplete={handleSpinComplete}
        />
      )}
    </div>
  );
}