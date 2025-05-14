import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Game state
export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  gameId: serial("game_id").notNull(),
  state: text("state").notNull(), // "waiting", "starting", "in_progress", "crashed", "completed"
  currentMultiplier: real("current_multiplier").notNull().default(1),
  finalMultiplier: real("final_multiplier"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
  gameId: true,
  startedAt: true,
});

// Game bets
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  gameId: serial("game_id").notNull(),
  userId: serial("user_id").notNull(),
  username: text("username").notNull(),
  amount: real("amount").notNull(),
  targetMultiplier: real("target_multiplier").notNull(),
  cashoutMultiplier: real("cashout_multiplier"),
  profit: real("profit"),
  placedAt: timestamp("placed_at").notNull().defaultNow(),
  cashedOutAt: timestamp("cashed_out_at"),
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  placedAt: true,
  cashedOutAt: true,
});

// Game statistics
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  highestMultiplier: real("highest_multiplier").notNull().default(1),
  averageMultiplier: real("average_multiplier").notNull().default(1),
  totalGames: serial("total_games").notNull().default(0),
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  date: true,
});

// Users for the basic auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameStates.$inferSelect;

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;
