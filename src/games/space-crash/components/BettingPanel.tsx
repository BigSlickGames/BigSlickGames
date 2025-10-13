import React, { useState } from 'react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

interface BettingPanelProps {
  chipBalance: number;
  onPlaceBet: (suit: Suit, amount: number) => void;
  gameInProgress: boolean;
  currentBets: Record<Suit, number>;
}

const getSuitIcon = (suit: Suit, className?: string) => {
  switch (suit) {
    case 'hearts':
      return <Heart className={`${className} text-white fill-white`} />;
    case 'diamonds':
      return <Diamond className={`${className} text-white fill-white`} />;
    case 'clubs':
      return <Club className={`${className} text-white fill-white`} />;
    case 'spades':
      return <Spade className={`${className} text-white fill-white`} />;
  }
};

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export default function BettingPanel({ chipBalance, onPlaceBet, currentBets }: BettingPanelProps) {
  const [selectedSuit, setSelectedSuit] = useState<Suit>('hearts');
  const [betAmount, setBetAmount] = useState(10);

  const handlePlaceBet = () => {
    if (betAmount <= chipBalance && betAmount > 0) {
      onPlaceBet(selectedSuit, betAmount);
    }
  };

  return (
    <div className="dark-card rounded-2xl p-3 lg:p-4 shadow-2xl relative overflow-hidden betting-panel">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-base lg:text-lg font-bold text-white mb-3 text-center">Place Your Bets</h3>

        {/* Suit Icons */}
        <div className="grid grid-cols-4 gap-2 lg:gap-3 mb-4">
          {SUITS.map((suit) => (
            <button
              key={suit}
              onClick={() => setSelectedSuit(suit)}
              className={`p-2 lg:p-3 rounded-lg transition-all duration-200 ${
                selectedSuit === suit 
                  ? 'bg-orange-500/30 scale-110 shadow-lg border border-orange-400/50' 
                  : 'bg-black/20 hover:bg-orange-500/20'
              }`}
            >
              {getSuitIcon(suit, 'w-5 lg:w-6 h-5 lg:h-6')}
            </button>
          ))}
        </div>

        {/* Amount Slider */}
        <div className="mb-4">
          <label className="block text-white/70 text-xs lg:text-sm mb-2 text-center">
            Amount: <span className="text-white font-bold">{betAmount}</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={betAmount}
            onChange={(e) => setBetAmount(parseInt(e.target.value))}
            className="w-full h-2 lg:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <button
          onClick={handlePlaceBet}
          disabled={betAmount > Math.min(chipBalance, 20) || betAmount < 1}
          className="w-full glass-button orange-gradient hover:opacity-90 border border-orange-400/40
                   text-white font-bold py-2 lg:py-3 px-4 rounded-lg text-sm lg:text-base
                   transition-all duration-300 shadow-lg hover:shadow-orange-500/30 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Place Bet
        </button>
      </div>
    </div>
  );
}