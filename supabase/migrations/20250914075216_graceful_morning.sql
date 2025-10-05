/*
  # Add level and experience columns to profiles table

  1. New Columns
    - `level` (integer, default 1) - User's current level
    - `experience` (integer, default 0) - User's experience points

  2. Changes
    - Add level column with default value of 1
    - Add experience column with default value of 0
    - Update existing users to have default values
*/

-- Add level column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN level integer DEFAULT 1;
  END IF;
END $$;

-- Add experience column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'experience'
  ) THEN
    ALTER TABLE profiles ADD COLUMN experience integer DEFAULT 0;
  END IF;
END $$;