/*
  # Create Shop and Purchase System

  1. New Tables
    - `shop_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `item_type` (text)
      - `price_real_money` (numeric)
      - `chip_amount` (bigint)
      - `image_url` (text, nullable)
      - `sort_order` (integer)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())

    - `purchase_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `shop_item_id` (uuid, references shop_items)
      - `chips_awarded` (bigint)
      - `price_paid` (numeric)
      - `purchase_source` (text)
      - `package_name` (text)
      - `is_bonus` (boolean, default false)
      - `bonus_amount` (bigint, default 0)
      - `transaction_type` (text)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for shop access and purchase history
*/

-- Create shop_items table
CREATE TABLE IF NOT EXISTS shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  item_type text NOT NULL,
  price_real_money numeric NOT NULL,
  chip_amount bigint NOT NULL,
  image_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create purchase_history table
CREATE TABLE IF NOT EXISTS purchase_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  shop_item_id uuid REFERENCES shop_items(id),
  chips_awarded bigint NOT NULL,
  price_paid numeric DEFAULT 0,
  purchase_source text DEFAULT 'store',
  package_name text,
  is_bonus boolean DEFAULT false,
  bonus_amount bigint DEFAULT 0,
  transaction_type text DEFAULT 'purchase',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

-- Shop items policies (everyone can read)
CREATE POLICY "Anyone can read shop items"
  ON shop_items
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Purchase history policies
CREATE POLICY "Users can read own purchase history"
  ON purchase_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own purchases"
  ON purchase_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert default shop items
INSERT INTO shop_items (id, name, description, item_type, price_real_money, chip_amount, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Starter Pack', 'Perfect for beginners', 'chips', 0.99, 1000, 1),
('550e8400-e29b-41d4-a716-446655440002', 'Value Pack', 'Most popular choice', 'chips', 4.99, 5000, 2),
('550e8400-e29b-41d4-a716-446655440003', 'Premium Pack', 'Great value for serious players', 'chips', 9.99, 12000, 3),
('550e8400-e29b-41d4-a716-446655440004', 'Mega Pack', 'Maximum chips for pros', 'chips', 19.99, 25000, 4),
('550e8400-e29b-41d4-a716-446655440005', 'Ultimate Pack', 'The ultimate gaming experience', 'chips', 49.99, 75000, 5),
('550e8400-e29b-41d4-a716-446655440006', 'Legendary Pack', 'For the ultimate high roller', 'chips', 99.99, 200000, 6);