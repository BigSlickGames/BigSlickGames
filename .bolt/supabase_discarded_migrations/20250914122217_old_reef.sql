/*
  # Create individual game statistics tables

  1. New Tables
    - `stackem_stats` - 21 Stack'em game statistics
    - `holdem_stats` - 21 Hold'em game statistics  
    - `multiup_stats` - 21 Multi'Up game statistics
    - `deck_realms_stats` - Deck Realms game statistics
    - `pokeroply_stats` - Poker'oply game statistics
    - `space_crash_stats` - Space Crash game statistics
    - `integration_test_stats` - Integration Test game statistics

  2. Common Fields
    - Game-specific statistics (scores, levels, rounds, etc.)
    - Session tracking
    - Performance metrics
    - Timestamps for activity tracking

  3. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own stats
    - Add policies for reading aggregate data
*/

-- 21 Stack'em Statistics
CREATE TABLE IF NOT EXISTS stackem_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid DEFAULT gen_random_uuid(),
  score bigint NOT NULL DEFAULT 0,
  level_reached integer NOT NULL DEFAULT 1,
  blocks_placed integer NOT NULL DEFAULT 0,
  perfect_stacks integer NOT NULL DEFAULT 0,
  combo_max integer NOT NULL DEFAULT 0,
  time_played_seconds integer NOT NULL DEFAULT 0,
  game_result text NOT NULL CHECK (game_result IN ('win', 'loss', 'quit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stackem_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own stackem stats"
  ON stackem_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own stackem stats"
  ON stackem_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read aggregate stackem stats"
  ON stackem_stats FOR SELECT TO authenticated
  USING (true);

-- 21 Hold'em Statistics
CREATE TABLE IF NOT EXISTS holdem_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid DEFAULT gen_random_uuid(),
  hands_played integer NOT NULL DEFAULT 0,
  hands_won integer NOT NULL DEFAULT 0,
  best_hand text,
  total_bet bigint NOT NULL DEFAULT 0,
  biggest_win bigint NOT NULL DEFAULT 0,
  consecutive_wins integer NOT NULL DEFAULT 0,
  time_played_seconds integer NOT NULL DEFAULT 0,
  game_result text NOT NULL CHECK (game_result IN ('win', 'loss', 'quit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE holdem_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own holdem stats"
  ON holdem_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own holdem stats"
  ON holdem_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read aggregate holdem stats"
  ON holdem_stats FOR SELECT TO authenticated
  USING (true);

-- 21 Multi'Up Statistics
CREATE TABLE IF NOT EXISTS multiup_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid DEFAULT gen_random_uuid(),
  levels_completed integer NOT NULL DEFAULT 0,
  highest_level integer NOT NULL DEFAULT 1,
  total_multiplier numeric(10,2) NOT NULL DEFAULT 1.0,
  best_multiplier numeric(10,2) NOT NULL DEFAULT 1.0,
  rounds_played integer NOT NULL DEFAULT 0,
  perfect_rounds integer NOT NULL DEFAULT 0,
  time_played_seconds integer NOT NULL DEFAULT 0,
  game_result text NOT NULL CHECK (game_result IN ('win', 'loss', 'quit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE multiup_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own multiup stats"
  ON multiup_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own multiup stats"
  ON multiup_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read aggregate multiup stats"
  ON multiup_stats FOR SELECT TO authenticated
  USING (true);

-- Deck Realms Statistics
CREATE TABLE IF NOT EXISTS deck_realms_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid DEFAULT gen_random_uuid(),
  cards_played integer NOT NULL DEFAULT 0,
  decks_built integer NOT NULL DEFAULT 0,
  battles_won integer NOT NULL DEFAULT 0,
  battles_lost integer NOT NULL DEFAULT 0,
  rare_cards_found integer NOT NULL DEFAULT 0,
  deck_power_max integer NOT NULL DEFAULT 0,
  time_played_seconds integer NOT NULL DEFAULT 0,
  game_result text NOT NULL CHECK (game_result IN ('win', 'loss', 'quit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deck_realms_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own deck_realms stats"
  ON deck_realms_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own deck_realms stats"
  ON deck_realms_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read aggregate deck_realms stats"
  ON deck_realms_stats FOR SELECT TO authenticated
  USING (true);

-- Poker'oply Statistics
CREATE TABLE IF NOT EXISTS pokeroply_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid DEFAULT gen_random_uuid(),
  properties_owned integer NOT NULL DEFAULT 0,
  rent_collected bigint NOT NULL DEFAULT 0,
  poker_hands_won integer NOT NULL DEFAULT 0,
  poker_hands_played integer NOT NULL DEFAULT 0,
  monopolies_achieved integer NOT NULL DEFAULT 0,
  trades_completed integer NOT NULL DEFAULT 0,
  time_played_seconds integer NOT NULL DEFAULT 0,
  game_result text NOT NULL CHECK (game_result IN ('win', 'loss', 'quit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pokeroply_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own pokeroply stats"
  ON pokeroply_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own pokeroply stats"
  ON pokeroply_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read aggregate pokeroply stats"
  ON pokeroply_stats FOR SELECT TO authenticated
  USING (true);

-- Space Crash Statistics
CREATE TABLE IF NOT EXISTS space_crash_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid DEFAULT gen_random_uuid(),
  distance_traveled bigint NOT NULL DEFAULT 0,
  crashes_survived integer NOT NULL DEFAULT 0,
  fuel_collected integer NOT NULL DEFAULT 0,
  obstacles_avoided integer NOT NULL DEFAULT 0,
  power_ups_used integer NOT NULL DEFAULT 0,
  best_distance bigint NOT NULL DEFAULT 0,
  time_played_seconds integer NOT NULL DEFAULT 0,
  game_result text NOT NULL CHECK (game_result IN ('win', 'loss', 'quit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE space_crash_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own space_crash stats"
  ON space_crash_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own space_crash stats"
  ON space_crash_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read aggregate space_crash stats"
  ON space_crash_stats FOR SELECT TO authenticated
  USING (true);

-- Integration Test Statistics
CREATE TABLE IF NOT EXISTS integration_test_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid DEFAULT gen_random_uuid(),
  tests_completed integer NOT NULL DEFAULT 0,
  tests_passed integer NOT NULL DEFAULT 0,
  features_tested integer NOT NULL DEFAULT 0,
  bugs_found integer NOT NULL DEFAULT 0,
  integration_score integer NOT NULL DEFAULT 0,
  time_played_seconds integer NOT NULL DEFAULT 0,
  game_result text NOT NULL CHECK (game_result IN ('win', 'loss', 'quit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE integration_test_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own integration_test stats"
  ON integration_test_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own integration_test stats"
  ON integration_test_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read aggregate integration_test stats"
  ON integration_test_stats FOR SELECT TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stackem_stats_user_created ON stackem_stats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stackem_stats_created_at ON stackem_stats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_holdem_stats_user_created ON holdem_stats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holdem_stats_created_at ON holdem_stats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_multiup_stats_user_created ON multiup_stats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_multiup_stats_created_at ON multiup_stats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deck_realms_stats_user_created ON deck_realms_stats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deck_realms_stats_created_at ON deck_realms_stats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pokeroply_stats_user_created ON pokeroply_stats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pokeroply_stats_created_at ON pokeroply_stats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_space_crash_stats_user_created ON space_crash_stats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_space_crash_stats_created_at ON space_crash_stats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_integration_test_stats_user_created ON integration_test_stats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_test_stats_created_at ON integration_test_stats(created_at DESC);