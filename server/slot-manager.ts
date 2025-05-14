import { WebSocket } from "ws";
import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";
import { SlotSymbol } from "@shared/schema";
import { db } from "./db";
import { slotSymbols } from "@shared/schema";

interface Client {
  id: string;
  ws: WebSocket;
  username?: string;
  balance?: number;
}

interface SlotBet {
  id: string;
  username: string;
  amount: number;
  timestamp: number;
  result?: SlotResult;
}

interface SlotResult {
  symbols: string[];
  winnings: number;
  paylines: number[];
}

class SlotManager {
  private clients: Map<string, Client> = new Map();
  private symbols: SlotSymbol[] = [];
  private bets: SlotBet[] = [];
  
  constructor() {
    this.loadSymbols();
  }
  
  private async loadSymbols() {
    try {
      this.symbols = await db.select().from(slotSymbols);
      console.log(`Loaded ${this.symbols.length} slot symbols`);
    } catch (error) {
      console.error("Error loading slot symbols:", error);
      // Provide default symbols if database load fails
      this.symbols = [
        { id: 1, name: "Bar", symbol: "bar", multiplier: 2.0, imagePath: "/assets/sbar.png", createdAt: new Date() },
        { id: 2, name: "Cherry", symbol: "cherry", multiplier: 1.5, imagePath: "/assets/scherry.png", createdAt: new Date() },
        { id: 3, name: "Seven", symbol: "seven", multiplier: 15.0, imagePath: "/assets/sseven.png", createdAt: new Date() },
      ];
    }
  }
  
  public addClient(ws: WebSocket): string {
    const clientId = uuidv4();
    this.clients.set(clientId, { id: clientId, ws, username: `player_${clientId.substring(0, 5)}` });
    
    // Send initial data to the client
    this.sendSymbolsToClient(clientId);
    
    return clientId;
  }
  
  public removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }
  
  public async playSlot(clientId: string, amount: number): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    const bet: SlotBet = {
      id: uuidv4(),
      username: client.username || "Anonymous",
      amount,
      timestamp: Date.now()
    };
    
    // Generate random result
    const result = this.generateSlotResult(amount);
    bet.result = result;
    
    this.bets.push(bet);
    this.bets = this.bets.slice(-50); // Keep only the most recent 50 bets
    
    // Send result to the client
    this.sendMessageToClient(clientId, {
      type: "slot_result",
      bet,
      result
    });
    
    // Broadcast to other clients
    this.broadcastMessage({
      type: "slot_played",
      username: bet.username,
      amount: bet.amount,
      winnings: result.winnings
    }, clientId);
  }
  
  private generateSlotResult(betAmount: number): SlotResult {
    // Generate a 3x3 grid of symbols (9 symbols total)
    const symbolNames = this.symbols.map(s => s.symbol);
    const grid: string[] = [];
    
    for (let i = 0; i < 9; i++) {
      // Randomly select a symbol
      const randomIndex = Math.floor(Math.random() * symbolNames.length);
      grid.push(symbolNames[randomIndex]);
    }
    
    // Check for winning paylines
    const paylines: number[] = [];
    let winnings = 0;
    
    // Check horizontal lines (0,1,2), (3,4,5), (6,7,8)
    if (grid[0] === grid[1] && grid[1] === grid[2]) {
      paylines.push(0);
      const multiplier = this.getSymbolMultiplier(grid[0]);
      winnings += betAmount * multiplier;
    }
    
    if (grid[3] === grid[4] && grid[4] === grid[5]) {
      paylines.push(1);
      const multiplier = this.getSymbolMultiplier(grid[3]);
      winnings += betAmount * multiplier;
    }
    
    if (grid[6] === grid[7] && grid[7] === grid[8]) {
      paylines.push(2);
      const multiplier = this.getSymbolMultiplier(grid[6]);
      winnings += betAmount * multiplier;
    }
    
    // Check diagonal lines (0,4,8), (6,4,2)
    if (grid[0] === grid[4] && grid[4] === grid[8]) {
      paylines.push(3);
      const multiplier = this.getSymbolMultiplier(grid[0]) * 1.5; // Diagonal bonus
      winnings += betAmount * multiplier;
    }
    
    if (grid[6] === grid[4] && grid[4] === grid[2]) {
      paylines.push(4);
      const multiplier = this.getSymbolMultiplier(grid[6]) * 1.5; // Diagonal bonus
      winnings += betAmount * multiplier;
    }
    
    return {
      symbols: grid,
      winnings,
      paylines
    };
  }
  
  private getSymbolMultiplier(symbolName: string): number {
    const symbol = this.symbols.find(s => s.symbol === symbolName);
    return symbol ? symbol.multiplier : 1;
  }
  
  private sendSymbolsToClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;
    
    client.ws.send(JSON.stringify({
      type: "symbols_list",
      symbols: this.symbols
    }));
  }
  
  private sendMessageToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;
    
    client.ws.send(JSON.stringify(message));
  }
  
  private broadcastMessage(message: any, excludeClientId?: string): void {
    this.clients.forEach((client) => {
      if (excludeClientId && client.id === excludeClientId) return;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }
  
  public getStats() {
    return {
      playersOnline: this.clients.size,
      totalBets: this.bets.length,
      totalWinnings: this.bets.reduce((total, bet) => total + (bet.result?.winnings || 0), 0),
      highestWin: Math.max(...this.bets.map(bet => bet.result?.winnings || 0))
    };
  }
  
  public getRecentBets(): SlotBet[] {
    return this.bets.slice(-10).reverse(); // Return the most recent 10 bets
  }
}

// Remove export of SlotManager class and only export the singleton instance
const slotManagerSingleton = new SlotManager();
export { slotManagerSingleton as slotManager };