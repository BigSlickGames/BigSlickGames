/*
  # Fix profiles table INSERT policy

  1. Security Policy Update
    - Add INSERT policy for authenticated users to create their own profiles
    - Allow users to insert profiles where the id matches their auth.uid()

  This fixes the "new row violates row-level security policy" error when users
  try to create their profile for the first time.
*/

-- Add INSERT policy for profiles table
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());