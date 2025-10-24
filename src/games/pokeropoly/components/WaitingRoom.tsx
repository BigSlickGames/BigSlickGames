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
      className="w-screen h-screen flex items-center justify-center overflow-hidden p-4"
      style={{
        backgroundImage: "url(/games/pokeropoly/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 max-w-4xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-4 border-yellow-500/50 rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3 shadow-lg shadow-yellow-500/50">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Waiting Room</h2>
                <p className="text-gray-400 text-sm">
                  {players.length}/4 players
                </p>
              </div>
            </div>

            <button
              onClick={onLeaveRoom}
              className="bg-red-600/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all hover:scale-105 border border-red-400/50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave
            </button>
          </div>

          {/* Room Code */}
          <div className="bg-gray-800/60 border-2 border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Room Code</p>
                <p className="text-3xl font-mono font-bold text-yellow-400 tracking-widest">
                  {roomCode}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-105 border border-blue-400/50 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Share this code with friends to invite them
            </p>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[0, 1, 2, 3].map((slotIndex) => {
            const player = players.find((p) => p.player_index === slotIndex);

            return (
              <div
                key={slotIndex}
                className={`relative bg-gradient-to-br backdrop-blur-xl border-3 rounded-2xl p-6 shadow-xl transition-all ${
                  player
                    ? "from-gray-800/95 to-gray-900/95 border-gray-600"
                    : "from-gray-900/60 to-gray-800/60 border-gray-700/50 border-dashed"
                }`}
              >
                {player ? (
                  <>
                    {/* Player Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-4"
                          style={{
                            backgroundColor: player.player_color,
                            borderColor: player.is_ready
                              ? "#10B981"
                              : "#6B7280",
                          }}
                        >
                          {player.player_suit}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-bold text-lg">
                              {player.player_name}
                            </p>
                            {isHost && slotIndex === 0 && (
                              <Crown className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            {getPlayerPosition(player.player_index)}
                          </p>
                        </div>
                      </div>

                      {/* Ready Status */}
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          player.is_ready
                            ? "bg-green-500/20 text-green-400 border border-green-500/50"
                            : "bg-gray-700/50 text-gray-400 border border-gray-600"
                        }`}
                      >
                        {player.is_ready ? "✓ Ready" : "Not Ready"}
                      </div>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
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
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-600 border-dashed">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-500 font-semibold">
                      Waiting for player...
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {getPlayerPosition(slotIndex)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-2 border-gray-700 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Ready Button (for non-hosts) or Start Button (for host) */}
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={!canStartGame}
                className={`flex-1 font-bold py-4 px-8 rounded-xl shadow-xl transition-all border-2 flex items-center justify-center gap-2 ${
                  canStartGame
                    ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white border-green-400/50 hover:scale-105"
                    : "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                }`}
              >
                <Play className="w-5 h-5" />
                {canStartGame
                  ? "Start Game"
                  : `Waiting for players (${players.filter((p) => p.is_ready).length}/${players.length} ready)`}
              </button>
            ) : (
              <button
                onClick={onToggleReady}
                className={`flex-1 font-bold py-4 px-8 rounded-xl shadow-xl transition-all border-2 hover:scale-105 ${
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
          <div className="mt-4 space-y-2">
            {players.length < 2 && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-center">
                <p className="text-yellow-400 text-sm font-semibold">
                  ⚠️ At least 2 players needed to start
                </p>
              </div>
            )}
            {isHost && players.length >= 2 && !allPlayersReady && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-center">
                <p className="text-blue-400 text-sm font-semibold">
                  👑 Waiting for all players to be ready
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
