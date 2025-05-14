import { pgTable, text, serial, real, timestamp, integer, boolean } from "drizzle-orm/pg-core";
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

// Game stats
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  highestMultiplier: real("highest_multiplier").notNull().default(1),
  averageMultiplier: real("average_multiplier").notNull().default(1),
  totalGames: integer("total_games").notNull().default(0),
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  date: true,
});

// Users
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

// Game types
export const gameTypes = pgTable("game_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  minBet: real("min_bet").notNull(),
  maxBet: real("max_bet").notNull(),
  odds: real("odds").notNull(),
  hardModeOdds: real("hard_mode_odds"),
  hasHardMode: boolean("has_hard_mode").notNull().default(false),
  xpReward: integer("xp_reward").notNull().default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Game outcomes
export const gameOutcomes = pgTable("game_outcomes", {
  id: serial("id").primaryKey(),
  gameId: serial("game_id").notNull(),
  userId: serial("user_id").notNull(),
  gameType: text("game_type").notNull(),
  betAmount: real("bet_amount").notNull(),
  hardMode: boolean("hard_mode").notNull().default(false),
  prediction: text("prediction"),
  result: text("result").notNull(),
  payout: real("payout").notNull(),
  xpEarned: integer("xp_earned").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Boosts
export const boosts = pgTable("boosts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "xp", "cash", "win_rate" 
  multiplier: real("multiplier").notNull(),
  duration: integer("duration").notNull(), // Duration in minutes
  price: integer("price").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player boosts
export const playerBoosts = pgTable("player_boosts", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  boostId: serial("boost_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Items
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "consumable", "collectible", "tool"
  price: integer("price").notNull(),
  sellPrice: integer("sell_price").notNull(),
  imagePath: text("image_path"),
  rarity: text("rarity").notNull(), // "common", "rare", "epic", "legendary"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player inventory
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  itemId: serial("item_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Mining resources
export const miningResources = pgTable("mining_resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "ore", "gem", "material"
  rarity: text("rarity").notNull(), // "common", "uncommon", "rare", "epic", "legendary"
  baseValue: integer("base_value").notNull(),
  processingTime: integer("processing_time").notNull(), // Time in seconds
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player mining inventory
export const miningInventory = pgTable("mining_inventory", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  resourceId: serial("resource_id").notNull(),
  amount: integer("amount").notNull().default(0),
  unprocessed: integer("unprocessed").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Mining units
export const miningUnits = pgTable("mining_units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  baseSpeed: integer("base_speed").notNull(), // Resources per minute
  baseEfficiency: real("base_efficiency").notNull(), // % of successful digs
  baseCost: integer("base_cost").notNull(),
  maxLevel: integer("max_level").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player mining units
export const playerMiningUnits = pgTable("player_mining_units", {
  id: serial("id").primaryKey(), 
  userId: serial("user_id").notNull(),
  unitId: serial("unit_id").notNull(),
  level: integer("level").notNull().default(1),
  quantity: integer("quantity").notNull().default(0),
  upgrades: text("upgrades").array(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Mining upgrades
export const miningUpgrades = pgTable("mining_upgrades", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "speed", "efficiency", "capacity"
  multiplier: real("multiplier").notNull(),
  baseCost: integer("base_cost").notNull(),
  maxLevel: integer("max_level").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player mining stats
export const miningStats = pgTable("mining_stats", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  totalDigs: integer("total_digs").notNull().default(0),
  successfulDigs: integer("successful_digs").notNull().default(0),
  totalProcessed: integer("total_processed").notNull().default(0),
  minerName: text("miner_name"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Command documentation
export const commandHelp = pgTable("command_help", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "games", "bets", "player", "guild", etc.
  aliases: text("aliases").array(),
  examples: text("examples").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Bot statistics
export const botStats = pgTable("bot_stats", {
  id: serial("id").primaryKey(),
  playerCount: integer("player_count").notNull().default(0),
  guildCount: integer("guild_count").notNull().default(0), 
  activeGames: integer("active_games").notNull().default(0),
  commandsRun: integer("commands_run").notNull().default(0),
  uptime: integer("uptime").notNull().default(0), // Seconds since last restart
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// User preferences and settings 
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  darkMode: boolean("dark_mode").notNull().default(false),
  notifications: boolean("notifications").notNull().default(true),
  language: text("language").notNull().default("en"),
  timezone: text("timezone").notNull().default("UTC"),
  deletedAt: timestamp("deleted_at"), // For soft deletes
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Export schemas
export const insertGameTypeSchema = createInsertSchema(gameTypes).omit({
  id: true,
  createdAt: true,
});

export const insertGameOutcomeSchema = createInsertSchema(gameOutcomes).omit({
  id: true,
  createdAt: true,
});

export const insertBoostSchema = createInsertSchema(boosts).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerBoostSchema = createInsertSchema(playerBoosts).omit({
  id: true, 
  createdAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true,
});

export const insertMiningResourceSchema = createInsertSchema(miningResources).omit({
  id: true,
  createdAt: true,
});

export const insertMiningInventorySchema = createInsertSchema(miningInventory).omit({ 
  id: true,
  updatedAt: true,
});

export const insertMiningUnitSchema = createInsertSchema(miningUnits).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerMiningUnitSchema = createInsertSchema(playerMiningUnits).omit({
  id: true,
  updatedAt: true,
});

export const insertMiningUpgradeSchema = createInsertSchema(miningUpgrades).omit({
  id: true,
  createdAt: true,
});

export const insertMiningStatsSchema = createInsertSchema(miningStats).omit({
  id: true,
  startedAt: true,
  updatedAt: true,
});

export const insertCommandHelpSchema = createInsertSchema(commandHelp).omit({
  id: true,
  createdAt: true,
});

export const insertBotStatsSchema = createInsertSchema(botStats).omit({
  id: true,
  lastUpdated: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  deletedAt: true,
  updatedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type GameState = typeof gameStates.$inferSelect;
export type InsertGameState = typeof gameStates.$inferInsert;

export type Bet = typeof bets.$inferSelect;
export type InsertBet = typeof bets.$inferInsert;

export type GameStats = typeof gameStats.$inferSelect;
export type InsertGameStats = typeof gameStats.$inferInsert;

export type SlotSymbol = typeof slotSymbols.$inferSelect;
export type InsertSlotSymbol = typeof slotSymbols.$inferInsert;

export type SlotPayline = typeof slotPaylines.$inferSelect;
export type InsertSlotPayline = typeof slotPaylines.$inferInsert;

// Additional type exports
export type GameType = typeof gameTypes.$inferSelect;
export type InsertGameType = typeof gameTypes.$inferInsert;

export type GameOutcome = typeof gameOutcomes.$inferSelect;
export type InsertGameOutcome = typeof gameOutcomes.$inferInsert;

export type Boost = typeof boosts.$inferSelect;
export type InsertBoost = typeof boosts.$inferInsert;

export type PlayerBoost = typeof playerBoosts.$inferSelect;
export type InsertPlayerBoost = typeof playerBoosts.$inferInsert;

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

export type MiningResource = typeof miningResources.$inferSelect;
export type InsertMiningResource = typeof miningResources.$inferInsert;

export type MiningInventory = typeof miningInventory.$inferSelect;
export type InsertMiningInventory = typeof miningInventory.$inferInsert;

export type MiningUnit = typeof miningUnits.$inferSelect;
export type InsertMiningUnit = typeof miningUnits.$inferInsert;

export type PlayerMiningUnit = typeof playerMiningUnits.$inferSelect;
export type InsertPlayerMiningUnit = typeof playerMiningUnits.$inferInsert;

export type MiningUpgrade = typeof miningUpgrades.$inferSelect;
export type InsertMiningUpgrade = typeof miningUpgrades.$inferInsert;

export type MiningStats = typeof miningStats.$inferSelect;
export type InsertMiningStats = typeof miningStats.$inferInsert;

export type CommandHelp = typeof commandHelp.$inferSelect;
export type InsertCommandHelp = typeof commandHelp.$inferInsert;

export type BotStats = typeof botStats.$inferSelect;
export type InsertBotStats = typeof botStats.$inferInsert;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
