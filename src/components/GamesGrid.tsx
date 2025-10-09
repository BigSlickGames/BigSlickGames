import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Club,
  Rocket,
  Spade as Spades,
  Heart,
  Diamond,
  Users,
  Play,
} from "lucide-react";

import stackEmBanner from "./images/21STACK'EM.png";
import racingSuitsBanner from "./images/RACINGSUITS.png";
import holdEmBanner from "./images/21HOLD'EM.png";
import multiUpBanner from "./images/21MULTI'UP.png";
import sinkEmBanner from "./images/21SINK'EM.png";
import pokerOpolyBanner from "./images/POKER-OPOLY.png";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  chips: number;
  created_at: string;
  country?: string | null;
  level?: number;
  experience?: number;
}

const games = [
  {
    id: "stack-em",
    name: "21 Stack'em",
    color: "from-green-600 to-green-900",
    glowColor: "shadow-green-700/40",
    hoverColor: "hover:from-green-500 hover:to-green-800",
    description: "Build your way to victory",
    icon: Club,
    accent: "dark-green",
    bannerImage: stackEmBanner,
    liveStats: { playersOnline: 156 },
    glassTheme: {
      background: "from-green-700/10 via-green-800/5 to-green-900/10",
      border: "border-green-600/30",
      glow: "shadow-green-700/20",
      headerGlass: "from-green-600/20 via-green-700/15 to-green-800/20",
      headerBorder: "border-green-500/40",
    },
  },
  {
    id: "racing-suits",
    name: "Racing Suits",
    color: "from-cyan-300 to-blue-900",
    glowColor: "shadow-cyan-500/40",
    hoverColor: "hover:from-cyan-200 hover:to-blue-800",
    description: "High-speed card racing adventure",
    minBet: 100,
    icon: Rocket,
    accent: "cyan",
    bannerImage: racingSuitsBanner,
    specialFeatures: true,
    glassTheme: {
      background: "from-cyan-500/10 via-blue-500/5 to-cyan-600/10",
      border: "border-cyan-400/30",
      glow: "shadow-cyan-500/20",
      headerGlass: "from-cyan-400/20 via-blue-400/15 to-cyan-500/20",
      headerBorder: "border-cyan-300/40",
    },
  },
  {
    id: "hold-em",
    name: "21 Hold'em",
    color: "from-yellow-300 to-red-900",
    glowColor: "shadow-yellow-500/40",
    hoverColor: "hover:from-yellow-200 hover:to-red-800",
    description: "Strategic card game with poker elements",
    minBet: 1000,
    icon: Spades,
    accent: "orange",
    bannerImage: holdEmBanner,
    glassTheme: {
      background: "from-yellow-500/10 via-orange-500/5 to-red-600/10",
      border: "border-yellow-400/30",
      glow: "shadow-yellow-500/20",
      headerGlass: "from-yellow-400/20 via-orange-400/15 to-red-500/20",
      headerBorder: "border-yellow-300/40",
    },
  },
  {
    id: "multi-up",
    name: "21 Multi'Up",
    color: "from-pink-300 to-purple-900",
    glowColor: "shadow-pink-500/40",
    hoverColor: "hover:from-pink-200 hover:to-purple-800",
    description: "Multi-level progressive challenge",
    minBet: 5000,
    icon: Heart,
    accent: "red",
    bannerImage: multiUpBanner,
    glassTheme: {
      background: "from-pink-500/10 via-purple-500/5 to-pink-600/10",
      border: "border-pink-400/30",
      glow: "shadow-pink-500/20",
      headerGlass: "from-pink-400/20 via-purple-400/15 to-pink-500/20",
      headerBorder: "border-pink-300/40",
    },
  },
  {
    id: "sink-em",
    name: "Deck Realms",
    color: "from-amber-300 to-red-900",
    glowColor: "shadow-amber-500/40",
    hoverColor: "hover:from-amber-200 hover:to-red-800",
    description: "Build and customize your ultimate deck",
    minBet: "Full Bankroll",
    icon: Diamond,
    accent: "yellow",
    bannerImage: sinkEmBanner,
    specialFeatures: true,
    glassTheme: {
      background: "from-amber-500/10 via-yellow-500/5 to-red-600/10",
      border: "border-amber-400/30",
      glow: "shadow-amber-500/20",
      headerGlass: "from-amber-400/20 via-yellow-400/15 to-red-500/20",
      headerBorder: "border-amber-300/40",
    },
  },
  {
    id: "pokeroply",
    name: "Poker'oply",
    color: "from-emerald-300 to-green-900",
    glowColor: "shadow-emerald-500/40",
    hoverColor: "hover:from-emerald-200 hover:to-green-800",
    description: "Strategic poker meets property trading",
    minBet: 2500,
    icon: Spades,
    accent: "green",
    bannerImage: pokerOpolyBanner,
    glassTheme: {
      background: "from-emerald-500/10 via-green-500/5 to-emerald-600/10",
      border: "border-emerald-400/30",
      glow: "shadow-emerald-500/20",
      headerGlass: "from-emerald-400/20 via-green-400/15 to-emerald-500/20",
      headerBorder: "border-emerald-300/40",
    },
  },
];

