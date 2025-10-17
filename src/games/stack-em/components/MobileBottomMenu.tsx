import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Info, User, Square, Menu, X } from 'lucide-react';

interface MobileBottomMenuProps {
  onSettings: () => void;
  onInformation: () => void;
  onProfile: () => void;
  onEndGame: () => void;
}

export function MobileBottomMenu({ onSettings, onInformation, onProfile, onEndGame }: MobileBottomMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: User, label: 'Profile', action: onProfile },
    { icon: Info, label: 'Info', action: onInformation },
    { icon: Settings, label: 'Settings', action: onSettings },
    { icon: Square, label: 'End Game', action: onEndGame },
  ];

  const handleItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/30 p-4">
              <div className="grid grid-cols-2 gap-3">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item.action)}
                    className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <item.icon className="w-6 h-6 text-white" />
                    <span className="text-white text-sm font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Button */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-black/80 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}