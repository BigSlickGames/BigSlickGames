import { useState, useEffect, useRef } from 'react';

interface SlotMachineProps {
  onRollComplete: (dice1: number, dice2: number) => void;
  isVisible: boolean;
}

export function SlotMachine({ onRollComplete, isVisible }: SlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [slot1Values, setSlot1Values] = useState<number[]>([]);
  const [slot2Values, setSlot2Values] = useState<number[]>([]);
  const [finalValues, setFinalValues] = useState<[number, number]>([1, 1]);
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
      slot1Ref.current.style.transition = 'none';
      slot1Ref.current.style.transform = 'translateY(0)';
    }
    if (slot2Ref.current) {
      slot2Ref.current.style.transition = 'none';
      slot2Ref.current.style.transform = 'translateY(0)';
    }

    setTimeout(() => {
      if (slot1Ref.current) {
        slot1Ref.current.style.transition = 'transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)';
        slot1Ref.current.style.transform = `translateY(-${slot1.length * 100 - 100}px)`;
      }
    }, 50);

    setTimeout(() => {
      if (slot2Ref.current) {
        slot2Ref.current.style.transition = 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
        slot2Ref.current.style.transform = `translateY(-${slot2.length * 100 - 100}px)`;
      }
    }, 100);

    setTimeout(() => {
      setIsSpinning(false);
      setFinalValues([finalDice1, finalDice2]);
      setTimeout(() => {
        onRollComplete(finalDice1, finalDice2);
      }, 500);
    }, 2600);
  };

  useEffect(() => {
    if (isVisible) {
      handleRoll();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-yellow-600">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          🎰 Roll the Dice!
        </h2>

        <div className="flex gap-8 items-center justify-center mb-6">
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
            <div className="h-[100px] w-[100px] overflow-hidden relative">
              <div
                ref={slot1Ref}
                className="absolute top-0 left-0 w-full"
              >
                {slot1Values.map((value, index) => (
                  <div
                    key={index}
                    className="h-[100px] w-[100px] flex items-center justify-center text-6xl font-bold text-white"
                  >
                    {value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-white text-5xl font-bold">+</div>

          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
            <div className="h-[100px] w-[100px] overflow-hidden relative">
              <div
                ref={slot2Ref}
                className="absolute top-0 left-0 w-full"
              >
                {slot2Values.map((value, index) => (
                  <div
                    key={index}
                    className="h-[100px] w-[100px] flex items-center justify-center text-6xl font-bold text-white"
                  >
                    {value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!isSpinning && (
          <div className="text-center">
            <div className="text-white text-2xl font-bold mb-2">
              Total: {finalValues[0] + finalValues[1]}
            </div>
            {finalValues[0] === finalValues[1] && (
              <div className="text-yellow-400 text-xl font-bold">
                🎉 Doubles! Roll Again! 🎉
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
