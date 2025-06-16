export type Choice = 'rock' | 'paper' | 'scissors';

export type GameResult = 'win' | 'lose' | 'tie';

export interface GameState {
  playerChoice: Choice | null;
  computerChoice: Choice | null;
  result: GameResult | null;
  playerScore: number;
  computerScore: number;
  isPlaying: boolean;
}

export interface GameRound {
  playerChoice: Choice;
  computerChoice: Choice;
  result: GameResult;
  timestamp: Date;
}