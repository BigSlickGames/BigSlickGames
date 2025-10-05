/*
  # Add Moderation System for Zero Tolerance Policy

  1. New Tables
    - `user_violations` - Track all rule violations
    - `moderation_actions` - Log all moderation actions
    - `banned_ips` - Track banned IP addresses
    - `moderation_settings` - System-wide moderation settings

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access only
    - Add triggers for automatic actions

  3. Functions
    - Auto-suspension function for first violations
    - Auto-ban function for second violations
    - IP tracking and banning
*/

-- User violations tracking
CREATE TABLE IF NOT EXISTS user_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  violation_type text NOT NULL CHECK (violation_type IN ('swearing', 'bullying', 'harassment', 'hate_speech', 'inappropriate_content', 'spam', 'cheating', 'impersonation', 'doxxing', 'other')),
  violation_description text NOT NULL,
  evidence_url text,
  reported_by uuid REFERENCES profiles(id),
  moderator_id uuid REFERENCES profiles(id),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'dismissed', 'appealed')),
  ip_address inet,
  user_agent text,
  location_context text, -- which game, forum section, etc.
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  moderator_notes text
);

-- Moderation actions log
CREATE TABLE IF NOT EXISTS moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  moderator_id uuid REFERENCES profiles(id),
  action_type text NOT NULL CHECK (action_type IN ('warning', 'suspension', 'permanent_ban', 'ip_ban', 'content_removal', 'account_deletion')),
  duration_days integer, -- null for permanent actions
  reason text NOT NULL,
  violation_id uuid REFERENCES user_violations(id),
  automatic boolean DEFAULT false,
  ip_address inet,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  notes text
);

-- Banned IP addresses
CREATE TABLE IF NOT EXISTS banned_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL UNIQUE,
  banned_by uuid REFERENCES profiles(id),
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- null for permanent bans
  is_active boolean DEFAULT true
);

-- Moderation settings
CREATE TABLE IF NOT EXISTS moderation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- Add moderation fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'violation_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN violation_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'suspension_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspension_expires_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_violation_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_violation_at timestamptz;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE user_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only access)
CREATE POLICY "Admin can manage violations"
  ON user_violations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (email LIKE '%@admin.%' OR email = 'admin@gamehub.com' OR username = 'admin')
    )
  );

CREATE POLICY "Admin can manage moderation actions"
  ON moderation_actions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (email LIKE '%@admin.%' OR email = 'admin@gamehub.com' OR username = 'admin')
    )
  );

CREATE POLICY "Admin can manage banned IPs"
  ON banned_ips
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (email LIKE '%@admin.%' OR email = 'admin@gamehub.com' OR username = 'admin')
    )
  );

CREATE POLICY "Admin can manage settings"
  ON moderation_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (email LIKE '%@admin.%' OR email = 'admin@gamehub.com' OR username = 'admin')
    )
  );

-- Users can view their own violations
CREATE POLICY "Users can view own violations"
  ON user_violations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_violations_user_id ON user_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_violations_status ON user_violations(status);
CREATE INDEX IF NOT EXISTS idx_user_violations_created_at ON user_violations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_user_id ON moderation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created_at ON moderation_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banned_ips_ip_address ON banned_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_banned_ips_is_active ON banned_ips(is_active);

-- Function to handle first violation (30-day suspension)
CREATE OR REPLACE FUNCTION handle_first_violation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the user's first confirmed violation
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Update user's violation count
    UPDATE profiles 
    SET 
      violation_count = violation_count + 1,
      last_violation_at = now(),
      suspension_expires_at = CASE 
        WHEN violation_count = 0 THEN now() + INTERVAL '30 days'
        WHEN violation_count >= 1 THEN null -- Will be handled by permanent ban
        ELSE suspension_expires_at
      END,
      is_banned = CASE 
        WHEN violation_count >= 1 THEN true
        ELSE false
      END,
      ban_reason = CASE 
        WHEN violation_count = 0 THEN 'First violation: 30-day suspension'
        WHEN violation_count >= 1 THEN 'Second violation: Permanent ban - All progress lost'
        ELSE ban_reason
      END,
      banned_at = CASE 
        WHEN violation_count = 0 THEN now()
        WHEN violation_count >= 1 THEN now()
        ELSE banned_at
      END
    WHERE id = NEW.user_id;
    
    -- Log the moderation action
    INSERT INTO moderation_actions (
      user_id,
      moderator_id,
      action_type,
      duration_days,
      reason,
      violation_id,
      automatic,
      ip_address
    ) VALUES (
      NEW.user_id,
      NEW.moderator_id,
      CASE 
        WHEN (SELECT violation_count FROM profiles WHERE id = NEW.user_id) = 1 THEN 'suspension'
        ELSE 'permanent_ban'
      END,
      CASE 
        WHEN (SELECT violation_count FROM profiles WHERE id = NEW.user_id) = 1 THEN 30
        ELSE null
      END,
      NEW.violation_description,
      NEW.id,
      true,
      NEW.ip_address
    );
    
    -- If second violation, also ban the IP and delete all progress
    IF (SELECT violation_count FROM profiles WHERE id = NEW.user_id) >= 2 THEN
      -- Ban the IP address
      INSERT INTO banned_ips (ip_address, banned_by, reason)
      VALUES (NEW.ip_address, NEW.moderator_id, 'Second violation - permanent IP ban')
      ON CONFLICT (ip_address) DO NOTHING;
      
      -- Reset all game progress (chips, level, etc.)
      UPDATE profiles 
      SET 
        chip_total = 0,
        chips_purchased = 0,
        purchase_total = 0,
        level = 1
      WHERE id = NEW.user_id;
      
      -- Delete all purchase history
      DELETE FROM purchase_history WHERE user_id = NEW.user_id;
      
      -- Delete all forum content
      UPDATE forum_posts SET is_deleted = true WHERE user_id = NEW.user_id;
      UPDATE forum_threads SET is_deleted = true WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic violation handling
DROP TRIGGER IF EXISTS trigger_handle_violation ON user_violations;
CREATE TRIGGER trigger_handle_violation
  AFTER UPDATE ON user_violations
  FOR EACH ROW
  EXECUTE FUNCTION handle_first_violation();

-- Function to check if user is suspended
CREATE OR REPLACE FUNCTION is_user_suspended(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND (
      is_banned = true 
      OR (suspension_expires_at IS NOT NULL AND suspension_expires_at > now())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if IP is banned
CREATE OR REPLACE FUNCTION is_ip_banned(check_ip inet)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM banned_ips 
    WHERE ip_address = check_ip 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default moderation settings
INSERT INTO moderation_settings (setting_key, setting_value, description) VALUES
  ('zero_tolerance_enabled', 'true', 'Enable zero tolerance policy for swearing and bullying'),
  ('first_violation_days', '30', 'Days for first violation suspension'),
  ('auto_moderation_enabled', 'true', 'Enable automatic moderation actions'),
  ('ip_ban_on_second_violation', 'true', 'Automatically ban IP on second violation'),
  ('delete_progress_on_ban', 'true', 'Delete all game progress on permanent ban')
ON CONFLICT (setting_key) DO NOTHING;