import React from 'react';

interface Tile {
  id: string;
  value: number;
  isLocked: boolean;
  cardType: 'number' | 'face' | 'ace';
  displayValue: string;
}

interface CombinedDeckModuleProps {
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

export const CombinedDeckModule: React.FC<CombinedDeckModuleProps> = ({
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
    <div className="p-1 flex-shrink-0 w-full max-w-xs">
      <div className="flex items-center justify-center gap-1 min-h-12">
        {/* Deck Tile */}
        <div 
          className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center font-bold shadow-lg transition-all flex-shrink-0 ${
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
            <span className="text-xs font-bold block leading-tight">
              {remainingCards}
            </span>
            <span className="text-xs text-gray-600 block leading-tight">
              {currentCycle}/{maxCycles}
            </span>
          </div>
        </div>
        
        {/* Dealt Cards */}
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
              opacity: visibleTiles.includes(index) ? 1 : 0,
              transform: visibleTiles.includes(index) ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
              transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              cursor: tile.isLocked ? 'not-allowed' : 'grab'
            }}
            className={`
              w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold
              ${tile.isLocked 
                ? 'border-gray-500 bg-gray-200 text-gray-400 cursor-not-allowed' 
                : selectedTile?.id === tile.id
                  ? 'border-yellow-500 bg-yellow-200 text-black cursor-pointer shadow-lg shadow-yellow-400/50'
                  : tile.cardType === 'ace'
                    ? 'border-purple-500 bg-purple-50 text-purple-800 cursor-grab shadow-lg hover:shadow-xl hover:z-50 active:scale-95 active:cursor-grabbing touch-manipulation'
                    : tile.cardType === 'face'
                      ? 'border-green-500 bg-green-50 text-green-800 cursor-grab shadow-lg hover:shadow-xl hover:z-50 active:scale-95 active:cursor-grabbing touch-manipulation'
                      : 'border-blue-500 bg-blue-50 text-blue-800 cursor-grab shadow-lg hover:shadow-xl hover:z-50 active:scale-95 active:cursor-grabbing touch-manipulation'
              }
              ${!tile.isLocked ? 'hover:scale-105' : ''}
            `}
          >
            <div className="text-center">
              <span className="text-xs font-bold block leading-tight">
                {tile.displayValue}
              </span>
              {tile.cardType === 'ace' && (
                <span className="text-xs text-purple-600 block leading-tight">
                  {tile.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};