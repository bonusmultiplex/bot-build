import React, { useState, useEffect } from "react";
import { useSlotState } from "@/hooks/use-slot-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AlertCircle, Award, Users, History, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const DEFAULT_BET_AMOUNT = 10;

export default function SlotMachine() {
  const {
    connected,
    symbols,
    slotResult,
    isSpinning,
    recentBets,
    stats,
    playSlot,
  } = useSlotState();

  const [betAmount, setBetAmount] = useState(DEFAULT_BET_AMOUNT);
  const [displayedSymbols, setDisplayedSymbols] = useState<string[]>(Array(9).fill(""));
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  // Animation for spinning and results
  useEffect(() => {
    if (isSpinning) {
      // Start spinning animation
      const interval = setInterval(() => {
        const randomSymbols = Array(9).fill(0).map(() => {
          const randomIndex = Math.floor(Math.random() * symbols.length);
          return symbols[randomIndex]?.symbol || "";
        });
        setDisplayedSymbols(randomSymbols);
      }, 100);

      return () => clearInterval(interval);
    } else if (slotResult) {
      // Show result
      setDisplayedSymbols(slotResult.symbols);
      
      // Show win animation if there's a win
      if (slotResult.winnings > 0) {
        setShowWinAnimation(true);
        setTimeout(() => setShowWinAnimation(false), 3000);
      }
    }
  }, [isSpinning, slotResult, symbols]);

  // Handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };

  // Handle spin button click
  const handleSpin = () => {
    playSlot(betAmount);
  };

  // Get image path for a symbol
  const getSymbolImage = (symbolName: string) => {
    const symbol = symbols.find(s => s.symbol === symbolName);
    return symbol?.imagePath || "";
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Slot Machine</h2>
        <Badge 
          variant={connected ? "default" : "destructive"}
          className="text-sm py-1"
        >
          {connected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      {/* Slot machine display */}
      <Card className={cn(
        "p-6 bg-gradient-to-b from-gray-800 to-gray-900 border-2",
        showWinAnimation && "border-yellow-500 animate-pulse"
      )}>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {displayedSymbols.map((symbol, index) => (
            <div 
              key={index} 
              className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden"
            >
              {symbol && (
                <img 
                  src={getSymbolImage(symbol)} 
                  alt={symbol}
                  className="w-full h-full object-contain p-2"
                />
              )}
            </div>
          ))}
        </div>

        {slotResult && slotResult.winnings > 0 && (
          <div className={cn(
            "text-center p-2 rounded-md bg-gradient-to-r from-yellow-500 to-amber-500 mb-4",
            showWinAnimation && "animate-bounce"
          )}>
            <span className="text-xl font-bold">WIN! ${slotResult.winnings.toFixed(2)}</span>
          </div>
        )}

        <div className="flex space-x-2">
          <Input
            type="number"
            value={betAmount}
            onChange={handleBetAmountChange}
            min={1}
            disabled={isSpinning}
            className="bg-gray-700"
          />
          <Button 
            onClick={handleSpin} 
            disabled={!connected || isSpinning}
            size="lg"
            className={cn(
              "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all",
              isSpinning && "animate-pulse"
            )}
          >
            {isSpinning ? "Spinning..." : "Spin"}
          </Button>
        </div>
      </Card>

      {/* Stats and recent bets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats */}
        <Card className="p-4">
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <Award className="mr-2" /> Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> Players Online:</span>
              <span className="font-medium">{stats.playersOnline}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center"><History className="w-4 h-4 mr-1" /> Total Bets:</span>
              <span className="font-medium">{stats.totalBets}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> Total Winnings:</span>
              <span className="font-medium">${stats.totalWinnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> Highest Win:</span>
              <span className="font-medium">${stats.highestWin.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Recent bets */}
        <Card className="p-4">
          <h3 className="text-xl font-bold mb-3">Recent Bets</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recentBets.length > 0 ? (
              recentBets.map((bet) => (
                <div key={bet.id} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{bet.username}</span>
                    <span>{formatDistanceToNow(new Date(bet.timestamp), { addSuffix: true })}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between">
                    <span>Bet: ${bet.amount}</span>
                    <span className={bet.result && bet.result.winnings > 0 
                      ? "text-green-500 font-bold" 
                      : "text-red-500"
                    }>
                      {bet.result 
                        ? (bet.result.winnings > 0 
                          ? `Won $${bet.result.winnings.toFixed(2)}` 
                          : "Lost") 
                        : "Pending"
                      }
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-gray-500">No recent bets</div>
            )}
          </div>
        </Card>
      </div>

      {/* Symbol information */}
      <Card className="p-4">
        <h3 className="text-xl font-bold mb-3">Symbol Information</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {symbols.map((symbol) => (
            <div key={symbol.id} className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              <div className="w-12 h-12 mb-2">
                <img src={symbol.imagePath} alt={symbol.name} className="w-full h-full object-contain" />
              </div>
              <span className="font-medium">{symbol.name}</span>
              <span className="text-sm">x{symbol.multiplier}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}