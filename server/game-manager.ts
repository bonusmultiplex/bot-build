import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

// Game states
enum GameState {
  WAITING = 'waiting',
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  CRASHED = 'crashed',
  COMPLETED = 'completed'
}

// Types
interface Client {
  id: string;
  ws: WebSocket;
  activeBet?: Bet;
}

interface Bet {
  id: string;
  username: string;
  amount: number;
  targetMultiplier: number;
  cashoutMultiplier: number;
  profit: number;
  timestamp: number;
}

interface GameStats {
  highestMultiplierToday: number;
  averageMultiplier: number;
  totalGamesToday: number;
  playersOnline: number;
}

export class GameManager {
  private clients: Map<string, Client> = new Map();
  private gameState: GameState = GameState.WAITING;
  private gameId: number = 1;
  private currentMultiplier: number = 1.00;
  private timeRemaining: number = 10;
  private multiplierHistory: number[] = [];
  private recentBets: Bet[] = [];
  private gameInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private lastUpdateTime: number = 0;
  private gameStats: GameStats = {
    highestMultiplierToday: 26.81,
    averageMultiplier: 3.21,
    totalGamesToday: 0,
    playersOnline: 0
  };
  private usernames: string[] = [
    "Player123", "CasinoFan", "LuckyGamer", "JackpotHunter", 
    "VegasKing", "CardShark", "RoyalFlush", "WheelSpinner",
    "GoldMiner", "DiamondHand", "CoinTosser", "ChipStacker"
  ];

  constructor() {
    // Initialize with some random history
    this.generateInitialHistory();
  }

  public addClient(ws: WebSocket): string {
    const id = uuidv4();
    this.clients.set(id, { id, ws });
    
    // Update player count
    this.gameStats.playersOnline = this.clients.size;
    this.broadcastStats();
    
    return id;
  }

  public removeClient(clientId: string): void {
    this.clients.delete(clientId);
    
    // Update player count
    this.gameStats.playersOnline = this.clients.size;
    this.broadcastStats();
  }

  public getGameState(): { state: GameState; gameId: number; timeRemaining: number } {
    return {
      state: this.gameState,
      gameId: this.gameId,
      timeRemaining: this.timeRemaining
    };
  }

  public getCurrentMultiplier(): number {
    return this.currentMultiplier;
  }

  public getMultiplierHistory(): number[] {
    return [...this.multiplierHistory];
  }

  public getStats(): GameStats {
    return { ...this.gameStats };
  }

  public getRecentBets(): Bet[] {
    return [...this.recentBets];
  }

  public placeBet(clientId: string, amount: number, targetMultiplier: number): void {
    // Only allow bets during waiting state
    if (this.gameState !== GameState.WAITING) {
      return;
    }
    
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Create new bet
    const bet: Bet = {
      id: uuidv4(),
      username: this.getRandomUsername(),
      amount,
      targetMultiplier,
      cashoutMultiplier: 0,
      profit: -amount, // Start with negative profit (loss)
      timestamp: Date.now()
    };
    
    // Store bet with client
    client.activeBet = bet;
    
    // Add to recent bets
    this.recentBets.unshift(bet);
    if (this.recentBets.length > 20) {
      this.recentBets.pop();
    }
    
    // Broadcast bet to all clients
    this.broadcast({
      type: 'bet_placed',
      bet
    });
  }

  public startGameLoop(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    
    this.gameInterval = setInterval(() => this.gameLoop(), 100);
  }

  private gameLoop(): void {
    const now = Date.now();
    
    switch (this.gameState) {
      case GameState.WAITING:
        // Count down until game starts
        if (now - this.lastUpdateTime >= 1000) {
          this.timeRemaining--;
          this.lastUpdateTime = now;
          
          if (this.timeRemaining <= 0) {
            this.startGame();
          } else {
            this.broadcastGameState();
          }
        }
        break;
        
      case GameState.STARTING:
        // Short countdown before game actually starts
        if (now - this.lastUpdateTime >= 1000) {
          this.timeRemaining--;
          this.lastUpdateTime = now;
          
          if (this.timeRemaining <= 0) {
            this.gameState = GameState.IN_PROGRESS;
            this.startTime = now;
            this.lastUpdateTime = now;
            this.currentMultiplier = 1.00;
            this.broadcastGameState();
          } else {
            this.broadcastGameState();
          }
        }
        break;
        
      case GameState.IN_PROGRESS:
        // Update multiplier based on elapsed time
        const elapsed = now - this.startTime;
        
        // Calculate new multiplier (with acceleration)
        const baseMultiplier = 1 + (elapsed / 1000 * 0.2);
        const acceleration = Math.pow(1.0015, elapsed / 100);
        this.currentMultiplier = baseMultiplier * acceleration;
        
        // Check for crash (higher probability with higher multiplier)
        const crashProbability = Math.min(0.01, this.currentMultiplier * 0.001);
        if (Math.random() < crashProbability) {
          this.endGame(true);
          return;
        }
        
        // Process auto cashouts
        this.processAutoCashouts();
        
        // Send multiplier updates every 100ms
        if (now - this.lastUpdateTime >= 100) {
          this.lastUpdateTime = now;
          
          this.broadcast({
            type: 'multiplier_update',
            multiplier: this.currentMultiplier
          });
        }
        
        // Cap game length at 30 seconds (extremely rare to reach)
        if (elapsed > 30000) {
          this.endGame(false);
        }
        break;
        
      case GameState.CRASHED:
      case GameState.COMPLETED:
        // Wait a bit before starting next round
        if (now - this.lastUpdateTime >= 1000) {
          this.timeRemaining--;
          this.lastUpdateTime = now;
          
          if (this.timeRemaining <= 0) {
            this.resetGame();
          }
        }
        break;
    }
  }

