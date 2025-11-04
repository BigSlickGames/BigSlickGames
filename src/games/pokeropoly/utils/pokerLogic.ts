interface Card {
  suit: string;
  value: string;
}

export type PokerHand =
  | "Royal Flush"
  | "Straight Flush"
  | "Four of a Kind"
  | "Full House"
  | "Flush"
  | "Straight"
  | "Three of a Kind"
  | "Two Pair"
  | "Pair"
  | "High Card";

export interface HandResult {
  hand: PokerHand;
  cards: Card[];
  multiplier: number;
  penalty?: number;
}

const getCardNumericValue = (value: string): number => {
  if (value === "WILD") return 0; // Wilds have special handling
  if (value === "A") return 14;
  if (value === "K") return 13;
  if (value === "Q") return 12;
  if (value === "J") return 11;
  return parseInt(value);
};

export const getCardPrice = (value: string): number => {
  const priceMap: { [key: string]: number } = {
    "2": 200,
    "3": 300,
    "4": 400,
    "5": 500,
    "6": 600,
    "7": 700,
    "8": 800,
    "9": 900,
    "10": 1000,
    J: 1100,
    Q: 1200,
    K: 1300,
    A: 1400,
  };
  return priceMap[value] || 0;
};

// Helper function to get hand rank (higher = better)
const getHandRank = (hand: PokerHand): number => {
  const ranks = {
    "Royal Flush": 10,
    "Straight Flush": 9,
    "Four of a Kind": 8,
    "Full House": 7,
    Flush: 6,
    Straight: 5,
    "Three of a Kind": 4,
    "Two Pair": 3,
    Pair: 2,
    "High Card": 1,
  };
  return ranks[hand];
};

// Compare two hands and return true if hand1 is better than hand2
const isBetterHand = (
  hand1: HandResult | null,
  hand2: HandResult | null
): boolean => {
  if (!hand1) return false;
  if (!hand2) return true;

  const rank1 = getHandRank(hand1.hand);
  const rank2 = getHandRank(hand2.hand);

  if (rank1 !== rank2) return rank1 > rank2;

  // If same hand type, compare high cards
  const values1 = hand1.cards
    .map((c) => getCardNumericValue(c.value))
    .sort((a, b) => b - a);
  const values2 = hand2.cards
    .map((c) => getCardNumericValue(c.value))
    .sort((a, b) => b - a);

  for (let i = 0; i < Math.min(values1.length, values2.length); i++) {
    if (values1[i] !== values2[i]) return values1[i] > values2[i];
  }

  return false;
};

// Check for straight in a set of cards
const checkStraight = (cards: Card[]): Card[] | null => {
  if (cards.length < 5) return null;

  const values = cards.map((c) => getCardNumericValue(c.value));
  const uniqueValues = Array.from(new Set(values)).sort((a, b) => b - a);

  // Check for regular straights
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    let consecutive = true;
    for (let j = 0; j < 4; j++) {
      if (uniqueValues[i + j] - uniqueValues[i + j + 1] !== 1) {
        consecutive = false;
        break;
      }
    }
    if (consecutive) {
      // Found a straight, return the cards that form it
      const straightValues = uniqueValues.slice(i, i + 5);
      const straightCards = straightValues
        .map((val) => cards.find((c) => getCardNumericValue(c.value) === val))
        .filter((c): c is Card => c !== undefined);
      return straightCards;
    }
  }

  // Check for A-2-3-4-5 straight (wheel)
  if (
    uniqueValues.includes(14) &&
    uniqueValues.includes(5) &&
    uniqueValues.includes(4) &&
    uniqueValues.includes(3) &&
    uniqueValues.includes(2)
  ) {
    const wheelCards = [14, 5, 4, 3, 2]
      .map((val) => cards.find((c) => getCardNumericValue(c.value) === val))
      .filter((c): c is Card => c !== undefined);
    return wheelCards;
  }

  return null;
};

