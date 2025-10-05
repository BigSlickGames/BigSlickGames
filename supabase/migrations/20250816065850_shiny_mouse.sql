/*
  # Create Leaderboard System

  1. New Tables
    - `user_sessions` - Track login sessions and hours played
    - `game_results` - Track individual game results and chips won
    - `leaderboards` - Cached leaderboard data for performance
    
  2. New Columns
    - Add `total_hours_played` to profiles
    - Add `chips_won_total` to profiles (excluding purchases)
    - Add `games_won_by_type` JSONB to profiles
    
  3. Functions
    - Update session tracking
    - Calculate leaderboard rankings
    - Track game results
    
  4. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Add new columns to profiles for leaderboard tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_hours_played DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS chips_won_total BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS games_won_by_type JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS current_session_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT now();

-- Create game_results table to track individual game outcomes
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  chips_won BIGINT NOT NULL, -- Can be negative for losses
  chips_bet BIGINT NOT NULL,
  game_duration_minutes INTEGER,
  result_type TEXT NOT NULL CHECK (result_type IN ('win', 'loss', 'draw')),
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game_type ON game_results(game_type);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_chips_won ON game_results(chips_won DESC);

-- Create leaderboards table for cached rankings
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type TEXT NOT NULL,
  game_type TEXT, -- NULL for global leaderboards
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  value BIGINT NOT NULL,
  rank INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(leaderboard_type, game_type, user_id)
);

-- Create indexes for leaderboards
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_rank ON leaderboards(leaderboard_type, game_type, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);

-- Enable RLS
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_results
CREATE POLICY "Users can insert own game results"
  ON game_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own game results"
  ON game_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all game results"
  ON game_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.email LIKE '%@admin.%' OR profiles.email = 'admin@gamehub.com' OR profiles.username = 'admin')
    )
  );

-- RLS Policies for leaderboards (public read)
CREATE POLICY "Anyone can read leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage leaderboards"
  ON leaderboards FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.email LIKE '%@admin.%' OR profiles.email = 'admin@gamehub.com' OR profiles.username = 'admin')
    )
  );

-- Function to start a user session
CREATE OR REPLACE FUNCTION start_user_session(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
BEGIN
  -- Generate new session ID
  session_id := gen_random_uuid();
  
  -- Update user's current session
  UPDATE profiles 
  SET 
    current_session_start = now(),
    last_activity = now()
  WHERE id = user_id;
  
  -- Insert session record
  INSERT INTO user_sessions (id, user_id, session_token, last_activity, is_active)
  VALUES (session_id, user_id, session_id::text, now(), true);
  
  RETURN session_id;
END;
$$;

-- Function to end user session and calculate hours
CREATE OR REPLACE FUNCTION end_user_session(user_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_hours DECIMAL(10,2);
  session_start TIMESTAMPTZ;
BEGIN
  -- Get current session start time
  SELECT current_session_start INTO session_start
  FROM profiles 
  WHERE id = user_id;
  
  IF session_start IS NOT NULL THEN
    -- Calculate hours played in this session
    session_hours := EXTRACT(EPOCH FROM (now() - session_start)) / 3600.0;
    
    -- Update total hours and clear current session
    UPDATE profiles 
    SET 
      total_hours_played = COALESCE(total_hours_played, 0) + session_hours,
      current_session_start = NULL,
      last_activity = now()
    WHERE id = user_id;
    
    -- Mark session as inactive
    UPDATE user_sessions 
    SET is_active = false, last_activity = now()
    WHERE user_id = user_id AND is_active = true;
    
    RETURN session_hours;
  END IF;
  
  RETURN 0;
END;
$$;

-- Function to record game result
CREATE OR REPLACE FUNCTION record_game_result(
  p_user_id UUID,
  p_game_type TEXT,
  p_chips_won BIGINT,
  p_chips_bet BIGINT,
  p_result_type TEXT,
  p_game_duration_minutes INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_games_won JSONB;
  new_games_won JSONB;
  current_count INTEGER;
BEGIN
  -- Insert game result
  INSERT INTO game_results (user_id, game_type, chips_won, chips_bet, result_type, game_duration_minutes)
  VALUES (p_user_id, p_game_type, p_chips_won, p_chips_bet, p_result_type, p_game_duration_minutes);
  
  -- Update user's total chips won (only if positive)
  IF p_chips_won > 0 THEN
    UPDATE profiles 
    SET chips_won_total = COALESCE(chips_won_total, 0) + p_chips_won
    WHERE id = p_user_id;
  END IF;
  
  -- Update games won by type if it's a win
  IF p_result_type = 'win' THEN
    SELECT games_won_by_type INTO current_games_won
    FROM profiles 
    WHERE id = p_user_id;
    
    -- Get current count for this game type
    current_count := COALESCE((current_games_won ->> p_game_type)::INTEGER, 0);
    
    -- Increment count
    new_games_won := jsonb_set(
      COALESCE(current_games_won, '{}'),
      ARRAY[p_game_type],
      to_jsonb(current_count + 1)
    );
    
    -- Update profile
    UPDATE profiles 
    SET games_won_by_type = new_games_won
    WHERE id = p_user_id;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to refresh leaderboards
CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear existing leaderboards
  DELETE FROM leaderboards;
  
  -- Chips Won Leaderboard
  INSERT INTO leaderboards (leaderboard_type, user_id, username, value, rank)
  SELECT 
    'chips_won',
    id,
    username,
    chips_won_total,
    ROW_NUMBER() OVER (ORDER BY chips_won_total DESC)
  FROM profiles 
  WHERE chips_won_total > 0
  ORDER BY chips_won_total DESC
  LIMIT 100;
  
  -- Hours Played Leaderboard
  INSERT INTO leaderboards (leaderboard_type, user_id, username, value, rank)
  SELECT 
    'hours_played',
    id,
    username,
    FLOOR(total_hours_played)::BIGINT,
    ROW_NUMBER() OVER (ORDER BY total_hours_played DESC)
  FROM profiles 
  WHERE total_hours_played > 0
  ORDER BY total_hours_played DESC
  LIMIT 100;
  
  -- Games Won by Type Leaderboards
  INSERT INTO leaderboards (leaderboard_type, game_type, user_id, username, value, rank)
  SELECT 
    'games_won',
    game_type,
    id,
    username,
    wins,
    ROW_NUMBER() OVER (PARTITION BY game_type ORDER BY wins DESC)
  FROM (
    SELECT 
      id,
      username,
      game_type,
      (games_won_by_type ->> game_type)::INTEGER as wins
    FROM profiles,
    LATERAL jsonb_each_text(games_won_by_type) as game_data(game_type, wins_text)
    WHERE (games_won_by_type ->> game_type)::INTEGER > 0
  ) game_wins
  ORDER BY game_type, wins DESC;
  
  RETURN true;
END;
$$;

-- Create trigger to update last_activity on profile updates
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_last_activity
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

-- Initial leaderboard refresh
SELECT refresh_leaderboards();