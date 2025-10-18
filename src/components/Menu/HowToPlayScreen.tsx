'use client';

import React from 'react';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      overflow: 'hidden',
      fontFamily: '"Orbitron", sans-serif',
      padding: '20px 0'
    }}>
      {/* Animated stars background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              backgroundColor: '#fff',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 24px' 
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#8b5cf6', 
            marginBottom: '16px', 
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '2px',
            textShadow: '0 0 20px #8b5cf6'
          }}>
            ❓ HOW TO PLAY
          </h1>
          <p style={{ 
            color: '#ccc', 
            fontSize: '18px',
            fontFamily: '"Poppins", sans-serif'
          }}>
            Master the art of space combat
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px' 
        }}>
          {/* Controls Section */}
          <div className="card-space">
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#ffcc00', 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontFamily: '"Orbitron", sans-serif'
            }}>
              🎮 CONTROLS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '24px' }}>⬅️➡️</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Move Ship
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    A/D keys or Arrow keys
                  </div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '24px' }}>🚀</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Fire Bullets
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    Spacebar
                  </div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '24px' }}>⏸️</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Pause Game
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    P key or Escape
                  </div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '24px' }}>📱</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Mobile Controls
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    Touch buttons on screen
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gameplay Section */}
          <div className="card-space">
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#0066ff', 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontFamily: '"Orbitron", sans-serif'
            }}>
              🎯 GAMEPLAY
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: '"Orbitron", sans-serif' }}>
                  🎯 Objective
                </div>
                <div style={{ color: '#ccc', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                  Destroy enemies and survive as long as possible. Each enemy destroyed gives you 10 points.
                </div>
              </div>
              <div style={{ 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: '"Orbitron", sans-serif' }}>
                  ❤️ Lives System
                </div>
                <div style={{ color: '#ccc', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                  You start with 3 lives. Lose a life when enemies reach the bottom or hit you.
                </div>
              </div>
              <div style={{ 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: '"Orbitron", sans-serif' }}>
                  📈 Level Up
                </div>
                <div style={{ color: '#ccc', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                  Every 100 points, you advance to the next level. Enemies become faster and more frequent.
                </div>
              </div>
            </div>
          </div>

          {/* Enemies Section */}
          <div className="card-space">
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#dc2626', 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontFamily: '"Orbitron", sans-serif'
            }}>
              👾 ENEMIES
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#dc2626', borderRadius: '4px' }}></div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Basic Enemy
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    Moves straight down, easy target
                  </div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#ea580c', borderRadius: '4px' }}></div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Shooter Enemy
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    Fires bullets at you, be careful!
                  </div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#991b1b', borderRadius: '4px' }}></div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Kamikaze Enemy
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    Moves fast, tries to crash into you
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Power-ups Section */}
          <div className="card-space">
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#16a34a', 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontFamily: '"Orbitron", sans-serif'
            }}>
              ⚡ POWER-UPS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '24px' }}>❤️</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Extra Life
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    Adds one life (max 5 lives)
                  </div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '24px' }}>🔫</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Double Shot
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    Fire two bullets at once for 5 seconds
                  </div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px', 
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '24px' }}>⚡</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>
                    Speed Boost
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                    Move faster for 5 seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Section */}
        <div className="card-space" style={{ marginTop: '32px', borderColor: '#ffcc00' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#ffcc00', 
            marginBottom: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontFamily: '"Orbitron", sans-serif'
          }}>
            ⛓️ BLOCKCHAIN FEATURES
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: '"Orbitron", sans-serif' }}>
                💰 Connect Wallet
              </div>
              <div style={{ color: '#ccc', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                Connect your wallet to save scores permanently on the Base blockchain.
              </div>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: '"Orbitron", sans-serif' }}>
                🏆 Global Leaderboard
              </div>
              <div style={{ color: '#ccc', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                Compete with players worldwide. Your best scores are stored on-chain forever.
              </div>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: '"Orbitron", sans-serif' }}>
                📱 Farcaster Integration
              </div>
              <div style={{ color: '#ccc', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                Share your high scores directly to Farcaster and challenge your friends.
              </div>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: '"Orbitron", sans-serif' }}>
                🌐 Base Network
              </div>
              <div style={{ color: '#ccc', fontSize: '14px', fontFamily: '"Poppins", sans-serif' }}>
                Fast and cheap transactions on Ethereum&apos;s Layer 2 solution.
              </div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button
            onClick={onBack}
            className="btn-space-primary"
            style={{ 
              fontSize: '18px', 
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #6b7280, #374151)'
            }}
          >
            ← BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};