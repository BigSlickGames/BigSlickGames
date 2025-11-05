import React, { useState } from 'react';
import { X, Plus, Minus, DollarSign, CreditCard } from 'lucide-react';
import type { Card, Player } from './TradeTypes';

interface TradeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  targetPlayer: Player;
  onSubmitTrade: (
    offerCards: Card[],
    offerMoney: number,
    requestCards: Card[],
    requestMoney: number
  ) => Promise<void>;
}

export function TradeOfferModal({
  isOpen,
  onClose,
  currentPlayer,
  targetPlayer,
  onSubmitTrade,
}: TradeOfferModalProps) {
  const [selectedOfferCards, setSelectedOfferCards] = useState<Card[]>([]);
  const [offerMoney, setOfferMoney] = useState(0);
  const [selectedRequestCards, setSelectedRequestCards] = useState<Card[]>([]);
  const [requestMoney, setRequestMoney] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleOfferCard = (card: Card) => {
    setSelectedOfferCards(prev => {
      const exists = prev.find(c => c.suit === card.suit && c.value === card.value);
      if (exists) {
        return prev.filter(c => !(c.suit === card.suit && c.value === card.value));
      }
      return [...prev, card];
    });
  };

  const toggleRequestCard = (card: Card) => {
    setSelectedRequestCards(prev => {
      const exists = prev.find(c => c.suit === card.suit && c.value === card.value);
      if (exists) {
        return prev.filter(c => !(c.suit === card.suit && c.value === card.value));
      }
      return [...prev, card];
    });
  };

  const handleSubmit = async () => {
    if (selectedOfferCards.length === 0 && offerMoney === 0) {
      alert('You must offer at least one card or some money');
      return;
    }

    if (selectedRequestCards.length === 0 && requestMoney === 0) {
      alert('You must request at least one card or some money');
      return;
    }

    if (offerMoney > currentPlayer.chips) {
      alert('You cannot offer more money than you have');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitTrade(selectedOfferCards, offerMoney, selectedRequestCards, requestMoney);
      setSelectedOfferCards([]);
      setOfferMoney(0);
      setSelectedRequestCards([]);
      setRequestMoney(0);
      onClose();
    } catch (error) {
      console.error('Failed to submit trade:', error);
      alert('Failed to submit trade. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCardDisplay = (card: Card) => {
    const suitSymbols: Record<string, string> = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
    };
    return `${card.value}${suitSymbols[card.suit] || ''}`;
  };

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-900';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Trade with {targetPlayer.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentPlayer.color }}></span>
                Your Offer
              </h3>

              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Money</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOfferMoney(Math.max(0, offerMoney - 100))}
                      className="p-1 bg-white rounded hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-bold text-gray-900 min-w-[80px] text-center">
                      ${offerMoney}
                    </span>
                    <button
                      onClick={() => setOfferMoney(Math.min(currentPlayer.chips, offerMoney + 100))}
                      className="p-1 bg-white rounded hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Your Cards</span>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {currentPlayer.cards.length === 0 ? (
                      <p className="col-span-3 text-sm text-gray-500 text-center py-4">No cards available</p>
                    ) : (
                      currentPlayer.cards.map((card, idx) => {
                        const isSelected = selectedOfferCards.some(
                          c => c.suit === card.suit && c.value === card.value
                        );
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleOfferCard(card)}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-100 shadow-md'
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <div className={`text-xl font-bold ${getSuitColor(card.suit)}`}>
                              {getCardDisplay(card)}
                            </div>
                            {card.price && (
                              <div className="text-xs text-gray-600">${card.price}</div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Cards Selected:</span>
                    <span className="font-semibold">{selectedOfferCards.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Chips:</span>
                    <span className="font-semibold">${currentPlayer.chips}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: targetPlayer.color }}></span>
                Request from {targetPlayer.name}
              </h3>

              <div className="bg-green-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Money</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRequestMoney(Math.max(0, requestMoney - 100))}
                      className="p-1 bg-white rounded hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-bold text-gray-900 min-w-[80px] text-center">
                      ${requestMoney}
                    </span>
                    <button
                      onClick={() => setRequestMoney(Math.min(targetPlayer.chips, requestMoney + 100))}
                      className="p-1 bg-white rounded hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Their Cards</span>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {targetPlayer.cards.length === 0 ? (
                      <p className="col-span-3 text-sm text-gray-500 text-center py-4">No cards available</p>
                    ) : (
                      targetPlayer.cards.map((card, idx) => {
                        const isSelected = selectedRequestCards.some(
                          c => c.suit === card.suit && c.value === card.value
                        );
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleRequestCard(card)}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-green-500 bg-green-100 shadow-md'
                                : 'border-gray-200 bg-white hover:border-green-300'
                            }`}
                          >
                            <div className={`text-xl font-bold ${getSuitColor(card.suit)}`}>
                              {getCardDisplay(card)}
                            </div>
                            {card.price && (
                              <div className="text-xs text-gray-600">${card.price}</div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Cards Requested:</span>
                    <span className="font-semibold">{selectedRequestCards.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Their Chips:</span>
                    <span className="font-semibold">${targetPlayer.chips}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Trade Summary</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-1">You Give:</p>
                  <ul className="space-y-1 text-gray-600">
                    {offerMoney > 0 && <li className="flex items-center gap-1"><DollarSign size={14} />${offerMoney}</li>}
                    {selectedOfferCards.length > 0 && (
                      <li className="flex items-center gap-1">
                        <CreditCard size={14} />
                        {selectedOfferCards.length} card{selectedOfferCards.length !== 1 ? 's' : ''}
                      </li>
                    )}
                    {offerMoney === 0 && selectedOfferCards.length === 0 && (
                      <li className="text-gray-400">Nothing selected</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">You Receive:</p>
                  <ul className="space-y-1 text-gray-600">
                    {requestMoney > 0 && <li className="flex items-center gap-1"><DollarSign size={14} />${requestMoney}</li>}
                    {selectedRequestCards.length > 0 && (
                      <li className="flex items-center gap-1">
                        <CreditCard size={14} />
                        {selectedRequestCards.length} card{selectedRequestCards.length !== 1 ? 's' : ''}
                      </li>
                    )}
                    {requestMoney === 0 && selectedRequestCards.length === 0 && (
                      <li className="text-gray-400">Nothing selected</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send Trade Offer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
