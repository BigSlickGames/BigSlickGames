import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown, Info, HelpCircle, Star, Crown, ExternalLink } from 'lucide-react';

interface InformationPageProps {
  onClose: () => void;
  onShowPremium: () => void;
  backgroundColor?: string;
}

export function InformationPage({ onClose, onShowPremium, backgroundColor = 'hsl(210, 70%, 60%)' }: InformationPageProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'company',
      icon: <img src="/images/BSG.png" alt="BSG Logo" className="w-6 h-6" />,
      title: 'Big Slick Games',
      content: (
        <div className="text-white/90 space-y-3">
          <div className="flex items-center gap-4 mb-4">
            <img src="/images/BSG.png" alt="BSG Logo" className="w-12 h-12" />
            <div>
              <h3 className="text-lg font-semibold text-white">Big Slick Games</h3>
              <p className="text-white/70">Creating Fun Mobile Games</p>
            </div>
          </div>
          <p>Find more exciting games at:</p>
          <a 
            href="https://bigslickgames.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            bigslickgames.com
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )
    },
    {
      id: 'howToPlay',
      icon: <HelpCircle className="w-6 h-6 text-blue-400" />,
      title: 'How to Play',
      content: (
        <div className="text-white/90 space-y-3">
          <p>Stack cards to create totals of exactly 21! The more cards you use, the more chips you earn.</p>
          <p>1. Drag cards from your hand to the game board</p>
          <p>2. Create combinations that sum to exactly 21</p>
          <p>3. Earn chips based on the number of cards used and your ante</p>
          <p>4. Keep stacking until no more moves are possible</p>
          <p className="text-yellow-400">🔄 Swap Cards: Exchange with cards already on the board</p>
          <p className="text-purple-400">🃏 Wild Cards: Choose any value from remaining deck cards</p>
          <p className="text-red-400">Note: Each card you place costs your selected ante amount.</p>
        </div>
      )
    },
    {
      id: 'scoring',
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      title: 'Scoring System',
      content: (
        <div className="text-white/90 space-y-3">
          <p>Chips are awarded based on how many cards you use to make 21:</p>
          <p className="text-emerald-400">Formula: Ante × Number of Cards × Multiplier</p>
          <ul className="list-disc list-inside space-y-2">
            <li>2 cards = Ante × 2 × 1.5 multiplier</li>
            <li>3 cards = Ante × 3 × 2.0 multiplier</li>
            <li>4 cards = Ante × 4 × 2.5 multiplier</li>
            <li>5 cards = Ante × 5 × 3.0 multiplier</li>
          </ul>
          <p className="text-yellow-400">Example: 3 cards with 10 ante = 10 × 3 × 2.0 = 60 chips</p>
          <p className="text-red-400">Going over 21 costs you your ante amount!</p>
          <p className="text-red-400">Each card placement costs your selected ante.</p>
        </div>
      )
    },
    {
      id: 'tips',
      icon: <Info className="w-6 h-6 text-green-400" />,
      title: 'Tips & Strategies',
      content: (
        <div className="text-white/90 space-y-3">
          <p>Master these strategies to maximize your chip earnings:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Look for opportunities to use more cards per stack</li>
            <li>Plan ahead with the cards in your hand</li>
            <li>Try to maintain a steady flow of consecutive stacks</li>
            <li>Choose your ante wisely - higher risk, higher reward</li>
            <li>Avoid going over 21 to prevent losing your ante</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-30"
    >
      <div className="absolute inset-0">
        <img 
          src="/images/BlueSplashBlankBackground.png"
          alt="Background"
          className="w-full h-full object-cover"
          style={{ filter: `hue-rotate(${parseInt(backgroundColor.split(',')[0].split('(')[1]) - 210}deg)` }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <button
        onClick={onClose}
        className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full p-6">
          <h1 className="text-3xl font-bold text-center text-white mb-8">Information</h1>

          <div className="max-w-md mx-auto space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={onShowPremium}
              className="w-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-emerald-400" />
                <span className="text-white font-medium">Premium Features</span>
              </div>
              <ChevronDown className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {sections.map((section) => (
              <motion.div key={section.id} layout>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className="w-full bg-gradient-to-br from-white/15 via-white/8 to-white/3 p-4 rounded-xl border border-white/25 flex items-center justify-between group backdrop-blur-md shadow-lg relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none"
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span className="text-white font-medium">{section.title}</span>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-white/70 transition-transform ${
                      activeSection === section.id ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                <motion.div
                  initial={false}
                  animate={{ 
                    height: activeSection === section.id ? 'auto' : 0,
                    opacity: activeSection === section.id ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 px-2">
                    {section.content}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}