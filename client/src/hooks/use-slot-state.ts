import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./use-websocket";
import { 
  SlotSymbol, 
  SlotBet, 
  SlotResult, 
  SlotStats 
} from "@/types/game";

export function useSlotState() {
  const { socket, connected, sendMessage } = useWebSocket();
  
  // State
  const [symbols, setSymbols] = useState<SlotSymbol[]>([]);
  const [slotResult, setSlotResult] = useState<SlotResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [recentBets, setRecentBets] = useState<SlotBet[]>([]);
  const [stats, setStats] = useState<SlotStats>({
    playersOnline: 0,
    totalBets: 0,
    totalWinnings: 0,
    highestWin: 0
  });
  
  // Play slot machine
  const playSlot = useCallback((amount: number) => {
    if (!connected || isSpinning) return;
    
    setIsSpinning(true);
    sendMessage({
      type: 'play_slot',
      amount
    });
    
    // Auto-reset after 10 seconds in case of network issues
    setTimeout(() => {
      setIsSpinning(false);
    }, 10000);
  }, [connected, isSpinning, sendMessage]);
  
  // Request stats
  const requestStats = useCallback(() => {
    if (!connected) return;
    
    sendMessage({
      type: 'get_slot_stats'
    });
  }, [connected, sendMessage]);
  
  // Request recent bets
  const requestRecentBets = useCallback(() => {
    if (!connected) return;
    
    sendMessage({
      type: 'get_recent_slot_bets'
    });
  }, [connected, sendMessage]);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'symbols_list':
            setSymbols(data.symbols);
            break;
            
          case 'slot_result':
            setSlotResult(data.result);
            setIsSpinning(false);
            // Add bet to recent bets if not already included
            setRecentBets(prev => {
              const exists = prev.some(bet => bet.id === data.bet.id);
              if (exists) return prev;
              return [data.bet, ...prev].slice(0, 10); // Keep only 10 most recent
            });
            break;
            
          case 'slot_stats':
            setStats(data.stats);
            break;
            
          case 'recent_slot_bets':
            setRecentBets(data.bets);
            break;
            
          case 'slot_played':
            // Another player played the slot
            requestStats(); // Refresh stats
            break;
            
          case 'connected':
            // Request initial data
            requestStats();
            requestRecentBets();
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, requestStats, requestRecentBets]);
  
  // Request stats and recent bets when connection status changes
  useEffect(() => {
    if (connected) {
      requestStats();
      requestRecentBets();
    }
  }, [connected, requestStats, requestRecentBets]);
  
  return {
    connected,
    symbols,
    slotResult,
    isSpinning,
    recentBets,
    stats,
    playSlot,
    requestStats,
    requestRecentBets
  };
}