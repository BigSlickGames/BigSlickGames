import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import { PlayerStatsDashboard } from './PlayerStatsDashboard';
import { GameGrid } from './game/GameGrid';
import { CombinedDeckModule } from './game/CombinedDeckModule';
import { AceChoiceModal } from './game/AceChoiceModal';
import { AnteControls } from './game/AnteControls';
import { GameHeader } from './game/GameHeader';
import { BottomMenu } from './game/BottomMenu';
import { CelebrationGif } from './game/CelebrationVideo';
import { StackemMissionsModule } from './game/StackemMissionsModule';
import { useGameLogic } from '../hooks/useGameLogic';
import { useChipManagement } from '../hooks/useChipManagement';
import { User } from 'lucide-react';

interface Tile {
  id: string;
  value: number;
  isLocked: boolean;
  cardType: 'number' | 'face' | 'ace';
  displayValue: string;
}

interface GridCell {
  row: number;
  col: number;
  value: number | null;
  isTotal: boolean;
}

interface ProfileDashboardProps {
  onLogout: () => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ onLogout }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chipAmount, setChipAmount] = useState(100);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [showMissions, setShowMissions] = useState(false);

  // Custom hooks
  const gameLogic = useGameLogic(profile?.id);
  const chipManagement = useChipManagement(profile);

  // Load player stats when profile loads
  useEffect(() => {
    if (profile?.id) {
      gameLogic.playerStats.loadStats();
    }
  }, [profile?.id, gameLogic.playerStats]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Get current authenticated user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Handle tile drag start
  const handleDragStart = (tile: Tile) => {
    if (!tile.isLocked) {
      gameLogic.setDraggedTile(tile);
    }
  };

  // Handle drop on grid cell
  const handleDrop = (row: number, col: number) => {
    if (!gameLogic.draggedTile || row === 0 || col === 0 || gameLogic.gameGrid[row][col].value !== null) {
      return;
    }
    
    // Handle Ace placement
    if (gameLogic.draggedTile.cardType === 'ace') {
      gameLogic.setPendingAceTile(gameLogic.draggedTile);
      gameLogic.setPendingAcePosition({ row, col });
      gameLogic.setShowAceChoice(true);
      return;
    }
    
    // Check if player has enough total chips for the ante
    const totalChips = chipManagement.getTotalChips();
    const currentAnte = gameLogic.anteLockedAt || chipAmount;
    if (totalChips < currentAnte) {
      gameLogic.triggerHaptic('error');
      gameLogic.triggerShake('insufficient-chips', 300);
      alert(`Not enough chips! You need ${currentAnte} chips to place this tile.`);
      return;
    }
    
    // Deduct ante from local chips (will sync to DB automatically)
    chipManagement.updateLocalChips(-currentAnte);
    
    // Haptic feedback for tile placement
    gameLogic.triggerHaptic('light');
    
    // Place tile on grid
    const newGrid = [...gameLogic.gameGrid];
    newGrid[row][col].value = gameLogic.draggedTile.value;
    gameLogic.setGameGrid(newGrid);
    
    // Remove used tile and unlock next tile
    const newTiles = gameLogic.currentTiles.filter(t => t.id !== gameLogic.draggedTile.id);
    if (newTiles.length > 0) {
      newTiles[0].isLocked = false; // Unlock next tile
    }
    gameLogic.setCurrentTiles(newTiles);
    
    gameLogic.setDraggedTile(null);
    
    // Recalculate totals
    setTimeout(() => gameLogic.calculateTotals(chipManagement.updateLocalChips), 100);
  };

  // Handle mobile tap for tile placement
  const handleTileClick = (tile: Tile) => {
    if (tile.isLocked) return;
    
    // Haptic feedback for tile selection
    gameLogic.triggerHaptic('light');
    
    gameLogic.setSelectedTile(gameLogic.selectedTile?.id === tile.id ? null : tile);
  };

  // Handle dealing tiles with ante locking
  const handleDealTiles = () => {
    // Lock ante as soon as tiles are dealt
    if (gameLogic.anteLockedAt === null) {
      gameLogic.setAnteLockedAt(chipAmount);
      console.log(`🔒 Ante locked at ${chipAmount} chips when tiles were dealt`);
    }
    
    // Deal the tiles
    gameLogic.dealTiles();
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameLogic.selectedTile || row === 0 || col === 0 || gameLogic.gameGrid[row][col].value !== null) {
      return;
    }
    
    // Handle Ace placement
    if (gameLogic.selectedTile.cardType === 'ace') {
      gameLogic.setPendingAceTile(gameLogic.selectedTile);
      gameLogic.setPendingAcePosition({ row, col });
      gameLogic.setShowAceChoice(true);
      return;
    }
    
    // Check if player has enough total chips for the ante
    const totalChips = chipManagement.getTotalChips();
    const currentAnte = gameLogic.anteLockedAt || chipAmount;
    if (totalChips < currentAnte) {
      gameLogic.triggerHaptic('error');
      gameLogic.triggerShake('insufficient-chips', 300);
      alert(`Not enough chips! You need ${currentAnte} chips to place this tile.`);
      return;
    }
    
    // Deduct ante from local chips (will sync to DB automatically)
    chipManagement.updateLocalChips(-currentAnte);
    
    // Haptic feedback for tile placement
    gameLogic.triggerHaptic('light');
    
    // Place tile on grid
    const newGrid = [...gameLogic.gameGrid];
    newGrid[row][col].value = gameLogic.selectedTile.value;
    gameLogic.setGameGrid(newGrid);
    
    // Remove used tile and unlock next tile
    const newTiles = gameLogic.currentTiles.filter(t => t.id !== gameLogic.selectedTile.id);
    if (newTiles.length > 0) {
      newTiles[0].isLocked = false; // Unlock next tile
    }
    gameLogic.setCurrentTiles(newTiles);
    
    gameLogic.setSelectedTile(null);
    
    // Recalculate totals
    setTimeout(() => gameLogic.calculateTotals(chipManagement.updateLocalChips), 100);
  };

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        onLogout();
        return;
      }

      console.log('Authenticated user:', user.id, user.email);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        setError(error.message);
      } else {
        console.log('Profile data:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Sync any pending changes before logout
    if (chipManagement.localChips !== 0) {
      await chipManagement.syncChipsToDatabase();
    }
    
    await supabase.auth.signOut();
    onLogout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWinRate = () => {
    if (!profile || profile.games_played === 0) return 0;
    return Math.round((profile.games_won / profile.games_played) * 100);
  };

  const handleClaimReward = (achievementId: string, reward: { chips: number; experience: number }) => {
    console.log('🏆 Claiming reward in ProfileDashboard:', achievementId, reward);
    
    // Add chips to local balance
    chipManagement.updateLocalChips(reward.chips);
    
    // Add experience and star points to profile (update database)
    if (profile) {
      const newExperience = profile.experience + reward.experience;
      
      // Calculate new level based on progressive XP system
      const getLevelFromXP = (totalXP: number) => {
        let level = 0;
        let xpNeeded = 0;
        
        while (xpNeeded <= totalXP) {
          level++;
          xpNeeded += level * 1000;
        }
        
        return level - 1; // Return the last completed level
      };
      
      const newLevel = getLevelFromXP(newExperience);
      const newStarPoints = (profile.chips_balance || 0) + reward.experience;
      
      // Update profile in database
      const updateProfile = async () => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              experience: newExperience,
              level: newLevel,
              chips_balance: newStarPoints,
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id);
          
          if (error) {
            console.error('Error updating profile:', error);
          } else {
            console.log(`🏆 Profile updated: Level ${newLevel}, ${newExperience} XP, ${newStarPoints} stars`);
            
            // Update profile locally for immediate UI update
            setProfile(prev => prev ? {
              ...prev,
              experience: newExperience,
              level: newLevel,
              chips_balance: newStarPoints
            } : null);
          }
        } catch (err) {
          console.error('Profile update error:', err);
        }
      };
      
      updateProfile();
      
      console.log(`🏆 Achievement unlocked: +${reward.chips} chips, +${reward.experience} XP, +${reward.experience} stars (Level ${newLevel})`);
    }
  };

  const handleResetGame = () => {
    gameLogic.resetGame();
  };

  if (showStats) {
    return (
      <PlayerStatsDashboard 
        profile={profile}
        onBack={() => setShowStats(false)}
      />
    );
  }

  if (showMissions) {
    return (
      <StackemMissionsModule
        playerStats={{
          totalBlackjacks: gameLogic.playerStats.stats.totalBlackjacks,
          totalTilesPlaced: gameLogic.playerStats.stats.totalTilesPlaced,
          totalChipsWon: gameLogic.playerStats.stats.totalChipsWon,
          bestBlackjackCards: gameLogic.playerStats.stats.bestBlackjackCards,
          blackjacksToday: gameLogic.playerStats.stats.blackjacksToday,
          totalGamesPlayed: gameLogic.playerStats.stats.totalGamesPlayed
        }}
        onClose={() => setShowMissions(false)}
        onClaimReward={handleClaimReward}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Game Container */}
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex-shrink-0">
          <GameHeader
            profile={profile}
            localChips={chipManagement.localChips}
            onLogout={handleLogout}
            onShowStats={() => setShowStats(true)}
            onShowMissions={() => setShowMissions(true)}
          />
        </div>

        {/* Game Grid - Main Section */}
        <div className="flex-5 flex items-center justify-center min-h-0 py-5">
          <div className="w-full max-w-[350px] aspect-square">
            <GameGrid
              gameGrid={gameLogic.gameGrid}
              onCellClick={handleCellClick}
              onDrop={handleDrop}
              shakeAnimations={gameLogic.shakeAnimations}
              bustAnimations={gameLogic.bustAnimations}
              twentyOneAnimations={gameLogic.twentyOneAnimations}
            />
          </div>
        </div>

        {/* Controls Section - Compact Bottom */}
        <div className="flex-shrink-5 space-y-5">
          {/* Deck and Tiles Row - Compact */}
          <div className="flex items-center justify-center">
            <CombinedDeckModule
              currentTiles={gameLogic.currentTiles}
              remainingCards={gameLogic.remainingCards}
              currentCycle={gameLogic.currentCycle}
              maxCycles={gameLogic.maxCycles}
              selectedTile={gameLogic.selectedTile}
              visibleTiles={gameLogic.visibleTiles}
              onDealTiles={handleDealTiles}
              onTileClick={handleTileClick}
              onDragStart={handleDragStart}
              onDragEnd={() => gameLogic.setDraggedTile(null)}
              triggerHaptic={gameLogic.triggerHaptic}
            />
          </div>

          {/* Ante Controls */}
          <div className="flex justify-center py-0">
            <AnteControls
              chipAmount={chipAmount}
              anteLockedAt={gameLogic.anteLockedAt}
              onChipAmountChange={setChipAmount}
              triggerHaptic={gameLogic.triggerHaptic}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom Menu */}
      <BottomMenu
        profile={profile}
        localChips={chipManagement.localChips}
        onLogout={handleLogout}
        onResetGame={handleResetGame}
        triggerHaptic={gameLogic.triggerHaptic}
        playButtonClick={gameLogic.soundEffects.playButtonClick}
      />
      
      {/* Celebration GIF */}
      <CelebrationGif
        isVisible={gameLogic.showCelebrationVideo}
        onComplete={() => gameLogic.setShowCelebrationVideo(false)}
      />
      
      {/* Ace Choice Modal */}
      <AceChoiceModal
        isOpen={gameLogic.showAceChoice}
        onChoice={(value) => {
          // Check if player has enough total chips for the ante
          const totalChips = chipManagement.getTotalChips();
          const currentAnte = gameLogic.anteLockedAt || chipAmount;
          if (totalChips < currentAnte) {
            gameLogic.triggerHaptic('error');
            gameLogic.setShowAceChoice(false);
            gameLogic.setPendingAceTile(null);
            gameLogic.setPendingAcePosition(null);
            alert(`Not enough chips! You need ${currentAnte} chips to place this tile.`);
            return;
          }
          
          // Deduct ante from local chips
          chipManagement.updateLocalChips(-currentAnte);
          
          gameLogic.handleAceChoice(value, (amount) => {
            chipManagement.updateLocalChips(amount);
          });
        }}
      />
    </div>
  );
};