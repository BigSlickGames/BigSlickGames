/*
  # Add theme preferences to profiles

  1. Changes
    - Add theme_preference column to profiles table
    - Add preferences jsonb column for future extensibility
    - Set default theme to 'orange'

  2. Security
    - Users can update their own theme preferences
    - RLS policies remain unchanged
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

-- Add preferences jsonb column for future extensibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferences jsonb DEFAULT '{"notifications": true, "sound": true, "theme": "orange"}'::jsonb;
  END IF;
END $$;

-- Update existing profiles to have default preferences
UPDATE profiles 
SET preferences = '{"notifications": true, "sound": true, "theme": "orange"}'::jsonb
WHERE preferences IS NULL;