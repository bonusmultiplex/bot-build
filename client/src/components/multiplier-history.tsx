import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MultiplierHistoryProps {
  history: number[];
}

export default function MultiplierHistory({ history }: MultiplierHistoryProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clear existing chart
    chartRef.current.innerHTML = "";
    
    // Create history points (limited to 20)
    const limitedHistory = history.slice(-20);
    
    limitedHistory.forEach((multiplier, index) => {
      const point = document.createElement("div");
      point.className = "multiplier-point";
      
      // Position from left to right (newest on right)
      const leftPercentage = ((index + 1) * (100 / limitedHistory.length)) - (100 / (limitedHistory.length * 2));
      point.style.left = `${leftPercentage}%`;
      
      // Height based on multiplier (capped at 15x = 100% height)
      const heightPercentage = Math.min(100, (multiplier / 15) * 100);
      point.style.height = `${heightPercentage}%`;
      
      // Color based on multiplier
      let color;
      if (multiplier >= 10) {
        color = "var(--destructive)";
      } else if (multiplier >= 3) {
        color = "var(--accent)";
      } else {
        color = "var(--success)";
      }
      point.style.backgroundColor = color;
      
      chartRef.current.appendChild(point);
    });
  }, [history]);
  
  return (
    <Card className="bg-neutral shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-bold">Multiplier History</h3>
          <span className="text-xs text-gray-400">Last {Math.min(history.length, 20)} rounds</span>
        </div>
        
        <div className="multiplier-history-chart" ref={chartRef}></div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>20</span>
          <span>15</span>
          <span>10</span>
          <span>5</span>
          <span>Now</span>
        </div>
      </CardContent>
    </Card>
  );
}
