import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Info, DollarSign, ExternalLink, Menu, X, Square, User } from 'lucide-react';

interface HamburgerMenuProps {
  onSettings: () => void;
  onInformation: () => void;
  onBSGClick: () => void;
  onEndGame: () => void;
  onProfile: () => void;
}

export function HamburgerMenu({ onSettings, onInformation, onBSGClick, onEndGame, onProfile }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleMenuClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className="bg-white/30 backdrop-blur-md rounded-lg p-3 border border-white/40 transition-all hover:bg-white/40"
      >
        <div className="flex flex-col gap-1">
          <div className="w-5 h-0.5 bg-white rounded-full"></div>
          <div className="w-5 h-0.5 bg-white rounded-full"></div>
          <div className="w-5 h-0.5 bg-white rounded-full"></div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-20 right-6 bg-black/60 backdrop-blur-xl rounded-xl border border-white/40 shadow-2xl z-50 min-w-[160px]"
            >
              <div className="p-2">
                <button 
                  onClick={() => handleMenuClick(onBSGClick)}
                  className="w-full flex items-center gap-3 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <img 
                    src="/images/BSG.png"
                    alt="Big Slick Games"
                    className="w-5 h-5"
                  />
                  <span className="text-sm">BSG</span>
                </button>
                
                <button 
                  onClick={() => handleMenuClick(onProfile)}
                  className="w-full flex items-center gap-3 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">Profile</span>
                </button>
                
                <button 
                  onClick={() => handleMenuClick(onInformation)}
                  className="w-full flex items-center gap-3 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Info className="w-5 h-5" />
                  <span className="text-sm">Info</span>
                </button>
                
                <button 
                  onClick={() => handleMenuClick(onEndGame)}
                  className="w-full flex items-center gap-3 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Square className="w-5 h-5" />
                  <span className="text-sm">End Game</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}