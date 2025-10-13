/*
  # Remove Lucky Star Mission

  1. Changes
    - Delete the "Lucky Star" mission from racing_suits_missions table
    - Clean up any user progress for this mission
*/

-- Remove the Lucky Star mission
DELETE FROM racing_suits_missions 
WHERE title = 'Lucky Star';

-- Clean up any user mission progress for this mission
DELETE FROM racing_suits_user_missions 
WHERE mission_id IN (
  SELECT id FROM racing_suits_missions WHERE title = 'Lucky Star'
);