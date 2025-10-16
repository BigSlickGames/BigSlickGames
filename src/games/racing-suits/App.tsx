import React, { useState, useCallback, useEffect } from "react";
import {
  Heart,
  Diamond,
  Club,
  Spade,
  User,
  Coins,
  Zap,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import MissionsPage from "./components/MissionsPage";
import TutorialSplash from "./components/TutorialSplash";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Card = { suit: Suit; value: string };
type LiveBet = {
  id: string;
  suit: Suit;
  amount: number;
  odds: number;
  timestamp: number;
};

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const TRACK_POSITIONS_LEFT = [5, 21.5, 35.5, 49.75, 64.2, 78.5, 95];
const TRACK_POSITIONS_MOBILE = [8, 25, 37, 49.5, 62, 74, 90];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const getSuitIcon = (suit: Suit, className?: string) => {
  switch (suit) {
    case "hearts":
      return <Heart className={`${className} text-white fill-white`} />;
    case "diamonds":
      return <Diamond className={`${className} text-white fill-white`} />;
    case "clubs":
      return <Club className={`${className} text-white fill-white`} />;
    case "spades":
      return <Spade className={`${className} text-white fill-white`} />;
  }
};

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("Player");
  const [loading, setLoading] = useState(true);
  const [chipBalance, setChipBalance] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerExperience, setPlayerExperience] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [positions, setPositions] = useState<Record<Suit, number>>({
    hearts: 0,
    diamonds: 0,
    clubs: 0,
    spades: 0,
  });
  const [deck, setDeck] = useState<Card[]>(() => createDeck());
  const [flippedCard, setFlippedCard] = useState<Card | null>(null);
  const [gameWon, setGameWon] = useState<Suit | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentBets, setCurrentBets] = useState<Record<Suit, number>>({
    hearts: 0,
    diamonds: 0,
    clubs: 0,
    spades: 0,
  });
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [liveBetAmount, setLiveBetAmount] = useState(5);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found, redirecting to hub");
        window.location.href = "/";
        return;
      }
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (profile) setPlayerName(profile.username);
      const { data: wallet } = await supabase
        .from("user_wallet")
        .select("chips, level, experience")
        .eq("user_id", user.id)
        .single();
      if (wallet) {
        setChipBalance(wallet.chips);
        setPlayerLevel(wallet.level);
        setPlayerExperience(wallet.experience);
      }
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("game_stats")
        .eq("user_id", user.id)
        .single();
      const hasSeenTutorial = prefs?.game_stats?.racing_suits_tutorial_seen;
      setShowTutorial(!hasSeenTutorial);
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

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
        .eq("user_id", user.id)
        .single();
      if (currentWallet) {
        const newGamesPlayed = (currentWallet.games_played || 0) + 1;
        const newGamesWon = won
          ? (currentWallet.games_won || 0) + 1
          : currentWallet.games_won;
        const gamesWonByType = currentWallet.games_won_by_type || {};
        if (won) {
          gamesWonByType.racing_suits = (gamesWonByType.racing_suits || 0) + 1;
        }
        await supabase
          .from("user_wallet")
          .update({
            games_played: newGamesPlayed,
            games_won: newGamesWon,
            games_won_by_type: gamesWonByType,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
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
      gameStats.racing_suits_tutorial_seen = true;
      await supabase
        .from("user_preferences")
        .update({
          game_stats: gameStats,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      setShowTutorial(false);
    } catch (error) {
      console.error("Error updating tutorial status:", error);
      setShowTutorial(false);
    }
  };

  const gameInProgress =
    Object.values(currentBets).some((bet) => bet > 0) || liveBets.length > 0;

  const calculateOdds = (suit: Suit): number => {
    const position = positions[suit];
    const baseOdds = 4.0;
    const positionMultiplier = (6 - position) / 6;
    const finalOdds = baseOdds * positionMultiplier;
    return Math.max(1.2, Math.min(4.0, Math.round(finalOdds * 10) / 10));
  };

  const handleLiveBet = (suit: Suit) => {
    if (chipBalance < liveBetAmount || gameWon) return;
    const odds = calculateOdds(suit);
    const newBet: LiveBet = {
      id: Date.now().toString(),
      suit,
      amount: liveBetAmount,
      odds,
      timestamp: Date.now(),
    };
    setLiveBets((prev) => [newBet, ...prev]);
    const newBalance = chipBalance - liveBetAmount;
    setChipBalance(newBalance);
    updateChipsInDB(newBalance);
  };

  const calculateLiveBetWinnings = (): number => {
    if (!gameWon) return 0;
    return liveBets
      .filter((bet) => bet.suit === gameWon)
      .reduce((total, bet) => total + bet.amount * bet.odds, 0);
  };

  const flipCard = useCallback(() => {
    if (deck.length === 0 || gameWon || isFlipping || !gameInProgress) return;
    setIsFlipping(true);
    setTimeout(() => {
      const newCard = deck[0];
      const newDeck = deck.slice(1);
      setFlippedCard(newCard);
      setDeck(newDeck);
      setPositions((prev) => {
        const newPositions = { ...prev };
        newPositions[newCard.suit] += 1;
        if (newPositions[newCard.suit] >= 6) {
          setGameWon(newCard.suit);
          let totalWinnings = 0;
          const winningBet = currentBets[newCard.suit];
          if (winningBet > 0) {
            const totalReturn = winningBet * 4;
            totalWinnings += totalReturn;
          }
          const liveBetWinnings = liveBets
            .filter((bet) => bet.suit === newCard.suit)
            .reduce((total, bet) => total + bet.amount * bet.odds, 0);
          if (liveBetWinnings > 0) {
            totalWinnings += liveBetWinnings;
          }
          if (totalWinnings > 0) {
            const newBalance = chipBalance + totalWinnings;
            setChipBalance(newBalance);
            updateChipsInDB(newBalance);
          }
          const playerWon = winningBet > 0 || liveBetWinnings > 0;
          updateGameStats(playerWon);
        }
        return newPositions;
      });
      setIsFlipping(false);
    }, 600);
  }, [
    deck,
    gameWon,
    isFlipping,
    gameInProgress,
    currentBets,
    liveBets,
    chipBalance,
    userId,
  ]);

  const resetGame = async () => {
    if (gameInProgress) {
      const newExperience = playerExperience + 10;
      let newLevel = playerLevel;
      let newBalance = chipBalance;
      if (Math.floor(newExperience / 1000) > playerLevel - 1) {
        newLevel = playerLevel + 1;
        newBalance = chipBalance + 500;
        setChipBalance(newBalance);
        await updateChipsInDB(newBalance);
      }
      setPlayerExperience(newExperience);
      await updateProgressInDB(newLevel, newExperience);
    }
    setPositions({ hearts: 0, diamonds: 0, clubs: 0, spades: 0 });
    setDeck(createDeck());
    setFlippedCard(null);
    setGameWon(null);
    setIsFlipping(false);
    setCurrentBets({ hearts: 0, diamonds: 0, clubs: 0, spades: 0 });
    setLiveBets([]);
  };

  const handlePlaceBet = (suit: Suit, amount: number) => {
    if (amount <= chipBalance && amount > 0) {
      setCurrentBets((prev) => ({
        ...prev,
        [suit]: prev[suit] + amount,
      }));
      const newBalance = chipBalance - amount;
      setChipBalance(newBalance);
      updateChipsInDB(newBalance);
    }
  };

  const renderTrack = (suit: Suit) => {
    const position = positions[suit];
    const hasBet = currentBets[suit] > 0;

    return (
      <div key={suit} className="flex flex-col mb-1.5 relative z-10">
        <div className="flex-1 relative">
          {hasBet && (
            <div className="absolute -top-6 left-2 px-2 py-0.5 glass-card rounded-full z-10">
              <span className="text-xs text-yellow-400 font-bold">
                {currentBets[suit]} chips
              </span>
            </div>
          )}
          <div
            className={`relative h-10 rounded-full glass-card shadow-inner
            ${
              hasBet
                ? "border-2 border-yellow-400/50 bg-yellow-400/5"
                : "border border-white/20"
            }
          `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/10 to-yellow-400/20 rounded-full"></div>

            <div className="absolute inset-0 flex items-center justify-between px-3">
              {[0, 1, 2, 3, 4, 5, 6].map((marker) => (
                <div key={marker} className="flex flex-col items-center">
                  <div
                    className={`w-0.5 h-4 rounded-full ${
                      marker === 0
                        ? "bg-green-400"
                        : marker === 6
                          ? "bg-yellow-400"
                          : "bg-white/40"
                    }`}
                  ></div>
                  <span className="text-xs text-white/60 mt-0.5 font-medium">
                    {marker === 0 ? "START" : marker === 6 ? "FINISH" : marker}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="absolute top-1/2 transition-all duration-500 ease-out"
              style={{
                left: `${(isMobile ? TRACK_POSITIONS_MOBILE : TRACK_POSITIONS_LEFT)[position]}%`,
                transform: `translate(-50%, -50%) ${
                  gameWon === suit ? "scale(1.3)" : "scale(1)"
                }`,
              }}
            >
              <div
                className={`w-6 h-6 rounded-full shadow-lg flex items-center justify-center
                ${
                  gameWon === suit
                    ? "animate-bounce bg-yellow-400/90"
                    : suit === "hearts"
                      ? "bg-red-600"
                      : suit === "diamonds"
                        ? "bg-blue-600"
                        : suit === "clubs"
                          ? "bg-green-600"
                          : "bg-black"
                }
              `}
              >
                {getSuitIcon(suit, "w-3 h-3")}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Racing Suits...</div>
      </div>
    );
  }

  return (
    <>
      {showTutorial && <TutorialSplash onComplete={handleTutorialComplete} />}
      {showMissions && <MissionsPage onClose={() => setShowMissions(false)} />}
      <div
        className="min-h-screen bg-black p-4 pb-32 relative overflow-hidden"
        style={{
          backgroundImage:
            'url("/games/racing-suits/images/backgrounds/background.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-orange-600/20 to-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-400/15 to-yellow-500/15 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto relative z-10 pb-20">
          {/* MOBILE-OPTIMIZED HEADER */}

          <div className="glass-card rounded-xl p-3 mb-4 shadow-xl border border-orange-500/20 bg-black/80">
            {/* Main header row */}
            <div className="flex items-center justify-between relative mb-3 sm:mb-0">
              {/* Left: Avatar with XP Ring + User Info */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => (window.location.href = "/")}
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
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        45 *
                        (1 - (playerExperience % 1000) / 1000)
                      }`}
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

              {/* Center: Tutorial Button (Desktop only) */}
              <div className="hidden sm:flex absolute left-1/2 transform -translate-x-1/2">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="glass-button orange-gradient hover:opacity-90 border border-orange-400/40 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Tutorial</span>
                </button>
              </div>

              {/* Right: Chips */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full bg-black/50">
                  <Coins className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-bold text-sm">
                    {chipBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Tutorial Button Row - Centered below */}
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

          <div className="w-full max-w-4xl mx-auto">
            <div className="glass-card rounded-xl p-4 shadow-xl relative overflow-hidden bg-black/60 border border-orange-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>{" "}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Live Betting</h3>
                  <div className="text-sm text-white/60">
                    Cards left: {deck.length}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-white/70 text-sm mb-2 text-center">
                    Bet Amount:{" "}
                    <span className="text-white font-bold">
                      {liveBetAmount}
                    </span>{" "}
                    chips
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={liveBetAmount}
                    onChange={(e) => setLiveBetAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${
                        (liveBetAmount / 50) * 100
                      }%, #1a1a1a ${
                        (liveBetAmount / 50) * 100
                      }%, #1a1a1a 100%)`,
                    }}
                  />
                </div>
                <div
                  className="bg-black/80 rounded-lg p-2 mb-2 border border-orange-500/20"
                  id="suit-icons-container"
                >
                  <div className="grid grid-cols-4 gap-2">
                    {SUITS.map((suit) => (
                      <button
                        key={suit}
                        onClick={() => handleLiveBet(suit)}
                        disabled={chipBalance < liveBetAmount || gameWon}
                        className={`${
                          suit === "hearts"
                            ? "bg-red-600/80 hover:bg-red-600 border-red-500/50"
                            : suit === "diamonds"
                              ? "bg-blue-600/80 hover:bg-blue-600 border-blue-500/50"
                              : suit === "clubs"
                                ? "bg-green-600/80 hover:bg-green-600 border-green-500/50"
                                : "bg-black/80 hover:bg-black border-gray-600/50"
                        } border text-white font-bold py-2 px-2 rounded text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1`}
                      >
                        {getSuitIcon(suit, "w-5 h-5")}
                        <div className="text-orange-400 font-bold text-xs">
                          {calculateOdds(suit).toFixed(1)}x
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                {liveBets.length > 0 && (
                  <div className="border-t border-orange-500/20 pt-3 mt-3">
                    <h4 className="text-sm font-bold text-white mb-2">
                      Your Live Bets
                    </h4>
                    <div className="space-y-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-transparent">
                      {liveBets.map((bet) => (
                        <div
                          key={bet.id}
                          className={`flex items-center justify-between rounded-lg p-1.5 ${
                            bet.suit === "hearts"
                              ? "bg-red-600/20 border-red-500/30"
                              : bet.suit === "diamonds"
                                ? "bg-blue-600/20 border-blue-500/30"
                                : bet.suit === "clubs"
                                  ? "bg-green-600/20 border-green-500/30"
                                  : "bg-black/40 border-gray-600/30"
                          } border`}
                        >
                          <div className="flex items-center gap-2">
                            {getSuitIcon(bet.suit, "w-4 h-4")}
                            <span className="text-white text-sm capitalize">
                              {bet.suit}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white/70 text-sm">
                              {bet.amount} chips
                            </span>
                            <span className="text-orange-400 font-bold text-sm">
                              {bet.odds.toFixed(1)}x
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-orange-500/20 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">
                          Total Wagered:
                        </span>
                        <span className="text-white font-bold">
                          {liveBets.reduce((sum, bet) => sum + bet.amount, 0)}{" "}
                          chips
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameWon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="dark-card rounded-2xl p-4 max-w-sm w-full shadow-2xl relative overflow-hidden orange-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-yellow-500/10"></div>
            <div className="relative z-10">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  {getSuitIcon(gameWon, "w-8 h-8")}
                  <h2 className="text-white font-bold text-2xl">
                    {gameWon.charAt(0).toUpperCase() + gameWon.slice(1)} Wins!
                  </h2>
                  {getSuitIcon(gameWon, "w-8 h-8")}
                </div>
              </div>
              <div className="space-y-3 mb-4 max-h-[60vh] overflow-y-auto">
                <div className="bg-black/40 rounded-lg p-3">
                  <h3 className="text-white font-bold mb-3 text-center">
                    Race Summary
                  </h3>
                  {liveBets.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-white/80 font-semibold mb-2 text-sm">
                        Your Live Bets:
                      </h4>
                      <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-gray-800/50 pr-2">
                        {liveBets.map((bet) => (
                          <div
                            key={bet.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {bet.suit === gameWon ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <X className="w-3 h-3 text-red-400" />
                              )}
                              {getSuitIcon(bet.suit, "w-3 h-3")}
                              <span className="text-white/70 capitalize">
                                {bet.suit}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white/60">
                                {bet.amount} chips
                              </span>
                              <span className="text-orange-400 text-xs">
                                {bet.odds.toFixed(1)}x
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70">Total Wagered:</span>
                    <span className="text-white font-bold">
                      {Object.values(currentBets).reduce(
                        (sum, bet) => sum + bet,
                        0
                      ) +
                        liveBets.reduce((sum, bet) => sum + bet.amount, 0)}{" "}
                      chips
                    </span>
                  </div>
                  {currentBets[gameWon] > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-400">Pre-race bet win:</span>
                      <span className="text-green-400 font-bold">
                        +{currentBets[gameWon] * 4} chips
                      </span>
                    </div>
                  )}
                  {calculateLiveBetWinnings() > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-400">Live bets win:</span>
                      <span className="text-orange-400 font-bold">
                        +{Math.round(calculateLiveBetWinnings())} chips
                      </span>
                    </div>
                  )}
                  <div className="border-t border-orange-500/20 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">Net Result:</span>
                      <span
                        className={`font-bold text-lg ${
                          currentBets[gameWon] * 4 +
                            calculateLiveBetWinnings() >
                          Object.values(currentBets).reduce(
                            (sum, bet) => sum + bet,
                            0
                          ) +
                            liveBets.reduce((sum, bet) => sum + bet.amount, 0)
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {currentBets[gameWon] * 4 + calculateLiveBetWinnings() >
                        Object.values(currentBets).reduce(
                          (sum, bet) => sum + bet,
                          0
                        ) +
                          liveBets.reduce((sum, bet) => sum + bet.amount, 0)
                          ? "+"
                          : ""}
                        {Math.round(
                          currentBets[gameWon] * 4 +
                            calculateLiveBetWinnings() -
                            (Object.values(currentBets).reduce(
                              (sum, bet) => sum + bet,
                              0
                            ) +
                              liveBets.reduce(
                                (sum, bet) => sum + bet.amount,
                                0
                              ))
                        )}{" "}
                        chips
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={resetGame}
                className="w-full glass-button orange-gradient hover:opacity-90 border border-orange-400/40 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
              >
                Start New Race
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-2 left-0 right-0 z-40 flex flex-col items-center gap-2 px-4">
        {flippedCard && (
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-32 h-44 lg:w-48 lg:h-66 rounded-lg border-2 shadow-xl flex items-center justify-center ${
                flippedCard.suit === "hearts"
                  ? "bg-red-600 border-red-400"
                  : flippedCard.suit === "diamonds"
                    ? "bg-blue-600 border-blue-400"
                    : flippedCard.suit === "clubs"
                      ? "bg-green-600 border-green-400"
                      : "bg-black border-gray-400"
              }`}
            >
              {getSuitIcon(flippedCard.suit, "w-16 h-16 lg:w-24 lg:h-24")}
            </div>
          </div>
        )}
        <div className="w-full max-w-2xl mx-auto space-y-4">
          <div className="glass-card rounded-xl p-2 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black-400/5 to-transparent pointer-events-none"></div>
            {SUITS.map((suit) => renderTrack(suit))}
          </div>
          {!gameWon && (
            <button
              onClick={flipCard}
              disabled={isFlipping || !gameInProgress}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600
                       text-white font-bold py-4 px-8 rounded-xl text-lg
                       transition-all duration-300 shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-105"
            >
              <Zap className="w-6 h-6" />
              {isFlipping ? "Flipping..." : "Flip Card"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
