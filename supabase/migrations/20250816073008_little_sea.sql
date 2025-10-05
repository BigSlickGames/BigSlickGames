/*
  # Fix ambiguous user_id column reference

  1. Updates
    - Fix `end_user_session` function to properly qualify column references
    - Use table aliases to distinguish between parameter and column names
    - Ensure no ambiguous references exist

  2. Changes
    - Qualify all column references with table names/aliases
    - Use proper parameter naming convention
*/

-- Drop and recreate the end_user_session function with proper column qualification
DROP FUNCTION IF EXISTS end_user_session(uuid);

CREATE OR REPLACE FUNCTION end_user_session(session_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_start_time timestamptz;
    session_duration_hours numeric;
BEGIN
    -- Get the current active session start time
    SELECT us.session_start INTO session_start_time
    FROM user_sessions us
    WHERE us.user_id = session_user_id 
    AND us.is_active = true
    ORDER BY us.created_at DESC
    LIMIT 1;

    -- If there's an active session, calculate duration and update totals
    IF session_start_time IS NOT NULL THEN
        -- Calculate session duration in hours
        session_duration_hours := EXTRACT(EPOCH FROM (now() - session_start_time)) / 3600.0;
        
        -- Update the session record
        UPDATE user_sessions us
        SET 
            is_active = false,
            duration_minutes = ROUND(session_duration_hours * 60),
            last_activity = now()
        WHERE us.user_id = session_user_id 
        AND us.is_active = true;
        
        -- Update user's total hours played
        UPDATE profiles p
        SET total_hours_played = COALESCE(p.total_hours_played, 0) + session_duration_hours
        WHERE p.id = session_user_id;
    END IF;
END;
$$;