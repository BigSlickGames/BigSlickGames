import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, Music2, Music, Palette, Sparkles, Sparkle } from 'lucide-react';
import type { Difficulty } from '../types/GameTypes';

interface SettingsPageProps {
  onClose: () => void;
  musicEnabled: boolean;
  soundEnabled: boolean;
  onMusicToggle: (enabled: boolean) => void;
  onSoundToggle: (enabled: boolean) => void;
  animatedBackgrounds: boolean;
  onAnimatedBackgroundsToggle: (enabled: boolean) => void;
}

export function SettingsPage({
  onClose,
  musicEnabled,
  soundEnabled,
  onMusicToggle,
  onSoundToggle,
  animatedBackgrounds,
  onAnimatedBackgroundsToggle
}: SettingsPageProps) {

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

      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full p-6">
          <h1 className="text-3xl font-bold text-center text-white mb-8">Settings</h1>

          <div className="max-w-md mx-auto space-y-6">

            <motion.div
              layout
              className="bg-gradient-to-br from-white/20 via-white/10 to-white/5 p-6 rounded-xl border border-white/30 backdrop-blur-md shadow-lg relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/15 before:to-transparent before:pointer-events-none"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Visual Settings</h2>
              <div className="space-y-4">
                <button
                  onClick={() => onAnimatedBackgroundsToggle(!animatedBackgrounds)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {animatedBackgrounds ? (
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Sparkle className="w-6 h-6 text-white/70" />
                    )}
                    <span className="text-white">Animated Backgrounds</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${animatedBackgrounds ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/20 text-white/70'}`}>
                    {animatedBackgrounds ? 'ON' : 'OFF'}
                  </div>
                </button>

                <button
                  onClick={() => onMusicToggle(!musicEnabled)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {musicEnabled ? (
                      <Music2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Music className="w-6 h-6 text-white/70" />
                    )}
                    <span className="text-white">Background Music</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${musicEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/20 text-white/70'}`}>
                    {musicEnabled ? 'ON' : 'OFF'}
                  </div>
                </button>

                <button
                  onClick={() => onSoundToggle(!soundEnabled)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {soundEnabled ? (
                      <Volume2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-6 h-6 text-white/70" />
                    )}
                    <span className="text-white">Sound Effects</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/20 text-white/70'}`}>
                    {soundEnabled ? 'ON' : 'OFF'}
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}