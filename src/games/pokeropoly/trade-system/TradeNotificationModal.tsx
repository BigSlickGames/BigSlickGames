import React, { useState } from 'react';
import { X, AlertCircle, DollarSign, CreditCard, Clock, CheckCircle } from 'lucide-react';
import type { Trade, Card } from './TradeTypes';

interface TradeNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onAccept: (tradeId: string) => Promise<boolean>;
  onReject: (tradeId: string, fromPlayerId: string) => Promise<boolean>;
  currentPlayerColor: string;
}

export function TradeNotificationModal({
  isOpen,
  onClose,
  trade,
  onAccept,
  onReject,
  currentPlayerColor,
}: TradeNotificationModalProps) {
  const [processing, setProcessing] = useState(false);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);

  if (!isOpen || !trade) return null;

  const handleAccept = async () => {
    setProcessing(true);
    setAction('accept');
    try {
      const success = await onAccept(trade.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to accept trade:', error);
      alert('Failed to accept trade. Please try again.');
    } finally {
      setProcessing(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    setAction('reject');
    try {
      const success = await onReject(trade.id, trade.from_player_id);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to reject trade:', error);
      alert('Failed to reject trade. Please try again.');
    } finally {
      setProcessing(false);
      setAction(null);
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

  const getTimeRemaining = () => {
    const expiresAt = new Date(trade.expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes < 0) return 'Expired';
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle size={24} />
              Incoming Trade Offer
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {trade.from_player_name} wants to trade with you
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <Clock className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-yellow-900">Time Remaining</p>
              <p className="text-yellow-700 text-sm">{getTimeRemaining()}</p>
            </div>
            {trade.rejection_count > 0 && (
              <div className="text-right">
                <p className="font-semibold text-yellow-900">Rejections</p>
                <p className="text-yellow-700 text-sm">{trade.rejection_count}</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {trade.from_player_name} Offers
              </h3>

              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                {trade.offer_money > 0 && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-green-600" size={20} />
                      <span className="font-medium text-gray-700">Money</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      ${trade.offer_money}
                    </span>
                  </div>
                )}

                {trade.offer_cards.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="text-blue-600" size={20} />
                      <span className="font-medium text-gray-700">
                        Cards ({trade.offer_cards.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {trade.offer_cards.map((card, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-lg p-2 shadow-sm border border-gray-200"
                        >
                          <div className={`text-xl font-bold text-center ${getSuitColor(card.suit)}`}>
                            {getCardDisplay(card)}
                          </div>
                          {card.price && (
                            <div className="text-xs text-gray-600 text-center">${card.price}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trade.offer_money === 0 && trade.offer_cards.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nothing offered</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {trade.from_player_name} Requests
              </h3>

              <div className="bg-green-50 rounded-lg p-4 space-y-3">
                {trade.request_money > 0 && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-green-600" size={20} />
                      <span className="font-medium text-gray-700">Money</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      ${trade.request_money}
                    </span>
                  </div>
                )}

                {trade.request_cards.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="text-green-600" size={20} />
                      <span className="font-medium text-gray-700">
                        Cards ({trade.request_cards.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {trade.request_cards.map((card, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-lg p-2 shadow-sm border border-gray-200"
                        >
                          <div className={`text-xl font-bold text-center ${getSuitColor(card.suit)}`}>
                            {getCardDisplay(card)}
                          </div>
                          {card.price && (
                            <div className="text-xs text-gray-600 text-center">${card.price}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trade.request_money === 0 && trade.request_cards.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nothing requested</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Trade Summary</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-gray-700">You Give:</p>
                <ul className="space-y-1 text-gray-600">
                  {trade.request_money > 0 && (
                    <li className="flex items-center gap-1">
                      <DollarSign size={14} />${trade.request_money}
                    </li>
                  )}
                  {trade.request_cards.length > 0 && (
                    <li className="flex items-center gap-1">
                      <CreditCard size={14} />
                      {trade.request_cards.length} card{trade.request_cards.length !== 1 ? 's' : ''}
                    </li>
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-700">You Receive:</p>
                <ul className="space-y-1 text-gray-600">
                  {trade.offer_money > 0 && (
                    <li className="flex items-center gap-1">
                      <DollarSign size={14} />${trade.offer_money}
                    </li>
                  )}
                  {trade.offer_cards.length > 0 && (
                    <li className="flex items-center gap-1">
                      <CreditCard size={14} />
                      {trade.offer_cards.length} card{trade.offer_cards.length !== 1 ? 's' : ''}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> If {trade.from_player_name} reaches 3 total rejections from any players,
              they will face a dice roll penalty.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing && action === 'reject' ? (
                'Rejecting...'
              ) : (
                <>
                  <X size={20} />
                  Reject Trade
                </>
              )}
            </button>
            <button
              onClick={handleAccept}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing && action === 'accept' ? (
                'Accepting...'
              ) : (
                <>
                  <CheckCircle size={20} />
                  Accept Trade
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
