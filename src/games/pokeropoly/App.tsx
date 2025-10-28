import { useState, useEffect, useCallback, useRef } from "react";
import { PlayerProfile } from "./components/PlayerProfile";
import { PlayerIcon } from "./components/PlayerIcon";
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
  isEliminated: boolean;
  wilds: number; // Number of active wilds
  wildCollectedAt: number[]; // Positions where wilds were collected
  lastBoardPosition: number; // Track for lap completion
  lapsCompleted: number; // Track full laps (0-based)
}

function App() {
  const navigate = useNavigate(); // ADD THIS LINE

  // 🔥 STATE
  const [gameMode, setGameMode] = useState<"select" | "waiting" | "playing">(
    "select"
  );
  const [showLocalGame, setShowLocalGame] = useState(false);

  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUsername, setCurrentUsername] = useState<string>("Player");
  const [isHost, setIsHost] = useState(false);

  // GAME STATE
  const [rotation, setRotation] = useState({ x: 45, y: 0, z: 0 });
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
  const [showMysteryCard, setShowMysteryCard] = useState<MysteryCard | null>(
    null
  );

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

  // 🔥 LOGGING WRAPPER
  const log = useCallback((emoji: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString().split("T")[1].substring(0, 12);
    console.log(`[${timestamp}] ${emoji} ${message}`, data || "");
  }, []);

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

  // 🏆 CHECK GAME OVER - LAST PLAYER STANDING WINS
  const checkGameOver = useCallback(() => {
    const activePlayers = playersRef.current.filter(
      (p) => !p.isEliminated && p.chips > 0
    );

    if (activePlayers.length === 1) {
      log("🏆", "WINNER FOUND", { winner: activePlayers[0].name });
      setWinner(activePlayers[0]);
      setGameOver(true);
      return true;
    }

    if (activePlayers.length === 0) {
      log("🏆", "ALL PLAYERS ELIMINATED");
      setGameOver(true);
      return true;
    }

    return false;
  }, [log]);

  const applyMysteryCardEffects = useCallback(
    (card: MysteryCard, playerIndex: number) => {
      const effects = card.effects;

      setPlayers((prev) => {
        const updated = [...prev];
        const player = updated[playerIndex];

        // Chip bonus/penalty
        if (effects.cb) {
          player.chips = Math.max(0, player.chips + effects.cb);
          // log("💰", `${player.name} chips \${effects.cb > 0 ? '+' : ''}\${effects.cb}`);

          // Check elimination
          if (player.chips <= 0) {
            player.isEliminated = true;
            // log("💀", `${player.name} ELIMINATED by mystery card\`);
          }
        }

        // Collect/pay each player
        if (effects.ce) {
          const amount = effects.ce;
          updated.forEach((p, idx) => {
            if (idx !== playerIndex && !p.isEliminated) {
              if (amount > 0) {
                // Collect from each player
                const collectAmount = Math.min(Math.abs(amount), p.chips);
                p.chips = Math.max(0, p.chips - collectAmount);
                player.chips += collectAmount;
              } else {
                // Pay each player
                const payAmount = Math.min(Math.abs(amount), player.chips);
                player.chips = Math.max(0, player.chips - payAmount);
                p.chips += payAmount;
              }
            }
          });
          // log("💸", `${player.name} \${amount > 0 ? 'collected' : 'paid'} \${Math.abs(amount)} per player\`);
        }

        playersRef.current = updated;
        return updated;
      });

      setTimeout(() => checkGameOver(), 1000);
    },
    [log, checkGameOver]
  );

  const checkWildExpiration = useCallback(
    (player: Player, newPosition: number) => {
      const oldPosition = player.lastBoardPosition;

      // Check if player crossed position 0 (completed a lap)
      if (oldPosition > 50 && newPosition < 14) {
        player.lapsCompleted += 1;
        // log("🔄", `${player.name} completed lap \${player.lapsCompleted}`);

        // Expire all wilds after completing 1 lap
        if (player.wilds > 0) {
          const expiredCount = player.wilds;
          player.wilds = 0;
          player.wildCollectedAt = [];
          // log("⏰", `${player.name} lost \${expiredCount} expired wild(s)\`);
        }
      }

      player.lastBoardPosition = newPosition;
      return player;
    },
    [log]
  );

  const handlePlayLocal = useCallback(() => {
    log("🎮", "SWITCHING TO LOCAL MODE");
    setShowLocalGame(true);
    setGameMode("playing"); // Or create a new 'local' mode
  }, [log]);
  // 🔥 INITIALIZE GAME

  const initializeMysteryCards = useCallback(() => {
    const mysteryMap: { [position: number]: MysteryCard } = {};
    const jokerCount = Math.floor(Math.random() * 3) + 1;
    const shuffledPositions = [...QUESTION_MARK_POSITIONS].sort(
      () => Math.random() - 0.5
    );
    shuffledPositions.forEach((pos, index) => {
      const card = index < jokerCount ? JOKER_CARD : getRandomMysteryCard();
      mysteryMap[pos] = card;
      log(
        "🃏",
        `initializeMysteryCards: Assigned to position ${pos}`,
        JSON.stringify(card, null, 2)
      );
    });
    setMysteryCardPositions(mysteryMap);
    return mysteryMap;
  }, [log]);

  const initializeFromGameState = useCallback(
    async (room: Room) => {
      log("🎲", "=== INITIALIZING GAME STATE ===");
      log("📊", `ROOM: ${room.id} STATUS: ${room.status}`);

      const freshPlayers = await RoomService.getRoomPlayers(room.id);
      log(
        "🔥",
        `LOADED ${freshPlayers.length} PLAYERS`,
        freshPlayers.map((p) => ({
          name: p.player_name,
          index: p.player_index,
        }))
      );

      if (freshPlayers.length === 0) {
        log("❌", "NO PLAYERS LOADED - ABORTING");
        return;
      }

      setDealtCards(room.game_state?.dealtCards || {});
      setJokerPositions(room.game_state?.jokerPositions || []);
      initializeMysteryCards();

      const gamePlayers: Player[] = freshPlayers.map((rp, idx) => {
        const player = {
          name: rp.player_name,
          chips: 15000,
          color:
            rp.player_color ||
            ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][idx],
          position: ["bottom", "left", "top", "right"][idx] as any,
          collectedCards: rp.collected_cards || [],
          boughtCards: rp.bought_cards || [],
          boardPosition: rp.board_position || [0, 16, 32, 48][idx],
          suit: rp.player_suit || ["♠", "♥", "♦", "♣"][idx],
          isEliminated: false,
          wilds: 0,
          wildCollectedAt: [],
          lastBoardPosition: rp.board_position || [0, 16, 32, 48][idx],
          lapsCompleted: 0,
        };
        log("👤", `PLAYER ${idx}: ${player.name} POS: ${player.boardPosition}`);
        return player;
      });

      playersRef.current = gamePlayers;
      currentIndexRef.current = 0;

      setPlayers(gamePlayers);
      setCurrentPlayerIndex(0);
      setPlayerPositions(gamePlayers.map((p) => p.boardPosition));
      setRoomPlayers(freshPlayers);
      setGameStarted(true);
      setCardOwners({});
      setHasRolledThisTurn(false);

      log("✅", `INITIALIZED - Current: 0, Players: ${gamePlayers.length}`);
      log("🎲", "=== INITIALIZATION COMPLETE ===");
    },
    [log]
  );

  // 💰 DEDUCT 15000 FROM PLAYER ACCOUNTS
  const deductChipsFromAccounts = async () => {
    if (!currentRoom?.id || !currentRoom.room_players) return;

    for (const rp of currentRoom.room_players) {
      try {
        // Skip if already deducted
        if (rp.chips_deducted) {
          log("⏭️", `Chips already deducted for ${rp.player_name}`);
          continue;
        }

        // Calculate new balance
        const newBalance = Math.max(0, (rp.chips || 0) - 15000);

        // Update database
        const { error } = await supabase
          .from("poker_opoly_players") // ✅ Your table name
          .update({
            chips: newBalance,
            chips_deducted: true,
          })
          .eq("room_id", currentRoom.id) // ✅ room_id matches your schema
          .eq("user_id", rp.user_id); // ✅ user_id matches your schema

        if (error) {
          console.error("Failed to deduct chips:", rp.player_name, error);
        } else {
          log(
            "💰",
            `Deducted 15000 from ${rp.player_name}. New balance: ${newBalance}`
          );
        }
      } catch (err) {
        console.error("Error deducting chips:", err);
      }
    }
  };

  // ✅ FIXED: Moved to useEffect to prevent infinite loop
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
  }, [gameMode, currentRoom?.id, deductChipsFromAccounts, log]);

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
        log("⚠️", "CARD ALREADY OWNED - ABORTING", {
          position,
          owner: currentOwner,
        });
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
        if (prev[position] !== undefined) {
          log("⚠️", "RACE CONDITION - CARD OWNED", { position });
          return prev;
        }
        return { ...prev, [position]: safeIndex };
      });

      setPlayers((prev) => {
        if (prev.length === 0 || !prev[safeIndex]) {
          log("❌", "PLAYER MISSING IN STATE UPDATE", { safeIndex });
          return prev;
        }

        const player = prev[safeIndex];

        const hasCard = player.boughtCards.some(
          (c) =>
            c.suit === card.suit &&
            c.value === card.value &&
            c.position === position
        );

        if (hasCard) {
          log("⚠️", "DUPLICATE BUY BLOCKED IN STATE UPDATE");
          return prev;
        }

        const updated = [...prev];
        const newChips = Math.max(0, player.chips - price);
        updated[safeIndex] = {
          ...player,
          collectedCards: [...player.collectedCards, card],
          boughtCards: [...player.boughtCards, { ...card, position }],
          chips: newChips,
          isEliminated: newChips <= 0,
        };

        if (newChips <= 0) {
          log("💀", `${player.name} ELIMINATED - OUT OF CHIPS`);
        }

        playersRef.current = updated;
        log("✅", `BUY APPLIED - chips: ${updated[safeIndex].chips}`);
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
        if (prev.length === 0 || !prev[safePayer] || !prev[safeReceiver]) {
          log("❌", "PENALTY PLAYERS NOT FOUND", {
            safePayer,
            safeReceiver,
            length: prev.length,
          });
          return prev;
        }
        const updated = [...prev];
        const newChips = Math.max(0, updated[safePayer].chips - amount);
        updated[safePayer].chips = newChips;
        updated[safePayer].isEliminated = newChips <= 0;
        updated[safeReceiver].chips += amount;

        if (newChips <= 0) {
          log("💀", `${updated[safePayer].name} ELIMINATED AFTER PENALTY`);
        }

        playersRef.current = updated;
        log("✅", "PENALTY APPLIED");

        setTimeout(() => checkGameOver(), 500);

        return updated;
      });
      setPenaltyInfo(null);
    },
    [getSafePlayerIndex, log]
  );

  const endTurn = useCallback(async () => {
    if (!currentRoom || playersRef.current.length === 0) {
      log("⏹️", "END TURN SKIPPED - NO ROOM/PLAYERS");
      return;
    }

    const safeCurrent = getSafePlayerIndex(currentIndexRef.current, "endTurn");
    const nextIndex = (safeCurrent + 1) % playersRef.current.length;
    log(
      "🔄",
      `ENDING TURN: ${safeCurrent} → ${nextIndex} TOTAL: ${playersRef.current.length}`
    );

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

  const handleMoveFromShoe = useCallback(
    async (total: number, isPair?: boolean) => {
      log("🚀", "=== MOVING START ===");
      log(
        "👥",
        `PLAYERS: ${playersRef.current.length} INDEX: ${currentIndexRef.current}`
      );

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
      log("📍", `START POSITION: ${currentPos}`);

      setIsMoving(true);
      let movesMade = 0;

      const moveInterval = setInterval(() => {
        log("🔄", `MOVE ${movesMade + 1}/${total}`);

        if (movesMade < total) {
          const newPos = (currentPos + movesMade + 1) % 64;
          log("📍", `MOVING TO: ${newPos}`);

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
            playersRef.current = updated;
            return updated;
          });

          movesMade++;
        } else {
          clearInterval(moveInterval);
          setIsMoving(false);
          const finalPosition = (currentPos + total) % 64;
          log("🎯", `FINAL POSITION: ${finalPosition}`);

          const card = dealtCards[finalPosition];
          const owner = cardOwners[finalPosition];
          log("🎯", "LANDED ON", { finalPosition, card, owner });

          // ✅ CHECK FOR MYSTERY CARD
          const mysteryCard = mysteryCardPositions[finalPosition];

          if (mysteryCard) {
            log("❓", "LANDED ON MYSTERY CARD", mysteryCard.title);
            setShowMysteryCard(mysteryCard);

            // Update player state for mystery card
            setPlayers((prev) => {
              const updated = [...prev];

              // Check for wild expiration
              updated[safeIndex] = checkWildExpiration(
                updated[safeIndex],
                finalPosition
              );

              // Handle Joker collection
              if (mysteryCard.deck === "Joker") {
                updated[safeIndex] = {
                  ...updated[safeIndex],
                  wilds: updated[safeIndex].wilds + 1,
                  wildCollectedAt: [
                    ...updated[safeIndex].wildCollectedAt,
                    finalPosition,
                  ],
                };
                log(
                  "🃏",
                  `${updated[safeIndex].name} collected a WILD! Total: ${updated[safeIndex].wilds}`
                );
              }

              playersRef.current = updated;
              return updated;
            });

            // Apply mystery card effects
            applyMysteryCardEffects(mysteryCard, safeIndex);

            // Auto-close and end turn after 3 seconds
            setTimeout(() => {
              setShowMysteryCard(null);
              setHasRolledThisTurn(false);

              const nextIndex = (safeIndex + 1) % playersRef.current.length;
              setCurrentPlayerIndex(nextIndex);
              currentIndexRef.current = nextIndex;
              log("➡️", `AUTO NEXT TURN: Player ${nextIndex}`);
            }, 3000);
          } else if (card && owner !== undefined && owner !== safeIndex) {
            log("⚠️", "PENALTY TRIGGERED");
            const ownerPlayer = playersRef.current[owner];

            // Get owner's bought cards (these form potential poker hands)
            const ownerBoughtCards = ownerPlayer.boughtCards.filter(
              (c): c is Card => c !== null
            );

            log("💸", "CALCULATING PENALTY");
            log("💸", "Landed card:", card);
            log("💸", "Owner cards:", ownerBoughtCards.length);

            // ✅ CORRECT - Pass the landed CARD and owner's cards
            const { penalty, hand } = calculatePenalty(card, ownerBoughtCards);

            log("💸", "Penalty calculated:", penalty);
            log("💸", "Hand detected:", hand || "None");

            // Get the hand cards for display if there's a poker hand
            let handCards: Card[] = [];
            if (hand && hand !== "High Card") {
              const handResult = detectPokerHand(ownerBoughtCards);
              if (handResult && handResult.cards) {
                handCards = handResult.cards;
              }
            }

            log("💸", "Hand cards for display:", handCards.length);

            setPenaltyInfo({
              card,
              penalty,
              hand,
              handCards,
              ownerIndex: owner,
            });
          } else if (card && owner === undefined) {
            log("💳", "SETTING LANDING CARD", card);
            setLandedCard(card);
          } else {
            log("🏁", "LANDED ON EMPTY SPACE - WAITING FOR MANUAL END TURN");
            setLandedCard(null);
            setPenaltyInfo(null);
          }
          log("🚀", "=== MOVING COMPLETE ===");
        }
      }, 300);
    },
    [
      dealtCards,
      cardOwners,
      endTurn,
      playerPositions,
      getSafePlayerIndex,
      log,
      mysteryCardPositions,
      checkWildExpiration,
      applyMysteryCardEffects,
    ]
  );

  const handleDrawFromShoe = useCallback(
    async (total: number, isPair: boolean) => {
      if (!currentRoom || isRolling || playersRef.current.length === 0) {
        log("⏹️", "ROLL SKIPPED", {
          room: !!currentRoom,
          rolling: isRolling,
          players: playersRef.current.length,
        });
        return;
      }

      const safeIndex = getSafePlayerIndex(currentIndexRef.current, "rollDice");

      const isMyTurn = roomPlayers[safeIndex]?.user_id === currentUserId;
      log("🎲", "ROLL CHECK", {
        safeIndex,
        isMyTurn,
        userId: currentUserId,
        playerUserId: roomPlayers[safeIndex]?.user_id,
      });

      if (!isMyTurn) {
        log("❌", "NOT YOUR TURN - ROLL BLOCKED");
        return;
      }

      currentIndexRef.current = safeIndex;
      setCurrentPlayerIndex(safeIndex);
      setIsRolling(true);
      setHasRolledThisTurn(true);

      log("🎲", `ROLL BY PLAYER ${safeIndex} Total: ${total} Pair: ${isPair}`);

      try {
        await RoomService.broadcastAction(
          currentRoom.id,
          currentUserId,
          safeIndex,
          "rollDice",
          { total, isPair }
        );
        log("✅", "ROLL BROADCASTED");

        log("🚀", "PROCESSING OWN MOVEMENT");
        await handleMoveFromShoe(total, isPair);
      } catch (error) {
        log("❌", "ROLL BROADCAST FAILED", error);
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
      log("⏸️", "PROCESSING BLOCKED", {
        isProcessing: isProcessingRef.current,
        queueLength: actionQueueRef.current.length,
        isMoving,
      });
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

      log("🎮", "=== PROCESSING ACTION ===");
      log(
        "📥",
        `TYPE: ${action.action_type} PLAYER: ${safeIndex}`,
        action.action_data
      );

      try {
        switch (action.action_type) {
          case "rollDice":
            log("🎲", "PROCESSING ROLL DICE", {
              total: action.action_data.total,
              isPair: action.action_data.isPair,
            });
            await handleMoveFromShoe(
              action.action_data.total,
              action.action_data.isPair
            );
            log("✅", "ROLL DICE COMPLETE");
            break;

          case "buyCard":
            log("💳", "PROCESSING BUY CARD");
            applyBuyCard(action.action_data);
            log("✅", "BUY CARD COMPLETE");
            break;

          case "endTurn":
            log("🔄", "PROCESSING END TURN");
            const nextIndex = action.action_data.next_player_index || 0;
            currentIndexRef.current = nextIndex;
            setCurrentPlayerIndex(nextIndex);
            setHasRolledThisTurn(false);
            setLandedCard(null);
            setPenaltyInfo(null);
            log("✅", `END TURN COMPLETE - NEW INDEX: ${nextIndex}`);
            break;

          case "payPenalty":
            log("💸", "PROCESSING PAY PENALTY");
            applyPayPenalty(action.action_data);
            log("✅", "PAY PENALTY COMPLETE");
            break;

          case "startAuction":
            log("🔨", "PROCESSING START AUCTION");
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
            log("✅", "AUCTION STARTED");
            break;

          case "placeBid":
            log("💰", "PROCESSING PLACE BID");
            setAuctionBids((prev) => ({
              ...prev,
              [action.player_index]: action.action_data.bidAmount,
            }));
            log("✅", `BID PLACED: ${action.action_data.bidAmount}`);
            break;

          case "endAuction":
            log("🏁", "PROCESSING END AUCTION");
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
            log("✅", `AUCTION ENDED - Winner: ${winnerIndex}`);
            break;

          default:
            log("⚠️", `UNKNOWN ACTION TYPE: ${action.action_type}`);
        }
      } catch (error) {
        log("❌", "ACTION PROCESSING ERROR", error);
      }

      log("🎮", "=== ACTION COMPLETE ===");
    }

    isProcessingRef.current = false;
    log("✅", "QUEUE PROCESSING COMPLETE");

    if (actionQueueRef.current.length > 0) {
      log("🔁", "QUEUE HAS MORE ITEMS - PROCESSING AGAIN");
      setTimeout(() => processActionQueue(), 100);
    }
  }, [
    handleMoveFromShoe,
    applyBuyCard,
    applyPayPenalty,
    getSafePlayerIndex,
    isMoving,
    log,
  ]);

  useEffect(() => {
    if (!isMoving && actionQueueRef.current.length > 0) {
      log("🔓", "MOVEMENT STOPPED - RESUMING QUEUE");
      processActionQueue();
    }
  }, [isMoving, processActionQueue, log]);

  const handleIncomingActionRef = useRef<(payload: any) => void>();

  handleIncomingActionRef.current = useCallback(
    async (payload: any) => {
      const action = payload.new || payload.payload;

      log("📨", "RAW ACTION RECEIVED", {
        type: action.action_type,
        player: action.player_index,
        sender: action.user_id,
        currentUser: currentUserId,
      });

      if (action.user_id === currentUserId) {
        log("⏭️", "SKIPPING OWN ACTION - SAME USER ID");
        return;
      }

      log("✅", "FOREIGN ACTION - WILL PROCESS");
      actionQueueRef.current.push(action);
      log("📦", `QUEUED - ${actionQueueRef.current.length} in queue`);

      if (!isMoving) {
        processActionQueue();
      } else {
        log("⏸️", "PLAYER MOVING - QUEUE WILL PROCESS AFTER MOVEMENT");
      }
    },
    [currentUserId, processActionQueue, isMoving, log]
  );

  useEffect(() => {
    if (gameMode !== "playing" || !currentRoom) return;

    log("🎮", "=== CREATING SUBSCRIPTION ===");

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      log("🧹", "OLD SUBSCRIPTION CLOSED");
    }

    const newChannel = RoomService.subscribeToActions(
      currentRoom.id,
      (payload) => handleIncomingActionRef.current?.(payload)
    );
    subscriptionRef.current = newChannel;

    newChannel.on("system", {}, (status: any) => {
      if (status.status === "CHANNEL_ERROR") {
        log("❌", "CHANNEL ERROR - RECONNECTING IN 2s");
        setTimeout(() => {
          if (gameMode === "playing" && currentRoom) {
            log("🔄", "RECONNECTING SUBSCRIPTION");
            const reconnectChannel = RoomService.subscribeToActions(
              currentRoom.id,
              (payload) => handleIncomingActionRef.current?.(payload)
            );
            subscriptionRef.current = reconnectChannel;
            log("✅", "RECONNECTED SUCCESSFULLY");
          }
        }, 2000);
      }
    });

    log("✅", "NEW SUBSCRIPTION CREATED");

    return () => {
      log("🧹", "SUBSCRIPTION CLEANUP");
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

    if (!player || player.chips < cardPrice) {
      log("❌", "CANNOT BUY - INSUFFICIENT CHIPS", {
        chips: player?.chips,
        price: cardPrice,
      });
      return;
    }

    log("💳", "BUY CARD INITIATED", {
      position: finalPosition,
      card: landedCard,
      price: cardPrice,
    });

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

    setTimeout(() => endTurn(), 500);
  }, [
    landedCard,
    currentRoom,
    currentUserId,
    playerPositions,
    getSafePlayerIndex,
    applyBuyCard,
    endTurn,
    log,
  ]);

  const handlePayPenalty = useCallback(async () => {
    if (!penaltyInfo || !currentRoom || playersRef.current.length === 0) return;
    const safeIndex = getSafePlayerIndex(currentIndexRef.current, "payPenalty");

    log("💸", "PAY PENALTY INITIATED", {
      payer: safeIndex,
      receiver: penaltyInfo.ownerIndex,
      amount: penaltyInfo.penalty,
    });

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
    setTimeout(() => endTurn(), 500);
  }, [
    penaltyInfo,
    currentRoom,
    currentUserId,
    getSafePlayerIndex,
    applyPayPenalty,
    endTurn,
    log,
  ]);

  const handleStartAuction = useCallback(async () => {
    if (!landedCard || !currentRoom) return;
    const safeIndex = getSafePlayerIndex(currentIndexRef.current, "auction");
    const position = playerPositions[safeIndex];

    log("🔨", "STARTING AUCTION", { card: landedCard, position });

    await RoomService.broadcastAction(
      currentRoom.id,
      currentUserId,
      safeIndex,
      "startAuction",
      {
        card: landedCard,
        position,
      }
    );

    setAuctionInitiatorIndex(safeIndex);
    setAuctionBids({});
    setLandedCard(null);

    log("✅", "AUCTION BROADCAST - WAITING FOR BIDS");
  }, [
    landedCard,
    currentRoom,
    currentUserId,
    playerPositions,
    getSafePlayerIndex,
    log,
  ]);

  const handlePlaceBid = useCallback(
    async (bidAmount: number) => {
      if (!auctionInfo || !currentRoom) return;
      const myPlayerIndex = roomPlayers.findIndex(
        (p) => p.user_id === currentUserId
      );

      log("💰", "PLACING BID", { amount: bidAmount, player: myPlayerIndex });

      setAuctionBids((prev) => ({ ...prev, [myPlayerIndex]: bidAmount }));

      await RoomService.broadcastAction(
        currentRoom.id,
        currentUserId,
        myPlayerIndex,
        "placeBid",
        { bidAmount }
      );
    },
    [auctionInfo, currentRoom, currentUserId, roomPlayers, log]
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

    log("🏁", "CLOSING AUCTION", { winner: winnerIndex, winningBid });

    const position = playerPositions[currentIndexRef.current];
    const card = dealtCards[position];

    await RoomService.broadcastAction(
      currentRoom.id,
      currentUserId,
      currentIndexRef.current,
      "endAuction",
      {
        winnerIndex,
        winningBid,
        card,
        position,
      }
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
    setTimeout(() => endTurn(), 500);
  }, [
    auctionBids,
    currentRoom,
    currentUserId,
    playerPositions,
    dealtCards,
    applyBuyCard,
    endTurn,
    log,
  ]);

  useEffect(() => {
    log("🔄", `PLAYERS STATE CHANGED: ${players.length}`);
    playersRef.current = players;
  }, [players, log]);

  useEffect(() => {
    log("🔢", `CURRENT INDEX CHANGED: ${currentPlayerIndex}`);
    currentIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex, log]);

  useEffect(() => {
    const currentPlayer = playersRef.current[currentIndexRef.current];
    const currentRoomPlayer = roomPlayers[currentIndexRef.current];
    const isMyTurn = currentRoomPlayer?.user_id === currentUserId;

    log("🎯", "TURN STATE", {
      currentIndex: currentIndexRef.current,
      playerName: currentPlayer?.name,
      isMyTurn,
      myUserId: currentUserId,
      turnUserId: currentRoomPlayer?.user_id,
    });
  }, [currentPlayerIndex, roomPlayers, currentUserId, log]);

  useEffect(() => {
    setHasRolledThisTurn(false);
    log("🔄", "NEW TURN - RESET ROLLED FLAG");
  }, [currentPlayerIndex, log]);

  useEffect(() => {
    if (gameMode === "playing" && roomPlayers.length > 0 && currentUserId) {
      const myPlayerIndex = roomPlayers.findIndex(
        (p) => p.user_id === currentUserId
      );
      if (myPlayerIndex !== -1) {
        const rotationOffsets = [0, 90, 180, 270];
        setBaseRotation(rotationOffsets[myPlayerIndex]);
        log(
          "🔄",
          `BASE ROTATION SET: ${rotationOffsets[myPlayerIndex]}° for player ${myPlayerIndex}`
        );
      }
    }
  }, [gameMode, roomPlayers, currentUserId, log]);

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

  const handleStartGame = useCallback(async () => {
    if (!currentRoom || !isHost) return;
    log("🎮", "HOST STARTING GAME...");
    const success = await RoomService.startGame(currentRoom.id, currentUserId);
    if (success) {
      log("✅", "HOST: GAME STARTED");
      const freshRoom = await RoomService.getRoom(currentRoom.id);
      setGameMode("playing");
      await initializeFromGameState(freshRoom!);
    }
  }, [currentRoom, currentUserId, isHost, initializeFromGameState, log]);

  const handleLeaveRoom = useCallback(async () => {
    if (!currentRoom || !currentUserId) return;

    try {
      log("👋 Leaving room:", currentRoom.room_code);

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

      // Reset all game state
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

      log("✅ Successfully reset to lobby");
    } catch (error) {
      console.error("Error in handleLeaveRoom:", error);
      setCurrentRoom(null);
      setRoomPlayers([]);
      setIsHost(false);
      setGameMode("select");
    }
  }, [currentRoom, currentUserId, log]);

  const onRollComplete = useCallback(
    (dice1: number, dice2: number) => {
      const total = dice1 + dice2;
      const hasPair = dice1 === dice2;
      log("🎰", `DICE ROLL: ${dice1} + ${dice2} = ${total} PAIR: ${hasPair}`);
      handleDrawFromShoe(total, hasPair);
    },
    [handleDrawFromShoe, log]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const direction = invertScroll ? -1 : 1;
    setRotation({
      ...rotation,
      z: rotation.z + (e.deltaY > 0 ? 10 * direction : -10 * direction),
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - touchStart;
    const direction = invertScroll ? -1 : 1;
    setRotation({
      ...rotation,
      z: rotation.z + diff * 0.5 * direction,
    });
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
          boardSize / 2 - 1 * (cardWidth + gap) - 70 - (cardWidth + gap) + 190;
        y = boardSize / 2 + 10 + 10;
        isCorner = true;
      } else {
        x = boardSize / 2 - i * (cardWidth + gap) - 75 + 70;
        y = boardSize / 2 + 10 + 10;
      }
      rotateZ = 0;
    } else if (index < spacesPerSide * 2) {
      const i = index - spacesPerSide;
      if (i === 0) {
        x = -boardSize / 2 - 10 - 10;
        y =
          boardSize / 2 - 1 * (cardWidth + gap) - 75 - (cardWidth + gap) + 195;
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
          -boardSize / 2 + 1 * (cardWidth + gap) + 75 + (cardWidth + gap) - 195;
        y = -boardSize / 2 - 10 - 10;
        isCorner = true;
      } else {
        x = -boardSize / 2 + i * (cardWidth + gap) + 75 - 70;
        y = -boardSize / 2 - 10 - 10;
      }
      rotateZ = 180;
    } else {
      const i = index - spacesPerSide * 3;
      if (i === 0) {
        x = boardSize / 2 + 10 + 10;
        y =
          -boardSize / 2 + 1 * (cardWidth + gap) + 75 + (cardWidth + gap) - 195;
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
    console.log("handleDeal: Starting card deal");
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

    console.log("handleDeal: Created full deck", { deckSize: fullDeck.length });

    for (let i = fullDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
    }
    console.log("handleDeal: Shuffled deck");

    const newDealtCards: { [key: number]: { suit: string; value: string } } =
      {};
    let deckIndex = 0;

    for (let i = 0; i < totalSpaces; i++) {
      if (i === 0 || i === 16 || i === 32 || i === 48) {
        console.log("handleDeal: Skipping corner position", { position: i });
        continue;
      }

      if (QUESTION_MARK_POSITIONS.includes(i)) {
        console.log("handleDeal: Skipping mystery card position", {
          position: i,
        });
        continue;
      }

      newDealtCards[i] = fullDeck[deckIndex];
      console.log("handleDeal: Assigned card to position", {
        position: i,
        card: newDealtCards[i],
      });
      deckIndex++;
    }

    setDealtCards(newDealtCards);
    console.log("handleDeal: Set dealtCards", { dealtCards: newDealtCards });

    // Assign random mystery cards to question mark positions
    const newMysteryCards: { [key: number]: MysteryCard } = {};
    QUESTION_MARK_POSITIONS.forEach((pos) => {
      newMysteryCards[pos] = getRandomMysteryCard();
      console.log("handleDeal: Assigned mystery card to position", {
        position: pos,
        mysteryCard: newMysteryCards[pos],
      });
    });
    setMysteryCardPositions(newMysteryCards);
    console.log("handleDeal: Set mysteryCardPositions", { newMysteryCards });

    // Select 2 random ? positions for joker hats (visual indicator)
    const jokerPositionsInMystery = QUESTION_MARK_POSITIONS.filter(
      (pos) => newMysteryCards[pos].type === "joker"
    );
    setJokerPositions(jokerPositionsInMystery);
    console.log("handleDeal: Set jokerPositions", {
      jokerPositions: jokerPositionsInMystery,
    });

    // Trigger card falling animations
    const allCardIndices = Object.keys(newDealtCards).map(Number);
    setCardsAnimating(new Set(allCardIndices));
    setAnimationTrigger((prev) => prev + 1);
    console.log("handleDeal: Triggered card animations", { allCardIndices });

    // Clear animation state after all cards have fallen
    setTimeout(() => {
      setCardsAnimating(new Set());
      console.log("handleDeal: Cleared card animations");
    }, 2500);

    if (!gameStarted) {
      const randomPlayer = Math.floor(Math.random() * 4);
      setCurrentPlayerIndex(randomPlayer);
      setGameStarted(true);
      console.log("handleDeal: Started game, set first player", {
        randomPlayer,
        gameStarted: true,
      });
    }
  };

  const getCard = (index: number) => {
    if (index === 0 || index === 16 || index === 32 || index === 48) {
      const cornerSuits = ["♠", "♥", "♦", "♣"];
      const suitIndex =
        index === 0 ? 0 : index === 16 ? 1 : index === 32 ? 2 : 3;
      return { isCorner: true, value: "", suit: cornerSuits[suitIndex] };
    }
    const questionMarkPositions = [5, 11, 21, 27, 37, 43, 53, 59];
    if (questionMarkPositions.includes(index)) {
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
        log("🔄 ROOM UPDATE:", updatedRoom.status);
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
        log("🔄 PLAYERS UPDATED:", updatedPlayers.length);

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
    log,
  ]);

  useEffect(() => {
    if (isAutoPlaying && landedCard && players.length > 0) {
      const timer = setTimeout(() => {
        const safeIndex = getSafePlayerIndex(currentPlayerIndex, "autoplay");
        const player = playersRef.current[safeIndex];
        const cardPrice = getCardPrice(landedCard.value);
        if (player && player.chips >= cardPrice) {
          handleBuyCard();
        } else {
          setLandedCard(null);
          endTurn();
        }
      }, autoPlaySpeed);
      return () => clearTimeout(timer);
    }
  }, [
    isAutoPlaying,
    landedCard,
    currentPlayerIndex,
    autoPlaySpeed,
    handleBuyCard,
    endTurn,
    getSafePlayerIndex,
    players.length,
  ]);

  useEffect(() => {
    if (isAutoPlaying && penaltyInfo) {
      const timer = setTimeout(() => handlePayPenalty(), autoPlaySpeed + 500);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying, penaltyInfo, autoPlaySpeed, handlePayPenalty]);

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
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-12 border-4 border-yellow-400 shadow-2xl max-w-2xl w-full mx-4">
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4 animate-bounce">🏆</div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 mb-4">
              WINNER!
            </h1>
            <div className="text-4xl font-bold text-white mb-8">
              {winner.name} {winner.suit}
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border-2 border-green-400/50">
              <div className="text-yellow-400 text-5xl font-black mb-2">
                ${winner.chips.toLocaleString()}
              </div>
              <div className="text-white/80 text-lg font-semibold">
                Final Chips
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <h3 className="text-2xl font-bold text-white/90 mb-4">
                Final Standings
              </h3>
              {players
                .sort((a, b) => b.chips - a.chips)
                .map((player, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 $${
                      player.isEliminated
                        ? "bg-red-900/20 border-red-500/30"
                        : "bg-white/10 border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-white/60">
                        #{idx + 1}
                      </div>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border-2"
                        style={{
                          backgroundColor: player.color + "40",
                          borderColor: player.color,
                          color: player.color,
                        }}
                      >
                        {player.suit}
                      </div>
                      <div className="text-white font-bold text-lg">
                        {player.name}
                      </div>
                      {player.isEliminated && (
                        <span className="text-red-400 text-sm font-semibold">
                          💀 ELIMINATED
                        </span>
                      )}
                    </div>
                    <div className="text-yellow-400 font-bold text-xl">
                      ${player.chips.toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
            <button
              onClick={handleLeaveRoom}
              className="mt-8 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-black py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 active:scale-95 transition-all text-lg border-2 border-blue-400/50"
            >
              🏠 Back to Lobby
            </button>
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
      {/* 🎨 ENHANCED DEBUG OVERLAY
      <div className="fixed top-4 left-4 z-[9999] bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl text-white p-5 rounded-2xl border border-white/10 shadow-2xl font-mono text-xs space-y-2 min-w-[280px]">
        <div className="text-yellow-400 font-bold text-sm mb-3 border-b border-white/10 pb-2">
          🎮 Game Debug
        </div>

        <div className="flex justify-between">
          <span className="text-white/60">Current Turn:</span>
          <span className="font-bold text-cyan-400">{currentPlayerIndex}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/60">Player Name:</span>
          <span className="font-bold text-green-400 truncate max-w-[120px]">
            {players[currentPlayerIndex]?.name}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/60">My User ID:</span>
          <span className="font-bold text-purple-400">
            {currentUserId.substring(0, 8)}...
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/60">Turn User ID:</span>
          <span className="font-bold text-purple-400">
            {roomPlayers[currentPlayerIndex]?.user_id.substring(0, 8)}...
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Is My Turn:</span>
          <span
            className={`font-bold px-2 py-1 rounded text-[10px] ${
              roomPlayers[currentPlayerIndex]?.user_id === currentUserId
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {roomPlayers[currentPlayerIndex]?.user_id === currentUserId
              ? "✅ YES"
              : "❌ NO"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Is Moving:</span>
          <span
            className={`font-bold px-2 py-1 rounded text-[10px] ${
              isMoving
                ? "bg-blue-500/20 text-blue-400"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {isMoving ? "🏃 MOVING" : "⏸️ STOPPED"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Is Rolling:</span>
          <span
            className={`font-bold px-2 py-1 rounded text-[10px] ${
              isRolling
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {isRolling ? "🎲 ROLLING" : "⏹️ IDLE"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Rolled This Turn:</span>
          <span
            className={`font-bold px-2 py-1 rounded text-[10px] ${
              hasRolledThisTurn
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {hasRolledThisTurn ? "✅ YES" : "❌ NO"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Connection:</span>
          <span
            className={`font-bold px-2 py-1 rounded text-[10px] ${
              subscriptionRef.current
                ? "bg-green-500/20 text-green-400 animate-pulse"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {subscriptionRef.current ? "🟢 CONNECTED" : "🔴 DISCONNECTED"}
          </span>
        </div>
      </div> */}

      {!gameStarted && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={() => {
              console.log("Button: Dealing cards");
              handleDeal();
            }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-lg shadow-2xl transition-all hover:scale-105 text-lg border-2 border-emerald-400"
          >
            Deal Cards
          </button>
        </div>
      )}

      {/* 🎨 ENHANCED AUCTION BIDS PANEL */}
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

      {/* 🎨 ENHANCED END TURN BUTTON */}
      {!landedCard &&
        !penaltyInfo &&
        !isMoving &&
        !isRolling &&
        hasRolledThisTurn &&
        roomPlayers[currentPlayerIndex]?.user_id === currentUserId && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={endTurn}
              className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-black py-4 px-10 rounded-full shadow-2xl transform hover:scale-110 active:scale-95 transition-all text-xl border-4 border-white/30 backdrop-blur-sm animate-pulse"
            >
              <span className="drop-shadow-lg">✅ End Turn</span>
            </button>
          </div>
        )}

      {/* 🎨 ENHANCED CONTROLS */}
      <div className="fixed top-4 right-4 z-10 flex flex-col gap-3">
        <button
          onClick={() => setInvertScroll(!invertScroll)}
          className="bg-gradient-to-r from-slate-700 via-slate-800 to-gray-900 hover:from-slate-600 hover:via-slate-700 hover:to-gray-800 text-white font-bold py-3 px-5 rounded-xl shadow-xl transition-all hover:scale-105 text-sm border-2 border-slate-500/50 backdrop-blur-sm"
        >
          {invertScroll ? "🔄 Scroll: Inverted" : "🔄 Scroll: Normal"}
        </button>

        {/* {gameStarted && (
          <div className="bg-gradient-to-br from-black/80 via-gray-900/80 to-black/80 backdrop-blur-xl rounded-xl p-4 border-2 border-slate-500/50 shadow-2xl">
            <div className="text-white text-sm font-bold mb-3 text-center">
              ⚡ Auto Play
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`${
                  isAutoPlaying
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-red-400/50"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-green-400/50"
                } text-white font-bold py-3 px-5 rounded-xl shadow-xl transition-all hover:scale-105 text-sm border-2`}
              >
                {isAutoPlaying ? "⏹️ Stop" : "▶️ Start"}
              </button>
              <div className="text-white text-xs mb-1 text-center font-semibold">
                Speed
              </div>
              <div className="flex gap-2">
                {[
                  { speed: 2000, label: "0.5x" },
                  { speed: 1000, label: "1x" },
                  { speed: 500, label: "2x" },
                ].map(({ speed, label }) => (
                  <button
                    key={speed}
                    onClick={() => setAutoPlaySpeed(speed)}
                    className={`${
                      autoPlaySpeed === speed
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400"
                        : "bg-gradient-to-r from-slate-600 to-slate-700 border-slate-500"
                    } hover:scale-110 text-white font-bold py-2 px-3 rounded-lg text-xs transition-all border-2 flex-1`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* BOARD */}
      <div className="perspective-1000 w-full h-full flex items-center justify-center">
        <div
          className="preserve-3d relative transition-transform duration-700 ease-out"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
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
                background: `
                  radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)
                `,
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
              className="absolute inset-20 rounded-lg backdrop-blur-sm border-2 pointer-events-none"
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
                <div
                  className="text-center"
                  style={{
                    textShadow: `
                      0 0 20px rgba(99, 102, 241, 0.5),
                      0 0 40px rgba(168, 85, 247, 0.3),
                      0 4px 8px rgba(0, 0, 0, 0.8)
                    `,
                  }}
                >
                  <h1 className="text-8xl font-bold text-white mb-2 tracking-wider">
                    POKER
                  </h1>
                  <h2 className="text-6xl font-bold text-yellow-400 tracking-wide">
                    OPOLY
                  </h2>
                  <div className="mt-6 text-2xl text-white/80">♠ ♥ ♦ ♣</div>
                </div>
              </div>
            </div>
          </div>
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
                className="absolute rounded-lg transition-all hover:scale-110 cursor-pointer group"
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
                    className="w-full h-full flex items-center justify-center font-bold rounded-lg relative overflow-hidden border-4 shadow-2xl"
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
                      <div className="text-6xl text-white drop-shadow-2xl">
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
                  <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-white to-gray-100 border-4 border-purple-500 overflow-visible shadow-xl rounded-lg">
                    {jokerPositions.includes(index) ? (
                      <img
                        src="/games/pokeropoly/images/joker hat.png"
                        alt="Joker"
                        className="absolute object-contain"
                        style={{
                          width: "150%",
                          height: "150%",
                          top: "-30%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 100,
                        }}
                      />
                    ) : (
                      <div className="text-5xl font-black text-purple-600 drop-shadow-lg">
                        ?
                      </div>
                    )}
                    {playersOnThisSpace.length > 0 && (
                      <div
                        className="absolute flex gap-0.5"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
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
                    className="w-full h-full flex flex-col items-center justify-center relative border-2 shadow-xl rounded-lg"
                    style={{
                      backgroundColor: isOwned ? ownerColor : "white",
                      borderColor: isOwned ? ownerColor : suitColor,
                    }}
                  >
                    <div
                      className="text-sm font-bold leading-none"
                      style={{ color: isOwned ? "white" : suitColor }}
                    >
                      {card.value}
                    </div>
                    <div
                      className="text-xl leading-none mt-0.5"
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

      {/* 🎨 ENHANCED PLAYER PROFILES */}
      <div className="perspective-1000 w-full h-full flex items-center justify-center absolute inset-0 pointer-events-none">
        <div
          className="preserve-3d relative transition-transform duration-700 ease-out"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
            width: "850px",
            height: "850px",
          }}
        >
          {players.map((player, index) => {
            if (!player || !player.color) return null;
            const numPlayers = players.length;
            const angleStep = 360 / numPlayers;
            const angle =
              (index * angleStep - 90 + baseRotation) * (Math.PI / 180); // -90 to start from bottom
            const radius = 250; // Distance from center (adjust as needed)
            const depthOffset = index * 10; // Increase depth for each player to prevent overlap

            // Calculate x, y positions in a circular layout
            const posX = radius * Math.cos(angle);
            const posY = radius * Math.sin(angle);
            const profilePositions = {
              bottom: { x: 0, y: 230, rotateZ: 0 },
              left: { x: -320, y: 0, rotateZ: 90 },
              top: { x: 0, y: -320, rotateZ: 180 },
              right: { x: 320, y: 0, rotateZ: 270 },
            };
            const pos = profilePositions[player.position];
            const playerRotationX =
              index === 0 ? 0 : index === 1 ? 60 : index === 2 ? 0 : 60;

            return (
              <div
                key={index}
                className="absolute pointer-events-auto"
                style={{
                  left: "50%",
                  top: "50%",
                  scale: "0.8",
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotateZ(${pos.rotateZ}deg) rotateX(-30deg) translateZ(53px`, // Dynamic depth offset
                }}
              >
                <div
                  className="rounded-xl border-2 shadow-2xl pt-6 p-4 w-240px relative"
                  style={{
                    backgroundColor: player.color,
                    borderColor: `${player.color}`,
                    boxShadow:
                      currentPlayerIndex === index
                        ? "0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)"
                        : undefined,
                  }}
                >
                  {index === currentPlayerIndex && (
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
                            color: player.suit
                              ? "white"
                              : getSuitColor(player.suit),
                          }}
                        >
                          {player.suit}
                        </span>
                      </div>
                      <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg">
                        <span className="text-yellow-400 font-bold text-sm">
                          ${player.chips.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {player.wilds > 0 && (
                      <div className="mt-1 bg-yellow-400/20 rounded-md px-2 py-1 border border-yellow-300/30">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-lg">🃏</span>
                          <span className="text-yellow-300 font-semibold text-xs">
                            {player.wilds} WILD{player.wilds > 1 ? "S" : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2"></div>

                    {index === currentPlayerIndex &&
                      !landedCard &&
                      !isMoving &&
                      !isRolling && (
                        <div className="h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-black/10 to-black/5 rounded-md border border-white/10 p-3 m-1">
                          {roomPlayers[currentPlayerIndex]?.user_id ===
                          currentUserId ? (
                            <>
                              <div className="mb-3">
                                <MiniSlotMachine
                                  onRollComplete={onRollComplete}
                                  isVisible={true}
                                  disabled={isRolling}
                                />
                              </div>
                              <div className="text-center flex-1 flex flex-col items-center justify-center">
                                <div className="text-yellow-300 font-semibold text-base mb-1 drop-shadow">
                                  🎲 ROLL TO MOVE
                                </div>
                                <div className="text-white/70 text-xs font-medium">
                                  Click the slot machine!
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mb-3 flex-shrink-0 shadow-md border border-gray-500">
                                <span className="text-2xl">⏳</span>
                              </div>
                              <div className="text-center">
                                <div className="text-yellow-300 font-semibold text-base mb-1 drop-shadow">
                                  {players[currentPlayerIndex]?.name}'s Turn
                                </div>
                                <div className="text-white/70 text-xs font-medium">
                                  Waiting for roll...
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {index === currentPlayerIndex && landedCard && (
                      <div className="h-[300px] bg-gray-900/40 backdrop-blur-sm rounded-md border border-white/10 p-3 flex flex-col m-1 shadow-sm">
                        {" "}
                        <div className="text-white/80 text-xs font-semibold mb-2 uppercase tracking-wider flex-shrink-0 drop-shadow"></div>
                        <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                          <div className="bg-white rounded-md shadow-md p-2 w-16 h-20 flex flex-col items-center justify-center gap-1 flex-shrink-0 border border-gray-200">
                            <div
                              className="text-base font-semibold leading-none"
                              style={{ color: getSuitColor(landedCard.suit) }}
                            >
                              {landedCard.value}
                            </div>
                            <div
                              className="text-lg leading-none"
                              style={{ color: getSuitColor(landedCard.suit) }}
                            >
                              {landedCard.suit}
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="bg-yellow-400/20 p-2 rounded-md text-center border border-yellow-300/30 shadow-sm">
                              <div className="text-yellow-300 font-semibold text-base drop-shadow">
                                ${getCardPrice(landedCard.value)}
                              </div>
                              <div className="text-white/60 text-[9px] font-medium">
                                Buy
                              </div>
                            </div>
                            <div className="bg-green-400/20 p-2 rounded-md text-center border border-green-300/30 shadow-sm">
                              <div className="text-green-300 font-semibold text-base drop-shadow">
                                $
                                {Math.floor(getCardPrice(landedCard.value) / 2)}
                              </div>
                              <div className="text-white/60 text-[9px] font-medium">
                                Sell
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-auto pt-2 border-t border-white/10 flex-shrink-0">
                          <button
                            onClick={handleBuyCard}
                            disabled={
                              player.chips < getCardPrice(landedCard.value)
                            }
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-2 px-3 rounded-md shadow-md transition-all hover:scale-105 active:scale-95 text-xs disabled:opacity-30 disabled:cursor-not-allowed border border-green-300/50"
                          >
                            💰 Buy
                          </button>
                          <button
                            onClick={handleStartAuction}
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all hover:scale-105 active:scale-95 text-xs border border-yellow-300/50"
                          >
                            🔨
                          </button>
                        </div>
                      </div>
                    )}

                    {!landedCard && (
                      <div className="h-[100px] bg-gradient-to-br from-black/10 to-black/5 rounded-md border border-white/10 p-2 flex flex-col m-1 shadow-sm">
                        <div className="text-white/80 text-xs font-semibold mb-2 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 drop-shadow">
                          <span>🃏</span>
                          <span>{player.boughtCards.length} Cards</span>
                        </div>
                        <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
                          {roomPlayers[index]?.user_id === currentUserId ? (
                            player.boughtCards.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                {player.boughtCards.map((card, cardIdx) => (
                                  <div
                                    key={cardIdx}
                                    className="rounded border-2 shadow-sm w-7 h-10 flex flex-col items-center justify-center bg-white"
                                    style={{
                                      borderColor: getSuitColor(card.suit),
                                    }}
                                  >
                                    <div
                                      className="text-[9px] font-semibold leading-none"
                                      style={{ color: getSuitColor(card.suit) }}
                                    >
                                      {card.value}
                                    </div>
                                    <div
                                      className="text-xs leading-none mt-0.5"
                                      style={{ color: getSuitColor(card.suit) }}
                                    >
                                      {card.suit}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-white/40 text-xs font-medium">
                                <span>📭 No cards yet</span>
                              </div>
                            )
                          ) : player.boughtCards.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {player.boughtCards.map((card, cardIdx) => (
                                <div
                                  key={cardIdx}
                                  className="rounded border shadow-sm w-9 h-12 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600"
                                  style={{
                                    borderColor: player.color,
                                  }}
                                >
                                  <div className="text-white text-xs">🂠</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-white/40 text-xs font-medium">
                              <span>📭 No cards yet</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showMysteryCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 border-4 border-yellow-400 shadow-2xl max-w-md w-full mx-4 transform animate-bounce">
            <div className="text-center space-y-6">
              <div className="text-7xl mb-4">
                {showMysteryCard.icon ||
                  (showMysteryCard.deck === "Joker"
                    ? "🃏"
                    : showMysteryCard.deck === "Bomb"
                      ? "💣"
                      : "❓")}
              </div>
              <h2 className="text-4xl font-black text-yellow-400 mb-2">
                {showMysteryCard.name ||
                  showMysteryCard.title ||
                  "Unknown Card"}
              </h2>
              <p className="text-white text-lg font-semibold">
                {showMysteryCard.description ||
                  showMysteryCard.text ||
                  "No description available"}
              </p>
              <div className="bg-white/10 rounded-xl p-4 border-2 border-white/20">
                {showMysteryCard.effects.cb && (
                  <div
                    className={`text-2xl font-black ${
                      showMysteryCard.effects.cb > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {showMysteryCard.effects.cb > 0 ? "+" : ""}
                    {showMysteryCard.effects.cb} Chips
                  </div>
                )}
                {showMysteryCard.effects.mb && (
                  <div className="text-2xl font-black text-blue-400">
                    Move {showMysteryCard.effects.mb > 0 ? "forward" : "back"}{" "}
                    {Math.abs(showMysteryCard.effects.mb)} spaces
                  </div>
                )}
                {showMysteryCard.effects.mt && (
                  <div className="text-2xl font-black text-blue-400">
                    Move to {showMysteryCard.effects.mt}
                  </div>
                )}
                {showMysteryCard.effects.dr && (
                  <div className="text-2xl font-black text-yellow-400">
                    Draw {showMysteryCard.effects.dr} card
                    {showMysteryCard.effects.dr > 1 ? "s" : ""}
                  </div>
                )}
                {showMysteryCard.effects.sk && (
                  <div className="text-2xl font-black text-red-400">
                    Skip {showMysteryCard.effects.sk} turn
                    {showMysteryCard.effects.sk > 1 ? "s" : ""}
                  </div>
                )}
                {showMysteryCard.effects.rt && (
                  <div className="text-2xl font-black text-green-400">
                    Repeat your turn
                  </div>
                )}
                {showMysteryCard.effects.ce && (
                  <div
                    className={`text-2xl font-black ${
                      showMysteryCard.effects.ce > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {showMysteryCard.effects.ce > 0 ? "Collect" : "Pay"}{" "}
                    {Math.abs(showMysteryCard.effects.ce)} from each player
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  log(
                    "✅",
                    "Mystery card modal closed manually",
                    JSON.stringify(showMysteryCard, null, 2)
                  );
                  setShowMysteryCard(null);
                  setHasRolledThisTurn(false);
                  const nextIndex =
                    (currentPlayerIndex + 1) % playersRef.current.length;
                  setCurrentPlayerIndex(nextIndex);
                  currentIndexRef.current = nextIndex;
                  log("➡️", `AUTO NEXT TURN: Player ${nextIndex}`);
                }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-8 rounded-lg shadow-xl transition-all hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
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
            log("❌", "AUCTION DECLINED");
          }}
        />
      )}

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
      {showRules && <RulesPanel onClose={() => setShowRules(false)} />}
    </div>
  );
}

export default App;
