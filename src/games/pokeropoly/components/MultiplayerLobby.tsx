// src/games/pokeropoly/components/MultiplayerLobby.tsx

import { useState } from "react";
import { Users, Plus, LogIn, ArrowLeft } from "lucide-react";

interface MultiplayerLobbyProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomCode: string) => void;
  onBack?: () => void;
}

export default function MultiplayerLobby({
  onCreateRoom,
  onJoinRoom,
  onBack,
}: MultiplayerLobbyProps) {
  const [roomCode, setRoomCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleJoinSubmit = () => {
    if (roomCode.trim().length === 6) {
      onJoinRoom(roomCode.toUpperCase());
    }
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url(/games/pokeropoly/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-20 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-lg shadow-xl transition-all hover:scale-105 border-2 border-gray-600 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full mx-4">
        {/* Title Card */}
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-4 border-yellow-500/50 rounded-3xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-4 mb-4 shadow-lg shadow-yellow-500/50">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-2">
              POKER-OPOLY
            </h1>
            <p className="text-xl text-gray-300">Multiplayer Mode</p>
          </div>

          {!showJoinInput ? (
            /* Main Menu */
            <div className="space-y-4">
              {/* Create Room Button */}
              <button
                onClick={onCreateRoom}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-6 px-8 rounded-xl shadow-2xl transition-all hover:scale-105 border-2 border-green-400/50 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <Plus className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-2xl">Create Room</div>
                    <div className="text-sm text-green-100">
                      Host a new game
                    </div>
                  </div>
                </div>
              </button>

              {/* Join Room Button */}
              <button
                onClick={() => setShowJoinInput(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-6 px-8 rounded-xl shadow-2xl transition-all hover:scale-105 border-2 border-blue-400/50 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <LogIn className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-2xl">Join Room</div>
                    <div className="text-sm text-blue-100">
                      Enter a room code
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* Join Room Input */
            <div className="space-y-6">
              <button
                onClick={() => {
                  setShowJoinInput(false);
                  setRoomCode("");
                }}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to menu
              </button>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Enter Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) =>
                    setRoomCode(e.target.value.toUpperCase().slice(0, 6))
                  }
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full bg-gray-800/80 border-2 border-gray-600 rounded-xl px-6 py-4 text-white text-2xl font-mono text-center tracking-widest focus:outline-none focus:border-blue-500 transition-colors uppercase"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && roomCode.length === 6) {
                      handleJoinSubmit();
                    }
                  }}
                />
                <p className="text-gray-400 text-sm mt-2 text-center">
                  6-character code from your friend
                </p>
              </div>

              <button
                onClick={handleJoinSubmit}
                disabled={roomCode.length !== 6}
                className={`w-full font-bold py-4 px-8 rounded-xl shadow-xl transition-all border-2 ${
                  roomCode.length === 6
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white border-blue-400/50 hover:scale-105"
                    : "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                }`}
              >
                {roomCode.length === 6 ? (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Join Room
                  </span>
                ) : (
                  <span>Enter 6-character code</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">2-4</div>
            <div className="text-sm text-gray-300">Players</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">~30m</div>
            <div className="text-sm text-gray-300">Game Time</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">Online</div>
            <div className="text-sm text-gray-300">Multiplayer</div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">
        ♠
      </div>
      <div className="absolute top-20 right-20 text-6xl opacity-20 animate-pulse delay-100">
        ♥
      </div>
      <div className="absolute bottom-20 left-20 text-6xl opacity-20 animate-pulse delay-200">
        ♦
      </div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-pulse delay-300">
        ♣
      </div>
    </div>
  );
}