interface GamesGridProps {
  onGameClick: (gameId: string) => void;
  profile: UserProfile;
}

export default function GamesGrid({ profile, onGameClick }: GamesGridProps) {
  const [gameOrder, setGameOrder] = useState(games.map((g) => g.id));
  const [animatedGames, setAnimatedGames] = useState<Set<string>>(new Set());

  // Static player counts until games are connected to database
  const staticPlayerCounts: Record<string, number> = {
    "stack-em": 0,
    "hold-em": 0,
    "multi-up": 0,
    "sink-em": 0,
    pokeroply: 0,
    "space-crash": 0,
    "integration-test": 0,
  };

  // Animate games in sequence
  React.useEffect(() => {
    games.forEach((game, index) => {
      setTimeout(() => {
        setAnimatedGames((prev) => new Set([...prev, game.id]));
      }, index * 80); // 80ms delay between each game - much faster cascade
    });
  }, []);

  const handleDeckRealmsAction = (action: string, gameId: string) => {
    switch (action) {
      case "manage-decks":
        // Navigate to deck management
        console.log("Opening deck management...");
        break;
      case "buy-cards":
        // Navigate to card pack store
        console.log("Opening card pack store...");
        break;
      case "find-cards":
        // Enter AR mode for card finding
        console.log("Entering AR card finding mode...");
        break;
      default:
        onGameClick(gameId);
        break;
    }
  };

  const orderedGames = gameOrder
    .map((id) => games.find((g) => g.id === id)!)
    .filter(Boolean);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pb-8">
      {orderedGames.map((game, index) => {
        const IconComponent = game.icon;
        const isAnimated = animatedGames.has(game.id);

        return (
          <div
            key={game.id}
            className={`bg-gradient-to-br ${
              game.glassTheme.background
            } backdrop-blur-xl border ${
              game.glassTheme.border
            } rounded-2xl shadow-xl ${
              game.glassTheme.glow
            } overflow-hidden hover:border-opacity-60 transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl transform ${
              isAnimated
                ? "translate-y-0 opacity-100 scale-100 rotate-0"
                : "translate-y-8 opacity-0 scale-90 rotate-2"
            }`}
            style={{
              transitionDelay: `${index * 80}ms`,
              transitionDuration: "400ms",
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              animationFillMode: "both",
            }}
          >
            {/* Game Header */}
            <div className="relative">
              {/* Themed Glass Heading */}
              <div
                className={`relative h-20 bg-gradient-to-r ${game.glassTheme.headerGlass} backdrop-blur-xl border-b ${game.glassTheme.headerBorder} rounded-t-2xl overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/3 via-white/8 to-white/3"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-white font-bold text-2xl drop-shadow-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {game.name}
                    </h3>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                {/* Subtle animated elements */}
                <div className="absolute top-4 right-6 w-2 h-2 bg-white/50 rounded-full animate-pulse shadow-sm"></div>
                <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping shadow-sm"></div>
              </div>

              {/* Game Stats Bar */}
              <div
                className={`p-4 border-b ${game.glassTheme.border} bg-gradient-to-r from-black/20 via-black/10 to-black/20 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  {/* Online Status */}
                  <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/40 backdrop-blur-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        staticPlayerCounts[game.id] > 0
                          ? "bg-green-400 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <Users className="w-4 h-4 text-green-300" />
                    <span className="text-green-300 text-sm font-semibold">
                      {staticPlayerCounts[game.id]}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Min Buyin</p>
                    <p className="text-yellow-400 font-semibold text-sm">
                      {typeof game.minBet === "string"
                        ? game.minBet
                        : game.minBet
                        ? `${game.minBet.toLocaleString()} chips`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* User Online Status */}
                <div className="px-4 pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">
                      You are online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Content */}
            <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
              {/* Banner Image */}
              <div className="relative h-32 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-orange-500/40 rounded-lg overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${game.glassTheme.background} backdrop-blur-sm`}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={game.bannerImage}
                    alt={`${game.name} Banner`}
                    className="w-full h-full object-cover opacity-90"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30"></div>
                <div
                  className={`absolute inset-0 border ${game.glassTheme.border} rounded-lg`}
                ></div>
              </div>

              {/* Play Button */}
              <button
                onClick={() => onGameClick(game.id)}
                className={`w-full bg-gradient-to-r ${game.color} ${game.hoverColor} text-white py-3 font-bold text-lg transition-all duration-300 rounded-lg shadow-lg ${game.glowColor} hover:shadow-xl flex items-center justify-center space-x-2 touch-manipulation active:scale-95 hover:scale-[1.02] border border-white/20 hover:border-white/40`}
              >
                <Play className="w-5 h-5" />
                <span>PLAY SOON</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
