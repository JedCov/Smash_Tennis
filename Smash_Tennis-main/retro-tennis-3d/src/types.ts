export enum GameState {
  START = 'START',
  SERVING = 'SERVING',
  PLAYING = 'PLAYING',
  SCORING = 'SCORING',
  GAME_OVER = 'GAME_OVER'
}

export type PlayerType = 'PLAYER' | 'AI';

export interface Score {
  player: number; // Current game points (0, 1, 2, 3...)
  ai: number;
  playerGames: number; // Current set games
  aiGames: number;
  playerSets: number; // Completed sets
  aiSets: number;
}

export const TENNIS_SCORES = ['0', '15', '30', '40', 'AD'];

export const COURT_WIDTH = 10;
export const COURT_LENGTH = 20;
export const NET_HEIGHT = 1;

export interface BallState {
  position: [number, number, number];
  velocity: [number, number, number];
  lastHitter: PlayerType | null;
}
