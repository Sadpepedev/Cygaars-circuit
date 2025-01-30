import React, { useState } from 'react';
import { Game } from './components/Game';
import { Leaderboard } from './components/Leaderboard';
import { useGameStore } from './store/gameStore';
import { Play, RefreshCw, Gamepad2, ChevronRight, ChevronDown } from 'lucide-react';

function App() {
  const { 
    isPlaying,
    gameOver,
    score,
    playerName,
    setPlaying,
    setPlayerName,
    resetGame
  } = useGameStore();

  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleStart = () => {
    if (!playerName.trim()) return;
    setPlaying(true);
  };

  const handlePlayAgain = () => {
    resetGame();
    setTimeout(() => {
      setPlaying(true);
    }, 50);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-winter-pattern">
      <div className="min-h-screen bg-black/30 backdrop-blur-sm py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Collapsible Leaderboard */}
          <div className="fixed top-8 left-8 z-10">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur text-blue-600 rounded-xl shadow-lg hover:bg-blue-50 transition-all mb-2"
            >
              {showLeaderboard ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              Top Players
            </button>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showLeaderboard ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="w-80">
                <Leaderboard />
              </div>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-block animate-float">
              <div className="relative">
                <Gamepad2 className="w-24 h-24 text-white opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12" />
                <h1 className="text-7xl font-bold text-white drop-shadow-[0_0_25px_rgba(0,0,0,0.5)] relative">
                  Cygaar's Circuit
                </h1>
              </div>
            </div>
            <p className="text-xl text-white/90 mt-4 font-medium drop-shadow-lg">
              Can you navigate through the rugs?
            </p>
          </div>
          
          <div className="relative grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {/* Game Container */}
            <div>
              {!isPlaying && !gameOver ? (
                <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-center mb-6">
                    <Gamepad2 className="w-12 h-12 text-blue-500 animate-float" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Welcome to the Circuit!
                  </h2>
                  
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h3 className="font-semibold mb-2 text-blue-800">How to Play:</h3>
                      <ul className="space-y-2 text-blue-700">
                        <li>• Click or press spacebar to make the penguin flap</li>
                        <li>• Avoid hitting the floating rugs</li>
                        <li>• Score points by passing through gaps</li>
                        <li>• Try to beat the high score!</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                      />
                      
                      <button
                        onClick={handleStart}
                        disabled={!playerName.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors font-semibold text-lg"
                      >
                        <Play className="w-6 h-6" />
                        Start Game
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Game />
                  
                  {gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm rounded-lg">
                      <div className="bg-white p-8 rounded-2xl text-center max-w-md w-full mx-4">
                        <h2 className="text-3xl font-bold mb-2 text-red-500">RUGGED!</h2>
                        <p className="text-2xl mb-6 text-blue-600">Final Score: {score}</p>
                        
                        <button
                          onClick={handlePlayAgain}
                          className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold text-lg"
                        >
                          <RefreshCw className="w-6 h-6" />
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-white/80">
          <p className="text-sm">© {currentYear} Cygaar's Circuit. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;