import { Context, Post } from '@devvit/public-api';
import { RedisClient } from '@devvit/redis';
import { GameState, NationState, GameProblem, Decision } from '../../shared/types/democracy';

const GAME_STATE_KEY = 'democracy:game_state';
const CURRENT_PROBLEM_KEY = 'democracy:current_problem';
const CURRENT_PROBLEM_POST_ID_KEY = 'democracy:current_problem_post_id_key';

// Gemini API configuration - Use environment variable for security
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

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
  console.log("Checking GEMINI_API_KEY availability:", !!GEMINI_API_KEY);
  
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found, using fallback problem generation');
    return generateFallbackProblem(nationState, lastDecisions);
  }

  try {
    const prompt = createProblemGenerationPrompt(nationState, lastDecisions);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No text generated from Gemini API');
    }

    console.log('Gemini generated problem:', generatedText);
    return parseProblemFromGemini(generatedText, nationState);
  } catch (error) {
    console.error('Error generating problem with Gemini:', error);
    return generateFallbackProblem(nationState, lastDecisions);
  }
};

const createProblemGenerationPrompt = (nationState: NationState, lastDecisions: Decision[]): string => {
  const recentDecisions = lastDecisions.slice(-3).map(d => 
    `Day ${d.day}: ${d.problem} - Solution: ${d.solution} - Outcome: ${d.outcome}`
  ).join('\n');

  return `You are the game master for a democracy simulation game. Generate a realistic crisis or challenge for the nation based on the current state.

Current Nation State:
- Population: ${nationState.population} citizens
- Gold: ${nationState.gold} coins
- Happiness: ${nationState.happiness}/100
- Food Surplus: ${nationState.foodSurplus} units
- Day: ${nationState.day}

Recent Decisions:
${recentDecisions || 'None yet'}

Generate a crisis that:
1. Is appropriate for the current state (e.g., if gold is low, maybe economic issues; if food is low, agricultural problems)
2. Feels realistic and engaging
3. Requires citizen input to solve
4. Has potential for multiple solution approaches

Format your response as JSON:
{
  "title": "Crisis Title (max 50 characters)",
  "description": "Detailed description of the crisis (max 200 characters)"
}

Only respond with valid JSON, no additional text.`;
};

const parseProblemFromGemini = (generatedText: string, nationState: NationState): GameProblem => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.title || !parsed.description) {
      throw new Error('Invalid JSON structure from Gemini');
    }

    return {
      id: `problem_${nationState.day}_${Date.now()}`,
      title: parsed.title.substring(0, 50), // Ensure max length
      description: parsed.description.substring(0, 200), // Ensure max length
      createdAt: new Date().toISOString(),
      day: nationState.day,
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw error;
  }
};

const generateFallbackProblem = (nationState: NationState, lastDecisions: Decision[]): GameProblem => {
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
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found, using fallback solution processing');
    return processSolutionFallback(solution, currentState, problem, lastDecisions);
  }

  try {
    const prompt = createSolutionProcessingPrompt(solution, currentState, problem, lastDecisions);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No text generated from Gemini API');
    }

    console.log('Gemini processed solution:', generatedText);
    return parseDecisionFromGemini(generatedText, solution, currentState, problem);
  } catch (error) {
    console.error('Error processing solution with Gemini:', error);
    return processSolutionFallback(solution, currentState, problem, lastDecisions);
  }
};

const createSolutionProcessingPrompt = (
  solution: string,
  currentState: NationState,
  problem: GameProblem,
  lastDecisions: Decision[]
): string => {
  const recentDecisions = lastDecisions.slice(-3).map(d => 
    `Day ${d.day}: ${d.problem} - Solution: ${d.solution} - Impact: Pop ${d.impact.population > 0 ? '+' : ''}${d.impact.population}, Gold ${d.impact.gold > 0 ? '+' : ''}${d.impact.gold}, Happiness ${d.impact.happiness > 0 ? '+' : ''}${d.impact.happiness}, Food ${d.impact.foodSurplus > 0 ? '+' : ''}${d.impact.foodSurplus}`
  ).join('\n');

  return `You are the game master for a democracy simulation. A citizen has proposed a solution to the current crisis. Evaluate the solution and determine its realistic impact on the nation.

Current Nation State:
- Population: ${currentState.population} citizens
- Gold: ${currentState.gold} coins
- Happiness: ${currentState.happiness}/100 (-100 to +100 scale)
- Food Surplus: ${currentState.foodSurplus} units
- Day: ${currentState.day}

Current Crisis: ${problem.title}
Crisis Description: ${problem.description}

Proposed Solution: "${solution}"

Recent Decision History:
${recentDecisions || 'None yet'}

Evaluate this solution realistically. Consider:
1. How well does it address the crisis?
2. What are the economic costs/benefits?
3. How will citizens react (happiness impact)?
4. Are there unintended consequences?
5. Resource requirements and availability

Provide realistic impact values:
- Population change: -50 to +20 (deaths/births/migration)
- Gold change: -1000 to +500 (economic impact)
- Happiness change: -30 to +30 (citizen satisfaction)
- Food change: -100 to +100 (food production/consumption)

Format your response as JSON:
{
  "outcome": "A detailed description of what happens when this solution is implemented (max 150 characters)",
  "impact": {
    "population": 0,
    "gold": 0,
    "happiness": 0,
    "foodSurplus": 0
  }
}

Only respond with valid JSON, no additional text.`;
};

const parseDecisionFromGemini = (
  generatedText: string,
  solution: string,
  currentState: NationState,
  problem: GameProblem
): Decision => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.outcome || !parsed.impact) {
      throw new Error('Invalid JSON structure from Gemini');
    }

    // Validate and clamp impact values
    const impact = {
      population: Math.max(-50, Math.min(20, parsed.impact.population || 0)),
      gold: Math.max(-1000, Math.min(500, parsed.impact.gold || 0)),
      happiness: Math.max(-30, Math.min(30, parsed.impact.happiness || 0)),
      foodSurplus: Math.max(-100, Math.min(100, parsed.impact.foodSurplus || 0)),
    };

    return {
      day: currentState.day,
      problem: problem.title,
      solution,
      outcome: parsed.outcome.substring(0, 150), // Ensure max length
      impact,
    };
  } catch (error) {
    console.error('Error parsing Gemini decision response:', error);
    throw error;
  }
};

const processSolutionFallback = async (
  solution: string,
  currentState: NationState,
  problem: GameProblem,
  lastDecisions: Decision[]
): Promise<Decision> => {
  // Fallback to the original keyword-based processing
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