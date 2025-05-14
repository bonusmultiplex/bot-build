import { pgTable, text, serial, real, timestamp, integer } from "drizzle-orm/pg-core";
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

// Slot symbols
export const slotSymbols = pgTable("slot_symbols", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  multiplier: real("multiplier").notNull(),
  imagePath: text("image_path").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSlotSymbolSchema = createInsertSchema(slotSymbols).omit({
  id: true,
  createdAt: true,
});

// Slot paylines
export const slotPaylines = pgTable("slot_paylines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  positions: integer("positions").array().notNull(),
  multiplier: real("multiplier").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSlotPaylineSchema = createInsertSchema(slotPaylines).omit({
  id: true,
  createdAt: true,
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

export type InsertSlotSymbol = z.infer<typeof insertSlotSymbolSchema>;
export type SlotSymbol = typeof slotSymbols.$inferSelect;

export type InsertSlotPayline = z.infer<typeof insertSlotPaylineSchema>;
export type SlotPayline = typeof slotPaylines.$inferSelect;
