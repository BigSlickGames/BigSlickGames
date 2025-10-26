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
}

function App() {
  const navigate = useNavigate(); // ADD THIS LINE

  // 🔥 STATE
  const [gameMode, setGameMode] = useState<"select" | "waiting" | "playing">(
    "select"
  );
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

  // 🔥 INITIALIZE GAME
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

      const gamePlayers: Player[] = freshPlayers.map((rp, idx) => {
        const player = {
          name: rp.player_name,
          chips: rp.chips || 1500,
          color:
            rp.player_color ||
            ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][idx],
          position: ["bottom", "left", "top", "right"][idx] as any,
          collectedCards: rp.collected_cards || [],
          boughtCards: rp.bought_cards || [],
          boardPosition: rp.board_position || [0, 16, 32, 48][idx],
          suit: rp.player_suit || ["♠", "♥", "♦", "♣"][idx],
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
        updated[safeIndex] = {
          ...player,
          collectedCards: [...player.collectedCards, card],
          boughtCards: [...player.boughtCards, { ...card, position }],
          chips: Math.max(0, player.chips - price),
        };

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
        updated[safePayer].chips = Math.max(
          0,
          updated[safePayer].chips - amount
        );
        updated[safeReceiver].chips += amount;
        playersRef.current = updated;
        log("✅", "PENALTY APPLIED");
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

          if (card && owner !== undefined && owner !== safeIndex) {
            log("⚠️", "PENALTY TRIGGERED");
            const currentPlayer = playersRef.current[safeIndex];
            const ownerPlayer = playersRef.current[owner];
            const hand = detectPokerHand(
              ownerPlayer.collectedCards.filter((c) => c !== null) as any
            );
            const penalty = calculatePenalty(hand);

            setPenaltyInfo({
              card,
              penalty,
              hand,
              handCards: ownerPlayer.collectedCards.filter(
                (c) => c !== null
              ) as any,
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
    [dealtCards, cardOwners, endTurn, playerPositions, getSafePlayerIndex, log]
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

  const handleStartSinglePlayer = useCallback(() => {
    log("🎮", "Starting Single Player Mode");

    const singlePlayers: Player[] = [
      {
        name: "Player 1",
        chips: 1500,
        color: "#FF6B6B",
        position: "bottom",
        collectedCards: [],
        boughtCards: [],
        boardPosition: 0,
        suit: "♠",
      },
      {
        name: "Player 2",
        chips: 1500,
        color: "#4ECDC4",
        position: "left",
        collectedCards: [],
        boughtCards: [],
        boardPosition: 16,
        suit: "♥",
      },
      {
        name: "Player 3",
        chips: 1500,
        color: "#45B7D1",
        position: "top",
        collectedCards: [],
        boughtCards: [],
        boardPosition: 32,
        suit: "♦",
      },
      {
        name: "Player 4",
        chips: 1500,
        color: "#96CEB4",
        position: "right",
        collectedCards: [],
        boughtCards: [],
        boardPosition: 48,
        suit: "♣",
      },
    ];

    playersRef.current = singlePlayers;
    currentIndexRef.current = 0;

    setPlayers(singlePlayers);
    setCurrentPlayerIndex(0);
    setPlayerPositions([0, 16, 32, 48]);
    setGameStarted(true);
    setGameMode("playing");
    setDealtCards({});
    setCardOwners({});
    setHasRolledThisTurn(false);
    setBaseRotation(0);

    log("✅", "Single Player Mode initialized with 4 players");
  }, [log]);

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
        onStartSinglePlayer={handleStartSinglePlayer}
        onBack={() => navigate("/home")} // <-- This goes HERE, not in MultiplayerLobby.tsx
      />
    );
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
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z + baseRotation}deg)`,
            width: "850px",
            height: "850px",
          }}
        >
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
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z + baseRotation}deg)`,
            width: "850px",
            height: "850px",
          }}
        >
          {players.map((player, index) => {
            if (!player || !player.color) return null;

            const profilePositions = {
              bottom: { x: 0, y: 230, rotateZ: 0 },
              left: { x: -230, y: 0, rotateZ: 90 },
              top: { x: 0, y: -230, rotateZ: 180 },
              right: { x: 230, y: 0, rotateZ: 270 },
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
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) 
                        rotateZ(${pos.rotateZ}deg) 
                        rotateX(${playerRotationX}deg) 
                        translateZ(23px)`,
                }}
              >
                <div
                  className="rounded-2xl border-4 shadow-2xl w-[300px] h-[420px] relative overflow-hidden flex flex-col backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(145deg, ${player.color}f0 0%, ${player.color}d0 100%)`,
                    borderColor: player.color,
                    boxShadow:
                      index === currentPlayerIndex
                        ? `0 0 50px ${player.color}, 0 0 100px ${player.color}60, 0 20px 60px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.3)`
                        : `0 10px 40px rgba(0,0,0,0.4), 0 5px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                >
                  {index === currentPlayerIndex && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black font-black text-xs px-5 py-2 rounded-full shadow-xl border-3 border-white animate-pulse z-10">
                      ⭐ YOUR TURN ⭐
                    </div>
                  )}

                  <div className="h-[80px] flex-shrink-0 px-5 py-4 bg-black/30 backdrop-blur-md border-b-2 border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center border-3 border-white/40 shadow-lg"
                        style={{
                          backgroundColor: `${player.color}40`,
                          borderColor: player.color,
                        }}
                      >
                        <span
                          className="text-2xl font-bold"
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
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-black text-lg truncate drop-shadow-lg">
                          {player.name}
                        </h3>
                        <div className="text-xs text-white/70 font-semibold">
                          Player {index + 1}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-black px-4 py-2 rounded-xl shadow-xl text-sm whitespace-nowrap flex-shrink-0 border-2 border-yellow-300">
                      ${player.chips.toLocaleString()}
                    </div>
                  </div>

                  <div className="h-[340px] overflow-hidden flex flex-col">
                    {index === currentPlayerIndex &&
                      !landedCard &&
                      !isMoving &&
                      !isRolling && (
                        <div className="h-[340px] flex flex-col items-center justify-center bg-gradient-to-br from-black/20 to-black/10 rounded-xl border-2 border-yellow-500/40 p-4 m-2">
                          {roomPlayers[currentPlayerIndex]?.user_id ===
                          currentUserId ? (
                            <>
                              <div className="mb-4 flex-shrink-0">
                                <MiniSlotMachine
                                  onRollComplete={onRollComplete}
                                  isVisible={true}
                                  disabled={isRolling}
                                />
                              </div>
                              <div className="text-center flex-1 flex flex-col items-center justify-center">
                                <div className="text-yellow-400 font-black text-lg mb-2 drop-shadow-lg">
                                  🎲 ROLL TO MOVE
                                </div>
                                <div className="text-white/80 text-sm font-semibold">
                                  Click the slot machine!
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="h-[340px] flex flex-col items-center justify-center">
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-4 flex-shrink-0 shadow-xl border-2 border-gray-600">
                                <span className="text-3xl">⏳</span>
                              </div>
                              <div className="text-center">
                                <div className="text-yellow-400 font-black text-lg mb-2 drop-shadow-lg">
                                  {players[currentPlayerIndex]?.name}'s Turn
                                </div>
                                <div className="text-white/60 text-sm font-semibold">
                                  Waiting for roll...
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {index === currentPlayerIndex && landedCard && (
                      <div className="h-[340px] bg-gradient-to-br from-black/30 to-black/20 backdrop-blur-md rounded-xl border-2 border-white/20 p-4 flex flex-col m-2 shadow-inner">
                        <div className="text-white/90 text-xs font-black mb-3 uppercase tracking-wider flex-shrink-0 drop-shadow">
                          🏠 PROPERTY FOR SALE
                        </div>

                        <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                          <div className="bg-white rounded-xl shadow-2xl p-3 w-18 h-24 flex flex-col items-center justify-center gap-1 flex-shrink-0 border-2 border-gray-200">
                            <div
                              className="text-xl font-black leading-none"
                              style={{ color: getSuitColor(landedCard.suit) }}
                            >
                              {landedCard.value}
                            </div>
                            <div
                              className="text-2xl leading-none"
                              style={{ color: getSuitColor(landedCard.suit) }}
                            >
                              {landedCard.suit}
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="bg-yellow-500/30 p-3 rounded-xl text-center border border-yellow-400/50 shadow-lg">
                              <div className="text-yellow-300 font-black text-lg drop-shadow">
                                ${getCardPrice(landedCard.value)}
                              </div>
                              <div className="text-white/70 text-[10px] font-bold">
                                Buy
                              </div>
                            </div>
                            <div className="bg-green-500/30 p-3 rounded-xl text-center border border-green-400/50 shadow-lg">
                              <div className="text-green-300 font-black text-lg drop-shadow">
                                $
                                {Math.floor(getCardPrice(landedCard.value) / 2)}
                              </div>
                              <div className="text-white/70 text-[10px] font-bold">
                                Sell
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-auto pt-3 border-t-2 border-white/20 flex-shrink-0">
                          <button
                            onClick={handleBuyCard}
                            disabled={
                              player.chips < getCardPrice(landedCard.value)
                            }
                            className="flex-1 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-black py-3 px-4 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 text-sm disabled:opacity-40 disabled:cursor-not-allowed border-2 border-green-400/50"
                          >
                            💰 Buy
                          </button>
                          <button
                            onClick={handleStartAuction}
                            className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 hover:from-yellow-600 hover:via-yellow-700 hover:to-orange-600 text-white font-black py-3 px-5 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 text-sm border-2 border-yellow-400/50"
                          >
                            🔨
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Replace the cards display section (around line 1100+) with this: */}
                    {!landedCard && (
                      <div className="h-[340px] bg-gradient-to-br from-black/20 to-black/10 rounded-xl border-2 border-white/10 p-3 flex flex-col m-2 shadow-inner">
                        <div className="text-white/90 text-xs font-black mb-3 uppercase tracking-wider flex items-center gap-2 flex-shrink-0 drop-shadow">
                          <span>🃏</span>
                          <span>{player.boughtCards.length} Cards</span>
                        </div>

                        <div className="flex-1 overflow-y-auto px-[20px] pb-[20px] custom-scrollbar">
                          {/* Only show cards if this is the current user's profile */}
                          {roomPlayers[index]?.user_id === currentUserId ? (
                            // Show actual cards for current user
                            player.boughtCards.length > 0 ? (
                              <div className="flex flex-wrap justify-center gap-2 min-h-full">
                                {player.boughtCards.map((card, cardIdx) => (
                                  <div
                                    key={cardIdx}
                                    className="rounded-lg border-3 shadow-xl w-11 h-16 flex flex-col items-center justify-center bg-white p-1 flex-shrink-0 hover:scale-110 transition-transform"
                                    style={{
                                      borderColor: getSuitColor(card.suit),
                                    }}
                                  >
                                    <div
                                      className="text-xs font-black leading-tight"
                                      style={{ color: getSuitColor(card.suit) }}
                                    >
                                      {card.value}
                                    </div>
                                    <div
                                      className="text-lg leading-tight mt-0.5"
                                      style={{ color: getSuitColor(card.suit) }}
                                    >
                                      {card.suit}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-white/50 text-sm font-semibold">
                                <span>📭 No cards yet</span>
                              </div>
                            )
                          ) : // Show card backs for other players
                          player.boughtCards.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-2 min-h-full">
                              {player.boughtCards.map((card, cardIdx) => (
                                <div
                                  key={cardIdx}
                                  className="rounded-lg border-3 shadow-xl w-11 h-16 flex flex-col items-center justify-center p-1 flex-shrink-0 hover:scale-110 transition-transform"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    borderColor: player.color,
                                  }}
                                >
                                  <div className="text-white text-2xl">🂠</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-white/50 text-sm font-semibold">
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

export default App;
