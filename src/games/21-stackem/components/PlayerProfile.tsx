import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Coins, Trophy, Calendar, Star } from 'lucide-react';

interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  chips: number;
  chips_balance: number;
  bankroll: number;
  games_played: number;
  games_won: number;
  theme_preference: string;
  created_at: string;
  updated_at: string;
  total_hours_played: number;
  chips_won_total: number;
}

export const PlayerProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');

  const fetchProfile = async (id: string) => {
    if (!id.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError('Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfile(userId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWinRate = () => {
    if (!profile || profile.games_played === 0) return 0;
    return Math.round((profile.games_won / profile.games_played) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Player Profile Lookup
        </h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter Player ID (UUID)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Profile Display */}
        {profile && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile.username || 'Anonymous Player'}
                  </h2>
                  <p className="text-blue-100">{profile.email}</p>
                  <p className="text-blue-200 text-sm">
                    Theme: {profile.theme_preference}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Chips Balance */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <Coins className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Current Chips</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {profile.chips_balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bankroll */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Coins className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Bankroll</p>
                      <p className="text-2xl font-bold text-green-600">
                        {profile.bankroll.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Games Played */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Games Played</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {profile.games_played}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <Star className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Win Rate</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {getWinRate()}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Games Won</h3>
                  <p className="text-xl text-gray-600">{profile.games_won}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Total Chips Won</h3>
                  <p className="text-xl text-gray-600">
                    {profile.chips_won_total.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Hours Played</h3>
                  <p className="text-xl text-gray-600">
                    {Number(profile.total_hours_played).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined: {formatDate(profile.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Last Updated: {formatDate(profile.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Profile Message */}
        {!loading && !error && !profile && userId && (
          <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded-lg text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p>No profile found for the provided ID.</p>
          </div>
        )}
      </div>
    </div>
  );
};