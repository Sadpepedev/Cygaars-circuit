export interface GameState {
  isPlaying: boolean;
  gameOver: boolean;
  score: number;
  highScore: number;
  playerName: string;
}

export interface Penguin {
  y: number;
  velocity: number;
  rotation: number;
}

export interface Rug {
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}