// Detect hand without wilds
const detectHandWithoutWilds = (cards: Card[]): HandResult | null => {
  if (cards.length === 0) {
    return {
      hand: "High Card",
      cards: [],
      multiplier: 0.33,
    };
  }

  const sortedCards = [...cards].sort(
    (a, b) => getCardNumericValue(b.value) - getCardNumericValue(a.value)
  );

  // Count values and suits
  const valueCounts: { [key: string]: Card[] } = {};
  const suitCounts: { [key: string]: Card[] } = {};

  sortedCards.forEach((card) => {
    const value = card.value;
    if (!valueCounts[value]) valueCounts[value] = [];
    valueCounts[value].push(card);

    if (!suitCounts[card.suit]) suitCounts[card.suit] = [];
    suitCounts[card.suit].push(card);
  });

  const valueCountsArray = Object.values(valueCounts).sort(
    (a, b) => b.length - a.length
  );

  // Check for flush
  const flushSuit = Object.entries(suitCounts).find(
    ([_, cards]) => cards.length >= 5
  );
  const isFlush = flushSuit !== undefined;
  const flushCards = flushSuit ? flushSuit[1] : [];

  // Check for straight
  const straightCards = checkStraight(sortedCards);
  const isStraight = straightCards !== null;

  // Check for straight flush
  if (isFlush && flushCards.length >= 5) {
    const straightFlushCards = checkStraight(flushCards);
    if (straightFlushCards && straightFlushCards.length >= 5) {
      const values = straightFlushCards.map((c) =>
        getCardNumericValue(c.value)
      );
      const isRoyal =
        values.includes(14) &&
        values.includes(13) &&
        values.includes(12) &&
        values.includes(11) &&
        values.includes(10);

      if (isRoyal) {
        return {
          hand: "Royal Flush",
          cards: straightFlushCards.slice(0, 5),
          multiplier: 8,
        };
      }
      return {
        hand: "Straight Flush",
        cards: straightFlushCards.slice(0, 5),
        multiplier: 6,
      };
    }
  }

  // Check for four of a kind
  const hasFour = valueCountsArray.find((cards) => cards.length === 4);
  if (hasFour) {
    return { hand: "Four of a Kind", cards: hasFour, multiplier: 5 };
  }

  // Check for full house
  const hasThree = valueCountsArray.find((cards) => cards.length === 3);
  const hasPair = valueCountsArray.find(
    (cards) => cards.length === 2 && cards !== hasThree
  );

  if (hasThree && hasPair) {
    return {
      hand: "Full House",
      cards: [...hasThree, ...hasPair],
      multiplier: 4,
    };
  }

  // Check for flush
  if (isFlush) {
    return { hand: "Flush", cards: flushCards.slice(0, 5), multiplier: 3 };
  }

  // Check for straight
  if (isStraight && straightCards) {
    return {
      hand: "Straight",
      cards: straightCards.slice(0, 5),
      multiplier: 3,
    };
  }

  // Check for three of a kind
  if (hasThree) {
    return { hand: "Three of a Kind", cards: hasThree, multiplier: 2.5 };
  }

  // Check for two pair
  const pairs = valueCountsArray.filter((cards) => cards.length === 2);
  if (pairs.length >= 2) {
    return {
      hand: "Two Pair",
      cards: [...pairs[0], ...pairs[1]],
      multiplier: 2,
    };
  }

  // Check for pair
  if (pairs.length === 1) {
    return { hand: "Pair", cards: pairs[0], multiplier: 1.5 };
  }

  // High card
  return { hand: "High Card", cards: [sortedCards[0]], multiplier: 0.33 };
};

