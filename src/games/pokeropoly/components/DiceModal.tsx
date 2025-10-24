import { useEffect, useState } from 'react';

interface DiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dice1: number;
  dice2: number;
  onRollComplete?: () => void;
  isMinimized?: boolean;
  isMoving?: boolean;
}

export function DiceModal({ isOpen, onClose, dice1, dice2, onRollComplete, isMinimized = false, isMoving = false }: DiceModalProps) {
  const handleClose = () => {
    if (!isMoving) {
      onClose();
    }
  };
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice1, setDisplayDice1] = useState(1);
  const [displayDice2, setDisplayDice2] = useState(1);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setIsRolling(true);
      setDisplayDice1(1);
      setDisplayDice2(1);

      let counter = 0;
      const interval = setInterval(() => {
        setDisplayDice1(Math.floor(Math.random() * 6) + 1);
        setDisplayDice2(Math.floor(Math.random() * 6) + 1);
        counter++;
        if (counter > 20) {
          clearInterval(interval);
        }
      }, 100);

      const timer = setTimeout(() => {
        setIsRolling(false);
        setDisplayDice1(dice1);
        setDisplayDice2(dice2);

        setTimeout(() => {
          if (onRollComplete) {
            onRollComplete();
          }
        }, 500);
      }, 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isOpen, dice1, dice2, isMinimized]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-500 ${
        isMinimized
          ? 'top-4 left-4 w-auto h-auto'
          : 'inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm'
      }`}
      onClick={!isMinimized ? handleClose : undefined}
    >
      <div
        className={`bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl shadow-2xl border-4 border-yellow-600/50 relative transition-all duration-500 ${
          isMinimized ? 'p-3 scale-30' : 'p-12'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={isMinimized ? { transform: 'scale(0.3)', transformOrigin: 'top left' } : {}}
      >
        {!isMinimized && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl font-bold w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all"
          >
            ×
          </button>
        )}

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {isRolling ? 'Rolling...' : isMinimized && isMoving ? 'Moving...' : 'Dice Roll Result'}
          </h2>
          {!isRolling && (
            <p className="text-2xl text-yellow-400 font-bold drop-shadow">
              Total: {Number(displayDice1) + Number(displayDice2)}
            </p>
          )}
        </div>

        <div className="flex gap-12 items-center justify-center">
          <div className="relative bg-white rounded-2xl shadow-2xl border-4 border-gray-200 w-40 h-40 flex items-center justify-center overflow-hidden">
            <div
              className={`text-9xl font-bold text-gray-800 ${
                isRolling ? 'slot-roll' : 'slot-land'
              }`}
            >
              {displayDice1}
            </div>
          </div>

          <div className="relative bg-white rounded-2xl shadow-2xl border-4 border-gray-200 w-40 h-40 flex items-center justify-center overflow-hidden">
            <div
              className={`text-9xl font-bold text-gray-800 ${
                isRolling ? 'slot-roll' : 'slot-land'
              }`}
              style={{ animationDelay: '0.05s' }}
            >
              {displayDice2}
            </div>
          </div>
        </div>

        {!isRolling && !isMinimized && (
          <div className="mt-8 text-center">
            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition-all hover:scale-105 border-2 border-yellow-400"
            >
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slotRoll {
          0% {
            transform: translateY(0%) scale(1);
            filter: blur(0px);
          }
          50% {
            transform: translateY(-10%) scale(1.15);
            filter: blur(2px);
          }
          100% {
            transform: translateY(0%) scale(1);
            filter: blur(0px);
          }
        }

        @keyframes slotLand {
          0% {
            transform: scale(1.3);
            filter: blur(4px);
          }
          50% {
            transform: scale(0.9);
            filter: blur(0px);
          }
          100% {
            transform: scale(1);
            filter: blur(0px);
          }
        }

        .slot-roll {
          animation: slotRoll 0.1s ease-in-out infinite;
        }

        .slot-land {
          animation: slotLand 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
