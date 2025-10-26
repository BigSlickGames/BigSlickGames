import React from 'react';

interface JokerModalProps {
  onSelectValue: (value: number) => void;
}

export function JokerModal({ onSelectValue }: JokerModalProps) {
  const values = [1, 2, 3, 4, 5, 6];
  const displayValues = ['1', '2', '3', '4', '5', '6'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-4 border-purple-400">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-2">Choose Your Number!</h2>
          <p className="text-purple-200 text-lg">
            Select a number from 1 to 6
          </p>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {values.map((value, index) => (
            <button
              key={value}
              onClick={() => onSelectValue(value)}
              className="bg-white hover:bg-purple-100 rounded-xl shadow-xl p-4 transition-all hover:scale-110 border-4 border-purple-300 hover:border-yellow-400"
            >
              <div className="text-3xl font-bold text-purple-600">
                {displayValues[index]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
