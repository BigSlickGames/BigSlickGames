import { detectPokerHand, PokerHand } from './pokerLogic';

interface Card {
  suit: string;
  value: string;
}

export interface CardGroup {
  handType: PokerHand;
  cards: Card[];
}

export const groupCardsByHand = (cards: (Card | null)[]): CardGroup[] => {
  const validCards = cards.filter((card): card is Card =>
    card !== null && card.suit !== '' && card.value !== ''
  );

  if (validCards.length === 0) return [];

  const groups: CardGroup[] = [];
  const usedCards = new Set<string>();

  const getCardKey = (card: Card) => `${card.suit}-${card.value}`;

  const tryDetectHand = (availableCards: Card[]): { hand: PokerHand; cards: Card[] } | null => {
    const handResult = detectPokerHand(availableCards);
    if (!handResult || handResult.hand === 'High Card') return null;
    return { hand: handResult.hand, cards: handResult.cards };
  };

  let remainingCards = [...validCards];

  while (remainingCards.length > 0) {
    const availableCards = remainingCards.filter(card => !usedCards.has(getCardKey(card)));
    if (availableCards.length === 0) break;

    const detectedHand = tryDetectHand(availableCards);

    if (detectedHand) {
      groups.push({
        handType: detectedHand.hand,
        cards: detectedHand.cards
      });

      detectedHand.cards.forEach(card => usedCards.add(getCardKey(card)));
      remainingCards = remainingCards.filter(card => !usedCards.has(getCardKey(card)));
    } else {
      const ungroupedCards = availableCards.filter(card => !usedCards.has(getCardKey(card)));
      if (ungroupedCards.length > 0) {
        groups.push({
          handType: 'High Card',
          cards: ungroupedCards
        });
      }
      break;
    }
  }

  return groups;
};

export const getHandPriority = (hand: PokerHand): number => {
  const priorities: { [key in PokerHand]: number } = {
    'Royal Flush': 10,
    'Straight Flush': 9,
    'Four of a Kind': 8,
    'Full House': 7,
    'Flush': 6,
    'Straight': 5,
    'Three of a Kind': 4,
    'Two Pair': 3,
    'Pair': 2,
    'High Card': 1
  };
  return priorities[hand];
};