// Main function to detect poker hand with wild cards
export const detectPokerHand = (
  cards: (Card | null)[],
  wilds: number = 0
): HandResult | null => {
  console.log("🔍 detectPokerHand called with:", {
    cards: cards.length,
    wilds,
  });

  // Filter valid cards
  const validCards = cards.filter(
    (card): card is Card =>
      card !== null && card.suit !== "" && card.value !== ""
  );

  console.log("✅ Valid cards after filtering:", {
    validCards: validCards.length,
    wilds,
    total: validCards.length + wilds,
  });

  // If no cards at all
  if (validCards.length === 0 && wilds === 0) {
    return {
      hand: "High Card",
      cards: [],
      multiplier: 0.33,
    };
  }

  // If no wilds, just check normally
  if (wilds === 0) {
    const result = detectHandWithoutWilds(validCards);
    console.log("🎰 No wilds, result:", result?.hand);
    return result;
  }

  // WITH WILDS: Try all possible wild card combinations
  let bestHand: HandResult | null = null;
  const wildValues = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  const suits = ["♠", "♥", "♦", "♣"];

  console.log(`🃏 Testing ${wilds} wild card(s)...`);

  if (wilds === 1) {
    // Try each possible value and suit for the wild card
    for (const value of wildValues) {
      for (const suit of suits) {
        const testCards = [...validCards, { suit, value }];
        const result = detectHandWithoutWilds(testCards);

        if (isBetterHand(result, bestHand)) {
          bestHand = result;
          console.log(
            `🃏 Found better hand with wild as ${value}${suit}: ${result?.hand}`
          );
        }
      }
    }
  } else if (wilds === 2) {
    // Try each possible combination for 2 wild cards
    for (const value1 of wildValues) {
      for (const suit1 of suits) {
        for (const value2 of wildValues) {
          for (const suit2 of suits) {
            const testCards = [
              ...validCards,
              { suit: suit1, value: value1 },
              { suit: suit2, value: value2 },
            ];
            const result = detectHandWithoutWilds(testCards);

            if (isBetterHand(result, bestHand)) {
              bestHand = result;
              console.log(
                `🃏 Found better hand with wilds as ${value1}${suit1} and ${value2}${suit2}: ${result?.hand}`
              );
            }
          }
        }
      }
    }
  } else if (wilds >= 3) {
    // For 3+ wilds, use a simplified approach (checking common high hands)
    // This prevents combinatorial explosion
    console.log("🃏 3+ wilds - using simplified approach");

    // Try for Royal Flush (best possible)
    for (const suit of suits) {
      const testCards = [
        ...validCards,
        { suit, value: "A" },
        { suit, value: "K" },
        { suit, value: "Q" },
        { suit, value: "J" },
        { suit, value: "10" },
      ];
      const result = detectHandWithoutWilds(testCards);
      if (isBetterHand(result, bestHand)) {
        bestHand = result;
      }
    }

    // Try for Four of a Kind with highest cards
    for (const value of ["A", "K", "Q", "J", "10"]) {
      const testCards = [
        ...validCards,
        { suit: "♠", value },
        { suit: "♥", value },
        { suit: "♦", value },
        { suit: "♣", value },
      ];
      const result = detectHandWithoutWilds(testCards);
      if (isBetterHand(result, bestHand)) {
        bestHand = result;
      }
    }
  }

  console.log(`🎰 Best hand found with ${wilds} wild(s): ${bestHand?.hand}`);
  return bestHand;
};

const calculateRankFactor = (handResult: HandResult): number => {
  const { hand, cards } = handResult;
  const ranks = cards
    .filter((c) => c.value !== "WILD")
    .map((c) => getCardNumericValue(c.value));

  if (ranks.length === 0) return 1; // All wilds

  switch (hand) {
    case "Royal Flush":
      return 1;

    case "Pair":
    case "Three of a Kind":
    case "Four of a Kind":
      return ranks[0] / 14;

    case "Two Pair": {
      const sum = ranks.reduce((a, b) => a + b, 0);
      return sum / ranks.length / 14;
    }

    case "Full House": {
      const valueCounts: { [key: number]: number } = {};
      ranks.forEach((r) => {
        valueCounts[r] = (valueCounts[r] || 0) + 1;
      });

      let tripleRank = 0;
      let pairRank = 0;

      for (const [rank, count] of Object.entries(valueCounts)) {
        if (count >= 3) tripleRank = parseInt(rank);
        else if (count >= 2) pairRank = parseInt(rank);
      }

      if (tripleRank === 0) tripleRank = ranks[0];
      if (pairRank === 0) pairRank = ranks[0];

      return (3 * tripleRank + 2 * pairRank) / 5 / 14;
    }

    case "Straight":
      return Math.max(...ranks) / 14;

    case "Flush":
    case "Straight Flush": {
      const sum = ranks.reduce((a, b) => a + b, 0);
      return sum / ranks.length / 14;
    }

    default:
      return ranks[0] / 14;
  }
};

