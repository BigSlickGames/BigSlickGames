/*
  # Add missing columns to profiles table

  1. Missing Columns
    - `app_permissions` (jsonb) - Controls which apps can access user data
    - `game_stats` (jsonb) - Stores per-app game statistics  
    - `preferences` (jsonb) - User preferences and settings
    - `games_played` (integer) - Total games played across all apps
    - `games_won` (integer) - Total games won across all apps

  2. Updates
    - Add default values for new columns
    - Ensure compatibility with existing code
*/

-- Add missing columns to profiles table
DO $$
BEGIN
  -- Add app_permissions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'app_permissions'
  ) THEN
    ALTER TABLE profiles ADD COLUMN app_permissions jsonb DEFAULT '{}';
  END IF;

  -- Add game_stats column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'game_stats'
  ) THEN
    ALTER TABLE profiles ADD COLUMN game_stats jsonb DEFAULT '{}';
  END IF;

  -- Add preferences column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferences jsonb DEFAULT '{"notifications": true, "sound": true, "theme": "dark"}';
  END IF;

  -- Add games_played column (rename from total_games_played if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'games_played'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'total_games_played'
    ) THEN
      ALTER TABLE profiles RENAME COLUMN total_games_played TO games_played;
    ELSE
      ALTER TABLE profiles ADD COLUMN games_played integer DEFAULT 0;
    END IF;
  END IF;

  -- Add games_won column (rename from wins if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'games_won'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'wins'
    ) THEN
      ALTER TABLE profiles RENAME COLUMN wins TO games_won;
    ELSE
      ALTER TABLE profiles ADD COLUMN games_won integer DEFAULT 0;
    END IF;
  END IF;
END $$;