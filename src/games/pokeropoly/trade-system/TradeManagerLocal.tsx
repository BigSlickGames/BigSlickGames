import React, { useState } from "react";
import { Users, X, Check, XCircle, Bell } from "lucide-react";
import { TradeOfferModal } from "./TradeOfferModal";
import type { Player, Card } from "./TradeTypes";

interface PendingTrade {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  toPlayerId: string;
  toPlayerName: string;
  offerCards: Card[];
  offerMoney: number;
  requestCards: Card[];
  requestMoney: number;
  timestamp: number;
}

interface TradeManagerLocalProps {
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
}

export function TradeManagerLocal({
  currentPlayer,
  allPlayers,
  onTradeComplete,
}: TradeManagerLocalProps) {
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [pendingTrades, setPendingTrades] = useState<PendingTrade[]>([]);
  const [showTradeNotification, setShowTradeNotification] = useState(false);
  const [currentTradeView, setCurrentTradeView] = useState<PendingTrade | null>(
    null
  );

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerSelect(false);
    setShowOfferModal(true);
  };

  const handleSubmitTrade = (
    offerCards: Card[],
    offerMoney: number,
    requestCards: Card[],
    requestMoney: number
  ) => {
    if (!selectedPlayer) return;

    const newTrade: PendingTrade = {
      id: `trade-${Date.now()}`,
      fromPlayerId: currentPlayer.id,
      fromPlayerName: currentPlayer.name,
      toPlayerId: selectedPlayer.id,
      toPlayerName: selectedPlayer.name,
      offerCards,
      offerMoney,
      requestCards,
      requestMoney,
      timestamp: Date.now(),
    };

    setPendingTrades((prev) => [...prev, newTrade]);
    setShowOfferModal(false);
    setSelectedPlayer(null);
  };

  const handleAcceptTrade = (trade: PendingTrade) => {
    onTradeComplete(
      trade.fromPlayerId,
      trade.toPlayerId,
      trade.offerCards,
      trade.offerMoney,
      trade.requestCards,
      trade.requestMoney
    );

    setPendingTrades((prev) => prev.filter((t) => t.id !== trade.id));
    setShowTradeNotification(false);
    setCurrentTradeView(null);
  };

  const handleRejectTrade = (tradeId: string) => {
    setPendingTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setShowTradeNotification(false);
    setCurrentTradeView(null);
  };

  const handleCancelTrade = (tradeId: string) => {
    setPendingTrades((prev) => prev.filter((t) => t.id !== tradeId));
  };

  const otherPlayers = allPlayers.filter((p) => p.id !== currentPlayer.id);

  // Trades sent TO this player (incoming)
  const incomingTrades = pendingTrades.filter(
    (t) => t.toPlayerId === currentPlayer.id
  );

  // Trades sent BY this player (outgoing)
  const outgoingTrades = pendingTrades.filter(
    (t) => t.fromPlayerId === currentPlayer.id
  );

  // Function to get incoming trades count for any player
  const getIncomingTradesCount = (playerId: string) => {
    return pendingTrades.filter((t) => t.toPlayerId === playerId).length;
  };

  return (
    <>
      {/* Trade Button - Bottom Left */}
      <div className="fixed bottom-8 left-8 z-[10001] flex gap-3">
        <button
          onClick={() => setShowPlayerSelect(!showPlayerSelect)}
          className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white font-black py-3 px-6 rounded-xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all text-base border-2 border-purple-400/50 flex items-center gap-3 backdrop-blur-sm"
          style={{
            boxShadow:
              "0 0 30px rgba(168, 85, 247, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.1)",
          }}
        >
          <Users size={22} className="drop-shadow-lg" />
          <span className="drop-shadow-lg">Trade</span>
        </button>

        {/* Incoming Trade Notification - MAIN BUTTON */}
        {incomingTrades.length > 0 && (
          <button
            onClick={() => {
              setCurrentTradeView(incomingTrades[0]);
              setShowTradeNotification(true);
            }}
            className="relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-3 px-6 rounded-xl shadow-2xl transform hover:scale-110 active:scale-95 transition-all text-lg border-2 border-red-400/50 animate-bounce"
            style={{
              boxShadow:
                "0 0 40px rgba(239, 68, 68, 0.8), inset 0 2px 10px rgba(255, 255, 255, 0.1)",
            }}
          >
            <Bell size={24} className="drop-shadow-lg" />
            <span className="absolute -top-3 -right-3 bg-yellow-400 text-black text-sm font-black rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-xl animate-pulse">
              {incomingTrades.length}
            </span>
          </button>
        )}
      </div>

      {/* Trade Notification Badges on ALL Player Profiles */}
      {allPlayers.map((player) => {
        const tradesForPlayer = getIncomingTradesCount(player.id);
        if (tradesForPlayer === 0) return null;

        return (
          <div
            key={player.id}
            className="fixed z-[9999] pointer-events-none"
            style={{
              // Position based on player position
              ...(player.position === "bottom" && {
                bottom: "140px",
                left: "50%",
                transform: "translateX(-50%)",
              }),
              ...(player.position === "left" && {
                left: "140px",
                top: "50%",
                transform: "translateY(-50%)",
              }),
              ...(player.position === "top" && {
                top: "140px",
                left: "50%",
                transform: "translateX(-50%)",
              }),
              ...(player.position === "right" && {
                right: "140px",
                top: "50%",
                transform: "translateY(-50%)",
              }),
            }}
          ></div>
        );
      })}

      {/* Outgoing Trades Panel */}
      {/* {outgoingTrades.length > 0 && (
        <div className="fixed bottom-8 right-8 z-[10001]">
          <div
            className="rounded-xl shadow-2xl p-4 max-w-sm border-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
              borderColor: "rgba(251, 191, 36, 0.3)",
              boxShadow:
                "0 0 30px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(99, 102, 241, 0.1)",
            }}
          >
            <h4 className="font-black text-yellow-300 mb-3 text-sm">
              Pending Offers ({outgoingTrades.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {outgoingTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="bg-black/40 rounded-lg p-3 flex items-center justify-between border border-purple-500/20"
                >
                  <div className="text-sm">
                    <p className="font-bold text-white text-xs">
                      To: {trade.toPlayerName}
                    </p>
                    <p className="text-purple-300/80 text-xs">
                      {trade.offerCards.length} card
                      {trade.offerCards.length !== 1 ? "s" : ""} + $
                      {trade.offerMoney}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelTrade(trade.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}

      {/* Player Selection Modal */}
      {showPlayerSelect && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[10002] p-4">
          <div
            className="rounded-2xl shadow-2xl max-w-md w-full border-4 overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
              `,
              borderColor: "rgba(168, 85, 247, 0.5)",
              boxShadow:
                "0 0 60px rgba(168, 85, 247, 0.4), inset 0 0 40px rgba(99, 102, 241, 0.1)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-5 border-b-2"
              style={{
                borderColor: "rgba(168, 85, 247, 0.3)",
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
              }}
            >
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-200 to-indigo-300">
                Select Trading Partner
              </h3>
              <button
                onClick={() => setShowPlayerSelect(false)}
                className="text-purple-300 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {otherPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className="w-full p-4 rounded-xl transition-all text-left flex items-center gap-4 border-2 group"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)",
                    borderColor: "rgba(168, 85, 247, 0.2)",
                    boxShadow: "inset 0 0 20px rgba(99, 102, 241, 0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(168, 85, 247, 0.6)";
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(99, 102, 241, 0.1)";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(168, 85, 247, 0.2)";
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 20px rgba(99, 102, 241, 0.05)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex-shrink-0 border-2 shadow-lg"
                    style={{
                      backgroundColor: player.color,
                      borderColor: "rgba(251, 191, 36, 0.4)",
                      boxShadow: `0 0 15px ${player.color}80`,
                    }}
                  ></div>
                  <div className="flex-1">
                    <p className="font-black text-white text-lg drop-shadow-lg">
                      {player.name}
                    </p>
                    <p className="text-sm text-purple-300/80 font-semibold">
                      {player.cards.length} cards • $
                      {player.chips.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trade Offer Modal */}
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

      {/* Trade Notification/Approval Modal */}
      {showTradeNotification && currentTradeView && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[10003] p-4">
          <div
            className="rounded-2xl shadow-2xl max-w-2xl w-full border-4 overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
              `,
              borderColor: "rgba(251, 191, 36, 0.5)",
              boxShadow:
                "0 0 60px rgba(251, 191, 36, 0.6), inset 0 0 40px rgba(99, 102, 241, 0.1)",
            }}
          >
            <div
              className="px-6 py-5 border-b-2 text-center"
              style={{
                borderColor: "rgba(251, 191, 36, 0.3)",
                background:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
              }}
            >
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 mb-2">
                🤝 Trade Offer
              </h3>
              <p className="text-purple-200 font-bold text-lg">
                From: {currentTradeView.fromPlayerName}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* You Receive */}
                <div className="space-y-3">
                  <h4 className="text-lg font-black text-green-400 text-center">
                    You Receive
                  </h4>
                  <div
                    className="rounded-xl p-4 border-2 min-h-[150px]"
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      borderColor: "rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    {currentTradeView.offerCards.length > 0 && (
                      <div className="mb-3">
                        <p className="text-white/70 text-xs mb-2">Cards:</p>
                        <div className="flex flex-wrap gap-2">
                          {currentTradeView.offerCards.map((card, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded p-2 text-center shadow-lg border-2"
                              style={{
                                borderColor:
                                  card.suit === "♥" || card.suit === "♦"
                                    ? "#DC143C"
                                    : "#000",
                              }}
                            >
                              <div
                                className="text-sm font-bold"
                                style={{
                                  color:
                                    card.suit === "♥" || card.suit === "♦"
                                      ? "#DC143C"
                                      : "#000",
                                }}
                              >
                                {card.value}
                              </div>
                              <div
                                className="text-lg"
                                style={{
                                  color:
                                    card.suit === "♥" || card.suit === "♦"
                                      ? "#DC143C"
                                      : "#000",
                                }}
                              >
                                {card.suit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentTradeView.offerMoney > 0 && (
                      <div>
                        <p className="text-white/70 text-xs mb-1">Money:</p>
                        <p className="text-2xl font-black text-green-400">
                          ${currentTradeView.offerMoney.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {currentTradeView.offerCards.length === 0 &&
                      currentTradeView.offerMoney === 0 && (
                        <p className="text-white/40 text-center py-8">
                          Nothing
                        </p>
                      )}
                  </div>
                </div>

                {/* You Give */}
                <div className="space-y-3">
                  <h4 className="text-lg font-black text-red-400 text-center">
                    You Give
                  </h4>
                  <div
                    className="rounded-xl p-4 border-2 min-h-[150px]"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    {currentTradeView.requestCards.length > 0 && (
                      <div className="mb-3">
                        <p className="text-white/70 text-xs mb-2">Cards:</p>
                        <div className="flex flex-wrap gap-2">
                          {currentTradeView.requestCards.map((card, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded p-2 text-center shadow-lg border-2"
                              style={{
                                borderColor:
                                  card.suit === "♥" || card.suit === "♦"
                                    ? "#DC143C"
                                    : "#000",
                              }}
                            >
                              <div
                                className="text-sm font-bold"
                                style={{
                                  color:
                                    card.suit === "♥" || card.suit === "♦"
                                      ? "#DC143C"
                                      : "#000",
                                }}
                              >
                                {card.value}
                              </div>
                              <div
                                className="text-lg"
                                style={{
                                  color:
                                    card.suit === "♥" || card.suit === "♦"
                                      ? "#DC143C"
                                      : "#000",
                                }}
                              >
                                {card.suit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentTradeView.requestMoney > 0 && (
                      <div>
                        <p className="text-white/70 text-xs mb-1">Money:</p>
                        <p className="text-2xl font-black text-red-400">
                          ${currentTradeView.requestMoney.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {currentTradeView.requestCards.length === 0 &&
                      currentTradeView.requestMoney === 0 && (
                        <p className="text-white/40 text-center py-8">
                          Nothing
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleAcceptTrade(currentTradeView)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black py-4 px-6 rounded-xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all text-lg border-2 border-green-400/50 flex items-center justify-center gap-2"
                  style={{
                    boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)",
                  }}
                >
                  <Check size={24} />
                  Accept Trade
                </button>
                <button
                  onClick={() => handleRejectTrade(currentTradeView.id)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 px-6 rounded-xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all text-lg border-2 border-red-400/50 flex items-center justify-center gap-2"
                  style={{
                    boxShadow: "0 0 30px rgba(239, 68, 68, 0.5)",
                  }}
                >
                  <XCircle size={24} />
                  Reject Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
