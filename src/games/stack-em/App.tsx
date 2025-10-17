import { useState, useEffect } from "react";
import { DeckArea } from "./components/DeckArea";
import { AnteButton } from "./components/AnteButton";
import { BankrollDisplay } from "./components/BankrollDisplay";
import { GameOverModal } from "./components/GameOverModal";
import { EndGameModal } from "./components/EndGameModal";
import { AntePopup } from "./components/AntePopup";
import { AceSelectionModal } from "./components/AceSelectionModal";
import { WildSelectionModal } from "./components/WildSelectionModal";
import { ScoreAnimation } from "./components/ScoreAnimation";
import { XPStarAnimation } from "./components/XPStarAnimation";
import { HowToPlayPage } from "./components/HowToPlayPage";
import { BSGButton } from "./components/BSGButton";
import { CollectSuccessModal } from "./components/CollectSuccessModal";
import { LogoSplash } from "./components/LogoSplash";
import { useGameLogic } from "./hooks/useGameLogic";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Coins } from "lucide-react";
import {
  calculateRowTotal,
  calculateColumnTotal,
  getTotalSpaceImage,
} from "./utils/calculations";
import { supabase } from "../../lib/supabase";

// Memoized functions
const getTextColorMobile = (total: number) => {
  if (total === 21)
    return "text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.8)]";
  if (total > 21)
    return "text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.8)]";
  return "text-black drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]";
};

