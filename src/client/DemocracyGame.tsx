import React, { useState, useEffect } from 'react';
import { GameState } from '../shared/types/democracy';

const Banner = () => {
  return (
    <div className="w-full bg-blue-600 text-white p-4 text-center mb-4">
      <p className="text-lg font-semibold">🏛️ Welcome to Democracy Game</p>
      <p className="text-sm">
        Visit{' '}
        <a
          href="https://www.reddit.com/r/TheDemocracyGame"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold"
        >
          r/TheDemocracyGame
        </a>{' '}
        to participate in the nation's decisions!
      </p>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; icon: string; color: string }> = ({
  title,
  value,
  icon,
  color,
}) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

export const DemocracyGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameState = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/game/init');
      const data = await response.json();
      
      if (data.status === 'success') {
        setGameState(data.gameState);
        setError(null);
      } else {
        setError(data.message || 'Failed to load game state');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching game state:', err);
    } finally {
      setLoading(false);
    }
  };

  const startNewGame = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setGameState(data.gameState);
        setError(null);
      } else {
        setError(data.message || 'Failed to start new game');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error starting new game:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameState();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Democracy Game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchGameState}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No game state available</p>
        </div>
      </div>
    );
  }

  const { nationState, currentProblem, lastDecisions, gameStarted } = gameState;

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏛️ The Nation of Democracy
          </h1>
          <p className="text-xl text-gray-600">Day {nationState.day}</p>
          {nationState.isGameOver && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
              <p className="text-red-800 font-bold text-lg">💀 GAME OVER</p>
              <p className="text-red-700">The nation has fallen! Population reached zero.</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Population"
            value={`${nationState.population} citizens`}
            icon="👥"
            color="border-blue-500"
          />
          <StatCard
            title="Gold"
            value={`${nationState.gold} coins`}
            icon="💰"
            color="border-yellow-500"
          />
          <StatCard
            title="Happiness"
            value={`${nationState.happiness}/100`}
            icon="😊"
            color="border-green-500"
          />
          <StatCard
            title="Food Surplus"
            value={`${nationState.foodSurplus} units`}
            icon="🌾"
            color="border-orange-500"
          />
        </div>

        {/* Current Problem */}
        {currentProblem && gameStarted && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ⚠️ Current Crisis: {currentProblem.title}
            </h2>
            <p className="text-gray-700 text-lg mb-4">{currentProblem.description}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-semibold">
                💡 What should the nation do?
              </p>
              <p className="text-blue-700">
                Visit the subreddit and comment your solution. The most upvoted solution will be implemented!
              </p>
            </div>
          </div>
        )}

        {/* Recent Decisions */}
        {lastDecisions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📜 Recent Decisions</h2>
            <div className="space-y-4">
              {lastDecisions.slice(-5).reverse().map((decision, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4">
                  <h3 className="font-semibold text-gray-900">
                    Day {decision.day}: {decision.problem}
                  </h3>
                  <p className="text-gray-700 italic">Solution: {decision.solution}</p>
                  <p className="text-gray-600">Outcome: {decision.outcome}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {decision.impact.population !== 0 && (
                      <span className={`px-2 py-1 rounded text-sm ${
                        decision.impact.population > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        👥 {decision.impact.population > 0 ? '+' : ''}{decision.impact.population}
                      </span>
                    )}
                    {decision.impact.gold !== 0 && (
                      <span className={`px-2 py-1 rounded text-sm ${
                        decision.impact.gold > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        💰 {decision.impact.gold > 0 ? '+' : ''}{decision.impact.gold}
                      </span>
                    )}
                    {decision.impact.happiness !== 0 && (
                      <span className={`px-2 py-1 rounded text-sm ${
                        decision.impact.happiness > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        😊 {decision.impact.happiness > 0 ? '+' : ''}{decision.impact.happiness}
                      </span>
                    )}
                    {decision.impact.foodSurplus !== 0 && (
                      <span className={`px-2 py-1 rounded text-sm ${
                        decision.impact.foodSurplus > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        🌾 {decision.impact.foodSurplus > 0 ? '+' : ''}{decision.impact.foodSurplus}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Controls */}
        <div className="text-center">
          {!gameStarted || nationState.isGameOver ? (
            <button
              onClick={startNewGame}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Starting...' : nationState.isGameOver ? 'Start New Game' : 'Start Game'}
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🗳️ How to Participate
              </h3>
              <ol className="text-left text-blue-800 space-y-2">
                <li>1. Visit the subreddit r/TheDemocracyGame</li>
                <li>2. Find the current crisis post</li>
                <li>3. Comment your solution to the problem</li>
                <li>4. Upvote solutions you agree with</li>
                <li>5. The most upvoted solution will be implemented daily</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};