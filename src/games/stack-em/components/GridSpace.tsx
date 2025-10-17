import React from 'react';
import type { GridPosition } from '../types/GameTypes';

interface GridSpaceProps {
  position: GridPosition | null;
  isFirstColumn: boolean;
  isTopRow: boolean;
  total: number;
  getTotalSpaceImage: (total: number) => string;
  isDragTarget?: boolean;
}

export function GridSpace({ 
  position, 
  isFirstColumn, 
  isTopRow, 
  total,
  getTotalSpaceImage,
  isDragTarget = false
}: GridSpaceProps) {
  const imageSrc = isFirstColumn || isTopRow
    ? getTotalSpaceImage(total)
    : "/images/21-stackem-empty-space.png";

  const getTextColor = (total: number) => {
    if (total === 21) return 'text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]';
    if (total > 21) return 'text-red-400 drop-shadow-[0_0_3px_rgba(248,113,113,0.5)]';
    return 'text-black drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]';
  };

  return (
    <div className={`grid-space relative w-[60px] h-[60px] ${
      isDragTarget && position ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''
    }`}>
      <img 
        src={imageSrc}
        alt={isFirstColumn ? "Total space" : "Empty space"}
        className="w-full h-full object-contain"
      />
      {position && !isFirstColumn && !isTopRow && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <img 
              src="/images/21-stackem-card-tile.png"
              alt={`${position.card.rank} of ${position.card.suit}`}
              className={`w-[55px] h-[55px] object-contain ${
                position.card.isSwapCard ? 'filter drop-shadow-[0_0_6px_rgba(255,215,0,0.6)]' : 
                position.card.isWildCard ? 'filter drop-shadow-[0_0_6px_rgba(147,51,234,0.6)]' : ''
              }`}
            />
            {position.card.isSwapCard && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full border border-yellow-300">
                <div className="absolute inset-0.5 bg-yellow-300 rounded-full"></div>
              </div>
            )}
            {position.card.isWildCard && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full border border-purple-300">
                <div className="absolute inset-0.5 bg-purple-300 rounded-full"></div>
              </div>
            )}
          </div>
          <span className="absolute text-xl font-bold">
            {position.card.isWildCard ? position.card.value : position.card.rank}
          </span>
        </div>
      )}
      {(isFirstColumn || isTopRow) && total > 0 && (
        <div className="absolute inset-0 flex items-center justify-center -translate-x-[1px] -translate-y-[1px]">
          <span className={`text-2xl font-bold ${getTextColor(total)} transition-colors duration-300`}>
            {total}
          </span>
        </div>
      )}
    </div>
  );
}