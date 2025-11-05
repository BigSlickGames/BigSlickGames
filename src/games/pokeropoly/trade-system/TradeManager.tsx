import React, { useState, useEffect } from "react";
import { Bell, Users, X } from "lucide-react";
import { useTradeSystem } from "./useTradeSystem";
import { TradeOfferModal } from "./TradeOfferModal";
import { TradeNotificationModal } from "./TradeNotificationModal";
import type { Player, Card, TradeSystemConfig } from "./TradeTypes";

interface TradeManagerProps {
  currentPlayer: Player;
  allPlayers: Player[];
  onTradeComplete: (
    fromPlayerId: string,
    toPlayerId: string,
    fromCards: Card[],
    fromMoney: number,
    toCards: Card[],
    toMoney: number
  ) => void;
  config?: TradeSystemConfig;
}

export function TradeManager({
  currentPlayer,
  allPlayers,
  onTradeComplete,
  config,
}: TradeManagerProps) {
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<number>(0);

  const {
    incomingTrades,
    outgoingTrades,
    rejectionTracking,
    loading,
    error,
    createTrade,
    acceptTrade,
    rejectTrade,
    cancelTrade,
    refreshTrades,
  } = useTradeSystem(currentPlayer.id, config);

  useEffect(() => {
    if (incomingTrades.length > 0 && !showNotificationModal) {
      setCurrentNotification(0);
      setShowNotificationModal(true);
    }
  }, [incomingTrades.length]);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerSelect(false);
    setShowOfferModal(true);
  };

  const handleSubmitTrade = async (
    offerCards: Card[],
    offerMoney: number,
    requestCards: Card[],
    requestMoney: number
  ) => {
    if (!selectedPlayer) return;

    await createTrade(
      selectedPlayer.id,
      selectedPlayer.name,
      currentPlayer.name,
      offerCards,
      offerMoney,
      requestCards,
      requestMoney
    );

    setShowOfferModal(false);
    setSelectedPlayer(null);
  };

  const handleAcceptTrade = async (tradeId: string): Promise<boolean> => {
    const trade = incomingTrades.find((t) => t.id === tradeId);
    if (!trade) return false;

    const success = await acceptTrade(tradeId);

    if (success) {
      onTradeComplete(
        trade.from_player_id,
        trade.to_player_id,
        trade.offer_cards,
        trade.offer_money,
        trade.request_cards,
        trade.request_money
      );

      if (currentNotification < incomingTrades.length - 1) {
        setCurrentNotification(currentNotification + 1);
      } else {
        setShowNotificationModal(false);
        setCurrentNotification(0);
      }
    }

    return success;
  };

  const handleRejectTrade = async (
    tradeId: string,
    fromPlayerId: string
  ): Promise<boolean> => {
    const success = await rejectTrade(tradeId, fromPlayerId);

    if (success) {
      if (currentNotification < incomingTrades.length - 1) {
        setCurrentNotification(currentNotification + 1);
      } else {
        setShowNotificationModal(false);
        setCurrentNotification(0);
      }
    }

    return success;
  };

  const handleNextNotification = () => {
    if (currentNotification < incomingTrades.length - 1) {
      setCurrentNotification(currentNotification + 1);
    } else {
      setShowNotificationModal(false);
      setCurrentNotification(0);
    }
  };

  const handlePreviousNotification = () => {
    if (currentNotification > 0) {
      setCurrentNotification(currentNotification - 1);
    }
  };

  const otherPlayers = allPlayers.filter((p) => p.id !== currentPlayer.id);
  const currentTrade = incomingTrades[currentNotification];

  return (
    <>
      <div className="fixed top-4 right-20 z-[10001] flex gap-2">
        <button
          onClick={() => setShowPlayerSelect(!showPlayerSelect)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2 font-medium"
        >
          <Users size={20} />
          Trade
        </button>

        {incomingTrades.length > 0 && (
          <button
            onClick={() => {
              setCurrentNotification(0);
              setShowNotificationModal(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2 font-medium relative"
          >
            <Bell size={20} />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {incomingTrades.length}
            </span>
          </button>
        )}

        {rejectionTracking?.dice_penalty_active && (
          <div className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium">
            <span>⚠️ Dice Penalty Active</span>
          </div>
        )}
      </div>

      {showPlayerSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Select Player to Trade With
              </h3>
              <button
                onClick={() => setShowPlayerSelect(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {otherPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className="w-full p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors text-left flex items-center gap-3 border-2 border-transparent hover:border-blue-300"
                >
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: player.color }}
                  ></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-600">
                      {player.cards.length} cards • ${player.chips}
                    </p>
                  </div>
                </button>
              ))}
              {otherPlayers.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No other players available
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showOfferModal && selectedPlayer && (
        <TradeOfferModal
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setSelectedPlayer(null);
          }}
          currentPlayer={currentPlayer}
          targetPlayer={selectedPlayer}
          onSubmitTrade={handleSubmitTrade}
        />
      )}

      {showNotificationModal && currentTrade && (
        <div className="fixed inset-0 z-50">
          <TradeNotificationModal
            isOpen={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
            trade={currentTrade}
            onAccept={handleAcceptTrade}
            onReject={handleRejectTrade}
            currentPlayerColor={currentPlayer.color}
          />
          {incomingTrades.length > 1 && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-3">
              <button
                onClick={handlePreviousNotification}
                disabled={currentNotification === 0}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-700">
                {currentNotification + 1} of {incomingTrades.length}
              </span>
              <button
                onClick={handleNextNotification}
                disabled={currentNotification === incomingTrades.length - 1}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {outgoingTrades.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h4 className="font-semibold text-gray-900 mb-2">
            Pending Offers ({outgoingTrades.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {outgoingTrades.map((trade) => (
              <div
                key={trade.id}
                className="bg-gray-50 rounded p-2 flex items-center justify-between"
              >
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    To: {trade.to_player_name}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {trade.offer_cards.length} cards + ${trade.offer_money}
                  </p>
                </div>
                <button
                  onClick={() => cancelTrade(trade.id)}
                  className="text-red-600 hover:text-red-700 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-20 right-4 z-40 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
          <p className="font-medium">Trade Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </>
  );
}
