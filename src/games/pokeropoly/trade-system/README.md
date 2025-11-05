# Trade System Package

A complete, plug-and-play trading system for multiplayer games with real-time notifications, database persistence, and rejection tracking.

## Features

- **Player-to-Player Trading**: Trade cards and money between players
- **Real-time Notifications**: Instant trade offer notifications with live updates
- **Rejection Tracking**: Track rejections and apply dice penalties after 3 rejections
- **Database Persistence**: All trades stored in Supabase with full history
- **Trade Expiration**: Automatic expiration of pending trades
- **Beautiful UI**: Professional modals with comprehensive trade summaries
- **Plug-and-Play**: Easy integration with any game system

## Installation

The trade system is self-contained in the `src/trade-system/` directory and requires Supabase.

### Prerequisites

1. Supabase project with the following environment variables in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Run the database migration to create required tables:
   - Migration file: `supabase/migrations/create_trade_system.sql`

## Quick Start

### 1. Import the Trade System

```typescript
import { TradeManager } from './trade-system';
import type { Player, Card } from './trade-system';
```

### 2. Add TradeManager to Your Game

```tsx
function YourGameComponent() {
  const [players, setPlayers] = useState<Player[]>([...]);
  const currentPlayer = players[currentPlayerIndex];

  const handleTradeComplete = (
    fromPlayerId: string,
    toPlayerId: string,
    fromCards: Card[],
    fromMoney: number,
    toCards: Card[],
    toMoney: number
  ) => {
    // Update your game state here
    // Transfer cards and money between players
    setPlayers(prevPlayers => {
      // Your logic to update player inventories
    });
  };

  return (
    <>
      {/* Your game UI */}

      <TradeManager
        currentPlayer={currentPlayer}
        allPlayers={players}
        onTradeComplete={handleTradeComplete}
      />
    </>
  );
}
```

### 3. That's It!

The trade system is now fully integrated. Players can:
- Click the "Trade" button to initiate trades
- Select a player to trade with
- Choose cards and money to offer
- Choose cards and money to request
- Accept or reject incoming trade offers
- Track rejections and dice penalties

## Configuration

Customize the trade system behavior:

```tsx
import { DEFAULT_TRADE_CONFIG } from './trade-system';

<TradeManager
  currentPlayer={currentPlayer}
  allPlayers={players}
  onTradeComplete={handleTradeComplete}
  config={{
    maxRejections: 3,              // Dice penalty after 3 rejections
    tradeExpiryMinutes: 5,         // Trades expire after 5 minutes
    enableNotifications: true,      // Show notification modals
  }}
/>
```

## Player Interface

Your `Player` objects must have the following structure:

```typescript
interface Player {
  id: string;           // Unique player identifier
  name: string;         // Player display name
  chips: number;        // Available money/chips
  cards: Card[];        // Owned cards
  color: string;        // Player color for UI
}
```

## Card Interface

Your `Card` objects must have the following structure:

```typescript
interface Card {
  suit: string;         // Card suit (hearts, diamonds, clubs, spades)
  value: string;        // Card value (A, 2-10, J, Q, K)
  position?: number;    // Optional position on board
  owner?: string;       // Optional owner ID
  price?: number;       // Optional card price
}
```

## API Reference

### TradeManager Component

Main orchestration component that handles all trade functionality.

**Props:**
- `currentPlayer: Player` - The currently active player
- `allPlayers: Player[]` - Array of all players in the game
- `onTradeComplete: (fromPlayerId, toPlayerId, fromCards, fromMoney, toCards, toMoney) => void` - Callback when trade is accepted
- `config?: TradeSystemConfig` - Optional configuration object

### useTradeSystem Hook

Advanced users can use the hook directly for custom implementations.

```typescript
const {
  incomingTrades,           // Trades incoming to current player
  outgoingTrades,           // Trades sent by current player
  rejectionTracking,        // Rejection count and penalty status
  loading,                  // Loading state
  error,                    // Error message
  createTrade,              // Create a new trade offer
  acceptTrade,              // Accept a trade
  rejectTrade,              // Reject a trade
  cancelTrade,              // Cancel your own trade
  clearDicePenalty,         // Clear dice penalty
  refreshTrades,            // Manually refresh trades
} = useTradeSystem(playerId, config);
```

## Database Schema

### trades Table

Stores all trade offers with complete history.

- `id` - Unique trade identifier
- `from_player_id` - Initiating player
- `to_player_id` - Receiving player
- `from_player_name` - Initiating player name
- `to_player_name` - Receiving player name
- `offer_cards` - Cards being offered (JSONB)
- `offer_money` - Money being offered
- `request_cards` - Cards being requested (JSONB)
- `request_money` - Money being requested
- `status` - Trade status (pending/accepted/rejected/expired)
- `rejection_count` - Number of rejections for this trade
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `expires_at` - Expiration timestamp

### player_rejection_tracking Table

Tracks rejection counts for dice penalty system.

- `id` - Unique tracking identifier
- `player_id` - Player being tracked
- `rejection_count` - Total rejections
- `last_rejection_at` - Last rejection timestamp
- `dice_penalty_active` - Whether penalty is active
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Trade Flow

### Initiating a Trade

1. Click "Trade" button
2. Select target player
3. Choose cards/money to offer
4. Choose cards/money to request
5. Submit trade offer

### Receiving a Trade

1. Notification appears with bell icon
2. Click notification to view trade details
3. Review offer and request
4. Accept or Reject

### Rejection Penalty System

- Each rejection increments the initiating player's rejection count
- After 3 total rejections from ANY players, dice penalty activates
- Penalty indicator shows in UI when active
- Penalty can be cleared manually or after successful trade

## Real-time Updates

The system uses Supabase real-time subscriptions to:
- Notify players of incoming trades instantly
- Update trade status in real-time
- Sync rejection tracking across all clients
- Automatically cleanup expired trades

## UI Components

### TradeOfferModal
Professional modal for creating trade offers with:
- Card selection grids
- Money amount controls
- Trade summary preview
- Validation and error handling

### TradeNotificationModal
Eye-catching notification modal with:
- Time remaining countdown
- Visual trade breakdown
- Accept/Reject actions
- Rejection warning

### TradeManager
Main UI controls including:
- Trade button with player count
- Notification bell with badge
- Dice penalty indicator
- Pending offers list

## Styling

All components use Tailwind CSS and are fully responsive. Colors and styles can be customized by modifying the component files.

## Error Handling

The system includes comprehensive error handling:
- Validation for insufficient funds
- Validation for card ownership
- Database operation error catching
- User-friendly error messages
- Loading states for all operations

## Performance

- Efficient database queries with indexes
- Real-time subscriptions only for relevant trades
- Automatic cleanup of expired trades every 60 seconds
- Optimistic UI updates for instant feedback

## Security

- Row Level Security (RLS) enabled on all tables
- Authenticated-only access policies
- Validation of trade ownership
- Protection against race conditions

## Support

For issues or questions, check the inline code documentation or review the implementation in:
- `TradeManager.tsx` - Main component
- `useTradeSystem.ts` - Core logic and database operations
- `TradeTypes.ts` - Type definitions
- Migration file in `supabase/migrations/`

## License

This trade system is part of the Poker-Opoly game project.
