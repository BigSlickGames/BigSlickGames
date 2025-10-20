import React, { useState } from "react";
import {
  Coins,
  Flame,
  Calendar,
  Trophy,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DailyRewardsPanelProps {
  onClaim: (day: number, reward: number) => void;
  currentStreak: number;
  longestStreak: number;
  lastClaimDate: string | null;
}

const DAILY_REWARDS = [
  { day: 1, reward: 100, icon: "" },
  { day: 2, reward: 200, icon: "" },
  { day: 3, reward: 300, icon: "" },
  { day: 4, reward: 500, icon: "" },
  { day: 5, reward: 700, icon: "" },
  { day: 6, reward: 900, icon: "" },
  { day: 7, reward: 1500, icon: "" },
];

export default function DailyRewardsPanel({
  onClaim,
  currentStreak,
  longestStreak,
  lastClaimDate,
}: DailyRewardsPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "rewards"
  );

  const today = new Date().toDateString();
  const lastClaim = lastClaimDate
    ? new Date(lastClaimDate).toDateString()
    : null;
  const canClaim = lastClaim !== today;

  // Calculate next day to claim
  const nextDay = canClaim ? (currentStreak % 7) + 1 : currentStreak;
  const todayReward = DAILY_REWARDS[nextDay - 1];

  const handleClaim = () => {
    if (!canClaim) return;

    setIsAnimating(true);
    setShowConfetti(true);

    setTimeout(() => {
      onClaim(nextDay, todayReward.reward);
      setIsAnimating(false);
    }, 1000);

    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl shadow-xl shadow-orange-500/10 overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            >
              {["🎉", "⭐", "💎", "🎁"][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      {/* Header with Glass Effect */}
      <div className="relative h-20 bg-gradient-to-r from-orange-600/20 via-orange-700/15 to-orange-500/20 backdrop-blur-xl border-b border-orange-500/30">
        <div className="absolute inset-0 bg-gradient-to-r from-white/3 via-white/8 to-white/3"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
              <h3 className="text-xl font-bold text-white drop-shadow-lg">
                Daily Login Streak
              </h3>
            </div>
            <p className="text-gray-300 text-xs">Keep your streak alive!</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 relative z-10">
        {/* Streak Stats - Always Visible */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/40 rounded-lg p-3 text-center backdrop-blur-sm">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
            <div className="text-2xl font-bold text-white mb-1">
              {currentStreak}
            </div>
            <div className="text-xs text-gray-300">Current</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-lg p-3 text-center backdrop-blur-sm">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <div className="text-2xl font-bold text-white mb-1">
              {longestStreak}
            </div>
            <div className="text-xs text-gray-300">Longest</div>
          </div>
        </div>

        {/* 7-Day Calendar with Compact Overlay */}
        <div className="bg-black/20 rounded-lg border border-gray-700/50 relative">
          <button
            onClick={() =>
              setExpandedSection(
                expandedSection === "calendar" ? null : "calendar"
              )
            }
            className="w-full flex items-center justify-between p-2 hover:bg-white/5 transition-colors rounded-lg"
          >
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-white font-semibold text-xs">
                7-Day Calendar
              </span>
            </div>
            {expandedSection === "calendar" ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Compact Overlay */}
          {expandedSection === "calendar" && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-lg p-3 w-[85%] max-w-[500px] max-h-[70vh] overflow-y-auto relative animate-fade-in">
                {/* Close Button */}
                <button
                  onClick={() => setExpandedSection(null)}
                  className="absolute top-0 right-2 text-gray-400 hover:text-white transition text-sm font-bold"
                >
                  ✕
                </button>

                <h3 className="text-center text-white text-sm font-bold mb-2">
                  🗓️ Daily Rewards
                </h3>

                <div className="space-y-1">
                  {DAILY_REWARDS.map((reward) => {
                    const isClaimed = reward.day < nextDay;
                    const isToday = reward.day === nextDay && canClaim;

                    return (
                      <div
                        key={reward.day}
                        className={`flex items-center justify-between rounded-md p-2 border transition-all duration-300 ${
                          isClaimed
                            ? "bg-green-600/10 border-green-500/30"
                            : isToday
                              ? "bg-orange-600/20 border-orange-500/30 shadow-sm shadow-orange-500/20"
                              : "bg-gray-800/30 border-gray-700/30"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-6 h-6 flex items-center justify-center rounded-md font-bold ${
                              isClaimed
                                ? "bg-green-500/20 text-green-400"
                                : isToday
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-gray-700/30 text-gray-300"
                            }`}
                          >
                            {reward.day}
                          </div>
                          <div>
                            <p className="text-white text-xs font-semibold">
                              Day {reward.day}
                            </p>
                            <p
                              className={`text-[10px] ${
                                isClaimed
                                  ? "text-green-300"
                                  : isToday
                                    ? "text-orange-400"
                                    : "text-gray-400"
                              }`}
                            >
                              {isClaimed
                                ? "Claimed"
                                : isToday
                                  ? "Today"
                                  : "Upcoming"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-yellow-400 text-xs font-semibold">
                          <Coins className="w-3 h-3 mr-1" />
                          {reward.reward}
                        </div>

                        {isClaimed && (
                          <div className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full flex items-center justify-center border border-gray-900">
                            <span className="text-white text-[8px]">✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-center text-gray-400 text-[10px] mt-2">
                  Log in daily to reach Day 7 for the{" "}
                  <span className="text-yellow-400 font-semibold">
                    Grand Reward!
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Today's Reward or Already Claimed */}
        {canClaim ? (
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/40 rounded-lg p-4 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
            <div className="relative z-10">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-yellow-400 animate-pulse" />
              <h4 className="text-white font-bold text-sm mb-2">
                Day {nextDay} Reward
              </h4>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Coins className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-yellow-400">
                  {todayReward.reward.toLocaleString()}
                </span>
              </div>
              <p className="text-yellow-300 font-semibold text-xs">
                Free Chips!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-green-500/50">
              <span className="text-2xl">✓</span>
            </div>
            <h4 className="text-white font-bold text-sm mb-1">
              Already Claimed!
            </h4>
            <p className="text-gray-400 text-xs">
              Come back tomorrow for Day {(currentStreak % 7) + 1}
            </p>
          </div>
        )}

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={!canClaim || isAnimating}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all transform shadow-lg relative overflow-hidden ${
            canClaim && !isAnimating
              ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:scale-[1.02] active:scale-[0.98] shadow-orange-500/30"
              : "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
          <span className="relative z-10">
            {isAnimating ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Claiming...</span>
              </span>
            ) : canClaim ? (
              <>🎁 Claim {todayReward.reward} Chips</>
            ) : (
              "Already Claimed Today"
            )}
          </span>
        </button>

        <p className="text-gray-400 text-xs text-center">
          {canClaim
            ? `Claim to continue your ${currentStreak}-day streak!`
            : "Your streak continues tomorrow!"}
        </p>
      </div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
