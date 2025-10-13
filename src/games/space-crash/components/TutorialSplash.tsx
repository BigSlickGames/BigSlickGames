import React, { useState, useEffect } from "react";
import {
  Rocket,
  Coins,
  ChevronRight,
  X,
  Play,
  Target,
  DollarSign,
  Zap,
} from "lucide-react";

interface TutorialSplashProps {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Space Crash!",
    subtitle: "Blast off and beat the crash",
    content:
      "Space Crash is an adrenaline-packed rocket game. Watch your rocket climb as the multiplier increases — cash out before it explodes!",
    showDemo: false,
  },
  {
    title: "Placing Your Bet",
    subtitle: "Choose your stake wisely",
    content:
      "Set your bet amount in chips and decide your auto cash-out multiplier. The higher the risk, the bigger the potential reward!",
    showDemo: true,
    demoType: "betting",
  },
  {
    title: "Rocket Launch",
    subtitle: "Multiplier is climbing",
    content:
      "Once you launch, the rocket’s multiplier rises. Every second counts — your winnings grow until it crashes!",
    showDemo: true,
    demoType: "multiplier",
  },
  {
    title: "Crash Point",
    subtitle: "Not every rocket makes it",
    content:
      "Each round ends at a random crash point. If the rocket crashes before you cash out, you lose your bet.",
    showDemo: true,
    demoType: "crashpoint",
  },
  {
    title: "Cash Out in Time!",
    subtitle: "Lock in your profit",
    content:
      "Click cash out before the crash to secure your winnings — your bet × current multiplier. Wait too long, and you’ll lose it all!",
    showDemo: true,
    demoType: "cashout",
  },
  {
    title: "Ready to Fly?",
    subtitle: "Start your first round",
    content:
      "You’re all set! Use your starting 1,000 chips, make your bet, and blast off. Aim high, but don’t get greedy — the crash is unpredictable!",
    showDemo: false,
  },
];

export default function TutorialSplash({ onComplete }: TutorialSplashProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoMultiplier, setDemoMultiplier] = useState(1.0);
  const [isCrashed, setIsCrashed] = useState(false);

  const currentTutorial = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  useEffect(() => {
    if (currentTutorial.demoType === "multiplier") {
      const interval = setInterval(() => {
        setDemoMultiplier((prev) => Math.min(prev + 0.05, 5.0));
      }, 200);
      return () => clearInterval(interval);
    } else if (currentTutorial.demoType === "crashpoint") {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        if (progress >= 1.8) {
          setIsCrashed(true);
          clearInterval(interval);
        } else {
          setDemoMultiplier(progress + 1);
        }
      }, 250);
      return () => clearInterval(interval);
    } else {
      setIsCrashed(false);
      setDemoMultiplier(1.0);
    }
  }, [currentStep]);

  const nextStep = () => {
    if (isLastStep) onComplete();
    else {
      setCurrentStep((prev) => prev + 1);
      setDemoMultiplier(1.0);
      setIsCrashed(false);
    }
  };

  const skipTutorial = () => onComplete();

  const renderDemoContent = () => {
    if (!currentTutorial.showDemo) return null;

    switch (currentTutorial.demoType) {
      case "betting":
        return (
          <div className="glass-card rounded-xl p-4 mb-6">
            <h4 className="text-white font-bold mb-3 text-center">
              Betting Setup
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Bet Amount:</span>
                <span className="text-white font-bold">10 chips</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #ff6b35 0%, #ff6b35 20%, #1a1a1a 20%, #1a1a1a 100%)",
                }}
                disabled
              />
              <div className="flex items-center justify-between">
                <span className="text-white/70">Auto Cash Out:</span>
                <span className="text-white font-bold">2.00x</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value="2"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #ff6b35 0%, #ff6b35 20%, #1a1a1a 20%, #1a1a1a 100%)",
                }}
                disabled
              />
              <button
                className="w-full glass-button orange-gradient text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                disabled
              >
                <Zap className="w-4 h-4" />
                Launch Rocket
              </button>
            </div>
          </div>
        );

      case "multiplier":
        return (
          <div className="glass-card rounded-xl p-4 mb-6">
            <h4 className="text-white font-bold mb-3 text-center">
              Rocket Climbing
            </h4>
            <div className="flex flex-col items-center">
              <Rocket
                className="w-12 h-12 text-orange-400 mb-2 transition-transform"
                style={{
                  transform: `translateY(-${(demoMultiplier - 1) * 15}%)`,
                }}
              />
              <span className="text-white font-bold text-2xl mt-2">
                {demoMultiplier.toFixed(2)}x
              </span>
            </div>
          </div>
        );

      case "crashpoint":
        return (
          <div className="glass-card rounded-xl p-4 mb-6 relative">
            <h4 className="text-white font-bold mb-3 text-center">
              Crash in Progress
            </h4>
            <div className="flex flex-col items-center relative h-24 justify-center">
              {isCrashed ? (
                <div className="text-red-500 font-bold text-xl animate-pulse">
                  💥 CRASHED!
                </div>
              ) : (
                <>
                  <Rocket
                    className="w-12 h-12 text-orange-400 transition-transform"
                    style={{
                      transform: `translateY(-${(demoMultiplier - 1) * 15}%)`,
                    }}
                  />
                  <span className="text-white font-bold text-xl mt-2">
                    {demoMultiplier.toFixed(2)}x
                  </span>
                </>
              )}
            </div>
          </div>
        );

      case "cashout":
        return (
          <div className="glass-card rounded-xl p-4 mb-6">
            <h4 className="text-white font-bold mb-3 text-center">
              Cash Out Example
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-black/40 rounded-lg p-2">
                <span className="text-white/70">Current Multiplier:</span>
                <span className="text-orange-400 font-bold">2.50x</span>
              </div>
              <button
                className="w-full glass-button bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
                disabled
              >
                Cash Out @ 2.50x
              </button>
              <div className="text-center text-white/70 text-sm">
                Winnings: 25 chips (10 × 2.5)
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10"></div>

        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 orange-gradient rounded-full flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Space Crash</h1>
                <div className="flex items-center gap-2 mt-1">
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
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-orange-500/20 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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

          {renderDemoContent()}

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

          <div className="text-center mt-4 text-white/40 text-sm">
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </div>
        </div>
      </div>
    </div>
  );
}
