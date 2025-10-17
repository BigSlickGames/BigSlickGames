import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

interface XPStarAnimationProps {
  isVisible: boolean;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
  starCount?: number;
}

export function XPStarAnimation({ 
  isVisible, 
  startPosition, 
  endPosition, 
  onComplete, 
  starCount = 3 
}: XPStarAnimationProps) {
  const stars = Array.from({ length: starCount }, (_, i) => ({
    id: i,
    delay: i * 0.1,
    offsetX: (Math.random() - 0.5) * 40,
    offsetY: (Math.random() - 0.5) * 20,
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute"
              initial={{
                x: startPosition.x + star.offsetX,
                y: startPosition.y + star.offsetY,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: endPosition.x + star.offsetX,
                y: endPosition.y + star.offsetY,
                scale: [0, 1.2, 0.8],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.2,
                delay: star.delay,
                ease: "easeOut",
              }}
              onAnimationComplete={() => {
                if (star.id === stars.length - 1) {
                  onComplete();
                }
              }}
            >
              <Star className="w-6 h-6 text-yellow-400 fill-current drop-shadow-lg" />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}