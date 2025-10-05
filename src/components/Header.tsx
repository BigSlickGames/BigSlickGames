import React from 'react';
import { Coins, Settings, ShoppingBag, Target, MessageSquare, Trophy, Menu, X, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  chips: number;
  created_at: string;
  country?: string | null;
  level?: number;
  experience?: number;
}

interface HeaderProps {
  profile: UserProfile;
  onShopClick?: () => void;
  onMissionsClick?: () => void;
  onSettingsClick?: () => void;
  onForumClick?: () => void;
  onLeaderboardClick?: () => void;
}

export default function Header({ profile, onShopClick, onMissionsClick, onSettingsClick, onForumClick, onLeaderboardClick }: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const handleSignOut = async () => {
    // Clear local session and redirect to sign-in
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore any sign out errors - just proceed with local cleanup
    }
    // Force page reload to clear all state and show sign-in screen
    window.location.reload();
  };

  return (
    <header className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-b border-orange-500/20 shadow-lg shadow-orange-500/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Hamburger Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-400 hover:text-white hover:bg-orange-500/20 rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/20 touch-manipulation"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <h1 className="text-xl sm:text-2xl font-bold text-white">GameHub</h1>
            <img 
              src="/images/banner new logo.png" 
              alt="Big Slick Games" 
              className="h-8 sm:h-10 w-auto"
            />
          </div>

          <div className="flex items-center space-x-2 sm:space-x-6">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-orange-500/40 shadow-lg shadow-orange-500/20">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm sm:text-base">
                {(profile.chips || 0).toLocaleString()}
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-white font-medium text-sm">{profile.username}</p>
                <p className="text-gray-400 text-xs">Level {profile.level}</p>
              </div>
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
                <span className="text-white font-bold text-sm sm:text-base">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Chip Shop Icon */}
              {onShopClick && (
                <button
                  onClick={onShopClick}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/20 rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/20 touch-manipulation"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              
              <button 
                onClick={onSettingsClick}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-orange-500/20 rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/20 touch-manipulation"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <button 
                onClick={handleSignOut}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all hover:shadow-lg hover:shadow-red-500/20 touch-manipulation"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="absolute top-full left-0 right-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-b border-orange-500/20 shadow-xl shadow-orange-500/10 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              {onMissionsClick && (
                false && (
                <button
                  onClick={() => {
                    onMissionsClick();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all touch-manipulation"
                >
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Missions</span>
                </button>
                )
              )}
              
              {onLeaderboardClick && (
                <button
                  onClick={() => {
                    onLeaderboardClick();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-all touch-manipulation"
                >
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">Leaderboard</span>
                </button>
              )}
              
              {onForumClick && (
                false && (
                <button
                  onClick={() => {
                    onForumClick();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all touch-manipulation"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Forum</span>
                </button>
                )
              )}
              
              <button
                onClick={() => {
                  handleSignOut();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all touch-manipulation"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}