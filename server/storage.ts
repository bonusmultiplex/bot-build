import { users, gameStates, bets, gameStats, type User, type InsertUser, type GameState, type Bet, type GameStats, type InsertGameState, type InsertBet, type InsertGameStats } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game state methods
  getGameState(id: number): Promise<GameState | undefined>;
  getLatestGameState(): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(id: number, gameState: Partial<InsertGameState>): Promise<GameState | undefined>;
  
  // Bet methods
  getBet(id: number): Promise<Bet | undefined>;
  getBetsByGameId(gameId: number): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBet(id: number, bet: Partial<InsertBet>): Promise<Bet | undefined>;
  
  // Game stats methods
  getGameStats(id: number): Promise<GameStats | undefined>;
  getLatestGameStats(): Promise<GameStats | undefined>;
  createGameStats(stats: InsertGameStats): Promise<GameStats>;
  updateGameStats(id: number, stats: Partial<InsertGameStats>): Promise<GameStats | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Game state methods
  async getGameState(id: number): Promise<GameState | undefined> {
    const [state] = await db.select().from(gameStates).where(eq(gameStates.id, id));
    return state;
  }
  
  async getLatestGameState(): Promise<GameState | undefined> {
    const [state] = await db.select().from(gameStates).limit(1);
    return state;
  }
  
  async createGameState(gameState: InsertGameState): Promise<GameState> {
    const [state] = await db
      .insert(gameStates)
      .values(gameState)
      .returning();
    return state;
  }
  
  async updateGameState(id: number, gameState: Partial<InsertGameState>): Promise<GameState | undefined> {
    const [state] = await db
      .update(gameStates)
      .set(gameState)
      .where(eq(gameStates.id, id))
      .returning();
    return state;
  }
  
  // Bet methods
  async getBet(id: number): Promise<Bet | undefined> {
    const [bet] = await db.select().from(bets).where(eq(bets.id, id));
    return bet;
  }
  
  async getBetsByGameId(gameId: number): Promise<Bet[]> {
    return await db.select().from(bets).where(eq(bets.gameId, gameId));
  }
  
  async createBet(bet: InsertBet): Promise<Bet> {
    const [newBet] = await db
      .insert(bets)
      .values(bet)
      .returning();
    return newBet;
  }
  
  async updateBet(id: number, bet: Partial<InsertBet>): Promise<Bet | undefined> {
    const [updatedBet] = await db
      .update(bets)
      .set(bet)
      .where(eq(bets.id, id))
      .returning();
    return updatedBet;
  }
  
  // Game stats methods
  async getGameStats(id: number): Promise<GameStats | undefined> {
    const [stats] = await db.select().from(gameStats).where(eq(gameStats.id, id));
    return stats;
  }
  
  async getLatestGameStats(): Promise<GameStats | undefined> {
    const [stats] = await db.select().from(gameStats).limit(1);
    return stats;
  }
  
  async createGameStats(stats: InsertGameStats): Promise<GameStats> {
    const [newStats] = await db
      .insert(gameStats)
      .values(stats)
      .returning();
    return newStats;
  }
  
  async updateGameStats(id: number, stats: Partial<InsertGameStats>): Promise<GameStats | undefined> {
    const [updatedStats] = await db
      .update(gameStats)
      .set(stats)
      .where(eq(gameStats.id, id))
      .returning();
    return updatedStats;
  }
}

export const storage = new DatabaseStorage();
