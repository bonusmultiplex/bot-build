import { Card, CardContent } from "@/components/ui/card";
import { Bet } from "@/types/game";

interface RecentBetsProps {
  bets: Bet[];
}

export default function RecentBets({ bets }: RecentBetsProps) {
  return (
    <Card className="bg-neutral shadow-lg">
      <CardContent className="p-6">
        <h3 className="font-heading font-bold mb-4">Recent Bets</h3>
        
        <div className="space-y-3">
          {bets.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent bets to display</p>
          ) : (
            bets.map((bet, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-background rounded-lg">
                <div>
                  <div className="font-medium">{bet.username}</div>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <span>Bet:</span>
                    <span className="font-mono">${bet.amount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-semibold ${bet.profit > 0 ? "text-success" : "text-destructive"}`}>
                    {bet.profit > 0 ? "+" : ""}{bet.profit.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {bet.profit > 0 ? "Cashout: " : "Bust: "}
                    <span className="font-mono">{bet.cashoutMultiplier.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
