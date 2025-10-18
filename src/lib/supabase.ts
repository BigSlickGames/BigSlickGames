import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Only create Supabase client if valid credentials are provided
const hasValidCredentials = supabaseUrl !== 'https://placeholder.supabase.co' &&
                           supabaseAnonKey !== 'placeholder-key';

export const supabase = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => supabase !== null;
// Cross-app authentication token for secure communication
export const generateCrossAppToken = (userEmail: string, appName: string) => {
  const payload = {
    email: userEmail,
    app: appName,
    timestamp: Date.now()
  };
  return btoa(JSON.stringify(payload));
};

export const parseCrossAppToken = (token: string) => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

export interface UserProfile {
  id: string;
  email: string | null;
  username: string;
  country: string | null;
  chip_total: number;
  chips_purchased: number;
  purchase_total: number;
  level: number;
  uid: string | null;
  created_at: string;
  last_login: string;
  is_banned: boolean;
  ban_reason: string | null;
  banned_at: string | null;
  banned_by: string | null;
  updated_at: string;
}

// Cross-app authentication function
export const authenticateCrossApp = async (userEmail: string, appName: string) => {
  const { data, error } = await supabase.rpc('authenticate_cross_app', {
    user_email: userEmail,
    app_name: appName
  });
  
  if (error) throw error;
  return data;
};

// Update game stats from external apps
export const updateGameStats = async (
  userEmail: string, 
  appName: string, 
  statsUpdate: Record<string, any>, 
  chipsChange: number = 0
) => {
  const { data, error } = await supabase.rpc('update_game_stats', {
    user_email: userEmail,
    app_name: appName,
    stats_update: statsUpdate,
    chips_change: chipsChange
  });
  
  if (error) throw error;
  return data;
};

// Grant app permission to user profile
export const grantAppPermission = async (userId: string, appName: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('app_permissions')
    .eq('id', userId)
    .single();
    
  if (profile) {
    const updatedPermissions = {
      ...profile.app_permissions,
      [appName]: true
    };
    
    const { error } = await supabase
      .from('profiles')
      .update({ app_permissions: updatedPermissions })
      .eq('id', userId);
      
    if (error) throw error;
  }
}
