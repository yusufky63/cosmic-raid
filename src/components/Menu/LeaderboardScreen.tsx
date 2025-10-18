'use client';

import React from 'react';

interface LeaderboardEntry {
  nickname: string;
  score: number;
  player: string;
  timestamp: number;
}

interface LeaderboardScreenProps {
  leaderboard: LeaderboardEntry[];
  onBack: () => void;
  isLoading?: boolean;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  leaderboard,
  onBack,
  isLoading = false,
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
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '0 24px' 
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#ffcc00', 
            marginBottom: '16px', 
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '2px',
            textShadow: '0 0 20px #ffcc00'
          }}>
            🏆 LEADERBOARD
          </h1>
          <p style={{ 
            color: '#ccc', 
            fontSize: '18px',
            fontFamily: '"Poppins", sans-serif'
          }}>
            Top players on the blockchain
          </p>
        </div>

        {/* Leaderboard content */}
        <div className="container-space-darker" style={{ padding: '24px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #0066ff',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p className="text-space-light">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaderboard.slice(0, 10).map((entry, index) => (
                <div
                  key={`${entry.player}-${entry.timestamp}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    backgroundColor: index === 0 
                      ? 'rgba(255, 204, 0, 0.2)' 
                      : index === 1 
                      ? 'rgba(192, 192, 192, 0.2)' 
                      : index === 2 
                      ? 'rgba(205, 127, 50, 0.2)' 
                      : 'rgba(0, 102, 255, 0.1)',
                    border: index === 0 
                      ? '2px solid #ffcc00' 
                      : index === 1 
                      ? '2px solid #c0c0c0' 
                      : index === 2 
                      ? '2px solid #cd7f32' 
                      : '2px solid #0066ff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flexShrink: 0 }}>
                      {index === 0 && <span style={{ fontSize: '24px' }}>🥇</span>}
                      {index === 1 && <span style={{ fontSize: '24px' }}>🥈</span>}
                      {index === 2 && <span style={{ fontSize: '24px' }}>🥉</span>}
                      {index > 2 && (
                        <span style={{ 
                          fontSize: '18px', 
                          fontWeight: 'bold', 
                          color: '#ccc',
                          fontFamily: '"Orbitron", sans-serif'
                        }}>
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '18px', 
                        color: '#fff',
                        fontFamily: '"Orbitron", sans-serif'
                      }}>
                        {entry.nickname}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        opacity: 0.75, 
                        fontFamily: 'monospace',
                        color: '#ccc'
                      }}>
                        {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '20px', 
                      fontFamily: 'monospace',
                      color: '#fff'
                    }}>
                      {entry.score.toLocaleString()}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      opacity: 0.75,
                      color: '#ccc'
                    }}>
                      points
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <p style={{ 
                color: '#ccc', 
                fontSize: '18px', 
                marginBottom: '8px',
                fontFamily: '"Poppins", sans-serif'
              }}>
                No scores yet!
              </p>
              <p style={{ 
                color: '#9ca3af',
                fontFamily: '"Poppins", sans-serif'
              }}>
                Be the first to submit a score on-chain.
              </p>
            </div>
          )}
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