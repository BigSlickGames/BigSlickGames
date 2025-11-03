import { useState, useEffect, useCallback, useRef } from "react";
import { PlayerIcon } from "./components/PlayerIcon";
import { PlayerProfile } from "./components/PlayerProfile";
import { PenaltyModal } from "./components/PenaltyModal";
import { AuctionModal } from "./components/AuctionModal";
import { SellCardsModal } from "./components/SellCardsModal";
import { MiniSlotMachine } from "./components/MiniSlotMachine";
import { supabase } from "../../lib/supabase";
import { RulesPanel } from "./components/RulesPanel";
import MultiplayerLobby from "./components/MultiplayerLobby";
import WaitingRoom from "./components/WaitingRoom";
import { useNavigate } from "react-router-dom";
import LocalGame from "./LocalGame"; // Adjust path as needed

import {
  MYSTERY_CARDS,
  BOMB_CARDS,
  JOKER_CARD,
  MysteryCard,
  getRandomMysteryCard,
  QUESTION_MARK_POSITIONS,
  initializeJokerPositions,
  isJokerPosition,
} from "./data/mysteryCards";

import {
  detectPokerHand,
  calculatePenalty,
  getCardPrice,
  getHandDescription,
  PokerHand,
} from "./utils/pokerLogic.ts";

import { RoomService, Room, RoomPlayer } from "./services/roomService";

interface Player {
  name: string;
  chips: number;
  color: string;
  position: "top" | "right" | "bottom" | "left";
  collectedCards: Array<{ suit: string; value: string } | null>;
  boughtCards: Array<{ suit: string; value: string; position: number }>;
  boardPosition: number;
  suit: string;
  jokers: Array<{ collectedAtPosition: number }>;
  wilds?: number;
  wildCollectedAt?: number[];
  isEliminated?: boolean;
  lastBoardPosition?: number;
  lapsCompleted?: number;
}

