-- Migration: Restructure profiles into 3 normalized tables
-- This migration will:
-- 1. Create new tables: profiles, user_wallet, user_preferences
-- 2. Migrate existing data
-- 3. Drop old columns from profiles table

-- ============================================
-- 1. CREATE NEW PROFILES TABLE (minimal core data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles_new (
  id uuid NOT NULL,
  username text NOT NULL,
  email text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_new_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_new_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- ============================================
-- 2. CREATE USER_WALLET TABLE (economy & progression)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_wallet (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chips integer NOT NULL DEFAULT 15000,
  bankroll bigint NOT NULL DEFAULT 0,
  chips_won_total bigint NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  experience integer NOT NULL DEFAULT 0,
  games_played integer NOT NULL DEFAULT 0,
  games_won integer NOT NULL DEFAULT 0,
  total_hours_played numeric(10, 2) NOT NULL DEFAULT 0,
  games_won_by_type jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_wallet_pkey PRIMARY KEY (id),
  CONSTRAINT user_wallet_user_id_key UNIQUE (user_id),
  CONSTRAINT user_wallet_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles_new (id) ON DELETE CASCADE
);

-- ============================================
-- 3. CREATE USER_PREFERENCES TABLE (settings & permissions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  theme_preference text NOT NULL DEFAULT 'orange',
  preferences jsonb NOT NULL DEFAULT '{"sound": true, "theme": "orange", "notifications": true}'::jsonb,
  app_permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  game_stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles_new (id) ON DELETE CASCADE
);

-- ============================================
-- 4. MIGRATE EXISTING DATA
-- ============================================

-- Migrate to profiles_new
INSERT INTO public.profiles_new (id, username, email, created_at, updated_at)
SELECT 
  id, 
  COALESCE(username, 'Player_' || substring(id::text, 1, 8)),
  email,
  created_at,
  COALESCE(updated_at, now())
FROM public.profiles
ON CONFLICT (id) DO NOTHING;

-- Migrate to user_wallet
INSERT INTO public.user_wallet (
  user_id, chips, bankroll, chips_won_total, level, experience,
  games_played, games_won, total_hours_played, games_won_by_type, created_at, updated_at
)
SELECT 
  id,
  COALESCE(chips_balance, chips, 15000),
  COALESCE(bankroll, 0),
  COALESCE(chips_won_total, 0),
  COALESCE(level, 1),
  COALESCE(experience, 0),
  COALESCE(games_played, 0),
  COALESCE(games_won, 0),
  COALESCE(total_hours_played, 0),
  COALESCE(games_won_by_type, '{}'::jsonb),
  created_at,
  COALESCE(updated_at, now())
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Migrate to user_preferences
INSERT INTO public.user_preferences (
  user_id, theme_preference, preferences, app_permissions, game_stats, created_at, updated_at
)
SELECT 
  id,
  COALESCE(theme_preference, 'orange'),
  COALESCE(preferences, '{"sound": true, "theme": "orange", "notifications": true}'::jsonb),
  COALESCE(app_permissions, '{}'::jsonb),
  COALESCE(game_stats, '{}'::jsonb),
  created_at,
  COALESCE(updated_at, now())
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 5. DROP OLD TABLE AND RENAME NEW ONE
-- ============================================

-- Drop old profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Rename new table to profiles
ALTER TABLE public.profiles_new RENAME TO profiles;

-- ============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_wallet_user_id ON public.user_wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ============================================
-- 7. CREATE UPDATED_AT TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_wallet
DROP TRIGGER IF EXISTS set_user_wallet_updated_at ON public.user_wallet;
CREATE TRIGGER set_user_wallet_updated_at
  BEFORE UPDATE ON public.user_wallet
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences
DROP TRIGGER IF EXISTS set_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User wallet policies
CREATE POLICY "Users can view their own wallet"
  ON public.user_wallet FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON public.user_wallet FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
  ON public.user_wallet FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_wallet TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Your database is now restructured into 3 clean tables:
-- 1. profiles - core user identity
-- 2. user_wallet - economy and game progression
-- 3. user_preferences - settings and permissions