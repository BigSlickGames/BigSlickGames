import React from 'react';

interface Tile {
  id: string;
  value: number;
  isLocked: boolean;
}

interface TileDeckProps {
  currentTiles: Tile[];
  remainingCards: number;
  currentCycle: number;
  maxCycles: number;
  selectedTile: Tile | null;
  visibleTiles: number[];
  onDealTiles: () => void;
  onTileClick: (tile: Tile) => void;
  onDragStart: (tile: Tile) => void;
  onDragEnd: () => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
}

export const TileDeck: React.FC<TileDeckProps> = ({
  currentTiles,
  remainingCards,
  currentCycle,
  maxCycles,
  selectedTile,
  visibleTiles,
  onDealTiles,
  onTileClick,
  onDragStart,
  onDragEnd,
  triggerHaptic
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl shadow-black/20 p-1 flex-shrink-0">
      <div className="flex items-center justify-center h-16 md:h-18 lg:h-20" style={{ transform: 'translateY(-10px)' }}>
        <div className="flex items-center relative touch-none w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-14 md:h-16 lg:h-18" style={{ transform: 'translateX(50px)' }}>
          {/* Deck Tile */}
          <div 
            className={`w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 border-2 rounded-lg flex items-center justify-center font-bold shadow-lg transition-all absolute left-0 top-1/2 transform -translate-y-1/2 ${
              currentCycle > maxCycles || remainingCards < 3
                ? 'border-red-500 bg-red-100 text-red-800 cursor-not-allowed opacity-50'
                : 'border-blue-500 bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100 hover:scale-105 active:scale-95 touch-manipulation'
            }`}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (currentCycle <= maxCycles && remainingCards >= 3) {
                triggerHaptic('medium');
                onDealTiles();
              }
            }}
            onTouchMove={(e) => {
              e.preventDefault();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
            }}
            onClick={() => {
              if (currentCycle <= maxCycles && remainingCards >= 3) {
                onDealTiles();
              }
            }}
          >
            <div className="text-center">
              <span className="text-sm font-bold block">
                {remainingCards}
              </span>
              <span className="text-xs text-gray-600 block">
                {currentCycle}/{maxCycles}
              </span>
            </div>
          </div>
          
          {/* Dealt Cards */}
          <div className="absolute left-16 md:left-18 lg:left-20 top-1/2 transform -translate-y-1/2 touch-none">
            {currentTiles.map((tile, index) => (
              <div
                key={tile.id}
                draggable={!tile.isLocked}
                onDragStart={(e) => {
                  if (!tile.isLocked) {
                    onDragStart(tile);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', tile.id);
                  } else {
                    e.preventDefault();
                  }
                }}
                onDragEnd={() => {
                  onDragEnd();
                }}
                onTouchStart={(e) => {
                  if (!tile.isLocked) {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerHaptic('light');
                    onTileClick(tile);
                  }
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  if (!tile.isLocked) {
                    onTileClick(tile);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${index * (window.innerWidth >= 768 ? 16 : 14)}px`,
                  top: '-5px',
                  backgroundColor: tile.isLocked ? '#D1D5DB' : '#F5F5DC',
                  zIndex: 10 + (2 - index),
                  opacity: visibleTiles.includes(index) ? 1 : 0,
                  transform: visibleTiles.includes(index) ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
                  transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  cursor: tile.isLocked ? 'not-allowed' : 'grab'
                }}
                className={`
                  w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-lg border-2 flex items-center justify-center font-bold
                  ${tile.isLocked 
                    ? 'border-gray-500 text-gray-400 cursor-not-allowed' 
                    : selectedTile?.id === tile.id
                      ? 'border-yellow-500 bg-yellow-200 text-black cursor-pointer shadow-lg shadow-yellow-400/50 scale-110'
                      : 'border-blue-500 text-blue-800 cursor-grab shadow-lg hover:shadow-xl hover:z-50 active:scale-95 active:cursor-grabbing touch-manipulation'
                  }
                  ${!tile.isLocked ? 'hover:scale-105' : ''}
                `}
              >
                <span className="text-base md:text-lg lg:text-lg font-bold">
                  {tile.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};