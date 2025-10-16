/*
  # Fix Racing Suits Missions - Use Chips Instead of Star Points

  1. Updates
    - Change all "star points" references to "chips" in mission descriptions
    - Update mission types from star-based to chip-based
    - Keep reward_chips as star points (rewards for completing missions)
    - Fix target values to be realistic for chip amounts

  2. Mission Logic
    - Players win/lose chips during gameplay
    - Players earn star points by completing missions
    - Missions track chip-based achievements
*/

-- Update all missions to use chips instead of star points
UPDATE racing_suits_missions SET
  title = 'First Victory',
  description = 'Win your first 25 chips in Racing Suits',
  target_value = 25
WHERE title = 'First Steps';

UPDATE racing_suits_missions SET
  title = 'Getting Lucky',
  description = 'Win 100 chips total across all races',
  target_value = 100
WHERE title = 'Getting Started';

UPDATE racing_suits_missions SET
  title = 'Chip Collector',
  description = 'Win 500 chips total in Racing Suits',
  target_value = 500
WHERE title = 'Star Collector';

UPDATE racing_suits_missions SET
  title = 'Big Winner',
  description = 'Win 2000 chips total across all your races',
  target_value = 2000
WHERE title = 'Star Millionaire';

UPDATE racing_suits_missions SET
  title = 'Small Bettor',
  description = 'Wager 50 chips total across all bets',
  target_value = 50
WHERE title = 'Small Gambler';

UPDATE racing_suits_missions SET
  title = 'Medium Bettor',
  description = 'Wager 500 chips total across all your bets',
  target_value = 500
WHERE title = 'Medium Roller';

UPDATE racing_suits_missions SET
  title = 'High Bettor',
  description = 'Wager 2000 chips total across all your bets',
  target_value = 2000
WHERE title = 'High Roller';

-- Update mission types to reflect chip-based tracking
UPDATE racing_suits_missions SET
  mission_type = 'chips_won'
WHERE mission_type = 'chips_won' OR title IN ('First Victory', 'Getting Lucky', 'Chip Collector', 'Big Winner');

UPDATE racing_suits_missions SET
  mission_type = 'total_wagered'
WHERE title IN ('Small Bettor', 'Medium Bettor', 'High Bettor');