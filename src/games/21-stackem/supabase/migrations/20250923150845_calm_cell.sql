/*
  # Fix mission descriptions to use "chips" instead of "points"

  1. Updates
    - Change all mission descriptions from "win X points from races" to "win X chips from races"
    - Change "wager X points" to "wager X chips"
    - Keep rewards as "star points" since those are mission rewards

  2. Corrections
    - Races give chips, not points
    - Missions give star points as rewards
    - Descriptions now match actual gameplay
*/

UPDATE racing_suits_missions SET
  description = 'Win 25 chips from races'
WHERE title = 'First Victory';

UPDATE racing_suits_missions SET
  description = 'Win 100 chips from races'
WHERE title = 'Getting Lucky';

UPDATE racing_suits_missions SET
  description = 'Win 500 chips from races'
WHERE title = 'Chip Collector';

UPDATE racing_suits_missions SET
  description = 'Win 2000 chips from races'
WHERE title = 'Big Winner';

UPDATE racing_suits_missions SET
  description = 'Wager 50 chips total across all races'
WHERE title = 'Small Bettor';

UPDATE racing_suits_missions SET
  description = 'Wager 500 chips total across all races'
WHERE title = 'Medium Roller';

UPDATE racing_suits_missions SET
  description = 'Wager 2000 chips total across all races'
WHERE title = 'High Roller';