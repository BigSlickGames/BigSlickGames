import React from 'react';
import { LogOut, RotateCcw, ExternalLink } from 'lucide-react';
import type { Profile } from '../../lib/supabase';

interface BottomMenuProps {
  profile: Profile;
  localChips: number;
  onLogout: () => void;
  onResetGame: () => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  playButtonClick?: () => void;
}

export const BottomMenu: React.FC<BottomMenuProps> = ({
  profile,
  localChips,
  onLogout,
  onResetGame,
  triggerHaptic,
  playButtonClick
}) => {

  const handleHubLink = () => {
    triggerHaptic('light');
    window.open('https://big-slick-games-hub-ctb3.bolt.host/', '_blank');
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur-xl border-t border-orange-500/20 py-2 px-2 flex-shrink-0 touch-none fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-1">
        <div className="flex items-center justify-center space-x-8">
          {/* Hub Link */}
          <button
            onClick={handleHubLink}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerHaptic('light');
              handleHubLink();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col items-center space-y-0 px-2 py-1 text-blue-400 hover:text-blue-300 transition-colors touch-manipulation"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="text-xs">Hub</span>
          </button>

          {/* Reset Game */}
          <button
            onClick={onResetGame}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerHaptic('medium');
              onResetGame();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col items-center space-y-0 px-2 py-1 text-orange-400 hover:text-orange-300 transition-colors touch-manipulation"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-xs">Reset</span>
          </button>

          {/* Exit */}
          <button
            onClick={onLogout}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerHaptic('light');
              onLogout();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col items-center space-y-0 px-2 py-1 text-red-400 hover:text-red-300 transition-colors touch-manipulation"
          >
            <LogOut className="w-3 h-3" />
            <span className="text-xs">Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
