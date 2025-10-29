import { useState, useEffect } from "react";
import { PlayerProfile } from "./components/PlayerProfile";
import { PlayerIcon } from "./components/PlayerIcon";
import { PenaltyModal } from "./components/PenaltyModal";
import { AuctionModal } from "./components/AuctionModalLocal";

import { SellCardsModal } from "./components/SellCardsModal";
import { MiniSlotMachine } from "./components/MiniSlotMachine";
import { RulesPanel } from "./components/RulesPanel";
import {
  detectPokerHand,
  calculatePenalty,
  getCardPrice,
  getHandDescription,
  PokerHand,
} from "./utils/pokerLogic.ts";
import {
  MYSTERY_CARDS,
  BOMB_CARDS,
  JOKER_CARD,
  MysteryCard,
  getRandomMysteryCard,
  QUESTION_MARK_POSITIONS,
  initializeJokerPositions, // ADD THIS
  getJokerPositions, // ADD THIS
  isJokerPosition, // ADD THIS
} from "./data/mysteryCards";

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
  wildCollectedAt?: number[]; // Track all positions where wilds were collected
}

function LocalGame() {
  console.log("LocalGame: Component initialized");
  const [currentDiceTotal, setCurrentDiceTotal] = useState<number | null>(null);

  const [jokerPositions, setJokerPositions] = useState<number[]>([]);
  useEffect(() => {
    console.log("🔍 jokerPositions state changed:", jokerPositions);
  }, [jokerPositions]);

  // Disable scrolling when component mounts, re-enable when it unmounts
  useEffect(() => {
    // Save original overflow value
    const originalOverflow = document.body.style.overflow;

    // Disable scrolling
    document.body.style.overflow = "hidden";

    // Cleanup: re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []); // Empty dependency array = runs once on mount

  const [hasExtraTurn, setHasExtraTurn] = useState(false);

  const [rotation, setRotation] = useState({ x: 60, y: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [dealtCards, setDealtCards] = useState<{
    [key: number]: { suit: string; value: string };
  }>({});
  const [cardOwners, setCardOwners] = useState<{ [key: number]: number }>({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPositions, setPlayerPositions] = useState<number[]>([
    0, 16, 32, 48,
  ]);
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

  // Mystery card states
  const [mysteryCardPositions, setMysteryCardPositions] = useState<{
    [key: number]: MysteryCard;
  }>({});
  const [landedMysteryCard, setLandedMysteryCard] =
    useState<MysteryCard | null>(null);
  const [showMysteryCardModal, setShowMysteryCardModal] = useState(false);

  console.log("LocalGame: Initial state", {
    rotation,
    currentPlayerIndex,
    gameStarted,
    playerPositions,
    isAutoPlaying,
    autoPlaySpeed,
  });

  // Joker hat controls - adjust size and z-index
  const jokerHatSize = 150; // percentage of card size (e.g., 80 = 80% of card)
  const jokerHatZIndex = 100; // z-index value
  const jokerHatTopOffset = -30; // percentage offset from top (negative = extends above card)

  // Corner positioning adjustments - change these values to move corner squares
  const cornerOffsets = {
    bottomRight: { x: 190, y: 10 }, // Corner 0
    bottomLeft: { x: -10, y: 195 }, // Corner 10
    topLeft: { x: -195, y: -10 }, // Corner 20
    topRight: { x: 10, y: -195 }, // Corner 30
  };

  const [players, setPlayers] = useState<Player[]>([
    {
      name: "Player 1",
      chips: 10000,
      color: "#000000",
      position: "bottom",
      collectedCards: [],
      boughtCards: [],
      boardPosition: 0,
      suit: "♠",
      jokers: [],
    },
    {
      name: "Player 2",
      chips: 10000,
      color: "#DC143C",
      position: "left",
      collectedCards: [],
      boughtCards: [],
      boardPosition: 16,
      suit: "♥",
      jokers: [],
    },
    {
      name: "Player 3",
      chips: 10000,
      color: "#90EE90",
      position: "top",
      collectedCards: [],
      boughtCards: [],
      boardPosition: 32,
      suit: "♦",
      jokers: [],
    },
    {
      name: "Player 4",
      chips: 10000,
      color: "#ADD8E6",
      position: "right",
      collectedCards: [],
      boughtCards: [],
      boardPosition: 48,
      suit: "♣",
      jokers: [],
    },
  ]);

  console.log("LocalGame: Players initialized", players);

  const totalSpaces = 64;
  const spacesPerSide = 16;

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("handleMouseDown: Mouse down event", {
      clientX: e.clientX,
      clientY: e.clientY,
    });
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    console.log("handleMouseDown: Set isDragging to true, dragStart", {
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
      console.log("handleMouseMove: Not dragging, ignoring");
      return;
    }
    console.log("handleMouseMove: Mouse move while dragging", {
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  const handleMouseUp = () => {
    console.log("handleMouseUp: Mouse up event");
    setIsDragging(false);
    console.log("handleMouseUp: Set isDragging to false");
  };

  const handleWheel = (e: React.WheelEvent) => {
    console.log("handleWheel: Wheel event", { deltaY: e.deltaY, invertScroll });
    e.preventDefault();
    const direction = invertScroll ? -1 : 1;
    setRotation((prev) => ({
      ...prev,
      z: prev.z + (e.deltaY > 0 ? 10 * direction : -10 * direction),
    }));
    console.log("handleWheel: Updated rotation", {
      z: rotation.z + (e.deltaY > 0 ? 10 * direction : -10 * direction),
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    console.log("handleTouchStart: Touch start event", {
      clientX: e.touches[0].clientX,
    });
    setTouchStart(e.touches[0].clientX);
    console.log("handleTouchStart: Set touchStart", {
      touchStart: e.touches[0].clientX,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) {
      console.log("handleTouchMove: No touchStart, ignoring");
      return;
    }
    const currentTouch = e.touches[0].clientX;
    console.log("handleTouchMove: Touch move", { currentTouch, touchStart });
    const diff = currentTouch - touchStart;
    const direction = invertScroll ? -1 : 1;
    setRotation((prev) => ({
      ...prev,
      z: prev.z + diff * 0.5 * direction,
    }));
    console.log("handleTouchMove: Updated rotation", {
      z: rotation.z + diff * 0.5 * direction,
    });
    setTouchStart(currentTouch);
    console.log("handleTouchMove: Updated touchStart", {
      touchStart: currentTouch,
    });
  };

  const handleTouchEnd = () => {
    console.log("handleTouchEnd: Touch end event");
    setTouchStart(null);
    console.log("handleTouchEnd: Cleared touchStart");
  };

  const getPropertyPosition = (index: number) => {
    console.log("getPropertyPosition: Calculating position for index", {
      index,
    });
    const boardSize = 870;
    const cardWidth = 52;
    const cardHeight = 75;
    const cornerSize = 82.69;
    const gap = 2;

    let x = 0;
    let y = 0;
    let rotateZ = 0;
    let isCorner = false;

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

    console.log("getPropertyPosition: Result", {
      index,
      x,
      y,
      rotateZ,
      width: isCorner ? cornerSize : cardWidth,
      height: isCorner ? cornerSize : cardHeight,
      isCorner,
    });

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

    // NEW CODE - ADD THIS:
    const newMysteryCards: { [key: number]: MysteryCard } = {};

    // First, initialize joker positions (2 wild cards)
    const newJokerPositions = initializeJokerPositions();
    setJokerPositions(newJokerPositions);

    // Get the 6 non-joker positions
    const nonJokerPositions = QUESTION_MARK_POSITIONS.filter(
      (pos) => !newJokerPositions.includes(pos)
    );

    // Shuffle Mystery and Bomb cards separately
    const shuffledMysteryCards = [...MYSTERY_CARDS].sort(
      () => Math.random() - 0.5
    );
    const shuffledBombCards = [...BOMB_CARDS].sort(() => Math.random() - 0.5);

    // Assign 3 Mystery cards and 3 Bomb cards to the 6 positions
    for (let i = 0; i < 6; i++) {
      const pos = nonJokerPositions[i];
      if (i < 3) {
        // First 3 positions get Mystery cards
        newMysteryCards[pos] = shuffledMysteryCards[i];
      } else {
        // Last 3 positions get Bomb cards
        newMysteryCards[pos] = shuffledBombCards[i - 3];
      }
    }

    setMysteryCardPositions(newMysteryCards);

    console.log("🃏 handleDeal: Joker positions set:", {
      jokerPositions: newJokerPositions,
      questionMarkPositions: QUESTION_MARK_POSITIONS,
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
    console.log("getCard: Retrieving card for position", { index });
    if (index === 0 || index === 16 || index === 32 || index === 48) {
      const cornerSuits = ["♠", "♥", "♦", "♣"];
      const suitIndex =
        index === 0 ? 0 : index === 16 ? 1 : index === 32 ? 2 : 3;
      console.log("getCard: Corner card", {
        index,
        suit: cornerSuits[suitIndex],
      });
      return { isCorner: true, value: "", suit: cornerSuits[suitIndex] };
    }

    if (QUESTION_MARK_POSITIONS.includes(index)) {
      console.log("getCard: Mystery card position", { index });
      return { isCorner: false, value: "?", suit: "", isQuestion: true };
    }

    if (dealtCards[index]) {
      console.log("getCard: Regular card", { index, card: dealtCards[index] });
      return { ...dealtCards[index], isCorner: false, isQuestion: false };
    }

    console.log("getCard: No card at position", { index });
    return { suit: "", value: "", isCorner: false, isQuestion: false };
  };

  const getSuitColor = (suit: string) => {
    console.log("getSuitColor: Getting color for suit", { suit });
    if (suit === "♥") return "#DC143C";
    if (suit === "♦") return "#90EE90";
    if (suit === "♣") return "#ADD8E6";
    return "#000000";
  };

  const handleDrawFromShoe = (total: number, isPair: boolean): void => {
    console.log("handleDrawFromShoe: Drawing from shoe", { total, isPair });
    if (total <= 0) {
      console.warn("handleDrawFromShoe: Invalid dice total", { total });
      endTurn();
      return;
    }
    setHasPair(isPair);
    setHasExtraTurn(isPair);
    setCurrentDiceTotal(total); // ADD THIS - Show the total
    console.log("handleDrawFromShoe: Set hasPair and hasExtraTurn", {
      hasPair: isPair,
    });
    handleMoveFromShoe(total);
    console.log("handleDrawFromShoe: Triggered movement", { total });
  };

  const handleMysteryCardEffect = (mysteryCard: MysteryCard) => {
    console.log("handleMysteryCardEffect: Processing mystery card", {
      mysteryCard,
    });
    const playerIndex = currentPlayerIndex;
    const finalPosition = playerPositions[playerIndex];
    console.log("handleMysteryCardEffect: Current player and position", {
      playerIndex,
      finalPosition,
    });

    const effects = mysteryCard.effects;

    // Handle chip bonus/penalty (cb)
    if (effects.cb !== undefined) {
      console.log("handleMysteryCardEffect: Applying chip effect", {
        value: effects.cb,
      });
      setPlayers((prev) => {
        const newPlayers = [...prev];
        if (effects.cb! > 0) {
          newPlayers[playerIndex].chips += effects.cb!;
        } else {
          newPlayers[playerIndex].chips = Math.max(
            0,
            newPlayers[playerIndex].chips + effects.cb! // cb is already negative
          );
        }
        console.log("handleMysteryCardEffect: Updated chips", {
          playerIndex,
          chips: newPlayers[playerIndex].chips,
        });
        return newPlayers;
      });
    }

    // Handle movement bonus/penalty (mb)
    if (effects.mb !== undefined) {
      console.log("handleMysteryCardEffect: Applying movement effect", {
        value: effects.mb,
      });
      setPlayerPositions((prev) => {
        const newPositions = [...prev];
        const currentPos = newPositions[playerIndex];
        const newPos = (currentPos + effects.mb! + 64) % 64; // +64 ensures positive modulo
        newPositions[playerIndex] = newPos;
        console.log("handleMysteryCardEffect: Moved player", {
          playerIndex,
          from: currentPos,
          to: newPos,
        });
        return newPositions;
      });
    }

    // Handle move to specific location (mt)
    if (effects.mt !== undefined) {
      console.log("handleMysteryCardEffect: Applying teleport effect", {
        destination: effects.mt,
      });
      const homePositions: { [key: string]: number } = {
        "Hearts Home": 16,
        "Spades Home": 0,
        "Diamonds Home": 32,
        "Clubs Home": 48,
      };

      const targetPosition = homePositions[effects.mt];
      if (targetPosition !== undefined) {
        setPlayerPositions((prev) => {
          const newPositions = [...prev];
          newPositions[playerIndex] = targetPosition;
          console.log("handleMysteryCardEffect: Teleported player", {
            playerIndex,
            destination: effects.mt,
            position: targetPosition,
          });
          return newPositions;
        });
      }
    }

    // Handle draw cards (dr)
    if (effects.dr !== undefined && effects.dr > 0) {
      console.log("handleMysteryCardEffect: Applying draw cards effect", {
        count: effects.dr,
      });

      // Get random cards from available positions
      const availableCards = Object.entries(dealtCards)
        .filter(([pos, card]) => cardOwners[parseInt(pos)] === undefined)
        .map(([pos, card]) => ({ position: parseInt(pos), card }));

      if (availableCards.length > 0) {
        setPlayers((prev) => {
          const newPlayers = [...prev];
          const cardsToAdd = Math.min(effects.dr!, availableCards.length);

          for (let i = 0; i < cardsToAdd; i++) {
            const randomIndex = Math.floor(
              Math.random() * availableCards.length
            );
            const { position, card } = availableCards[randomIndex];

            newPlayers[playerIndex].collectedCards.push({ ...card });
            newPlayers[playerIndex].boughtCards.push({
              ...card,
              position: position,
            });

            // Mark card as owned
            setCardOwners((prevOwners) => ({
              ...prevOwners,
              [position]: playerIndex,
            }));

            // Remove from available cards
            availableCards.splice(randomIndex, 1);
          }

          console.log("handleMysteryCardEffect: Drew cards", {
            playerIndex,
            count: cardsToAdd,
          });
          return newPlayers;
        });
      }
    }

    // Handle skip turns (sk)
    if (effects.sk !== undefined && effects.sk > 0) {
      console.log("handleMysteryCardEffect: Applying skip turn effect", {
        turns: effects.sk,
      });

      // Skip turns by advancing currentPlayerIndex
      let skipsRemaining = effects.sk;
      const skipTurns = () => {
        if (skipsRemaining > 0) {
          setCurrentPlayerIndex((prev) => {
            const nextIndex = (prev + 1) % 4;
            console.log("handleMysteryCardEffect: Skipped turn", {
              from: prev,
              to: nextIndex,
              remaining: skipsRemaining - 1,
            });
            skipsRemaining--;
            if (skipsRemaining > 0) {
              setTimeout(skipTurns, 100);
            }
            return nextIndex;
          });
        }
      };
      skipTurns();
    }

    // Handle repeat turn (rt)
    if (effects.rt === true) {
      console.log("handleMysteryCardEffect: Applying repeat turn effect");
      setHasPair(true); // Use the pair mechanism to grant extra turn
    }

    // Handle collect/pay each player (ce)
    if (effects.ce !== undefined && effects.ce !== 0) {
      console.log("handleMysteryCardEffect: Applying collect/pay each player", {
        amount: effects.ce,
      });

      setPlayers((prev) => {
        const newPlayers = [...prev];

        if (effects.ce! > 0) {
          // Collect from each other player
          for (let i = 0; i < newPlayers.length; i++) {
            if (i !== playerIndex) {
              const payment = Math.min(effects.ce!, newPlayers[i].chips);
              newPlayers[i].chips -= payment;
              newPlayers[playerIndex].chips += payment;
            }
          }
        } else {
          // Pay to each other player
          const paymentPerPlayer = Math.abs(effects.ce!);
          const totalPayment = paymentPerPlayer * 3; // 3 other players
          const actualPayment = Math.min(
            totalPayment,
            newPlayers[playerIndex].chips
          );
          const perPlayer = Math.floor(actualPayment / 3);

          newPlayers[playerIndex].chips -= actualPayment;
          for (let i = 0; i < newPlayers.length; i++) {
            if (i !== playerIndex) {
              newPlayers[i].chips += perPlayer;
            }
          }
        }

        console.log("handleMysteryCardEffect: Updated all player chips", {
          effect: effects.ce,
        });
        return newPlayers;
      });
    }

    // Close modal and handle turn continuation
    setLandedMysteryCard(null);
    setShowMysteryCardModal(false);
    console.log("handleMysteryCardEffect: Cleared mystery card modal");

    // If repeat turn effect, keep turn; otherwise end turn
    if (effects.rt === true) {
      console.log("handleMysteryCardEffect: Repeat turn effect, keeping turn");
      // Don't clear hasExtraTurn - they still get doubles bonus
    } else if (hasExtraTurn) {
      console.log(
        "handleMysteryCardEffect: Player rolled doubles, keeping turn"
      );
      setHasExtraTurn(false);
      setHasPair(false);
    } else {
      console.log("handleMysteryCardEffect: Ending turn");
      endTurn();
    }
  };

  const handleMoveFromShoe = (total: number) => {
    console.log("handleMoveFromShoe: Starting player movement", { total });
    setIsMoving(true);
    console.log("handleMoveFromShoe: Set isMoving to true");
    const playerIndex = currentPlayerIndex;
    const startPosition = playerPositions[playerIndex];
    let movesMade = 0;

    const moveInterval = setInterval(() => {
      if (movesMade < total) {
        setPlayerPositions((prev) => {
          const newPositions = [...prev];
          const oldPosition = newPositions[playerIndex];
          const newPosition = (newPositions[playerIndex] + 1) % 64;
          newPositions[playerIndex] = newPosition;
          console.log("handleMoveFromShoe: Moved player", {
            playerIndex,
            oldPosition,
            newPosition,
            movesMade,
          });

          // Check if player completed a lap and remove expired jokers AND wilds
          if (newPosition < oldPosition) {
            console.log("handleMoveFromShoe: Player completed a lap");
            setPlayers((prevPlayers) => {
              const updatedPlayers = [...prevPlayers];

              // Remove expired jokers
              updatedPlayers[playerIndex].jokers = updatedPlayers[
                playerIndex
              ].jokers.filter((joker) => {
                const keep =
                  joker.collectedAtPosition > oldPosition ||
                  joker.collectedAtPosition <= newPosition;
                console.log("handleMoveFromShoe: Checking joker", {
                  joker,
                  keep,
                });
                return keep;
              });

              // Remove expired wilds (after completing 1 full lap)
              const wildPositions =
                updatedPlayers[playerIndex].wildCollectedAt || [];
              let wildsExpired = 0;

              updatedPlayers[playerIndex].wildCollectedAt =
                wildPositions.filter((wildPos) => {
                  const keep = wildPos > oldPosition || wildPos <= newPosition;
                  if (!keep) {
                    wildsExpired++;
                    console.log("🃏 Wild card expired at position:", wildPos);
                  }
                  return keep;
                });

              // Decrement wild count for expired wilds
              if (wildsExpired > 0) {
                updatedPlayers[playerIndex].wilds = Math.max(
                  0,
                  (updatedPlayers[playerIndex].wilds || 0) - wildsExpired
                );
                console.log(
                  `🃏 ${wildsExpired} Wild card(s) expired for player ${playerIndex}`
                );

                // Show notification
                setGameLog((prev) => [
                  ...prev,
                  `${updatedPlayers[playerIndex].name}'s ${wildsExpired} Wild Card(s) expired! 🃏`,
                ]);
              }

              console.log("handleMoveFromShoe: Updated jokers and wilds", {
                playerIndex,
                jokers: updatedPlayers[playerIndex].jokers,
                wilds: updatedPlayers[playerIndex].wilds,
              });
              return updatedPlayers;
            });
          }

          return newPositions;
        });
        movesMade++;
      } else {
        console.log("handleMoveFromShoe: Movement complete");
        clearInterval(moveInterval);
        setIsMoving(false);
        setCurrentDiceTotal(null); // ADD THIS - Clear total after movement

        console.log("handleMoveFromShoe: Set isMoving to false");

        const finalPosition = (startPosition + total) % 64;
        console.log("handleMoveFromShoe: Final position", { finalPosition });

        // Check if landed on Joker position
        // Check if landed on Joker position
        if (isJokerPosition(finalPosition)) {
          console.log("🃏 Player landed on Joker!");

          setPlayers((prevPlayers) => {
            const updatedPlayers = [...prevPlayers];

            // ✅ Add to wilds counter ONLY
            updatedPlayers[playerIndex].wilds =
              (updatedPlayers[playerIndex].wilds || 0) + 1;

            // Track where wild was collected for expiration
            if (!updatedPlayers[playerIndex].wildCollectedAt) {
              updatedPlayers[playerIndex].wildCollectedAt = [];
            }
            updatedPlayers[playerIndex].wildCollectedAt!.push(finalPosition);

            console.log("handleMoveFromShoe: Added wild to player", {
              playerIndex,
              wilds: updatedPlayers[playerIndex].wilds,
              wildCollectedAt: updatedPlayers[playerIndex].wildCollectedAt,
            });
            return updatedPlayers;
          });

          // Show Joker modal
          setLandedMysteryCard(JOKER_CARD);
          setShowMysteryCardModal(true);
          return;
        }

        // Check if landed on mystery card
        if (QUESTION_MARK_POSITIONS.includes(finalPosition)) {
          const mysteryCard = mysteryCardPositions[finalPosition];
          if (mysteryCard) {
            setLandedMysteryCard(mysteryCard);
            setShowMysteryCardModal(true);
            console.log("handleMoveFromShoe: Landed on mystery card", {
              mysteryCard,
            });
          }
          return;
        }

        const card = dealtCards[finalPosition];
        const owner = cardOwners[finalPosition];
        console.log("handleMoveFromShoe: Checking landed position", {
          finalPosition,
          card,
          owner,
        });

        if (card && owner !== undefined && owner !== playerIndex) {
          const ownerPlayer = players[owner];
          const { penalty, hand } = calculatePenalty(
            card,
            ownerPlayer.collectedCards,
            ownerPlayer.boughtCards,
            ownerPlayer.wilds || 0 // Pass wilds to penalty calculation
          );
          const handResult = detectPokerHand(
            ownerPlayer.collectedCards,
            ownerPlayer.wilds || 0 // Pass wilds to hand detection
          );
          setPenaltyInfo({
            card,
            penalty,
            hand,
            handCards: handResult?.cards || [],
            ownerIndex: owner,
          });
          console.log("handleMoveFromShoe: Set penaltyInfo", { penaltyInfo });
        } else if (card && owner === undefined) {
          setLandedCard(card);
          console.log("handleMoveFromShoe: Set landedCard", {
            landedCard: card,
          });
        } else {
          console.log(
            "handleMoveFromShoe: No action required at this position"
          );
          if (hasExtraTurn) {
            console.log(
              "handleMoveFromShoe: Player rolled doubles, keeping turn"
            );
            setHasExtraTurn(false);
            setHasPair(false);
          } else {
            console.log("handleMoveFromShoe: Ending turn");
            endTurn();
          }
        }
      }
    }, 300);
  };

  const handleBuyCard = () => {
    console.log("handleBuyCard: Attempting to buy card", { landedCard });
    if (!landedCard) {
      console.log("handleBuyCard: No landed card, exiting");
      return;
    }

    const finalPosition = playerPositions[currentPlayerIndex];
    const player = players[currentPlayerIndex];
    const cardPrice = getCardPrice(landedCard.value);
    console.log("handleBuyCard: Card details", {
      finalPosition,
      playerName: player.name,
      cardPrice,
      playerChips: player.chips,
    });

    if (player.chips < cardPrice) {
      console.log("handleBuyCard: Insufficient chips", {
        playerChips: player.chips,
        cardPrice,
      });
      return;
    }

    setPlayers((prev) => {
      const newPlayers = [...prev];
      const updatedCards = [
        ...newPlayers[currentPlayerIndex].collectedCards,
        { ...landedCard },
      ];
      const updatedBoughtCards = [
        ...newPlayers[currentPlayerIndex].boughtCards,
        { ...landedCard, position: finalPosition },
      ];
      newPlayers[currentPlayerIndex] = {
        ...newPlayers[currentPlayerIndex],
        collectedCards: updatedCards,
        boughtCards: updatedBoughtCards,
        chips: newPlayers[currentPlayerIndex].chips - cardPrice,
      };
      console.log("handleBuyCard: Updated player state", {
        playerIndex: currentPlayerIndex,
        collectedCards: updatedCards,
        boughtCards: updatedBoughtCards,
        chips: newPlayers[currentPlayerIndex].chips,
      });
      return newPlayers;
    });

    setCardOwners((prev) => ({
      ...prev,
      [finalPosition]: currentPlayerIndex,
    }));
    console.log("handleBuyCard: Updated cardOwners", {
      position: finalPosition,
      owner: currentPlayerIndex,
    });

    setLandedCard(null);

    if (hasExtraTurn) {
      console.log("handleBuyCard: Player rolled doubles, keeping turn");
      setHasExtraTurn(false);
      setHasPair(false);
    } else {
      endTurn();
      console.log("handleBuyCard: Ended turn");
    }
  };

  const handleAuctionComplete = (winnerIndex: number, winningBid: number) => {
    console.log("handleAuctionComplete: Processing auction", {
      winnerIndex,
      winningBid,
      auctionInfo,
    });
    if (!auctionInfo) {
      console.log("handleAuctionComplete: No auctionInfo, exiting");
      return;
    }

    setPlayers((prev) => {
      const newPlayers = [...prev];
      const updatedCards = [
        ...newPlayers[winnerIndex].collectedCards,
        { ...auctionInfo.card },
      ];
      const updatedBoughtCards = [
        ...newPlayers[winnerIndex].boughtCards,
        { ...auctionInfo.card, position: auctionInfo.position },
      ];
      newPlayers[winnerIndex] = {
        ...newPlayers[winnerIndex],
        collectedCards: updatedCards,
        boughtCards: updatedBoughtCards,
        chips: newPlayers[winnerIndex].chips - winningBid,
      };
      console.log("handleAuctionComplete: Updated winner's state", {
        winnerIndex,
        collectedCards: updatedCards,
        boughtCards: updatedBoughtCards,
        chips: newPlayers[winnerIndex].chips,
      });
      return newPlayers;
    });

    setCardOwners((prev) => ({
      ...prev,
      [auctionInfo.position]: winnerIndex,
    }));
    console.log("handleAuctionComplete: Updated cardOwners", {
      position: auctionInfo.position,
      owner: winnerIndex,
    });

    setAuctionInfo(null);
    setLandedCard(null);
    console.log("handleAuctionComplete: Cleared auctionInfo and landedCard");
    if (winnerIndex === currentPlayerIndex && hasExtraTurn) {
      console.log("handleAuctionComplete: Player rolled doubles, keeping turn");
      setHasExtraTurn(false);
      setHasPair(false);
    } else {
      endTurn();
      console.log("handleAuctionComplete: Ended turn");
    }
    console.log("handleAuctionComplete: Ended turn");
  };

  const handlePayPenalty = () => {
    console.log("handlePayPenalty: Processing penalty", { penaltyInfo });
    if (!penaltyInfo) {
      console.log("handlePayPenalty: No penaltyInfo, exiting");
      return;
    }

    setPlayers((prev) => {
      const newPlayers = [...prev];
      newPlayers[currentPlayerIndex].chips -= penaltyInfo.penalty;
      newPlayers[penaltyInfo.ownerIndex].chips += penaltyInfo.penalty;
      console.log("handlePayPenalty: Updated chips", {
        payerIndex: currentPlayerIndex,
        payerChips: newPlayers[currentPlayerIndex].chips,
        ownerIndex: penaltyInfo.ownerIndex,
        ownerChips: newPlayers[penaltyInfo.ownerIndex].chips,
        penalty: penaltyInfo.penalty,
      });
      return newPlayers;
    });

    setPenaltyInfo(null);
    console.log("handlePayPenalty: Cleared penaltyInfo");

    if (hasExtraTurn) {
      console.log("handlePayPenalty: Player rolled doubles, keeping turn");
      setHasExtraTurn(false);
      setHasPair(false);
    } else {
      endTurn();
      console.log("handlePayPenalty: Ended turn");
    }
  };

  const handleSellCards = (
    cardsToSell: Array<{ suit: string; value: string }>
  ) => {
    console.log("handleSellCards: Selling cards", { cardsToSell });
    setPlayers((prev) => {
      const newPlayers = [...prev];
      const player = newPlayers[currentPlayerIndex];

      let totalRefund = 0;
      cardsToSell.forEach((cardToSell) => {
        const cardIndex = player.boughtCards.findIndex(
          (bc) => bc.suit === cardToSell.suit && bc.value === cardToSell.value
        );

        if (cardIndex !== -1) {
          const boughtCard = player.boughtCards[cardIndex];
          const price = getCardPrice({
            suit: cardToSell.suit,
            value: cardToSell.value,
          });
          const refund = Math.floor(price / 2);
          totalRefund += refund;

          delete cardOwners[boughtCard.position];
          player.boughtCards.splice(cardIndex, 1);

          const collectedIndex = player.collectedCards.findIndex(
            (cc) =>
              cc && cc.suit === cardToSell.suit && cc.value === cardToSell.value
          );
          if (collectedIndex !== -1) {
            player.collectedCards[collectedIndex] = null;
          }
          console.log("handleSellCards: Sold card", {
            card: cardToSell,
            refund,
            position: boughtCard.position,
          });
        }
      });

      player.chips += totalRefund;
      console.log("handleSellCards: Updated player chips", {
        playerIndex: currentPlayerIndex,
        totalRefund,
        newChips: player.chips,
      });
      return newPlayers;
    });

    setCardOwners((prev) => {
      const newOwners = { ...prev };
      players[currentPlayerIndex].boughtCards.forEach((bc) => {
        const shouldRemove = cardsToSell.some(
          (cs) => cs.suit === bc.suit && cs.value === bc.value
        );
        if (shouldRemove) {
          delete newOwners[bc.position];
        }
      });
      console.log("handleSellCards: Updated cardOwners", { newOwners });
      return newOwners;
    });

    setShowSellModal(false);
    console.log("handleSellCards: Closed sell modal");
  };

  const endTurn = () => {
    console.log("endTurn: Ending turn for player", { currentPlayerIndex });
    setCurrentPlayerIndex((prev) => {
      const nextIndex = (prev + 1) % 4;
      console.log("endTurn: Set next player", { nextIndex });
      return nextIndex;
    });
  };

  const handleAutoPlay = () => {
    console.log("handleAutoPlay: Toggling auto-play", { isAutoPlaying });
    setIsAutoPlaying(!isAutoPlaying);
    console.log("handleAutoPlay: Set isAutoPlaying", {
      isAutoPlaying: !isAutoPlaying,
    });
  };

  const handleSpeedChange = (newSpeed: number) => {
    console.log("handleSpeedChange: Changing auto-play speed", { newSpeed });
    setAutoPlaySpeed(newSpeed);
    console.log("handleSpeedChange: Set autoPlaySpeed", {
      autoPlaySpeed: newSpeed,
    });
  };

  const handleReset = () => {
    console.log("handleReset: Resetting game state");
    setIsAutoPlaying(false);
    setGameStarted(false);
    setDealtCards({});
    setCardOwners({});
    setCurrentPlayerIndex(-1);
    setPlayerPositions([0, 16, 32, 48]);
    setIsMoving(false);
    setLandedCard(null);
    setPenaltyInfo(null);
    setJokerPositions([]);
    setMysteryCardPositions({});
    setLandedMysteryCard(null);
    setShowMysteryCardModal(false);
    setPlayers([
      {
        name: "Player 1 (♠)",
        chips: 10000,
        color: "#000000",
        position: "bottom",
        collectedCards: [],
        boughtCards: [],
        boardPosition: 0,
        suit: "♠",
        jokers: [],
      },
      {
        name: "Player 2 (♥)",
        chips: 10000,
        color: "#DC143C",
        position: "left",
        collectedCards: [],
        boughtCards: [],
        boardPosition: 16,
        suit: "♥",
        jokers: [],
      },
      {
        name: "Player 3 (♦)",
        chips: 10000,
        color: "#90EE90",
        position: "top",
        collectedCards: [],
        boughtCards: [],
        boardPosition: 32,
        suit: "♦",
        jokers: [],
      },
      {
        name: "Player 4 (♣)",
        chips: 10000,
        color: "#ADD8E6",
        position: "right",
        collectedCards: [],
        boughtCards: [],
        boardPosition: 48,
        suit: "♣",
        jokers: [],
      },
    ]);
    console.log("handleReset: Game state reset");
  };

  useEffect(() => {
    console.log("useEffect: Auto-play for landedCard", {
      isAutoPlaying,
      landedCard,
    });
    if (isAutoPlaying && landedCard) {
      const timer = setTimeout(() => {
        const player = players[currentPlayerIndex];
        const cardPrice = getCardPrice(landedCard.value);
        console.log("useEffect: Auto-play checking card purchase", {
          playerIndex: currentPlayerIndex,
          playerChips: player.chips,
          cardPrice,
        });

        if (player.chips >= cardPrice) {
          console.log("useEffect: Auto-play buying card");
          handleBuyCard();
        } else {
          console.log("useEffect: Auto-play cannot afford card, passing");
          setLandedCard(null);
          endTurn();
        }
      }, 1000);
      return () => {
        console.log("useEffect: Clearing landedCard timer");
        clearTimeout(timer);
      };
    }
  }, [isAutoPlaying, landedCard, currentPlayerIndex, players]);

  useEffect(() => {
    console.log("useEffect: Auto-play for penaltyInfo", {
      isAutoPlaying,
      penaltyInfo,
    });
    if (isAutoPlaying && penaltyInfo) {
      const timer = setTimeout(() => {
        console.log("useEffect: Auto-play paying penalty");
        handlePayPenalty();
      }, 1500);
      return () => {
        console.log("useEffect: Clearing penaltyInfo timer");
        clearTimeout(timer);
      };
    }
  }, [isAutoPlaying, penaltyInfo, currentPlayerIndex, players]);

  useEffect(() => {
    console.log("useEffect: Auto-play for mystery card", {
      isAutoPlaying,
      showMysteryCardModal,
      landedMysteryCard,
    });
    if (isAutoPlaying && showMysteryCardModal && landedMysteryCard) {
      const timer = setTimeout(() => {
        console.log("useEffect: Auto-play handling mystery card effect");
        handleMysteryCardEffect(landedMysteryCard);
      }, 2000);
      return () => {
        console.log("useEffect: Clearing mystery card timer");
        clearTimeout(timer);
      };
    }
  }, [isAutoPlaying, showMysteryCardModal, landedMysteryCard]);

  useEffect(() => {
    console.log("useEffect: Auto-play main loop", {
      isAutoPlaying,
      isMoving,
      landedCard,
      penaltyInfo,
      showMysteryCardModal,
      gameStarted,
    });
    if (
      isAutoPlaying &&
      !isMoving &&
      !landedCard &&
      !penaltyInfo &&
      !showMysteryCardModal &&
      gameStarted
    ) {
      const timeoutId = setTimeout(() => {
        console.log("useEffect: Auto-play idle, triggering next action");
      }, autoPlaySpeed);
      return () => {
        console.log("useEffect: Clearing auto-play idle timer");
        clearTimeout(timeoutId);
      };
    }
  }, [
    isAutoPlaying,
    isMoving,
    landedCard,
    penaltyInfo,
    showMysteryCardModal,
    autoPlaySpeed,
    gameStarted,
  ]);

  // The render part remains unchanged, but you can add logs here if you want to debug rendering issues
  console.log("LocalGame: Rendering component");

  return (
    <div
      className="w-screen h-screen flex items-center justify-center overflow-hidden"
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
      <div className="fixed top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => {
            console.log("Button: Toggling invert scroll", { invertScroll });
            setInvertScroll(!invertScroll);
          }}
          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-2 px-4 rounded-lg shadow-xl transition-all hover:scale-105 text-sm border-2 border-slate-500"
        >
          {invertScroll ? "🔄 Scroll: Inverted" : "🔄 Scroll: Normal"}
        </button>
        {gameStarted && (
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border-2 border-slate-500">
            <div className="text-white text-xs font-semibold mb-2">
              Auto Play
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  console.log("Button: Toggling auto-play");
                  handleAutoPlay();
                }}
                className={`${isAutoPlaying ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"} text-white font-bold py-2 px-4 rounded-lg shadow-xl transition-all hover:scale-105 text-sm border-2 ${isAutoPlaying ? "border-red-400" : "border-green-400"}`}
              >
                {isAutoPlaying ? "Stop" : "Start"}
              </button>
              <div className="text-white text-xs mb-1">Speed</div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    console.log("Button: Setting speed to 0.5x");
                    handleSpeedChange(2000);
                  }}
                  className={`${autoPlaySpeed === 2000 ? "bg-blue-600" : "bg-slate-600"} hover:bg-blue-500 text-white font-bold py-1 px-2 rounded text-xs transition-all`}
                >
                  0.5x
                </button>
                <button
                  onClick={() => {
                    console.log("Button: Setting speed to 1x");
                    handleSpeedChange(1000);
                  }}
                  className={`${autoPlaySpeed === 1000 ? "bg-blue-600" : "bg-slate-600"} hover:bg-blue-500 text-white font-bold py-1 px-2 rounded text-xs transition-all`}
                >
                  1x
                </button>
                <button
                  onClick={() => {
                    console.log("Button: Setting speed to 2x");
                    handleSpeedChange(500);
                  }}
                  className={`${autoPlaySpeed === 500 ? "bg-blue-600" : "bg-slate-600"} hover:bg-blue-500 text-white font-bold py-1 px-2 rounded text-xs transition-all`}
                >
                  2x
                </button>
              </div>
              <button
                onClick={() => {
                  console.log("Button: Resetting game");
                  handleReset();
                }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2 px-4 rounded-lg shadow-xl transition-all hover:scale-105 text-sm border-2 border-orange-400 mt-1"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
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
                background:
                  "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)",
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
                <img
                  src="/games/pokeropoly/images/pokeropoly.png"
                  alt="Pokeropoly"
                  className="w-[500px] h-auto drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                />
              </div>
            </div>
          </div>

          {Array.from({ length: totalSpaces }).map((_, index) => {
            console.log("Render: Processing board space", { index });
            const pos = getPropertyPosition(index);
            const card = getCard(index);
            const ownerIndex = cardOwners[index];
            const isOwned = ownerIndex !== undefined;
            const ownerColor = isOwned ? players[ownerIndex].color : undefined;
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
                  boxShadow: "none",
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
                        }}
                      >
                        {playersOnThisSpace.map((pIndex) => (
                          <div key={pIndex}>
                            <PlayerIcon
                              color={players[pIndex].color}
                              suit={players[pIndex].suit}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : getJokerPositions().includes(index) ? (
                  <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-yellow-600 overflow-hidden">
                    <img
                      src="/games/pokeropoly/images/wildcard.png"
                      alt="Wild Card"
                      className="w-[120%] h-[120%] object-contain" // CHANGED: larger and contained
                      onError={(e) =>
                        console.error(
                          "❌ Wild card image failed to load at position:",
                          index
                        )
                      }
                      onLoad={() =>
                        console.log(
                          "✅ Wild card image loaded at position:",
                          index
                        )
                      }
                    />
                  </div>
                ) : // Find this section in your render code where cards are displayed
                card.isQuestion ? (
                  <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-purple-600 to-purple-800 border-4 border-purple-500 overflow-hidden">
                    {(() => {
                      const isJoker = getJokerPositions().includes(index);
                      const mysteryCard = mysteryCardPositions[index];

                      console.log("🎯 Board tile render:", {
                        index,
                        isQuestion: card.isQuestion,
                        jokerPositions: getJokerPositions(),
                        isJokerPosition: isJoker,
                        mysteryCard: mysteryCard?.deck,
                      });

                      // ✅ Show different images based on card type
                      if (isJoker) {
                        return (
                          <img
                            src="/games/pokeropoly/images/wildcard.png"
                            alt="Wild Card"
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              console.error(
                                "❌ Wild card image failed to load:",
                                e
                              )
                            }
                            onLoad={() =>
                              console.log(
                                "✅ Wild card image loaded at position:",
                                index
                              )
                            }
                          />
                        );
                      } else if (mysteryCard) {
                        // Show image based on deck type
                        const imagePath =
                          mysteryCard.deck === "Bomb"
                            ? "/games/pokeropoly/images/bomb.png"
                            : "/games/pokeropoly/images/lightining.png"; // Note: your file is named "lightining.png"

                        return (
                          <img
                            src={imagePath}
                            alt={
                              mysteryCard.deck === "Bomb"
                                ? "Bomb Card"
                                : "Mystery Card"
                            }
                            className="w-[120%] h-[120%] object-contain" // CHANGED: larger and contained
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
                        // Fallback to question mark
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
                        }}
                      >
                        {playersOnThisSpace.map((pIndex) => (
                          <div key={pIndex}>
                            <PlayerIcon
                              color={players[pIndex].color}
                              suit={players[pIndex].suit}
                            />
                          </div>
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
                      className="text-xl font-bold leading-none" // CHANGED: sm → xl
                      style={{ color: isOwned ? "white" : suitColor }}
                    >
                      {card.value}
                    </div>
                    <div
                      className="text-4xl leading-none mt-1" // CHANGED: text-xl → text-4xl, mt-0.5 → mt-1
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
                          <div key={pIndex}>
                            <PlayerIcon
                              color={players[pIndex].color}
                              suit={players[pIndex].suit}
                            />
                          </div>
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
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
        <div className="text-sm font-semibold">Controls</div>
        <div className="text-xs opacity-75">Scroll: Spin Board</div>
        <div className="text-xs opacity-75 mt-1">64 Cards | 4 Suits</div>
      </div>
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
            console.log("Render: Rendering player profile", {
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
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotateZ(${pos.rotateZ}deg) rotateX(-30deg) translateZ(23px)`,
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
                      !showMysteryCardModal && (
                        <MiniSlotMachine
                          onRollComplete={(dice1, dice2) => {
                            console.log("MiniSlotMachine: Roll complete", {
                              dice1,
                              dice2,
                            });
                            const total = dice1 + dice2;
                            const hasPair = dice1 === dice2;
                            handleDrawFromShoe(total, hasPair);
                          }}
                          isVisible={true}
                          disabled={isMoving}
                        />
                      )}

                    {/* ADD THIS - Display dice total during movement */}
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
                            {detectPokerHand(player.collectedCards) && (
                              <div className="text-blue-300 text-xs mt-1">
                                Current:{" "}
                                {detectPokerHand(player.collectedCards)?.hand}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                console.log("Button: Buy card clicked");
                                handleBuyCard();
                              }}
                              disabled={
                                player.chips < getCardPrice(landedCard.value)
                              }
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4/5 rounded-lg shadow-xl transition-all hover:scale-105 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Buy
                            </button>
                            <button
                              onClick={() => {
                                console.log("Button: Auction card clicked");
                                setAuctionInfo({
                                  card: landedCard,
                                  position: playerPositions[currentPlayerIndex],
                                });
                              }}
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
                    {player.boughtCards.length > 0 ? (
                      <>
                        <div className="text-white/70 text-xs mb-1.5 font-semibold">
                          Owned Cards
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {player.boughtCards.map((card, cardIdx) => (
                            <div
                              key={cardIdx}
                              className="rounded border-2 shadow-sm w-9 h-12 flex flex-col items-center justify-center bg-white"
                              style={{ borderColor: getSuitColor(card.suit) }}
                            >
                              <div
                                className="text-[9px] font-bold leading-none"
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
      {/* Mystery Card Modal */}
      {showMysteryCardModal && landedMysteryCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-2xl shadow-2xl border-4 border-yellow-400 max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {landedMysteryCard.icon ||
                  (landedMysteryCard.deck === "Joker"
                    ? "🃏"
                    : landedMysteryCard.deck === "Bomb"
                      ? "💣"
                      : "❓")}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {landedMysteryCard.name ||
                  landedMysteryCard.title ||
                  "Unknown Card"}
              </h2>
              <p className="text-white/90 text-lg mb-6">
                {landedMysteryCard.description ||
                  landedMysteryCard.text ||
                  "No description available"}
              </p>
              <div className="bg-white/10 rounded-xl p-4 border-2 border-white/20 mb-6">
                {landedMysteryCard.effects.cb && (
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
                {landedMysteryCard.effects.mb && (
                  <div className="text-xl font-semibold text-blue-400">
                    Move {landedMysteryCard.effects.mb > 0 ? "forward" : "back"}{" "}
                    {Math.abs(landedMysteryCard.effects.mb)} spaces
                  </div>
                )}
                {landedMysteryCard.effects.mt && (
                  <div className="text-xl font-semibold text-blue-400">
                    Move to {landedMysteryCard.effects.mt}
                  </div>
                )}
                {landedMysteryCard.effects.dr && (
                  <div className="text-xl font-semibold text-yellow-400">
                    Draw {landedMysteryCard.effects.dr} card
                    {landedMysteryCard.effects.dr > 1 ? "s" : ""}
                  </div>
                )}
                {landedMysteryCard.effects.sk && (
                  <div className="text-xl font-semibold text-red-400">
                    Skip {landedMysteryCard.effects.sk} turn
                    {landedMysteryCard.effects.sk > 1 ? "s" : ""}
                  </div>
                )}
                {landedMysteryCard.effects.rt && (
                  <div className="text-xl font-semibold text-green-400">
                    Repeat your turn
                  </div>
                )}
                {landedMysteryCard.effects.ce && (
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
              </div>
              <button
                onClick={() => {
                  console.log(
                    "Button: Continue mystery card effect",
                    JSON.stringify({ landedMysteryCard }, null, 2)
                  );
                  handleMysteryCardEffect(landedMysteryCard);
                }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-8 rounded-lg shadow-xl transition-all hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {penaltyInfo && (
        <PenaltyModal
          card={penaltyInfo.card}
          penalty={penaltyInfo.penalty}
          hand={penaltyInfo.hand}
          handCards={penaltyInfo.handCards}
          ownerName={players[penaltyInfo.ownerIndex].name}
          onPayPenalty={() => {
            console.log("PenaltyModal: Pay penalty clicked");
            handlePayPenalty();
          }}
          onSellCards={() => {
            console.log("PenaltyModal: Sell cards clicked");
            setPenaltyInfo(null);
            setShowSellModal(true);
          }}
        />
      )}
      {auctionInfo && (
        <AuctionModal
          card={auctionInfo.card}
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          onClose={() => {
            console.log("AuctionModal: Closing auction");
            setAuctionInfo(null);
            setLandedCard(null);
            endTurn();
          }}
          onAuctionComplete={(winnerIndex, winningBid) => {
            console.log("AuctionModal: Auction completed", {
              winnerIndex,
              winningBid,
            });
            handleAuctionComplete(winnerIndex, winningBid);
          }}
        />
      )}
      {showSellModal && (
        <SellCardsModal
          playerCards={players[currentPlayerIndex].boughtCards}
          onSellCards={(cards) => {
            console.log("SellCardsModal: Selling cards", { cards });
            handleSellCards(cards);
          }}
          onClose={() => {
            console.log("SellCardsModal: Closing modal");
            setShowSellModal(false);
          }}
        />
      )}
      {showRules && (
        <RulesPanel
          onClose={() => {
            console.log("RulesPanel: Closing rules");
            setShowRules(false);
          }}
        />
      )}
    </div>
  );
}

export default LocalGame;
