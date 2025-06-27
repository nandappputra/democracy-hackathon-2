import { Context, Post } from '@devvit/public-api';
import { RedisClient } from '@devvit/redis';
import { GameState, NationState, GameProblem, Decision } from '../../shared/types/democracy';

const GAME_STATE_KEY = 'democracy:game_state';
const CURRENT_PROBLEM_KEY = 'democracy:current_problem';
const CURRENT_PROBLEM_POST_ID_KEY = 'democracy:current_problem_post_id_key';

export const getInitialNationState = (): NationState => ({
  population: 100,
  gold: 1000,
  happiness: 0,
  foodSurplus: 100,
  day: 1,
  isGameOver: false,
});

export const getInitialGameState = (): GameState => ({
  nationState: getInitialNationState(),
  currentProblem: null,
  lastDecisions: [],
  gameStarted: false,
  lastProcessedDay: 0,
});

export const getGameState = async (redis: RedisClient): Promise<GameState> => {
  const stateStr = await redis.get(GAME_STATE_KEY);
  if (!stateStr) {
    const initialState = getInitialGameState();
    await setGameState(redis, initialState);
    return initialState;
  }
  return JSON.parse(stateStr);
};

export const setGameState = async (redis: RedisClient, state: GameState): Promise<void> => {
  await redis.set(GAME_STATE_KEY, JSON.stringify(state));
};

export const saveProblemPostId = async (redis: RedisClient, post: Post): Promise<void> => {
  await redis.set(CURRENT_PROBLEM_POST_ID_KEY, post.id);
};

export const getProblemPostId = async (redis: RedisClient): Promise<string | undefined> => {
  return await redis.get(CURRENT_PROBLEM_POST_ID_KEY);
};

export const generateProblem = async (
  nationState: NationState,
  lastDecisions: Decision[]
): Promise<GameProblem> => {
  // This would integrate with Gemini API in a real implementation
  // For now, we'll use predefined problems based on state
  const problems = [
    {
      title: 'Economic Crisis',
      description: `A financial crisis has hit the nation. Citizens are struggling with unemployment and rising prices. The treasury is under pressure.`,
    },
    {
      title: 'Food Shortage',
      description: `Crop failures have led to food shortages. The population is growing restless and hungry. Immediate action is needed.`,
    },
    {
      title: 'Population Growth',
      description: `The nation is experiencing rapid population growth. Infrastructure is strained and resources are becoming scarce.`,
    },
    {
      title: 'Trade Opportunity',
      description: `A neighboring nation has offered a lucrative trade deal, but it comes with political strings attached.`,
    },
    {
      title: 'Natural Disaster',
      description: `A natural disaster has struck the nation, destroying infrastructure and displacing citizens.`,
    },
  ];

  // Select problem based on current state
  let selectedProblem;
  if (nationState.gold < 500) {
    selectedProblem = problems[0]; // Economic Crisis
  } else if (nationState.foodSurplus < 50) {
    selectedProblem = problems[1]; // Food Shortage
  } else if (nationState.population > 150) {
    selectedProblem = problems[2]; // Population Growth
  } else {
    selectedProblem = problems[Math.floor(Math.random() * problems.length)];
  }

  return {
    id: `problem_${nationState.day}_${Date.now()}`,
    title: selectedProblem.title,
    description: selectedProblem.description,
    createdAt: new Date().toISOString(),
    day: nationState.day,
  };
};

