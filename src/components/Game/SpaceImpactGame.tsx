'use client';

import React from 'react';
import { GameCanvas } from './GameCanvas';
import { GameControls } from './GameControls';
import { GameUI } from './GameUI';
import { useGameState } from '@/hooks/useGameState';

interface SpaceImpactGameProps {
  onBackToMenu: () => void;
}

export const SpaceImpactGame: React.FC<SpaceImpactGameProps> = ({
  onBackToMenu,
}) => {
  const {
    gameState,
    gameObjects,
    moveShip,
    moveShipToPosition,
    fireBullet,
    startGame,
    togglePause,
    resetGame,
    endGame,
  } = useGameState();

  // Restart game function
  const handleRestart = () => {
    resetGame();
    startGame();
  };

  // Enhanced back to menu function with cleanup
  const handleBackToMenu = () => {
    console.log('🏠 Returning to menu - ending game properly');
    endGame(); // Stop all intervals and cleanup
    resetGame(); // Reset to initial state
    onBackToMenu(); // Navigate back to menu
  };


  // Auto-start game when component mounts
  React.useEffect(() => {
    if (!gameState.isPlaying && !gameState.gameOver) {
      startGame();
    }
  }, [gameState.isPlaying, gameState.gameOver, startGame]);

  // Cleanup when component unmounts (when returning to menu)
  React.useEffect(() => {
    return () => {
      console.log('🧹 SpaceImpactGame component unmounting - cleaning up game state');
      endGame(); // This will stop all intervals and cleanup properly
      resetGame(); // Reset to initial state
    };
  }, [endGame, resetGame]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Info Bar (old style via #game-info, compact for mobile) */}
      <div id="game-info" style={{ zIndex: 40 }}>
        <div id="score">Score: <span>{gameState.score.toLocaleString()}</span></div>
        <div id="level">Lvl: <span>{gameState.level}</span></div>
        <div id="lives">Lives: <span>{gameState.lives}</span></div>
      </div>

      {/* Main wrapper (old layout via #game-wrapper) */}
      <div id="game-wrapper" style={{ height: '90vh', width: '100vw', padding: '0' }}>
        {/* Game Container (full width for mobile) */}
        <div id="game-container" className="relative" style={{ width: '100%', height: '100%' }}>
          <GameCanvas
            gameObjects={gameObjects}
            gameState={gameState}
            isPlaying={gameState.isPlaying}
            isPaused={gameState.isPaused}
          />

          {/* Game UI Overlay */}
          <GameUI
            gameState={gameState}
            gameObjects={gameObjects}
            onRestartGame={handleRestart}
            onBackToMenu={handleBackToMenu}
            onResumeGame={togglePause}
            gameStartTime={gameState.gameStartTime}
          />
        </div>
      </div>

      {/* Game Controls */}
      <GameControls
        onMoveLeft={() => moveShip('left')}
        onMoveRight={() => moveShip('right')}
        onMoveToPosition={moveShipToPosition}
        onFire={fireBullet}
        onPause={togglePause}
        onRestart={handleRestart}
        isPlaying={gameState.isPlaying}
        isPaused={gameState.isPaused}
        gameCompleted={gameState.gameCompleted}
        autoFire={true} // Enable auto fire for mobile arcade experience
      />

    </div>
  );
};
