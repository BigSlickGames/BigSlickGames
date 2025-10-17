import React from 'react';
import { GridSpace } from './GridSpace';
import type { GridPosition } from '../types/GameTypes';

interface GameBoardProps {
  gridPositions: (GridPosition | null)[];
  calculateRowTotal: (rowIndex: number) => number;
  calculateColumnTotal: (colIndex: number) => number;
  getTotalSpaceImage: (total: number) => string;
}

export function GameBoard({ 
  gridPositions, 
  calculateRowTotal, 
  calculateColumnTotal, 
  getTotalSpaceImage 
}: GameBoardProps) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/30 p-2 max-w-[380px] mx-auto">
      <div className="grid grid-cols-6 gap-0">
      {gridPositions.map((position, index) => {
        const row = Math.floor(index / 6);
        const col = index % 6;
        const isFirstColumn = col === 0;
        const isTopRow = row === 0;
        
        const total = isFirstColumn && row > 0 
          ? calculateRowTotal(row) 
          : isTopRow && col > 0 
            ? calculateColumnTotal(col) 
            : 0;

        return (
          <GridSpace
            key={index}
            position={position}
            isFirstColumn={isFirstColumn}
            isTopRow={isTopRow}
            total={total}
            getTotalSpaceImage={getTotalSpaceImage}
          />
        );
      })}
      </div>
    </div>
  );
}