const getTextColorPC = (total: number) => {
  if (total === 21)
    return "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,1)]";
  if (total > 21)
    return "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,1)]";
  return "text-black drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]";
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export default function App() {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("Player");
  const [chipBalance, setChipBalance] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerExperience, setPlayerExperience] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animatedBackgrounds, setAnimatedBackgrounds] = useState(true);
  const [showAntePopup, setShowAntePopup] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showEndGame, setShowEndGame] = useState(false);
  const [activeBackground, setActiveBackground] = useState("default");
  const [ownedBackgrounds, setOwnedBackgrounds] = useState(["default"]);
  const [showCollectSuccessModal, setShowCollectSuccessModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const {
    gameState,
    setGameState,
    dealCards,
    handleDragEnd,
    handleAceSelection,
    handleWildSelection,
    setAnte,
    resetGame,
    collectWinnings,
    freezeGame,
    endGameSession,
  } = useGameLogic("medium");

  // Load user data
  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/games-hub";
        return;
      }
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (profile) setPlayerName(profile.username || "Player");
      const { data: wallet } = await supabase
        .from("user_wallet")
        .select("chips, level, experience")
        .eq("user_id", user.id)
        .single();
      if (wallet) {
        setChipBalance(wallet.chips || 1000);
        setPlayerLevel(wallet.level || 1);
        setPlayerExperience(wallet.experience || 0);
        setGameState((prev) => ({ ...prev, chips: wallet.chips || 1000 }));
      }
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("game_stats")
        .eq("user_id", user.id)
        .single();
      const hasSeenTutorial = prefs?.game_stats?.stackem_tutorial_seen;
      setShowTutorial(!hasSeenTutorial);
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  // DB updates
  const updateChipsInDB = async (newChips: number) => {
    if (!userId) return;
    try {
      await supabase
        .from("user_wallet")
        .update({ chips: newChips, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    } catch (error) {
      console.error("Error updating chips:", error);
    }
  };

  const updateProgressInDB = async (
    newLevel: number,
    newExperience: number
  ) => {
    if (!userId) return;
    try {
      await supabase
        .from("user_wallet")
        .update({
          level: newLevel,
          experience: newExperience,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const updateGameStats = async (won: boolean) => {
    if (!userId) return;
    try {
      const { data: currentWallet } = await supabase
        .from("user_wallet")
        .select("games_played, games_won, games_won_by_type")
        .eq("user_id", userId)
        .single();
      if (currentWallet) {
        const newGamesPlayed = (currentWallet.games_played || 0) + 1;
        const newGamesWon = won
          ? (currentWallet.games_won || 0) + 1
          : currentWallet.games_won;
        const gamesWonByType = currentWallet.games_won_by_type || {};
        if (won) gamesWonByType.stackem = (gamesWonByType.stackem || 0) + 1;
        await supabase
          .from("user_wallet")
          .update({
            games_played: newGamesPlayed,
            games_won: newGamesWon,
            games_won_by_type: gamesWonByType,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }
    } catch (error) {
      console.error("Error updating game stats:", error);
    }
  };

  const handleTutorialComplete = async () => {
    if (!userId) return;
    try {
      const { data: currentPrefs } = await supabase
        .from("user_preferences")
        .select("game_stats")
        .eq("user_id", user.id)
        .single();
      const gameStats = currentPrefs?.game_stats || {};
      gameStats.stackem_tutorial_seen = true;
      await supabase
        .from("user_preferences")
        .update({
          game_stats: gameStats,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      setShowTutorial(false);
    } catch (error) {
      console.error("Error updating tutorial status:", error);
      setShowTutorial(false);
    }
  };

  // Handlers
  const handlePlayAgain = () => {
    resetGame(gameState.difficulty);
  };

  const handleCancelGameOver = () => {
    setGameState((prev) => ({ ...prev, showGameOver: false }));
  };

  const handleEndGame = () => {
    setShowEndGame(true);
  };

  const handleConfirmEndGame = () => {
    setShowEndGame(false);
    setShowGameOver(true);
    updateGameStats(false);
  };

  const handlePurchaseBackground = (
    backgroundId: string,
    cost: number
  ): boolean => {
    if (gameState.chips >= cost) {
      setGameState((prev) => ({ ...prev, chips: prev.chips - cost }));
      setOwnedBackgrounds((prev) => [...prev, backgroundId]);
      return true;
    }
    return false;
  };

  const getBackgroundImage = () => {
    const backgrounds = {
      default: "/images/BlueSplashBlankBackground.png",
      ocean: "/images/21 Stack'em New blackground.jpg",
      clouds: "/images/cloudy sky.jpg",
      sunshine: "/images/GreySplashBlankBackgroundsunshine.png",
      summer: "/images/summer days.jpg",
    };
    return (
      backgrounds[activeBackground as keyof typeof backgrounds] ||
      backgrounds.default
    );
  };

  const handleCollectWinnings = () => {
    const winnings = gameState.sessionWinnings;
    collectWinnings();

    if (winnings > 0) {
      const xpGained = winnings; // 1 chip won = 1 XP
      const newExperience = playerExperience + xpGained;
      setPlayerExperience(newExperience);
      setGameState((prev) => ({ ...prev, showXPAnimation: true }));
      updateGameStats(true);
    }

    setShowCollectSuccessModal(true);
  };

  const handlePlayAgainFromModal = () => {
    setShowCollectSuccessModal(false);
    setGameState((prev) => ({ ...prev, sessionWinnings: 0 }));
    resetGame(gameState.difficulty);
  };

  const handleCancelCollect = () => {
    setShowCollectSuccessModal(false);
    freezeGame();
  };

  // Effects
  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (gameState.chips !== chipBalance && !loading) {
      setChipBalance(gameState.chips);
      updateChipsInDB(gameState.chips);
    }
  }, [gameState.chips, loading]);

  useEffect(() => {
    if (playerExperience > 0 && !loading) {
      const newLevel = Math.floor(playerExperience / 1000) + 1;
      if (newLevel !== playerLevel) {
        setPlayerLevel(newLevel);
        const bonusChips = 500;
        setGameState((prev) => ({ ...prev, chips: prev.chips + bonusChips }));
      }
      updateProgressInDB(newLevel, playerExperience);
    }
  }, [playerExperience, loading]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Stack-Em...</div>
      </div>
    );
  }

  if (showSplash) {
    return <LogoSplash />;
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: "#1e293b" }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.03) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(251, 191, 36, 0.02) 0%, transparent 50%)",
          backgroundSize: "100% 100%",
        }}
      />
      {/* Tower Image */}
      <div
        className={`absolute inset-0 bg-contain bg-no-repeat ${!isMobile ? "scale-110" : ""}`}
        style={{
          backgroundImage: "url(/images/21-stackem-tower.png)",
          backgroundPosition: isMobile
            ? "center calc(50% - 90px)"
            : "center calc(50% + 110px)",
        }}
      />
      {/* Gradients */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-orange-600/20 to-red-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-400/15 to-yellow-500/15 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="relative z-20 w-full px-4 pt-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="glass-card rounded-xl p-3 mb-4 shadow-xl border border-orange-500/20 bg-black/80">
            <div className="flex items-center justify-between relative mb-3 sm:mb-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => (window.location.href = "/games-hub")}
                  className="glass-card p-2 rounded-lg hover:bg-orange-500/20 transition-colors border border-orange-500/30"
                  title="Back to Game Hub"
                >
                  <svg
                    className="w-5 h-5 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="relative">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#orangeGradient)"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (playerExperience % 1000) / 1000)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient
                        id="orangeGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 orange-gradient rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {playerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">
                    {playerName}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-orange-400 font-semibold text-xs">
                      Level {playerLevel}
                    </span>
                    <span className="text-white/50 text-xs">•</span>
                    <span className="text-white/70 text-xs">
                      {playerExperience % 1000} XP
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex absolute left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="glass-button orange-gradient hover:opacity-90 border border-orange-400/40 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Tutorial</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full bg-black/50">
                  <Coins className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-bold text-sm">
                    {chipBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="sm:hidden flex justify-center">
              <button
                onClick={() => setShowTutorial(true)}
                className="glass-button orange-gradient hover:opacity-90 border border-orange-400/40 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Tutorial</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-auto">
        {isMobile ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 max-w-[380px] mx-auto w-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="grid grid-cols-6 gap-0 glass-card rounded-xl border border-emerald-500/40 p-2 max-w-[380px] mx-auto shadow-2xl shadow-emerald-500/20 bg-black/60">
                {gameState.gridPositions.map((position, index) => {
                  const row = Math.floor(index / 6);
                  const col = index % 6;
                  const isFirstColumn = col === 0;
                  const isTopRow = row === 0;
                  const total =
                    isFirstColumn && row > 0
                      ? calculateRowTotal(gameState.gridPositions, row)
                      : isTopRow && col > 0
                        ? calculateColumnTotal(gameState.gridPositions, col)
                        : 0;
                  const imageSrc =
                    isFirstColumn || isTopRow
                      ? getTotalSpaceImage(total)
                      : "/images/21-stackem-empty-space.png";
                  return illuminate(
                    <div
                      key={index}
                      className="grid-space relative w-[60px] h-[60px]"
                    >
                      <img
                        src={imageSrc}
                        alt="space"
                        className="w-full h-full object-contain"
                      />
                      {position && !isFirstColumn && !isTopRow && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <img
                              src="/images/21-stackem-card-tile.png"
                              alt="card"
                              className={`w-[55px] h-[55px] object-contain ${position.card.isSwapCard ? "filter drop-shadow-[0_0_6px_rgba(255,215,0,0.6)]" : position.card.isWildCard ? "filter drop-shadow-[0_0_6px_rgba(147,51,234,0.6)]" : ""}`}
                            />
                            {position.card.isSwapCard && (
                              <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full border border-yellow-300">
                                <div className="absolute inset-0.5 bg-yellow-300 rounded-full"></div>
                              </div>
                            )}
                            {position.card.isWildCard && (
                              <div className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full border border-purple-300">
                                <div className="absolute inset-0.5 bg-purple-300 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <span className="absolute text-xl font-bold">
                            {position.card.isWildCard
                              ? position.card.value
                              : position.card.rank}
                          </span>
                        </div>
                      )}
                      {(isFirstColumn || isTopRow) && total > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center -translate-x-[1px] -translate-y-[1px]">
                          <span
                            className={`text-xl font-bold ${isMobile ? getTextColorMobile(total) : getTextColorPC(total)} transition-colors duration-300`}
                          >
                            {total}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <DeckArea
                remainingCards={
                  gameState.deck.filter((card) => !card.isDealt).length
                }
                deckCycles={gameState.deckCycles}
                dealtCards={gameState.dealtCards}
                onDeckTap={dealCards}
                handleDragEnd={handleDragEnd}
                soundEnabled={soundEnabled}
                showTutorial={false}
              />
              {/* Controls matching header */}
              <div className="w-full flex justify-center px-4">
                <div className="w-full max-w-4xl mx-auto">
                  <div className="glass-card rounded-xl border border-orange-500/40 p-4 shadow-2xl shadow-orange-500/20 bg-black/80">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <motion.div
                        className="bg-slate-700/60 rounded-lg p-3 border border-orange-500/30 flex-1 min-w-[120px] shadow-lg hover:shadow-orange-500/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-center">
                          <h3 className="text-slate-300 text-sm font-medium mb-1">
                            Bankroll
                          </h3>
                          <div className="text-lg font-bold text-orange-300">
                            {gameState.chips.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                      <motion.button
                        whileHover={
                          !gameState.betsLocked ? { scale: 1.02 } : {}
                        }
                        whileTap={!gameState.betsLocked ? { scale: 0.98 } : {}}
                        onClick={
                          !gameState.betsLocked
                            ? () => setShowAntePopup(true)
                            : undefined
                        }
                        disabled={gameState.betsLocked}
                        className={`bg-slate-700/60 rounded-lg p-3 border border-orange-500/30 flex-1 min-w-[120px] shadow-lg hover:shadow-orange-500/20 transition-all duration-300 ${gameState.betsLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-600/40 hover:border-orange-400/50 cursor-pointer"}`}
                      >
                        <div className="text-center">
                          <h3 className="text-slate-300 text-sm font-medium mb-1">
                            Ante
                          </h3>
                          <div className="text-lg font-bold text-orange-300">
                            {gameState.ante}
                          </div>
                        </div>
                      </motion.button>
                      <motion.button
                        whileHover={
                          gameState.sessionWinnings > 0 ? { scale: 1.02 } : {}
                        }
                        whileTap={
                          gameState.sessionWinnings > 0 ? { scale: 0.98 } : {}
                        }
                        onClick={
                          gameState.sessionWinnings > 0
                            ? handleCollectWinnings
                            : undefined
                        }
                        disabled={gameState.sessionWinnings === 0}
                        className={`px-4 py-3 rounded-lg border transition-all duration-300 font-medium shadow-lg text-sm flex-1 min-w-[120px] ${gameState.sessionWinnings > 0 ? "bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/40 hover:border-orange-400/60 hover:shadow-orange-500/20 cursor-pointer" : "bg-slate-700/20 text-slate-500 border-slate-600/30 cursor-not-allowed opacity-50"}`}
                      >
                        Collect
                      </motion.button>
                      <motion.div
                        className="bg-slate-700/60 rounded-lg p-3 border border-orange-500/30 flex-1 min-w-[120px] shadow-lg hover:shadow-orange-500/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-center">
                          <h3 className="text-slate-300 text-sm font-medium mb-1">
                            Winnings
                          </h3>
                          <div
                            className={`text-lg font-bold ${gameState.sessionWinnings > 0 ? "text-orange-300" : "text-slate-400"}`}
                          >
                            {gameState.sessionWinnings > 0 ? "+" : ""}
                            {gameState.sessionWinnings.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 w-full">
            <div className="flex flex-col items-center space-y-4 mt-[45px] w-full max-w-4xl mx-auto">
              <div className="grid grid-cols-6 gap-0 glass-card rounded-xl border border-emerald-500/40 p-2 max-w-[380px] mx-auto shadow-2xl shadow-emerald-500/20 bg-black/60">
                {gameState.gridPositions.map((position, index) => {
                  const row = Math.floor(index / 6);
                  const col = index % 6;
                  const isFirstColumn = col === 0;
                  const isTopRow = row === 0;
                  const total =
                    isFirstColumn && row > 0
                      ? calculateRowTotal(gameState.gridPositions, row)
                      : isTopRow && col > 0
                        ? calculateColumnTotal(gameState.gridPositions, col)
                        : 0;
                  const imageSrc =
                    isFirstColumn || isTopRow
                      ? getTotalSpaceImage(total)
                      : "/images/21-stackem-empty-space.png";
                  return (
                    <div
                      key={index}
                      className="grid-space relative w-[60px] h-[60px]"
                    >
                      <img
                        src={imageSrc}
                        alt="space"
                        className="w-full h-full object-contain"
                      />
                      {position && !isFirstColumn && !isTopRow && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <img
                              src="/images/21-stackem-card-tile.png"
                              alt="card"
                              className={`w-[55px] h-[55px] object-contain ${position.card.isSwapCard ? "filter drop-shadow-[0_0_6px_rgba(255,215,0,0.6)]" : position.card.isWildCard ? "filter drop-shadow-[0_0_6px_rgba(147,51,234,0.6)]" : ""}`}
                            />
                            {position.card.isSwapCard && (
                              <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full border border-yellow-300">
                                <div className="absolute inset-0.5 bg-yellow-300 rounded-full"></div>
                              </div>
                            )}
                            {position.card.isWildCard && (
                              <div className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full border border-purple-300">
                                <div className="absolute inset-0.5 bg-purple-300 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <span className="absolute text-xl font-bold">
                            {position.card.isWildCard
                              ? position.card.value
                              : position.card.rank}
                          </span>
                        </div>
                      )}
                      {(isFirstColumn || isTopRow) && total > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center -translate-x-[1px] -translate-y-[1px]">
                          <span
                            className={`text-xl font-bold ${getTextColorPC(total)} transition-colors duration-300`}
                          >
                            {total}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <DeckArea
                remainingCards={
                  gameState.deck.filter((card) => !card.isDealt).length
                }
                deckCycles={gameState.deckCycles}
                dealtCards={gameState.dealtCards}
                onDeckTap={dealCards}
                handleDragEnd={handleDragEnd}
                soundEnabled={soundEnabled}
                showTutorial={false}
              />
              {/* Controls matching header */}
              <div className="w-full px-4">
                <div className="w-full max-w-4xl mx-auto">
                  <div className="glass-card rounded-xl border border-orange-500/40 p-4 shadow-2xl shadow-orange-500/20 bg-black/80">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <motion.div
                        className="bg-slate-700/60 rounded-lg p-3 border border-orange-500/30 flex-1 min-w-[120px] shadow-lg hover:shadow-orange-500/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-center">
                          <h3 className="text-slate-300 text-sm font-medium mb-1">
                            Bankroll
                          </h3>
                          <div className="text-lg font-bold text-orange-300">
                            {gameState.chips.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                      <motion.button
                        whileHover={
                          !gameState.betsLocked ? { scale: 1.02 } : {}
                        }
                        whileTap={!gameState.betsLocked ? { scale: 0.98 } : {}}
                        onClick={
                          !gameState.betsLocked
                            ? () => setShowAntePopup(true)
                            : undefined
                        }
                        disabled={gameState.betsLocked}
                        className={`bg-slate-700/60 rounded-lg p-3 border border-orange-500/30 flex-1 min-w-[120px] shadow-lg hover:shadow-orange-500/20 transition-all duration-300 ${gameState.betsLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-600/40 hover:border-orange-400/50 cursor-pointer"}`}
                      >
                        <div className="text-center">
                          <h3 className="text-slate-300 text-sm font-medium mb-1">
                            Ante
                          </h3>
                          <div className="text-lg font-bold text-orange-300">
                            {gameState.ante}
                          </div>
                        </div>
                      </motion.button>
                      <motion.button
                        whileHover={
                          gameState.sessionWinnings > 0 ? { scale: 1.02 } : {}
                        }
                        whileTap={
                          gameState.sessionWinnings > 0 ? { scale: 0.98 } : {}
                        }
                        onClick={
                          gameState.sessionWinnings > 0
                            ? handleCollectWinnings
                            : undefined
                        }
                        disabled={gameState.sessionWinnings === 0}
                        className={`px-4 py-3 rounded-lg border transition-all duration-300 font-medium shadow-lg text-sm flex-1 min-w-[120px] ${gameState.sessionWinnings > 0 ? "bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/40 hover:border-orange-400/60 hover:shadow-orange-500/20 cursor-pointer" : "bg-slate-700/20 text-slate-500 border-slate-600/30 cursor-not-allowed opacity-50"}`}
                      >
                        Collect
                      </motion.button>
                      <motion.div
                        className="bg-slate-700/60 rounded-lg p-3 border border-orange-500/30 flex-1 min-w-[120px] shadow-lg hover:shadow-orange-500/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-center">
                          <h3 className="text-slate-300 text-sm font-medium mb-1">
                            Winnings
                          </h3>
                          <div
                            className={`text-lg font-bold ${gameState.sessionWinnings > 0 ? "text-orange-300" : "text-slate-400"}`}
                          >
                            {gameState.sessionWinnings > 0 ? "+" : ""}
                            {gameState.sessionWinnings.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showTutorial && <HowToPlayPage onComplete={handleTutorialComplete} />}
        {showAntePopup && (
          <AntePopup
            selectedAnte={gameState.ante}
            onAnteSelect={setAnte}
            chips={gameState.chips}
            onClose={() => setShowAntePopup(false)}
            isOpen={showAntePopup}
          />
        )}
        {gameState.pendingAce && (
          <AceSelectionModal
            card={gameState.pendingAce.card}
            onSelect={handleAceSelection}
            onCancel={() =>
              setGameState((prev) => ({ ...prev, pendingAce: null }))
            }
          />
        )}
        {gameState.pendingWild && (
          <WildSelectionModal
            card={gameState.pendingWild.card}
            availableValues={gameState.pendingWild.availableValues}
            onSelect={handleWildSelection}
            onCancel={() =>
              setGameState((prev) => ({ ...prev, pendingWild: null }))
            }
          />
        )}
        {showGameOver && (
          <GameOverModal
            chips={gameState.chips}
            winnings={gameState.sessionWinnings}
            difficulty={gameState.difficulty}
            onPlayAgain={handlePlayAgain}
            onCancel={handleCancelGameOver}
            reason="collected"
          />
        )}
        {showEndGame && (
          <EndGameModal
            chips={gameState.chips}
            winnings={gameState.sessionWinnings}
            onConfirm={handleConfirmEndGame}
            onCancel={() => setShowEndGame(false)}
          />
        )}
        {gameState.showAnimation && (
          <ScoreAnimation
            show={gameState.showAnimation}
            message="Great!"
            type={gameState.animationType}
            onComplete={() =>
              setGameState((prev) => ({ ...prev, showAnimation: false }))
            }
          />
        )}
        {gameState.showXPAnimation && (
          <XPStarAnimation
            isVisible={gameState.showXPAnimation}
            startPosition={{
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            }}
            endPosition={{ x: 100, y: 100 }}
            onComplete={() =>
              setGameState((prev) => ({ ...prev, showXPAnimation: false }))
            }
            starCount={3}
          />
        )}
        {showCollectSuccessModal && (
          <CollectSuccessModal
            winnings={gameState.sessionWinnings}
            xpGained={gameState.sessionWinnings}
            onPlayAgain={handlePlayAgainFromModal}
            onCancel={handleCancelCollect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
