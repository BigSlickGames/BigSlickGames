import { detectAllPokerHands } from './CardManagementSystem';
import { PokerHandManager } from './PokerHandManager';

interface PlayerProfileProps {
  name: string;
  chips: number;
  color: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  collectedCards: Array<{ suit: string; value: string } | null>;
  boughtCards: Array<{ suit: string; value: string; position: number }>;
  isCurrentPlayer: boolean;
  onDrawFromDeck?: () => void;
  isMoving?: boolean;
  showDeckButton?: boolean;
}

export function PlayerProfile({ name, chips, color, position, collectedCards, boughtCards, isCurrentPlayer, onDrawFromDeck, isMoving, showDeckButton }: PlayerProfileProps) {
  const positionStyles = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    right: 'right-4 top-1/2 -translate-y-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2'
  };

  const cardGroups = detectAllPokerHands(collectedCards);

  return (
    <div
      className={`absolute ${positionStyles[position]} backdrop-blur-md rounded-xl border-2 shadow-2xl p-4 min-w-[300px] max-w-[400px] z-50`}
      style={{
        background: `linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.75)), linear-gradient(135deg, ${color}40, ${color}30)`,
        borderColor: `${color}80`
      }}
    >
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-bold text-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {name}
          </h3>
          <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg">
            <span className="text-yellow-400 font-bold text-sm">
              ${chips.toLocaleString()}
            </span>
          </div>
        </div>

        {isCurrentPlayer && showDeckButton && (
          <button
            onClick={onDrawFromDeck}
            disabled={isMoving}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-xl transition-all hover:scale-105 text-sm border-2 border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Draw from Roll Deck
          </button>
        )}
      </div>

      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 max-h-[400px] overflow-y-auto space-y-3">
        {boughtCards.length > 0 && (
          <div>
            <div className="text-white text-xs font-bold mb-2 uppercase tracking-wide">Bought Cards</div>
            <div className="flex flex-wrap gap-1.5">
              {boughtCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded border-2 shadow-sm w-11 h-14 flex flex-col items-center justify-center"
                  style={{ borderColor: color }}
                >
                  <div className="text-[10px] font-bold leading-none" style={{ color }}>
                    {card.value}
                  </div>
                  <div className="text-sm leading-none mt-0.5" style={{ color }}>
                    {card.suit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="text-white text-xs font-bold mb-2 uppercase tracking-wide">Poker Hands</div>
          <PokerHandManager cardGroups={cardGroups} playerColor={color} />
        </div>
      </div>
    </div>
  );
}
