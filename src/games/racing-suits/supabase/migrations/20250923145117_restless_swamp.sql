/*
  # Racing Suits Missions System

  1. New Tables
    - `racing_suits_missions`
      - `id` (uuid, primary key)
      - `title` (text, mission name)
      - `description` (text, mission description)
      - `mission_type` (text, type of mission)
      - `target_value` (integer, target to achieve)
      - `reward_chips` (integer, chip reward)
      - `reward_xp` (integer, experience reward)
      - `difficulty` (text, easy/medium/hard)
      - `is_active` (boolean, if mission is available)
      - `sort_order` (integer, display order)
      - `created_at` (timestamp)

    - `racing_suits_user_missions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `mission_id` (uuid, foreign key to missions)
      - `progress` (integer, current progress)
      - `is_completed` (boolean, completion status)
      - `completed_at` (timestamp, when completed)
      - `claimed_at` (timestamp, when reward claimed)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can read all active missions
    - Users can read/update their own mission progress
    - Users can insert their own mission records
*/

-- Create racing suits missions table
CREATE TABLE IF NOT EXISTS racing_suits_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  mission_type text NOT NULL CHECK (mission_type IN ('games_played', 'chips_won', 'live_bets', 'win_streak', 'specific_suit_wins', 'total_wagered')),
  target_value integer NOT NULL DEFAULT 1,
  reward_chips integer NOT NULL DEFAULT 0,
  reward_xp integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user missions progress table
CREATE TABLE IF NOT EXISTS racing_suits_user_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id uuid NOT NULL REFERENCES racing_suits_missions(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Enable RLS
ALTER TABLE racing_suits_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE racing_suits_user_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missions
CREATE POLICY "Anyone can read active missions"
  ON racing_suits_missions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user missions
CREATE POLICY "Users can read own mission progress"
  ON racing_suits_user_missions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own mission progress"
  ON racing_suits_user_missions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own mission progress"
  ON racing_suits_user_missions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_racing_suits_missions_active ON racing_suits_missions(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_racing_suits_user_missions_user_id ON racing_suits_user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_racing_suits_user_missions_mission_id ON racing_suits_user_missions(mission_id);
CREATE INDEX IF NOT EXISTS idx_racing_suits_user_missions_completed ON racing_suits_user_missions(user_id, is_completed);

-- Insert sample missions
INSERT INTO racing_suits_missions (title, description, mission_type, target_value, reward_chips, reward_xp, difficulty, sort_order) VALUES
('First Steps', 'Play your first Racing Suits game', 'games_played', 1, 100, 50, 'easy', 1),
('Getting Started', 'Win 500 chips in total', 'chips_won', 500, 200, 100, 'easy', 2),
('Live Action', 'Place 10 live bets during races', 'live_bets', 10, 300, 150, 'easy', 3),
('Suit Master', 'Win 5 games with Hearts', 'specific_suit_wins', 5, 500, 250, 'medium', 4),
('High Roller', 'Wager 2000 chips in total', 'total_wagered', 2000, 400, 200, 'medium', 5),
('Win Streak', 'Win 3 games in a row', 'win_streak', 3, 750, 400, 'medium', 6),
('Racing Veteran', 'Play 50 Racing Suits games', 'games_played', 50, 1000, 500, 'hard', 7),
('Chip Collector', 'Win 10000 chips in total', 'chips_won', 10000, 2000, 1000, 'hard', 8),
('Live Betting Pro', 'Place 100 live bets during races', 'live_bets', 100, 1500, 750, 'hard', 9),
('Diamond Dynasty', 'Win 20 games with Diamonds', 'specific_suit_wins', 20, 3000, 1500, 'hard', 10);