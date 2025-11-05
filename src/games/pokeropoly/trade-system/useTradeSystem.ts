import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Trade, PlayerRejectionTracking, Card, TradeSystemConfig } from './TradeTypes';
import { DEFAULT_TRADE_CONFIG } from './TradeTypes';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export function useTradeSystem(currentPlayerId: string, config: TradeSystemConfig = DEFAULT_TRADE_CONFIG) {
  const [pendingTrades, setPendingTrades] = useState<Trade[]>([]);
  const [incomingTrades, setIncomingTrades] = useState<Trade[]>([]);
  const [outgoingTrades, setOutgoingTrades] = useState<Trade[]>([]);
  const [rejectionTracking, setRejectionTracking] = useState<PlayerRejectionTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .or(`from_player_id.eq.${currentPlayerId},to_player_id.eq.${currentPlayerId}`)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const incoming = data.filter(t => t.to_player_id === currentPlayerId && t.status === 'pending');
        const outgoing = data.filter(t => t.from_player_id === currentPlayerId && t.status === 'pending');
        const pending = data.filter(t => t.status === 'pending');

        setIncomingTrades(incoming);
        setOutgoingTrades(outgoing);
        setPendingTrades(pending);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  }, [currentPlayerId]);

  const fetchRejectionTracking = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('player_rejection_tracking')
        .select('*')
        .eq('player_id', currentPlayerId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setRejectionTracking(data);
      } else {
        const { data: newData, error: insertError } = await supabase
          .from('player_rejection_tracking')
          .insert({
            player_id: currentPlayerId,
            rejection_count: 0,
            dice_penalty_active: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setRejectionTracking(newData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rejection tracking');
    }
  }, [currentPlayerId]);

  const createTrade = async (
    toPlayerId: string,
    toPlayerName: string,
    fromPlayerName: string,
    offerCards: Card[],
    offerMoney: number,
    requestCards: Card[],
    requestMoney: number
  ): Promise<Trade | null> => {
    if (!supabase) {
      setError('Supabase not initialized');
      return null;
    }

    try {
      setLoading(true);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + config.tradeExpiryMinutes);

      const { data, error: insertError } = await supabase
        .from('trades')
        .insert({
          from_player_id: currentPlayerId,
          to_player_id: toPlayerId,
          from_player_name: fromPlayerName,
          to_player_name: toPlayerName,
          offer_cards: offerCards,
          offer_money: offerMoney,
          request_cards: requestCards,
          request_money: requestMoney,
          status: 'pending',
          rejection_count: 0,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchTrades();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trade');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const acceptTrade = async (tradeId: string): Promise<boolean> => {
    if (!supabase) {
      setError('Supabase not initialized');
      return false;
    }

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('trades')
        .update({ status: 'accepted' })
        .eq('id', tradeId);

      if (updateError) throw updateError;

      await fetchTrades();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept trade');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectTrade = async (tradeId: string, fromPlayerId: string): Promise<boolean> => {
    if (!supabase) {
      setError('Supabase not initialized');
      return false;
    }

    try {
      setLoading(true);

      const { data: trade, error: fetchError } = await supabase
        .from('trades')
        .select('rejection_count')
        .eq('id', tradeId)
        .single();

      if (fetchError) throw fetchError;

      const newRejectionCount = (trade?.rejection_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('trades')
        .update({
          status: 'rejected',
          rejection_count: newRejectionCount,
        })
        .eq('id', tradeId);

      if (updateError) throw updateError;

      const { data: tracking, error: trackingFetchError } = await supabase
        .from('player_rejection_tracking')
        .select('*')
        .eq('player_id', fromPlayerId)
        .maybeSingle();

      if (trackingFetchError) throw trackingFetchError;

      const totalRejections = (tracking?.rejection_count || 0) + 1;
      const penaltyActive = totalRejections >= config.maxRejections;

      if (tracking) {
        const { error: trackingUpdateError } = await supabase
          .from('player_rejection_tracking')
          .update({
            rejection_count: totalRejections,
            last_rejection_at: new Date().toISOString(),
            dice_penalty_active: penaltyActive,
          })
          .eq('player_id', fromPlayerId);

        if (trackingUpdateError) throw trackingUpdateError;
      } else {
        const { error: trackingInsertError } = await supabase
          .from('player_rejection_tracking')
          .insert({
            player_id: fromPlayerId,
            rejection_count: totalRejections,
            last_rejection_at: new Date().toISOString(),
            dice_penalty_active: penaltyActive,
          });

        if (trackingInsertError) throw trackingInsertError;
      }

      await fetchTrades();
      await fetchRejectionTracking();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject trade');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelTrade = async (tradeId: string): Promise<boolean> => {
    if (!supabase) {
      setError('Supabase not initialized');
      return false;
    }

    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('from_player_id', currentPlayerId);

      if (deleteError) throw deleteError;

      await fetchTrades();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel trade');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearDicePenalty = async (playerId: string): Promise<boolean> => {
    if (!supabase) {
      setError('Supabase not initialized');
      return false;
    }

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('player_rejection_tracking')
        .update({
          rejection_count: 0,
          dice_penalty_active: false,
        })
        .eq('player_id', playerId);

      if (updateError) throw updateError;

      await fetchRejectionTracking();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear penalty');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cleanupExpiredTrades = async (): Promise<void> => {
    if (!supabase) return;

    try {
      const { error: updateError } = await supabase
        .from('trades')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString());

      if (updateError) throw updateError;

      await fetchTrades();
    } catch (err) {
      console.error('Failed to cleanup expired trades:', err);
    }
  };

  useEffect(() => {
    fetchTrades();
    fetchRejectionTracking();

    const interval = setInterval(() => {
      cleanupExpiredTrades();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchTrades, fetchRejectionTracking]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('trade-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `to_player_id=eq.${currentPlayerId}`,
        },
        () => {
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPlayerId, fetchTrades]);

  return {
    pendingTrades,
    incomingTrades,
    outgoingTrades,
    rejectionTracking,
    loading,
    error,
    createTrade,
    acceptTrade,
    rejectTrade,
    cancelTrade,
    clearDicePenalty,
    refreshTrades: fetchTrades,
    refreshRejectionTracking: fetchRejectionTracking,
  };
}
