import React, { useState } from "react";
import { Gamepad2, Zap, Play, Users, Rocket } from "lucide-react";
import racingSuitsImg from "./images/RACINGSUITS.png";
import spaceCrashImg from "./images/SPACECRASH.png";

export default function MiniGames() {
  const handleGameClick = (gameId: string) => {
    if (gameId === "racing-suits") {
      // Navigate to internal game route
      window.location.href = "/play/racing-suits";
      return;
    }
    const gameUrls = {
      // "racing-suits": "https://clean-blank-project-07sc.bolt.host/",
      "space-crash": "https://connect-to-supabase-h2bf.bolt.host/",
    };

    const gameUrl = gameUrls[gameId as keyof typeof gameUrls];
    if (!gameUrl) {
      console.log(`Mini game ${gameId} not configured`);
      return;
    }

    // Generate cross-app authentication token
    const authToken = {
      email: "test@example.com",
      username: "TestUser",
      chips: 10000,
      level: 1,
      experience: 0,
      country: null,
      app: gameId,
      timestamp: Date.now(),
    };

    // Encode the token
    const encodedToken = btoa(JSON.stringify(authToken));

    // Create URL with authentication token
    const authenticatedUrl = `${gameUrl}?authToken=${encodedToken}`;

    console.log("🚀 Opening integration test game:", {
      game: gameId,
      url: authenticatedUrl,
    });

    // Open game in new tab with authentication
    window.open(authenticatedUrl, "_blank");
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl shadow-xl shadow-orange-500/10 overflow-hidden">
      {/* Modern Glass Header */}
      <div className="relative h-16 bg-gradient-to-r from-gray-800/60 via-gray-700/40 to-gray-800/60 backdrop-blur-xl border-b border-white/10 rounded-t-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">Mini Games</h3>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
        {/* Subtle animated elements */}
        <div className="absolute top-3 right-6 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-8 w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Mini Games Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Racing Suits Mini Game */}
          <div
            className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-purple-900/20 backdrop-blur-xl border border-purple-500/40 rounded-xl shadow-lg shadow-purple-500/30 overflow-hidden hover:border-purple-400/60 transition-all duration-300 hover:scale-105 cursor-pointer h-32"
            onClick={() => handleGameClick("racing-suits")}
          >
            <div className="relative h-12 bg-gradient-to-r from-purple-600/30 via-purple-500/20 to-purple-600/30 backdrop-blur-xl border-b border-purple-400/50 rounded-t-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/3 via-white/8 to-white/3"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center space-x-1">
                  <Rocket className="w-4 h-4 text-purple-300" />
                  <h3 className="text-white font-bold text-sm">Racing Suits</h3>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-3">
              {/* Game Banner Image */}
              <div className="relative h-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-purple-400/40 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-purple-600/5 to-purple-500/10 backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={racingSuitsImg}
                    alt="Racing Suits Banner"
                    className="w-4/5 h-4/5 object-cover opacity-90"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30"></div>
                <div className="absolute inset-0 border border-purple-400/30 rounded-lg"></div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGameClick("racing-suits");
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 border border-white/20 hover:border-white/40 text-sm"
              >
                <div className="flex items-center justify-center space-x-1">
                  <Play className="w-3 h-3" />
                  <span>Play</span>
                </div>
              </button>
            </div>
          </div>

          {/* Space Crash Mini Game */}
          <div
            className="bg-gradient-to-br from-black/40 via-gray-900/20 to-black/40 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-lg shadow-black/40 overflow-hidden hover:border-gray-500/60 transition-all duration-300 hover:scale-105 cursor-pointer h-32"
            onClick={() => handleGameClick("space-crash")}
          >
            <div className="relative h-12 bg-gradient-to-r from-gray-800/60 via-black/40 to-gray-800/60 backdrop-blur-xl border-b border-gray-600/50 rounded-t-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/3 via-white/8 to-white/3"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center space-x-1">
                  <Rocket className="w-4 h-4 text-gray-300" />
                  <h3 className="text-white font-bold text-sm">Space Crash</h3>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-3">
              {/* Game Banner Image */}
              <div className="relative h-16 bg-gradient-to-r from-black via-gray-900 to-black border border-gray-600/50 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-gray-800/10 to-black/20 backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={spaceCrashImg}
                    alt="Space Crash Banner"
                    className="w-4/5 h-4/5 object-cover opacity-90"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30"></div>
                <div className="absolute inset-0 border border-gray-600/40 rounded-lg"></div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGameClick("space-crash");
                }}
                className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-black/40 border border-gray-600/30 hover:border-gray-500/50 text-sm"
              >
                <div className="flex items-center justify-center space-x-1">
                  <Play className="w-3 h-3" />
                  <span>Play</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-gray-400 text-xs sm:text-sm">
            Quick games to win chips while you wait!
          </p>
        </div>
      </div>
    </div>
  );
}
