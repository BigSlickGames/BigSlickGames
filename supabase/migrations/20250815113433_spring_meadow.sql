/*
  # Add theme preferences to profiles

  1. Changes
    - Add `theme_preference` column for storing user's selected theme
    - Add `preferences` JSONB column for extensible user preferences
    - Set default values for existing users

  2. Security
    - No changes to RLS policies needed
    - Users can update their own preferences via existing policies
*/

-- Add theme preference column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'theme_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN theme_preference text DEFAULT 'orange';
  END IF;
END $$;

-- Add preferences JSONB column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferences jsonb DEFAULT '{"sound": true, "theme": "orange", "notifications": true}'::jsonb;
  END IF;
END $$;