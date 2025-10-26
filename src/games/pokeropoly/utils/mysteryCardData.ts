export interface MysteryCard {
  id: string;
  type: 'question' | 'action';
  category: string;
  content: string;
  options?: string[];
  correct_answer?: string;
  reward: number;
  penalty: number;
  action_type?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const mysteryCards: Omit<MysteryCard, 'id'>[] = [
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'Which poker hand ranks higher?',
    options: ['Full House', 'Flush', 'Straight', 'Three of a Kind'],
    correct_answer: 'Full House',
    reward: 500,
    penalty: 200,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'What beats a Straight?',
    options: ['Two Pair', 'Three of a Kind', 'Flush', 'Pair'],
    correct_answer: 'Flush',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'Which is the highest possible hand?',
    options: ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House'],
    correct_answer: 'Royal Flush',
    reward: 300,
    penalty: 100,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'How many cards are needed for a Full House?',
    options: ['3', '4', '5', '6'],
    correct_answer: '5',
    reward: 400,
    penalty: 150,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'What is the minimum number of cards needed for a Flush?',
    options: ['3', '4', '5', '6'],
    correct_answer: '5',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Lucky Break! Move forward 3 spaces.',
    reward: 0,
    penalty: 0,
    action_type: 'move_forward',
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Bad Fold! Move backward 2 spaces.',
    reward: 0,
    penalty: 0,
    action_type: 'move_backward',
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Jackpot! Collect 1000 chips from the pot!',
    reward: 1000,
    penalty: 0,
    action_type: 'gain_chips',
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Bad Beat! Pay 500 chips to the pot.',
    reward: 0,
    penalty: 500,
    action_type: 'lose_chips',
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What does "all-in" mean?',
    options: ['Fold all cards', 'Bet all your chips', 'Draw new cards', 'Skip a turn'],
    correct_answer: 'Bet all your chips',
    reward: 300,
    penalty: 100,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What is a "bluff" in poker?',
    options: ['Betting with a weak hand', 'Folding strong cards', 'Revealing your hand', 'Skipping your turn'],
    correct_answer: 'Betting with a weak hand',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What does "check" mean?',
    options: ['Pass without betting', 'Double your bet', 'Fold your hand', 'Draw a card'],
    correct_answer: 'Pass without betting',
    reward: 300,
    penalty: 100,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What is a "tell" in poker?',
    options: ['A physical cue', 'A betting rule', 'A card combination', 'A dealer action'],
    correct_answer: 'A physical cue',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Card Values',
    content: 'Which card has the highest value?',
    options: ['Ace', 'King', 'Queen', 'Jack'],
    correct_answer: 'Ace',
    reward: 300,
    penalty: 100,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Card Values',
    content: 'How many suits are in a standard deck?',
    options: ['2', '3', '4', '5'],
    correct_answer: '4',
    reward: 200,
    penalty: 100,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'When should you consider folding?',
    options: ['With weak cards', 'With strong cards', 'At any time', 'Never'],
    correct_answer: 'With weak cards',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'What is "position" in poker?',
    options: ['Where you sit', 'Your chip count', 'Your hand strength', 'The current bet'],
    correct_answer: 'Where you sit',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Royal Treatment! All other players pay you 200 chips each.',
    reward: 600,
    penalty: 0,
    action_type: 'collect_from_all',
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Charity Bet! You pay 150 chips to each other player.',
    reward: 0,
    penalty: 450,
    action_type: 'pay_to_all',
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'Which hand is stronger: Two Pair or Three of a Kind?',
    options: ['Two Pair', 'Three of a Kind', 'Equal strength', 'Depends on cards'],
    correct_answer: 'Three of a Kind',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'What is a Straight Flush?',
    options: ['5 consecutive cards same suit', '5 cards same suit', '5 consecutive cards', '4 cards same value'],
    correct_answer: '5 consecutive cards same suit',
    reward: 600,
    penalty: 250,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Probability',
    content: 'Which hand is rarer?',
    options: ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House'],
    correct_answer: 'Royal Flush',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Probability',
    content: 'What are the odds of getting a pair?',
    options: ['Common', 'Rare', 'Very rare', 'Impossible'],
    correct_answer: 'Common',
    reward: 300,
    penalty: 100,
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Dealer\'s Choice! Teleport to any space on the board.',
    reward: 0,
    penalty: 0,
    action_type: 'teleport',
    difficulty: 'hard'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Shuffle Time! Swap positions with another player.',
    reward: 0,
    penalty: 0,
    action_type: 'swap_position',
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker History',
    content: 'Where did Texas Hold\'em originate?',
    options: ['Texas', 'Nevada', 'California', 'Louisiana'],
    correct_answer: 'Texas',
    reward: 400,
    penalty: 150,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Variants',
    content: 'Which is NOT a poker variant?',
    options: ['Go Fish', 'Omaha', 'Seven Card Stud', 'Razz'],
    correct_answer: 'Go Fish',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Variants',
    content: 'In Texas Hold\'em, how many hole cards does each player get?',
    options: ['1', '2', '3', '4'],
    correct_answer: '2',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Side Pot Win! Collect 750 chips.',
    reward: 750,
    penalty: 0,
    action_type: 'gain_chips',
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Tournament Fee! Pay 300 chips.',
    reward: 0,
    penalty: 300,
    action_type: 'lose_chips',
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'Can an Ace be used in a low straight (A-2-3-4-5)?',
    options: ['Yes', 'No', 'Only in Texas Hold\'em', 'Only in tournaments'],
    correct_answer: 'Yes',
    reward: 600,
    penalty: 250,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Rules',
    content: 'What happens when two players have the same hand?',
    options: ['Split the pot', 'Higher cards win', 'First player wins', 'Redeal'],
    correct_answer: 'Split the pot',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Rules',
    content: 'What is the "button" in poker?',
    options: ['Dealer position marker', 'A betting chip', 'A type of bet', 'The pot'],
    correct_answer: 'Dealer position marker',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'High Roller! Double your chips (max 2000).',
    reward: 0,
    penalty: 0,
    action_type: 'double_chips',
    difficulty: 'hard'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Bad Luck! Lose half your chips (min 500 remaining).',
    reward: 0,
    penalty: 0,
    action_type: 'halve_chips',
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Poker Math',
    content: 'If the pot is $100 and you need to call $20, what are your pot odds?',
    options: ['5 to 1', '4 to 1', '3 to 1', '2 to 1'],
    correct_answer: '5 to 1',
    reward: 700,
    penalty: 300,
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'What is "slow playing"?',
    options: ['Playing strong hands weakly', 'Playing slowly', 'Folding often', 'Betting small'],
    correct_answer: 'Playing strong hands weakly',
    reward: 600,
    penalty: 250,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'What is a "tight" player?',
    options: ['Plays few hands', 'Bets aggressively', 'Never folds', 'Always bluffs'],
    correct_answer: 'Plays few hands',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'What is a "loose" player?',
    options: ['Plays many hands', 'Plays carefully', 'Never bets', 'Folds often'],
    correct_answer: 'Plays many hands',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Fast Forward! Roll the dice and move that many spaces forward.',
    reward: 0,
    penalty: 0,
    action_type: 'roll_forward',
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Rewind! Roll the dice and move that many spaces backward.',
    reward: 0,
    penalty: 0,
    action_type: 'roll_backward',
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Card Combinations',
    content: 'How many total poker hand rankings are there?',
    options: ['8', '9', '10', '11'],
    correct_answer: '10',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Card Combinations',
    content: 'What is the weakest possible hand?',
    options: ['High Card', 'Pair', 'Two Pair', 'No cards'],
    correct_answer: 'High Card',
    reward: 300,
    penalty: 100,
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Bonus Round! Earn 1500 chips!',
    reward: 1500,
    penalty: 0,
    action_type: 'gain_chips',
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Ante Up! Pay 400 chips to continue.',
    reward: 0,
    penalty: 400,
    action_type: 'lose_chips',
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Etiquette',
    content: 'When should you show your cards?',
    options: ['At showdown', 'Anytime', 'Never', 'Only when winning'],
    correct_answer: 'At showdown',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Etiquette',
    content: 'What is "angle shooting"?',
    options: ['Unethical tactics', 'Aggressive betting', 'Good strategy', 'A card trick'],
    correct_answer: 'Unethical tactics',
    reward: 600,
    penalty: 250,
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Tournament Play',
    content: 'What are "blinds" in poker?',
    options: ['Forced bets', 'Hidden cards', 'Blind players', 'Dealer cards'],
    correct_answer: 'Forced bets',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Tournament Play',
    content: 'What is a "re-buy"?',
    options: ['Buying more chips', 'Buying cards', 'Buying position', 'Buying the pot'],
    correct_answer: 'Buying more chips',
    reward: 400,
    penalty: 150,
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Card Collector! Draw 2 random cards from the deck and add them to your collection.',
    reward: 0,
    penalty: 0,
    action_type: 'draw_cards',
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Forfeit! Discard your lowest value card.',
    reward: 0,
    penalty: 0,
    action_type: 'lose_card',
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'Which hand consists of three cards of one rank and two of another?',
    options: ['Full House', 'Two Pair', 'Three of a Kind', 'Straight'],
    correct_answer: 'Full House',
    reward: 500,
    penalty: 200,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'What is Four of a Kind also called?',
    options: ['Quads', 'Boat', 'Trips', 'Set'],
    correct_answer: 'Quads',
    reward: 600,
    penalty: 250,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What is the "flop"?',
    options: ['First 3 community cards', 'First 2 cards', 'Last card', 'Folding'],
    correct_answer: 'First 3 community cards',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What is the "turn" in poker?',
    options: ['4th community card', '3rd community card', '5th community card', 'First bet'],
    correct_answer: '4th community card',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What is the "river"?',
    options: ['5th community card', '4th community card', '3rd community card', 'First card'],
    correct_answer: '5th community card',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Winning Streak! Collect 2000 chips!',
    reward: 2000,
    penalty: 0,
    action_type: 'gain_chips',
    difficulty: 'hard'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Losing Streak! Pay 800 chips.',
    reward: 0,
    penalty: 800,
    action_type: 'lose_chips',
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Math',
    content: 'What are "outs" in poker?',
    options: ['Cards that improve your hand', 'Ways to lose', 'Folded cards', 'Betting rounds'],
    correct_answer: 'Cards that improve your hand',
    reward: 600,
    penalty: 250,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'What does "pot committed" mean?',
    options: ['Too much invested to fold', 'Winning the pot', 'Starting a pot', 'Splitting pot'],
    correct_answer: 'Too much invested to fold',
    reward: 700,
    penalty: 300,
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Card Values',
    content: 'What is the value of a Jack in poker?',
    options: ['11', '10', '12', '13'],
    correct_answer: '11',
    reward: 300,
    penalty: 100,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Card Values',
    content: 'How many face cards are in a standard deck?',
    options: ['12', '16', '8', '10'],
    correct_answer: '12',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Express Lane! Move forward 5 spaces.',
    reward: 0,
    penalty: 0,
    action_type: 'move_forward',
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Setback! Move backward 4 spaces.',
    reward: 0,
    penalty: 0,
    action_type: 'move_backward',
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Variants',
    content: 'In Omaha poker, how many hole cards do you get?',
    options: ['4', '2', '3', '5'],
    correct_answer: '4',
    reward: 600,
    penalty: 250,
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Poker Variants',
    content: 'What is "Razz" poker?',
    options: ['Lowball variant', 'Highball variant', 'Draw variant', 'Stud variant'],
    correct_answer: 'Lowball variant',
    reward: 700,
    penalty: 300,
    difficulty: 'hard'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Steal! Take 300 chips from the player with the most chips.',
    reward: 300,
    penalty: 0,
    action_type: 'steal_from_leader',
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Robin Hood! Give 200 chips to the player with the least chips.',
    reward: 0,
    penalty: 200,
    action_type: 'give_to_last',
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker History',
    content: 'What year was the World Series of Poker founded?',
    options: ['1970', '1960', '1980', '1950'],
    correct_answer: '1970',
    reward: 800,
    penalty: 350,
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What is a "bad beat"?',
    options: ['Losing with strong hand', 'Winning with weak hand', 'Folding early', 'Bluffing'],
    correct_answer: 'Losing with strong hand',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What is a "cooler"?',
    options: ['Unavoidable loss', 'Bad player', 'Cold cards', 'Winning hand'],
    correct_answer: 'Unavoidable loss',
    reward: 700,
    penalty: 300,
    difficulty: 'hard'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Lucky 7! Collect 777 chips!',
    reward: 777,
    penalty: 0,
    action_type: 'gain_chips',
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Unlucky 13! Pay 600 chips.',
    reward: 0,
    penalty: 600,
    action_type: 'lose_chips',
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'What is "value betting"?',
    options: ['Betting for profit', 'Betting for fun', 'Betting to bluff', 'Not betting'],
    correct_answer: 'Betting for profit',
    reward: 600,
    penalty: 250,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'What is a "continuation bet"?',
    options: ['Betting after raising pre-flop', 'Betting twice', 'Calling a bet', 'Folding'],
    correct_answer: 'Betting after raising pre-flop',
    reward: 700,
    penalty: 300,
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'If two players have a Flush, how is the winner determined?',
    options: ['Highest card', 'Most cards', 'First player', 'Split pot'],
    correct_answer: 'Highest card',
    reward: 600,
    penalty: 250,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Hand Rankings',
    content: 'What makes a Royal Flush special?',
    options: ['A-K-Q-J-10 same suit', 'All face cards', 'Five Aces', 'Four Kings'],
    correct_answer: 'A-K-Q-J-10 same suit',
    reward: 700,
    penalty: 300,
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Sprint! Move forward 6 spaces.',
    reward: 0,
    penalty: 0,
    action_type: 'move_forward',
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Stumble! Move backward 3 spaces.',
    reward: 0,
    penalty: 0,
    action_type: 'move_backward',
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Rules',
    content: 'Can you bet more than you have in chips?',
    options: ['No', 'Yes', 'Only in tournaments', 'Only if all-in'],
    correct_answer: 'No',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'question',
    category: 'Poker Rules',
    content: 'What is a "side pot"?',
    options: ['Pot for remaining players', 'Extra pot', 'Bonus pot', 'Dealer pot'],
    correct_answer: 'Pot for remaining players',
    reward: 600,
    penalty: 250,
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Dealer Error! Get a free card from the deck.',
    reward: 0,
    penalty: 0,
    action_type: 'free_card',
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Penalty Box! Skip your next turn.',
    reward: 0,
    penalty: 0,
    action_type: 'skip_turn',
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Card Combinations',
    content: 'How many different possible poker hands exist?',
    options: ['2,598,960', '1,000,000', '5,000,000', '10,000,000'],
    correct_answer: '2,598,960',
    reward: 1000,
    penalty: 400,
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Probability',
    content: 'What is the probability of getting a Royal Flush?',
    options: ['1 in 649,740', '1 in 1,000', '1 in 10,000', '1 in 1,000,000'],
    correct_answer: '1 in 649,740',
    reward: 1000,
    penalty: 400,
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What is "tilt"?',
    options: ['Playing emotionally', 'Winning big', 'Folding often', 'Betting carefully'],
    correct_answer: 'Playing emotionally',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Terms',
    content: 'What is a "fish" in poker?',
    options: ['Weak player', 'Strong player', 'Dealer', 'Observer'],
    correct_answer: 'Weak player',
    reward: 400,
    penalty: 150,
    difficulty: 'easy'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Grand Prize! Collect 2500 chips!',
    reward: 2500,
    penalty: 0,
    action_type: 'gain_chips',
    difficulty: 'hard'
  },
  {
    type: 'action',
    category: 'Chips',
    content: 'Major Loss! Pay 1000 chips.',
    reward: 0,
    penalty: 1000,
    action_type: 'lose_chips',
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Tournament Play',
    content: 'What is an "add-on"?',
    options: ['Extra chips purchase', 'Extra time', 'Extra cards', 'Extra players'],
    correct_answer: 'Extra chips purchase',
    reward: 500,
    penalty: 200,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Tournament Play',
    content: 'What is a "satellite" tournament?',
    options: ['Qualifier for bigger event', 'Small stakes game', 'Online only', 'Practice game'],
    correct_answer: 'Qualifier for bigger event',
    reward: 600,
    penalty: 250,
    difficulty: 'hard'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Warp Speed! Move forward 8 spaces.',
    reward: 0,
    penalty: 0,
    action_type: 'move_forward',
    difficulty: 'hard'
  },
  {
    type: 'action',
    category: 'Movement',
    content: 'Major Setback! Move backward 6 spaces.',
    reward: 0,
    penalty: 0,
    action_type: 'move_backward',
    difficulty: 'hard'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'What is "bankroll management"?',
    options: ['Managing your poker funds', 'Counting cards', 'Bluffing technique', 'Betting pattern'],
    correct_answer: 'Managing your poker funds',
    reward: 600,
    penalty: 250,
    difficulty: 'medium'
  },
  {
    type: 'question',
    category: 'Poker Strategy',
    content: 'What is a "donk bet"?',
    options: ['Betting out of position', 'Smart bet', 'Large bet', 'Small bet'],
    correct_answer: 'Betting out of position',
    reward: 700,
    penalty: 300,
    difficulty: 'hard'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Insurance! Protect against next penalty.',
    reward: 0,
    penalty: 0,
    action_type: 'insurance',
    difficulty: 'medium'
  },
  {
    type: 'action',
    category: 'Special',
    content: 'Tax Time! Pay 250 chips.',
    reward: 0,
    penalty: 250,
    action_type: 'lose_chips',
    difficulty: 'easy'
  }
];
