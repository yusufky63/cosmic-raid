'use client';

import React from 'react';

interface MainMenuProps {
  onPlayGame: () => void;
  onShowLeaderboard: () => void;
  onShowHowToPlay: () => void;
  isWalletConnected: boolean;
  walletAddress?: string;
  onConnectWallet: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlayGame,
  onShowLeaderboard,
  onShowHowToPlay,
  isWalletConnected,
  walletAddress,
  onConnectWallet,
}) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      overflow: 'hidden',
      fontFamily: '"Orbitron", sans-serif'
    }}>
      {/* Animated stars background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              backgroundColor: '#fff',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main menu content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        textAlign: 'center', 
        maxWidth: '400px', 
        margin: '0 auto', 
        padding: '0 24px' 
      }}>
        {/* Game title */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 'bold', 
            color: '#ffcc00', 
            marginBottom: '16px', 
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '2px',
            textShadow: '0 0 20px #ffcc00'
          }}>
            SPACE
          </h1>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 'bold', 
            color: '#0066ff', 
            marginBottom: '24px', 
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '2px',
            textShadow: '0 0 20px #0066ff'
          }}>
            IMPACT
          </h1>
          <p style={{ 
            color: '#ccc', 
            fontSize: '18px', 
            fontWeight: '300',
            fontFamily: '"Poppins", sans-serif'
          }}>
            Defend Earth from alien invasion!
          </p>
        </div>

        {/* Wallet status */}
        <div className="container-space" style={{ marginBottom: '32px' }}>
          <h3 className="title-space">Wallet Connection</h3>
          {isWalletConnected ? (
            <div style={{ textAlign: 'center' }}>
              <p className="status-connected" style={{ fontSize: '14px', marginBottom: '8px' }}>
                Connected to Base Network
              </p>
              <p style={{ 
                color: '#ccc', 
                fontFamily: 'monospace', 
                fontSize: '12px', 
                marginBottom: '12px' 
              }}>
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p className="status-warning" style={{ fontSize: '14px', marginBottom: '12px' }}>
                Connect your wallet to save scores on-chain
              </p>
              <button
                onClick={onConnectWallet}
                className="btn-space-primary"
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                🔗 Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Menu buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={onPlayGame}
            className="btn-space-primary"
            style={{ 
              width: '100%', 
              fontSize: '20px', 
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #0066ff, #4c1d95)',
              textShadow: '0 0 10px rgba(0, 102, 255, 0.5)'
            }}
          >
            🚀 PLAY GAME
          </button>

          <button
            onClick={onShowLeaderboard}
            className="btn-space-primary"
            style={{ 
              width: '100%', 
              fontSize: '20px', 
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #ffcc00, #ff6b35)',
              textShadow: '0 0 10px rgba(255, 204, 0, 0.5)'
            }}
          >
            🏆 LEADERBOARD
          </button>

          <button
            onClick={onShowHowToPlay}
            className="btn-space-primary"
            style={{ 
              width: '100%', 
              fontSize: '20px', 
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              textShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
            }}
          >
            ❓ HOW TO PLAY
          </button>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '48px', 
          color: '#9ca3af', 
          fontSize: '14px',
          fontFamily: '"Poppins", sans-serif'
        }}>
          <p>Built for Farcaster on Base Network</p>
          <p style={{ marginTop: '8px' }}>🌟 Share your high scores with the community!</p>
        </div>
      </div>

      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              backgroundColor: '#0066ff',
              borderRadius: '50%',
              opacity: 0.3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `bounce ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};