import { useState, useEffect, useRef } from "react";

interface MiniSlotMachineProps {
  onRollComplete: (dice1: number, dice2: number) => void;
  isVisible: boolean;
  disabled?: boolean;
}

export function MiniSlotMachine({
  onRollComplete,
  isVisible,
  disabled,
}: MiniSlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [slot1Values, setSlot1Values] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [slot2Values, setSlot2Values] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [finalValues, setFinalValues] = useState<[number, number]>([3, 4]);
  const slot1Ref = useRef<HTMLDivElement>(null);
  const slot2Ref = useRef<HTMLDivElement>(null);

  const generateSlotValues = () => {
    const values: number[] = [];
    for (let i = 0; i < 30; i++) {
      values.push(Math.floor(Math.random() * 6) + 1);
    }
    return values;
  };

  const handleRoll = () => {
    if (disabled || isSpinning) return;
    // PLAY DICE SOUND IMMEDIATELY WHEN CLICKED
    const diceSound = new Audio(`/games/pokeropoly/sound/dice-roll.mp3`);
    diceSound.volume = 0.5;
    diceSound.play().catch((e) => console.log("Dice sound failed:", e));
    setIsSpinning(true);

    const finalDice1 = Math.floor(Math.random() * 6) + 1;
    const finalDice2 = Math.floor(Math.random() * 6) + 1;

    const slot1 = generateSlotValues();
    slot1.push(finalDice1);
    const slot2 = generateSlotValues();
    slot2.push(finalDice2);

    setSlot1Values(slot1);
    setSlot2Values(slot2);

    if (slot1Ref.current) {
      slot1Ref.current.style.transition = "none";
      slot1Ref.current.style.transform = "translateY(0)";
    }
    if (slot2Ref.current) {
      slot2Ref.current.style.transition = "none";
      slot2Ref.current.style.transform = "translateY(0)";
    }

    setTimeout(() => {
      if (slot1Ref.current) {
        slot1Ref.current.style.transition =
          "transform 1.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
        slot1Ref.current.style.transform = `translateY(-${slot1.length * 60 - 60}px)`;
      }
    }, 50);

    setTimeout(() => {
      if (slot2Ref.current) {
        slot2Ref.current.style.transition =
          "transform 2.2s cubic-bezier(0.25, 0.1, 0.25, 1)";
        slot2Ref.current.style.transform = `translateY(-${slot2.length * 60 - 60}px)`;
      }
    }, 100);

    setTimeout(() => {
      setIsSpinning(false);
      setFinalValues([finalDice1, finalDice2]);
      setTimeout(() => {
        onRollComplete(finalDice1, finalDice2);
      }, 400);
    }, 2400);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-yellow-500 shadow-xl">
      <div className="flex gap-3 items-center justify-center mb-3">
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg overflow-hidden border-2 border-yellow-400 shadow-lg">
          <div className="h-[60px] w-[60px] overflow-hidden relative">
            <div ref={slot1Ref} className="absolute top-0 left-0 w-full">
              {slot1Values.map((value, index) => (
                <div
                  key={index}
                  className="h-[60px] w-[60px] flex items-center justify-center text-3xl font-bold text-white"
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-white text-2xl font-bold">+</div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg overflow-hidden border-2 border-yellow-400 shadow-lg">
          <div className="h-[60px] w-[60px] overflow-hidden relative">
            <div ref={slot2Ref} className="absolute top-0 left-0 w-full">
              {slot2Values.map((value, index) => (
                <div
                  key={index}
                  className="h-[60px] w-[60px] flex items-center justify-center text-3xl font-bold text-white"
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleRoll}
        disabled={disabled || isSpinning}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSpinning ? "Rolling..." : "🎲 Roll"}
      </button>

      {!isSpinning && finalValues[0] === finalValues[1] && (
        <div className="text-yellow-400 text-xs font-bold text-center mt-2">
          🎉 Doubles! Roll Again! 🎉
        </div>
      )}
    </div>
  );
}
