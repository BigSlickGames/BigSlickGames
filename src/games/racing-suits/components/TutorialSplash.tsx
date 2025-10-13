import React, { useState, useEffect } from "react";
import {
  Heart,
  Diamond,
  Club,
  Spade,
  Zap,
  Coins,
  TrendingUp,
  ChevronRight,
  X,
  Play,
  Target,
} from "lucide-react";

interface TutorialSplashProps {
  onComplete: () => void;
}

type Suit = "hearts" | "diamonds" | "clubs" | "spades";

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

const getSuitButtonColor = (suit: Suit) => {
  switch (suit) {
    case "hearts":
      return "bg-red-600/80 border-red-500/50";
    case "diamonds":
      return "bg-blue-600/80 border-blue-500/50";
    case "clubs":
      return "bg-green-600/80 border-green-500/50";
    case "spades":
      return "bg-black/80 border-gray-600/50";
  }
};

const getSuitCircleColor = (suit: Suit) => {
  switch (suit) {
    case "hearts":
      return "bg-red-600";
    case "diamonds":
      return "bg-blue-600";
    case "clubs":
      return "bg-green-600";
    case "spades":
      return "bg-black";
  }
};

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Racing Suits!",
    subtitle: "The ultimate card racing game",
    content:
      "Watch as four suits race to the finish line. Each card drawn moves that suit forward one space. First to reach the finish wins!",
    showDemo: false,
  },
  {
    title: "Live Betting System",
    subtitle: "Bet on any suit during the race",
    content:
      "Place bets on any suit at any time during the race. Odds change based on each suit's position - suits further behind offer better payouts!",
    showDemo: true,
    demoType: "betting",
  },
  {
    title: "Dynamic Odds",
    subtitle: "Risk vs Reward",
    content:
      "Suits closer to winning have lower odds (safer bets), while suits further behind have higher odds (riskier but more rewarding).",
    showDemo: true,
    demoType: "odds",
  },
  {
    title: "Race Track",
    subtitle: "Follow the action",
    content:
      "Watch the colored circles move along the track as cards are drawn. Each suit has its own lane and moves toward the finish line.",
    showDemo: true,
    demoType: "track",
  },
  {
    title: "Ready to Race?",
    subtitle: "Start your first game",
    content:
      "You start with 1,000 chips. Place your bets, flip cards, and watch the excitement unfold. Good luck!",
    showDemo: false,
  },
];

export default function TutorialSplash({ onComplete }: TutorialSplashProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoPositions, setDemoPositions] = useState<Record<Suit, number>>({
    hearts: 1,
    diamonds: 3,
    clubs: 0,
    spades: 2,
  });

  const currentTutorial = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const calculateDemoOdds = (suit: Suit): number => {
    const position = demoPositions[suit];
    const baseOdds = 4.0;
    const positionMultiplier = (6 - position) / 6;
    const finalOdds = baseOdds * positionMultiplier;
    return Math.max(1.2, Math.min(4.0, Math.round(finalOdds * 10) / 10));
  };

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const skipTutorial = () => {
    onComplete();
  };

  const renderDemoContent = () => {
    if (!currentTutorial.showDemo) return null;

    switch (currentTutorial.demoType) {
      case "betting":
        return (
          <div className="glass-card rounded-xl p-4 mb-6">
            <h4 className="text-white font-bold mb-3 text-center">
              Live Betting Panel
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(["hearts", "diamonds", "clubs", "spades"] as Suit[]).map(
                (suit) => (
                  <div
                    key={suit}
                    className={`p-3 rounded-lg border ${getSuitButtonColor(
                      suit
                    )} cursor-pointer hover:opacity-80 transition-all`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {getSuitIcon(suit, "w-5 h-5")}
                      <div className="text-orange-400 font-bold text-sm">
                        {calculateDemoOdds(suit).toFixed(1)}x
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="text-center mt-3 text-white/70 text-sm">
              Click any suit to place a live bet!
            </div>
          </div>
        );

      case "odds":
        return (
          <div className="glass-card rounded-xl p-4 mb-6">
            <h4 className="text-white font-bold mb-3 text-center">
              Current Odds
            </h4>
            <div className="space-y-2">
              {(["hearts", "diamonds", "clubs", "spades"] as Suit[]).map(
                (suit) => {
                  const position = demoPositions[suit];
                  const odds = calculateDemoOdds(suit);
                  return (
                    <div
                      key={suit}
                      className="flex items-center justify-between bg-black/40 rounded-lg p-2"
                    >
                      <div className="flex items-center gap-2">
                        {getSuitIcon(suit, "w-4 h-4")}
                        <span className="text-white capitalize">{suit}</span>
                        <span className="text-white/60 text-sm">
                          Position: {position}/6
                        </span>
                      </div>
                      <div className="text-orange-400 font-bold">
                        {odds.toFixed(1)}x
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        );

      case "track":
        return (
          <div className="glass-card rounded-xl p-4 mb-6">
            <h4 className="text-white font-bold mb-3 text-center">
              Race Track
            </h4>
            <div className="space-y-2">
              {(["hearts", "diamonds", "clubs", "spades"] as Suit[]).map(
                (suit) => {
                  const position = demoPositions[suit];
                  const TRACK_POSITIONS_LEFT = [8.33, 20, 32, 44, 56, 68, 80];

                  return (
                    <div key={suit} className="relative">
                      <div className="relative h-8 rounded-full glass-card border border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/10 to-yellow-400/20 rounded-full"></div>

                        <div className="absolute inset-0 flex items-center justify-between px-2">
                          {[0, 1, 2, 3, 4, 5, 6].map((marker) => (
                            <div
                              key={marker}
                              className="flex flex-col items-center"
                            >
                              <div
                                className={`w-0.5 h-4 rounded-full ${
                                  marker === 0
                                    ? "bg-green-400"
                                    : marker === 6
                                    ? "bg-yellow-400"
                                    : "bg-white/40"
                                }`}
                              ></div>
                            </div>
                          ))}
                        </div>

                        <div
                          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500"
                          style={{ left: `${TRACK_POSITIONS_LEFT[position]}%` }}
                        >
                          <div
                            className={`w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${getSuitCircleColor(
                              suit
                            )}`}
                          >
                            {getSuitIcon(suit, "w-3 h-3")}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 orange-gradient rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Racing Suits</h1>
                <div className="flex items-center gap-2">
                  {TUTORIAL_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? "bg-orange-400"
                          : index < currentStep
                          ? "bg-orange-400/60"
                          : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={skipTutorial}
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-blue-500/20 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-white font-bold text-2xl mb-2">
              {currentTutorial.title}
            </h2>
            <p className="text-orange-400 font-semibold mb-4">
              {currentTutorial.subtitle}
            </p>
            <p className="text-white/80 leading-relaxed">
              {currentTutorial.content}
            </p>
          </div>

          {/* Demo Content */}
          {renderDemoContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={skipTutorial}
              className="text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Skip Tutorial
            </button>

            <button
              onClick={nextStep}
              className="glass-button orange-gradient hover:opacity-90 border border-orange-400/40
                       text-white font-bold py-2 px-6 rounded-lg
                       transition-all duration-300 shadow-lg hover:shadow-orange-500/30
                       flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  <Play className="w-4 h-4" />
                  Start Playing
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Step indicator */}
          <div className="text-center mt-4 text-white/40 text-sm">
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </div>
        </div>
      </div>
    </div>
  );
}
