/*
  # Reset all user missions to zero progress

  1. Updates
    - Set all progress to 0 (no games played yet)
    - Set all missions as not completed
    - Remove all claimed timestamps
    - Remove all completed timestamps

  2. Security
    - Maintains existing RLS policies
*/

-- Reset all user mission progress to zero since no games have been played
UPDATE racing_suits_user_missions 
SET 
  progress = 0,
  is_completed = false,
  completed_at = null,
  claimed_at = null;