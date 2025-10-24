/*
  # Create Mystery Cards System

  1. New Tables
    - `mystery_cards`
      - `id` (uuid, primary key)
      - `type` (text) - 'question' or 'action'
      - `category` (text) - poker concept category
      - `content` (text) - question text or action description
      - `options` (jsonb) - for multiple choice questions
      - `correct_answer` (text) - correct option for questions
      - `reward` (integer) - chips reward for correct answer
      - `penalty` (integer) - chips penalty for wrong answer or action
      - `action_type` (text) - type of action if applicable
      - `difficulty` (text) - 'easy', 'medium', 'hard'
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `mystery_cards` table
    - Add policy for public read access (game content)
*/

CREATE TABLE IF NOT EXISTS mystery_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('question', 'action')),
  category text NOT NULL,
  content text NOT NULL,
  options jsonb,
  correct_answer text,
  reward integer DEFAULT 0,
  penalty integer DEFAULT 0,
  action_type text,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mystery_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mystery cards"
  ON mystery_cards
  FOR SELECT
  TO anon, authenticated
  USING (true);
