// src/games/pokeropoly/components/WaitingRoom.tsx

import { useState } from "react";
import { Copy, Check, Crown, Users, LogOut, Play } from "lucide-react";

interface Player {
  id: string;
  player_name: string;
  player_index: number;
  player_color: string;
  player_suit: string;
  is_ready: boolean;
  is_connected: boolean;
}

interface WaitingRoomProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  currentUserId: string;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export default function WaitingRoom({
  roomCode,
  players,
  isHost,
  currentUserId,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const currentPlayer = players.find((p) => p.id === currentUserId);
  const allPlayersReady =
    players.length >= 2 && players.every((p) => p.is_ready);
  const canStartGame = isHost && allPlayersReady;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlayerPosition = (index: number) => {
    const positions = ["Bottom", "Left", "Top", "Right"];
    return positions[index];
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 overflow-x-hidden"
      style={{
        backgroundImage: "url(/games/pokeropoly/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl shadow-2xl p-3 sm:p-4 mb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-2 shadow-lg shadow-yellow-500/50">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Waiting Room
                </h2>
                <p className="text-gray-400 text-xs">
                  {players.length}/4 players
                </p>
              </div>
            </div>

            <button
              onClick={onLeaveRoom}
              className="bg-red-600/80 hover:bg-red-500 text-white font-bold py-1.5 px-3 rounded-lg shadow-lg transition-all hover:scale-105 border border-red-400/50 flex items-center gap-1.5 text-sm w-full sm:w-auto justify-center"
            >
              <LogOut className="w-3.5 h-3.5" />
              Leave
            </button>
          </div>

          {/* Room Code */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-2.5 sm:p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="w-full sm:w-auto">
                <p className="text-gray-400 text-xs mb-0.5">Room Code</p>
                <p className="text-xl sm:text-2xl font-mono font-bold text-yellow-400 tracking-widest break-all">
                  {roomCode}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg shadow-lg transition-all hover:scale-105 border border-blue-400/50 flex items-center gap-1.5 text-xs sm:text-sm w-full sm:w-auto justify-center"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-1.5">
              Share this code with friends
            </p>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-3">
          {[0, 1, 2, 3].map((slotIndex) => {
            const player = players.find((p) => p.player_index === slotIndex);

            return (
              <div
                key={slotIndex}
                className={`relative bg-gradient-to-br backdrop-blur-xl border-2 rounded-xl p-3 sm:p-4 shadow-xl transition-all ${
                  player
                    ? "from-gray-800/95 to-gray-900/95 border-gray-600"
                    : "from-gray-900/60 to-gray-800/60 border-gray-700/50 border-dashed"
                }`}
              >
                {player ? (
                  <>
                    {/* Player Info */}
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-lg border-2 flex-shrink-0"
                          style={{
                            backgroundColor: player.player_color,
                            borderColor: player.is_ready
                              ? "#10B981"
                              : "#6B7280",
                          }}
                        >
                          {player.player_suit}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            <p className="text-white font-bold text-sm sm:text-base truncate">
                              {player.player_name}
                            </p>
                            {isHost && slotIndex === 0 && (
                              <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-gray-400 text-xs">
                            {getPlayerPosition(player.player_index)}
                          </p>
                        </div>
                      </div>

                      {/* Ready Status */}
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                          player.is_ready
                            ? "bg-green-500/20 text-green-400 border border-green-500/50"
                            : "bg-gray-700/50 text-gray-400 border border-gray-600"
                        }`}
                      >
                        {player.is_ready ? "✓" : "○"}
                      </div>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          player.is_connected
                            ? "bg-green-400 animate-pulse"
                            : "bg-red-400"
                        }`}
                      ></div>
                      <span className="text-gray-400 text-xs">
                        {player.is_connected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </>
                ) : (
                  /* Empty Slot */
                  <div className="text-center py-3 sm:py-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-1.5 border-2 border-gray-600 border-dashed">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    </div>
                    <p className="text-gray-500 font-semibold text-xs sm:text-sm">
                      Waiting...
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {getPlayerPosition(slotIndex)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-xl p-3 sm:p-4">
          <div className="flex flex-col gap-2.5">
            {/* Ready Button (for non-hosts) or Start Button (for host) */}
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={!canStartGame}
                className={`w-full font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-xl transition-all border-2 flex items-center justify-center gap-2 text-sm ${
                  canStartGame
                    ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white border-green-400/50 hover:scale-105"
                    : "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                }`}
              >
                <Play className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {canStartGame
                    ? "Start Game"
                    : `Waiting (${players.filter((p) => p.is_ready).length}/${players.length})`}
                </span>
              </button>
            ) : (
              <button
                onClick={onToggleReady}
                className={`w-full font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-xl transition-all border-2 hover:scale-105 text-sm ${
                  currentPlayer?.is_ready
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-red-400/50"
                    : "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white border-green-400/50"
                }`}
              >
                {currentPlayer?.is_ready ? "Cancel Ready" : "I'm Ready!"}
              </button>
            )}
          </div>

          {/* Info Messages */}
          <div className="mt-2.5 space-y-1.5">
            {players.length < 2 && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2 text-center">
                <p className="text-yellow-400 text-xs font-semibold">
                  ⚠️ Need 2+ players
                </p>
              </div>
            )}
            {isHost && players.length >= 2 && !allPlayersReady && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-2 text-center">
                <p className="text-blue-400 text-xs font-semibold">
                  👑 Waiting for ready
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
