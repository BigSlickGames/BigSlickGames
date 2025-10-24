import { PokerHand } from './pokerLogic';
import { Landmark } from 'lucide-react';

interface Card {
  suit: string;
  value: string;
}

interface PenaltyModalProps {
  card: Card;
  penalty: number;
  hand: PokerHand | null;
  handCards: Card[];
  ownerName: string;
  onPayPenalty: () => void;
  onSellCards: () => void;
}

export function PenaltyModal({ card, penalty, hand, handCards, ownerName, onPayPenalty, onSellCards }: PenaltyModalProps) {
  const getSuitColor = (suit: string) => {
    if (suit === '♥') return '#DC143C';
    if (suit === '♦') return '#90EE90';
    if (suit === '♣') return '#ADD8E6';
    return '#000000';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-4 border-red-400">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-2 animate-pulse">PENALTY!</h2>
          <p className="text-red-200 text-lg">
            You landed on {ownerName}'s property
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="text-white/70 text-sm mb-3 font-semibold text-center">Landed Card</div>
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-lg shadow-xl p-4 w-24 h-32 flex flex-col items-center justify-center gap-2">
              <div className="text-3xl font-bold" style={{ color: getSuitColor(card.suit) }}>
                {card.value}
              </div>
              <div className="text-4xl" style={{ color: getSuitColor(card.suit) }}>
                {card.suit}
              </div>
            </div>
          </div>

          {hand && hand !== 'High Card' && (
            <>
              <div className="text-yellow-300 text-xl font-bold text-center mb-3">
                Part of {hand}!
              </div>
              <div className="flex justify-center gap-2 flex-wrap mb-4">
                {handCards.map((hCard, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-lg shadow-xl p-3 w-16 h-24 flex flex-col items-center justify-center gap-1 ${
                      hCard.suit === card.suit && hCard.value === card.value ? 'ring-4 ring-yellow-400' : 'opacity-70'
                    }`}
                  >
                    <div className="text-xl font-bold" style={{ color: getSuitColor(hCard.suit) }}>
                      {hCard.value}
                    </div>
                    <div className="text-2xl" style={{ color: getSuitColor(hCard.suit) }}>
                      {hCard.suit}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {(!hand || hand === 'High Card') && (
            <div className="text-white/90 text-center mb-4">
              Not part of a poker hand
            </div>
          )}

          <div className="bg-red-900/50 rounded-lg p-4 text-center">
            <div className="text-red-200 text-sm mb-1">Penalty Amount</div>
            <div className="text-yellow-400 text-3xl font-bold">
              ${penalty.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onSellCards}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-4 rounded-xl shadow-xl transition-all hover:scale-105 text-lg flex items-center justify-center gap-2"
          >
            <Landmark className="w-6 h-6" />
            Sell Cards
          </button>
          <button
            onClick={onPayPenalty}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-8 rounded-xl shadow-xl transition-all hover:scale-105 text-xl"
          >
            Pay Penalty
          </button>
        </div>
      </div>
    </div>
  );
}
