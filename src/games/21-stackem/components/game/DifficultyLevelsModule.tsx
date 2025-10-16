import React from 'react';

interface Tile {
  id: string;
  value: number;
  isLocked: boolean;
  cardType: 'number' | 'face' | 'ace';
  displayValue: string;
}

interface GridCell {
  row: number;
  col: number;
  value: number | null;
  isTotal: boolean;
}

interface DifficultyLevelsModuleProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  disabled?: boolean;
  triggerHaptic?: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
}

export const DifficultyLevelsModule: React.FC<DifficultyLevelsModuleProps> = ({
  difficulty,
  onDifficultyChange,
  disabled = false,
  triggerHaptic
}) => {
  const difficulties = [
    {
      id: 'easy' as const,
      label: 'Easy',
      tiles: 0,
      multiplier: '0.5x',
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-500',
      textColor: 'text-green-600'
    },
    {
      id: 'medium' as const,
      label: 'Medium',
      tiles: 3,
      multiplier: '1.25x',
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      id: 'hard' as const,
      label: 'Hard',
      tiles: 6,
      multiplier: '2x',
      color: 'from-red-500 to-red-600',
      borderColor: 'border-red-500',
      textColor: 'text-red-600'
    }
  ];

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    if (!disabled) {
      triggerHaptic?.('light');
      onDifficultyChange(newDifficulty);
      console.log(`🎯 Difficulty changed to: ${newDifficulty.toUpperCase()}`);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl shadow-black/20 p-3 flex-shrink-0">
      <div className="text-center mb-3">
        <h3 className="text-sm font-bold text-white mb-1">Difficulty Level</h3>
        <p className="text-xs text-gray-300">Choose your challenge</p>
      </div>
      
      <div className="flex justify-center space-x-2">
        {difficulties.map((diff) => {
          const isSelected = difficulty === diff.id;
          
          return (
            <button
              key={diff.id}
              onClick={() => handleDifficultyChange(diff.id)}
              disabled={disabled}
              className={`
                flex flex-col items-center px-3 py-2 rounded-lg border-2 transition-all text-center min-w-[70px]
                ${isSelected 
                  ? `bg-gradient-to-br ${diff.color} ${diff.borderColor} text-white shadow-lg transform scale-105`
                  : `bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700/50 hover:border-gray-500`
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer touch-manipulation hover:scale-105'}
              `}
            >
              <span className="text-sm font-bold">{diff.label}</span>
              <span className="text-xs opacity-80">{diff.tiles} tiles</span>
              <span className="text-xs opacity-70">{diff.multiplier}</span>
            </button>
          );
        })}
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-400">
          Current: <span className="text-white font-semibold">{difficulty.toUpperCase()}</span>
        </p>
      </div>
    </div>
  );
};

// Hook for managing difficulty levels and tile placement
export const useDifficultyLevels = () => {
  const [difficulty, setDifficulty] = React.useState<'easy' | 'medium' | 'hard'>('easy');

  // Generate a random card for difficulty tiles
  const generateRandomCard = (): Tile => {
    const cardTypes = [
      // Numbers 2-9 (32 cards)
      ...Array(32).fill(null).map(() => ({ type: 'number', value: Math.floor(Math.random() * 8) + 2 })),
      // Face cards J,Q,K (12 cards) - all worth 10
      ...Array(12).fill(null).map(() => ({ type: 'face', value: 10 })),
      // Aces (4 cards) - worth 1 or 11
      ...Array(4).fill(null).map(() => ({ type: 'ace', value: 11 }))
    ];
    
    const randomCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    
    return {
      id: `difficulty-tile-${Date.now()}-${Math.random()}`,
      value: randomCard.value,
      cardType: randomCard.type as 'number' | 'face' | 'ace',
      displayValue: randomCard.type === 'face' ? (randomCard.value === 10 ? ['J', 'Q', 'K'][Math.floor(Math.random() * 3)] : randomCard.value.toString()) : 
                   randomCard.type === 'ace' ? 'A' : randomCard.value.toString(),
      isLocked: true // Difficulty tiles are locked
    };
  };

  // Place difficulty tiles on the grid
  const placeDifficultyTiles = (gameGrid: GridCell[][], setGameGrid: (grid: GridCell[][]) => void) => {
    // Create a fresh grid
    const newGrid: GridCell[][] = [];
    for (let row = 0; row < 6; row++) {
      const gridRow: GridCell[] = [];
      for (let col = 0; col < 6; col++) {
        gridRow.push({
          row,
          col,
          value: null,
          isTotal: row === 0 || col === 0
        });
      }
      newGrid.push(gridRow);
    }

    // Determine number of tiles to place
    const tilesToPlace = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 3 : 6;
    
    if (tilesToPlace > 0) {
      // Get all available positions (excluding totals row/column)
      const availablePositions: {row: number, col: number}[] = [];
      for (let row = 1; row < 6; row++) {
        for (let col = 1; col < 6; col++) {
          availablePositions.push({ row, col });
        }
      }
      
      // Shuffle available positions using Fisher-Yates algorithm
      for (let i = availablePositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
      }
      
      // Place the determined number of random tiles
      for (let i = 0; i < Math.min(tilesToPlace, availablePositions.length); i++) {
        const position = availablePositions[i];
        const randomCard = generateRandomCard();
        
        // For starting tiles, convert aces to their numeric value (no choice needed)
        let value = randomCard.value;
        if (randomCard.cardType === 'ace') {
          value = Math.random() < 0.5 ? 1 : 11;
        }
        
        // Place the tile on the grid
        newGrid[position.row][position.col].value = value;
      }
      
      console.log(`🎯 Difficulty: ${difficulty.toUpperCase()} - Placed ${tilesToPlace} tiles on grid`);
    } else {
      console.log(`🎯 Difficulty: ${difficulty.toUpperCase()} - Clean grid (0 tiles)`);
    }
    
    // Update the grid
    setGameGrid(newGrid);
  };

  // Get difficulty configuration
  const getDifficultyConfig = () => {
    switch (difficulty) {
      case 'easy':
        return {
          tiles: 0,
          payoutMultiplier: 0.5,
          description: 'Clean grid, lower payouts'
        };
      case 'medium':
        return {
          tiles: 3,
          payoutMultiplier: 1.25,
          description: '3 starting tiles, balanced payouts'
        };
      case 'hard':
        return {
          tiles: 6,
          payoutMultiplier: 2.0,
          description: '6 starting tiles, higher payouts'
        };
      default:
        return {
          tiles: 0,
          payoutMultiplier: 0.5,
          description: 'Default configuration'
        };
    }
  };

  return {
    difficulty,
    setDifficulty,
    placeDifficultyTiles,
    getDifficultyConfig
  };
};