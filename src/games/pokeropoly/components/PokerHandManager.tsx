import { HandGroup } from './CardManagementSystem';
import { PokerHand } from './pokerLogic';

interface PokerHandManagerProps {
  cardGroups: HandGroup[];
  playerColor: string;
}

export function PokerHandManager({ cardGroups, playerColor }: PokerHandManagerProps) {
  const getSuitColor = (suit: string) => {
    if (suit === '♥') return '#DC143C';
    if (suit === '♦') return '#90EE90';
    if (suit === '♣') return '#ADD8E6';
    return '#000000';
  };

  const getHandMultiplier = (hand: PokerHand): string => {
    const multipliers: { [key in PokerHand]: string } = {
      'Royal Flush': '8x',
      'Straight Flush': '6x',
      'Four of a Kind': '5x',
      'Full House': '4x',
      'Flush': '3x',
      'Straight': '3x',
      'Three of a Kind': '2.5x',
      'Two Pair': '2x',
      'Pair': '1.5x',
      'High Card': '-'
    };
    return multipliers[hand];
  };

  const getHandRank = (rank: number): number => {
    return 11 - rank;
  };

  const getHandGradient = (rank: number): string => {
    if (rank >= 8) return 'from-yellow-500/30 to-yellow-700/30';
    if (rank >= 6) return 'from-purple-500/30 to-purple-700/30';
    if (rank >= 4) return 'from-blue-500/30 to-blue-700/30';
    if (rank >= 2) return 'from-green-500/30 to-green-700/30';
    return 'from-gray-500/30 to-gray-700/30';
  };

  const getHandBorder = (rank: number): string => {
    if (rank >= 8) return 'border-yellow-400/60';
    if (rank >= 6) return 'border-purple-400/60';
    if (rank >= 4) return 'border-blue-400/60';
    if (rank >= 2) return 'border-green-400/60';
    return 'border-gray-400/60';
  };

  const sortedGroups = [...cardGroups];

  if (sortedGroups.length === 0) {
    return (
      <div className="text-white/50 text-xs text-center py-2">
        No cards collected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedGroups.map((group, groupIndex) => {
        const displayRank = getHandRank(group.rank);
        const multiplier = getHandMultiplier(group.handType);

        return (
          <div
            key={groupIndex}
            className={`bg-gradient-to-br ${getHandGradient(group.rank)} backdrop-blur-sm rounded-lg border-2 ${getHandBorder(group.rank)} p-3 transition-all hover:scale-[1.02]`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="text-white text-xs font-black px-2 py-0.5 rounded"
                  style={{ backgroundColor: playerColor }}
                >
                  #{displayRank}
                </div>
                <div className="text-white text-xs font-bold uppercase tracking-wide">
                  {group.handType}
                </div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                <span className="text-yellow-300 text-xs font-bold">
                  {multiplier}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {group.cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className="bg-white rounded border-2 border-gray-300 w-11 h-14 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-110"
                  style={{ borderColor: getSuitColor(card.suit) }}
                >
                  <div className="text-xs font-bold" style={{ color: getSuitColor(card.suit) }}>
                    {card.value}
                  </div>
                  <div className="text-base" style={{ color: getSuitColor(card.suit) }}>
                    {card.suit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
