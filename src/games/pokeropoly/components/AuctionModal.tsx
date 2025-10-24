import React, { useState } from "react";

interface AuctionModalProps {
  card: { suit: string; value: string };
  players: Array<{
    name: string;
    chips: number;
  }>;
  myChips: number;
  onPlaceBid: (bidAmount: number) => void;
  onClose: () => void;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  card,
  players,
  myChips,
  onPlaceBid,
  onClose,
}) => {
  const [bidAmount, setBidAmount] = useState("");
  const [bidSubmitted, setBidSubmitted] = useState(false);

  const getSuitColor = (suit: string) => {
    if (suit === "♥") return "#DC143C";
    if (suit === "♦") return "#90EE90";
    if (suit === "♣") return "#ADD8E6";
    return "#000000";
  };

  const handleSubmitBid = () => {
    const bid = parseInt(bidAmount);

    if (isNaN(bid) || bid <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    if (bid > myChips) {
      alert("You don't have enough chips!");
      return;
    }

    onPlaceBid(bid);
    setBidSubmitted(true);

    // Auto-close after submission
    setTimeout(() => {
      document.getElementById("auction-modal")?.remove();

      onClose();
    }, 1000);
  };

  const handleDecline = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-3xl shadow-2xl border-4 border-yellow-400 p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
            🔨 Card Auction
          </h2>
          <p className="text-white/80 text-sm">Place your bid or decline</p>
        </div>

        {/* Card Display */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-xl">
          <div className="flex flex-col items-center justify-center">
            <div
              className="text-6xl font-bold mb-2"
              style={{ color: getSuitColor(card.suit) }}
            >
              {card.suit}
            </div>
            <div className="text-4xl font-bold text-gray-800">{card.value}</div>
          </div>
        </div>

        {!bidSubmitted ? (
          <>
            {/* Bid Input */}
            <div className="mb-6">
              <label className="block text-white font-bold mb-2 text-sm">
                Your Bid Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400 font-bold text-xl">
                  $
                </span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full bg-white/10 border-2 border-yellow-400 rounded-xl py-3 pl-10 pr-4 text-white font-bold text-xl focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
                  min="1"
                  max={myChips}
                />
              </div>
              <p className="text-white/60 text-xs mt-2">
                Available chips: ${myChips}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSubmitBid}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl transform hover:scale-105 transition-all"
              >
                💰 Submit Bid
              </button>
              <button
                onClick={handleDecline}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl shadow-xl transform hover:scale-105 transition-all"
              >
                ❌ Decline
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-white text-xl font-bold">Bid Submitted!</p>
            <p className="text-white/60 text-sm mt-2">Your bid: ${bidAmount}</p>
          </div>
        )}
      </div>
    </div>
  );
};
