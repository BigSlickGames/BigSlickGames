import React from 'react';
import { Trophy } from 'lucide-react';

interface GridCell {
  row: number;
  col: number;
  value: number | null;
  isTotal: boolean;
}

interface GameGridProps {
  gameGrid: GridCell[][];
  onCellClick: (row: number, col: number) => void;
  onDrop: (row: number, col: number) => void;
  shakeAnimations: {[key: string]: boolean};
  bustAnimations: {[key: string]: number};
  twentyOneAnimations: {[key: string]: number};
}

export const GameGrid: React.FC<GameGridProps> = ({
  gameGrid,
  onCellClick,
  onDrop,
  shakeAnimations,
  bustAnimations,
  twentyOneAnimations
}) => {
  return (
    <div className="flex items-center justify-center p-1">
      <div className="grid grid-cols-6 gap-1 w-full h-full aspect-square">
        {gameGrid.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                flex items-center justify-center font-bold rounded border-2 transition-all duration-200 relative aspect-square
                text-sm md:text-base lg:text-lg xl:text-xl
                ${cell.isTotal 
                  ? cell.value && cell.value > 21
                    ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 text-white shadow-lg shadow-orange-500/30 backdrop-blur-sm opacity-70'
                  : cell.value
                    ? 'bg-white/30 border-gray-300/30 text-blue-800 shadow-lg'
                    : 'bg-gray-700/25 border-gray-500/25 text-gray-400 hover:border-orange-500/35 hover:bg-gray-600/25 cursor-pointer hover:shadow-orange-500/15 hover:scale-105 active:scale-95 touch-manipulation'
                }
                ${shakeAnimations[`row-${rowIndex}`] || shakeAnimations[`col-${colIndex}`] ? 'animate-shake' : ''}
              `}
              style={{
                backgroundImage: !cell.isTotal 
                  ? cell.value 
                    ? 'url(/images/GameTile.png)'
                    : 'none'
                  : 'none',
                background: cell.isTotal && !(cell.value && cell.value > 21)
                  ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Touch handlers */}
              <div
                onTouchStart={(e) => {
                  if (!cell.isTotal && !cell.value) {
                    e.stopPropagation();
                    onCellClick(rowIndex, colIndex);
                  }
                }}
                onTouchMove={(e) => {
                  if (!cell.isTotal && !cell.value) {
                    e.stopPropagation();
                  }
                }}
                onTouchEnd={(e) => {
                  if (!cell.isTotal && !cell.value) {
                    e.stopPropagation();
                  }
                }}
                onClick={() => {
                  if (!cell.isTotal && !cell.value) {
                    onCellClick(rowIndex, colIndex);
                  }
                }}
                onDragOver={(e) => {
                  if (!cell.isTotal && !cell.value) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!cell.isTotal && !cell.value) {
                    onDrop(rowIndex, colIndex);
                  }
                }}
                onDragEnter={(e) => {
                  if (!cell.isTotal && !cell.value) {
                    e.preventDefault();
                  }
                }}
                className="absolute inset-0"
              />
              
              {/* Bust Animation */}
              {cell.isTotal && cell.value !== null && cell.value > 21 && (
                <BustSpriteAnimation 
                  startTime={bustAnimations[`${rowIndex === 0 ? 'col' : 'row'}-${rowIndex === 0 ? colIndex : rowIndex}`] || 0}
                />
              )}
              
              {/* Cell Content */}
              {rowIndex === 0 && colIndex === 0 ? (
                <Trophy className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
              ) : (
                <span className="relative z-10 drop-shadow-lg font-bold text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                  {cell.value || ''}
                </span>
              )}
              
              {/* 21 Animation */}
              {cell.isTotal && cell.value === 21 && (
                <TwentyOneAnimation 
                  startTime={twentyOneAnimations[`${rowIndex === 0 ? 'col' : 'row'}-${rowIndex === 0 ? colIndex : rowIndex}`] || 0}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Bust animation component
const BustSpriteAnimation: React.FC<{ startTime: number }> = ({ startTime }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (!startTime) return;
    
    setIsVisible(true);
    
    const cleanup = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    
    return () => {
      clearTimeout(cleanup);
    };
  }, [startTime]);
  
  if (!isVisible) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
      <span 
        className="font-bold px-1 py-0.5 rounded animate-pulse"
        style={{
          fontSize: '8px',
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#cc0000',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(200, 0, 0, 0.8)'
        }}
      >
        BUST!
      </span>
    </div>
  );
};

// 21 animation component
const TwentyOneAnimation: React.FC<{ startTime: number }> = ({ startTime }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    if (!startTime) return;
    
    setIsVisible(true);
    
    const cleanup = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    
    return () => {
      clearTimeout(cleanup);
    };
  }, [startTime]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center animate-pulse"
      style={{
        background: 'rgba(34, 197, 94, 0.8)',
        borderRadius: '8px'
      }}
    >
      <span 
        className="font-bold text-white drop-shadow-lg"
        style={{
          fontSize: '10px',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
        }}
      >
        21!
      </span>
    </div>
  );
};