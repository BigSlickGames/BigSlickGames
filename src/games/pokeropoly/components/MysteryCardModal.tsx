import { useState } from 'react';
import { MysteryCard } from './mysteryCardData';

interface MysteryCardModalProps {
  card: MysteryCard;
  onClose: (result: { correct?: boolean; reward: number; penalty: number; action?: string }) => void;
}

export function MysteryCardModal({ card, onClose }: MysteryCardModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === card.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleContinue = () => {
    if (card.type === 'question') {
      onClose({
        correct: isCorrect,
        reward: isCorrect ? card.reward : 0,
        penalty: isCorrect ? 0 : card.penalty
      });
    } else {
      onClose({
        reward: card.reward,
        penalty: card.penalty,
        action: card.action_type
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Hand Rankings': 'from-blue-500 to-blue-700',
      'Poker Terms': 'from-purple-500 to-purple-700',
      'Card Values': 'from-green-500 to-green-700',
      'Poker Strategy': 'from-orange-500 to-orange-700',
      'Movement': 'from-cyan-500 to-cyan-700',
      'Chips': 'from-yellow-500 to-yellow-700',
      'Special': 'from-pink-500 to-pink-700',
      'Probability': 'from-red-500 to-red-700',
      'Poker History': 'from-indigo-500 to-indigo-700',
      'Poker Variants': 'from-teal-500 to-teal-700',
      'Card Combinations': 'from-lime-500 to-lime-700',
      'Poker Etiquette': 'from-rose-500 to-rose-700',
      'Tournament Play': 'from-amber-500 to-amber-700',
      'Poker Math': 'from-emerald-500 to-emerald-700',
      'Poker Rules': 'from-violet-500 to-violet-700'
    };
    return colors[category] || 'from-gray-500 to-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border-4 border-yellow-500/50 relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getCategoryColor(card.category)}`}></div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-yellow-400 text-2xl font-black mb-2">
                MYSTERY CARD
              </div>
              <div className="flex gap-3 items-center">
                <span className={`text-sm font-bold uppercase tracking-wider ${getDifficultyColor(card.difficulty)}`}>
                  {card.difficulty}
                </span>
                <span className="text-white/60 text-sm">•</span>
                <span className="text-white/80 text-sm font-medium">
                  {card.category}
                </span>
              </div>
            </div>
            {card.type === 'question' && (
              <div className="text-right">
                <div className="text-green-400 text-sm font-bold">+{card.reward}</div>
                <div className="text-red-400 text-sm font-bold">-{card.penalty}</div>
              </div>
            )}
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-white/10">
            <p className="text-white text-xl font-medium leading-relaxed">
              {card.content}
            </p>
          </div>

          {card.type === 'question' && card.options && (
            <div className="space-y-3 mb-6">
              {card.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = showResult && option === card.correct_answer;
                const isWrongAnswer = showResult && isSelected && !isCorrectAnswer;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all font-medium ${
                      isCorrectAnswer
                        ? 'bg-green-500/20 border-green-400 text-green-100'
                        : isWrongAnswer
                        ? 'bg-red-500/20 border-red-400 text-red-100'
                        : isSelected
                        ? 'bg-blue-500/20 border-blue-400 text-white'
                        : 'bg-slate-700/50 border-slate-600 text-white/80 hover:bg-slate-600/50 hover:border-slate-500'
                    } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {isCorrectAnswer && <span className="text-green-400 font-bold">✓</span>}
                      {isWrongAnswer && <span className="text-red-400 font-bold">✗</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {showResult && card.type === 'question' && (
            <div className={`mb-6 p-4 rounded-lg ${isCorrect ? 'bg-green-500/20 border-2 border-green-400' : 'bg-red-500/20 border-2 border-red-400'}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? 'CORRECT!' : 'INCORRECT!'}
                </div>
                <div className="text-white text-lg">
                  {isCorrect ? `+${card.reward} chips` : `-${card.penalty} chips`}
                </div>
              </div>
            </div>
          )}

          {card.type === 'action' && (
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400">
              <div className="text-center">
                {card.reward > 0 && (
                  <div className="text-green-400 text-xl font-bold mb-1">
                    +{card.reward} chips
                  </div>
                )}
                {card.penalty > 0 && (
                  <div className="text-red-400 text-xl font-bold mb-1">
                    -{card.penalty} chips
                  </div>
                )}
                {card.reward === 0 && card.penalty === 0 && (
                  <div className="text-yellow-400 text-lg font-bold">
                    Special Action!
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {card.type === 'question' && !showResult && (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                  selectedAnswer
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            )}
            {(card.type === 'action' || showResult) && (
              <button
                onClick={handleContinue}
                className="flex-1 py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all shadow-xl"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