  private startGame(): void {
    // Transition to starting state with 3 second countdown
    this.gameState = GameState.STARTING;
    this.timeRemaining = 3;
    this.lastUpdateTime = Date.now();
    
    // Broadcast game state change
    this.broadcastGameState();
    
    // Generate random bets for simulation
    this.generateRandomBets();
  }

  private endGame(crashed: boolean): void {
    // Update game state
    this.gameState = crashed ? GameState.CRASHED : GameState.COMPLETED;
    this.timeRemaining = 5; // 5 seconds until next game
    this.lastUpdateTime = Date.now();
    
    // Add to history
    this.multiplierHistory.unshift(this.currentMultiplier);
    if (this.multiplierHistory.length > 100) {
      this.multiplierHistory.pop();
    }
    
    // Update stats
    this.gameStats.totalGamesToday++;
    if (this.currentMultiplier > this.gameStats.highestMultiplierToday) {
      this.gameStats.highestMultiplierToday = this.currentMultiplier;
    }
    
    // Recalculate average (simplified)
    const sum = this.multiplierHistory.reduce((acc, val) => acc + val, 0);
    this.gameStats.averageMultiplier = sum / this.multiplierHistory.length;
    
    // Process final cashouts and crashes
    this.processFinalResults(crashed);
    
    // Broadcast game end
    this.broadcast({
      type: crashed ? 'game_crash' : 'game_complete',
      finalMultiplier: this.currentMultiplier
    });
    
    // Broadcast updated stats
    this.broadcastStats();
    
    // Broadcast game state
    this.broadcastGameState();
  }

  private resetGame(): void {
    // Start a new game
    this.gameId++;
    this.gameState = GameState.WAITING;
    this.timeRemaining = 10;
    this.currentMultiplier = 1.00;
    this.lastUpdateTime = Date.now();
    
    // Clear active bets
    for (const client of this.clients.values()) {
      client.activeBet = undefined;
    }
    
    // Broadcast reset
    this.broadcast({
      type: 'reset'
    });
    
    // Broadcast new game state
    this.broadcastGameState();
  }

  private processAutoCashouts(): void {
    for (const client of this.clients.values()) {
      if (client.activeBet && this.currentMultiplier >= client.activeBet.targetMultiplier) {
        // Auto cashout triggered
        const bet = client.activeBet;
        const profit = bet.amount * bet.targetMultiplier - bet.amount;
        
        // Update bet
        bet.cashoutMultiplier = bet.targetMultiplier;
        bet.profit = profit;
        
        // Broadcast result
        this.broadcast({
          type: 'bet_result',
          betId: bet.id,
          profit,
          cashoutMultiplier: bet.targetMultiplier
        });
        
        // Mark as processed
        client.activeBet = undefined;
      }
    }
  }

  private processFinalResults(crashed: boolean): void {
    for (const client of this.clients.values()) {
      if (!client.activeBet) continue;
      
      const bet = client.activeBet;
      
      if (crashed) {
        // All remaining bets are lost
        bet.cashoutMultiplier = this.currentMultiplier;
        bet.profit = -bet.amount;
      } else {
        // Auto cashout at final multiplier
        const profit = bet.amount * this.currentMultiplier - bet.amount;
        bet.cashoutMultiplier = this.currentMultiplier;
        bet.profit = profit;
      }
      
      // Broadcast result
      this.broadcast({
        type: 'bet_result',
        betId: bet.id,
        profit: bet.profit,
        cashoutMultiplier: bet.cashoutMultiplier
      });
      
      // Mark as processed
      client.activeBet = undefined;
    }
  }

  private broadcastGameState(): void {
    this.broadcast({
      type: 'game_state',
      state: this.gameState,
      gameId: this.gameId,
      timeRemaining: this.timeRemaining
    });
  }

  private broadcastStats(): void {
    this.broadcast({
      type: 'stats_update',
      stats: this.gameStats
    });
  }

  private broadcast(data: any): void {
    const message = JSON.stringify(data);
    
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    }
  }

  private generateInitialHistory(): void {
    // Generate some realistic initial history
    for (let i = 0; i < 15; i++) {
      // Most multipliers between 1 and 3, but some higher ones
      let multiplier: number;
      const rand = Math.random();
      
      if (rand < 0.7) {
        // 70% between 1 and 3
        multiplier = 1 + Math.random() * 2;
      } else if (rand < 0.9) {
        // 20% between 3 and 8
        multiplier = 3 + Math.random() * 5;
      } else {
        // 10% between 8 and 20
        multiplier = 8 + Math.random() * 12;
      }
      
      this.multiplierHistory.push(multiplier);
    }
  }

  private generateRandomBets(): void {
    const numBets = 3 + Math.floor(Math.random() * 4); // 3-6 random bets
    
    for (let i = 0; i < numBets; i++) {
      // Generate random bet
      const amount = Math.floor((10 + Math.random() * 90) * 100) / 100; // $10-$100
      const targetMultiplier = Math.floor((1.5 + Math.random() * 8.5) * 100) / 100; // 1.5x-10x
      
      const bet: Bet = {
        id: uuidv4(),
        username: this.getRandomUsername(),
        amount,
        targetMultiplier,
        cashoutMultiplier: 0,
        profit: -amount, // Start with negative profit (loss)
        timestamp: Date.now()
      };
      
      // Add to recent bets
      this.recentBets.unshift(bet);
      if (this.recentBets.length > 20) {
        this.recentBets.pop();
      }
      
      // Broadcast bet
      this.broadcast({
        type: 'bet_placed',
        bet
      });
    }
  }

  private getRandomUsername(): string {
    return this.usernames[Math.floor(Math.random() * this.usernames.length)];
  }
}
