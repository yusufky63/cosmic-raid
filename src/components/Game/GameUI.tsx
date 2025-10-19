'use client';

import React, { useState } from 'react';
import { useAccount, useSwitchChain, useChainId, useConnect } from 'wagmi';
import { base } from 'wagmi/chains';
import { sdk } from '@farcaster/miniapp-sdk';
import { GameState, GameObjects } from '@/types/game';
import { useCosmosRaidContract } from '@/hooks/useCosmosRaidContract';
import { CosmosRaidGameData } from '@/types/blockchain';

interface GameUIProps {
  gameState: GameState;
  gameObjects: GameObjects;
  onRestartGame: () => void;
  onBackToMenu: () => void;
  onResumeGame?: () => void;
  gameStartTime?: number; // Track when game started for score submission
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  gameObjects,
  onRestartGame,
  onBackToMenu,
  onResumeGame,
  gameStartTime = Date.now(),
}) => {
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { address, isConnected } = useAccount();
  const { submitScore, isPending } = useCosmosRaidContract();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { connectors, connect } = useConnect();

  // Combo display HUD
  const comboHud = (() => {
    const combo = gameState.combo;
    const now = Date.now();
    const timeLeft = Math.max(0, combo.comboEndTime - now);
    
    if (combo.consecutiveHits > 0 && timeLeft > 0) {
      // const comboLevel = Math.min(Math.floor(combo.consecutiveHits / 3), 5); // Unused
      // const isHighCombo = combo.consecutiveHits >= 10; // Unused
      const isEnding = timeLeft <= 1000; // Blink in last 1 second
      
      return (
        <div className="absolute top-20 left-2 z-30">
          <div className={`bg-black/80 rounded-lg border border-yellow-400/30 px-2 py-1 shadow-sm backdrop-blur-sm ${isEnding ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-1">
              <div className="text-xs font-bold text-yellow-300">
                {combo.consecutiveHits}x
              </div>
              <div className="text-[10px] text-yellow-200/80">
                {combo.multiplier.toFixed(1)}×
              </div>
            </div>
            <div className="mt-1 h-0.5 bg-black/40 rounded">
              <div 
                className="h-full bg-yellow-400 rounded transition-all duration-100" 
                style={{ width: `${(timeLeft / 3000) * 100}%` }}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  })();

  // Right-side active power-ups HUD (render alongside other UI)
  const powerUpHud = (() => {
    const now = Date.now();
    const activePowerUps = (gameState.powerUps || []).filter(p => p.active);
    if (activePowerUps.length > 0) {
      return (
        <div className="absolute top-20 right-2 z-30 flex flex-col gap-2">
          {activePowerUps.map((p, idx) => {
            const total = p.duration || 0;
            const remaining = p.endTime ? Math.max(0, p.endTime - now) : total;
            const pct = total > 0 ? Math.max(0, Math.min(100, Math.floor((remaining / total) * 100))) : 0;
            const isEnding = remaining <= 3000; // blink in last 3s
            const label = p.type.toUpperCase();
            return (
              <div key={idx} className={`w-40 bg-black/70 rounded-lg border border-white/10 p-2 shadow ${isEnding ? 'animate-pulse' : ''}`}>
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`/images/power-up/${
                      p.type === 'doubleShot' ? 'double-shot' :
                      p.type === 'tripleShot' ? 'triple-shot' :
                      p.type === 'speedBoost' ? 'speed-boost' :
                      p.type === 'laserBeam' ? 'laser-beam' :
                      p.type === 'timeSlow' ? 'time-slow' :
                      p.type
                    }.png`} 
                    alt={p.type} 
                    className="w-6 h-6" 
                  />
                  <div className="flex-1 text-xs text-white/80 font-mono truncate">{label}</div>
                  <div className="text-[10px] text-white/60 font-mono">{Math.ceil(remaining / 1000)}s</div>
                </div>
                <div className="mt-1 h-1.5 bg-white/10 rounded">
                  <div className="h-full bg-cyan-400 rounded" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  })();

  // Minimal pause menu screen
  if (gameState.isPaused && gameState.isPlaying) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ zIndex: 50 }}>
        <div className="w-64 text-center rounded-lg border border-white/20 bg-black/80 backdrop-blur-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white">
            PAUSED
          </h2>
          
          {/* Menu Options */}
          <div className="space-y-2">
            <button
              onClick={onResumeGame}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded border border-white/20 font-medium transition-all"
            >
              Resume
            </button>
            
            <button
              onClick={onRestartGame}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded border border-white/20 font-medium transition-all"
            >
              Restart
            </button>

            <button
              onClick={onBackToMenu}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded border border-white/20 font-medium transition-all"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Share score function
  const handleShareScore = async () => {
    try {
      const shareText = `🚀 Just scored ${gameState.score.toLocaleString()} points and reached Level ${gameState.level} in Cosmic Raid! 

🛸 Epic space combat with progressive ship upgrades
⚡ Battle through 10 challenging boss fights
🌌 Defend the galaxy in this epic shooter!

Think you can beat my score? 🎯`;

      await sdk.actions.composeCast({
        text: shareText,
        embeds: ['https://cosmic-raid.vercel.app']
      });
    } catch (error) {
      console.error('Failed to share score:', error);
    }
  };

  // Handle save score function
  const handleSaveScore = async () => {
    // Check wallet connection
    if (!isConnected || !address) {
      // Don't set error, user should click connect wallet button instead
      return;
    }

    // Check if on Base network
    if (chainId !== base.id) {
      try {
        await switchChain({ chainId: base.id });
      } catch (switchError) {
        console.error('Network switch error:', switchError);
        setErrorMessage('Please switch to Base network to save your score');
        setSubmitStatus('error');
        return;
      }
    }

    setIsSubmittingScore(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const gameTimeSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
      
      const gameDataForContract: CosmosRaidGameData = {
        score: gameState.score,
        level: gameState.level,
        time: gameTimeSeconds, // No time cap - play as long as you want!
        lives: 0, // Game is over, so 0 lives
        playerAddress: address
      };

      console.log('Submitting score to blockchain:', gameDataForContract);
      console.log('Validation check:', {
        score: `${gameState.score} (max: 10000000)`,
        level: `${gameState.level} (max: 50)`,
        time: `${gameTimeSeconds} (no limit - infinity!)`,
        lives: '0 (valid)',
        playerAddress: `${address} (length: ${address?.length})`
      });

      await submitScore(gameDataForContract);
      
      setSubmitStatus('success');
      console.log('Score submitted successfully!');
      
    } catch (error) {
      console.error('Error saving score:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save score');
      setSubmitStatus('error');
    } finally {
      setIsSubmittingScore(false);
    }
  };

      // Game over screen - modern design
      if (gameState.gameOver) {
        return (
          <div id="end-screen" className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 50 }}>
            <div className="max-w-lg w-[90%] mx-auto text-center rounded-xl bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-2xl border border-gray-700/50 shadow-2xl p-6">
              {/* Header */}
              <div className="mb-4">
             
                <h2 className="text-xl font-semibold text-white mb-1">Mission Failed</h2>
                <p className="text-gray-400 text-sm">Better luck next time, pilot</p>
              </div>

              {/* Stats Grid */}
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg border border-white/10 py-3 px-2">
                  <div className="text-xs text-gray-400 mb-1">Score</div>
                  <div className="text-lg font-bold text-white">{gameState.score.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/10 py-3 px-2">
                  <div className="text-xs text-gray-400 mb-1">Level</div>
                  <div className="text-lg font-bold text-white">{gameState.level}</div>
                </div>
              </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 text-xs sm:text-sm">
              ✅ Score saved to blockchain successfully!
            </div>
          )}

          {submitStatus === 'error' && errorMessage && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 text-xs sm:text-sm">
              ❌ {errorMessage}
            </div>
          )}

          {!isConnected && (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="w-full mb-4 py-3 px-6 font-bold text-white font-orbitron rounded-lg bg-blue-600 hover:bg-blue-500 transition-all duration-200 text-sm"
            >
              🔗 CONNECT WALLET TO SAVE SCORE
            </button>
          )}

          {isConnected && chainId !== base.id && (
            <button
              onClick={() => switchChain({ chainId: base.id })}
              className="w-full mb-4 py-3 px-6 font-bold text-white font-orbitron rounded-lg bg-orange-600 hover:bg-orange-500 transition-all duration-200 text-sm"
            >
              🔗 SWITCH TO BASE NETWORK
            </button>
          )}

          <div className="space-y-3">
            {/* Save to Blockchain Button */}
            {submitStatus !== 'success' && (
              <button
                onClick={handleSaveScore}
                disabled={isSubmittingScore || isPending}
                className={`w-full py-3 px-6 font-bold font-orbitron rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                  isSubmittingScore || isPending
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                }`}
              >
                {isSubmittingScore || isPending ? '💾 SAVING...' : ' SAVE TO LEADERBOARD'}
              </button>
            )}

            <button
              onClick={handleShareScore}
              className="w-full py-3 px-6 font-bold  text-xs sm:text-sm text-white font-orbitron rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all duration-200"
            >
              SHARE SCORE
            </button>

            <button
              onClick={onRestartGame}
              className="w-full py-3 px-6 font-bold text-xs sm:text-sm text-white font-orbitron rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all duration-200"
            >
              PLAY AGAIN
            </button>

            <button
              onClick={onBackToMenu}
              className="w-full py-3 px-6 font-bold text-xs sm:text-sm text-white font-orbitron rounded-lg bg-white/10 hover:bg-white/15 transition-all duration-200"
            >
              BACK TO MENU
            </button>
          </div>

          {/* Free to play notice */}
         
        </div>
      </div>
    );
  }

  // Game completed screen - modern design
  if (gameState.gameCompleted) {
    return (
      <div id="end-screen" className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 50 }}>
        <div className="max-w-sm w-[90%] mx-auto text-center rounded-xl bg-gradient-to-b from-yellow-900/95 to-black/95 backdrop-blur-2xl border border-yellow-600/50 shadow-2xl p-6">
          {/* Header */}
          <div className="mb-4">
           
            <h2 className="text-xl font-semibold text-yellow-400 mb-1">Victory!</h2>
            <p className="text-yellow-200/70 text-sm">Galaxy defended successfully!</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="bg-yellow-500/10 rounded-lg border border-yellow-400/20 py-3 px-2">
              <div className="text-xs text-yellow-300 mb-1">Final Score</div>
              <div className="text-lg font-bold text-yellow-400">{gameState.score.toLocaleString()}</div>
            </div>
            <div className="bg-yellow-500/10 rounded-lg border border-yellow-400/20 py-3 px-2">
              <div className="text-xs text-yellow-300 mb-1">Level</div>
              <div className="text-lg font-bold text-yellow-400">{gameState.level}</div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 text-sm">
              ✅ Score saved to blockchain successfully!
            </div>
          )}

          {submitStatus === 'error' && errorMessage && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 text-sm">
              ❌ {errorMessage}
            </div>
          )}

          {!isConnected && (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="w-full mb-4 py-3 px-6 font-bold text-white font-orbitron rounded-lg bg-blue-600 hover:bg-blue-500 transition-all duration-200 text-sm"
            >
              🔗 CONNECT WALLET TO SAVE SCORE
            </button>
          )}

          {isConnected && chainId !== base.id && (
            <button
              onClick={() => switchChain({ chainId: base.id })}
              className="w-full mb-4 py-3 px-6 font-bold text-white font-orbitron rounded-lg bg-orange-600 hover:bg-orange-500 transition-all duration-200 text-sm"
            >
              🔗 SWITCH TO BASE NETWORK
            </button>
          )}

          <div className="space-y-3">
            {/* Save to Blockchain Button */}
            {submitStatus !== 'success' && (
              <button
                onClick={handleSaveScore}
                disabled={isSubmittingScore || isPending}
                className={`w-full py-3 px-6 font-bold font-orbitron rounded-lg transition-all duration-200 text-sm ${
                  isSubmittingScore || isPending
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-300 text-black'
                }`}
              >
                {isSubmittingScore || isPending ? '💾 SAVING...' : '💾 SAVE TO LEADERBOARD'}
              </button>
            )}

            <button
              onClick={handleShareScore}
              className="w-full py-3 px-6 font-bold text-white font-orbitron rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 text-sm"
            >
              SHARE VICTORY
            </button>

            <button
              onClick={onRestartGame}
              className="w-full py-3 px-6 font-bold text-white font-orbitron rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 text-sm"
            >
              PLAY AGAIN
            </button>

            <button
              onClick={onBackToMenu}
              className="w-full py-3 px-6 font-bold text-white font-orbitron rounded-lg bg-white/10 hover:bg-white/15 transition-all duration-200 text-sm"
            >
              BACK TO MENU
            </button>
          </div>

          {/* Free to play notice */}
         
        </div>
      </div>
    );
  }

  // Boss health bar
  if (gameState.isBossFight && gameObjects.boss) {
    const boss = gameObjects.boss;
    const healthPercentage = (boss.health / boss.maxHealth) * 100;
    const statusLabel =
      healthPercentage > 75 ? '' :
      healthPercentage > 50 ? '' :
      healthPercentage > 25 ? '' : '';
    
    // Better boss names
    const getBossDisplayName = (type: string) => {
      const names: { [key: string]: string } = {
        'destroyer': 'DESTROYER',
        'interceptor': 'INTERCEPTOR',
        'cruiser': 'CRUISER',
        'battleship': 'BATTLESHIP',
        'dreadnought': 'DREADNOUGHT',
        'carrier': 'CARRIER',
        'behemoth': 'BEHEMOTH',
        'colossus': 'COLOSSUS',
        'leviathan': 'LEVIATHAN',
        'titan': 'TITAN'
      };
      return names[type] || type.toUpperCase();
    };
    
    return (
      <>
        {comboHud}
        {powerUpHud}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 w-[92vw] max-w-[320px] px-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between bg-black/65 backdrop-blur-sm rounded-full px-3 py-1.5 border border-red-500/40 shadow-[0_0_12px_rgba(255,0,0,0.15)]">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-red-300 font-semibold">
                  {getBossDisplayName(boss.type)}
                </span>
              </div>
              <span className="text-[10px] text-white/60 font-mono">
                Lv {gameState.level}
              </span>
            </div>
            <div className="h-2.5 bg-black/70 rounded-full border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-300 transition-all duration-400 ease-out shadow-[0_0_10px_rgba(255,0,0,0.35)]"
                style={{ width: `${Math.max(0, Math.min(healthPercentage, 100))}%` }}
              />
            </div>
            <div className="text-[9px] text-center uppercase tracking-[0.25em] text-white/45">
              {statusLabel}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Pause Menu Overlay
  const pauseMenu = gameState.isPaused ? (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="text-center px-8 py-6 bg-black/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl shadow-2xl max-w-sm w-full mx-4" 
           style={{
             background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(10,10,30,0.8))',
             boxShadow: '0 0 40px rgba(0,191,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
           }}>
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-orbitron text-white mb-2"
              style={{
                background: 'linear-gradient(135deg, #ffd700, #00bfff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
            MISSION PAUSED
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto" />
        </div>

        {/* Enhanced Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-3 border border-yellow-400/20 backdrop-blur-sm">
            <div className="text-yellow-300 font-bold text-lg font-mono">{gameState.score.toLocaleString()}</div>
            <div className="text-yellow-200/60 text-xs uppercase tracking-widest">Score</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-3 border border-blue-400/20 backdrop-blur-sm">
            <div className="text-blue-300 font-bold text-lg font-mono">{gameState.level}</div>
            <div className="text-blue-200/60 text-xs uppercase tracking-widest">Level</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-3 border border-red-400/20 backdrop-blur-sm">
            <div className="text-red-300 font-bold text-lg font-mono">{gameState.lives}</div>
            <div className="text-red-200/60 text-xs uppercase tracking-widest">Lives</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onResumeGame}
            className="w-full py-3 px-6 font-bold text-white font-orbitron rounded-lg transition-all duration-200 text-sm"
            style={{
              background: 'linear-gradient(135deg, #00bfff, #0080ff)',
              border: '1px solid rgba(0,191,255,0.3)',
              boxShadow: '0 0 20px rgba(0,191,255,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,191,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,191,255,0.2)';
            }}
          >
            ▶ RESUME MISSION
          </button>
          
          <button
            onClick={onRestartGame}
            className="w-full py-3 px-6 font-bold text-white font-orbitron rounded-lg transition-all duration-200 text-sm"
            style={{
              background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
              border: '1px solid rgba(255,215,0,0.3)',
              boxShadow: '0 0 20px rgba(255,215,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255,215,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255,215,0,0.2)';
            }}
          >
            🔄 RESTART LEVEL
          </button>
          
          <button
            onClick={onBackToMenu}
            className="w-full py-3 px-6 font-bold text-white font-orbitron rounded-lg transition-all duration-200 text-sm"
            style={{
              background: 'linear-gradient(135deg, #666, #444)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
            }}
          >
            🏠 MAIN MENU
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-400/60 font-mono flex items-center justify-center gap-2">
          <div className="w-1 h-1 bg-blue-400/50 rounded-full animate-pulse" />
          <span>Press P or tap pause to resume</span>
          <div className="w-1 h-1 bg-blue-400/50 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {comboHud}
      {powerUpHud}
      {pauseMenu}
    </>
  );
};
