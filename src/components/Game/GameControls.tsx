'use client';

import React, { useEffect, useRef } from 'react';

interface GameControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onFire: () => void;
  onPause: () => void;
  onRestart?: () => void;
  onMoveToPosition?: (x: number) => void; // New: direct position control
  isPlaying: boolean;
  isPaused: boolean;
  gameCompleted?: boolean;
  autoFire?: boolean; // New: auto fire mode
}

export const GameControls: React.FC<GameControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onFire,
  onPause,
  onRestart,
  onMoveToPosition,
  isPlaying,
  isPaused,
  gameCompleted,
  autoFire = true, // Default to auto fire for mobile
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isMoving = useRef<boolean>(false);
  const lastMoveTime = useRef<number>(0);
  const autoFireInterval = useRef<NodeJS.Timeout | null>(null);
  // const gameAreaRef = useRef<HTMLDivElement>(null); // Unused

  // Auto fire system - fire continuously when game is active
  useEffect(() => {
    if (autoFire && isPlaying && !isPaused) {
      autoFireInterval.current = setInterval(() => {
        onFire();
      }, 120); // Fire every 120ms for rapid arcade action
    } else {
      if (autoFireInterval.current) {
        clearInterval(autoFireInterval.current);
        autoFireInterval.current = null;
      }
    }

    return () => {
      if (autoFireInterval.current) {
        clearInterval(autoFireInterval.current);
      }
    };
  }, [autoFire, isPlaying, isPaused, onFire]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      // Horizontal movement with A/D or left/right arrow keys
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        onMoveLeft();
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        onMoveRight();
      }
      
      // Fire bullet with spacebar
      if (e.key === ' ') {
        e.preventDefault();
        onFire();
      }
      
      // Pause with P key
      if (e.key === 'p' || e.key === 'P') {
        onPause();
      }
      
      // Restart with R key (when game completed)
      if ((e.key === 'r' || e.key === 'R') && gameCompleted && onRestart) {
        onRestart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onMoveLeft, onMoveRight, onFire, onPause, onRestart, gameCompleted]);

  // Modern touch & drag controls for arcade gaming
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPlaying) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isMoving.current = true;
    lastMoveTime.current = Date.now();
    
    // Direct position control if supported
    if (onMoveToPosition) {
      const x = touch.clientX - rect.left;
      const relativeX = x / rect.width; // 0 to 1
      onMoveToPosition(relativeX);
    }
    
    // Manual fire on initial touch (auto fire will continue)
    if (!autoFire) {
      onFire();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPlaying || !isMoving.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const now = Date.now();
    
    // Throttle to 60fps for smooth performance
    if (now - lastMoveTime.current < 16) return;
    
    // Direct position control (modern arcade style)
    if (onMoveToPosition) {
      const x = touch.clientX - rect.left;
      const relativeX = Math.max(0, Math.min(1, x / rect.width)); // Clamp 0-1
      onMoveToPosition(relativeX);
    } else {
      // Fallback to direction-based movement
      const deltaX = touch.clientX - (touchStartX.current || 0);
      const threshold = 10;
      
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onMoveRight();
        } else {
          onMoveLeft();
        }
        touchStartX.current = touch.clientX;
      }
    }
    
    lastMoveTime.current = now;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    isMoving.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
    lastMoveTime.current = 0;
  };

  return (
    <div 
      className="absolute inset-0 z-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Enhanced Pause Button */}
      <div className="absolute top-4 right-4" style={{ zIndex: 30 }}>
        <button
          onClick={onPause}
          className="font-bold text-sm transition-all duration-200 font-orbitron"
          style={{
            padding: '10px 16px',
            background: isPaused 
              ? 'linear-gradient(135deg, #00bfff, #0080ff)' 
              : 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,20,0.9))',
            border: `2px solid ${isPaused ? 'rgba(0,191,255,0.4)' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: '12px',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            boxShadow: isPaused 
              ? '0 0 20px rgba(0,191,255,0.3), 0 4px 15px rgba(0,0,0,0.2)'
              : '0 0 15px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)',
            zIndex: 30
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)';
            e.currentTarget.style.boxShadow = isPaused
              ? '0 0 30px rgba(0,191,255,0.5), 0 6px 20px rgba(0,0,0,0.3)'
              : '0 0 20px rgba(255,255,255,0.2), 0 6px 15px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = isPaused 
              ? '0 0 20px rgba(0,191,255,0.3), 0 4px 15px rgba(0,0,0,0.2)'
              : '0 0 15px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)';
          }}
        >
          {isPaused ? '▶' : 'II'}
        </button>
      </div>

      {/* Enhanced Game Status */}
      <div className="absolute top-4 left-4" style={{ zIndex: 30 }}>
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl font-orbitron"
             style={{
               background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,20,0.9))',
               border: '1px solid rgba(255,255,255,0.2)',
               backdropFilter: 'blur(10px)',
               boxShadow: '0 0 15px rgba(0,0,0,0.5)'
             }}>
          <div className={`w-2 h-2 rounded-full ${
            isPaused ? 'bg-yellow-400 animate-pulse' : 
            isPlaying ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className="text-white text-xs font-bold tracking-wider">
            {isPaused ? 'PAUSED' : isPlaying ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>

      {/* Modern Touch Instructions - Show briefly on mobile */}
      {autoFire && (
        <div className="absolute bottom-6 left-4 md:hidden pointer-events-none" style={{ zIndex: 25 }}>
          <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg text-xs opacity-75">
            📱 Touch & drag to move • Auto fire enabled
          </div>
        </div>
      )}

      {/* Manual fire instructions for desktop */}
      {!autoFire && (
        <div className="absolute bottom-6 right-4 hidden md:block pointer-events-none" style={{ zIndex: 25 }}>
          <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg text-xs opacity-75">
            SPACE to fire • A/D to move
          </div>
        </div>
      )}

    </div>
  );
};

