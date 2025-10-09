import React from "react";
import {
  Coins,
  Settings,
  ShoppingBag,
  Trophy,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { supabase } from "../lib/supabase";

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
  onHomeClick?: () => void;
}

export default function Header({
  profile,
  onShopClick,
  onMissionsClick,
  onSettingsClick,
  onForumClick,
  onLeaderboardClick,
  onHomeClick,
}: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore any sign out errors
    }
    window.location.reload();
  };

  const chips = profile.chips || 0;
  const formatChips = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
  };

  return (
    <header className="bg-gray-900/98 backdrop-blur-xl border-b border-gray-800 shadow-2xl sticky top-0 z-100">
      <div className="container mx-auto px-4">
        {/* MOBILE VIEW */}
        <div className="flex md:hidden items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity active:scale-95"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm">BS</span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                BigSlick
              </h1>
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Chips Badge */}
            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-2 rounded-xl border border-yellow-500/30">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-sm">
                {formatChips(chips)}
              </span>
            </div>

            {/* Shop Button */}
            {onShopClick && (
              <button
                onClick={onShopClick}
                className="p-2.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-xl transition-all active:scale-95 border border-transparent hover:border-orange-500/30"
                aria-label="Shop"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={onSettingsClick}
              className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all active:scale-95"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-500/30"
              aria-label="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:flex items-center justify-between h-20">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <button
              onClick={onHomeClick}
              className="flex items-center space-x-3 hover:opacity-90 transition-opacity active:scale-98"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                <span className="text-white font-black text-xl">BS</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                  BigSlick<span className="text-orange-500">Games</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Premium Gaming Hub
                </p>
              </div>
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Chips Display */}
            <div className="flex items-center space-x-2.5 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 px-5 py-3 rounded-xl border border-yellow-500/20 shadow-lg">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium leading-none mb-0.5">
                  Balance
                </span>
                <span className="text-yellow-300 font-bold text-lg leading-none">
                  {chips.toLocaleString()}
                </span>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 bg-gray-800/50 px-4 py-2.5 rounded-xl border border-gray-700">
              <div className="text-right">
                <p className="text-white font-semibold text-sm leading-none mb-1">
                  {profile.username}
                </p>
                <p className="text-orange-400 text-xs font-medium leading-none">
                  Level {profile.level || 1}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {onShopClick && (
                <button
                  onClick={onShopClick}
                  className="p-3 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-xl transition-all border border-transparent hover:border-orange-500/30"
                  title="Shop"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={onSettingsClick}
                className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={handleSignOut}
                className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/30"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (keeping for future use if needed) */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowMobileMenu(false)}
          ></div>

          <div className="absolute top-full left-0 right-0 bg-red-900 border-b-2 border-orange-500/60 shadow-2xl z-50">
            <div className="container mx-auto px-4 py-4 bg-gray-900">
              <div className="flex items-center space-x-3 px-4 py-3 mb-3 bg-red-800 rounded-xl border-2 border-orange-500/40 shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-base">
                    {profile.username}
                  </p>
                  <p className="text-orange-400 text-sm font-semibold">
                    Level {profile.level || 1}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 bg-yellow-500/30 px-3 py-1.5 rounded-full border-2 border-yellow-500/60">
                    <Coins className="w-4 h-4 text-yellow-300" />
                    <span className="text-yellow-300 font-bold text-sm">
                      {(profile.chips || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {onLeaderboardClick && (
                  <button
                    onClick={() => {
                      onLeaderboardClick();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all border-2 border-gray-700 hover:border-yellow-500/60 shadow-lg"
                  >
                    <div className="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center border-2 border-yellow-500/50">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="font-bold text-base">Leaderboard</span>
                  </button>
                )}

                <div className="h-0.5 bg-gray-700 my-2"></div>

                <button
                  onClick={() => {
                    handleSignOut();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 bg-gray-800 hover:bg-red-900/50 text-white rounded-xl transition-all border-2 border-gray-700 hover:border-red-500/60 shadow-lg"
                >
                  <div className="w-10 h-10 bg-red-500/30 rounded-lg flex items-center justify-center border-2 border-red-500/50">
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="font-bold text-base">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
