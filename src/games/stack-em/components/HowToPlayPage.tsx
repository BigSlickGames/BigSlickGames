import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Play, Target, Zap, Trophy, Star, Mail } from 'lucide-react';

interface HowToPlayPageProps {
  onComplete: () => void;
}

export function HowToPlayPage({ onComplete }: HowToPlayPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const steps = [
    {
      title: "Welcome to 21 Stack'em!",
      content: (
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/40">
              <Play className="w-10 h-10 text-orange-400" />
            </div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            Get ready to master the ultimate card strategy game! Your goal is simple: create rows and columns that add up to exactly 21.
          </p>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-orange-500/30">
            <p className="text-orange-300 font-medium">🎯 Objective: Score 21 in rows and columns to win chips!</p>
          </div>
        </div>
      )
    },
    {
      title: "The Game Board",
      content: (
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/40">
              <Target className="w-10 h-10 text-orange-400" />
            </div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            You have a 5x5 grid to place your cards. The first row and column show running totals for each row and column.
          </p>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="bg-slate-700/30 rounded-lg p-3 border border-orange-500/30 text-center">
              <div className="text-orange-400 font-bold text-xl mb-1">21</div>
              <div className="text-slate-400 text-sm">Perfect Score</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 border border-red-500/30 text-center">
              <div className="text-red-400 font-bold text-xl mb-1">22+</div>
              <div className="text-slate-400 text-sm">Bust</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-500/30 text-center">
              <div className="text-slate-400 font-bold text-xl mb-1">&lt;21</div>
              <div className="text-slate-400 text-sm">Keep Going</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Dealing Cards",
      content: (
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/40">
              <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold">A</span>
              </div>
            </div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            Tap the deck to deal cards. You'll get up to 3 cards at a time that you can drag onto the board.
          </p>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-orange-500/30">
            <p className="text-orange-300 font-medium mb-2">💡 Pro Tip:</p>
            <p className="text-slate-300">Plan ahead! Once you place a card, you can't move it. Think about which rows and columns you want to complete first.</p>
          </div>
        </div>
      )
    },
    {
      title: "Drag & Drop",
      content: (
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/40">
              <Zap className="w-10 h-10 text-orange-400" />
            </div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            Drag cards from the dealt area onto empty spaces in the grid. Watch the totals update in real-time!
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3 border border-orange-500/30">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-orange-400 text-sm">1</span>
              </div>
              <span className="text-slate-300">Drag a card to an empty space</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3 border border-orange-500/30">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-orange-400 text-sm">2</span>
              </div>
              <span className="text-slate-300">Watch the row/column totals update</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3 border border-orange-500/30">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-orange-400 text-sm">3</span>
              </div>
              <span className="text-slate-300">Score 21 to win chips!</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Special Cards",
      content: (
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/40">
              <Star className="w-10 h-10 text-orange-400" />
            </div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            Watch out for special cards that can change your strategy!
          </p>
          <div className="space-y-3">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-300 font-bold">Swap Cards</span>
              </div>
              <p className="text-slate-300 text-sm">Let you swap the positions of two cards already on the board</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-purple-400 rounded-full"></div>
                <span className="text-purple-300 font-bold">Wild Cards</span>
              </div>
              <p className="text-slate-300 text-sm">Can be any value from 1-11, you choose when placing them</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 border border-orange-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-slate-900 text-xs font-bold">A</span>
                </div>
                <span className="text-orange-300 font-bold">Aces</span>
              </div>
              <p className="text-slate-300 text-sm">Can be worth 1 or 11 points, you decide when placing them</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Play!",
      content: (
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/40">
              <Trophy className="w-10 h-10 text-orange-400" />
            </div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            You're all set! Remember: aim for 21, avoid going over, and use special cards wisely.
          </p>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-orange-500/30">
            <p className="text-orange-300 font-medium mb-2">🏆 Scoring:</p>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Each row/column that equals 21 wins chips</li>
              <li>• Higher antes = bigger rewards</li>
              <li>• Multiple 21s in one game = bonus multipliers</li>
            </ul>
          </div>
          
          {/* Optional Email Signup */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 font-medium">Stay Updated (Optional)</span>
            </div>
            {!emailSubmitted ? (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email for game updates"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (email) {
                      setEmailSubmitted(true);
                    }
                  }}
                  className="w-full px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg border border-orange-500/40 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            ) : (
              <p className="text-green-400">Thanks for subscribing! 🎉</p>
            )}
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-orange-500/40 shadow-2xl shadow-orange-500/20 w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-500/30">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-100">How to Play</h2>
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-orange-400'
                      : index < currentStep
                      ? 'bg-orange-600'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleComplete}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-slate-100 mb-4">
                {steps[currentStep].title}
              </h3>
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-orange-500/30">
          <button
            onClick={handleComplete}
            className="px-4 py-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            Skip Tutorial
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                currentStep === 0
                  ? 'bg-slate-700/20 text-slate-500 border-slate-600/30 cursor-not-allowed'
                  : 'bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 border-slate-600/40 hover:border-slate-500/60'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg border border-orange-500/40 hover:border-orange-400/60 transition-colors"
              >
                Start Playing!
                <Play className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg border border-orange-500/40 hover:border-orange-400/60 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}