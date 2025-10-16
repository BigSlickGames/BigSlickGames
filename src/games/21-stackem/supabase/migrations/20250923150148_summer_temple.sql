/*
  # Fix Racing Suits User Mission Completion Status

  1. Updates
    - Set all missions to incomplete (is_completed = false)
    - Clear claimed_at timestamps since missions aren't actually completed
    - Keep realistic progress values that don't meet targets

  2. Logic
    - If progress < target_value, then is_completed = false and claimed_at = null
    - Only missions that have progress >= target_value should be completable
*/

-- Update all user missions to reflect proper completion status
UPDATE racing_suits_user_missions 
SET 
  is_completed = false,
  claimed_at = null
WHERE progress < (
  SELECT target_value 
  FROM racing_suits_missions 
  WHERE racing_suits_missions.id = racing_suits_user_missions.mission_id
);

-- Only mark as completed if progress actually meets or exceeds target
UPDATE racing_suits_user_missions 
SET 
  is_completed = true,
  completed_at = now()
WHERE progress >= (
  SELECT target_value 
  FROM racing_suits_missions 
  WHERE racing_suits_missions.id = racing_suits_user_missions.mission_id
) AND is_completed = false;