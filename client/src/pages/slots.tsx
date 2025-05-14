import React from "react";
import SlotMachine from "@/components/slot-machine";
import ConnectionStatus from "@/components/connection-status";
import GameNavigation from "@/components/game-nav";
import { useWebSocket } from "@/hooks/use-websocket";

export default function SlotsPage() {
  const { isConnected } = useWebSocket();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold">
          Casino Slots
        </h1>
        <ConnectionStatus isConnected={isConnected} />
      </div>
      
      <GameNavigation />
      
      <SlotMachine />
    </div>
  );
}