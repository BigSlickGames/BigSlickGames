/*
  # Add more Racing Suits missions with star points

  1. New Missions
    - Additional varied missions for Racing Suits game
    - All rewards changed to star points instead of XP
    - More diverse mission types and difficulties
  
  2. Updates
    - Remove XP rewards, focus on star points
    - Add more engaging mission descriptions
    - Better progression curve
*/

-- First, let's clear existing missions and add new ones
DELETE FROM racing_suits_missions;

-- Insert comprehensive mission set with star points only
INSERT INTO racing_suits_missions (title, description, mission_type, target_value, reward_chips, difficulty, sort_order) VALUES
-- Easy missions (quick wins)
('First Race', 'Complete your first race', 'games_played', 1, 50, 'easy', 1),
('Lucky Beginner', 'Win 100 chips total', 'chips_won', 100, 75, 'easy', 2),
('Live Better', 'Place 5 live bets', 'live_bets', 5, 100, 'easy', 3),
('Small Spender', 'Wager 200 chips total', 'total_wagered', 200, 125, 'easy', 4),
('Hearts Winner', 'Win 2 races with Hearts', 'specific_suit_wins', 2, 150, 'easy', 5),

-- Medium missions (moderate challenges)
('Racing Enthusiast', 'Complete 10 races', 'games_played', 10, 200, 'medium', 6),
('Chip Collector', 'Win 500 chips total', 'chips_won', 500, 250, 'medium', 7),
('Live Action Hero', 'Place 25 live bets', 'live_bets', 25, 300, 'medium', 8),
('Medium Roller', 'Wager 1000 chips total', 'total_wagered', 1000, 350, 'medium', 9),
('Diamonds Specialist', 'Win 5 races with Diamonds', 'specific_suit_wins', 5, 400, 'medium', 10),
('Double Winner', 'Win 2 races in a row', 'win_streak', 2, 450, 'medium', 11),

-- Hard missions (long-term goals)
('Racing Veteran', 'Complete 50 races', 'games_played', 50, 500, 'hard', 12),
('Chip Master', 'Win 2000 chips total', 'chips_won', 2000, 600, 'hard', 13),
('Live Betting Pro', 'Place 100 live bets', 'live_bets', 100, 700, 'hard', 14),
('High Roller', 'Wager 5000 chips total', 'total_wagered', 5000, 800, 'hard', 15),
('Clubs Champion', 'Win 10 races with Clubs', 'specific_suit_wins', 10, 900, 'hard', 16),
('Triple Threat', 'Win 3 races in a row', 'win_streak', 3, 1000, 'hard', 17),
('Spades Master', 'Win 15 races with Spades', 'specific_suit_wins', 15, 1200, 'hard', 18),
('Racing Legend', 'Complete 100 races', 'games_played', 100, 1500, 'hard', 19),
('Streak Master', 'Win 5 races in a row', 'win_streak', 5, 2000, 'hard', 20);