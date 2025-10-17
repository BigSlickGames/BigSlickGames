/*
  # Add updated_at column to profiles table

  1. Schema Changes
    - Add `updated_at` column to `profiles` table
    - Set default value to current timestamp
    - Create trigger to automatically update the column on row modifications

  2. Notes
    - This fixes the "record 'new' has no field 'updated_at'" error
    - The existing trigger `set_profiles_updated_at` expects this column to exist
*/

-- Add the missing updated_at column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Update existing rows to have the current timestamp
UPDATE profiles SET updated_at = now() WHERE updated_at IS NULL;