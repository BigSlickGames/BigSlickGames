import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, MessageCircle, Crown } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  level: number;
  online: boolean;
  avatar_url?: string;
}

interface FriendsPanelProps {
  userId: string;
}

export default function FriendsPanel({ userId }: FriendsPanelProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);

  // Mock friends data for now
  useEffect(() => {
    const mockFriends: Friend[] = [
      { id: '1', username: 'ProGamer123', level: 15, online: true },
      { id: '2', username: 'ChipMaster', level: 12, online: false },
      { id: '3', username: 'LuckyPlayer', level: 8, online: true },
      { id: '4', username: 'CardShark', level: 20, online: false },
    ];
    setFriends(mockFriends);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl shadow-xl shadow-orange-500/10">
      {/* Modern Glass Header */}
      <div className="relative h-16 bg-gradient-to-r from-gray-800/60 via-gray-700/40 to-gray-800/60 backdrop-blur-xl border-b border-white/10 rounded-t-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">Friends Network</h3>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowAddFriend(!showAddFriend)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-400/20 touch-manipulation"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {showAddFriend && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 mb-4">
            <input
              type="text"
              placeholder="Enter username to add friend"
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 mb-3 shadow-inner"
            />
            <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all text-sm shadow-lg shadow-orange-400/20 touch-manipulation">
              Send Friend Request
            </button>
          </div>
        )}

        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all border border-gray-700/30 hover:border-orange-500/30"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-white font-bold text-sm">
                      {friend.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                    friend.online ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-1">
                    <p className="text-white font-medium text-sm">{friend.username}</p>
                    {friend.level >= 15 && (
                      <Crown className="w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">Level {friend.level}</p>
                </div>
              </div>

              <button className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/20 touch-manipulation">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            {friends.filter(f => f.online).length} of {friends.length} friends online
          </p>
        </div>
      </div>
    </div>
  );
}