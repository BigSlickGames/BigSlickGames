import { X } from 'lucide-react';

interface RulesPanelProps {
  onClose: () => void;
}

export function RulesPanel({ onClose }: RulesPanelProps) {
  return (
    <div className="fixed left-4 top-4 bottom-4 w-80 bg-black/90 backdrop-blur-md rounded-xl border-2 border-orange-500/50 shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-black/95 backdrop-blur-md p-4 border-b-2 border-orange-500/50 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-orange-400">Poker-Opoly Rules</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-orange-400 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-4 space-y-4 text-white">
        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Objective</h3>
          <p className="text-sm text-gray-200">
            Be the last player standing! The winner is the last person who hasn't gone bust (run out of chips).
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Setup</h3>
          <ul className="text-sm text-gray-200 space-y-1 list-disc list-inside">
            <li>Each player starts with $10,000 in chips</li>
            <li>Players are positioned at the four corner spaces</li>
            <li>Click "Deal Cards" to start the game</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Turn Sequence</h3>
          <ol className="text-sm text-gray-200 space-y-2 list-decimal list-inside">
            <li><strong>Draw from Roll Deck:</strong> Click the button to draw 2 cards from the deck</li>
            <li><strong>Move:</strong> Add the values of both cards to determine spaces moved</li>
            <li><strong>Doubles Bonus:</strong> If both cards match, draw 2 more cards and move again</li>
            <li><strong>Land on Space:</strong> Option to buy the card if unowned</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Joker Cards</h3>
          <p className="text-sm text-gray-200">
            When you draw a Joker from the Roll Deck, you can choose any value from 1-10 for movement. This gives you strategic control over your positioning on the board.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Buying Cards</h3>
          <ul className="text-sm text-gray-200 space-y-1 list-disc list-inside">
            <li>When you land on an unowned card, you can buy it</li>
            <li>Price = Card value (in dollars)</li>
            <li>If you decline, the card goes to auction</li>
            <li>Owned cards show in your player profile</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Auction System</h3>
          <ul className="text-sm text-gray-200 space-y-1 list-disc list-inside">
            <li>All players can bid on declined cards</li>
            <li>Minimum bid = Card value (in dollars)</li>
            <li>Highest bidder wins the card</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Poker Hands</h3>
          <p className="text-sm text-gray-200 mb-2">
            Collect cards to build poker hands. Complete hands are automatically detected and displayed in your profile.
          </p>
          <ul className="text-sm text-gray-200 space-y-1 list-disc list-inside">
            <li><strong>Pair:</strong> 2 cards of same value</li>
            <li><strong>Three of a Kind:</strong> 3 cards of same value</li>
            <li><strong>Straight:</strong> 5 consecutive values</li>
            <li><strong>Flush:</strong> 5 cards of same suit</li>
            <li><strong>Full House:</strong> 3 of a kind + a pair</li>
            <li><strong>Four of a Kind:</strong> 4 cards of same value</li>
            <li><strong>Straight Flush:</strong> 5 consecutive values of same suit</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Penalties</h3>
          <ul className="text-sm text-gray-200 space-y-1 list-disc list-inside">
            <li>Landing on another player's card = Pay penalty</li>
            <li>Base penalty = Card value (in dollars)</li>
            <li>Penalty increases if card is part of a poker hand:</li>
            <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
              <li>Pair: ×2</li>
              <li>Three of a Kind: ×3</li>
              <li>Straight: ×4</li>
              <li>Flush: ×5</li>
              <li>Full House: ×6</li>
              <li>Four of a Kind: ×7</li>
              <li>Straight Flush: ×10</li>
            </ul>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Selling Cards</h3>
          <ul className="text-sm text-gray-200 space-y-1 list-disc list-inside">
            <li>Click "Sell Cards" button on your turn</li>
            <li>Sell for half the purchase price</li>
            <li>Strategic way to get chips when low on funds</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Special Spaces</h3>
          <ul className="text-sm text-gray-200 space-y-1 list-disc list-inside">
            <li><strong>Corner Spaces (♠♥♦♣):</strong> Safe spaces, no action</li>
            <li><strong>Mystery Spaces (?):</strong> Draw a mystery card with random effects</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Going Bust</h3>
          <p className="text-sm text-gray-200">
            When your chips reach $0 or below, you're out of the game. The last player remaining wins!
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-orange-400 mb-2">Strategy Tips</h3>
          <ul className="text-sm text-gray-200 space-y-1 list-disc list-inside">
            <li>Build poker hands to maximize penalties from opponents</li>
            <li>Buy cards strategically to complete hands</li>
            <li>Use auctions to get cards at lower prices</li>
            <li>Sell cards when you need emergency chips</li>
            <li>Watch opponent positions to avoid their properties</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
