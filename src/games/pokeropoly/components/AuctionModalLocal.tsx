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
  const [bids, setBids] = useState<{ [key: number]: number }>({});
  const [bidAmounts, setBidAmounts] = useState<{ [key: number]: string }>({});
  const [submittedBids, setSubmittedBids] = useState<Set<number>>(new Set());
  const [auctionComplete, setAuctionComplete] = useState(false);

  const getSuitColor = (suit: string) => {
    if (suit === "♥") return "#DC143C";
    if (suit === "♦") return "#90EE90";
    if (suit === "♣") return "#ADD8E6";
    return "#000000";
  };

  const handleBidChange = (playerIndex: number, value: string) => {
    setBidAmounts({ ...bidAmounts, [playerIndex]: value });
  };

  const handleSubmitBid = (playerIndex: number) => {
    const bidValue = parseInt(bidAmounts[playerIndex] || "0");
    const player = players[playerIndex];

    if (bidValue > 0 && bidValue > player.chips) {
      alert(`${player.name} doesn't have enough chips!`);
      return;
    }

    // Record bid (0 means pass)
    setBids({ ...bids, [playerIndex]: bidValue });
    setSubmittedBids(new Set([...submittedBids, playerIndex]));

    // Check if all players have submitted
    const allPlayersExceptCurrent = players
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentPlayerIndex);

    if (submittedBids.size + 1 >= allPlayersExceptCurrent.length) {
      finishAuction({ ...bids, [playerIndex]: bidValue });
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

    setAuctionComplete(true);
    setTimeout(() => {
      if (winnerIndex === -1) {
        onClose();
      } else {
        onAuctionComplete(winnerIndex, winningBid);
      }
    }, 2500);
  };

  const eligiblePlayers = players
    .map((player, idx) => ({ player, idx }))
    .filter(({ idx }) => idx !== currentPlayerIndex);

  const highestBid = Math.max(0, ...Object.values(bids));

  if (auctionComplete) {
    const winnerEntry = Object.entries(bids).reduce(
      (max, [idx, bid]) => (bid > max.bid ? { idx: parseInt(idx), bid } : max),
      { idx: -1, bid: 0 }
    );

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-3xl shadow-2xl border-4 border-yellow-400 p-12 max-w-lg w-full">
          <div className="text-center">
            {winnerEntry.idx === -1 ? (
              <>
                <div className="text-8xl mb-6">🚫</div>
                <p className="text-white text-3xl font-bold mb-3">No Bids!</p>
                <p className="text-white/60 text-lg">Card remains unowned</p>
              </>
            ) : (
              <>
                <div className="text-8xl mb-6">🎉</div>
                <p className="text-white text-3xl font-bold mb-4">
                  Auction Won!
                </p>
                <div
                  className="text-2xl font-bold mb-2 px-6 py-3 rounded-xl inline-block"
                  style={{
                    backgroundColor: `${players[winnerEntry.idx].color}40`,
                    color: "white",
                  }}
                >
                  {players[winnerEntry.idx].name}
                </div>
                <p className="text-yellow-400 text-4xl font-bold mt-4">
                  ${winnerEntry.bid}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-3xl shadow-2xl border-4 border-yellow-400 p-8 max-w-4xl w-full my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-yellow-400 mb-3 drop-shadow-lg">
            🔨 Card Auction
          </h2>
          <p className="text-white/80 text-base">
            All players bid simultaneously - highest bid wins!
          </p>
        </div>

        {/* Card Display */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl max-w-xs mx-auto">
          <div className="flex flex-col items-center justify-center">
            <div
              className="text-7xl font-bold mb-3"
              style={{ color: getSuitColor(card.suit) }}
            >
              {card.suit}
            </div>
            <div className="text-5xl font-bold text-gray-800">{card.value}</div>
          </div>
        </div>

        {/* Current Highest Bid */}
        {highestBid > 0 && (
          <div className="text-center mb-6 bg-yellow-400/20 border-2 border-yellow-400 rounded-xl p-4">
            <p className="text-yellow-400 font-bold text-2xl">
              Current High Bid: ${highestBid}
            </p>
          </div>
        )}

        {/* All Player Bid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {eligiblePlayers.map(({ player, idx }) => {
            const hasSubmitted = submittedBids.has(idx);
            const bidValue = bids[idx];

            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 border-4 transition-all ${
                  hasSubmitted
                    ? "opacity-60 border-gray-500"
                    : "border-white shadow-xl"
                }`}
                style={{
                  backgroundColor: `${player.color}30`,
                }}
              >
                {/* Player Info */}
                <div className="text-center mb-4">
                  <h3 className="text-white font-bold text-xl mb-2">
                    {player.name}
                  </h3>
                  <p className="text-white/70 text-sm">
                    Chips: ${player.chips}
                  </p>
                </div>

                {/* Bid Status */}
                {hasSubmitted ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">✅</div>
                    <p className="text-white font-bold text-lg">
                      {bidValue > 0 ? `Bid: $${bidValue}` : "Passed"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Bid Input */}
                    <div className="mb-4">
                      <label className="block text-white font-bold mb-2 text-sm">
                        Enter Bid
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 font-bold text-lg">
                          $
                        </span>
                        <input
                          type="number"
                          value={bidAmounts[idx] || ""}
                          onChange={(e) => handleBidChange(idx, e.target.value)}
                          placeholder="0 to pass"
                          className="w-full bg-white/20 border-2 border-white/50 rounded-xl py-3 pl-8 pr-3 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          min={0}
                          max={player.chips}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => handleSubmitBid(idx)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-xl transform hover:scale-105 transition-all"
                    >
                      Submit Bid
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Waiting Status */}
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Waiting for {eligiblePlayers.length - submittedBids.size} player
            {eligiblePlayers.length - submittedBids.size !== 1 ? "s" : ""} to
            submit...
          </p>
        </div>
      </div>
    </div>
  );
};
