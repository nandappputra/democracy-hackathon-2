import { Comment, Devvit, Post } from '@devvit/public-api';
import { getRedis } from '@devvit/redis';
import {
  getGameState,
  setGameState,
  generateProblem,
  processSolution,
  applyDecisionImpact,
  formatGameStateForPost,
  getInitialGameState,
  saveProblemPostId,
  getProblemPostId,
  saveCronJobId,
  getCronJobId,
} from '../server/core/democracy';

// Side effect import to bundle the server. The /index is required for server splitting.
import '../server/index';
import { defineConfig } from '@devvit/server';
import { postConfigNew } from '../server/core/post';
import { preinit } from 'react-dom';

// Configure Devvit to enable HTTP requests for Gemini API
Devvit.configure({
  http: true,
});

defineConfig({
  name: "DEMOCRACY",
  entry: 'index.html',
  height: 'tall',
  menu: { enable: false },
});

export const Preview: Devvit.BlockComponent<{ text?: string }> = ({
  text = 'Loading DEMOCRACY...',
}) => {
  return (
    <zstack width={'100%'} height={'100%'} alignment="center middle">
      <vstack width={'100%'} height={'100%'} alignment="center middle">
        <image
          url="loading.gif"
          description="Loading..."
          height={'140px'}
          width={'140px'}
          imageHeight={'240px'}
          imageWidth={'240px'}
        />
        <spacer size="small" />
        <text maxWidth={`80%`} size="large" weight="bold" alignment="center middle" wrap>
          {text}
        </text>
      </vstack>
    </zstack>
  );
};

// TODO: Remove this when defineConfig allows webhooks before post creation

Devvit.addSchedulerJob({
  name: '[dzikri V3] process-daily-decision',
  onRun: async (event, context) => {
    const { reddit, redis } = context;

    try {
      const gameState = await getGameState(redis);

      if (!gameState.gameStarted || !gameState.currentProblem || gameState.nationState.isGameOver) {
        console.log('No active game or problem to process');
        return;
      }

      // Get the current subreddit
      const subreddit = await reddit.getCurrentSubreddit();
      const lastProblemPostId = await getProblemPostId(redis);
      console.log('LAST ID IS', lastProblemPostId);
      const postAndComments = subreddit.getCommentsAndPostsByIds([lastProblemPostId]);
      const originalPost = (await postAndComments.all())[0] as Post;
      const allComments = await originalPost.comments.all();
      console.log('HERE ARE THE COMMENTS', allComments);
      console.log('HERE IS THE ID:', allComments[0]?.body);

      // Find the most upvoted comment (solution)
      const topComment = allComments.sort((a, b) => b.score - a.score)[0];
      console.log(topComment);

      if (!topComment || !topComment.body) {
        console.log('No valid solution found');
        return;
      }

      // Process the solution
      const decision = await processSolution(
        topComment.body,
        gameState.nationState,
        gameState.currentProblem,
        gameState.lastDecisions
      );

      // Apply the decision impact
      gameState.nationState = applyDecisionImpact(gameState.nationState, decision);

      // Add decision to history
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

      // Save updated game state
      await setGameState(redis, gameState);

      // Create a new post with the updated state
      const postContent = formatGameStateForPost(gameState);

      const post = await reddit.submitPost({
        title: gameState.nationState.isGameOver
          ? `💀 GAME OVER - Day ${gameState.nationState.day - 1} - The Nation Has Fallen!`
          : `🏛️ Day ${gameState.nationState.day} - ${gameState.currentProblem?.title || 'New Day'}`,
        text: postContent,
        subredditName: subreddit.name,
      });

      await saveProblemPostId(redis, post);

      console.log(`Processed day ${gameState.lastProcessedDay}, new state saved`);
    } catch (error) {
      console.error('Error processing daily decision:', error);
    }
  },
});

// Menu item to start a new game
Devvit.addMenuItem({
  label: '[dzikri V3] start new game!',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui, redis } = context;

    try {
      const subreddit = await reddit.getCurrentSubreddit();

      // Initialize new game state
      const gameState = getInitialGameState();
      const firstProblem = await generateProblem(gameState.nationState, []);
      gameState.currentProblem = firstProblem;
      gameState.gameStarted = true;

      await setGameState(redis, gameState);

      // Create initial post as regular text post (no preview/webview)
      const postContent = formatGameStateForPost(gameState);

      const post = await reddit.submitPost({
        title: `🏛️ Day 1 - ${firstProblem.title} - Democracy Game Begins!`,
        text: postContent,
        subredditName: subreddit.name,
      });

      await saveProblemPostId(redis, post);

      // Schedule daily processing (every 24 hours)
      const job = await context.scheduler.runJob({
        name: '[dzikri V3] process-daily-decision',
        cron: '0 0 * * *'
      });

      await saveCronJobId(redis, job);

      ui.showToast({ text: 'Democracy Game started! Daily processing scheduled.' });
      ui.navigateTo(post.url);
    } catch (error) {
      console.error('Error starting game:', error);
      ui.showToast({
        text: `Error starting game: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  },
});

// Menu item to manually process current day (for testing)
Devvit.addMenuItem({
  label: '[dzikri V3] Process Current Day',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, scheduler } = context;

    try {
      await scheduler.runJob({
        name: '[dzikri V3] process-daily-decision',
        runAt: new Date(Date.now() + 1000), // Run in 1 second
      });

      ui.showToast({ text: 'Processing current day...' });
    } catch (error) {
      console.error('Error processing day:', error);
      ui.showToast({
        text: `Error processing day: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  },
});

Devvit.addMenuItem({
  label: '[dzikri V3] Stop game',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, scheduler, redis } = context;

    try {
      const currentGameJobId = await getCronJobId(redis) as string;
      await scheduler.cancelJob(currentGameJobId)

      ui.showToast({ text: `Stopped scheduler: ${currentGameJobId}` });
    } catch (error) {
      console.error('Error processing day:', error);
      ui.showToast({
        text: `Error processing day: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  },
});

export default Devvit;
