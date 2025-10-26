import { useState } from 'react';

interface CardModalProps {
  card: { suit: string; value: string } | null;
  onClose: () => void;
  onBuy: () => void;
}

const getCardPrice = (value: string): number => {
  const priceMap: { [key: string]: number } = {
    '3': 300,
    '4': 400,
    '5': 500,
    '6': 600,
    '7': 700,
    '8': 800,
    '9': 900,
    '10': 1000,
    'J': 1100,
    'Q': 1200,
    'K': 1300,
    'A': 1400
  };
  return priceMap[value] || 0;
};

export function CardModal({ card, onClose, onBuy }: CardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!card) return null;

  const getSuitColor = (suit: string) => {
    return suit === '♥' || suit === '♦' ? '#DC143C' : '#000000';
  };

  const buyPrice = getCardPrice(card.value);
  const sellPrice = Math.floor(buyPrice / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-yellow-600">
        <div className="text-white text-center mb-6">
          <h3 className="text-2xl font-bold">Card Landed On</h3>
        </div>

        <div className="flex justify-center mb-6">
          <div
            className="relative w-48 h-64 cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className="w-full h-full transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              <div
                className="absolute w-full h-full bg-white rounded-lg shadow-2xl p-8 flex flex-col items-center justify-center gap-4"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div
                  className="text-6xl font-bold"
                  style={{ color: getSuitColor(card.suit) }}
                >
                  {card.value}
                </div>
                <div
                  className="text-8xl"
                  style={{ color: getSuitColor(card.suit) }}
                >
                  {card.suit}
                </div>
              </div>

              <div
                className="absolute w-full h-full bg-gradient-to-br from-green-700 to-green-900 rounded-lg shadow-2xl p-6 flex flex-col items-center justify-center gap-3"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="text-white text-sm font-semibold mb-2">Property Value</div>
                <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-2">
                  <div className="text-yellow-400 text-xs mb-1">Buy Price</div>
                  <div className="text-white text-3xl font-bold">${buyPrice}</div>
                </div>
                <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-yellow-400 text-xs mb-1">Bank (Sell)</div>
                  <div className="text-white text-2xl font-bold">${sellPrice}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-white text-center text-sm mb-4 opacity-75">
          Click card to flip
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-xl transition-all hover:scale-105"
          >
            Close
          </button>
          <button
            onClick={onBuy}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-xl transition-all hover:scale-105"
          >
            Buy ${buyPrice}
          </button>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-xl transition-all hover:scale-105"
          >
            Bank ${sellPrice}
          </button>
        </div>
      </div>
    </div>
  );
}
