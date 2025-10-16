import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Calendar, 
  Coins, 
  Trophy,
  Layers,
  Percent,
  Clock,
  Star
} from 'lucide-react';

interface PlayerStats {
  // Basic stats
  totalTilesPlaced: number;
  totalChipsWon: number;
  totalChipsLost: number;
  totalBlackjacks: number;
  totalBusts: number;
  totalGamesPlayed: number;
  
  // Advanced stats
  winPercentage: number;
  averageCardsForBlackjack: number;
  blackjacksToday: number;
  bestBlackjackCards: number; // Minimum cards used for a blackjack
  
  // Daily tracking
  dailyStats: {
    date: string;
    blackjacks: number;
    cardsUsed: number[];
  }[];
  
  // Card distribution for blackjacks
  blackjackCardDistribution: {
    [key: number]: number; // cards used -> count
  };
}

interface PlayerStatsDashboardProps {
  profile: any;
  onBack: () => void;
}

export const PlayerStatsDashboard: React.FC<PlayerStatsDashboardProps> = ({ 
  profile, 
  onBack 
}) => {
  const [stats, setStats] = useState<PlayerStats>({
    totalTilesPlaced: 0,
    totalChipsWon: 0,
    totalChipsLost: 0,
    totalBlackjacks: 0,
    totalBusts: 0,
    totalGamesPlayed: 0,
    winPercentage: 0,
    averageCardsForBlackjack: 0,
    blackjacksToday: 0,
    bestBlackjackCards: 0,
    dailyStats: [],
    blackjackCardDistribution: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerStats();
  }, [profile]);

  const loadPlayerStats = async () => {
    if (!profile) return;
    
    try {
      // Load stats from localStorage (in a real app, this would be from a database)
      const savedStats = localStorage.getItem(`playerStats_${profile.id}`);
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setStats(parsedStats);
      }
    } catch (error) {
      console.error('Error loading player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getRecentDays = (days: number = 7) => {
    const recent = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      recent.push(date.toISOString().split('T')[0]);
    }
    return recent;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="opacity-80">{icon}</div>
      </div>
      <div className="text-sm font-medium opacity-90">{title}</div>
      {subtitle && <div className="text-xs opacity-70 mt-1">{subtitle}</div>}
    </div>
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen gamehub-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gamehub-background text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Player Statistics</h1>
            <p className="text-gray-400">
              {profile?.username || profile?.email?.split('@')[0] || 'Player'}'s Performance Dashboard
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Back to Game
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Tiles Placed"
            value={formatNumber(stats.totalTilesPlaced)}
            icon={<Layers className="w-6 h-6" />}
            color="from-blue-500 to-blue-600"
          />
          
          <StatCard
            title="Total Blackjacks"
            value={stats.totalBlackjacks}
            icon={<Trophy className="w-6 h-6" />}
            color="from-yellow-500 to-yellow-600"
            subtitle="21s achieved"
          />
          
          <StatCard
            title="Net Chips"
            value={formatNumber(stats.totalChipsWon - stats.totalChipsLost)}
            icon={<Coins className="w-6 h-6" />}
            color={stats.totalChipsWon >= stats.totalChipsLost ? "from-green-500 to-green-600" : "from-red-500 to-red-600"}
            subtitle={`Won: ${formatNumber(stats.totalChipsWon)} | Lost: ${formatNumber(stats.totalChipsLost)}`}
          />
          
          <StatCard
            title="Win Rate"
            value={`${stats.winPercentage.toFixed(1)}%`}
            icon={<Percent className="w-6 h-6" />}
            color="from-purple-500 to-purple-600"
            subtitle={`${stats.totalBlackjacks} wins / ${stats.totalGamesPlayed} games`}
          />
        </div>

        {/* Blackjack Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Blackjack Performance */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-yellow-400" />
              Blackjack Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Today's Blackjacks:</span>
                <span className="text-2xl font-bold text-yellow-400">{stats.blackjacksToday}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Cards for BJ:</span>
                <span className="text-xl font-bold text-blue-400">
                  {stats.averageCardsForBlackjack.toFixed(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Best BJ (Fewest Cards):</span>
                <span className="text-xl font-bold text-green-400">
                  {stats.bestBlackjackCards || 'N/A'} cards
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Busts:</span>
                <span className="text-xl font-bold text-red-400">{stats.totalBusts}</span>
              </div>
            </div>
          </div>

          {/* Card Distribution for Blackjacks */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Blackjack Card Distribution
            </h3>
            
            <div className="space-y-3">
              {Object.entries(stats.blackjackCardDistribution)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([cards, count]) => {
                  const percentage = stats.totalBlackjacks > 0 
                    ? (count / stats.totalBlackjacks * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <div key={cards} className="flex items-center justify-between">
                      <span className="text-gray-400">{cards} cards:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold w-12 text-right">
                          {count} ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              
              {Object.keys(stats.blackjackCardDistribution).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No blackjacks recorded yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Daily Performance */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-400" />
            Recent Daily Performance (Last 7 Days)
          </h3>
          
          <div className="grid grid-cols-7 gap-2">
            {getRecentDays(7).map(date => {
              const dayStats = stats.dailyStats.find(d => d.date === date);
              const blackjacks = dayStats?.blackjacks || 0;
              const isToday = date === getTodayString();
              
              return (
                <div 
                  key={date}
                  className={`text-center p-3 rounded-lg ${
                    isToday ? 'bg-orange-600' : 'bg-gray-700'
                  }`}
                >
                  <div className="text-xs text-gray-300 mb-1">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'numeric',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-lg font-bold text-yellow-400">
                    {blackjacks}
                  </div>
                  <div className="text-xs text-gray-400">BJs</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-purple-400" />
            Achievements
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* First Blackjack */}
            <div className={`p-4 rounded-lg text-center ${
              stats.totalBlackjacks > 0 ? 'bg-yellow-600' : 'bg-gray-700'
            }`}>
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-bold">First BJ</div>
              <div className="text-xs opacity-75">
                {stats.totalBlackjacks > 0 ? '✓ Unlocked' : 'Get your first 21'}
              </div>
            </div>

            {/* Perfect Game */}
            <div className={`p-4 rounded-lg text-center ${
              stats.bestBlackjackCards === 2 ? 'bg-green-600' : 'bg-gray-700'
            }`}>
              <Target className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-bold">Perfect 21</div>
              <div className="text-xs opacity-75">
                {stats.bestBlackjackCards === 2 ? '✓ 2-card BJ!' : 'Get BJ with 2 cards'}
              </div>
            </div>

            {/* High Roller */}
            <div className={`p-4 rounded-lg text-center ${
              stats.totalChipsWon >= 10000 ? 'bg-purple-600' : 'bg-gray-700'
            }`}>
              <Coins className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-bold">High Roller</div>
              <div className="text-xs opacity-75">
                {stats.totalChipsWon >= 10000 ? '✓ 10K+ won!' : 'Win 10,000 chips'}
              </div>
            </div>

            {/* Daily Streak */}
            <div className={`p-4 rounded-lg text-center ${
              stats.blackjacksToday >= 5 ? 'bg-blue-600' : 'bg-gray-700'
            }`}>
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-bold">Daily Master</div>
              <div className="text-xs opacity-75">
                {stats.blackjacksToday >= 5 ? '✓ 5+ BJs today!' : 'Get 5 BJs in one day'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};