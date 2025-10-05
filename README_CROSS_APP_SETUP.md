# Cross-App Authentication Setup Guide

This guide explains how to integrate your other Netlify apps (Stack'em, Deck Realms) with the main GameHub authentication system.

## How It Works

1. **User clicks game link** in GameHub → Secure token is generated with user data
2. **External app receives token** → Validates and authenticates user automatically  
3. **Game progress syncs back** → Chips and stats update in real-time across all apps

## Setup for External Apps

### 1. Install Dependencies

In your external app (Stack'em, Deck Realms), install Supabase:

```bash
npm install @supabase/supabase-js
```

### 2. Copy Cross-App Auth File

Copy the `crossAppAuth.ts` file to your external app's utils/lib folder.

### 3. Initialize Authentication

In your external app's main component:

```typescript
import { initializeCrossAppAuth, updateGameStats } from './lib/crossAppAuth';

// On app load
useEffect(() => {
  const authenticateUser = async () => {
    const user = await initializeCrossAppAuth();
    if (user && user.success) {
      // User is authenticated from GameHub
      setUserData({
        id: user.user_id,
        username: user.username,
        chips: user.chips,
        level: user.level
      });
      setIsAuthenticated(true);
    } else {
      // Show login form or redirect to GameHub
      setShowLoginPrompt(true);
    }
  };
  
  authenticateUser();
}, []);
```

### 4. Sync Game Results

When a game ends, sync the results back to GameHub:

```typescript
const handleGameEnd = async (gameResult) => {
  const chipsChange = gameResult.won ? gameResult.chipsWon : -gameResult.chipsLost;
  
  const result = await updateGameStats(
    user.email,
    'stack-em', // or 'deck-realms'
    {
      games_played: 1,
      games_won: gameResult.won ? 1 : 0,
      experience_gained: gameResult.xp || 0,
      // Add any game-specific stats
      highest_score: gameResult.score
    },
    chipsChange
  );
  
  if (result && result.success) {
    // Update local chip display
    setUserChips(result.new_chips);
  }
};
```

### 5. Environment Variables

Make sure your external apps can access the same Supabase instance. You can either:

**Option A: Use the token's embedded credentials (recommended)**
```typescript
// The auth token includes Supabase URL and key
const authToken = parseAuthTokenFromUrl();
if (authToken) {
  const supabase = createClient(authToken.supabaseUrl, authToken.supabaseKey);
}
```

**Option B: Set environment variables**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Features

- **Token expiration**: Auth tokens expire after 5 minutes
- **App-specific permissions**: Users must have permission for each app
- **Secure functions**: Database functions use SECURITY DEFINER
- **Audit trail**: All chip changes are logged in transactions table

## Testing the Integration

1. **Login to GameHub** → Should see your games with chip balance
2. **Click "PLAY STACK'EM"** → Should open Stack'em with auto-login
3. **Play a game** → Win/lose some chips
4. **Return to GameHub** → Chip balance should be updated
5. **Check transactions** → Should see game result logged

## Troubleshooting

### User not authenticating in external app
- Check browser console for errors
- Verify auth token is in URL parameters
- Ensure token hasn't expired (5 minute limit)

### Chips not syncing
- Check if `update_game_stats` function exists in database
- Verify user has permission for the app
- Check transactions table for logged changes

### Database connection issues
- Verify Supabase URL and key are correct
- Check if database functions are deployed
- Ensure RLS policies allow cross-app access

## Example Integration

Here's a complete example for Stack'em:

```typescript
// stackem/src/hooks/useGameHubAuth.ts
import { useState, useEffect } from 'react';
import { initializeCrossAppAuth, updateGameStats } from '../lib/crossAppAuth';

export const useGameHubAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const userData = await initializeCrossAppAuth();
        if (userData && userData.success) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication failed:', error);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, []);

  const syncGameResult = async (gameData) => {
    if (!user) return;

    const result = await updateGameStats(
      user.email,
      'stack-em',
      gameData.stats,
      gameData.chipsChange
    );

    if (result && result.success) {
      setUser(prev => ({ ...prev, chips: result.new_chips }));
    }

    return result;
  };

  return { user, isAuthenticated, loading, syncGameResult };
};
```

This system ensures seamless authentication and chip synchronization across all your gaming apps!