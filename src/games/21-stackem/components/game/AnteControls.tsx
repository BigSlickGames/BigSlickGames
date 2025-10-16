import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface AnteControlsProps {
  chipAmount: number;
  anteLockedAt: number | null;
  onChipAmountChange: (amount: number) => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  playButtonClick?: () => void;
}

export const AnteControls: React.FC<AnteControlsProps> = ({
  chipAmount,
  anteLockedAt,
  onChipAmountChange,
  triggerHaptic,
  playButtonClick
}) => {
  const handleDecrease = () => {
    const newAmount = Math.max(5, chipAmount - 10);
    onChipAmountChange(newAmount);
    playButtonClick?.();
  };

  const handleIncrease = () => {
    const newAmount = Math.min(100, chipAmount + 10);
    onChipAmountChange(newAmount);
    playButtonClick?.();
  };

  return (
    <div className="p-1 flex-shrink-0 w-full max-w-xs">
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={handleDecrease}
          disabled={anteLockedAt !== null}
          onTouchStart={(e) => {
            if (anteLockedAt === null) {
              e.stopPropagation();
              triggerHaptic('light');
              handleDecrease();
            }
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
          className="w-6 h-6 bg-gray-800 border-2 border-gray-600 text-white rounded-full flex items-center justify-center font-bold hover:bg-gray-700 hover:border-gray-500 transition-all shadow-lg active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:border-gray-700"
        >
          <Minus className="w-2 h-2" />
        </button>
        
        <div className="text-center">
          <p className="text-xs font-medium text-gray-400 mb-0">Ante</p>
          <div className={`bg-gray-800 border rounded px-1 py-0 mx-auto w-fit ${
            anteLockedAt ? 'border-red-400' : 'border-gray-600'
          }`}>
            <span className={`text-sm font-bold ${
              anteLockedAt ? 'text-red-400' : 'text-orange-400'
            }`}>
              {anteLockedAt || chipAmount}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-tight">per tile</p>
        </div>
        
        <button
          onClick={handleIncrease}
          disabled={anteLockedAt !== null}
          onTouchStart={(e) => {
            if (anteLockedAt === null) {
              e.stopPropagation();
              triggerHaptic('light');
              handleIncrease();
            }
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
          className="w-6 h-6 bg-gray-800 border-2 border-gray-600 text-white rounded-full flex items-center justify-center font-bold hover:bg-gray-700 hover:border-gray-500 transition-all shadow-lg active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-900 disabled:border-gray-700"
        >
          <Plus className="w-2 h-2" />
        </button>
      </div>
    </div>
  );
};