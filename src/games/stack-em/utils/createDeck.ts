import { Card, Deck, Suit, Rank } from '../types/Card';

export function createDeck(): Deck {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const values: { [key in Rank]: number } = {
    'A': 11, // Ace can be 1 or 11, we'll handle this logic in the game
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 10,
    'Q': 10,
    'K': 10
  };

  const deck: Deck = [];
  
  // Create the standard 52-card deck
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        value: values[rank],
        isDealt: false,
        isSwapCard: false,
        isWildCard: false
      });
    }
  }

  // Add 2 additional swap cards to the deck
  for (let i = 0; i < 2; i++) {
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
    deck.push({
      suit: randomSuit,
      rank: randomRank,
      value: values[randomRank],
      isDealt: false,
      isSwapCard: true,
      isWildCard: false
    });
  }

  // Convert 1 random regular card to a wild card
  const regularCards = deck.filter(card => !card.isSwapCard && !card.isWildCard);
  if (regularCards.length > 0) {
    const randomIndex = Math.floor(Math.random() * regularCards.length);
    const cardToConvert = regularCards[randomIndex];
    const deckIndex = deck.findIndex(card => 
      card.suit === cardToConvert.suit && 
      card.rank === cardToConvert.rank && 
      !card.isSwapCard && 
      !card.isWildCard
    );
    if (deckIndex !== -1) {
      deck[deckIndex] = {
        ...deck[deckIndex],
        isWildCard: true
      };
    }
  }

  // Add 1 additional wild card to the deck
  const randomSuit = suits[Math.floor(Math.random() * suits.length)];
  const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
  deck.push({
    suit: randomSuit,
    rank: randomRank,
    value: values[randomRank], // This will be overridden when the wild card is used
    isDealt: false,
    isSwapCard: false,
    isWildCard: true
  });
  
  const shuffledDeck = shuffleDeck(deck);
  
  return shuffledDeck;
}

function shuffleDeck(deck: Deck): Deck {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}