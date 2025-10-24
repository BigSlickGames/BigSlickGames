import { useState, useEffect } from 'react';
import { JokerModal } from './JokerModal';

interface Card {
  suit: string;
  value: string;
  numericValue: number;
  isJoker?: boolean;
}

interface ShoeProps {
  onCardsSelected: (total: number, hasPair: boolean) => void;
  isVisible: boolean;
  isMoving: boolean;
  onDeckUpdate?: (cardsRemaining: number) => void;
  onCardsDrawn?: (cards: Card[]) => void;
}

const createDicePool = (): Card[] => {
  const cards: Card[] = [];

  for (let i = 1; i <= 6; i++) {
    cards.push({
      suit: '🎲',
      value: i.toString(),
      numericValue: i,
      isJoker: false
    });
  }

  cards.push({ suit: '🃏', value: 'Choose', numericValue: 0, isJoker: true });
  cards.push({ suit: '🃏', value: 'Choose', numericValue: 0, isJoker: true });

  return cards;
};

const shufflePool = (pool: Card[]): Card[] => {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function Shoe({ onCardsSelected, isVisible, isMoving, onDeckUpdate, onCardsDrawn }: ShoeProps) {
  const [shoe, setShoe] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [showingCards, setShowingCards] = useState(false);
  const [isAnimatingToCorner, setIsAnimatingToCorner] = useState(false);
  const [jokerSelections, setJokerSelections] = useState<number[]>([]);
  const [currentJokerIndex, setCurrentJokerIndex] = useState<number>(-1);

  useEffect(() => {
    const newPool = shufflePool(createDicePool());
    setShoe(newPool);
    onDeckUpdate?.(newPool.length);
  }, []);

  useEffect(() => {
    onDeckUpdate?.(shoe.length);
  }, [shoe.length, onDeckUpdate]);

  const handleSelectTopTwo = () => {
    if (shoe.length < 2) {
      const newPool = shufflePool(createDicePool());
      setShoe(newPool);
      return;
    }

    const card1 = shoe[0];
    const card2 = shoe[1];

    setShoe(prev => prev.slice(2));

    if (onCardsDrawn) {
      onCardsDrawn([card1, card2]);
    }
  };

  const handleJokerSelection = (value: number) => {
    const newSelections = [...jokerSelections, value];
    setJokerSelections(newSelections);

    const updatedCards = [...selectedCards];
    updatedCards[currentJokerIndex] = {
      ...updatedCards[currentJokerIndex],
      numericValue: value,
      value: value === 1 ? 'A' : value.toString()
    };
    setSelectedCards(updatedCards);

    const card1 = currentJokerIndex === 0 ? updatedCards[0] : selectedCards[0];
    const card2 = currentJokerIndex === 1 ? updatedCards[1] : selectedCards[1];

    if (card1.isJoker && currentJokerIndex === 0 && card2.isJoker) {
      setCurrentJokerIndex(1);
    } else if (card2.isJoker && currentJokerIndex !== 1) {
      setCurrentJokerIndex(1);
    } else {
      setCurrentJokerIndex(-1);

      const finalCard1 = updatedCards[0];
      const finalCard2 = updatedCards[1];
      const hasPair = finalCard1.numericValue === finalCard2.numericValue;
      const total = finalCard1.numericValue + finalCard2.numericValue;

      setTimeout(() => {
        setSelectedCards([]);
        setShowingCards(false);
        setIsAnimatingToCorner(false);
        onCardsSelected(total, hasPair);
      }, 2000);
    }
  };



  const getSuitColor = (suit: string) => {
    if (suit === '♥') return '#DC143C';
    if (suit === '♦') return '#90EE90';
    if (suit === '♣') return '#ADD8E6';
    return '#000000';
  };

  useEffect(() => {
    if (isVisible && onCardsDrawn) {
      handleSelectTopTwo();
    }
  }, [isVisible]);

  return null;

  return (
    <>
      {currentJokerIndex >= 0 && (
        <JokerModal onSelectValue={handleJokerSelection} />
      )}

      <div className={`fixed z-50 transition-all duration-700 ease-in-out ${
        selectedCards.length === 0 || !isAnimatingToCorner
          ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100'
          : 'top-4 left-4 translate-x-0 translate-y-0 scale-50 origin-top-left'
      }`}>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-4 border-yellow-600">
          {selectedCards.length === 0 ? (
            <>
              <div className="text-white text-center mb-4">
                <h3 className="text-xl font-bold mb-2">Dice Pool</h3>
                <p className="text-sm opacity-75">{shoe.length} dice/cards remaining</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-44">
                  {shoe.slice(0, 3).map((_, index) => (
                    <div
                      key={index}
                      className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-lg border-2 border-red-900 shadow-xl"
                      style={{
                        transform: `translateY(${index * -3}px) translateX(${index * -3}px)`,
                        zIndex: 3 - index,
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-20 border-4 border-white/20 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSelectTopTwo}
                  disabled={isMoving || selectedCards.length > 0}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Roll Dice
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-6 items-center justify-center">
              {selectedCards.map((card, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-2xl p-4 w-24 h-32 flex flex-col items-center justify-center gap-2 ${
                    card.isJoker ? 'bg-gradient-to-br from-purple-300 to-purple-500' : ''
                  }`}
                >
                  <div
                    className="text-4xl font-bold"
                    style={{ color: card.isJoker ? '#ffffff' : getSuitColor(card.suit) }}
                  >
                    {card.value}
                  </div>
                  <div
                    className="text-5xl"
                    style={{ color: card.isJoker ? '#ffffff' : getSuitColor(card.suit) }}
                  >
                    {card.suit}
                  </div>
                </div>
              ))}
              {!selectedCards.some(c => c.isJoker) && (
                <div className="text-white text-4xl font-bold">
                  = {selectedCards[0].numericValue + selectedCards[1].numericValue}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
