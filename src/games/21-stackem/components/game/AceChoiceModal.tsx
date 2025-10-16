import React from 'react';

interface AceChoiceModalProps {
  isOpen: boolean;
  onChoice: (value: 1 | 11) => void;
  playAceChoice?: () => void;
}

export const AceChoiceModal: React.FC<AceChoiceModalProps> = ({
  isOpen,
  onChoice,
  playAceChoice
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-purple-600">A</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Choose Ace Value
          </h2>
          <p className="text-gray-600">
            What value should this Ace be?
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              playAceChoice?.();
              onChoice(1);
            }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-bold text-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg active:scale-95 touch-manipulation"
          >
            1
          </button>
          
          <button
            onClick={() => {
              playAceChoice?.();
              onChoice(11);
            }}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-lg font-bold text-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg active:scale-95 touch-manipulation"
          >
            11
          </button>
        </div>
      </div>
    </div>
  );
};