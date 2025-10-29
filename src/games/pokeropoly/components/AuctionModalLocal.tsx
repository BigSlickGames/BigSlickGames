import React, { useState } from "react";

interface AuctionModalProps {
  card: { suit: string; value: string };
  players: Array<{
    name: string;
    chips: number;
    color: string;
  }>;
  currentPlayerIndex: number;
  onClose: () => void;
  onAuctionComplete: (winnerIndex: number, winningBid: number) => void;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  card,
  players,
  currentPlayerIndex,
  onClose,
  onAuctionComplete,
}) => {
  const [currentBidderIndex, setCurrentBidderIndex] = useState(0);
  const [bids, setBids] = useState<{ [key: number]: number }>({});
  const [bidAmount, setBidAmount] = useState("");
  const [highestBid, setHighestBid] = useState(0);
  const [auctionComplete, setAuctionComplete] = useState(false);

  const getSuitColor = (suit: string) => {
    if (suit === "♥") return "#DC143C";
    if (suit === "♦") return "#90EE90";
    if (suit === "♣") return "#ADD8E6";
    return "#000000";
  };

  const currentBidder = players[currentBidderIndex];

  const handleSubmitBid = () => {
    const bid = parseInt(bidAmount);

    if (isNaN(bid) || bid <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    if (bid > currentBidder.chips) {
      alert("You don't have enough chips!");
      return;
    }

    if (bid <= highestBid) {
      alert(`Bid must be higher than $${highestBid}`);
      return;
    }

    // Record bid
    setBids({ ...bids, [currentBidderIndex]: bid });
    setHighestBid(bid);
    setBidAmount("");

    // Move to next player or complete auction
    if (currentBidderIndex === players.length - 1) {
      finishAuction({ ...bids, [currentBidderIndex]: bid });
    } else {
      setCurrentBidderIndex(currentBidderIndex + 1);
    }
  };

  const handlePass = () => {
    // Record pass as 0
    setBids({ ...bids, [currentBidderIndex]: 0 });

    // Move to next player or complete auction
    if (currentBidderIndex === players.length - 1) {
      finishAuction({ ...bids, [currentBidderIndex]: 0 });
    } else {
      setCurrentBidderIndex(currentBidderIndex + 1);
    }
  };

  const finishAuction = (finalBids: { [key: number]: number }) => {
    // Find highest bidder
    let winnerIndex = -1;
    let winningBid = 0;

    Object.entries(finalBids).forEach(([playerIndex, bid]) => {
      if (bid > winningBid) {
        winningBid = bid;
        winnerIndex = parseInt(playerIndex);
      }
    });

    if (winnerIndex === -1) {
      // No one bid - close auction
      setAuctionComplete(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      // Someone won
      setAuctionComplete(true);
      setTimeout(() => {
        onAuctionComplete(winnerIndex, winningBid);
      }, 2000);
    }
  };

  if (auctionComplete) {
    const winnerIndex = Object.entries(bids).reduce(
      (max, [idx, bid]) => (bid > max.bid ? { idx: parseInt(idx), bid } : max),
      { idx: -1, bid: 0 }
    );

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-3xl shadow-2xl border-4 border-yellow-400 p-8 max-w-md w-full">
          <div className="text-center py-8">
            {winnerIndex.idx === -1 ? (
              <>
                <div className="text-6xl mb-4">🚫</div>
                <p className="text-white text-2xl font-bold">No Bids!</p>
                <p className="text-white/60 text-sm mt-2">
                  Card remains unowned
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-white text-2xl font-bold">Auction Won!</p>
                <p
                  className="text-xl font-bold mt-4"
                  style={{ color: players[winnerIndex.idx].color }}
                >
                  {players[winnerIndex.idx].name}
                </p>
                <p className="text-yellow-400 text-3xl font-bold mt-2">
                  ${winnerIndex.bid}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-3xl shadow-2xl border-4 border-yellow-400 p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
            🔨 Card Auction
          </h2>
          <p className="text-white/80 text-sm">
            Player {currentBidderIndex + 1} of {players.length}
          </p>
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

        {/* Current Bidder Info */}
        <div
          className="rounded-xl p-4 mb-6 border-2"
          style={{
            backgroundColor: `${currentBidder.color}20`,
            borderColor: currentBidder.color,
          }}
        >
          <p className="text-white font-bold text-lg mb-1">
            {currentBidder.name}'s Turn
          </p>
          <p className="text-white/70 text-sm">
            Available chips: ${currentBidder.chips}
          </p>
          {highestBid > 0 && (
            <p className="text-yellow-400 font-bold text-sm mt-2">
              Current High Bid: ${highestBid}
            </p>
          )}
        </div>

        {/* Bid Input */}
        <div className="mb-6">
          <label className="block text-white font-bold mb-2 text-sm">
            Enter Bid Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400 font-bold text-xl">
              $
            </span>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Min: $${highestBid + 1}`}
              className="w-full bg-white/10 border-2 border-yellow-400 rounded-xl py-3 pl-10 pr-4 text-white font-bold text-xl focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
              min={highestBid + 1}
              max={currentBidder.chips}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSubmitBid}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl transform hover:scale-105 transition-all"
          >
            💰 Place Bid
          </button>
          <button
            onClick={handlePass}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl shadow-xl transform hover:scale-105 transition-all"
          >
            ⏭️ Pass
          </button>
        </div>

        {/* Bid History */}
        {Object.keys(bids).length > 0 && (
          <div className="mt-6 bg-black/30 rounded-xl p-4">
            <p className="text-white/70 text-xs font-bold mb-2">
              Previous Bids:
            </p>
            {Object.entries(bids).map(([idx, bid]) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-white/80 text-sm">
                  {players[parseInt(idx)].name}
                </span>
                <span
                  className={`font-bold text-sm ${bid > 0 ? "text-green-400" : "text-gray-500"}`}
                >
                  {bid > 0 ? `$${bid}` : "Pass"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
