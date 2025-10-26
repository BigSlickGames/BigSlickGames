import { PokerHand } from './pokerLogic';

interface Card {
  suit: string;
  value: string;
}

export interface HandGroup {
  handType: PokerHand;
  cards: Card[];
  rank: number;
}

const getCardNumericValue = (value: string): number => {
  if (value === 'A') return 14;
  if (value === 'K') return 13;
  if (value === 'Q') return 12;
  if (value === 'J') return 11;
  return parseInt(value);
};

export const detectAllPokerHands = (cards: (Card | null)[]): HandGroup[] => {
  const validCards = cards.filter((card): card is Card =>
    card !== null && card.suit !== '' && card.value !== ''
  );

  if (validCards.length === 0) return [];

  const groups: HandGroup[] = [];
  const usedCards = new Set<string>();
  const getCardKey = (card: Card) => `${card.suit}-${card.value}`;

  const sortedCards = [...validCards].sort((a, b) =>
    getCardNumericValue(b.value) - getCardNumericValue(a.value)
  );

  const findFourOfAKind = (available: Card[]): Card[] | null => {
    const valueCounts: { [key: string]: Card[] } = {};
    available.forEach(card => {
      const val = card.value.toUpperCase();
      if (!valueCounts[val]) valueCounts[val] = [];
      valueCounts[val].push(card);
    });

    for (const cards of Object.values(valueCounts)) {
      if (cards.length === 4) return cards;
    }
    return null;
  };

  const findThreeOfAKind = (available: Card[]): Card[] | null => {
    const valueCounts: { [key: string]: Card[] } = {};
    available.forEach(card => {
      const val = card.value.toUpperCase();
      if (!valueCounts[val]) valueCounts[val] = [];
      valueCounts[val].push(card);
    });

    for (const cards of Object.values(valueCounts)) {
      if (cards.length === 3) return cards;
    }
    return null;
  };

  const findPair = (available: Card[]): Card[] | null => {
    const valueCounts: { [key: string]: Card[] } = {};
    available.forEach(card => {
      const val = card.value.toUpperCase();
      if (!valueCounts[val]) valueCounts[val] = [];
      valueCounts[val].push(card);
    });

    const sortedValues = Object.entries(valueCounts)
      .filter(([_, cards]) => cards.length >= 2)
      .sort((a, b) => getCardNumericValue(b[1][0].value) - getCardNumericValue(a[1][0].value));

    return sortedValues.length > 0 ? sortedValues[0][1].slice(0, 2) : null;
  };

  const findFlush = (available: Card[]): Card[] | null => {
    const suitCounts: { [key: string]: Card[] } = {};
    available.forEach(card => {
      if (!suitCounts[card.suit]) suitCounts[card.suit] = [];
      suitCounts[card.suit].push(card);
    });

    for (const cards of Object.values(suitCounts)) {
      if (cards.length >= 5) {
        return cards.slice(0, 5);
      }
    }
    return null;
  };

  const findStraight = (available: Card[]): Card[] | null => {
    if (available.length < 5) return null;

    const sorted = [...available].sort((a, b) =>
      getCardNumericValue(b.value) - getCardNumericValue(a.value)
    );

    const uniqueValues = new Map<number, Card>();
    sorted.forEach(card => {
      const val = getCardNumericValue(card.value);
      if (!uniqueValues.has(val)) {
        uniqueValues.set(val, card);
      }
    });

    const values = Array.from(uniqueValues.keys()).sort((a, b) => b - a);

    for (let i = 0; i <= values.length - 5; i++) {
      let consecutive = true;
      for (let j = 0; j < 4; j++) {
        if (values[i + j] - values[i + j + 1] !== 1) {
          consecutive = false;
          break;
        }
      }
      if (consecutive) {
        return values.slice(i, i + 5).map(v => uniqueValues.get(v)!);
      }
    }

    if (values.includes(14) && values.includes(5) && values.includes(4) &&
        values.includes(3) && values.includes(2)) {
      return [14, 5, 4, 3, 2].map(v => uniqueValues.get(v)!);
    }

    return null;
  };

  const checkStraightFlush = (cards: Card[]): { isRoyal: boolean; cards: Card[] } | null => {
    const suitCounts: { [key: string]: Card[] } = {};
    cards.forEach(card => {
      if (!suitCounts[card.suit]) suitCounts[card.suit] = [];
      suitCounts[card.suit].push(card);
    });

    for (const suitCards of Object.values(suitCounts)) {
      if (suitCards.length >= 5) {
        const straight = findStraight(suitCards);
        if (straight) {
          const values = straight.map(c => getCardNumericValue(c.value));
          const isRoyal = values.includes(14) && values.includes(13) &&
                         values.includes(12) && values.includes(11) && values.includes(10);
          return { isRoyal, cards: straight };
        }
      }
    }
    return null;
  };

  while (true) {
    const available = sortedCards.filter(card => !usedCards.has(getCardKey(card)));
    if (available.length === 0) break;

    let foundHand = false;

    const straightFlush = checkStraightFlush(available);
    if (straightFlush) {
      if (straightFlush.isRoyal) {
        groups.push({ handType: 'Royal Flush', cards: straightFlush.cards, rank: 10 });
      } else {
        groups.push({ handType: 'Straight Flush', cards: straightFlush.cards, rank: 9 });
      }
      straightFlush.cards.forEach(card => usedCards.add(getCardKey(card)));
      foundHand = true;
      continue;
    }

    const fourOfAKind = findFourOfAKind(available);
    if (fourOfAKind) {
      groups.push({ handType: 'Four of a Kind', cards: fourOfAKind, rank: 8 });
      fourOfAKind.forEach(card => usedCards.add(getCardKey(card)));
      foundHand = true;
      continue;
    }

    const threeOfAKind = findThreeOfAKind(available);
    const pair = threeOfAKind ? findPair(available.filter(c => c.value.toUpperCase() !== threeOfAKind[0].value.toUpperCase())) : null;

    if (threeOfAKind && pair) {
      groups.push({ handType: 'Full House', cards: [...threeOfAKind, ...pair], rank: 7 });
      [...threeOfAKind, ...pair].forEach(card => usedCards.add(getCardKey(card)));
      foundHand = true;
      continue;
    }

    const flush = findFlush(available);
    if (flush) {
      groups.push({ handType: 'Flush', cards: flush, rank: 6 });
      flush.forEach(card => usedCards.add(getCardKey(card)));
      foundHand = true;
      continue;
    }

    const straight = findStraight(available);
    if (straight) {
      groups.push({ handType: 'Straight', cards: straight, rank: 5 });
      straight.forEach(card => usedCards.add(getCardKey(card)));
      foundHand = true;
      continue;
    }

    if (threeOfAKind) {
      groups.push({ handType: 'Three of a Kind', cards: threeOfAKind, rank: 4 });
      threeOfAKind.forEach(card => usedCards.add(getCardKey(card)));
      foundHand = true;
      continue;
    }

    const firstPair = findPair(available);
    if (firstPair) {
      const remainingAfterFirstPair = available.filter(c =>
        c.value.toUpperCase() !== firstPair[0].value.toUpperCase()
      );
      const secondPair = findPair(remainingAfterFirstPair);

      if (secondPair) {
        groups.push({ handType: 'Two Pair', cards: [...firstPair, ...secondPair], rank: 3 });
        [...firstPair, ...secondPair].forEach(card => usedCards.add(getCardKey(card)));
        foundHand = true;
        continue;
      } else {
        groups.push({ handType: 'Pair', cards: firstPair, rank: 2 });
        firstPair.forEach(card => usedCards.add(getCardKey(card)));
        foundHand = true;
        continue;
      }
    }

    if (!foundHand) {
      if (available.length > 0) {
        groups.push({ handType: 'High Card', cards: available, rank: 1 });
      }
      break;
    }
  }

  return groups.sort((a, b) => b.rank - a.rank);
};
