import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GameState } from "@/types/game";
import MultiplierHistory from "./multiplier-history";

interface GameDisplayProps {
  gameState: GameState;
  gameId: number;
  currentMultiplier: number;
  timeRemaining: number;
  multiplierHistory: number[];
}

export default function GameDisplay({
  gameState,
  gameId,
  currentMultiplier,
  timeRemaining,
  multiplierHistory,
}: GameDisplayProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // Update progress bar based on multiplier
  useEffect(() => {
    if (progressBarRef.current) {
      const progress = Math.min(100, (currentMultiplier / 10) * 100);
      progressBarRef.current.style.width = `${progress}%`;
    }
  }, [currentMultiplier]);
  
  const getStateDisplay = () => {
    switch (gameState) {
      case GameState.WAITING:
        return {
          text: "WAITING",
          bgClass: "bg-gray-500"
        };
      case GameState.STARTING:
        return {
          text: "STARTING",
          bgClass: "bg-gray-500"
        };
      case GameState.IN_PROGRESS:
        return {
          text: "IN PROGRESS",
          bgClass: "bg-accent"
        };
      case GameState.CRASHED:
        return {
          text: "CRASHED",
          bgClass: "bg-destructive"
        };
      case GameState.COMPLETED:
        return {
          text: "COMPLETED",
          bgClass: "bg-success"
        };
    }
  };
  
  const stateDisplay = getStateDisplay();
  
  const getMultiplierColor = () => {
    if (currentMultiplier >= 10) return "text-destructive animate-pulse";
    if (currentMultiplier >= 5) return "text-success";
    if (currentMultiplier >= 2) return "text-accent";
    return "";
  };
  
  return (
    <>
      <Card className="bg-neutral shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading font-bold text-lg">
              <span className="text-accent">LIVE</span> Game #{gameId}
            </h2>
            <div className="relative flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-primary pulse-glow">
                <span className="font-mono font-semibold">{timeRemaining}s</span>
              </div>
              <span className="absolute -bottom-6 text-xs text-gray-400 whitespace-nowrap">
                {gameState === GameState.WAITING ? "Next round" : "Time left"}
              </span>
            </div>
          </div>
          
          <div className="w-full h-64 sm:h-80 bg-background rounded-lg flex items-center justify-center overflow-hidden relative mb-6">
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full bg-opacity-90 ${stateDisplay.bgClass} text-xs font-bold text-gray-900`}>
              {stateDisplay.text}
            </div>
            
            <div className={`text-center ${gameState === GameState.STARTING ? "scale-in" : ""}`}>
              <div className={`multiplier-value text-5xl sm:text-6xl md:text-7xl font-heading font-extrabold transition-all duration-300 ease-in-out ${getMultiplierColor()}`}>
                <span className="font-mono">{currentMultiplier.toFixed(2)}</span>
                <span className="text-accent">x</span>
              </div>
              <p className="text-gray-400 mt-2 text-sm">Current Multiplier</p>
              
              <div className="w-full max-w-md mt-6 mx-auto">
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                  <div 
                    ref={progressBarRef} 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {gameState === GameState.STARTING && (
            <div className="rounded-lg bg-primary bg-opacity-10 border border-primary border-opacity-30 p-4 text-center text-sm">
              <p>Round starting in <span className="font-mono font-semibold">{timeRemaining}s</span>. Place your bets!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <MultiplierHistory history={multiplierHistory} />
    </>
  );
}
