import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../types/Card';
import { FingerTapAnimation } from './FingerTapAnimation';

interface DeckAreaProps {
  remainingCards: number;
  deckCycles: number;
  dealtCards: Card[];
  onDeckTap: () => void;
  handleDragEnd: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number, y: number } },
    card: Card,
    index: number
  ) => void;
  soundEnabled: boolean;
  showTutorial: boolean;
}

export function DeckArea({
  remainingCards,
  deckCycles,
  dealtCards,
  onDeckTap,
  handleDragEnd,
  soundEnabled,
  showTutorial,
}: DeckAreaProps) {
  const pickupSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    pickupSoundRef.current = new Audio('/audio/pickup.mp4');
  }, []);

  const playPickupSound = () => {
    if (soundEnabled && pickupSoundRef.current) {
      pickupSoundRef.current.currentTime = 0;
      pickupSoundRef.current.play().catch(error => console.log('Audio playback failed:', error));
    }
    // Vibrate on pickup
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDeckClick = () => {
    onDeckTap();
  };
  return (
    <div className="flex flex-col items-center gap-3 relative">
      <div className="flex justify-center gap-4 relative">
      <div className="relative w-[55px] h-[55px] cursor-pointer" onClick={handleDeckClick}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-black z-10">
          {remainingCards}
        </div>
        <div className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10">
          {deckCycles}/3
        </div>
        <img 
          src="/images/21-stackem-card-tile.png" 
          alt="Deck" 
          className="w-full h-full object-contain hover:scale-105 transition-transform"
        />
      </div>

      <div className="relative w-[125px]">
        <AnimatePresence>
          {dealtCards.map((card, index) => {
            const isPlayable = index === dealtCards.length - 1;

            return (
              <motion.div
                key={`${card.suit}-${card.rank}`}
                className={`absolute w-[55px] h-[55px] ${isPlayable ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'} touch-none`}
                initial={{ x: -85, y: 0, opacity: 0, scale: 0.8, zIndex: index }}
                animate={{ 
                  x: index * 35,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  transition: { 
                    duration: 0.3,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                drag={isPlayable}
                dragConstraints={{
                  top: -400,
                  left: -200,
                  right: 250,
                  bottom: 50
                }}
                dragElastic={0.05}
                dragMomentum={false}
                whileDrag={{ scale: 1.05, zIndex: 30 }}
                onDragStart={() => {
                  if (isPlayable) {
                    playPickupSound();
                  }
                }}
                onDragEnd={(e, info) => {
                  if (isPlayable) {
                    handleDragEnd(e, info, card, index);
                  }
                }}
                style={{
                  filter: isPlayable ? 'none' : 'brightness(0.7)',
                  touchAction: 'none',
                }}
              >
                <div className="relative w-full h-full">
                  <img 
                    src="/images/21-stackem-card-tile.png" 
                    alt={`${card.rank} of ${card.suit}`}
                    className={`w-full h-full object-contain pointer-events-none ${
                      card.isSwapCard ? 'filter drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' : 
                      card.isWildCard ? 'filter drop-shadow-[0_0_8px_rgba(147,51,234,0.8)]' : ''
                    }`}
                  />
                  {card.isSwapCard && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-300 pointer-events-none">
                      <div className="absolute inset-0.5 bg-yellow-300 rounded-full"></div>
                    </div>
                  )}
                  {card.isWildCard && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-purple-400 rounded-full border border-purple-300 pointer-events-none">
                      <div className="absolute inset-0.5 bg-purple-300 rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold pointer-events-none">
                  {card.isWildCard ? '?' : card.rank}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}