import { Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GAMES } from "../games";

export default function GameContainer() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const game = gameId ? GAMES[gameId] : null;

  if (!game) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game not found</h1>
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
