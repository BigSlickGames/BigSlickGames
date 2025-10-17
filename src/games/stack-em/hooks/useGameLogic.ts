import { useState, useEffect, useRef } from 'react';
import { createDeck } from '../utils/createDeck';
import type { Card } from '../types/Card';
import type { GridPosition, GameState, Difficulty, AnteAmount } from '../types/GameTypes';
import { calculateRowTotal, calculateColumnTotal } from '../utils/calculations';

export function useGameLogic(initialDifficulty: Difficulty = 'medium') {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    dealtCards: [],
    deckCycles: 0,
    isDealing: false,
    gridPositions: Array(36).fill(null),
    showSettings: false,
    score: 0,
    difficulty: initialDifficulty,
    showAnimation: false,
    animationType: '2-card',
    chips: 5000, // Default chips for guest play
    sessionWinnings: 0,
    ante: 10,
    betsLocked: false,
    pendingAce: null,
    pendingWild: null,
    experience: 0, // Default experience for guest play
    level: 1, // Default level for guest play
    showXPAnimation: false,
    xpAnimationAmount: 0
  });

  // Create Audio objects once using useRef to avoid recreation on every render
  const dropSoundRef = useRef<HTMLAudioElement | null>(null);
  const dealSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    dropSoundRef.current = new Audio('/audio/dropdown.mp4');
    dealSoundRef.current = new Audio('/audio/dealsound.mp4');
    if (dealSoundRef.current) {
      dealSoundRef.current.playbackRate = 0.9;
    }
  }, []);

  const initializeBoard = (difficulty: Difficulty, deck: Card[]) => {
    const numInitialCards = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 3 : 6;
    const gridPositions = Array(36).fill(null);
    const usedCards: Card[] = [];

    if (numInitialCards > 0) {
      const rowCounts = new Array(6).fill(0);
      const colCounts = new Array(6).fill(0);
      const allPositions = Array.from({ length: 25 }, (_, i) => i + 7)
        .filter(i => i % 6 !== 0);
      const shuffledPositions = [...allPositions].sort(() => Math.random() - 0.5);

      let cardsPlaced = 0;
      let positionIndex = 0;

      while (cardsPlaced < numInitialCards && positionIndex < shuffledPositions.length) {
        const position = shuffledPositions[positionIndex];
        const row = Math.floor(position / 6);
        const col = position % 6;

        if (rowCounts[row] < 2 && colCounts[col] < 2) {
          const card = deck[cardsPlaced];
          usedCards.push(card);
          
          gridPositions[position] = {
            cardId: `${card.suit}-${card.rank}`,
            card: { ...card, isDealt: true }
          };

          rowCounts[row]++;
          colCounts[col]++;
          cardsPlaced++;
        }

        positionIndex++;
      }
    }

    const updatedDeck = deck.map(card => ({
      ...card,
      isDealt: usedCards.some(usedCard => 
        usedCard.suit === card.suit && usedCard.rank === card.rank
      )
    }));

    return { gridPositions, updatedDeck };
  };

  useEffect(() => {
    const deck = createDeck();
    const { gridPositions, updatedDeck } = initializeBoard(initialDifficulty, deck);
    
    setGameState(prev => ({ 
      ...prev, 
      deck: updatedDeck,
      gridPositions,
      difficulty: initialDifficulty
    }));
  }, [initialDifficulty]);

  const calculateLineScore = (total: number, filledPositions: number): number => {
    if (total === 21) {
      const multipliers = {
        2: 1.5,
        3: 2,
        4: 2.5,
        5: 3
      };
      const multiplier = multipliers[filledPositions as keyof typeof multipliers] || 1.5;
      return gameState.ante * filledPositions * multiplier; // Only winnings, no ante deduction here
    }
    return 0; // No penalty for going over 21, ante already deducted
  };

  const check21Combination = (positions: (GridPosition | null)[], index: number): { is21: boolean, cardCount: number } | null => {
    const row = Math.floor(index / 6);
    const col = index % 6;

    // Check row
    if (row > 0) {
      const rowStart = row * 6 + 1;
      const rowEnd = rowStart + 5;
      const rowCards = positions.slice(rowStart, rowEnd).filter(pos => pos !== null);
      const rowTotal = calculateRowTotal(positions, row);
      if (rowTotal === 21 && (rowCards.length === 2 || rowCards.length === 3)) {
        return { is21: true, cardCount: rowCards.length };
      }
    }

    // Check column
    if (col > 0) {
      const colCards = Array.from({ length: 5 }, (_, i) => positions[((i + 1) * 6) + col]).filter(pos => pos !== null);
      const colTotal = calculateColumnTotal(positions, col);
      if (colTotal === 21 && (colCards.length === 2 || colCards.length === 3)) {
        return { is21: true, cardCount: colCards.length };
      }
    }

    return null;
  };

  const calculatePositionScore = (positions: (GridPosition | null)[], index: number): { score: number, combination: { is21: boolean, cardCount: number } | null } => {
    const row = Math.floor(index / 6);
    const col = index % 6;
    let winnings = 0;
    let hasBust = false;

    if (row > 0) {
      const rowStart = row * 6 + 1;
      const rowEnd = rowStart + 5;
      const filledPositions = positions.slice(rowStart, rowEnd).filter(pos => pos !== null).length;
      const rowTotal = calculateRowTotal(positions, row);
      if (rowTotal > 21) {
        hasBust = true;
      }
      winnings += calculateLineScore(rowTotal, filledPositions);
    }

    if (col > 0) {
      const filledPositions = Array.from({ length: 5 }, (_, i) => positions[((i + 1) * 6) + col]).filter(pos => pos !== null).length;
      const colTotal = calculateColumnTotal(positions, col);
      if (colTotal > 21) {
        hasBust = true;
      }
      winnings += calculateLineScore(colTotal, filledPositions);
    }

    const combination = check21Combination(positions, index);

    return { score: hasBust ? 0 : winnings, combination, hasBust };
  };

  const calculateXPGain = (winnings: number): number => {
    // 100 XP per 100 chips won (1:1 ratio)
    return winnings;
  };

  const updateExperience = (xpGain: number) => {
    if (xpGain <= 0) return;

    setGameState(prev => {
      const newXP = prev.experience + xpGain;
      
      // Calculate new level based on cumulative XP requirements
      // Level 1: 0-1000 XP, Level 2: 1000-3000 XP, Level 3: 3000-6000 XP, etc.
      let newLevel = 1;
      let totalXPNeeded = 0;
      
      while (true) {
        const xpForThisLevel = newLevel * 1000;
        if (newXP < totalXPNeeded + xpForThisLevel) {
          break;
        }
        totalXPNeeded += xpForThisLevel;
        newLevel++;
      }
      
      
      return {
        ...prev,
        experience: newXP,
        level: newLevel,
        showXPAnimation: true,
        xpAnimationAmount: xpGain
      };
    });
  };

  const dealCards = () => {
    if (gameState.isDealing) return;

    // Lock bets when first cards are dealt
    if (!gameState.betsLocked) {
      setGameState(prev => ({ ...prev, betsLocked: true }));
    }

    const undealtCards = gameState.deck.filter(card => !card.isDealt);

    if (undealtCards.length < 3) {
      if (gameState.deckCycles >= 2) {
        return;
      }

      const placedCards = gameState.gridPositions
        .filter((pos): pos is GridPosition => pos !== null)
        .map(pos => pos.card);

      const newDeck = createDeck().filter(newCard => 
        !placedCards.some(placedCard => 
          placedCard.suit === newCard.suit && placedCard.rank === newCard.rank
        )
      );

      setGameState(prev => ({
        ...prev,
        deck: newDeck,
        dealtCards: [],
        deckCycles: prev.deckCycles + 1,
        isDealing: false
      }));

      return;
    }

    setGameState(prev => ({ ...prev, isDealing: true }));

    if (dealSoundRef.current) {
      dealSoundRef.current.currentTime = 0;
      dealSoundRef.current.play().catch(error => console.log('Audio playback failed:', error));
    }

    const newDealtCards = undealtCards.slice(0, 3);
    const updatedDeck = gameState.deck.map(card => {
      if (newDealtCards.includes(card)) {
        return { ...card, isDealt: true };
      }
      return card;
    });

    setGameState(prev => ({
      ...prev,
      deck: updatedDeck,
      dealtCards: newDealtCards,
      isDealing: false
    }));
  };

  const handleAceSelection = (value: 1 | 11) => {
    if (!gameState.pendingAce) return;

    const { card, position } = gameState.pendingAce;
    const updatedCard = { ...card, value };
    const cardId = `${card.suit}-${card.rank}`;
    
    const newGridPositions = [...gameState.gridPositions];
    newGridPositions[position] = { cardId, card: updatedCard };
    
    const { score: winnings } = calculatePositionScore(newGridPositions, position);
    
    setGameState(prev => ({
      ...prev,
      gridPositions: newGridPositions,
      dealtCards: prev.dealtCards.filter(c => c !== card),
      chips: prev.chips - prev.ante, // Always deduct ante
      sessionWinnings: prev.sessionWinnings + winnings, // Only add winnings on 21
      pendingAce: null
    }));

    // Award XP for winnings
    if (winnings > 0) {
      const xpGain = calculateXPGain(winnings);
      setTimeout(() => updateExperience(xpGain), 500);
    }
  };

  const handleWildSelection = (value: number) => {
    if (!gameState.pendingWild) return;

    const { card, position } = gameState.pendingWild;
    const updatedCard = { ...card, value };
    const cardId = `${card.suit}-${card.rank}`;
    
    const newGridPositions = [...gameState.gridPositions];
    newGridPositions[position] = { cardId, card: updatedCard };
    
    const { score: winnings } = calculatePositionScore(newGridPositions, position);
    
    // Remove the selected value from the deck
    const updatedDeck = gameState.deck.map(deckCard => {
      if (!deckCard.isDealt && deckCard.value === value && !deckCard.isSwapCard && !deckCard.isWildCard) {
        return { ...deckCard, isDealt: true };
      }
      return deckCard;
    });
    
    setGameState(prev => ({
      ...prev,
      deck: updatedDeck,
      gridPositions: newGridPositions,
      dealtCards: prev.dealtCards.filter(c => c !== card),
      chips: prev.chips - prev.ante,
      sessionWinnings: prev.sessionWinnings + winnings,
      pendingWild: null
    }));

    // Award XP for winnings
    if (winnings > 0) {
      const xpGain = calculateXPGain(winnings);
      setTimeout(() => updateExperience(xpGain), 500);
    }
  };

  const getAvailableWildValues = (): number[] => {
    // Only consider the original 52 cards (not the additional swap/wild cards) for wild card values
    const remainingCards = gameState.deck
      .filter(card => !card.isDealt && !card.isSwapCard && !card.isWildCard);
    const availableValues = [...new Set(remainingCards.map(card => card.value))].sort((a, b) => a - b);
    return availableValues;
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number, y: number } },
    card: Card,
    index: number
  ) => {
    const gridSpaces = document.querySelectorAll('.grid-space');
    
    // Use the drag info point instead of card element position for more accurate detection
    const dragPoint = info.point;

    let closestSpace: { element: Element, distance: number, index: number } | null = null;

    gridSpaces.forEach((space, spaceIndex) => {
      const spaceRect = space.getBoundingClientRect();
      const spaceCenter = {
        x: spaceRect.left + spaceRect.width / 2,
        y: spaceRect.top + spaceRect.height / 2
      };

      const distance = Math.sqrt(
        Math.pow(dragPoint.x - spaceCenter.x, 2) + 
        Math.pow(dragPoint.y - spaceCenter.y, 2)
      );

      if (!closestSpace || distance < closestSpace.distance) {
        closestSpace = { element: space, distance, index: spaceIndex };
      }
    });

    // Increase the detection radius for better placement detection
    if (closestSpace && closestSpace.distance < 80) {
      const newGridPositions = [...gameState.gridPositions];
      const cardId = `${card.suit}-${card.rank}`;

      // Handle swap cards differently
      if (card.isSwapCard) {
        // Swap cards can only be placed on occupied spaces
        if (newGridPositions[closestSpace.index]) {
          // Check if player has enough chips for the ante
          if (gameState.chips < gameState.ante) {
            return; // Not enough chips
          }

          if (dropSoundRef.current) {
            dropSoundRef.current.currentTime = 0;
            dropSoundRef.current.play().catch(error => console.log('Audio playback failed:', error));
          }

          // Vibrate on successful swap
          if (navigator.vibrate) {
            navigator.vibrate(150); // Longer vibration for swap
          }

          // Get the existing card from the grid
          const existingCard = newGridPositions[closestSpace.index]!.card;
          
          // Place the swap card on the grid
          newGridPositions[closestSpace.index] = { cardId, card };
          
          // Calculate score for the new position
          const { score: winnings, hasBust } = calculatePositionScore(newGridPositions, closestSpace.index);
          
          // Remove swap card from dealt cards and add the existing card back
          const newDealtCards = [...gameState.dealtCards];
          newDealtCards.splice(index, 1); // Remove swap card
          newDealtCards.unshift(existingCard); // Add existing card to beginning
          
          setGameState(prev => ({
            ...prev,
            gridPositions: newGridPositions,
            dealtCards: newDealtCards,
            chips: prev.chips - prev.ante, // Always deduct ante
            sessionWinnings: hasBust ? 0 : prev.sessionWinnings + winnings, // Reset all winnings on bust
          }));

        }
        // If dropped on empty space, swap card returns to hand (no action needed)
      } else if (!newGridPositions[closestSpace.index]) {
        // Regular card logic - can only be placed on empty spaces
        // Check if player has enough chips for the ante
        if (gameState.chips < gameState.ante) {
          return; // Not enough chips
        }

        if (dropSoundRef.current) {
          dropSoundRef.current.currentTime = 0;
          dropSoundRef.current.play().catch(error => console.log('Audio playback failed:', error));
        }

        // Vibrate on successful drop
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }

        // Handle Ace selection
        if (card.rank === 'A') {
          setGameState(prev => ({
            ...prev,
            pendingAce: {
              card,
              position: closestSpace.index
            }
          }));
          return;
        }

        // Handle Wild card selection
        if (card.isWildCard) {
          const availableValues = getAvailableWildValues();
          if (availableValues.length === 0) {
            return; // No values available
          }
          setGameState(prev => ({
            ...prev,
            pendingWild: {
              card,
              position: closestSpace.index,
              availableValues
            }
          }));
          return;
        }

        newGridPositions[closestSpace.index] = { cardId, card };
        const { score: winnings, combination, hasBust } = calculatePositionScore(newGridPositions, closestSpace.index);
        // Vibrate longer for 21
        // Remove card from dealt cards and update game state
        const newDealtCards = gameState.dealtCards.filter(c => c !== card);
        
        setGameState(prev => ({
          ...prev,
          gridPositions: newGridPositions,
          dealtCards: newDealtCards,
          chips: prev.chips - prev.ante,
          sessionWinnings: hasBust ? 0 : prev.sessionWinnings + winnings, // Add winnings or reset on bust
        }));
        
        if (combination?.is21 && navigator.vibrate) {
          navigator.vibrate([100, 50, 200]);
        }
      }
      // If regular card dropped on occupied space, it returns to hand (no action needed)
    } else {
      // Debug: Log when no valid drop target is found
      console.log('No valid drop target found. Closest distance:', closestSpace?.distance);
    }
  };

  const setAnte = (ante: AnteAmount) => {
    if (!gameState.betsLocked) {
      setGameState(prev => ({ ...prev, ante }));
    }
  };

  const resetGame = (difficulty: Difficulty) => {
    const deck = createDeck();
    const { gridPositions, updatedDeck } = initializeBoard(difficulty, deck);
    
    setGameState(prev => ({
      ...prev,
      deck: updatedDeck,
      gridPositions,
      difficulty,
      deckCycles: 0,
      dealtCards: [],
      sessionWinnings: 0,
      ante: 10,
      betsLocked: false,
      pendingAce: null,
      pendingWild: null,
      showAnimation: false,
      showXPAnimation: false,
      xpAnimationAmount: 0
    }));
  };

  const endGameSession = () => {
    // Clean up any ongoing animations or timers
    setGameState(prev => ({
      ...prev,
      showAnimation: false,
      showXPAnimation: false,
      pendingAce: null,
      pendingWild: null,
      isDealing: false
    }));
  };

  const collectWinnings = () => {
    if (gameState.sessionWinnings > 0) {
      const totalWinnings = gameState.sessionWinnings;
      const newChipTotal = gameState.chips + totalWinnings;

      // Update chips in app state
      setGameState(prev => ({
        ...prev,
        chips: newChipTotal
      }));
    }
  };

  return {
    gameState,
    setGameState,
    dealCards,
    handleDragEnd,
    handleAceSelection,
    handleWildSelection,
    setAnte,
    resetGame,
    initializeBoard,
    collectWinnings,
    freezeGame: () => setGameState(prev => ({ ...prev, betsLocked: true, deckCycles: 3 })),
    endGameSession
  };
}