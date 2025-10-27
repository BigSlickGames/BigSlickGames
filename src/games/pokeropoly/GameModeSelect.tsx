import { useNavigate } from "react-router-dom";

function GameModeSelect() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl">
        <h1 className="text-white text-5xl font-black text-center mb-12">
          Pokeropoly
        </h1>

        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate("/game/local")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-6 px-12 rounded-2xl shadow-2xl transform hover:scale-105 transition-all text-xl"
          >
            🎮 Play Locally
          </button>

          <button
            onClick={() => navigate("/game/multiplayer")}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black py-6 px-12 rounded-2xl shadow-2xl transform hover:scale-105 transition-all text-xl"
          >
            🌐 Play Online
          </button>

          <button
            onClick={() => navigate("/home")}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-8 rounded-xl shadow-xl transition-all text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameModeSelect;
