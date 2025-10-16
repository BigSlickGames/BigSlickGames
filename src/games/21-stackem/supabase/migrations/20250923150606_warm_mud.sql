/*
  # Reset All User Missions

  1. Changes
    - Reset all user mission progress to 0
    - Mark all missions as not completed
    - Clear all claimed timestamps
    - Ensure fresh start for all users

  2. Security
    - Updates existing user mission records
    - Maintains user associations
*/

-- Reset all user missions to starting state
UPDATE racing_suits_user_missions 
SET 
  progress = 0,
  is_completed = false,
  completed_at = null,
  claimed_at = null
WHERE true;

-- Also delete any orphaned user mission records and let them be recreated fresh
DELETE FROM racing_suits_user_missions WHERE true;