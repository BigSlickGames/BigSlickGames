import { supabase } from "../../../lib/supabase";

export interface Room {
  id: string;
  room_code: string;
  host_user_id: string;
  status: "waiting" | "playing" | "finished";
  max_players: number;
  current_players: number;
  game_state: any;
  created_at: string;
  updated_at: string;
  current_turn_player_index?: number;
  turn_number?: number;
  game_phase?: string;
}

export interface RoomPlayer {
  eliminated: boolean;
  id: string;
  room_id: string;
  user_id: string;
  player_index: number;
  player_name: string;
  player_color: string;
  player_suit: string;
  chips: number;
  board_position: number;
  collected_cards: any[];
  bought_cards: any[];
  is_ready: boolean;
  is_connected: boolean;
  joined_at: string;
}

const PLAYER_COLORS = ["#000000", "#DC143C", "#90EE90", "#ADD8E6"];
const PLAYER_SUITS = ["♠", "♥", "♦", "♣"];

const dealCards = (): { [key: number]: { suit: string; value: string } } => {
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
  suits.forEach((suit) =>
    values.forEach((value) => fullDeck.push({ suit, value }))
  );

  for (let i = fullDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
  }

  const newDealtCards: { [key: number]: { suit: string; value: string } } = {};
  let deckIndex = 0;

  for (let i = 0; i < 64; i++) {
    if (i === 0 || i === 16 || i === 32 || i === 48) continue;
    if ([5, 11, 21, 27, 37, 43, 53, 59].includes(i)) continue;
    newDealtCards[i] = fullDeck[deckIndex++];
  }

  return newDealtCards;
};

