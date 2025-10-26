interface Card {
  suit: string;
  value: string;
}

export type PokerHand =
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'Pair'
  | 'High Card';

export interface HandResult {
  hand: PokerHand;
  cards: Card[];
  multiplier: number;
  penalty?: number;
}

const getCardNumericValue = (value: string): number => {
  if (value === 'A') return 14;
  if (value === 'K') return 13;
  if (value === 'Q') return 12;
  if (value === 'J') return 11;
  return parseInt(value);
};

const normalizeValue = (value: string): string => {
  return value;
};

export const getCardPrice = (value: string): number => {
  const priceMap: { [key: string]: number } = {
    '2': 200,
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

export const detectPokerHand = (cards: (Card | null)[]): HandResult | null => {
  const validCards = cards.filter((card): card is Card => card !== null && card.suit !== '' && card.value !== '');

  if (validCards.length === 0) return null;

  const sortedCards = [...validCards].sort((a, b) =>
    getCardNumericValue(b.value) - getCardNumericValue(a.value)
  );

  const valueCounts: { [key: string]: Card[] } = {};
  const suitCounts: { [key: string]: Card[] } = {};

  sortedCards.forEach(card => {
    const normalizedValue = card.value.toUpperCase();
    if (!valueCounts[normalizedValue]) valueCounts[normalizedValue] = [];
    valueCounts[normalizedValue].push(card);

    if (!suitCounts[card.suit]) suitCounts[card.suit] = [];
    suitCounts[card.suit].push(card);
  });

  const isFlush = Object.values(suitCounts).some(cards => cards.length >= 5);
  const isStraight = checkStraight(sortedCards);

  if (isFlush && isStraight) {
    const flushCards = Object.values(suitCounts).find(cards => cards.length >= 5)!;
    const straightInFlush = checkStraight(flushCards);
    if (straightInFlush) {
      const values = flushCards.map(c => getCardNumericValue(c.value));
      const isRoyal = values.includes(14) && values.includes(13) && values.includes(12) && values.includes(11) && values.includes(10);
      if (isRoyal) {
        return { hand: 'Royal Flush', cards: flushCards.slice(0, 5), multiplier: 8 };
      }
      return { hand: 'Straight Flush', cards: flushCards.slice(0, 5), multiplier: 6 };
    }
  }

  const valueCountsArray = Object.values(valueCounts);
  const hasFour = valueCountsArray.find(cards => cards.length === 4);
  if (hasFour) {
    return { hand: 'Four of a Kind', cards: hasFour, multiplier: 5 };
  }

  const hasThree = valueCountsArray.find(cards => cards.length === 3);
  const hasPair = valueCountsArray.find(cards => cards.length === 2);
  if (hasThree && hasPair) {
    return { hand: 'Full House', cards: [...hasThree, ...hasPair], multiplier: 4 };
  }

  if (isFlush) {
    const flushCards = Object.values(suitCounts).find(cards => cards.length >= 5)!;
    return { hand: 'Flush', cards: flushCards.slice(0, 5), multiplier: 3 };
  }

  if (isStraight) {
    return { hand: 'Straight', cards: sortedCards.slice(0, 5), multiplier: 3 };
  }

  if (hasThree) {
    return { hand: 'Three of a Kind', cards: hasThree, multiplier: 2.5 };
  }

  const pairs = valueCountsArray.filter(cards => cards.length === 2);
  if (pairs.length >= 2) {
    return { hand: 'Two Pair', cards: [...pairs[0], ...pairs[1]], multiplier: 2 };
  }

  if (hasPair) {
    return { hand: 'Pair', cards: hasPair, multiplier: 1.5 };
  }

  return { hand: 'High Card', cards: [sortedCards[0]], multiplier: 0.33 };
};

const checkStraight = (cards: Card[]): boolean => {
  if (cards.length < 5) return false;

  const values = cards.map(c => getCardNumericValue(c.value));
  const uniqueValues = Array.from(new Set(values)).sort((a, b) => b - a);

  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    let consecutive = true;
    for (let j = 0; j < 4; j++) {
      if (uniqueValues[i + j] - uniqueValues[i + j + 1] !== 1) {
        consecutive = false;
        break;
      }
    }
    if (consecutive) return true;
  }

  if (uniqueValues.includes(14) && uniqueValues.includes(5) && uniqueValues.includes(4) &&
      uniqueValues.includes(3) && uniqueValues.includes(2)) {
    return true;
  }

  return false;
};

const calculateRankFactor = (handResult: HandResult): number => {
  const { hand, cards } = handResult;
  const ranks = cards.map(c => getCardNumericValue(c.value));

  switch (hand) {
    case 'Royal Flush':
      return 1;

    case 'Pair':
    case 'Three of a Kind':
    case 'Four of a Kind':
      return ranks[0] / 14;

    case 'Two Pair': {
      const sum = ranks.reduce((a, b) => a + b, 0);
      return sum / ranks.length / 14;
    }

    case 'Full House': {
      const valueCounts: { [key: number]: number } = {};
      ranks.forEach(r => {
        valueCounts[r] = (valueCounts[r] || 0) + 1;
      });

      let tripleRank = 0;
      let pairRank = 0;

      for (const [rank, count] of Object.entries(valueCounts)) {
        if (count === 3) tripleRank = parseInt(rank);
        if (count === 2) pairRank = parseInt(rank);
      }

      return ((3 * tripleRank + 2 * pairRank) / 5) / 14;
    }

    case 'Straight':
      return Math.max(...ranks) / 14;

    case 'Flush':
    case 'Straight Flush': {
      const sum = ranks.reduce((a, b) => a + b, 0);
      return sum / ranks.length / 14;
    }

    default:
      return ranks[0] / 14;
  }
};

export const calculatePenaltyForHand = (cards: Card[]): { handType: string; penalty: number } => {
  const handResult = detectPokerHand(cards);

  if (!handResult || handResult.hand === 'High Card') {
    return { handType: 'High Card', penalty: 0 };
  }

  const sumOfCardValues = handResult.cards.reduce((sum, c) => sum + getCardPrice(c.value), 0);
  const baseRent = sumOfCardValues * 0.1;
  const rankFactor = calculateRankFactor(handResult);
  const penalty = Math.floor(baseRent * handResult.multiplier * rankFactor);

  return {
    handType: handResult.hand,
    penalty
  };
};

export const calculatePenalty = (card: Card, ownerCards: (Card | null)[]): { penalty: number; hand: PokerHand | null } => {
  const handResult = detectPokerHand(ownerCards);
  const basePrice = getCardPrice(card.value);

  if (!handResult || handResult.hand === 'High Card') {
    return { penalty: Math.floor(basePrice * 0.25), hand: null };
  }

  const isPartOfHand = handResult.cards.some(
    hCard => hCard.suit === card.suit && hCard.value === card.value
  );

  if (isPartOfHand) {
    const result = calculatePenaltyForHand(handResult.cards);
    return { penalty: result.penalty, hand: handResult.hand };
  }

  return { penalty: Math.floor(basePrice * 0.25), hand: null };
};

export const getHandDescription = (hand: PokerHand): string => {
  const descriptions: { [key in PokerHand]: string } = {
    'Royal Flush': '8x multiplier - A, K, Q, J, 10 of same suit',
    'Straight Flush': '6x multiplier - 5 consecutive cards of same suit',
    'Four of a Kind': '5x multiplier - 4 cards of same value',
    'Full House': '4x multiplier - 3 of a kind + pair',
    'Flush': '3x multiplier - 5 cards of same suit',
    'Straight': '3x multiplier - 5 consecutive cards',
    'Three of a Kind': '2.5x multiplier - 3 cards of same value',
    'Two Pair': '2x multiplier - 2 pairs of cards',
    'Pair': '1.5x multiplier - 2 cards of same value',
    'High Card': 'No multiplier - No poker hand'
  };
  return descriptions[hand];
};