export const calculatePenaltyForHand = (
  cards: Card[],
  wilds: number = 0
): { handType: string; penalty: number } => {
  console.log("💰 calculatePenaltyForHand called with:", {
    cards: cards.length,
    wilds,
  });

  if (!cards || cards.length === 0) {
    console.log("⚠️ No cards for penalty calculation, returning 0");
    return { handType: "High Card", penalty: 0 };
  }

  const handResult = detectPokerHand(cards, wilds);

  if (!handResult || handResult.hand === "High Card") {
    console.log("⚠️ High Card detected, no penalty");
    return { handType: "High Card", penalty: 0 };
  }

  const sumOfCardValues = handResult.cards
    .filter((c) => c.value !== "WILD")
    .reduce((sum, c) => sum + getCardPrice(c.value), 0);
  const baseRent = sumOfCardValues * 0.1;
  const rankFactor = calculateRankFactor(handResult);
  const penalty = Math.floor(baseRent * handResult.multiplier * rankFactor);

  console.log(
    `💰 Penalty calculated: ${penalty} for ${handResult.hand} (with ${wilds} wilds)`
  );

  return {
    handType: handResult.hand,
    penalty,
  };
};

export const calculatePenalty = (
  card: Card,
  ownerCards: (Card | null)[],
  ownerBoughtCards: any[] = [],
  ownerWilds: number = 0
): { penalty: number; hand: PokerHand | null } => {
  console.log("💸 calculatePenalty called with wilds:", ownerWilds);
  console.log("💸 Card:", card);
  console.log("💸 Owner cards:", ownerCards);

  if (!ownerCards || ownerCards.length === 0) {
    const basePrice = getCardPrice(card.value);
    const basePenalty = Math.floor(basePrice * 0.25);
    console.log(`⚠️ No owner cards, using base penalty: ${basePenalty}`);
    return { penalty: basePenalty, hand: null };
  }

  const handResult = detectPokerHand(ownerCards, ownerWilds);
  const basePrice = getCardPrice(card.value);

  if (!handResult || handResult.hand === "High Card") {
    const basePenalty = Math.floor(basePrice * 0.25);
    console.log(`💸 High Card, base penalty: ${basePenalty}`);
    return { penalty: basePenalty, hand: null };
  }

  const isPartOfHand = handResult.cards.some(
    (hCard) => hCard.suit === card.suit && hCard.value === card.value
  );

  if (isPartOfHand) {
    const result = calculatePenaltyForHand(handResult.cards, ownerWilds);
    console.log(`💸 Card is part of hand, penalty: ${result.penalty}`);
    return { penalty: result.penalty, hand: handResult.hand };
  }

  const basePenalty = Math.floor(basePrice * 0.25);
  console.log(`💸 Card not part of hand, base penalty: ${basePenalty}`);
  return { penalty: basePenalty, hand: null };
};

export const getHandDescription = (handResult: HandResult): string => {
  if (!handResult) return "No hand";

  const descriptions: { [key in PokerHand]: string } = {
    "Royal Flush": "8x - A, K, Q, J, 10 of same suit",
    "Straight Flush": "6x - 5 consecutive cards of same suit",
    "Four of a Kind": "5x - 4 cards of same value",
    "Full House": "4x - 3 of a kind + pair",
    Flush: "3x - 5 cards of same suit",
    Straight: "3x - 5 consecutive cards",
    "Three of a Kind": "2.5x - 3 cards of same value",
    "Two Pair": "2x - 2 pairs of cards",
    Pair: "1.5x - 2 cards of same value",
    "High Card": "No multiplier - No poker hand",
  };
  return descriptions[handResult.hand];
};
