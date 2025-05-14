import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BettingPanelProps {
  onPlaceBet: (amount: number, targetMultiplier: number) => void;
}

export default function BettingPanel({ onPlaceBet }: BettingPanelProps) {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2);
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };
  
  const handleTargetMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1.01) {
      setTargetMultiplier(value);
    }
  };
  
  const handleQuickMultiplierSelect = (multiplier: number) => {
    setTargetMultiplier(multiplier);
  };
  
  const handlePlaceBet = () => {
    if (betAmount <= 0) {
      return;
    }
    
    if (targetMultiplier < 1.01) {
      return;
    }
    
    onPlaceBet(betAmount, targetMultiplier);
  };
  
  return (
    <Card className="bg-neutral shadow-lg">
      <CardContent className="p-6">
        <h3 className="font-heading font-bold mb-4">Place Your Bet</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Bet Amount</label>
          <div className="relative">
            <Input
              type="number"
              className="w-full bg-background border border-gray-700 rounded-lg py-3 px-4 pr-12 font-mono text-lg"
              value={betAmount}
              onChange={handleBetAmountChange}
              min={1}
              step={1}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-accent font-medium">$</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Auto Cashout At</label>
          <div className="relative">
            <Input
              type="number"
              className="w-full bg-background border border-gray-700 rounded-lg py-3 px-4 pr-12 font-mono text-lg"
              value={targetMultiplier}
              onChange={handleTargetMultiplierChange}
              min={1.01}
              step={0.01}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-accent font-medium">x</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-6">
          <Button 
            variant="outline" 
            className="bg-background hover:bg-primary hover:bg-opacity-20 border border-gray-700 rounded-lg py-2 font-mono text-sm"
            onClick={() => handleQuickMultiplierSelect(1.5)}
          >
            1.5x
          </Button>
          <Button 
            variant="outline" 
            className="bg-background hover:bg-primary hover:bg-opacity-20 border border-gray-700 rounded-lg py-2 font-mono text-sm"
            onClick={() => handleQuickMultiplierSelect(2)}
          >
            2x
          </Button>
          <Button 
            variant="outline" 
            className="bg-background hover:bg-primary hover:bg-opacity-20 border border-gray-700 rounded-lg py-2 font-mono text-sm"
            onClick={() => handleQuickMultiplierSelect(5)}
          >
            5x
          </Button>
          <Button 
            variant="outline" 
            className="bg-background hover:bg-primary hover:bg-opacity-20 border border-gray-700 rounded-lg py-2 font-mono text-sm"
            onClick={() => handleQuickMultiplierSelect(10)}
          >
            10x
          </Button>
        </div>
        
        <Button 
          className="bet-button w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          onClick={handlePlaceBet}
        >
          Place Bet
        </Button>
      </CardContent>
    </Card>
  );
}
