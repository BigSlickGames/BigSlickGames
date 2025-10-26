import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function App() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center overflow-x-hidden p-4 sm:p-6"
      style={{
        backgroundImage: "url(/games/pokeropoly/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <button
        onClick={() => navigate("/home")}
        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-xl transition-all hover:scale-105 border border-gray-600 sm:border-2 flex items-center gap-2 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        Back
      </button>

      <div className="relative z-10 w-full max-w-2xl px-4">
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-2 sm:border-4 border-yellow-500/50 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-4">
              POKER-OPOLY
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8">
              Coming Soon
            </p>
            <p className="text-base sm:text-lg text-gray-400">
              This game is currently under development. Check back soon for an exciting poker-themed board game experience!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-0 sm:mb-1">
              2-4
            </div>
            <div className="text-xs sm:text-sm text-gray-300">Players</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-0 sm:mb-1">
              ~30m
            </div>
            <div className="text-xs sm:text-sm text-gray-300">Game Time</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-0 sm:mb-1">
              Online
            </div>
            <div className="text-xs sm:text-sm text-gray-300">Multiplayer</div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block absolute top-10 left-10 text-6xl opacity-20 animate-pulse">
        ♠
      </div>
      <div className="hidden sm:block absolute top-20 right-20 text-6xl opacity-20 animate-pulse delay-100">
        ♥
      </div>
      <div className="hidden sm:block absolute bottom-20 left-20 text-6xl opacity-20 animate-pulse delay-200">
        ♦
      </div>
      <div className="hidden sm:block absolute bottom-10 right-10 text-6xl opacity-20 animate-pulse delay-300">
        ♣
      </div>
    </div>
  );
}

export default App;
