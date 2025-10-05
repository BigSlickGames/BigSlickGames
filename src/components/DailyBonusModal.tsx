import React from 'react';
import { Gift, X, Coins } from 'lucide-react';

interface DailyBonusModalProps {
  isOpen: boolean;
  onClaim: () => void;
  onClose: () => void;
}

export default function DailyBonusModal({ isOpen, onClaim, onClose }: DailyBonusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-8 max-w-md w-full text-center relative shadow-2xl shadow-orange-500/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-orange-500/50">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Daily Bonus!</h2>
          <p className="text-gray-400">Welcome back! Here's your daily reward.</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 rounded-lg p-6 mb-6 shadow-lg shadow-orange-500/20">
          <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
            <Coins className="w-8 h-8" />
            <span className="text-3xl font-bold">1,000</span>
          </div>
          <p className="text-yellow-300 font-semibold">Free Chips!</p>
        </div>

        <button
          onClick={onClaim}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-400/20"
        >
          Claim Reward
        </button>

        <p className="text-gray-400 text-sm mt-4">
          Come back tomorrow for another bonus!
        </p>
      </div>
    </div>
  );
}