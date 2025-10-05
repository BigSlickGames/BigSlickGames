/*
  # Create User Profiles System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `username` (text, unique)
      - `country` (text, nullable)
      - `chip_total` (bigint, default 5000)
      - `chips_purchased` (bigint, default 0)
      - `purchase_total` (numeric, default 0)
      - `level` (integer, default 1)
      - `uid` (uuid, nullable)
      - `created_at` (timestamptz, default now())
      - `last_login` (timestamptz, default now())
      - `is_banned` (boolean, default false)
      - `ban_reason` (text, nullable)
      - `banned_at` (timestamptz, nullable)
      - `banned_by` (uuid, nullable)
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to read/update their own data
    - Add policy for users to read other users' basic info

  3. Functions
    - Create trigger to update `updated_at` timestamp
    - Create function to handle user registration
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  country text,
  chip_total bigint DEFAULT 5000 NOT NULL,
  chips_purchased bigint DEFAULT 0 NOT NULL,
  purchase_total numeric DEFAULT 0 NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  uid uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_login timestamptz DEFAULT now() NOT NULL,
  is_banned boolean DEFAULT false NOT NULL,
  ban_reason text,
  banned_at timestamptz,
  banned_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read other users basic info"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username, uid)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.id
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();