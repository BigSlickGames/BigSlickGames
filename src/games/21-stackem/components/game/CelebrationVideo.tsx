import React, { useEffect, useState } from 'react';

interface CelebrationGifProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const CelebrationGif: React.FC<CelebrationGifProps> = ({
  isVisible,
  onComplete
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      
      // Auto-hide after 2 seconds
      const timeout = setTimeout(() => {
        handleComplete();
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isVisible]);

  const handleComplete = () => {
    setShowAnimation(false);
    onComplete();
  };

  if (!isVisible || !showAnimation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative">
        {/* Simple 21 celebration */}
        <div className="text-center">
          <div className="text-8xl font-bold text-yellow-400 animate-pulse mb-4 drop-shadow-2xl">
            21!
          </div>
          <div className="text-2xl font-bold text-white animate-bounce">
            🎉 BLACKJACK! 🎉
          </div>
        </div>
        
        {/* Skip button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm hover:bg-black/90 transition-colors pointer-events-auto backdrop-blur-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
};