import { Users, MessageSquare, Clock, TrendingUp, ArrowRight, Youtube, ExternalLink, Brain, Zap, BarChart3, Cpu } from 'lucide-react';
import CountdownTimer from './components/CountdownTimer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/the_democracy_game.png" 
                  alt="The Democracy Game" 
                  className="border rounded-lg w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">The Democracy Game</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden xs:block">AI-Powered Reddit Democracy</p>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Bolt Attribution - Always visible */}
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group flex-shrink-0"
                title="Powered by Bolt"
              >
                <img 
                  src="/black_circle_360x360.png" 
                  alt="Bolt" 
                  className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200 flex-shrink-0"
                />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline whitespace-nowrap">Powered by Bolt</span>
                <span className="text-xs font-medium sm:hidden">Bolt</span>
              </a>
              
              {/* Main CTA */}
              <a
                href="https://reddit.com/r/TheDemocracyGame"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1.5 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm flex-shrink-0"
              >
                <span className="hidden sm:inline">Join r/TheDemocracyGame</span>
                <span className="sm:hidden">Join Game</span>
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered Democratic Experiment
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Democracy Meets
              <span className="text-blue-600 block">Artificial Intelligence</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of collective decision-making. Advanced AI generates realistic crises while 
              your Reddit community votes on solutions that dynamically impact virtual society resources.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://reddit.com/r/TheDemocracyGame"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Playing Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <button className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200">
              Watch Demo
              <Youtube className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Countdown Timer Section */}
        <div className="mb-20">
          <div className="max-w-2xl mx-auto">
            <CountdownTimer />
          </div>
        </div>

        {/* AI Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Large Language Models drive every aspect of the game, creating dynamic scenarios and processing community decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Crisis Generation</h3>
              <p className="text-gray-600">LLM creates realistic, evolving problems based on current society state and historical context</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Solution Parsing</h3>
              <p className="text-gray-600">AI analyzes community proposals and calculates precise impacts on population, resources, and stability</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dynamic Resource System</h3>
              <p className="text-gray-600">Every decision affects food, energy, population, and morale with realistic consequences</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Active Players</h3>
            <p className="text-gray-600">Join thousands participating in AI-driven democracy</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">24 Hour Cycles</h3>
            <p className="text-gray-600">AI processes decisions and generates new crises daily</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Driven</h3>
            <p className="text-gray-600">Every vote shapes the AI's next scenario generation</p>
          </div>
        </div>

        {/* How to Play Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Play
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience democracy enhanced by artificial intelligence in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                </div>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Propose Solutions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Comment your solution to the AI-generated crisis and upvote others' ideas. 
                    The LLM will analyze all proposals for feasibility and impact.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                </div>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">AI Processing</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every 24 hours, our LLM processes the top-voted solution, calculating 
                    precise impacts on resources, population, and society stability.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                </div>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Survive & Adapt</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Watch as your decisions reshape society. The AI generates new crises 
                    based on your choices. Keep resources positive to continue the experiment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Mechanics Deep Dive */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The AI Engine Behind Democracy
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our sophisticated LLM system creates a living, breathing society that responds intelligently to every community decision
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Crisis Generation</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  The AI analyzes current society metrics (population, resources, stability) and historical decisions 
                  to generate contextually relevant crises that feel organic and challenging.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Examples:</strong> Food shortages after poor agricultural decisions, 
                  civil unrest following unpopular policies, natural disasters requiring resource allocation
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Cpu className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Solution Analysis</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Each community proposal is parsed by the LLM to determine realistic outcomes. 
                  The AI considers feasibility, resource costs, and potential unintended consequences.
                </p>
                <div className="text-sm text-gray-500">
                  <strong>Factors:</strong> Resource requirements, implementation time, 
                  public support, long-term sustainability, and cascading effects
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Shape AI-Powered Democracy?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of players in the most advanced political experiment on Reddit. 
            Your decisions will be analyzed by cutting-edge AI to create unprecedented democratic realism.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://reddit.com/r/TheDemocracyGame"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-lg"
            >
              Join the Experiment
              <ExternalLink className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/the_democracy_game.png" 
                  alt="The Democracy Game" 
                  className="border rounded-lg w-8 h-8 object-contain"
                />
              </div>
              <span className="font-semibold">The Democracy Game</span>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="https://reddit.com/r/TheDemocracyGame"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                Subreddit
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 The Democracy Game. An AI-powered Reddit social experiment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;