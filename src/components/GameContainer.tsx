import { Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GAMES } from "../games";

export default function GameContainer() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  // Debug logs
  console.log("GameContainer - gameId from URL:", gameId);
  console.log("GameContainer - Available games:", Object.keys(GAMES));
  console.log("GameContainer - GAMES object:", GAMES);

  const game = gameId ? GAMES[gameId] : null;

  console.log("GameContainer - Found game:", game);

  if (!game) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">
            Game {gameId} not yet configured
          </h1>
          <p className="mb-4">Looking for: {gameId}</p>
          <p className="mb-4">
            Available games: {Object.keys(GAMES).join(", ")}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  const GameComponent = game.component;

  return (
    <div className="min-h-screen bg-gray-900">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-white text-xl">Loading {game.name}...</div>
          </div>
        }
      >
        <GameComponent />
      </Suspense>
    </div>
  );
}
