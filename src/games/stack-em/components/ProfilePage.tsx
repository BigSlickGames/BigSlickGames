import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, User } from 'lucide-react';

interface ProfilePageProps {
  onClose: () => void;
  onBack: () => void;
  user: any;
  profile: any;
  onShowAuth: () => void;
  onSignOut: () => void;
}

export function ProfilePage({
  onClose,
  onBack,
  user,
  profile,
  onShowAuth,
  onSignOut
}: ProfilePageProps) {
  // Guest mode - no profile
  const winRate = 0;

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
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <button
        onClick={onClose}
        className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={onBack}
        className="absolute left-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full p-6 pt-16">
          <h1 className="text-3xl font-bold text-center text-white mb-8">Profile</h1>

          <div className="max-w-md mx-auto space-y-6">
            {/* Guest Mode - No Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-6 rounded-xl border border-white/30 backdrop-blur-md shadow-lg"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Guest Mode</h2>
                <p className="text-white/70 text-sm mb-4">
                  Playing as a guest. Your progress is stored locally on this device only.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}