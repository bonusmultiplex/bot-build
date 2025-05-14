export enum GameState {
  WAITING = 'waiting',
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  CRASHED = 'crashed',
  COMPLETED = 'completed'
}

export interface GameStats {
  highestMultiplierToday: number;
  averageMultiplier: number;
  totalGamesToday: number;
  playersOnline: number;
}

export interface Bet {
  id: string;
  username: string;
  amount: number;
  targetMultiplier: number;
  cashoutMultiplier: number;
  profit: number;
  timestamp: number;
}

export interface GameStateUpdate {
  type: 'game_state';
  state: GameState;
  gameId: number;
  timeRemaining: number;
}

export interface MultiplierUpdate {
  type: 'multiplier_update';
  multiplier: number;
}

export interface GameCrash {
  type: 'game_crash';
  finalMultiplier: number;
}

export interface GameComplete {
  type: 'game_complete';
  finalMultiplier: number;
}

export interface StatsUpdate {
  type: 'stats_update';
  stats: GameStats;
}

export interface BetPlaced {
  type: 'bet_placed';
  bet: Bet;
}

export interface BetResult {
  type: 'bet_result';
  betId: string;
  profit: number;
  cashoutMultiplier: number;
}

export interface ResetGame {
  type: 'reset';
}

// Slot machine types
export interface SlotSymbol {
  id: number;
  name: string;
  symbol: string;
  multiplier: number;
  imagePath: string;
}

export interface SlotResult {
  symbols: string[];
  winnings: number;
  paylines: number[];
}

export interface SlotBet {
  id: string;
  username: string;
  amount: number;
  timestamp: number;
  result?: SlotResult;
}

export interface SlotStats {
  playersOnline: number;
  totalBets: number;
  totalWinnings: number;
  highestWin: number;
}

export interface SymbolsList {
  type: 'symbols_list';
  symbols: SlotSymbol[];
}

export interface SlotResultMessage {
  type: 'slot_result';
  bet: SlotBet;
  result: SlotResult;
}

export interface SlotPlayed {
  type: 'slot_played';
  username: string;
  amount: number;
  winnings: number;
}

export interface SlotStatsUpdate {
  type: 'slot_stats';
  stats: SlotStats;
}

export interface RecentSlotBets {
  type: 'recent_slot_bets';
  bets: SlotBet[];
}

export type GameMessage = 
  | GameStateUpdate
  | MultiplierUpdate
  | GameCrash
  | GameComplete
  | StatsUpdate
  | BetPlaced
  | BetResult
  | ResetGame
  | SymbolsList
  | SlotResultMessage
  | SlotPlayed
  | SlotStatsUpdate
  | RecentSlotBets;
