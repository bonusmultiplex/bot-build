import { useState, useCallback } from "react";
import { GameState, GameStats, Bet } from "@/types/game";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(GameState.WAITING);
  const [gameId, setGameId] = useState<number>(1);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
  const [timeRemaining, setTimeRemaining] = useState<number>(10);
  const [multiplierHistory, setMultiplierHistory] = useState<number[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    highestMultiplierToday: 26.81,
    averageMultiplier: 3.21,
    totalGamesToday: 0,
    playersOnline: 0
  });
  const [recentBets, setRecentBets] = useState<Bet[]>([]);
  
  const updateGameState = useCallback((data: any) => {
    if (data.type === 'game_state') {
      setGameState(data.state);
      
      if (data.gameId) {
        setGameId(data.gameId);
      }
      
      if (data.timeRemaining !== undefined) {
        setTimeRemaining(data.timeRemaining);
      }
    }
    else if (data.type === 'multiplier_update') {
      setCurrentMultiplier(data.multiplier);
    }
    else if (data.type === 'game_crash' || data.type === 'game_complete') {
      // Add to history
      setMultiplierHistory(prev => [...prev, data.finalMultiplier]);
    }
    else if (data.type === 'stats_update') {
      setGameStats(data.stats);
    }
    else if (data.type === 'bet_placed') {
      setRecentBets(prev => [data.bet, ...prev].slice(0, 10)); // Keep last 10 bets
    }
    else if (data.type === 'bet_result') {
      // Update the bet in recent bets
      setRecentBets(prev => 
        prev.map(bet => 
          bet.id === data.betId 
            ? { 
                ...bet, 
                profit: data.profit, 
                cashoutMultiplier: data.cashoutMultiplier 
              } 
            : bet
        )
      );
    }
    else if (data.type === 'reset') {
      setGameState(GameState.WAITING);
      setCurrentMultiplier(1.00);
    }
  }, []);
  
  return {
    gameState,
    gameId,
    currentMultiplier,
    timeRemaining,
    multiplierHistory,
    gameStats,
    recentBets,
    updateGameState
  };
}
