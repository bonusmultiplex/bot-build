import { useState, useEffect } from "react";
import { Dice5 } from "lucide-react";
import ConnectionStatus from "@/components/connection-status";
import GameDisplay from "@/components/game-display";
import BettingPanel from "@/components/betting-panel";
import GameStatsDisplay from "@/components/game-stats";
import RecentBets from "@/components/recent-bets";
import { useWebSocket } from "@/hooks/use-websocket";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import { GameState } from "@/types/game";

export default function Home() {
  const { toast } = useToast();
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const {
    gameState,
    gameId,
    currentMultiplier,
    timeRemaining,
    multiplierHistory,
    gameStats,
    recentBets,
    updateGameState
  } = useGameState();

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        updateGameState(data);
        
        // Show toast notifications for important game events
        if (data.type === 'crash') {
          toast({
            title: "Game Crashed",
            description: `Game crashed at ${data.multiplier.toFixed(2)}x`,
            variant: "destructive",
          });
        } else if (data.type === 'connected') {
          toast({
            title: "Connected",
            description: "Successfully connected to game server",
          });
        } else if (data.type === 'reconnected') {
          toast({
            title: "Reconnected",
            description: "Connection restored to game server",
          });
        }
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    }
  }, [lastMessage, toast, updateGameState]);

  const handlePlaceBet = (amount: number, targetMultiplier: number) => {
    if (!isConnected) {
      toast({
        title: "Cannot place bet",
        description: "You are not connected to the game server",
        variant: "destructive",
      });
      return;
    }
    
    if (gameState !== GameState.WAITING) {
      toast({
        title: "Cannot place bet",
        description: "You can only place bets before a round starts",
        variant: "destructive",
      });
      return;
    }

    sendMessage(JSON.stringify({
      type: 'place_bet',
      amount,
      targetMultiplier
    }));
    
    toast({
      title: "Bet Placed",
      description: `Placed $${amount} bet with ${targetMultiplier}x target`,
    });
  };

  return (
    <div className="text-white bg-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-neutral py-4 px-4 sm:px-6 sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Dice5 className="text-accent h-6 w-6" />
            <h1 className="font-heading font-bold text-xl text-white">MultiplyWin</h1>
          </div>
          
          <ConnectionStatus isConnected={isConnected} />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Game Display (3/5 width on large screens, full width on mobile) */}
          <div className="lg:col-span-3 space-y-6">
            <GameDisplay 
              gameState={gameState}
              gameId={gameId}
              currentMultiplier={currentMultiplier}
              timeRemaining={timeRemaining}
              multiplierHistory={multiplierHistory}
            />
          </div>
          
          {/* Betting Panel & Stats (2/5 width on large screens, full width on mobile) */}
          <div className="lg:col-span-2 space-y-6">
            <BettingPanel onPlaceBet={handlePlaceBet} />
            <GameStatsDisplay stats={gameStats} />
            <RecentBets bets={recentBets} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral py-4 px-4 sm:px-6 border-t border-gray-800 mt-8">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MultiplyWin. All rights reserved. 18+ Gamble responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
