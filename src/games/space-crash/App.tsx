import React, { useState, useCallback, useEffect, useRef } from "react";
import { Coins, Zap, BookOpen, DollarSign } from "lucide-react";
import { supabase } from "../../lib/supabase";
import MissionsPage from "./components/MissionsPage";
import TutorialSplash from "./components/TutorialSplash";

type LiveBet = {
  id: string;
  amount: number;
  multiplier: number;
  timestamp: number;
};

const generateCrashPoint = () => {
  const rand = Math.random();

  if (rand < 0.5) {
    return 1.1 + Math.random() * 0.9;
  } else if (rand < 0.8) {
    return 2 + Math.random() * 3;
  } else if (rand < 0.95) {
    return 5 + Math.random() * 5;
  } else {
    return 10 + Math.random() * 40;
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
  const [betAmount, setBetAmount] = useState(5);
  const [autoCashOut, setAutoCashOut] = useState(1.0);
  const [autoCashOutEnabled, setAutoCashOutEnabled] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<"win" | "loss" | null>(null);
  const [winnings, setWinnings] = useState(0);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const crashPointRef = useRef<number | null>(null);
  const [showCrash, setShowCrash] = useState(false);
  const [rocketTrail, setRocketTrail] = useState<{ x: number; y: number }[]>(
    []
  );

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
      const hasSeenTutorial = prefs?.game_stats?.crash_tutorial_seen;
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
        .eq("user_id", userId)
        .single();
      if (currentWallet) {
        const newGamesPlayed = (currentWallet.games_played || 0) + 1;
        const newGamesWon = won
          ? (currentWallet.games_won || 0) + 1
          : currentWallet.games_won;
        const gamesWonByType = currentWallet.games_won_by_type || {};
        if (won) {
          gamesWonByType.crash = (gamesWonByType.crash || 0) + 1;
        }
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
        .eq("user_id", userId)
        .single();
      const gameStats = currentPrefs?.game_stats || {};
      gameStats.crash_tutorial_seen = true;
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

  const startGame = () => {
    if (chipBalance < betAmount || betAmount <= 0 || isGameRunning) {
      console.log("Start game blocked", {
        chipBalance,
        betAmount,
        isGameRunning,
      });
      return;
    }

    console.log("Starting game with bet:", betAmount);
    const newBalance = chipBalance - betAmount;
    setChipBalance(newBalance);
    updateChipsInDB(newBalance);
    setLiveBets((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        amount: betAmount,
        multiplier: 0,
        timestamp: Date.now(),
      },
    ]);
    setHasCashedOut(false);
    setGameResult(null);
    setWinnings(0);
    setShowCrash(false);
    setRocketTrail([]);
    const newCrashPoint = generateCrashPoint();

    setCrashPoint(newCrashPoint);
    crashPointRef.current = newCrashPoint;
    setCurrentMultiplier(1.0);
    startTimeRef.current = Date.now();
    setIsGameRunning(true);
    console.log("Game started", {
      crashPoint: newCrashPoint,
      isGameRunning: true,
    });
  };

  const animate = () => {
    if (!startTimeRef.current || !crashPointRef.current || !isGameRunning) {
      console.log("Animation stopped: Invalid state", {
        startTime: startTimeRef.current,
        crashPoint: crashPointRef.current,
        isGameRunning,
      });
      return;
    }

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const newMultiplier = Math.min(
      1 + Math.pow(elapsed * 0.25, 1.3),
      crashPointRef.current
    );

    console.log({
      newMultiplier: newMultiplier.toFixed(2),
      autoCashOut: autoCashOut.toFixed(2),
      hasCashedOut,
      isGameRunning,
      condition:
        newMultiplier >= autoCashOut - 0.01 && !hasCashedOut && isGameRunning,
    });

    setCurrentMultiplier(newMultiplier);

    // Add trail effect
    const maxTime = 30;
    const timeProgress = Math.min(elapsed / maxTime, 1);
    const rocketX = timeProgress * 100;
    const normalizedMult = Math.max(0, newMultiplier - 1);
    const rocketY = Math.pow(normalizedMult / 9, 0.6) * 85;

    setRocketTrail((trail) => [
      ...trail.slice(-15),
      { x: rocketX, y: rocketY },
    ]);

    // Auto cash-out check (prioritized)
    if (
      autoCashOutEnabled &&
      newMultiplier >= autoCashOut - 0.01 &&
      !hasCashedOut &&
      isGameRunning
    ) {
      console.log("Triggering auto cash-out", { newMultiplier, autoCashOut });
      handleCashOut();
      return; // Exit animation loop immediately
    }

    // Crash check (only if not cashed out)
    if (newMultiplier >= crashPointRef.current && !hasCashedOut) {
      setIsGameRunning(false);
      setShowCrash(true);

      document.body.classList.add("screen-shake");
      setTimeout(() => document.body.classList.remove("screen-shake"), 500);

      setTimeout(() => setShowCrash(false), 1000);
      setHistory((prev) => [crashPointRef.current!, ...prev.slice(0, 9)]);
      setGameResult("loss");
      updateGameStats(false);
    } else if (!hasCashedOut) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Start animation when isGameRunning becomes true
  useEffect(() => {
    if (isGameRunning) {
      console.log("useEffect: Starting animation loop");
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        console.log("useEffect: Cleaning up animation loop");
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isGameRunning]);

  const handleCashOut = () => {
    console.log("handleCashOut called", {
      currentMultiplier,
      hasCashedOut,
      isGameRunning,
    });
    if (!isGameRunning || hasCashedOut) {
      console.log("Cash out blocked: Game not running or already cashed out", {
        isGameRunning,
        hasCashedOut,
      });
      return;
    }

    setHasCashedOut(true);
    setIsGameRunning(false); // Stop game immediately
    const winAmount = Math.floor(betAmount * currentMultiplier);
    const newBalance = chipBalance + winAmount;
    setChipBalance(newBalance);
    updateChipsInDB(newBalance);
    setWinnings(winAmount);
    setGameResult("win");
    setLiveBets((prev) =>
      prev.map((bet) =>
        bet.id === liveBets[liveBets.length - 1].id
          ? { ...bet, multiplier: currentMultiplier }
          : bet
      )
    );
    updateGameStats(true);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    console.log("Cash out completed", {
      winAmount,
      newBalance,
      gameResult: "win",
    });
  };

  const resetGame = async () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsGameRunning(false);
    setHasCashedOut(false);
    setCrashPoint(null);
    crashPointRef.current = null;
    setGameResult(null);
    setCurrentMultiplier(1.0);
    setShowCrash(false);
    setRocketTrail([]);
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
  };

  // Calculate rocket position
  const maxTime = 30;
  const elapsed =
    isGameRunning && startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : 0;
  const timeProgress = Math.min(elapsed / maxTime, 1);
  const rocketX = timeProgress * 100;
  const normalizedMult = Math.max(0, currentMultiplier - 1);
  const rocketY = Math.pow(normalizedMult / 9, 0.6) * 85;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Crash...</div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes narrowFume {
            0% { 
              transform: translateY(0) scaleY(1);
              opacity: 0.8;
            }
            100% { 
              transform: translateY(40px) scaleY(2);
              opacity: 0;
            }
          }
          @keyframes screenShake {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(-5px, 2px); }
            50% { transform: translate(4px, -3px); }
            75% { transform: translate(-3px, 4px); }
          }
          @keyframes explosion {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
          }
          @keyframes rocketWobble {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(2deg); }
            75% { transform: rotate(-2deg); }
          }
          .screen-shake {
            animation: screenShake 0.5s ease-in-out;
          }
          .narrow-fume {
            position: absolute;
            width: 6px;
            height: 20px;
            background: linear-gradient(to bottom, rgba(255,107,53,0.9) 0%, rgba(251,146,60,0.6) 40%, transparent 100%);
            border-radius: 3px;
            animation: narrowFume 0.5s ease-out infinite;
            pointer-events: none;
          }
          .star {
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            opacity: 0.3;
          }
          .crash-explosion {
            position: absolute;
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, #ff6b35 0%, #fb923c 30%, transparent 70%);
            border-radius: 50%;
            animation: explosion 0.6s ease-out;
          }
        `}
      </style>
      {showTutorial && <TutorialSplash onComplete={handleTutorialComplete} />}
      {showMissions && <MissionsPage onClose={() => setShowMissions(false)} />}
      <div
        className="min-h-screen bg-black p-4 relative overflow-hidden"
        style={{
          backgroundImage:
            'url("/games/crash/images/backgrounds/background.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-orange-600/20 to-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-400/15 to-yellow-500/15 rounded-full blur-3xl"></div>

        {/* Parallax stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* HEADER */}
          <div className="glass-card rounded-xl p-3 mb-4 shadow-xl border border-orange-500/20 bg-black/80">
            <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full bg-black/50">
                  <Coins className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-bold text-sm">
                    {chipBalance.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="glass-button orange-gradient hover:opacity-90 border border-orange-400/40 text-white font-semibold p-2 rounded-lg transition-all duration-300"
                  title="Tutorial"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* MAIN GAME AREA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LEFT: BETTING CONTROLS */}
            <div className="glass-card rounded-xl p-4 shadow-xl bg-black/60 border border-orange-500/30">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-3">
                  Crash Betting
                </h3>
                <div className="mb-3">
                  <label className="block text-white/70 text-sm mb-2">
                    Bet Amount:{" "}
                    <span className="text-white font-bold">
                      {betAmount} chips
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${
                        ((betAmount - 1) / 49) * 100
                      }%, #1a1a1a ${
                        ((betAmount - 1) / 49) * 100
                      }%, #1a1a1a 100%)`,
                    }}
                    disabled={isGameRunning}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-white/70 text-sm mb-2">
                    Auto Cash Out:{" "}
                    <span className="text-white font-bold">
                      {autoCashOut.toFixed(2)}x
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={autoCashOut}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value);
                      console.log("Auto Cash Out set to:", newValue);
                      setAutoCashOut(newValue);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${
                        ((autoCashOut - 1) / 9) * 100
                      }%, #1a1a1a ${
                        ((autoCashOut - 1) / 9) * 100
                      }%, #1a1a1a 100%)`,
                    }}
                    disabled={isGameRunning || !autoCashOutEnabled}
                  />
                </div>
                <div className="mb-3 flex items-center justify-between glass-card p-3 rounded-lg bg-black/40 border border-orange-500/20">
                  <span className="text-white/70 text-sm">
                    Enable Auto Cash Out
                  </span>
                  <button
                    onClick={() => setAutoCashOutEnabled(!autoCashOutEnabled)}
                    disabled={isGameRunning}
                    className={`relative inline-flex h-1 w-11 items-center rounded-sm transition-colors ${
                      autoCashOutEnabled ? "bg-orange-500" : "bg-gray-600"
                    } ${
                      isGameRunning
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`inline-block h-7 w-4 transform rounded-sm bg-white transition-transform ${
                        autoCashOutEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {!isGameRunning && (
                  <button
                    onClick={startGame}
                    disabled={chipBalance < betAmount || betAmount <= 0}
                    className="w-full glass-button orange-gradient hover:opacity-90 border border-orange-400/40 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 inline mr-2" />
                    Launch Rocket
                  </button>
                )}
                {isGameRunning && !hasCashedOut && (
                  <button
                    onClick={handleCashOut}
                    className="w-full glass-button bg-green-600 hover:bg-green-700 border border-green-400/40 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/30"
                  >
                    Cash Out @ {currentMultiplier.toFixed(2)}x
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: ROCKET AND MULTIPLIER */}
            <div className="md:col-span-2 glass-card rounded-xl p-4 shadow-xl bg-black/60 border border-orange-500/30 relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                {/* Multiplier Display - Top Center */}
                <div className="mb-2">
                  <span
                    className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 text-5xl tracking-widest drop-shadow-lg"
                    style={{
                      transform: isGameRunning ? "scale(1.05)" : "scale(1)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    {currentMultiplier.toFixed(2)}x
                  </span>
                </div>

                <div className="relative w-full h-80">
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      y1="100"
                      x2="100"
                      y2="100"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="0.5"
                    />
                  </svg>

                  {/* Rocket trail */}
                  {rocketTrail.map((pos, index) => (
                    <div
                      key={index}
                      className="absolute rounded-full"
                      style={{
                        left: `${pos.x}%`,
                        bottom: `${pos.y}%`,
                        width: 6,
                        height: 6,
                        backgroundColor: "rgba(255,107,53,0.5)",
                        opacity: 0.8 - (index / rocketTrail.length) * 0.8,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                  ))}

                  {/* Glow aura behind rocket */}
                  {isGameRunning && (
                    <div
                      className="absolute w-20 h-20 rounded-full blur-2xl"
                      style={{
                        left: `calc(${rocketX}% - 40px)`,
                        bottom: `calc(${rocketY}% - 40px)`,
                        background: `radial-gradient(circle, rgba(255,107,53,0.6) 0%, rgba(255,107,53,0) 70%)`,
                        opacity: 0.8,
                      }}
                    />
                  )}

                  {/* Narrow fumes from bottom of rocket - 20px gap */}
                  {isGameRunning && (
                    <>
                      {/* Left fume */}
                      <div
                        className="narrow-fume"
                        style={{
                          left: `calc(${rocketX}% - 0px)`,
                          bottom: `calc(${rocketY}% - 2px)`,
                          animationDelay: "0s",
                        }}
                      />
                      <div
                        className="narrow-fume"
                        style={{
                          left: `calc(${rocketX}% - 0px)`,
                          bottom: `calc(${rocketY}% - 2px)`,
                          animationDelay: "0.25s",
                        }}
                      />

                      {/* Right fume - 20px away from left */}
                      <div
                        className="narrow-fume"
                        style={{
                          left: `calc(${rocketX}% - -35px)`,
                          bottom: `calc(${rocketY}% - 2px)`,
                          animationDelay: "0.1s",
                        }}
                      />
                      <div
                        className="narrow-fume"
                        style={{
                          left: `calc(${rocketX}% - -35px)`,
                          bottom: `calc(${rocketY}% - 2px)`,
                          animationDelay: "0.35s",
                        }}
                      />
                    </>
                  )}

                  {/* Crash explosion */}
                  {showCrash && (
                    <div
                      className="crash-explosion"
                      style={{
                        left: `calc(${rocketX}% - 40px)`,
                        bottom: `calc(${rocketY}% - 40px)`,
                      }}
                    />
                  )}

                  {/* Rocket - rises straight up with better positioning */}
                  <img
                    src="/games/space-crash/images/image.png"
                    alt="Rocket"
                    className={`w-16 h-16 absolute ${
                      showCrash ? "hidden" : ""
                    }`}
                    style={{
                      left: `calc(${rocketX}% - 10px)`,
                      bottom: `calc(${Math.min(rocketY + 5, 90)}%)`,
                      transform: `rotate(0deg) scale(${
                        1 + Math.min(currentMultiplier - 1, 3) * 0.1
                      })`,
                      filter: isGameRunning
                        ? "drop-shadow(0 0 12px rgba(255, 107, 53, 0.8))"
                        : "none",
                      transition: "none",
                      animation: isGameRunning
                        ? "rocketWobble 1s ease-in-out infinite"
                        : "none",
                    }}
                  />
                </div>

                <div className="mt-4 text-center">
                  <div className="w-64 h-2 bg-gray-800 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all"
                      style={{
                        width: `${timeProgress * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Live Bets and History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Live Bets Queue */}
            <div className="glass-card rounded-xl p-4 shadow-xl bg-black/60 border border-orange-500/30">
              <h4 className="text-lg font-bold text-white mb-3">Live Bets</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-transparent">
                {liveBets.length === 0 ? (
                  <div className="text-center text-white/50 py-8">
                    No active bets
                  </div>
                ) : (
                  liveBets
                    .slice()
                    .reverse()
                    .map((bet) => (
                      <div
                        key={bet.id}
                        className="flex items-center justify-between rounded-lg p-3 bg-black/40 border border-orange-500/20 hover:border-orange-500/40 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                          <DollarSign className="w-5 h-5 text-orange-400" />
                          <span className="text-white font-semibold">
                            {bet.amount} chips
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold text-sm ${
                              bet.multiplier > 0
                                ? "text-green-400"
                                : "text-orange-400"
                            }`}
                          >
                            {bet.multiplier > 0
                              ? `Cashed @ ${bet.multiplier.toFixed(2)}x`
                              : "Crashed"}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* History */}
            <div className="glass-card rounded-xl p-4 shadow-xl bg-black/60 border border-orange-500/30">
              <h4 className="text-lg font-bold text-white mb-3">
                Crash History
              </h4>
              <div className="flex flex-wrap gap-2">
                {history.length === 0 ? (
                  <div className="text-center text-white/50 py-8 w-full">
                    No history yet
                  </div>
                ) : (
                  history.map((h, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                        h >= 2
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : h >= 1.5
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {h.toFixed(2)}x
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameResult && !isGameRunning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="dark-card rounded-2xl p-4 max-w-sm w-full shadow-2xl relative overflow-hidden orange-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-yellow-500/10"></div>
            <div className="relative z-10">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-5xl"></span>
                  <h2 className="text-white font-bold text-2xl">
                    {gameResult === "win" ? "Cashed Out!" : "Crashed!"}
                  </h2>
                  <span className="text-5xl">
                    {gameResult === "win" ? "💰" : "💥"}
                  </span>
                </div>
              </div>
              <div className="space-y-3 mb-4 max-h-[60vh] overflow-y-auto">
                <div className="bg-black/40 rounded-lg p-3">
                  <h3 className="text-white font-bold mb-3 text-center">
                    Round Summary
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70">Bet Amount:</span>
                    <span className="text-white font-bold">
                      {betAmount} chips
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70">Crash Point:</span>
                    <span className="text-white font-bold">
                      {crashPoint?.toFixed(2)}x
                    </span>
                  </div>
                  {gameResult === "win" && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-400">Cashed at:</span>
                      <span className="text-green-400 font-bold">
                        {currentMultiplier.toFixed(2)}x
                      </span>
                    </div>
                  )}
                  <div className="border-t border-orange-500/20 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">Net Result:</span>
                      <span
                        className={`font-bold text-lg ${
                          gameResult === "win"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {gameResult === "win" ? "+" : "-"}
                        {gameResult === "win" ? winnings : betAmount} chips
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={resetGame}
                className="w-full glass-button orange-gradient hover:opacity-90 border border-orange-400/40 text-white font-bold py-3 px-4 rounded-lg text-base transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
              >
                Start New Round
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