function App() {
  const navigate = useNavigate();

  // 🔥 GAME MODE STATE
  const [gameMode, setGameMode] = useState<"select" | "waiting" | "playing">(
    "select"
  );
  const [landedMysteryCard, setLandedMysteryCard] =
    useState<MysteryCard | null>(null);

  // 🔥 MULTIPLAYER STATE
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUsername, setCurrentUsername] = useState<string>("Player");
  const [isHost, setIsHost] = useState(false);
  const [showLocalGame, setShowLocalGame] = useState(false);
  // 🔥 AUDIO STATE
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);

  // 🔥 GAME STATE
  const [rotation, setRotation] = useState({ x: 60, y: 0, z: 0 });
  const [boardRotation, setBoardRotation] = useState(0);
  const [profileRotation, setProfileRotation] = useState(0);
  const [rotationMode, setRotationMode] = useState<"board" | "profiles">(
    "board"
  );
  const [baseRotation, setBaseRotation] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [dealtCards, setDealtCards] = useState<{
    [key: number]: { suit: string; value: string };
  }>({});
  const [cardOwners, setCardOwners] = useState<{ [key: number]: number }>({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPositions, setPlayerPositions] = useState<number[]>([
    0, 16, 32, 48,
  ]);

  const log = useCallback((emoji: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString().split("T")[1].substring(0, 12);
    console.log(`[${timestamp}] ${emoji} ${message}`, data || "");
  }, []);

  const handlePlayLocal = useCallback(() => {
    log("🎮", "SWITCHING TO LOCAL MODE");
    setShowLocalGame(true);
    setGameMode("playing"); // Or create a new 'local' mode
  }, [log]);
  // 🔥 INITIALIZE GAME
  const waitingRoomSubsRef = useRef<any>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [hasPair, setHasPair] = useState(false);
  const [invertScroll, setInvertScroll] = useState(false);
  const [landedCard, setLandedCard] = useState<{
    suit: string;
    value: string;
  } | null>(null);
  const [penaltyInfo, setPenaltyInfo] = useState<{
    card: { suit: string; value: string };
    penalty: number;
    hand: PokerHand | null;
    handCards: Array<{ suit: string; value: string }>;
    ownerIndex: number;
  } | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(1000);
  const [auctionInfo, setAuctionInfo] = useState<{
    card: { suit: string; value: string };
    position: number;
  } | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [cardsAnimating, setCardsAnimating] = useState<Set<number>>(new Set());
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [jokerPositions, setJokerPositions] = useState<number[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [mysteryCardPositions, setMysteryCardPositions] = useState<{
    [position: number]: MysteryCard;
  }>({});
  const [showMysteryCardModal, setShowMysteryCardModal] = useState(false);
  const [currentDiceTotal, setCurrentDiceTotal] = useState<number | null>(null);
  const [hasExtraTurn, setHasExtraTurn] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoPath, setVideoPath] = useState<string>("");
  const [videoCardType, setVideoCardType] = useState<
    "bomb" | "lightning" | null
  >(null);

  // 🔥 REFS - SOURCE OF TRUTH
  const subscriptionRef = useRef<any>(null);
  const playersRef = useRef<Player[]>([]);
  const currentIndexRef = useRef<number>(0);
  const actionQueueRef = useRef<any[]>([]);
  const isProcessingRef = useRef(false);

  const totalSpaces = 64;
  const spacesPerSide = 16;

  const [auctionBids, setAuctionBids] = useState<{
    [playerIndex: number]: number;
  }>({});
  const [auctionInitiatorIndex, setAuctionInitiatorIndex] = useState<
    number | null
  >(null);

  // Corner positioning adjustments
  const cornerOffsets = {
    bottomRight: { x: 190, y: 10 },
    bottomLeft: { x: -10, y: 195 },
    topLeft: { x: -195, y: -10 },
    topRight: { x: 10, y: -195 },
  };

  // 🔥 SAFE INDEX WITH LOGGING
  const getSafePlayerIndex = useCallback(
    (index: number, source: string = "unknown") => {
      const len = playersRef.current.length;
      const safeIndex = Math.max(0, Math.min(index, Math.max(0, len - 1)));
      log(
        "🔢",
        `getSafePlayerIndex [${source}]: ${index} → ${safeIndex} (players: ${len})`
      );
      return safeIndex;
    },
    [log]
  );

  // 🏆 CHECK GAME OVER
  const checkGameOver = useCallback(async () => {
    const activePlayers = playersRef.current.filter(
      (p) => !p.isEliminated && p.chips > 0
    );

    if (activePlayers.length === 1) {
      const winnerPlayer = activePlayers[0];
      log("🏆", "WINNER FOUND", { winner: winnerPlayer.name });
      setWinner(winnerPlayer);
      setGameOver(true);

      // Award winner the pool of chips
      const totalPlayers = playersRef.current.length;
      const poolAmount = 15000 * totalPlayers;

      log("💰", "AWARDING WINNER", {
        winner: winnerPlayer.name,
        poolAmount,
      });

      // Find winner's user_id from roomPlayers
      const winnerIndex = playersRef.current.findIndex(
        (p) => p.name === winnerPlayer.name
      );
      const winnerRoomPlayer = roomPlayers[winnerIndex];

      if (winnerRoomPlayer && supabase) {
        try {
          // Get current balance from user_wallet
          const { data: wallet } = await supabase
            .from("user_wallet")
            .select("chips")
            .eq("user_id", winnerRoomPlayer.user_id)
            .single();

          const currentBalance = wallet?.chips || 0;
          const newBalance = currentBalance + poolAmount;

          // Update winner's chips in user_wallet
          const { error } = await supabase
            .from("user_wallet")
            .update({ chips: newBalance })
            .eq("user_id", winnerRoomPlayer.user_id);

          if (error) {
            console.error("Failed to award winner:", error);
          } else {
            log(
              "💰",
              `Awarded ${poolAmount} chips to ${winnerPlayer.name}. New balance: ${newBalance}`
            );
          }
        } catch (err) {
          console.error("Error awarding winner:", err);
        }
      }

      return true;
    }

    if (activePlayers.length === 0) {
      log("🏆", "ALL PLAYERS ELIMINATED");
      setGameOver(true);
      return true;
    }

    return false;
  }, [log, roomPlayers]);

  // Disable body scrolling
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Audio setup
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = musicVolume;
      audioRef.current.src =
        "/games/pokeropoly/sound/poker-opoly-them-music.mp3";

      audioRef.current.addEventListener("ended", () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      });

      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
      });
    }

    if (gameStarted && !isMusicPlaying) {
      audioRef.current.play().catch((err) => {
        console.error("Audio play error:", err);
      });
      setIsMusicPlaying(true);
    } else if (!gameStarted && isMusicPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsMusicPlaying(false);
    }
  }, [gameStarted, isMusicPlaying, musicVolume]);

  const applyMysteryCardEffects = useCallback(
    async (card: MysteryCard, playerIndex: number) => {
      const effects = card.effects;
      let chipGain = 0; // Track net chip gain for wallet sync

      setPlayers((prev) => {
        const updated = [...prev];

        // SAFETY CHECK - validate playerIndex
        if (playerIndex < 0 || playerIndex >= updated.length) {
          log(
            "❌",
            `INVALID PLAYER INDEX: ${playerIndex} (total: ${updated.length})`
          );
          return prev;
        }

        const player = updated[playerIndex];
        if (!player) {
          log("❌", `PLAYER NOT FOUND AT INDEX ${playerIndex}`);
          return prev;
        }

        // Apply chip changes
        if (effects.cb) {
          const oldChips = player.chips;
          player.chips = Math.max(0, player.chips + effects.cb);
          chipGain = player.chips - oldChips; // Calculate actual gain

          if (player.chips === 0) {
            player.isEliminated = true;
          }

          log("💰", `Mystery card chip change: ${chipGain}`);
        }

        // Apply movement
        if (effects.mb) {
          const newPos = (player.boardPosition + effects.mb + 64) % 64;
          player.boardPosition = newPos;
          player.lastBoardPosition = newPos;
        }

        // Apply teleport
        if (effects.mt) {
          const cornerMap: { [key: string]: number } = {
            "Hearts Home": 0,
            "Spades Home": 16,
            "Diamonds Home": 32,
            "Clubs Home": 48,
          };
          if (cornerMap[effects.mt]) {
            player.boardPosition = cornerMap[effects.mt];
            player.lastBoardPosition = cornerMap[effects.mt];
          }
        }

        // Apply collect from each player
        if (effects.ce && effects.ce !== 0) {
          const amount = effects.ce;
          const oldPlayerChips = player.chips;

          updated.forEach((p, idx) => {
            if (idx !== playerIndex && !p.isEliminated) {
              if (amount > 0) {
                // Collect from other players
                const collectAmount = Math.min(Math.abs(amount), p.chips);
                p.chips = Math.max(0, p.chips - collectAmount);
                player.chips += collectAmount;
              } else {
                // Pay to other players
                const payAmount = Math.min(Math.abs(amount), player.chips);
                player.chips = Math.max(0, player.chips - payAmount);
                p.chips += payAmount;
              }
            }
          });

          // Track net chip gain from collect/pay
          chipGain += player.chips - oldPlayerChips;
          log(
            "💰",
            `Collect/Pay chip change: ${player.chips - oldPlayerChips}`
          );
        }

        playersRef.current = updated;
        return updated;
      });

      // Sync chip gain to wallet if positive
      if (chipGain > 0 && roomPlayers[playerIndex] && supabase) {
        const playerUserId = roomPlayers[playerIndex].user_id;

        try {
          const { data: wallet } = await supabase
            .from("user_wallet")
            .select("chips")
            .eq("user_id", playerUserId)
            .single();

          const currentBalance = wallet?.chips || 0;
          const newBalance = currentBalance + chipGain;

          await supabase
            .from("user_wallet")
            .update({ chips: newBalance })
            .eq("user_id", playerUserId);

          log(
            "💰",
            `Synced ${chipGain} chips to wallet. New balance: ${newBalance}`
          );
        } catch (err) {
          console.error("Error syncing chips to wallet:", err);
        }
      }

      setTimeout(() => checkGameOver(), 1000);
    },
    [log, checkGameOver, roomPlayers]
  );

  const checkWildExpiration = useCallback(
    (player: Player, newPosition: number) => {
      const oldPosition = player.lastBoardPosition || player.boardPosition;

      if (oldPosition > 50 && newPosition < 14) {
        player.lapsCompleted = (player.lapsCompleted || 0) + 1;

        if (player.wilds && player.wilds > 0) {
          const expiredCount = player.wilds;
          player.wilds = 0;
          player.wildCollectedAt = [];
          log("⏰", `${player.name} lost ${expiredCount} expired wild(s)`);
        }
      }

      player.lastBoardPosition = newPosition;
      return player;
    },
    [log]
  );

  const initializeMysteryCards = useCallback(() => {
    const mysteryMap: { [position: number]: MysteryCard } = {};
    const jokerCount = Math.floor(Math.random() * 3) + 1;
    const shuffledPositions = [...QUESTION_MARK_POSITIONS].sort(
      () => Math.random() - 0.5
    );

    const newJokerPositions: number[] = [];

    shuffledPositions.forEach((pos, index) => {
      const card = index < jokerCount ? JOKER_CARD : getRandomMysteryCard();
      mysteryMap[pos] = card;

      // Track joker positions
      if (card.deck === "Joker") {
        newJokerPositions.push(pos);
      }
    });

    setMysteryCardPositions(mysteryMap);
    setJokerPositions(newJokerPositions); // Update joker positions state!

    log(
      "🃏",
      `Initialized ${newJokerPositions.length} joker positions:`,
      newJokerPositions
    );

    return mysteryMap;
  }, [log]);

  const initializeFromGameState = useCallback(
    async (room: Room) => {
      log("🎲", "=== INITIALIZING GAME STATE ===");

      const freshPlayers = await RoomService.getRoomPlayers(room.id);
      log("🔥", `LOADED ${freshPlayers.length} PLAYERS`);

      if (freshPlayers.length === 0) {
        log("❌", "NO PLAYERS LOADED - ABORTING");
        return;
      }

      setDealtCards(room.game_state?.dealtCards || {});
      setJokerPositions(room.game_state?.jokerPositions || []);
      initializeMysteryCards();

      const gamePlayers: Player[] = freshPlayers.map((rp, idx) => ({
        name: rp.player_name || "Unknown",
        chips: 15000, // Everyone starts with 15,000 chips in game
        color: ["#000000", "#DC143C", "#90EE90", "#ADD8E6"][idx] || "#CCCCCC",
        position: (["bottom", "left", "top", "right"][idx] || "bottom") as any,
        collectedCards: Array.isArray(rp.collected_cards)
          ? rp.collected_cards
          : [],
        boughtCards: Array.isArray(rp.bought_cards) ? rp.bought_cards : [],
        boardPosition: [0, 16, 32, 48][idx] || 0,
        suit: rp.player_suit || "♠",
        isEliminated: rp.eliminated || false,
        wilds: 0,
        wildCollectedAt: [],
        lastBoardPosition: [0, 16, 32, 48][idx] || 0,
        lapsCompleted: 0,
        jokers: [],
      }));

      playersRef.current = gamePlayers;
      currentIndexRef.current = 0;

      setPlayers(gamePlayers);
      setCurrentPlayerIndex(0);
      setPlayerPositions(gamePlayers.map((p) => p.boardPosition));
      setRoomPlayers(freshPlayers);
      setGameStarted(true);
      setCardOwners({});
      setHasRolledThisTurn(false);

      log("✅", "INITIALIZATION COMPLETE");
    },
    [log, initializeMysteryCards]
  );

  const deductChipsFromAccounts = async () => {
    if (!currentRoom?.id || !roomPlayers) return;

    for (const rp of roomPlayers) {
      try {
        // Deduct from user_wallet
        if (supabase) {
          const { data: wallet } = await supabase
            .from("user_wallet")
            .select("chips")
            .eq("user_id", rp.user_id)
            .single();

          const currentBalance = wallet?.chips || 0;
          const newBalance = Math.max(0, currentBalance - 15000);

          const { error } = await supabase
            .from("user_wallet")
            .update({ chips: newBalance })
            .eq("user_id", rp.user_id);

          if (error) {
            console.error("Failed to deduct chips:", rp.player_name, error);
          } else {
            log(
              "💰",
              `Deducted 15000 from ${rp.player_name}. New balance: ${newBalance}`
            );
          }
        }
      } catch (err) {
        console.error("Error deducting chips:", err);
      }
    }
  };

  const hasDeductedChips = useRef(false);

  useEffect(() => {
    if (
      gameMode === "playing" &&
      currentRoom?.id &&
      !hasDeductedChips.current
    ) {
      log("💰", "DEDUCTING CHIPS FROM ACCOUNTS");
      deductChipsFromAccounts();
      hasDeductedChips.current = true;
    }
  }, [gameMode, currentRoom?.id]);

  const applyBuyCard = useCallback(
    (data: any) => {
      const { position, card, price, player_index } = data;
      const safeIndex = getSafePlayerIndex(player_index, "applyBuyCard");

      log("💳", "APPLY BUY", {
        position,
        card: `${card.value}${card.suit}`,
        price,
        safeIndex,
      });

      const currentOwner = cardOwners[position];
      if (currentOwner !== undefined) {
        log("⚠️", "CARD ALREADY OWNED - ABORTING");
        return;
      }

      const currentPlayer = playersRef.current[safeIndex];
      if (!currentPlayer) {
        log("❌", "PLAYER NOT FOUND AT INDEX", { safeIndex });
        return;
      }

      const alreadyHasCard = currentPlayer.boughtCards.some(
        (c) =>
          c.suit === card.suit &&
          c.value === card.value &&
          c.position === position
      );

      if (alreadyHasCard) {
        log("⚠️", "PLAYER ALREADY HAS THIS CARD - ABORTING");
        return;
      }

      setCardOwners((prev) => {
        if (prev[position] !== undefined) return prev;
        return { ...prev, [position]: safeIndex };
      });

      setPlayers((prev) => {
        if (prev.length === 0 || !prev[safeIndex]) return prev;

        const player = prev[safeIndex];
        const hasCard = player.boughtCards.some(
          (c) =>
            c.suit === card.suit &&
            c.value === card.value &&
            c.position === position
        );

        if (hasCard) return prev;

        const updated = [...prev];
        const newChips = Math.max(0, player.chips - price);
        updated[safeIndex] = {
          ...player,
          collectedCards: [...player.collectedCards, card],
          boughtCards: [...player.boughtCards, { ...card, position }],
          chips: newChips,
          isEliminated: newChips <= 0,
        };

        playersRef.current = updated;
        return updated;
      });
    },
    [getSafePlayerIndex, log, cardOwners]
  );

  const applyPayPenalty = useCallback(
    (data: any) => {
      const { payerIndex, receiverIndex, amount } = data;
      const safePayer = getSafePlayerIndex(payerIndex, "payPenalty");
      const safeReceiver = getSafePlayerIndex(receiverIndex, "payPenalty");

      log("💸", "PAY PENALTY", { safePayer, safeReceiver, amount });

      setPlayers((prev) => {
        if (prev.length === 0 || !prev[safePayer] || !prev[safeReceiver])
          return prev;

        const updated = [...prev];
        const payerChips = updated[safePayer].chips;

        // Only pay what the payer has available
        const actualPayment = Math.min(amount, payerChips);

        updated[safePayer].chips = payerChips - actualPayment;
        updated[safePayer].isEliminated = updated[safePayer].chips <= 0;
        updated[safeReceiver].chips += actualPayment;

        log("💸", `Penalty paid: ${actualPayment} (owed: ${amount})`);

        playersRef.current = updated;
        setTimeout(() => checkGameOver(), 500);
        return updated;
      });
      setPenaltyInfo(null);
    },
    [getSafePlayerIndex, log, checkGameOver]
  );

  const endTurn = useCallback(async () => {
    if (!currentRoom || playersRef.current.length === 0) {
      log("⏹️", "END TURN SKIPPED - NO ROOM/PLAYERS");
      return;
    }

    const safeCurrent = getSafePlayerIndex(currentIndexRef.current, "endTurn");
    const nextIndex = (safeCurrent + 1) % playersRef.current.length;
    log("🔄", `ENDING TURN: ${safeCurrent} → ${nextIndex}`);

    try {
      await RoomService.broadcastAction(
        currentRoom.id,
        currentUserId,
        safeCurrent,
        "endTurn",
        { next_player_index: nextIndex }
      );

      currentIndexRef.current = nextIndex;
      setCurrentPlayerIndex(nextIndex);
      setHasRolledThisTurn(false);
      setLandedCard(null);
      setPenaltyInfo(null);
      log("✅", `TURN ENDED - NEW INDEX: ${nextIndex}`);
    } catch (error) {
      log("❌", "END TURN BROADCAST FAILED", error);
    }
  }, [currentRoom, currentUserId, getSafePlayerIndex, log]);

  const proceedWithMysteryCardEffect = useCallback(
    async (mysteryCard: MysteryCard, playerIndex?: number) => {
      const safeIndex =
        playerIndex !== undefined ? playerIndex : currentIndexRef.current;
      const effects = mysteryCard.effects;

      log("🎯", "proceedWithMysteryCardEffect", {
        mysteryCard: mysteryCard.title,
        safeIndex,
      });

      // Apply effects
      await applyMysteryCardEffects(mysteryCard, safeIndex);

      // Close modals
      setShowVideoModal(false);
      setShowMysteryCardModal(false);
      setLandedMysteryCard(null);

      log("✅", "Cleared modals");

      // Handle turn continuation
      if (effects.rt === true) {
        log("🔄", "Repeat turn - keeping turn");
        setHasExtraTurn(true);
        setHasPair(false);
      } else if (hasPair) {
        log("🎲", "Doubles rolled - player keeps turn");
        setHasExtraTurn(true);
        setHasPair(false);
      } else {
        log("✅", "Ending turn");
        setHasExtraTurn(false);
        endTurn();
      }
    },
    [hasPair, applyMysteryCardEffects, endTurn, log]
  );
  const handleMysteryCardEffect = useCallback(
    async (mysteryCard: MysteryCard, playerIndex?: number) => {
      const safeIndex =
        playerIndex !== undefined ? playerIndex : currentIndexRef.current;

      log("🎴", `handleMysteryCardEffect: Processing ${mysteryCard.title}`, {
        safeIndex,
      });

      // Broadcast mystery card action to all players
      if (currentRoom) {
        try {
          await RoomService.broadcastAction(
            currentRoom.id,
            currentUserId,
            safeIndex,
            "mysteryCard",
            {
              mysteryCard,
              position: playerPositions[safeIndex],
            }
          );
        } catch (error) {
          log("❌", "Failed to broadcast mystery card", error);
        }
      }

      // Show video if Bomb or Lightning card
      if (mysteryCard.deck === "Bomb") {
        setLandedMysteryCard(mysteryCard); // Set BEFORE showing video
        setVideoPath("/games/pokeropoly/video/bomb.mp4");
        setVideoCardType("bomb");
        setShowVideoModal(true);
        setShowMysteryCardModal(false);

        const bombSound = new Audio(
          "/games/pokeropoly/sound/bomb-explosion.mp3"
        );
        bombSound.volume = 0.9;
        bombSound.play().catch((e) => console.log("Bomb sound failed", e));

        setTimeout(() => {
          proceedWithMysteryCardEffect(mysteryCard, safeIndex);
        }, 5000);
        return;
      } else if (mysteryCard.deck === "Mystery") {
        setLandedMysteryCard(mysteryCard); // Set BEFORE showing video
        setVideoPath("/games/pokeropoly/video/lightning.mp4");
        setVideoCardType("lightning");
        setShowVideoModal(true);
        setShowMysteryCardModal(false);

        const lightningSound = new Audio(
          "/games/pokeropoly/sound/lightning-strike.mp3"
        );
        lightningSound.volume = 0.9;
        lightningSound
          .play()
          .catch((e) => console.log("Lightning sound failed", e));

        setTimeout(() => {
          proceedWithMysteryCardEffect(mysteryCard, safeIndex);
        }, 5000);
        return;
      }

      // For non-video mystery cards, show modal immediately
      setLandedMysteryCard(mysteryCard);
      setShowMysteryCardModal(true);
    },
    [
      log,
      currentRoom,
      currentUserId,
      playerPositions,
      proceedWithMysteryCardEffect,
    ]
  );

  const handleMoveFromShoe = useCallback(
    async (total: number, isPair?: boolean) => {
      log("🚀", "=== MOVING START ===");

      if (playersRef.current.length === 0) {
        log("❌", "NO PLAYERS - CANNOT MOVE");
        return;
      }

      const safeIndex = getSafePlayerIndex(
        currentIndexRef.current,
        "handleMoveFromShoe"
      );
      log("🚀", `MOVING PLAYER ${safeIndex} TOTAL: ${total}`);

      const currentPos =
        playersRef.current[safeIndex]?.boardPosition ||
        playerPositions[safeIndex] ||
        0;

      setIsMoving(true);
      setCurrentDiceTotal(total);

      const moveSound = new Audio(`/games/pokeropoly/sound/move-${total}.mp3`);
      moveSound.volume = 0.5;
      moveSound.play().catch((e) => console.log("Sound failed:", e));

      let movesMade = 0;

      const moveInterval = setInterval(() => {
        if (movesMade < total) {
          const oldPos = (currentPos + movesMade) % 64;
          const newPos = (currentPos + movesMade + 1) % 64;

          setPlayerPositions((prev) => {
            const updated = [...prev];
            updated[safeIndex] = newPos;
            return updated;
          });

          setPlayers((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            if (!updated[safeIndex]) {
              updated[safeIndex] = playersRef.current[safeIndex];
            }
            updated[safeIndex] = {
              ...updated[safeIndex],
              boardPosition: newPos,
            };

            // Check for lap completion (matching LocalGame logic)
            if (oldPos === 63 && newPos === 0) {
              log("🏁", "Player completed a lap");

              // Expire wilds collected at positions passed on this lap
              const wildPositions = updated[safeIndex].wildCollectedAt || [];
              let wildsExpired = 0;
              const keptWilds = wildPositions.filter(
                (wildPos) => wildPos !== newPos
              );
              wildsExpired = wildPositions.length - keptWilds.length;

              if (wildsExpired > 0) {
                updated[safeIndex].wilds = Math.max(
                  0,
                  (updated[safeIndex].wilds || 0) - wildsExpired
                );
                updated[safeIndex].wildCollectedAt = keptWilds;
                log("⏰", `Wild cards expired for player ${safeIndex}`, {
                  expired: wildsExpired,
                  remaining: updated[safeIndex].wilds,
                });
              } else {
                updated[safeIndex].wildCollectedAt = keptWilds;
              }
            }

            playersRef.current = updated;
            return updated;
          });

          movesMade++;
        } else {
          clearInterval(moveInterval);
          setIsMoving(false);
          setCurrentDiceTotal(null);

          const finalPosition = (currentPos + total) % 64;

          if (isJokerPosition(finalPosition)) {
            log("🃏", "Player landed on Joker!");

            setPlayers((prev) => {
              const updated = [...prev];
              const playerWilds = updated[safeIndex].wilds || 0;
              const collectedAt = updated[safeIndex].wildCollectedAt || [];

              // Prevent duplicate collection
              if (!collectedAt.includes(finalPosition)) {
                updated[safeIndex] = {
                  ...updated[safeIndex],
                  wilds: playerWilds + 1,
                  wildCollectedAt: [...collectedAt, finalPosition],
                };
                log(
                  "🃏",
                  `Added wild to player ${safeIndex}, wilds: ${updated[safeIndex].wilds}`
                );
              } else {
                log(
                  "⚠️",
                  `Duplicate joker at position ${finalPosition} - skipping increment`
                );
              }

              playersRef.current = updated;
              return updated;
            });

            // Show modal briefly, then auto-continue (no effects to process)
            setLandedMysteryCard(JOKER_CARD);
            setShowMysteryCardModal(true);

            // Auto-close and advance turn after 2s
            setTimeout(() => {
              log("🃏", "Wild card auto-processed - continuing turn");
              setShowMysteryCardModal(false);
              setLandedMysteryCard(null);

              // Handle extras first, then end turn
              if (hasExtraTurn) {
                setHasExtraTurn(false);
                setHasPair(false);
              } else {
                endTurn();
              }
            }, 2000); // Matches LocalGame 2s delay

            return;
          }

          const mysteryCard = mysteryCardPositions[finalPosition];

          if (mysteryCard) {
            log("❓", "LANDED ON MYSTERY CARD", mysteryCard.title);

            setPlayers((prev) => {
              const updated = [...prev];
              updated[safeIndex] = checkWildExpiration(
                updated[safeIndex],
                finalPosition
              );

              // Only increment wilds if this is actually a Joker card
              if (mysteryCard.deck === "Joker") {
                const collectedAt = updated[safeIndex].wildCollectedAt || [];

                // Prevent duplicate collection
                if (!collectedAt.includes(finalPosition)) {
                  updated[safeIndex] = {
                    ...updated[safeIndex],
                    wilds: (updated[safeIndex].wilds || 0) + 1,
                    wildCollectedAt: [...collectedAt, finalPosition],
                  };
                }
              }

              playersRef.current = updated;
              return updated;
            });

            handleMysteryCardEffect(mysteryCard);
          } else {
            const card = dealtCards[finalPosition];
            const owner = cardOwners[finalPosition];

            if (card && owner !== undefined && owner !== safeIndex) {
              const ownerPlayer = playersRef.current[owner];
              const ownerBoughtCards = ownerPlayer.boughtCards.filter(
                (c): c is any => c !== null
              );

              // Include wilds in penalty calculation (matching LocalGame)
              const { penalty, hand } = calculatePenalty(
                card,
                ownerPlayer.collectedCards,
                ownerBoughtCards,
                ownerPlayer.wilds || 0
              );
              let handCards: any[] = [];

              if (hand && hand !== "High Card") {
                const handResult = detectPokerHand(
                  ownerPlayer.collectedCards,
                  ownerPlayer.wilds || 0
                );
                if (handResult && handResult.cards) {
                  handCards = handResult.cards;
                }
              }

              setPenaltyInfo({
                card,
                penalty,
                hand,
                handCards,
                ownerIndex: owner,
              });
            } else if (card && owner === undefined) {
              setLandedCard(card);
            } else {
              log("🏁", "LANDED ON EMPTY SPACE");
              setLandedCard(null);
              setPenaltyInfo(null);

              // Auto-end turn after landing on empty space
              setTimeout(() => {
                if (!hasPair && !hasExtraTurn) {
                  endTurn();
                }
              }, 500);
            }
          }
        }
      }, 300);
    },
    [
      dealtCards,
      cardOwners,
      playerPositions,
      getSafePlayerIndex,
      log,
      mysteryCardPositions,
      checkWildExpiration,
      handleMysteryCardEffect,
      hasPair,
      hasExtraTurn,
      endTurn,
    ]
  );

  const handleDrawFromShoe = useCallback(
    async (total: number, isPair: boolean) => {
      if (!currentRoom || isRolling || playersRef.current.length === 0) {
        console.log(`🛑 ROLL SKIPPED`);
        return;
      }

      const safeIndex = getSafePlayerIndex(currentIndexRef.current, "rollDice");
      const isMyTurn = roomPlayers[safeIndex]?.user_id === currentUserId;

      console.log(
        `🎲 ROLL CHECK | Player: ${safeIndex} | My Turn: ${isMyTurn} | Doubles: ${isPair}`
      );

      if (!isMyTurn) {
        console.log(`🚫 NOT YOUR TURN - ROLL BLOCKED`);
        return;
      }

      setCurrentPlayerIndex(safeIndex);
      setIsRolling(true);
      setHasRolledThisTurn(true);
      setHasPair(isPair); // SET IT HERE - important!

      console.log(
        `🎰 ROLLING | Player ${safeIndex} | Total: ${total} | Pair: ${isPair}`
      );

      try {
        await RoomService.broadcastAction(
          currentRoom.id,
          currentUserId,
          safeIndex,
          "rollDice",
          { total, isPair }
        );

        await handleMoveFromShoe(total, isPair);
      } catch (error) {
        console.log(`❌ ROLL BROADCAST FAILED`, error);
      } finally {
        setTimeout(() => setIsRolling(false), 2000);
      }
    },
    [
      currentRoom,
      currentUserId,
      isRolling,
      roomPlayers,
      getSafePlayerIndex,
      handleMoveFromShoe,
      log,
    ]
  );

  const processActionQueue = useCallback(async () => {
    if (
      isProcessingRef.current ||
      actionQueueRef.current.length === 0 ||
      isMoving
    ) {
      return;
    }

    isProcessingRef.current = true;
    log("⚙️", `PROCESSING QUEUE - ${actionQueueRef.current.length} actions`);

    while (actionQueueRef.current.length > 0) {
      const action = actionQueueRef.current.shift();
      const safeIndex = getSafePlayerIndex(
        action.player_index,
        `action-${action.action_type}`
      );

      try {
        switch (action.action_type) {
          case "rollDice":
            await handleMoveFromShoe(
              action.action_data.total,
              action.action_data.isPair
            );
            break;

          case "buyCard":
            applyBuyCard(action.action_data);
            break;

          case "endTurn":
            const nextIndex = action.action_data.next_player_index || 0;
            currentIndexRef.current = nextIndex;
            setCurrentPlayerIndex(nextIndex);
            setHasRolledThisTurn(false);
            setLandedCard(null);
            setPenaltyInfo(null);
            break;

          case "payPenalty":
            applyPayPenalty(action.action_data);
            break;

          case "startAuction":
            const myPlayerIndex = roomPlayers.findIndex(
              (p) => p.user_id === currentUserId
            );
            if (myPlayerIndex !== action.player_index) {
              setAuctionInfo({
                card: action.action_data.card,
                position: action.action_data.position,
              });
            }
            setAuctionInitiatorIndex(action.player_index);
            setAuctionBids({});
            break;

          case "placeBid":
            setAuctionBids((prev) => ({
              ...prev,
              [action.player_index]: action.action_data.bidAmount,
            }));
            break;

          case "endAuction":
            const { winnerIndex, winningBid } = action.action_data;
            if (winnerIndex !== -1) {
              applyBuyCard({
                position: action.action_data.position,
                card: action.action_data.card,
                price: winningBid,
                player_index: winnerIndex,
              });
            }
            setAuctionInfo(null);
            setAuctionBids({});
            setAuctionInitiatorIndex(null);
            setLandedCard(null);
            break;

          case "playerLeft":
            log("👋", `Player ${action.action_data.playerName} left the game`);

            // Mark player as eliminated
            setPlayers((prev) => {
              const updated = [...prev];
              updated[safeIndex] = {
                ...updated[safeIndex],
                isEliminated: true,
              };
              playersRef.current = updated;
              return updated;
            });

            // Return their cards to the board
            setCardOwners((prev) => {
              const updated = { ...prev };
              Object.entries(updated).forEach(([position, ownerIdx]) => {
                if (ownerIdx === safeIndex) {
                  delete updated[parseInt(position)];
                }
              });
              return updated;
            });

            // Update turn if needed
            const nextPlayerIdx = action.action_data.nextPlayerIndex;
            if (nextPlayerIdx !== undefined) {
              currentIndexRef.current = nextPlayerIdx;
              setCurrentPlayerIndex(nextPlayerIdx);
              setHasRolledThisTurn(false);
              setLandedCard(null);
              setPenaltyInfo(null);
            }

            // Check game over
            setTimeout(() => checkGameOver(), 1000);
            break;
        }
      } catch (error) {
        log("❌", "ACTION PROCESSING ERROR", error);
      }
    }

    isProcessingRef.current = false;

    if (actionQueueRef.current.length > 0) {
      setTimeout(() => processActionQueue(), 100);
    }
  }, [
    handleMoveFromShoe,
    applyBuyCard,
    applyPayPenalty,
    getSafePlayerIndex,
    isMoving,
    log,
    roomPlayers,
    currentUserId,
  ]);

  useEffect(() => {
    if (!isMoving && actionQueueRef.current.length > 0) {
      processActionQueue();
    }
  }, [isMoving, processActionQueue]);

  const handleIncomingActionRef = useRef<(payload: any) => void>();

  handleIncomingActionRef.current = useCallback(
    async (payload: any) => {
      const action = payload.new || payload.payload;

      log("📨", "RAW ACTION RECEIVED", {
        type: action.action_type,
        player: action.player_index,
      });

      if (action.user_id === currentUserId) {
        log("⏭️", "SKIPPING OWN ACTION");
        return;
      }

      actionQueueRef.current.push(action);
      log("📦", `QUEUED - ${actionQueueRef.current.length} in queue`);

      if (!isMoving) {
        processActionQueue();
      }
    },
    [currentUserId, processActionQueue, isMoving, log]
  );

  useEffect(() => {
    if (gameMode !== "playing" || !currentRoom) return;

    log("🎮", "=== CREATING SUBSCRIPTION ===");

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    const newChannel = RoomService.subscribeToActions(
      currentRoom.id,
      (payload) => handleIncomingActionRef.current?.(payload)
    );
    subscriptionRef.current = newChannel;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [gameMode, currentRoom, log]);

  const handleBuyCard = useCallback(async () => {
    if (!landedCard || !currentRoom || playersRef.current.length === 0) return;
    const safeIndex = getSafePlayerIndex(currentIndexRef.current, "buyCard");
    const finalPosition = playerPositions[safeIndex];
    const cardPrice = getCardPrice(landedCard.value);
    const player = playersRef.current[safeIndex];

    if (!player || player.chips < cardPrice) return;

    applyBuyCard({
      position: finalPosition,
      card: landedCard,
      price: cardPrice,
      player_index: safeIndex,
    });

    await RoomService.broadcastAction(
      currentRoom.id,
      currentUserId,
      safeIndex,
      "buyCard",
      {
        position: finalPosition,
        card: landedCard,
        price: cardPrice,
        player_index: safeIndex,
      }
    );

    setLandedCard(null);
    setPenaltyInfo(null);

    // Check for doubles before ending turn
    setTimeout(() => {
      if (!hasPair && !hasExtraTurn) {
        endTurn();
      }
    }, 500);
  }, [
    landedCard,
    currentRoom,
    currentUserId,
    playerPositions,
    getSafePlayerIndex,
    applyBuyCard,
    endTurn,
    hasPair,
    hasExtraTurn,
  ]);

  const handlePayPenalty = useCallback(async () => {
    if (!penaltyInfo || !currentRoom || playersRef.current.length === 0) return;
    const safeIndex = getSafePlayerIndex(currentIndexRef.current, "payPenalty");

    applyPayPenalty({
      payerIndex: safeIndex,
      receiverIndex: getSafePlayerIndex(penaltyInfo.ownerIndex, "payPenalty"),
      amount: penaltyInfo.penalty,
    });

    await RoomService.broadcastAction(
      currentRoom.id,
      currentUserId,
      safeIndex,
      "payPenalty",
      {
        payerIndex: safeIndex,
        receiverIndex: getSafePlayerIndex(penaltyInfo.ownerIndex, "payPenalty"),
        amount: penaltyInfo.penalty,
      }
    );

    setPenaltyInfo(null);

    // Check for doubles before ending turn
    setTimeout(() => {
      if (!hasPair && !hasExtraTurn) {
        endTurn();
      }
    }, 500);
  }, [
    penaltyInfo,
    currentRoom,
    currentUserId,
    getSafePlayerIndex,
    applyPayPenalty,
    endTurn,
    hasPair,
    hasExtraTurn,
  ]);

  const handleStartAuction = useCallback(async () => {
    if (!landedCard || !currentRoom) return;
    const safeIndex = getSafePlayerIndex(currentIndexRef.current, "auction");
    const position = playerPositions[safeIndex];

    await RoomService.broadcastAction(
      currentRoom.id,
      currentUserId,
      safeIndex,
      "startAuction",
      { card: landedCard, position }
    );

    setAuctionInitiatorIndex(safeIndex);
    setAuctionBids({});
    setLandedCard(null);
  }, [
    landedCard,
    currentRoom,
    currentUserId,
    playerPositions,
    getSafePlayerIndex,
  ]);

  const handlePlaceBid = useCallback(
    async (bidAmount: number) => {
      if (!auctionInfo || !currentRoom) return;
      const myPlayerIndex = roomPlayers.findIndex(
        (p) => p.user_id === currentUserId
      );

      setAuctionBids((prev) => ({ ...prev, [myPlayerIndex]: bidAmount }));

      await RoomService.broadcastAction(
        currentRoom.id,
        currentUserId,
        myPlayerIndex,
        "placeBid",
        { bidAmount }
      );
    },
    [auctionInfo, currentRoom, currentUserId, roomPlayers]
  );

  const handleCloseAuction = useCallback(async () => {
    if (!currentRoom || Object.keys(auctionBids).length === 0) return;

    let winnerIndex = -1;
    let winningBid = 0;

    Object.entries(auctionBids).forEach(([playerIndex, bid]) => {
      if (bid > winningBid) {
        winningBid = bid;
        winnerIndex = parseInt(playerIndex);
      }
    });

    const position = playerPositions[currentIndexRef.current];
    const card = dealtCards[position];

    await RoomService.broadcastAction(
      currentRoom.id,
      currentUserId,
      currentIndexRef.current,
      "endAuction",
      { winnerIndex, winningBid, card, position }
    );

    if (winnerIndex !== -1) {
      applyBuyCard({
        position,
        card,
        price: winningBid,
        player_index: winnerIndex,
      });
    }

    setAuctionBids({});
    setAuctionInitiatorIndex(null);

    // Check for doubles before ending turn
    setTimeout(() => {
      if (!hasPair && !hasExtraTurn) {
        endTurn();
      }
    }, 500);
  }, [
    auctionBids,
    currentRoom,
    currentUserId,
    playerPositions,
    dealtCards,
    applyBuyCard,
    endTurn,
    hasPair,
    hasExtraTurn,
  ]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    currentIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex]);

  useEffect(() => {
    setHasRolledThisTurn(false);
  }, [currentPlayerIndex]);

  useEffect(() => {
    if (gameMode === "playing" && roomPlayers.length > 0 && currentUserId) {
      const myPlayerIndex = roomPlayers.findIndex(
        (p) => p.user_id === currentUserId
      );
      if (myPlayerIndex !== -1) {
        const rotationOffsets = [0, 90, 180, 270];
        setBaseRotation(rotationOffsets[myPlayerIndex]);
      }
    }
  }, [gameMode, roomPlayers, currentUserId]);

  const handleCreateRoom = useCallback(async () => {
    if (!currentUserId) {
      alert("Please log in to create a room");
      return;
    }
    const room = await RoomService.createRoom(currentUserId, 4);
    if (!room) {
      alert("Failed to create room");
      return;
    }
    const joinResult = await RoomService.joinRoom(
      room.room_code,
      currentUserId,
      currentUsername
    );
    if (!joinResult.success) {
      alert("Failed to join room: " + joinResult.error);
      return;
    }
    await RoomService.setPlayerReady(room.id, currentUserId, true);
    setCurrentRoom(joinResult.room!);
    setRoomPlayers([{ ...joinResult.player!, is_ready: true }]);
    setIsHost(true);
    setGameMode("waiting");
  }, [currentUserId, currentUsername]);

  const handleJoinRoom = useCallback(
    async (roomCode: string) => {
      if (!currentUserId) {
        alert("Please log in to join a room");
        return;
      }
      const joinResult = await RoomService.joinRoom(
        roomCode,
        currentUserId,
        currentUsername
      );
      if (!joinResult.success) {
        alert("Failed to join room: " + joinResult.error);
        return;
      }
      setCurrentRoom(joinResult.room!);
      setIsHost(joinResult.room!.host_user_id === currentUserId);
      const players = await RoomService.getRoomPlayers(joinResult.room!.id);
      setRoomPlayers(players);
      setGameMode("waiting");
    },
    [currentUserId, currentUsername]
  );

  const handleToggleReady = useCallback(async () => {
    if (!currentRoom || !currentUserId) return;
    const currentPlayer = roomPlayers.find((p) => p.user_id === currentUserId);
    if (!currentPlayer) return;
    const success = await RoomService.setPlayerReady(
      currentRoom.id,
      currentUserId,
      !currentPlayer.is_ready
    );
    if (success) {
      setRoomPlayers((prev) =>
        prev.map((p) =>
          p.user_id === currentUserId ? { ...p, is_ready: !p.is_ready } : p
        )
      );
    }
  }, [currentRoom, currentUserId, roomPlayers]);

  const getNextActivePlayer = (startIndex: number): number => {
    const totalPlayers = playersRef.current.length;
    let index = startIndex % totalPlayers;
    let attempts = 0;

    while (playersRef.current[index]?.isEliminated && attempts < totalPlayers) {
      index = (index + 1) % totalPlayers;
      attempts++;
    }

    return attempts < totalPlayers ? index : -1;
  };

  const handleLeaveGame = useCallback(async () => {
    if (
      !confirm("Are you sure? Your bought cards will be returned to the board.")
    )
      return;

    try {
      // Find the leaving player's index (not current turn player)
      const myPlayerIndex = roomPlayers.findIndex(
        (p) => p.user_id === currentUserId
      );

      if (myPlayerIndex === -1) {
        alert("Cannot identify your player");
        return;
      }

      const safeIndex = getSafePlayerIndex(myPlayerIndex, "leaveGame");
      const playerToRemove = playersRef.current[safeIndex];
      const roomPlayerRecord = roomPlayers[safeIndex];

      if (!currentRoom || !roomPlayerRecord) {
        alert("Cannot identify player record");
        return;
      }

      log("👋", `PLAYER LEAVING: ${playerToRemove.name}`);

      // 1. Mark player as eliminated and clear their cards
      const { error: updateError } = await supabase
        .from("poker_opoly_players")
        .update({
          eliminated: true,
          left_at: new Date().toISOString(),
          chips: 0,
          bought_cards: [], // Clear their bought cards
        })
        .eq("id", roomPlayerRecord.id); // Use the actual player record ID

      if (updateError) {
        log("❌", "Failed to mark player eliminated", updateError);
        return;
      }

      // 2. Broadcast leave action to all players
      await RoomService.broadcastAction(
        currentRoom.id,
        currentUserId,
        safeIndex,
        "playerLeft",
        {
          boughtCards: playerToRemove.boughtCards || [],
          playerName: playerToRemove.name,
          nextPlayerIndex: getNextActivePlayer(safeIndex + 1),
        }
      );

      // 3. Update UI: Mark player as eliminated
      setPlayers((prev) => {
        const updated = [...prev];
        updated[safeIndex] = {
          ...updated[safeIndex],
          isEliminated: true,
        };
        playersRef.current = updated;
        return updated;
      });

      // 4. Reset bought cards on board
      setCardOwners((prev) => {
        const updated = { ...prev };
        Object.entries(updated).forEach(([position, ownerIdx]) => {
          if (ownerIdx === safeIndex) {
            delete updated[parseInt(position)];
          }
        });
        return updated;
      });

      // 5. Advance turn to next active player
      const nextPlayerIndex = getNextActivePlayer(safeIndex + 1);

      await supabase
        .from("game_rooms")
        .update({
          current_turn_player_index: nextPlayerIndex,
        })
        .eq("id", currentRoom.id);

      currentIndexRef.current = nextPlayerIndex;
      setCurrentPlayerIndex(nextPlayerIndex);
      setHasRolledThisTurn(false);
      setLandedCard(null);
      setPenaltyInfo(null);

      // 6. Check if game should end
      const remainingPlayers = playersRef.current.filter(
        (p) => !p.isEliminated && p.chips > 0
      );

      if (remainingPlayers.length <= 1) {
        await supabase
          .from("game_rooms")
          .update({ status: "finished" })
          .eq("id", currentRoom.id);

        log("🏆", "GAME ENDED - ONLY 1 PLAYER REMAINING");
      }

      log("✅", "PLAYER LEFT SUCCESSFULLY");

      // Redirect to homepage
      navigate("/home");
    } catch (error) {
      log("❌", "ERROR LEAVING GAME", error);
      alert("Failed to leave game. Please try again.");
    }
  }, [
    currentRoom,
    currentUserId,
    roomPlayers,
    getSafePlayerIndex,
    log,
    navigate,
  ]);

  const handleStartGame = useCallback(async () => {
    if (!currentRoom || !isHost) return;
    const success = await RoomService.startGame(currentRoom.id, currentUserId);
    if (success) {
      const freshRoom = await RoomService.getRoom(currentRoom.id);
      setGameMode("playing");
      await initializeFromGameState(freshRoom!);
    }
  }, [currentRoom, currentUserId, isHost, initializeFromGameState]);

  const handleLeaveRoom = useCallback(async () => {
    if (!currentRoom || !currentUserId) return;

    try {
      if (waitingRoomSubsRef.current) {
        await waitingRoomSubsRef.current.room?.unsubscribe();
        await waitingRoomSubsRef.current.players?.unsubscribe();
        waitingRoomSubsRef.current = null;
      }

      await RoomService.leaveRoom(currentRoom.room_code, currentUserId);

      setCurrentRoom(null);
      setRoomPlayers([]);
      setIsHost(false);
      setGameMode("select");

      actionQueueRef.current = [];
      isProcessingRef.current = false;
      currentIndexRef.current = 0;
      playersRef.current = [];
      setPlayers([]);
      setGameStarted(false);
      setDealtCards({});
      setCardOwners({});
      setCurrentPlayerIndex(0);
      setPlayerPositions([0, 16, 32, 48]);
      setHasRolledThisTurn(false);
      setLandedCard(null);
      setPenaltyInfo(null);
      setAuctionInfo(null);
      setShowSellModal(false);
    } catch (error) {
      console.error("Error in handleLeaveRoom:", error);
      setCurrentRoom(null);
      setRoomPlayers([]);
      setIsHost(false);
      setGameMode("select");
    }
  }, [currentRoom, currentUserId]);

  const onRollComplete = useCallback(
    (dice1: number, dice2: number) => {
      const total = dice1 + dice2;
      const hasPair = dice1 === dice2; // Correct: 1=1, 2=2, 3=3, etc

      console.log(
        `🎲 Rolled: ${dice1} + ${dice2} = ${total} | Doubles: ${hasPair}`
      );

      handleDrawFromShoe(total, hasPair);
    },
    [handleDrawFromShoe, log]
  );

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = invertScroll ? -1 : 1;
    const rotationAmount = e.deltaY > 0 ? 10 * direction : -10 * direction;

    if (rotationMode === "board") {
      setBoardRotation((prev) => prev + rotationAmount);
    } else {
      setProfileRotation((prev) => prev + rotationAmount);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - touchStart;
    const direction = invertScroll ? -1 : 1;
    const rotationAmount = diff * 0.5 * direction;

    if (rotationMode === "board") {
      setBoardRotation((prev) => prev + rotationAmount);
    } else {
      setProfileRotation((prev) => prev + rotationAmount);
    }

    setTouchStart(currentTouch);
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const getPropertyPosition = (index: number) => {
    const boardSize = 870;
    const cardWidth = 52;
    const cardHeight = 75;
    const cornerSize = 82.69;
    const gap = 2;

    let x = 0,
      y = 0,
      rotateZ = 0,
      isCorner = false;

    if (index < spacesPerSide) {
      const i = index;
      if (i === 0) {
        x =
          boardSize / 2 -
          1 * (cardWidth + gap) -
          70 -
          (cardWidth + gap) +
          cornerOffsets.bottomRight.x;
        y = boardSize / 2 + 10 + cornerOffsets.bottomRight.y;
        isCorner = true;
      } else {
        x = boardSize / 2 - i * (cardWidth + gap) - 75 + 70;
        y = boardSize / 2 + 10 + 10;
      }
      rotateZ = 0;
    } else if (index < spacesPerSide * 2) {
      const i = index - spacesPerSide;
      if (i === 0) {
        x = -boardSize / 2 - 10 + cornerOffsets.bottomLeft.x;
        y =
          boardSize / 2 -
          1 * (cardWidth + gap) -
          75 -
          (cardWidth + gap) +
          cornerOffsets.bottomLeft.y;
        isCorner = true;
      } else {
        x = -boardSize / 2 - 10 - 10;
        y = boardSize / 2 - i * (cardWidth + gap) - 75 + 70;
      }
      rotateZ = 90;
    } else if (index < spacesPerSide * 3) {
      const i = index - spacesPerSide * 2;
      if (i === 0) {
        x =
          -boardSize / 2 +
          1 * (cardWidth + gap) +
          75 +
          (cardWidth + gap) +
          cornerOffsets.topLeft.x;
        y = -boardSize / 2 - 10 + cornerOffsets.topLeft.y;
        isCorner = true;
      } else {
        x = -boardSize / 2 + i * (cardWidth + gap) + 75 - 70;
        y = -boardSize / 2 - 10 - 10;
      }
      rotateZ = 180;
    } else {
      const i = index - spacesPerSide * 3;
      if (i === 0) {
        x = boardSize / 2 + 10 + cornerOffsets.topRight.x;
        y =
          -boardSize / 2 +
          1 * (cardWidth + gap) +
          75 +
          (cardWidth + gap) +
          cornerOffsets.topRight.y;
        isCorner = true;
      } else {
        x = boardSize / 2 + 10 + 10;
        y = -boardSize / 2 + i * (cardWidth + gap) + 75 - 70;
      }
      rotateZ = 270;
    }

    return {
      x,
      y,
      rotateZ,
      width: isCorner ? cornerSize : cardWidth,
      height: isCorner ? cornerSize : cardHeight,
      isCorner,
    };
  };

  const handleDeal = () => {
    const dealSound = new Audio("games/pokeropoly/sound/deal-cards.mp3");
    dealSound.volume = 0.7; // Adjust volume as needed (0.5-0.9 range works well with other sounds)
    dealSound.play().catch((e) => console.log("Deal sound failed", e));
    const suits = ["♠", "♥", "♦", "♣"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    const fullDeck: { suit: string; value: string }[] = [];
    suits.forEach((suit) => {
      values.forEach((value) => {
        fullDeck.push({ suit, value });
      });
    });

    for (let i = fullDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
    }

    const newDealtCards: { [key: number]: { suit: string; value: string } } =
      {};
    let deckIndex = 0;

    for (let i = 0; i < totalSpaces; i++) {
      if (i === 0 || i === 16 || i === 32 || i === 48) continue;
      if (QUESTION_MARK_POSITIONS.includes(i)) continue;

      newDealtCards[i] = fullDeck[deckIndex];
      deckIndex++;
    }

    setDealtCards(newDealtCards);

    const newMysteryCards: { [key: number]: MysteryCard } = {};
    const newJokerPositions = initializeJokerPositions();
    setJokerPositions(newJokerPositions);

    const nonJokerPositions = QUESTION_MARK_POSITIONS.filter(
      (pos) => !newJokerPositions.includes(pos)
    );

    const shuffledMysteryCards = [...MYSTERY_CARDS].sort(
      () => Math.random() - 0.5
    );
    const shuffledBombCards = [...BOMB_CARDS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 6; i++) {
      const pos = nonJokerPositions[i];
      if (i < 3) {
        newMysteryCards[pos] = shuffledMysteryCards[i];
      } else {
        newMysteryCards[pos] = shuffledBombCards[i - 3];
      }
    }

    setMysteryCardPositions(newMysteryCards);

    const allCardIndices = Object.keys(newDealtCards).map(Number);
    setCardsAnimating(new Set(allCardIndices));
    setAnimationTrigger((prev) => prev + 1);

    setTimeout(() => {
      setCardsAnimating(new Set());
    }, 2500);

    if (!gameStarted) {
      const randomPlayer = Math.floor(Math.random() * 4);
      setCurrentPlayerIndex(randomPlayer);
      setGameStarted(true);
    }
  };

  const getCard = (index: number) => {
    if (index === 0 || index === 16 || index === 32 || index === 48) {
      const cornerSuits = ["♠", "♥", "♦", "♣"];
      const suitIndex =
        index === 0 ? 0 : index === 16 ? 1 : index === 32 ? 2 : 3;
      return { isCorner: true, value: "", suit: cornerSuits[suitIndex] };
    }

    if (QUESTION_MARK_POSITIONS.includes(index)) {
      return { isCorner: false, value: "?", suit: "", isQuestion: true };
    }

    if (dealtCards[index]) {
      return { ...dealtCards[index], isCorner: false, isQuestion: false };
    }

    return { suit: "", value: "", isCorner: false, isQuestion: false };
  };

  const getSuitColor = (suit: string) => {
    if (suit === "♥") return "#DC143C";
    if (suit === "♦") return "#90EE90";
    if (suit === "♣") return "#ADD8E6";
    return "#000000";
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        setCurrentUsername(profile?.username || "Player");
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (gameMode !== "waiting" || !currentRoom) {
      if (waitingRoomSubsRef.current) {
        waitingRoomSubsRef.current.room?.unsubscribe();
        waitingRoomSubsRef.current.players?.unsubscribe();
        waitingRoomSubsRef.current = null;
      }
      return;
    }

    const roomId = currentRoom.id;

    const roomChannel = RoomService.subscribeToRoom(
      roomId,
      async (updatedRoom) => {
        setCurrentRoom(updatedRoom);

        if (updatedRoom.status === "playing" && !isHost) {
          setGameMode("playing");
          await initializeFromGameState(updatedRoom);
        }
      }
    );

    const playersChannel = RoomService.subscribeToRoomPlayers(
      roomId,
      (updatedPlayers) => {
        const stillInRoom = updatedPlayers.some(
          (p) => p.user_id === currentUserId
        );

        if (!stillInRoom) {
          setCurrentRoom(null);
          setRoomPlayers([]);
          setIsHost(false);
          setGameMode("select");
          return;
        }

        setRoomPlayers(updatedPlayers);
      }
    );

    waitingRoomSubsRef.current = { room: roomChannel, players: playersChannel };

    return () => {
      roomChannel.unsubscribe();
      playersChannel.unsubscribe();
      waitingRoomSubsRef.current = null;
    };
  }, [
    gameMode,
    currentRoom?.id,
    isHost,
    currentUserId,
    initializeFromGameState,
  ]);

  if (gameMode === "select") {
    return (
      <MultiplayerLobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onPlayLocal={handlePlayLocal} // ADD THIS LINE
        onBack={() => navigate("/home")} // <-- This goes HERE, not in MultiplayerLobby.tsx
      />
    );
  }
  if (showLocalGame) {
    // Import your LocalGame component at the top
    return <LocalGame />;
  }
  if (gameMode === "waiting") {
    if (!currentRoom) return null;
    return (
      <WaitingRoom
        roomCode={currentRoom.room_code}
        players={roomPlayers}
        isHost={isHost}
        currentUserId={currentUserId}
        onToggleReady={handleToggleReady}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // 🏆 WINNER SCREEN
  if (gameOver && winner) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden p-4">
        {/* Animated background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-3xl w-full max-h-[95vh] overflow-y-auto">
          {/* Main Winner Card */}
          <div className="bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-2xl rounded-2xl border-4 border-yellow-400 shadow-2xl overflow-hidden">
            {/* Trophy Header */}
            <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-500/20 border-b-2 border-yellow-400/50 py-4">
              <div className="text-center">
                <div className="text-6xl mb-2 animate-bounce inline-block">
                  🏆
                </div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-2 animate-pulse">
                  VICTORY!
                </h1>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black border-4 shadow-xl"
                    style={{
                      backgroundColor: winner.color,
                      borderColor: "#fbbf24",
                    }}
                  >
                    {winner.suit}
                  </div>
                  <div className="text-3xl font-black text-white">
                    {winner.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Prize Section */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Total Pool */}
                <div className="bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-xl p-3 border-2 border-yellow-400/60 shadow-xl">
                  <div className="text-yellow-300 text-xs font-bold mb-1 uppercase tracking-wider">
                    💰 Prize Pool
                  </div>
                  <div className="text-yellow-100 text-2xl font-black mb-0.5">
                    ${(15000 * players.length).toLocaleString()}
                  </div>
                  <div className="text-yellow-200/70 text-xs font-semibold">
                    {players.length} players × $15,000
                  </div>
                </div>

                {/* Final Score */}
                <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-xl p-3 border-2 border-green-400/60 shadow-xl">
                  <div className="text-green-300 text-xs font-bold mb-1 uppercase tracking-wider">
                    🎯 Final Score
                  </div>
                  <div className="text-green-100 text-2xl font-black mb-0.5">
                    ${winner.chips.toLocaleString()}
                  </div>
                  <div className="text-green-200/70 text-xs font-semibold">
                    Chips remaining in game
                  </div>
                </div>
              </div>

              {/* Final Standings */}
              <div className="mb-4">
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                  <span>📊</span> Final Standings
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {players
                    .sort((a, b) => b.chips - a.chips)
                    .map((player, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all ${
                          idx === 0
                            ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/70 shadow-lg"
                            : player.isEliminated
                              ? "bg-red-900/20 border-red-500/30"
                              : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`text-lg font-black ${
                              idx === 0
                                ? "text-yellow-400"
                                : idx === 1
                                  ? "text-gray-300"
                                  : idx === 2
                                    ? "text-orange-400"
                                    : "text-white/40"
                            }`}
                          >
                            {idx === 0
                              ? "🥇"
                              : idx === 1
                                ? "🥈"
                                : idx === 2
                                  ? "🥉"
                                  : `#${idx + 1}`}
                          </div>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2"
                            style={{
                              backgroundColor: player.color + "40",
                              borderColor: player.color,
                              color: player.color,
                            }}
                          >
                            {player.suit}
                          </div>
                          <div
                            className={`font-bold text-sm ${idx === 0 ? "text-yellow-200" : "text-white"} truncate max-w-[150px]`}
                          >
                            {player.name}
                          </div>
                          {player.isEliminated && (
                            <span className="text-red-400 text-xs font-semibold px-1.5 py-0.5 bg-red-500/20 rounded">
                              OUT
                            </span>
                          )}
                        </div>
                        <div
                          className={`font-black text-sm ${idx === 0 ? "text-yellow-300" : "text-yellow-400/70"}`}
                        >
                          ${player.chips.toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleLeaveRoom}
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-black py-3 px-6 rounded-lg shadow-2xl transform hover:scale-105 active:scale-95 transition-all text-base border-2 border-blue-400/50"
              >
                🏠 Back to Lobby
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🏆 GAME OVER (NO WINNER)
  if (gameOver && !winner) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-12 border-4 border-gray-400 shadow-2xl max-w-2xl w-full mx-4">
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">😢</div>
            <h1 className="text-5xl font-black text-white mb-8">GAME OVER</h1>
            <p className="text-white/80 text-xl mb-8">
              All players eliminated!
            </p>
            <button
              onClick={handleLeaveRoom}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-black py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 active:scale-95 transition-all text-lg border-2 border-blue-400/50"
            >
              🏠 Back to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode !== "playing" || players.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <div className="text-white text-3xl font-bold">Loading game...</div>
            <div className="text-white/60 text-sm space-y-1 text-center">
              <div>Players: {players.length}</div>
              <div>Current Turn: {currentPlayerIndex}</div>
              <div>Mode: {gameMode}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen flex items-center justify-center overflow-hidden relative"
      style={{
        backgroundImage: "url(/games/pokeropoly/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* CONTROLS */}
      <div className="fixed top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setInvertScroll(!invertScroll)}
          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-2 px-4 rounded-lg shadow-xl transition-all hover:scale-105 text-sm border-2 border-slate-500"
        >
          {invertScroll ? "🔄 Scroll: Inverted" : "🔄 Scroll: Normal"}
        </button>

        <button
          onClick={() => {
            const newMode = rotationMode === "board" ? "profiles" : "board";
            setRotationMode(newMode);
          }}
          className={`${
            rotationMode === "board"
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          } text-white font-bold py-2 px-4 rounded-lg shadow-xl transition-all hover:scale-105 text-sm border-2 ${
            rotationMode === "board" ? "border-blue-500" : "border-green-500"
          }`}
        >
          {rotationMode === "board"
            ? "🎲 Rotate: Board"
            : "👥 Rotate: Profiles"}
        </button>

        {gameStarted && (
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border-2 border-slate-500">
            <div className="text-white text-xs font-semibold mb-2">Audio</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-white text-xs w-12">🎵</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume * 100}
                  onChange={(e) => {
                    const volume = parseFloat(e.target.value) / 100;
                    setMusicVolume(volume);
                    if (audioRef.current) {
                      audioRef.current.volume = volume;
                    }
                  }}
                  className="w-24"
                />
                <span className="text-white text-xs">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AUCTION BIDS PANEL */}
      {auctionInitiatorIndex ===
        roomPlayers.findIndex((p) => p.user_id === currentUserId) &&
        Object.keys(auctionBids).length > 0 && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-[400px]">
            <div className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-xl border-4 border-yellow-400/50 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-6 text-center flex items-center justify-center gap-3">
                <span className="text-4xl">🔨</span>
                <span>Auction Bids</span>
              </h3>

              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                {Object.entries(auctionBids).map(([playerIndex, bid]) => (
                  <div
                    key={playerIndex}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border-2"
                        style={{
                          backgroundColor:
                            players[parseInt(playerIndex)]?.color + "40",
                          borderColor: players[parseInt(playerIndex)]?.color,
                          color: players[parseInt(playerIndex)]?.color,
                        }}
                      >
                        {players[parseInt(playerIndex)]?.suit}
                      </div>
                      <span className="text-white font-bold text-lg">
                        {players[parseInt(playerIndex)]?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-black text-2xl">
                        ${bid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCloseAuction}
                className="w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl transform hover:scale-105 active:scale-95 transition-all text-lg border-2 border-green-400/50"
              >
                ✅ Accept Highest Bid
              </button>
            </div>
          </div>
        )}

      {gameStarted &&
        gameMode === "playing" &&
        !gameOver &&
        roomPlayers.some((p) => p.user_id === currentUserId) && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={handleLeaveGame}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-3 px-6 rounded-lg shadow-2xl transform hover:scale-105 active:scale-95 transition-all text-sm border-2 border-red-400/50 backdrop-blur-sm"
            >
              🚪 Leave Game
            </button>
          </div>
        )}

      {/* BOARD */}
      <div className="perspective-1000 w-full h-full flex items-center justify-center">
        <div
          className="preserve-3d relative transition-transform duration-700 ease-out"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z + boardRotation}deg)`,
            width: "850px",
            height: "850px",
          }}
        >
          {/* Board Background */}
          <div
            className="absolute inset-0 rounded-lg shadow-2xl overflow-hidden pointer-events-none"
            style={{
              transform: "translateZ(-5px)",
              border: "20px solid #2a1810",
              background: `
                radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 90% 20%, rgba(34, 211, 238, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #334155 75%, #1e293b 100%)
              `,
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px),
                  repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)
                `,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)`,
              }}
            />
            <div
              className="absolute top-8 left-8 w-32 h-32 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(34, 211, 238, 0.6) 0%, transparent 70%)",
                animation: "float 8s ease-in-out infinite",
              }}
            />
            <div
              className="absolute bottom-12 right-12 w-40 h-40 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)",
                animation: "float 10s ease-in-out infinite reverse",
              }}
            />
            <div
              className="absolute top-1/3 right-1/4 w-36 h-36 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)",
                animation: "float 12s ease-in-out infinite",
              }}
            />
            <div
              className="absolute inset-0 rounded-lg backdrop-blur-sm border-2 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(15, 23, 42, 0.6) 100%)",
                borderColor: "rgba(251, 191, 36, 0.3)",
                boxShadow: `
                  inset 0 0 60px rgba(99, 102, 241, 0.1),
                  inset 0 0 40px rgba(168, 85, 247, 0.1),
                  0 0 80px rgba(0, 0, 0, 0.5)
                `,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src="/games/pokeropoly/images/pokeropoly.png"
                  alt="Pokeropoly"
                  className="w-full h-full object-cover drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                />
              </div>
            </div>
          </div>

          {/* BOARD SPACES */}
          {Array.from({ length: totalSpaces }).map((_, index) => {
            const pos = getPropertyPosition(index);
            const card = getCard(index);
            const ownerIndex = cardOwners[index];
            const isOwned = ownerIndex !== undefined;
            const ownerColor = isOwned ? players[ownerIndex]?.color : undefined;
            const suitColor =
              isOwned && ownerColor ? ownerColor : getSuitColor(card.suit);
            const playersOnThisSpace = playerPositions
              .map((position, pIndex) => (position === index ? pIndex : -1))
              .filter((pIndex) => pIndex !== -1);

            return (
              <div
                key={index}
                className="absolute rounded-md transition-all hover:scale-110 cursor-pointer group"
                style={{
                  width: `${pos.width}px`,
                  height: `${pos.height}px`,
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotateZ}deg) translateZ(10px)`,
                  backgroundColor: "transparent",
                  border: "2px solid rgba(212, 175, 55, 0.3)",
                }}
              >
                {card.isCorner ? (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold rounded-md relative overflow-hidden border-4"
                    style={{
                      backgroundColor: getSuitColor(card.suit),
                      borderColor:
                        card.suit === "♥"
                          ? "#8B0000"
                          : card.suit === "♦"
                            ? "#32CD32"
                            : card.suit === "♣"
                              ? "#6495ED"
                              : "#333333",
                    }}
                  >
                    <div className="text-center relative z-10">
                      <div className="text-6xl text-white drop-shadow-lg">
                        {card.suit}
                      </div>
                    </div>
                    {playersOnThisSpace.length > 0 && (
                      <div
                        className="absolute flex gap-1"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%) translateZ(20px)",
                          zIndex: 100,
                        }}
                      >
                        {playersOnThisSpace.map((pIndex) => (
                          <PlayerIcon
                            key={pIndex}
                            color={players[pIndex]?.color || "#000"}
                            suit={players[pIndex]?.suit || "♠"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : jokerPositions.includes(index) ? (
                  <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-600 rounded-md">
                    <img
                      src="/games/pokeropoly/images/wildcard.png"
                      alt="Wild Card"
                      className="w-full h-full object-contain p-0.5"
                    />
                    {playersOnThisSpace.length > 0 && (
                      <div
                        className="absolute flex gap-0.5"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 100,
                        }}
                      >
                        {playersOnThisSpace.map((pIndex) => (
                          <PlayerIcon
                            key={pIndex}
                            color={players[pIndex]?.color || "#000"}
                            suit={players[pIndex]?.suit || "♠"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : card.isQuestion ? (
                  <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-600 rounded-md">
                    {(() => {
                      const isJoker = jokerPositions.includes(index);
                      const mysteryCard = mysteryCardPositions[index];

                      if (isJoker) {
                        return (
                          <img
                            src="/games/pokeropoly/images/wildcard.png"
                            alt="Wild Card"
                            className="w-full h-full object-cover p-1"
                          />
                        );
                      } else if (mysteryCard) {
                        const imagePath =
                          mysteryCard.deck === "Bomb"
                            ? "/games/pokeropoly/images/bomb.png"
                            : "/games/pokeropoly/images/lightining.png";

                        return (
                          <img
                            src={imagePath}
                            alt={
                              mysteryCard.deck === "Bomb"
                                ? "Bomb Card"
                                : "Mystery Card"
                            }
                            className="w-[100%] h-[100%] object-contain"
                            onError={(e) =>
                              console.error(
                                `❌ ${mysteryCard.deck} image failed to load:`,
                                e
                              )
                            }
                            onLoad={() =>
                              console.log(
                                `✅ ${mysteryCard.deck} image loaded at position:`,
                                index
                              )
                            }
                          />
                        );
                      } else {
                        return (
                          <div className="text-5xl font-bold text-purple-500 bg-white w-full h-full flex items-center justify-center">
                            ?
                          </div>
                        );
                      }
                    })()}

                    {playersOnThisSpace.length > 0 && (
                      <div
                        className="absolute flex gap-0.5"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 100,
                        }}
                      >
                        {playersOnThisSpace.map((pIndex) => (
                          <PlayerIcon
                            key={pIndex}
                            color={players[pIndex]?.color || "#000"}
                            suit={players[pIndex]?.suit || "♠"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : dealtCards[index] ? (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center relative border-2 shadow-sm"
                    style={{
                      backgroundColor: isOwned ? ownerColor : "white",
                      borderColor: isOwned ? ownerColor : suitColor,
                      animation: cardsAnimating.has(index)
                        ? `cardFall 0.6s ease-out ${(index % 64) * 0.03}s both`
                        : "none",
                    }}
                  >
                    <div
                      className="text-xl font-bold leading-none"
                      style={{ color: isOwned ? "white" : suitColor }}
                    >
                      {card.value}
                    </div>
                    <div
                      className="text-4xl leading-none mt-1"
                      style={{ color: isOwned ? "white" : suitColor }}
                    >
                      {card.suit}
                    </div>

                    {playersOnThisSpace.length > 0 && (
                      <div
                        className="absolute flex gap-0.5"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 100,
                        }}
                      >
                        {playersOnThisSpace.map((pIndex) => (
                          <PlayerIcon
                            key={pIndex}
                            color={players[pIndex]?.color || "#000"}
                            suit={players[pIndex]?.suit || "♠"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAYER PROFILES */}
      <div className="perspective-1000 w-full h-full flex items-center justify-center absolute inset-0 pointer-events-none">
        <div
          className="preserve-3d relative transition-transform duration-700 ease-out"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z + profileRotation}deg)`,
            width: "850px",
            height: "850px",
          }}
        >
          {players.map((player, index) => {
            log("📋", "Rendering player profile", {
              playerIndex: index,
              playerName: player.name,
            });
            const profilePositions = {
              bottom: { x: 0, y: 230, rotateZ: 0 },
              left: { x: -230, y: 0, rotateZ: 90 },
              top: { x: 0, y: -230, rotateZ: 180 },
              right: { x: 230, y: 0, rotateZ: 270 },
            };
            const pos = profilePositions[player.position];
            return (
              <div
                key={index}
                className="absolute pointer-events-auto"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotateZ(${pos.rotateZ}deg) rotateX(-40deg) translateZ(43px) scale(0.8)`,
                }}
              >
                <div
                  className="rounded-xl border-2 shadow-2xl p-4 min-w-[280px] relative"
                  style={{
                    backgroundColor: player.color,
                    borderColor: `${player.color}`,
                    boxShadow:
                      currentPlayerIndex === index
                        ? "0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)"
                        : undefined,
                  }}
                >
                  {currentPlayerIndex === index && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black font-bold text-xs px-3 py-1 rounded-full shadow-lg animate-pulse">
                      CURRENT TURN
                    </div>
                  )}

                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-white font-bold text-lg"
                          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                        >
                          {player.name}
                        </h3>
                        <span
                          className="text-2xl"
                          style={{
                            color:
                              player.suit === "♠"
                                ? "white"
                                : getSuitColor(player.suit),
                          }}
                        >
                          {player.suit}
                        </span>
                      </div>
                      <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg">
                        <span className="text-yellow-400 font-bold text-sm">
                          ${player.chips.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {player.wilds && player.wilds > 0 && (
                      <div className="text-xs text-yellow-400 font-bold">
                        🃏 Wild Cards Active: {player.wilds}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2"></div>
                    {currentPlayerIndex === index &&
                      !landedCard &&
                      !showMysteryCardModal &&
                      roomPlayers[index]?.user_id === currentUserId && (
                        <MiniSlotMachine
                          onRollComplete={onRollComplete}
                          isVisible={true}
                          disabled={isMoving}
                        />
                      )}

                    {currentPlayerIndex === index &&
                      currentDiceTotal !== null &&
                      isMoving && (
                        <div className="mt-2 bg-yellow-400 text-black font-bold text-center py-2 px-4 rounded-lg shadow-xl animate-pulse">
                          <div className="text-xs mb-1">Moving</div>
                          <div className="text-2xl">
                            {currentDiceTotal} Spaces
                          </div>
                        </div>
                      )}
                  </div>

                  {currentPlayerIndex === index && landedCard && (
                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 mb-3">
                      <div className="text-white/70 text-xs mb-2 font-semibold">
                        Landed Card
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg shadow-xl p-3 w-20 h-28 flex flex-col items-center justify-center gap-1">
                          <div
                            className="text-2xl font-bold"
                            style={{ color: getSuitColor(landedCard.suit) }}
                          >
                            {landedCard.value}
                          </div>
                          <div
                            className="text-3xl"
                            style={{ color: getSuitColor(landedCard.suit) }}
                          >
                            {landedCard.suit}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm mb-2">
                            <div className="text-yellow-400 font-bold">
                              Buy: ${getCardPrice(landedCard.value)}
                            </div>
                            <div className="text-gray-300">
                              Bank: $
                              {Math.floor(getCardPrice(landedCard.value) / 2)}
                            </div>
                            {detectPokerHand(
                              player.collectedCards,
                              player.wilds || 0
                            ) && (
                              <div className="text-blue-300 text-xs mt-1">
                                Current:{" "}
                                {
                                  detectPokerHand(
                                    player.collectedCards,
                                    player.wilds || 0
                                  )?.hand
                                }
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleBuyCard}
                              disabled={
                                player.chips < getCardPrice(landedCard.value)
                              }
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4/5 rounded-lg shadow-xl transition-all hover:scale-105 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Buy
                            </button>
                            <button
                              onClick={handleStartAuction}
                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-xl transition-all hover:scale-105 text-sm"
                            >
                              Auction
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-2">
                    {roomPlayers[index]?.user_id === currentUserId ? (
                      // Show full details for current user
                      player.boughtCards.length > 0 ? (
                        <>
                          <div className="text-white/70 text-xs mb-1.5 font-semibold">
                            Best Hand
                          </div>
                          <div className="space-y-2">
                            {(() => {
                              const hand = detectPokerHand(
                                player.collectedCards,
                                player.wilds || 0
                              );
                              const handCards = hand?.cards || [];
                              const remainingCards = player.boughtCards.filter(
                                (card) =>
                                  !handCards.some(
                                    (hCard) =>
                                      hCard.suit === card.suit &&
                                      hCard.value === card.value
                                  )
                              );

                              return (
                                <>
                                  {/* Poker Hand Section */}
                                  {handCards.length > 0 && hand && (
                                    <div>
                                      <p className="text-xs text-yellow-400 font-bold mb-1">
                                        {getHandDescription(hand.hand)}
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {handCards.map((card, cardIdx) => (
                                          <div
                                            key={cardIdx}
                                            className="rounded border-2 shadow-sm w-9 h-12 flex flex-col items-center justify-center bg-white"
                                            style={{ borderColor: "#FFD700" }}
                                          >
                                            <div
                                              className="text-[9px] font-bold leading-none"
                                              style={{
                                                color: getSuitColor(card.suit),
                                              }}
                                            >
                                              {card.value}
                                            </div>
                                            <div
                                              className="text-xs leading-none mt-0.5"
                                              style={{
                                                color: getSuitColor(card.suit),
                                              }}
                                            >
                                              {card.suit}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Remaining Cards Section */}
                                  {remainingCards.length > 0 && (
                                    <div>
                                      {handCards.length > 0 && (
                                        <p className="text-xs text-white/40 mb-1">
                                          Other Cards:
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-1">
                                        {remainingCards.map((card, cardIdx) => (
                                          <div
                                            key={cardIdx}
                                            className="rounded border-2 shadow-sm w-9 h-12 flex flex-col items-center justify-center bg-white"
                                            style={{
                                              borderColor: getSuitColor(
                                                card.suit
                                              ),
                                            }}
                                          >
                                            <div
                                              className="text-[9px] font-bold leading-none"
                                              style={{
                                                color: getSuitColor(card.suit),
                                              }}
                                            >
                                              {card.value}
                                            </div>
                                            <div
                                              className="text-xs leading-none mt-0.5"
                                              style={{
                                                color: getSuitColor(card.suit),
                                              }}
                                            >
                                              {card.suit}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </>
                      ) : (
                        <div className="text-white/50 text-xs text-center py-1">
                          No cards yet
                        </div>
                      )
                    ) : // Hide cards for other players - show card backs
                    player.boughtCards.length > 0 ? (
                      <>
                        <div className="text-white/70 text-xs mb-1.5 font-semibold">
                          {player.boughtCards.length} Cards
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {player.boughtCards.map((_, cardIdx) => (
                            <div
                              key={cardIdx}
                              className="rounded border-2 shadow-sm w-9 h-12 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600"
                              style={{ borderColor: player.color }}
                            >
                              <div className="text-white text-xs">🂠</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-white/50 text-xs text-center py-1">
                        No cards yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MYSTERY CARD MODAL */}
      {showMysteryCardModal && landedMysteryCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 border-4 border-yellow-400 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center space-y-6">
              <div className="text-7xl mb-4">
                {landedMysteryCard.icon ||
                  (landedMysteryCard.deck === "Joker"
                    ? "🃏"
                    : landedMysteryCard.deck === "Bomb"
                      ? "💣"
                      : "⚡")}
              </div>
              <h2 className="text-4xl font-black text-yellow-400 mb-2">
                {landedMysteryCard.name ||
                  landedMysteryCard.title ||
                  "Unknown Card"}
              </h2>
              <p className="text-white text-lg font-semibold">
                {landedMysteryCard.description ||
                  landedMysteryCard.text ||
                  "No description available"}
              </p>
              <div className="bg-white/10 rounded-xl p-4 border-2 border-white/20">
                {landedMysteryCard.effects.cb && (
                  <div
                    className={`text-2xl font-black ${
                      landedMysteryCard.effects.cb > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {landedMysteryCard.effects.cb > 0 ? "+" : ""}
                    {landedMysteryCard.effects.cb} Chips
                  </div>
                )}
                {landedMysteryCard.effects.mb && (
                  <div className="text-2xl font-black text-blue-400">
                    Move {landedMysteryCard.effects.mb > 0 ? "forward" : "back"}{" "}
                    {Math.abs(landedMysteryCard.effects.mb)} spaces
                  </div>
                )}
                {landedMysteryCard.effects.mt && (
                  <div className="text-2xl font-black text-blue-400">
                    Move to {landedMysteryCard.effects.mt}
                  </div>
                )}
                {landedMysteryCard.effects.dr && (
                  <div className="text-2xl font-black text-yellow-400">
                    Draw {landedMysteryCard.effects.dr} card
                    {landedMysteryCard.effects.dr > 1 ? "s" : ""}
                  </div>
                )}
                {landedMysteryCard.effects.sk && (
                  <div className="text-2xl font-black text-red-400">
                    Skip {landedMysteryCard.effects.sk} turn
                    {landedMysteryCard.effects.sk > 1 ? "s" : ""}
                  </div>
                )}
                {landedMysteryCard.effects.rt && (
                  <div className="text-2xl font-black text-green-400">
                    Repeat your turn
                  </div>
                )}
                {landedMysteryCard.effects.ce && (
                  <div
                    className={`text-2xl font-black ${
                      landedMysteryCard.effects.ce > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {landedMysteryCard.effects.ce > 0 ? "Collect" : "Pay"}{" "}
                    {Math.abs(landedMysteryCard.effects.ce)} from each player
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  log(
                    "🎯",
                    "Continue button clicked - proceeding with mystery card effect"
                  );
                  proceedWithMysteryCardEffect(landedMysteryCard);
                }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-8 rounded-lg shadow-xl transition-all hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="max-w-4xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-400 p-8">
            <div className="flex gap-6 items-center">
              {/* Video Side */}
              <div className="flex-shrink-0 w-80">
                <video
                  autoPlay
                  muted
                  className="w-full h-auto rounded-lg shadow-lg border-2 border-yellow-400"
                  onEnded={() => {
                    setShowVideoModal(false);
                    setLandedMysteryCard(null);
                  }}
                >
                  <source src={videoPath} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Text Side - COMPLETE EFFECTS DISPLAY */}
              <div className="flex-1 text-center">
                {/* Icon */}
                <div className="text-6xl mb-4">
                  {landedMysteryCard?.icon ||
                    (landedMysteryCard?.deck === "Joker"
                      ? "🃏"
                      : landedMysteryCard?.deck === "Bomb"
                        ? "💣"
                        : "⚡")}
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-4">
                  {landedMysteryCard?.name ||
                    landedMysteryCard?.title ||
                    "Unknown Card"}
                </h2>

                {/* Description */}
                <p className="text-white/90 text-lg mb-6">
                  {landedMysteryCard?.description ||
                    landedMysteryCard?.text ||
                    "No description available"}
                </p>

                {/* Effects Display */}
                <div className="bg-black border-2 border-yellow-400 rounded-xl p-4 mb-6 space-y-2">
                  {landedMysteryCard?.effects.cb && (
                    <div
                      className={`text-xl font-semibold ${
                        landedMysteryCard.effects.cb > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {landedMysteryCard.effects.cb > 0 ? "+" : ""}
                      {landedMysteryCard.effects.cb} Chips
                    </div>
                  )}
                  {landedMysteryCard?.effects.mb && (
                    <div className="text-xl font-semibold text-blue-400">
                      Move{" "}
                      {landedMysteryCard.effects.mb > 0 ? "forward" : "back"}{" "}
                      {Math.abs(landedMysteryCard.effects.mb)} spaces
                    </div>
                  )}
                  {landedMysteryCard?.effects.mt && (
                    <div className="text-xl font-semibold text-purple-400">
                      Move to {landedMysteryCard.effects.mt}
                    </div>
                  )}
                  {landedMysteryCard?.effects.dr && (
                    <div className="text-xl font-semibold text-yellow-400">
                      Draw {landedMysteryCard.effects.dr} card
                      {landedMysteryCard.effects.dr > 1 ? "s" : ""}
                    </div>
                  )}
                  {landedMysteryCard?.effects.sk && (
                    <div className="text-xl font-semibold text-red-400">
                      Skip {landedMysteryCard.effects.sk} turn
                      {landedMysteryCard.effects.sk > 1 ? "s" : ""}
                    </div>
                  )}
                  {landedMysteryCard?.effects.rt && (
                    <div className="text-xl font-semibold text-green-400">
                      🔄 Repeat your turn
                    </div>
                  )}
                  {landedMysteryCard?.effects.ce && (
                    <div
                      className={`text-xl font-semibold ${
                        landedMysteryCard.effects.ce > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {landedMysteryCard.effects.ce > 0 ? "Collect" : "Pay"}{" "}
                      {Math.abs(landedMysteryCard.effects.ce)} from each player
                    </div>
                  )}
                  {!landedMysteryCard?.effects.cb &&
                    !landedMysteryCard?.effects.mb &&
                    !landedMysteryCard?.effects.mt &&
                    !landedMysteryCard?.effects.dr &&
                    !landedMysteryCard?.effects.sk &&
                    !landedMysteryCard?.effects.rt &&
                    !landedMysteryCard?.effects.ce && (
                      <div className="text-gray-400">Special effect</div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PENALTY MODAL */}
      {penaltyInfo && (
        <PenaltyModal
          card={penaltyInfo.card}
          penalty={penaltyInfo.penalty}
          hand={penaltyInfo.hand}
          handCards={penaltyInfo.handCards}
          ownerName={players[penaltyInfo.ownerIndex]?.name || "Player"}
          onPayPenalty={handlePayPenalty}
          onSellCards={() => {
            setPenaltyInfo(null);
            setShowSellModal(true);
          }}
        />
      )}

      {/* AUCTION MODAL */}
      {auctionInfo && (
        <AuctionModal
          card={auctionInfo.card}
          players={players}
          myChips={
            players[roomPlayers.findIndex((p) => p.user_id === currentUserId)]
              ?.chips || 0
          }
          onPlaceBid={handlePlaceBid}
          onClose={() => {
            setAuctionInfo(null);
          }}
        />
      )}

      {/* SELL CARDS MODAL */}
      {showSellModal && (
        <SellCardsModal
          playerCards={
            players[getSafePlayerIndex(currentPlayerIndex, "sellModal")]
              ?.boughtCards || []
          }
          onSellCards={() => setShowSellModal(false)}
          onClose={() => setShowSellModal(false)}
        />
      )}

      {/* RULES PANEL */}
      {showRules && <RulesPanel onClose={() => setShowRules(false)} />}
    </div>
  );
}

export default App;
