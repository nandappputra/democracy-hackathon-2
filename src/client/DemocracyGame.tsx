import React, { useState, useEffect } from 'react';
import { GameState } from '../shared/types/democracy';
import bolt from '../../assets/bolt_white.png';
import {
  HelpCircle,
  Clock,
  Repeat,
  Globe,
  Users,
  Coins,
  Heart,
  Wheat,
  AlertTriangle,
  History,
  Vote,
  LucideIcon
} from 'lucide-react';

const Banner = () => {
  return (
    <div className="w-full bg-gradient-to-r from-blue-800 to-blue-600 shadow-xl text-white p-4">
      <div className="flex justify-between items-center space-y-1">
        <div className="flex items-center space-x-1">
          <div className="p-2">
            <h1>🏛️</h1>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Democracy</h1>
            <p className="text-blue-200 text-lg">Reddit Nation Simulation</p>
          </div>
        </div>

        <a href="https://bolt.new/" className="flex-shrink">
          <img
            className="w-full max-w-15 h-auto"
            src={bolt}
            alt="Bolt logo"
          />
        </a>
      </div>
    </div>
  );
};

const HowToPlay = () => {
  const steps = [
    {
      icon: Vote,
      title: "Propose Solutions",
      description: "Comment your solution to the current crisis and upvote others' ideas"
    },
    {
      icon: Clock,
      title: "Daily Processing",
      description: "Every 24 hours, the top solution is implemented automatically"
    },
    {
      icon: Repeat,
      title: "Survive & Adapt",
      description: "Keep the population above 0 to continue the democratic experiment"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
        How to Play
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
              <step.icon className="h-4 w-4 text-blue-600" />
            </div>
            <div className='text-left'>
              <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Remember:</strong> This is a collaborative game. The nation's fate 
          depends on the collective wisdom of the Reddit community!
        </p>
      </div>
    </div>
  );
}

const StatCard: React.FC<{
  title: string;
  value: number;
  threshold: number;
  description: string;
  icon: LucideIcon;
  color: string;
}> = ({ title, value, threshold, description, icon: Icon, color }) => {
  const fromColor = `from-${color}-100`;
  const toColor = `to-${color}-600`;
  const textColor = `text-${color}-600`;
  const progressColor = `bg-${color}-600`;

  return (
    <div className={`bg-gradient-to-br ${fromColor} ${toColor} p-4 rounded-xl`}>
      <div className="flex items-center justify-between">
        <Icon className={`${textColor}`} />
        <div className="text-end">
          <div className="text-sm">{title}</div>
          <span className={`text-2xl font-bold`}>
            {value}{description}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className={`${progressColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${(value <= 0) ? 0 : Math.min((value / threshold) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  )
};

export const DemocracyGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
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
        <HowToPlay />

        {/* Introduction */}
        <div className="bg-white border border-blue-200 rounded-lg shadow-md p-4 mb-4">
          <div className="text-left mb-3">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Globe className="h-6 w-6 text-blue-600 mr-2" />
              The Nation of Democracy
            </h2>
            <p className="text-xl text-gray-600">Day {nationState.day}</p>
            {nationState.isGameOver && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
                <p className="text-red-800 font-bold text-lg">💀 GAME OVER</p>
                <p className="text-red-700">The nation has fallen! Population reached zero.</p>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-1 gap-3">
            <StatCard
              title="Population"
              value={nationState.population}
              threshold={200}
              description=" citizens"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Gold"
              value={nationState.gold}
              threshold={2000}
              description=" coins"
              icon={Coins}
              color="yellow"
            />
            <StatCard
              title="Happiness"
              value={nationState.happiness}
              threshold={100}
              description="/100"
              icon={Heart}
              color="pink"
            />
            <StatCard
              title="Food Surplus"
              value={nationState.foodSurplus}
              threshold={200}
              description=" units"
              icon={Wheat}
              color="green"
            />
          </div>
        </div>

        {/* Current Problem */}
        {currentProblem && gameStarted && (
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-4 mb-4">
            <div className="flex flex-col items-start gap-4">
              <div className="flex justify-between items-center">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 ml-2">Current Crisis: {currentProblem.title}</h3>
              </div>

              <p className="text-gray-700 text-lg">{currentProblem.description}</p>

              <div className="flex">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Decision Needed</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Citizens are waiting for leadership. Submit your solution on the subreddit 
                        and rally support through upvotes. The community will decide the nation's fate!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Decisions */}
        {lastDecisions.length > 0 && (
          <div className="bg-white border border-blue-200 rounded-lg shadow-md p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <History className="h-5 w-5 text-gray-600 mr-2" />
              Recent Decisions
            </h3>

            <div className="space-y-4">
              {lastDecisions
                .slice(-3)
                .reverse()
                .map((decision, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <h3 className="font-semibold text-gray-900">
                      Day {decision.day}: {decision.problem}
                    </h3>
                    <p className="text-gray-700 italic">Solution: {decision.solution}</p>
                    <p className="text-gray-600">Outcome: {decision.outcome}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {decision.impact.population !== 0 && (
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            decision.impact.population > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          👥 {decision.impact.population > 0 ? '+' : ''}
                          {decision.impact.population}
                        </span>
                      )}
                      {decision.impact.gold !== 0 && (
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            decision.impact.gold > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          💰 {decision.impact.gold > 0 ? '+' : ''}
                          {decision.impact.gold}
                        </span>
                      )}
                      {decision.impact.happiness !== 0 && (
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            decision.impact.happiness > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          😊 {decision.impact.happiness > 0 ? '+' : ''}
                          {decision.impact.happiness}
                        </span>
                      )}
                      {decision.impact.foodSurplus !== 0 && (
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            decision.impact.foodSurplus > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          🌾 {decision.impact.foodSurplus > 0 ? '+' : ''}
                          {decision.impact.foodSurplus}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