const getJokerPositions = (): number[] => {
  const questionMarkPositions = [5, 11, 21, 27, 37, 43, 53, 59];
  const shuffled = [...questionMarkPositions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
};

export class RoomService {
  // Add this helper function OUTSIDE the class, at the top:

  // THEN update createRoom to:
  static async createRoom(
    hostUserId: string,
    maxPlayers: number = 4
  ): Promise<Room | null> {
    try {
      // ✅ GENERATE CODE INLINE HERE
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let roomCode = "";
      for (let i = 0; i < 6; i++) {
        roomCode += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      const { data, error } = await supabase
        .from("poker_opoly_rooms")
        .insert({
          room_code: roomCode,
          host_user_id: hostUserId,
          max_players: maxPlayers,
          status: "waiting",
          current_players: 0,
          game_state: {},
          game_phase: "WAITING",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating room:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in createRoom:", error);
      return null;
    }
  }

  static async joinRoom(
    roomCode: string,
    userId: string,
    username: string
  ): Promise<{
    success: boolean;
    room?: Room;
    player?: RoomPlayer;
    error?: string;
  }> {
    try {
      const { data: room, error: roomError } = await supabase
        .from("poker_opoly_rooms")
        .select("*")
        .eq("room_code", roomCode)
        .single();

      if (roomError || !room) {
        return { success: false, error: "Room not found" };
      }

      if (room.current_players >= room.max_players) {
        return { success: false, error: "Room is full" };
      }

      if (room.status === "playing") {
        return { success: false, error: "Game already started" };
      }

      const { data: existingPlayer } = await supabase
        .from("poker_opoly_players")
        .select("*")
        .eq("room_id", room.id)
        .eq("user_id", userId)
        .single();

      if (existingPlayer) {
        return { success: true, room, player: existingPlayer };
      }

      // ✅ NEW: Fetch user's wallet chips
      const { data: wallet } = await supabase
        .from("user_wallet")
        .select("chips")
        .eq("user_id", userId)
        .single();

      const playerChips = wallet?.chips ?? 10000; // Default to 10000 if wallet not found

      const { data: currentPlayers } = await supabase
        .from("poker_opoly_players")
        .select("player_index")
        .eq("room_id", room.id)
        .order("player_index");

      let playerIndex = 0;
      const takenIndices = new Set(
        currentPlayers?.map((p) => p.player_index) || []
      );
      while (takenIndices.has(playerIndex) && playerIndex < room.max_players) {
        playerIndex++;
      }

      const { data: newPlayer, error: playerError } = await supabase
        .from("poker_opoly_players")
        .insert({
          room_id: room.id,
          user_id: userId,
          player_index: playerIndex,
          player_name: username,
          player_color: PLAYER_COLORS[playerIndex],
          player_suit: PLAYER_SUITS[playerIndex],
          chips: playerChips, // ✅ CHANGED: Use wallet chips instead of fixed 10000
          board_position: playerIndex * 16,
          collected_cards: [],
          bought_cards: [],
          is_ready: false,
          is_connected: true,
        })
        .select()
        .single();

      if (playerError) {
        return { success: false, error: "Failed to join room" };
      }

      await supabase
        .from("poker_opoly_rooms")
        .update({ current_players: room.current_players + 1 })
        .eq("id", room.id);

      return { success: true, room, player: newPlayer };
    } catch (error) {
      console.error("Error in joinRoom:", error);
      return { success: false, error: "An error occurred" };
    }
  }

  static async leaveRoom(roomCode: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("leave_room", {
        room_code: roomCode,
        player_id: userId,
      });

      if (error) {
        console.error("Error leaving room:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return false;
      }

      console.log("✅ Successfully left room");
      return true;
    } catch (error) {
      console.error("Unexpected error in leaveRoom:", error);
      return false;
    }
  }

  static async getRoom(roomId: string): Promise<Room | null> {
    try {
      const { data, error } = await supabase
        .from("poker_opoly_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      return error ? null : data;
    } catch (error) {
      return null;
    }
  }

  static async getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
    try {
      const { data, error } = await supabase
        .from("poker_opoly_players")
        .select("*")
        .eq("room_id", roomId)
        .order("player_index");

      return error ? [] : data || [];
    } catch (error) {
      return [];
    }
  }

  static async setPlayerReady(
    roomId: string,
    userId: string,
    isReady: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("poker_opoly_players")
        .update({ is_ready: isReady })
        .eq("room_id", roomId)
        .eq("user_id", userId);

      return !error;
    } catch (error) {
      return false;
    }
  }

  static async startGame(roomId: string, hostUserId: string): Promise<boolean> {
    try {
      const { data: room } = await supabase
        .from("poker_opoly_rooms")
        .select("host_user_id")
        .eq("id", roomId)
        .single();

      if (!room || room.host_user_id !== hostUserId) return false;

      const dealtCards = dealCards();
      const jokerPositions = getJokerPositions();

      const { error } = await supabase
        .from("poker_opoly_rooms")
        .update({
          status: "playing",
          game_state: { dealtCards, jokerPositions },
          game_phase: "PLAYING",
          current_turn_player_index: 0,
          turn_number: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId);

      console.log(
        "🎮 Game started with",
        Object.keys(dealtCards).length,
        "cards"
      );
      return !error;
    } catch (error) {
      console.error("Error starting game:", error);
      return false;
    }
  }

  // ✅ FIXED: BROADCAST (REAL-TIME)
  static async broadcastAction(
    roomId: string,
    userId: string,
    playerIndex: number,
    actionType: string,
    actionData: any
  ): Promise<boolean> {
    const channel = supabase.channel(`room:${roomId}`);

    const payload = {
      player_index: playerIndex,
      action_type: actionType,
      action_data: actionData,
    };

    console.log("📤 BROADCASTING:", actionType, "by player", playerIndex);

    const { error } = await channel.send({
      type: "broadcast",
      event: "game_action",
      payload,
    });

    return !error;
  }

  static subscribeToRoom(roomId: string, callback: (room: Room) => void) {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "poker_opoly_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => callback(payload.new as Room)
      )
      .subscribe();

    return channel;
  }

  static subscribeToRoomPlayers(
    roomId: string,
    callback: (players: RoomPlayer[]) => void
  ) {
    // Keep track of current players
    let currentPlayers: RoomPlayer[] = [];

    // Initial fetch
    RoomService.getRoomPlayers(roomId).then((players) => {
      currentPlayers = players;
      callback(players);
    });

    const channel = supabase
      .channel(`room_players:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "poker_opoly_players",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("➕ PLAYER JOINED:", payload.new);
          currentPlayers = await RoomService.getRoomPlayers(roomId);
          callback(currentPlayers);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "poker_opoly_players",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("🔄 PLAYER UPDATED:", payload.new);
          currentPlayers = await RoomService.getRoomPlayers(roomId);
          callback(currentPlayers);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "poker_opoly_players",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("➖ PLAYER LEFT:", payload.old);
          currentPlayers = await RoomService.getRoomPlayers(roomId);
          callback(currentPlayers);
        }
      )
      .subscribe();

    return channel;
  }

  // ✅ FIXED: LISTEN TO BROADCAST
  static subscribeToActions(roomId: string, callback: (action: any) => void) {
    console.log("🔌 SUBSCRIBING TO ACTIONS:", roomId);

    const channel = supabase.channel(`room:${roomId}`);

    channel
      .on(
        "broadcast",
        {
          event: "game_action",
        },
        (payload) => {
          console.log("🔥 ACTION RECEIVED:", payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log("📡 SUBSCRIPTION STATUS:", status);
      });

    return channel;
  }

  static async getAvailableRooms(): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from("poker_opoly_rooms")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: false })
        .limit(10);

      return error ? [] : data || [];
    } catch (error) {
      return [];
    }
  }
}
