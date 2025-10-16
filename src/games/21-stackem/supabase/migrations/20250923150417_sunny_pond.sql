/*
  # Rewrite all Racing Suits missions

  1. Changes
    - Delete all existing missions
    - Create 20 new missions with fresh content
    - Variety of mission types and difficulties
    - Star point rewards only
    - Clear progression from easy to hard

  2. Mission Types
    - games_played: Complete races
    - chips_won: Win star points
    - live_bets: Place live bets during races
    - win_streak: Win consecutive races
    - specific_suit_wins: Win with specific suits
    - total_wagered: Total amount bet
*/

-- Clear existing missions
DELETE FROM racing_suits_user_missions;
DELETE FROM racing_suits_missions;

-- Insert new missions
INSERT INTO racing_suits_missions (title, description, mission_type, target_value, reward_chips, difficulty, sort_order) VALUES
-- Easy missions (1-7)
('First Steps', 'Complete your first race', 'games_played', 1, 50, 'easy', 1),
('Getting Started', 'Win 25 star points from races', 'chips_won', 25, 75, 'easy', 2),
('Live Action', 'Place 3 live bets during races', 'live_bets', 3, 100, 'easy', 3),
('Hearts Beginner', 'Win 1 race with Hearts', 'specific_suit_wins', 1, 60, 'easy', 4),
('Small Gambler', 'Wager a total of 50 star points', 'total_wagered', 50, 80, 'easy', 5),
('Race Runner', 'Complete 3 races', 'games_played', 3, 120, 'easy', 6),
('Lucky Winner', 'Win 100 star points from races', 'chips_won', 100, 150, 'easy', 7),

-- Medium missions (8-14)
('Race Enthusiast', 'Complete 10 races', 'games_played', 10, 200, 'medium', 8),
('Star Collector', 'Win 500 star points from races', 'chips_won', 500, 300, 'medium', 9),
('Live Betting Fan', 'Place 15 live bets during races', 'live_bets', 15, 250, 'medium', 10),
('Double Victory', 'Win 2 races in a row', 'win_streak', 2, 400, 'medium', 11),
('Diamonds Expert', 'Win 3 races with Diamonds', 'specific_suit_wins', 3, 350, 'medium', 12),
('Medium Roller', 'Wager a total of 500 star points', 'total_wagered', 500, 300, 'medium', 13),
('Consistent Player', 'Complete 25 races', 'games_played', 25, 500, 'medium', 14),

-- Hard missions (15-20)
('Racing Master', 'Complete 50 races', 'games_played', 50, 800, 'hard', 15),
('Star Millionaire', 'Win 2000 star points from races', 'chips_won', 2000, 1000, 'hard', 16),
('Live Betting Pro', 'Place 50 live bets during races', 'live_bets', 50, 750, 'hard', 17),
('Triple Streak', 'Win 3 races in a row', 'win_streak', 3, 1200, 'hard', 18),
('Clubs Champion', 'Win 5 races with Clubs', 'specific_suit_wins', 5, 900, 'hard', 19),
('High Roller', 'Wager a total of 2000 star points', 'total_wagered', 2000, 1500, 'hard', 20);