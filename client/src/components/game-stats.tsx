import { Card, CardContent } from "@/components/ui/card";
import { GameStats as GameStatsType } from "@/types/game";

interface GameStatsProps {
  stats: GameStatsType;
}

export default function GameStatsDisplay({ stats }: GameStatsProps) {
  return (
    <Card className="bg-neutral shadow-lg">
      <CardContent className="p-6">
        <h3 className="font-heading font-bold mb-4">Game Stats</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Highest Multiplier Today</span>
            <span className="font-mono font-semibold text-accent">{stats.highestMultiplierToday.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Average Multiplier</span>
            <span className="font-mono font-semibold">{stats.averageMultiplier.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Games Today</span>
            <span className="font-mono font-semibold">{stats.totalGamesToday}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Players Online</span>
            <span className="font-mono font-semibold">{stats.playersOnline}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
