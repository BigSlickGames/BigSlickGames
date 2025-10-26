import React from 'react';
import { Landmark } from 'lucide-react';

interface Card {
  suit: string;
  value: string;
}

interface SellCardsModalProps {
  playerCards: Card[];
  onSellCards: (cardsToSell: Card[]) => void;
  onClose: () => void;
}

export function SellCardsModal({ playerCards, onSellCards, onClose }: SellCardsModalProps) {
  const [selectedCards, setSelectedCards] = React.useState<Set<number>>(new Set());

  const getSuitColor = (suit: string) => {
    if (suit === '♥') return '#DC143C';
    if (suit === '♦') return '#90EE90';
    if (suit === '♣') return '#ADD8E6';
    return '#000000';
  };

  const getCardValue = (card: Card) => {
    const values: { [key: string]: number } = {
      'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
    };
    return values[card.value] || 0;
  };

  const getCardPrice = (card: Card) => {
    return getCardValue(card) * 1000;
  };

  const toggleCardSelection = (index: number) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCards(newSelected);
  };

  const handleSell = () => {
    const cardsToSell = playerCards.filter((_, idx) => selectedCards.has(idx));
    if (cardsToSell.length > 0) {
      onSellCards(cardsToSell);
    }
  };

  const totalRefund = Array.from(selectedCards).reduce((sum, idx) => {
    return sum + Math.floor(getCardPrice(playerCards[idx]) / 2);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-2xl border-4 border-green-400">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Landmark className="w-10 h-10 text-yellow-400" />
            <h2 className="text-4xl font-bold text-white">Sell to Bank</h2>
            <Landmark className="w-10 h-10 text-yellow-400" />
          </div>
          <p className="text-green-200 text-lg">
            Select cards to sell back for 50% of purchase price
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 max-h-96 overflow-y-auto">
          <div className="text-white/70 text-sm mb-3 font-semibold text-center">Your Owned Cards</div>

          {playerCards.length === 0 ? (
            <div className="text-white text-center py-8">
              You don't own any cards to sell
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {playerCards.map((card, idx) => {
                const price = getCardPrice(card);
                const refund = Math.floor(price / 2);
                const isSelected = selectedCards.has(idx);

                return (
                  <div
                    key={idx}
                    onClick={() => toggleCardSelection(idx)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'scale-105 ring-4 ring-yellow-400' : 'hover:scale-105'
                    }`}
                  >
                    <div
                      className="bg-white rounded-lg shadow-xl p-3 w-full h-32 flex flex-col items-center justify-center gap-1"
                    >
                      <div className="text-2xl font-bold" style={{ color: getSuitColor(card.suit) }}>
                        {card.value}
                      </div>
                      <div className="text-3xl" style={{ color: getSuitColor(card.suit) }}>
                        {card.suit}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        ${refund.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedCards.size > 0 && (
          <div className="bg-green-900/50 rounded-lg p-4 text-center mb-6">
            <div className="text-green-200 text-sm mb-1">Total Refund</div>
            <div className="text-yellow-400 text-3xl font-bold">
              ${totalRefund.toLocaleString()}
            </div>
            <div className="text-green-300 text-xs mt-1">
              {selectedCards.size} card{selectedCards.size !== 1 ? 's' : ''} selected
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl shadow-xl transition-all hover:scale-105 text-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSell}
            disabled={selectedCards.size === 0}
            className={`flex-1 font-bold py-4 px-8 rounded-xl shadow-xl transition-all text-xl ${
              selectedCards.size > 0
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black hover:scale-105'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Sell Cards
          </button>
        </div>
      </div>
    </div>
  );
}
