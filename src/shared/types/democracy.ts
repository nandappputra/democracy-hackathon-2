export interface NationState {
  population: number;
  gold: number;
  happiness: number;
  foodSurplus: number;
  day: number;
  isGameOver: boolean;
}

export interface GameProblem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  day: number;
}

export interface Decision {
  day: number;
  problem: string;
  solution: string;
  outcome: string;
  impact: {
    population: number;
    gold: number;
    happiness: number;
    foodSurplus: number;
  };
}

export interface GameState {
  nationState: NationState;
  currentProblem: GameProblem | null;
  lastDecisions: Decision[];
  gameStarted: boolean;
  lastProcessedDay: number;
}

export type GameResponse<T> = 
  | { status: 'success' } & T
  | { status: 'error'; message: string };

export interface InitGameResponse {
  gameState: GameState;
}

export interface ProcessDayResponse {
  success: boolean;
  newState: GameState;
}