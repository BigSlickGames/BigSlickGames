export interface Card {
  suit: string;
  value: string;
  position?: number;
  owner?: string;
  price?: number;
}

export interface TradeOffer {
  cards: Card[];
  money: number;
}

export interface TradeRequest {
  cards: Card[];
  money: number;
}

export interface Trade {
  id: string;
  from_player_id: string;
  to_player_id: string;
  from_player_name: string;
  to_player_name: string;
  offer_cards: Card[];
  offer_money: number;
  request_cards: Card[];
  request_money: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  rejection_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface PlayerRejectionTracking {
  id: string;
  player_id: string;
  rejection_count: number;
  last_rejection_at: string | null;
  dice_penalty_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradeSystemConfig {
  maxRejections: number;
  tradeExpiryMinutes: number;
  enableNotifications: boolean;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  cards: Card[];
  color: string;
}

export interface TradeNotification {
  trade: Trade;
  isNew: boolean;
}

export const DEFAULT_TRADE_CONFIG: TradeSystemConfig = {
  maxRejections: 3,
  tradeExpiryMinutes: 5,
  enableNotifications: true,
};
