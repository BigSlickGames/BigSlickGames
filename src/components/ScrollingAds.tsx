import React from 'react';

interface ScrollingAdsProps {
  onGameClick: (gameId: string) => void;
}

const ads = [
  {
    id: 'stack-em',
    text: '🎯 STACK\'EM - Build Your Way to Victory! Play Now!',
    color: 'text-orange-400'
  },
  {
    id: 'hold-em',
    text: '♠️ 21 HOLD\'EM - Strategic Poker Action Awaits!',
    color: 'text-red-400'
  },
  {
    id: 'deck-realms',
    text: '🃏 DECK REALMS - Create Ultimate Card Combinations!',
    color: 'text-yellow-400'
  },
  {
    id: 'multi-up',
    text: '🚀 MULTI\'UP - Progressive Challenges & Big Wins!',
    color: 'text-purple-400'
  },
  {
    id: 'pokeroply',
    text: '🏆 POKER\'OPLY - Where Poker Meets Property Trading!',
    color: 'text-green-400'
  },
  {
    id: 'space-crash',
    text: '🚀 SPACE CRASH - Crash Landing Adventure Awaits!',
    color: 'text-purple-400'
  }
];

export default function ScrollingAds({ onGameClick }: ScrollingAdsProps) {
  return (
    <div className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 border border-orange-500/20 rounded-lg overflow-hidden shadow-lg shadow-orange-500/10">
      <div className="relative h-12 flex items-center">
        <div className="absolute left-0 w-8 h-full bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
        <div className="absolute right-0 w-8 h-full bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
        
        <div className="animate-scroll flex items-center space-x-8 whitespace-nowrap">
          {[...ads, ...ads, ...ads].map((ad, index) => (
            <button
              key={`${ad.id}-${index}`}
              onClick={() => onGameClick(ad.id)}
              className={`${ad.color} hover:text-white transition-colors font-semibold text-sm cursor-pointer hover:scale-105 transform transition-transform touch-manipulation`}
            >
              {ad.text}
            </button>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll {
          animation: scroll 45s linear infinite;
        }
      `}</style>
    </div>
  );
}