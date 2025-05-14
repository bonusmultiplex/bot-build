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

export type GameMessage = 
  | GameStateUpdate
  | MultiplierUpdate
  | GameCrash
  | GameComplete
  | StatsUpdate
  | BetPlaced
  | BetResult
  | ResetGame;