export const processSolution = async (
  solution: string,
  currentState: NationState,
  problem: GameProblem,
  lastDecisions: Decision[]
): Promise<Decision> => {
  // This would integrate with Gemini API in a real implementation
  // For now, we'll simulate the AI response based on keywords

  const impact = {
    population: 0,
    gold: 0,
    happiness: 0,
    foodSurplus: 0,
  };

  let outcome = '';

  // Simple keyword-based impact simulation
  const solutionLower = solution.toLowerCase();

  if (solutionLower.includes('tax') || solutionLower.includes('money')) {
    if (solutionLower.includes('increase') || solutionLower.includes('raise')) {
      impact.gold += 200;
      impact.happiness -= 15;
      outcome = 'Increased taxes brought in revenue but made citizens unhappy.';
    } else if (solutionLower.includes('decrease') || solutionLower.includes('lower')) {
      impact.gold -= 100;
      impact.happiness += 10;
      outcome = 'Lower taxes pleased citizens but reduced government revenue.';
    }
  }

  if (solutionLower.includes('food') || solutionLower.includes('agriculture')) {
    impact.foodSurplus += 30;
    impact.gold -= 150;
    impact.happiness += 5;
    outcome += ' Investment in agriculture improved food security.';
  }

  if (solutionLower.includes('infrastructure') || solutionLower.includes('build')) {
    impact.gold -= 300;
    impact.happiness += 10;
    impact.population += 5;
    outcome += ' Infrastructure improvements attracted new citizens.';
  }

  if (solutionLower.includes('military') || solutionLower.includes('defense')) {
    impact.gold -= 200;
    impact.happiness -= 5;
    outcome += ' Military spending provided security but was costly.';
  }

  // Default random small changes if no keywords matched
  if (
    impact.population === 0 &&
    impact.gold === 0 &&
    impact.happiness === 0 &&
    impact.foodSurplus === 0
  ) {
    impact.population = Math.floor(Math.random() * 10) - 5;
    impact.gold = Math.floor(Math.random() * 200) - 100;
    impact.happiness = Math.floor(Math.random() * 20) - 10;
    impact.foodSurplus = Math.floor(Math.random() * 40) - 20;
    outcome = 'The solution had mixed results with various impacts on the nation.';
  }

  return {
    day: currentState.day,
    problem: problem.title,
    solution,
    outcome: outcome.trim(),
    impact,
  };
};

export const applyDecisionImpact = (state: NationState, decision: Decision): NationState => {
  const newState = { ...state };

  newState.population = Math.max(0, newState.population + decision.impact.population);
  newState.gold = Math.max(0, newState.gold + decision.impact.gold);
  newState.happiness = Math.max(
    -100,
    Math.min(100, newState.happiness + decision.impact.happiness)
  );
  newState.foodSurplus = Math.max(0, newState.foodSurplus + decision.impact.foodSurplus);

  // Check if game is over
  newState.isGameOver = newState.population <= 0;

  // Advance day
  newState.day += 1;

  return newState;
};

export const formatGameStateForPost = (gameState: GameState): string => {
  const { nationState, currentProblem, lastDecisions } = gameState;

  let content = `# 🏛️ The Nation of Democracy - Day ${nationState.day}\n\n`;

  content += `## 📊 Current State\n`;
  content += `- **Population**: ${nationState.population} citizens\n`;
  content += `- **Gold**: ${nationState.gold} coins\n`;
  content += `- **Happiness**: ${nationState.happiness}/100\n`;
  content += `- **Food Surplus**: ${nationState.foodSurplus} units\n\n`;

  if (currentProblem) {
    content += `## ⚠️ Current Crisis: ${currentProblem.title}\n`;
    content += `${currentProblem.description}\n\n`;
    content += `**What should the nation do? Comment your solution below!**\n\n`;
  }

  if (lastDecisions.length > 0) {
    content += `## 📜 Recent Decisions\n`;
    const recentDecisions = lastDecisions.slice(-5);
    recentDecisions.forEach((decision, index) => {
      content += `**Day ${decision.day}**: ${decision.problem}\n`;
      content += `*Solution*: ${decision.solution}\n`;
      content += `*Outcome*: ${decision.outcome}\n\n`;
    });
  }

  if (nationState.isGameOver) {
    content += `## 💀 GAME OVER\n`;
    content += `The nation has fallen! The population has reached zero.\n`;
    content += `The game will restart with a new nation.\n\n`;
  }

  content += `---\n*This is an automated post for the Democracy Game*`;

  return content;
};
