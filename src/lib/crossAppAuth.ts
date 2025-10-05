// Cross-app authentication utilities
import { supabase } from './supabase';

export interface CrossAppAuthToken {
  email: string;
  userId: string;
  username: string;
  chips: number;
  level: number;
  country?: string;
  app: string;
  timestamp: number;
  supabaseUrl: string;
  supabaseKey: string;
}

export interface CrossAppUser {
  user_id: string;
  email: string;
  username: string;
  chips: number;
  level: number;
  country?: string;
  success: boolean;
}

export interface GameStatsUpdate {
  games_played?: number;
  games_won?: number;
  experience_gained?: number;
  [key: string]: any;
}

// Authenticate user from another app
export const authenticateCrossApp = async (
  userEmail: string, 
  appName: string
): Promise<CrossAppUser | null> => {
  try {
    const { data, error } = await supabase.rpc('authenticate_cross_app', {
      user_email: userEmail,
      app_name: appName
    });
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Cross-app authentication failed:', error);
    return null;
  }
};

// Update game stats and chips from external app
export const updateGameStats = async (
  userEmail: string,
  appName: string,
  statsUpdate: GameStatsUpdate,
  chipsChange: number = 0
): Promise<{ new_chips: number; success: boolean } | null> => {
  try {
    const { data, error } = await supabase.rpc('update_game_stats', {
      user_email: userEmail,
      app_name: appName,
      stats_update: statsUpdate,
      chips_change: chipsChange
    });
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Failed to update game stats:', error);
    return null;
  }
};

// Get user sync data
export const getUserSyncData = async (userEmail: string) => {
  try {
    const { data, error } = await supabase.rpc('get_user_sync_data', {
      user_email: userEmail
    });
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Failed to get user sync data:', error);
    return null;
  }
};

// Parse authentication token from URL
export const parseAuthTokenFromUrl = (): CrossAppAuthToken | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get('authToken');
  
  if (!authToken) return null;
  
  try {
    return JSON.parse(atob(authToken));
  } catch (error) {
    console.error('Failed to parse auth token:', error);
    return null;
  }
};

// Initialize cross-app authentication in external apps
export const initializeCrossAppAuth = async (): Promise<CrossAppUser | null> => {
  const authToken = parseAuthTokenFromUrl();
  
  if (!authToken) {
    console.log('No cross-app auth token found');
    return null;
  }
  
  // Validate token age (max 5 minutes)
  const tokenAge = Date.now() - authToken.timestamp;
  if (tokenAge > 5 * 60 * 1000) {
    console.error('Auth token expired');
    return null;
  }
  
  // Authenticate with the main app's database
  return await authenticateCrossApp(authToken.email, authToken.app);
};

// Example usage for external apps:
/*
// In your external app (Stack'em, Deck Realms, etc.):

import { initializeCrossAppAuth, updateGameStats } from './crossAppAuth';

// On app load
const user = await initializeCrossAppAuth();
if (user) {
  console.log('User authenticated:', user);
  // Set user data in your app
  setUserChips(user.chips);
  setUserLevel(user.level);
}

// When game ends
await updateGameStats(
  user.email,
  'stack-em',
  {
    games_played: 1,
    games_won: playerWon ? 1 : 0,
    experience_gained: 50
  },
  chipsWonOrLost // positive for win, negative for loss
);
*/