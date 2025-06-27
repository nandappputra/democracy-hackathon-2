import express from 'express';
import { createServer, getServerPort } from '@devvit/server';
import { getRedis } from '@devvit/redis';
import { GameResponse, InitGameResponse, ProcessDayResponse } from '../shared/types/democracy';
import {
  getGameState,
  setGameState,
  generateProblem,
  processSolution,
  applyDecisionImpact,
  getInitialGameState,
} from './core/democracy';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

// Initialize or get current game state
router.get<{}, GameResponse<InitGameResponse>>(
  '/api/game/init',
  async (_req, res): Promise<void> => {
    try {
      const redis = getRedis();
      const gameState = await getGameState(redis);

      res.json({
        status: 'success',
        gameState,
      });
    } catch (error) {
      console.error('Error initializing game:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Start a new game
router.post<{}, GameResponse<InitGameResponse>>(
  '/api/game/start',
  async (_req, res): Promise<void> => {
    try {
      const redis = getRedis();
      const gameState = getInitialGameState();

      // Generate first problem
      const firstProblem = await generateProblem(gameState.nationState, []);
      gameState.currentProblem = firstProblem;
      gameState.gameStarted = true;

      await setGameState(redis, gameState);

      res.json({
        status: 'success',
        gameState,
      });
    } catch (error) {
      console.error('Error starting game:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Process a day (this would be called by the scheduler)
router.post<{}, GameResponse<ProcessDayResponse>, { solution?: string }>(
  '/api/game/process-day',
  async (req, res): Promise<void> => {
    try {
      const { solution } = req.body;
      const redis = getRedis();
      const gameState = await getGameState(redis);

      if (!gameState.currentProblem) {
        res.status(400).json({
          status: 'error',
          message: 'No current problem to process',
        });
        return;
      }

      if (!solution) {
        res.status(400).json({
          status: 'error',
          message: 'Solution is required',
        });
        return;
      }

      // Process the solution
      const decision = await processSolution(
        solution,
        gameState.nationState,
        gameState.currentProblem,
        gameState.lastDecisions
      );

      // Apply the decision impact
      gameState.nationState = applyDecisionImpact(gameState.nationState, decision);

      // Add decision to history (keep only last 10)
      gameState.lastDecisions.push(decision);
      if (gameState.lastDecisions.length > 10) {
        gameState.lastDecisions = gameState.lastDecisions.slice(-10);
      }

      // Generate next problem if game is not over
      if (!gameState.nationState.isGameOver) {
        gameState.currentProblem = await generateProblem(
          gameState.nationState,
          gameState.lastDecisions
        );
      } else {
        gameState.currentProblem = null;
        gameState.gameStarted = false;
      }

      gameState.lastProcessedDay = gameState.nationState.day - 1;

      await setGameState(redis, gameState);

      res.json({
        status: 'success',
        success: true,
        newState: gameState,
      });
    } catch (error) {
      console.error('Error processing day:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get current game state
router.get<{}, GameResponse<{ gameState: any }>>(
  '/api/game/state',
  async (_req, res): Promise<void> => {
    try {
      const redis = getRedis();
      const gameState = await getGameState(redis);

      res.json({
        status: 'success',
        gameState,
      });
    } catch (error) {
      console.error('Error getting game state:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

app.use(router);

const port = getServerPort();
const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`Democracy Game server running on http://localhost:${port}`));
