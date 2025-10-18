import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GameState,
  GameObjects,
  GAME_CONFIG,
  Position,
  Enemy,
  Bullet,
  PowerUp,
  Boss,
  BossType,
  BossPhase,
  PowerUpType,
  BossAI,
  Particle,
  BossMovementPattern,
} from "@/types/game";

const initialGameState: GameState = {
  score: 0,
  lives: 3,
  level: 1,
  scoreAtLevelStart: 0,
  isPlaying: false,
  isPaused: false,
  gameOver: false,
  gameCompleted: false,
  hasDoubleShot: false,
  hasSpeedBoost: false,
  isBossFight: false,
  bossJustDefeated: false,
  powerUps: [],
  isInvincible: false,
  invincibilityEndTime: 0,
  isFlashing: false,
  hasShield: false,
  playerShotTier: 1,
  combo: {
    consecutiveHits: 0,
    multiplier: 1.0,
    lastHitTime: 0,
    comboTimer: 0,
    maxCombo: 0,
    comboEndTime: 0,
  },
  screenShake: 0, // No screen shake initially
};

const initialGameObjects: GameObjects = {
  ship: {
    x: GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.SHIP_UPGRADES.basic.width / 2, // Merkez
    y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.SHIP_UPGRADES.basic.height - 30, // Alt kısım - yukarı taşındı
    width: GAME_CONFIG.SHIP_UPGRADES.basic.width,
    height: GAME_CONFIG.SHIP_UPGRADES.basic.height,
    speed: GAME_CONFIG.SHIP_SPEED,
  },
  bullets: [],
  enemies: [],
  enemyBullets: [],
  powerUps: [],
  boss: null,
  explosions: [],
  particles: [],
  level: 1,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameObjects, setGameObjects] =
    useState<GameObjects>(initialGameObjects);
  const gameLoopRef = useRef<number>(0);
  const enemySpawnRef = useRef<number>(0);
  const powerUpSpawnRef = useRef<number>(0);
  const waveSpawnRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastPlayerShotRef = useRef<number>(0);
  
  // Mobile detection for optimized firing rates and performance
  const isMobile = typeof window !== 'undefined' && 
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
     ('ontouchstart' in window && navigator.maxTouchPoints > 0) || // Better touch detection
     (window.innerWidth <= 768 && 'ontouchstart' in window)); // Only count small screens with touch support
  
  // Debug log for mobile detection (only log once)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const touchSupport = 'ontouchstart' in window && navigator.maxTouchPoints > 0;
      const screenSize = window.innerWidth <= 768;
      console.log(`🎮 Game Mode Detection:
        - User Agent Mobile: ${userAgent}
        - Touch Support: ${touchSupport} (maxTouchPoints: ${navigator.maxTouchPoints || 0})
        - Small Screen: ${screenSize} (${window.innerWidth}px)
        - Final Mobile Mode: ${isMobile ? '📱 MOBILE (50 FPS)' : '🖥️ DESKTOP (60 FPS)'}
        - Window Size: ${window.innerWidth}x${window.innerHeight}`);
    }
  }, [isMobile]);

  // Collision detection
  const checkCollision = useCallback(
    (
      obj1: Position & { width: number; height: number },
      obj2: Position & { width: number; height: number }
    ) => {
      // Null check to prevent errors
      if (!obj1 || !obj2) return false;

      return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
      );
    },
    []
  );

  // Create explosion effect
  const createExplosion = useCallback(
    (x: number, y: number, type: "enemy" | "boss" | "player" = "enemy") => {
      const size = type === "boss" ? 80 : 60;
      setGameObjects((prev) => ({
        ...prev,
        explosions: [
          ...prev.explosions,
          {
            x: x - size / 2,
            y: y - size / 2,
            width: size,
            height: size,
            frame: 0,
            maxFrames: 12,
            type,
          },
        ],
      }));
    },
    []
  );

  // Combo system functions
  const updateCombo = useCallback((hit: boolean = false) => {
    const now = Date.now();

    setGameState((prev) => {
      const newCombo = { ...prev.combo };

      if (hit) {
        // Successful hit - increase combo
        newCombo.consecutiveHits += 1;
        newCombo.lastHitTime = now;
        newCombo.comboEndTime = now + GAME_CONFIG.COMBO_TIMEOUT;
        newCombo.maxCombo = Math.max(
          newCombo.maxCombo,
          newCombo.consecutiveHits
        );

        // Calculate multiplier based on combo level
        const comboLevel = Math.min(
          Math.floor(newCombo.consecutiveHits / 3),
          GAME_CONFIG.MAX_COMBO_LEVEL
        );
        newCombo.multiplier = GAME_CONFIG.COMBO_MULTIPLIERS[comboLevel] || 1.0;
      } else if (now > newCombo.comboEndTime && newCombo.consecutiveHits > 0) {
        // Combo timeout - reset combo
        newCombo.consecutiveHits = 0;
        newCombo.multiplier = 1.0;
        newCombo.comboEndTime = 0;
      }

      return { ...prev, combo: newCombo };
    });
  }, []);

  // Calculate score with combo multiplier
  const calculateScore = useCallback(
    (baseScore: number, comboMultiplier: number = 1.0) => {
      return Math.floor(baseScore * comboMultiplier);
    },
    []
  );

  // Particle system functions
  const createParticles = useCallback(
    (
      x: number,
      y: number,
      count: number,
      type: Particle["type"] = "spark",
      colors?: string[]
    ) => {
      const particles: Particle[] = [];
      const defaultColors = {
        spark: ["#FFD700", "#FFA500", "#FF4500"],
        smoke: ["#666666", "#999999", "#CCCCCC"],
        fire: ["#FF0000", "#FF4500", "#FFD700"],
        magic: ["#9932CC", "#4169E1", "#00BFFF"],
      };

      const particleColors = colors || defaultColors[type];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 4;
        const life = 30 + Math.random() * 30;

        particles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          life: life,
          maxLife: life,
          color:
            particleColors[Math.floor(Math.random() * particleColors.length)],
          type: type,
        });
      }

      setGameObjects((prev) => ({
        ...prev,
        particles: [...prev.particles, ...particles],
      }));
    },
    []
  );

  // Enhanced explosion with particles
  const createEnhancedExplosion = useCallback(
    (x: number, y: number, type: "enemy" | "boss" | "player" = "enemy") => {
      // Original explosion
      createExplosion(x, y, type);

      // Add particles based on explosion type
      const particleCount = type === "boss" ? 15 : type === "player" ? 8 : 10;
      const particleType =
        type === "boss" ? "fire" : type === "player" ? "smoke" : "spark";

      createParticles(x, y, particleCount, particleType);
    },
    [createExplosion, createParticles]
  );

  // Move ship - daha hÄ±zlÄ± hareket
  const moveShip = useCallback(
    (direction: "left" | "right") => {
      if (!gameState.isPlaying || gameState.isPaused) return;

      setGameObjects((prev) => {
        const speed = GAME_CONFIG.SHIP_SPEED; // 15 - daha hızlı
        const newX =
          direction === "left"
            ? Math.max(0, prev.ship.x - speed)
            : Math.min(
                GAME_CONFIG.CANVAS_WIDTH - prev.ship.width,
                prev.ship.x + speed
              );

        return {
          ...prev,
          ship: { ...prev.ship, x: newX },
        };
      });
    },
    [gameState.isPlaying, gameState.isPaused]
  );

  // Move ship to position - touch-based movement for modern mobile controls
  const moveShipToPosition = useCallback(
    (relativeX: number) => {
      if (!gameState.isPlaying || gameState.isPaused) return;

      setGameObjects((prev) => {
        const canvasWidth = GAME_CONFIG.CANVAS_WIDTH;
        const shipWidth = prev.ship.width;
        const targetX = relativeX * (canvasWidth - shipWidth);
        const clampedX = Math.max(
          0,
          Math.min(canvasWidth - shipWidth, targetX)
        );

        // Smooth movement to prevent jarring
        const currentX = prev.ship.x;
        const maxMovePerFrame = 20; // Max pixels per frame for smooth movement
        const deltaX = clampedX - currentX;
        const smoothX =
          Math.abs(deltaX) > maxMovePerFrame
            ? currentX + Math.sign(deltaX) * maxMovePerFrame
            : clampedX;

        return {
          ...prev,
          ship: { ...prev.ship, x: smoothX },
        };
      });
    },
    [gameState.isPlaying, gameState.isPaused]
  );

  // Fire bullet with cooldown - Level based shooting
  const fireBullet = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const now = Date.now();
    const scoreFireBonus = Math.floor(gameState.score / 1000) * 10; // Every 1000 points = 10ms faster
    const levelFireBonus = (gameState.level - 1) * 5; // Each level = 5ms faster
    const baseFireRate = 400;
    const playerFireRate = Math.max(
      200,
      baseFireRate - scoreFireBonus - levelFireBonus
    ); // Slower shooting with progress

    // Check cooldown
    if (now - lastPlayerShotRef.current < playerFireRate) {
      return; // Too soon to fire again
    }

    lastPlayerShotRef.current = now;

    const hasLaserBeam =
      gameState.powerUps?.some((p) => p.type === "laserBeam" && p.active) ||
      false;
    let consumeLaserBeam = false;

    setGameObjects((prev) => {
      const newBullets: Bullet[] = [];
      const scoreSpeedBonus = Math.floor(gameState.score / 2000) * 1; // Every 2000 points = +1 speed
      const levelSpeedBonus = (gameState.level - 1) * 0.5; // Each level = +0.5 speed
      const bulletSpeed =
        GAME_CONFIG.BULLET_SPEED + scoreSpeedBonus + levelSpeedBonus; // Slower bullets with progress
              // Level-based bullet size: reduce by 20px for levels 20+ (Commander/Legend/Supreme)
              const baseBulletSize = Math.min(
        8,
        4 +
          (gameState.level - 1) * 0.3 +
          Math.floor(gameState.score / 3000) * 0.2
      );
      const bulletSize = gameState.level >= 20 ? Math.max(3, baseBulletSize - 2) : baseBulletSize; // 20px smaller for high-level ships

      // Calculate spread based on ship size and level
      const shipSize = Math.max(prev.ship.width, prev.ship.height);
      const baseSpread = shipSize * 1.1; // Wider base spread
      const levelSpread = baseSpread + (gameState.level - 1) * 6; // Faster growth
      const maxSpread = Math.min(220, levelSpread); // Larger cap

      // Ship-based shooting patterns: base on ship upgrade + temporary power-ups
      const hasDoubleShot =
        gameState.powerUps?.some((p) => p.type === "doubleShot" && p.active) ||
        false;
      const hasTripleShot =
        gameState.powerUps?.some((p) => p.type === "tripleShot" && p.active) ||
        false;
      const shipConfig = GAME_CONFIG.getShipConfig(gameState.level);
      const baseShots = shipConfig.shotCount; // 1,2,3,4,5 based on ship upgrade
      const powerUpBonus = hasTripleShot ? 2 : hasDoubleShot ? 1 : 0;
      const maxShots = Math.min(7, baseShots + powerUpBonus); // Max 7 shots total

      // During boss fight, allow all shots
      const finalShotCount = maxShots;

      if (finalShotCount >= 5) {
        // Level 40+ Supreme ship: 5-shot cross pattern
        const centerX = prev.ship.x + prev.ship.width / 2;
        const centerY = prev.ship.y;
        const spacing = 18;

        newBullets.push(
          {
            x: centerX - spacing * 2,
            y: centerY,
            width: bulletSize,
            height: bulletSize * 2,
            speed: bulletSpeed,
            direction: "up" as const,
            damage: shipConfig.damage,
          },
          {
            x: centerX - spacing,
            y: centerY,
            width: bulletSize,
            height: bulletSize * 2,
            speed: bulletSpeed,
            direction: "up" as const,
            damage: shipConfig.damage,
          },
          {
            x: centerX - bulletSize / 2,
            y: centerY,
            width: bulletSize,
            height: bulletSize * 2,
            speed: bulletSpeed,
            direction: "up" as const,
            damage: shipConfig.damage,
          },
          {
            x: centerX + spacing - bulletSize / 2,
            y: centerY,
            width: bulletSize,
            height: bulletSize * 2,
            speed: bulletSpeed,
            direction: "up" as const,
            damage: shipConfig.damage,
          },
          {
            x: centerX + spacing * 2 - bulletSize / 2,
            y: centerY,
            width: bulletSize,
            height: bulletSize * 2,
            speed: bulletSpeed,
            direction: "up" as const,
            damage: shipConfig.damage,
          }
        );
      } else if (finalShotCount >= 4) {
        // Level 12+ or very high score: 4-shot spread
        for (let i = 0; i < 4; i++) {
          const angle = (i - 1.5) * 0.4;
          const spreadX =
            prev.ship.x +
            Math.floor(prev.ship.width / 2) +
            Math.sin(angle) * (maxSpread * 0.9);
          newBullets.push({
            x: spreadX - bulletSize / 2,
            y: prev.ship.y,
            width: bulletSize,
            height: bulletSize * 2,
            speed: bulletSpeed,
            direction: "up" as const,
            damage: shipConfig.damage,
          });
        }
      } else if (finalShotCount >= 3) {
        // Level 9+ or high score: 3-shot spread
        for (let i = 0; i < 3; i++) {
          const angle = (i - 1) * 0.5;
          const spreadX =
            prev.ship.x +
            Math.floor(prev.ship.width / 2) +
            Math.sin(angle) * (maxSpread * 0.85);
          newBullets.push({
            x: spreadX - bulletSize / 2,
            y: prev.ship.y,
            width: bulletSize,
            height: bulletSize * 2,
            speed: bulletSpeed,
            direction: "up" as const,
            damage: shipConfig.damage,
          });
        }
      } else if (finalShotCount >= 2) {
        // Level 6+ or medium score: 2-shot spread
        newBullets.push(
          {
            x:
              prev.ship.x + Math.floor(prev.ship.width * 0.25) - bulletSize / 2,
            y: prev.ship.y,
            width: bulletSize,
            height: bulletSize * 2,
            speed: bulletSpeed,
            direction: "up" as const,
          },
          {
            x:
              prev.ship.x + Math.floor(prev.ship.width * 0.75) - bulletSize / 2,
            y: prev.ship.y,
            width: bulletSize,
            height: bulletSize * 2,
            speed: bulletSpeed,
            direction: "up" as const,
          }
        );
      } else {
        // Level 1-5 or low score: Single shot
        newBullets.push({
          x: prev.ship.x + Math.floor(prev.ship.width / 2) - bulletSize / 2,
          y: prev.ship.y,
          width: bulletSize,
          height: bulletSize * 2,
          speed: bulletSpeed,
          direction: "up" as const,
        });
      }

      if (hasLaserBeam) {
        consumeLaserBeam = true;
        newBullets.push({
          x: prev.ship.x + Math.floor(prev.ship.width / 2) - 18,
          y: prev.ship.y - 80,
          width: 36,
          height: 80,
          speed: bulletSpeed * 2.2,
          direction: "up" as const,
          damage: 5,
        });
      }

      return {
        ...prev,
        bullets: [...prev.bullets, ...newBullets],
      };
    });

    if (consumeLaserBeam) {
      setGameState((prev) => ({
        ...prev,
        powerUps: prev.powerUps.filter(
          (p) => !(p.type === "laserBeam" && p.active)
        ),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameState.isPlaying,
    gameState.isPaused,
    gameState.level,
    gameState.powerUps,
    gameState.isBossFight,
    gameState.score,
    gameState.playerShotTier,
  ]);

  // Spawn enemy - eski oyunun 
  const spawnEnemy = useCallback(() => {
    // Current state'i al
    setGameState((currentState) => {
      console.log("spawnEnemy called", {
        isBossFight: currentState.isBossFight,
        isPaused: currentState.isPaused,
        isPlaying: currentState.isPlaying,
      });

      // Don't spawn enemies during boss fight or when paused
      if (
        currentState.isBossFight ||
        currentState.isPaused ||
        !currentState.isPlaying
      ) {
        console.log("Spawn blocked:", {
          isBossFight: currentState.isBossFight,
          isPaused: currentState.isPaused,
          isPlaying: currentState.isPlaying,
        });
        return currentState; // State'i değiştirme
      }

      console.log("Spawning enemy...");

      const type = Math.random();
      let enemyType: Enemy["type"] = "basic";

      // Level-based enemy spawning with balanced distribution
      if (currentState.level >= 20) {
        // Level 20+: All enemy types
        if (type < 0.2) {
          enemyType = "basic";
        } else if (type < 0.35) {
          enemyType = "shooter";
        } else if (type < 0.5) {
          enemyType = "kamikaze";
        } else if (type < 0.65) {
          enemyType = "bomber";
        } else if (type < 0.8) {
          enemyType = "stealth";
        } else {
          enemyType = "assassin";
        }
      } else if (currentState.level >= 15) {
        // Level 15-19: More advanced enemies
        if (type < 0.3) {
          enemyType = "basic";
        } else if (type < 0.5) {
          enemyType = "shooter";
        } else if (type < 0.7) {
          enemyType = "kamikaze";
        } else if (type < 0.85) {
          enemyType = "bomber";
        } else {
          enemyType = "stealth";
        }
      } else if (currentState.level >= 10) {
        // Level 10-14: Mid-tier enemies
        if (type < 0.4) {
          enemyType = "basic";
        } else if (type < 0.6) {
          enemyType = "shooter";
        } else if (type < 0.8) {
          enemyType = "kamikaze";
        } else {
          enemyType = "bomber";
        }
      } else if (currentState.level >= 5) {
        // Level 5-9: Basic enemies with some variety
        if (type < 0.5) {
          enemyType = "basic";
        } else if (type < 0.8) {
          enemyType = "shooter";
        } else {
          enemyType = "kamikaze";
        }
      } else {
        // Level 1-4: Only basic enemies
        if (type < 0.7) {
          enemyType = "basic";
        } else {
          enemyType = "shooter";
        }
      }

      const enemyConfig = GAME_CONFIG.ENEMY_TYPES[enemyType];
      const newEnemy: Enemy = {
        x: Math.max(
          60, // Mobile-friendly: 60px margin from left edge
          Math.random() *
            (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.ENEMY_SIZE - 120) + 60 // 60px margin from both edges
        ),
        y: -GAME_CONFIG.ENEMY_SIZE - 200, // Düşmanları daha uzaktan başlatıyorum (-200 ekstra)
        width: GAME_CONFIG.SHIP_WIDTH,
        height: GAME_CONFIG.SHIP_HEIGHT,
        speed: enemyConfig.speed + Math.min(24, currentState.level - 1) * 0.2, // Cap speed increase at level 25
        type: enemyType,
        health: enemyConfig.health,
        lastShot: Date.now(),
      };

      setGameObjects((prev) => {
        const newEnemies = [...prev.enemies, newEnemy];
        console.log(
          `Enemy spawned: ${enemyType} at (${newEnemy.x}, ${newEnemy.y}). Total enemies: ${newEnemies.length}`
        );
        return {
          ...prev,
          enemies: newEnemies,
        };
      });

      return currentState; // State'i değiştirme
    });
  }, []);

  // Spawn power-up with intelligent selection
  const spawnPowerUp = useCallback(() => {
    // Spawn power-ups both during regular play and boss fights; only block when paused or not playing
    if (gameState.isPaused || !gameState.isPlaying) {
      return;
    }

    // Smart power-up selection based on player needs
    let selectedType: PowerUpType;
    const isLowHealth = gameState.lives <= 2;
    const isEarlyGame = gameState.level <= 10;
    const isBossFight = gameState.isBossFight;

    if (isLowHealth && Math.random() < 0.4) {
      // 40% chance for heart when low on health (reduced from 60%)
      selectedType = "heart";
    } else if (isEarlyGame && Math.random() < 0.4) {
      // Early game: favor basic power-ups and hearts
      const earlyTypes: PowerUpType[] = [
        "heart",
        "doubleShot",
        "speedBoost",
        "shield",
      ];
      selectedType = earlyTypes[Math.floor(Math.random() * earlyTypes.length)];
    } else if (isBossFight && Math.random() < 0.3) {
      // Boss fight: favor defensive and damage power-ups
      const bossTypes: PowerUpType[] = [
        "heart",
        "shield",
        "invincibility",
        "tripleShot",
        "timeSlow",
      ];
      selectedType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    } else {
      // Balanced distribution - all power-ups have equal chance
      const allTypes: PowerUpType[] = [
        "heart", // Only 1x heart weight for balance
        "doubleShot",
        "tripleShot",
        "speedBoost",
        "shield",
        "invincibility",
        "magnet",
        "laserBeam",
        "timeSlow",
      ];
      selectedType = allTypes[Math.floor(Math.random() * allTypes.length)];
    }

    const newPowerUp: PowerUp = {
      x: Math.max(40, Math.random() * (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.POWER_UP_SIZE - 80) + 40), // Mobile-friendly: 40px margins for power-ups
      y: -GAME_CONFIG.POWER_UP_SIZE - 100,
      width: GAME_CONFIG.POWER_UP_SIZE,
      height: GAME_CONFIG.POWER_UP_SIZE,
      speed: 3.5, // Reasonable speed
      type: selectedType,
      active: false,
      duration: 0,
    };

    console.log(
      `💊 Power-up spawned: ${selectedType} (Health: ${gameState.lives}, Level: ${gameState.level}, Boss: ${isBossFight})`
    );

    setGameObjects((prev) => ({
      ...prev,
      powerUps: [...prev.powerUps, newPowerUp],
    }));
  }, [
    gameState.isPaused,
    gameState.isPlaying,
    gameState.lives,
    gameState.level,
    gameState.isBossFight,
  ]);

  // Spawn boss
  const spawnBoss = useCallback((level: number) => {
    let bossType: BossType;

    // Simplified boss type selection based on level
    if (level >= 50) {
      bossType = "colossus";
    } else if (level >= 45) {
      bossType = "leviathan";
    } else if (level >= 40) {
      bossType = "behemoth";
    } else if (level >= 35) {
      bossType = "titan";
    } else if (level >= 30) {
      bossType = "carrier";
    } else if (level >= 25) {
      bossType = "dreadnought";
    } else if (level >= 20) {
      bossType = "battleship";
    } else if (level >= 15) {
      bossType = "cruiser";
    } else if (level >= 10) {
      bossType = "interceptor";
    } else {
      bossType = "destroyer"; // Default for levels 5-9
    }

    const bossConfig = GAME_CONFIG.BOSS_TYPES[bossType];

    // Scale boss by level: more health and faster firing as level increases
    const levelDelta = Math.max(0, level - 5);
    const levelScale = 1 + levelDelta * 0.08; // +8% per level after 5
    const scaledHealth = Math.floor(bossConfig.health * levelScale);
    const scaledFireRate = Math.max(
      bossConfig.fireRate,
      Math.floor(bossConfig.fireRate / (1 + levelDelta * 0.04))
    ); // Allow base fire rates
    const scaledSpecialRate = Math.max(
      2200,
      Math.floor(bossConfig.specialAttackRate / (1 + levelDelta * 0.03))
    );
    const scaledSpeed = Math.min(
      bossConfig.speed + levelDelta * 0.05,
      bossConfig.speed + 1.4
    );

    const spawnTime = Date.now();

    // Initialize AI system based on boss type and level - scaled difficulty
    const isEarlyLevel = level <= 5;
    const startingPhase: BossPhase = isEarlyLevel ? "normal" : "aggressive";
    const startingAggression = isEarlyLevel
      ? 0.1
      : Math.min(0.4, 0.1 + (level - 5) * 0.05);

    const bossAI: BossAI = {
      currentPhase: startingPhase, // Normal for early levels, aggressive later
      movementPattern:
        bossType === "destroyer"
          ? "horizontal"
          : bossType === "interceptor"
          ? "figure8"
          : bossType === "cruiser"
          ? "circle"
          : bossType === "colossus"
          ? "vertical"
          : "horizontal",
      phaseChangeTime: spawnTime + (isEarlyLevel ? 8000 : 5000), // Longer phase duration early on
      patternStartTime: spawnTime,
      aggressionLevel: startingAggression, // Scale aggression with level
    };

    const newBoss: Boss = {
      x: GAME_CONFIG.CANVAS_WIDTH / 2 - bossConfig.width / 2,
      y: 100, // Start at top of screen
      width: bossConfig.width,
      height: bossConfig.height,
      speed: scaledSpeed,
      type: bossType,
      health: scaledHealth,
      maxHealth: scaledHealth,
      fireRate: scaledFireRate,
      specialAttackRate: scaledSpecialRate,
      lastShot: spawnTime - scaledFireRate - 500, // Force immediate first shot with extra buffer
      lastSpecialAttack:
        spawnTime - Math.max(1500, Math.floor(scaledSpecialRate * 0.6)),
      isActive: true,
      ai: bossAI,
    };

    // Pause enemy spawning during boss fight
    if (enemySpawnRef.current) {
      clearInterval(enemySpawnRef.current);
      enemySpawnRef.current = 0;
    }
    if (waveSpawnRef.current) {
      clearInterval(waveSpawnRef.current);
      waveSpawnRef.current = 0;
    }
    if (powerUpSpawnRef.current) {
      clearInterval(powerUpSpawnRef.current);
      powerUpSpawnRef.current = 0;
    }

    // Single setGameObjects call to prevent race conditions and teleportation
    setGameObjects((prev) => ({
      ...prev,
      boss: newBoss,
      enemies: [], // Clear enemies
      enemyBullets: [], // Clear enemy bullets
      powerUps: [], // Clear power-ups
      // Ship position is preserved from prev
    }));

    setGameState((prev) => {
      console.log(
        `🛸 Boss spawned! Level ${prev.level}, Boss type: ${bossType}, FireRate: ${scaledFireRate}ms, Health: ${scaledHealth}, Phase: aggressive`
      );
      return { ...prev, isBossFight: true, bossJustDefeated: false };
    });
  }, []);

  // Start game
  const startGame = useCallback(() => {
    console.log("Starting game...");

    // Önce state'leri set et
    setGameState(initialGameState);
    setGameObjects(initialGameObjects);

    // isPlaying'i true yap
    setGameState((prev) => {
      console.log("Setting isPlaying to true");
      return { ...prev, isPlaying: true };
    });

    // İlk düşmanı hemen spawn et
    const r = Math.random();
    const enemyType: Enemy["type"] =
      r < 0.4 ? "basic" : r < 0.7 ? "shooter" : "kamikaze";
    const cfg = GAME_CONFIG.ENEMY_TYPES[enemyType];
    const s = GAME_CONFIG.ENEMY_SIZE;
    const e: Enemy = {
      x: Math.max(60, Math.random() * (GAME_CONFIG.CANVAS_WIDTH - s - 120) + 60), // Mobile-friendly spawn margins
      y: -s - 200,
      width: s,
      height: s,
      speed: cfg.speed,
      type: enemyType,
      health: cfg.health,
      lastShot: Date.now(),
    };
    setGameObjects((prev) => ({ ...prev, enemies: [...prev.enemies, e] }));

    // Spawn interval'larını başlat - setTimeout ile gecikme ekle
    setTimeout(() => {
      console.log("Starting enemy spawn intervals...");

      // Daha hızlı başlangıç: Her 1.8 saniyede 1 düşman spawn et
      enemySpawnRef.current = window.setInterval(() => {
        console.log("Spawn interval triggered");
        spawnEnemy();
      }, 1800);

      // Daha hızlı dalga: Her 5 saniyede 1 düşman (wave)
      waveSpawnRef.current = window.setInterval(() => {
        console.log("Wave spawn interval triggered");
        spawnEnemy();
      }, 5000);

      // Power-up spawn (çok daha sık)
      powerUpSpawnRef.current = window.setInterval(spawnPowerUp, 5000); // Much more frequent power-ups

      console.log("All spawn intervals started");
    }, 100); // 100ms gecikme
  }, [spawnEnemy, spawnPowerUp]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setGameState((prev) => {
      const newPausedState = !prev.isPaused;

      if (newPausedState) {
        // Pause - stop all spawning
        if (enemySpawnRef.current) {
          clearInterval(enemySpawnRef.current);
          enemySpawnRef.current = 0;
        }
        if (waveSpawnRef.current) {
          clearInterval(waveSpawnRef.current);
          waveSpawnRef.current = 0;
        }
        if (powerUpSpawnRef.current) {
          clearInterval(powerUpSpawnRef.current);
          powerUpSpawnRef.current = 0;
        }
      } else {
        // Resume - restart spawning if not in boss fight
        if (!prev.isBossFight) {
          const currentLevel = prev.level;
          const newSpawnInterval = Math.max(
            1500,
            5000 - (currentLevel - 1) * 200
          );
          const newWaveInterval = Math.max(
            6000,
            12000 - (currentLevel - 1) * 500
          );
          const newWaveEnemyCount = Math.min(
            4,
            2 + Math.floor((currentLevel - 1) / 3)
          );

          enemySpawnRef.current = window.setInterval(
            spawnEnemy,
            newSpawnInterval
          );
          waveSpawnRef.current = window.setInterval(() => {
            for (let i = 0; i < newWaveEnemyCount; i++) spawnEnemy();
          }, newWaveInterval);
          powerUpSpawnRef.current = window.setInterval(spawnPowerUp, 5000); // Much more frequent power-ups
        }
      }

      return { ...prev, isPaused: newPausedState };
    });
  }, [spawnEnemy, spawnPowerUp]);

  // End game
  const endGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPlaying: false, gameOver: true }));

    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (enemySpawnRef.current) {
      clearInterval(enemySpawnRef.current);
    }
    if (powerUpSpawnRef.current) {
      clearInterval(powerUpSpawnRef.current);
    }
    if (waveSpawnRef.current) {
      clearInterval(waveSpawnRef.current);
    }
  }, []);

  // Game loop - Optimized for better performance
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!gameState.isPlaying || gameState.isPaused) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Adaptive FPS limiting for mobile performance - consistent with mobile detection
      const deltaTime = currentTime - lastTimeRef.current;
      const targetFPS = isMobile ? 50 : 60; // 50 FPS on mobile (improved from 45), 60 FPS on desktop
      const frameTime = 1000 / targetFPS;
      
      if (deltaTime < frameTime) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      lastTimeRef.current = currentTime;

      setGameObjects((prev) => {
        const newState = { ...prev };
        newState.level = gameState.level; // Update level in gameObjects
        let scoreIncrease = 0;
        let livesLost = 0;
        let tookDamageThisFrame = false; // Prevent multiple damage in same frame
        const magnetActive =
          gameState.powerUps?.some((p) => p.type === "magnet" && p.active) ||
          false;
        const timeSlowActive =
          gameState.powerUps?.some((p) => p.type === "timeSlow" && p.active) ||
          false;
        const timeSlowMovementFactor = timeSlowActive ? 0.55 : 1;
        const timeSlowBulletFactor = timeSlowActive ? 0.6 : 1;
        const shipCenterX = newState.ship.x + newState.ship.width / 2;
        const shipCenterY = newState.ship.y + newState.ship.height / 2;

        // Update bullets - Optimized with bullet limit
        newState.bullets = newState.bullets
          .map((bullet) => ({ ...bullet, y: bullet.y - bullet.speed }))
          .filter((bullet) => bullet.y > -bullet.height)
          .slice(0, 30); // Limit bullets to 30 for 60fps performance

        // Update enemy bullets - Optimized with bullet limit
        // Mobile-optimized enemy bullet limit to prevent performance issues
        const maxEnemyBullets = isMobile ? 12 : 20; // Reduced limit for mobile
        newState.enemyBullets = newState.enemyBullets
          .map((bullet) => ({
            ...bullet,
            y: bullet.y + bullet.speed * timeSlowBulletFactor,
          }))
          .filter((bullet) => bullet.y < GAME_CONFIG.CANVAS_HEIGHT)
          .slice(0, maxEnemyBullets); // Mobile-optimized bullet limit

        // Update enemies - Optimized with enemy limit
        newState.enemies = newState.enemies
          .map((enemy) => {
            const updatedEnemy = {
              ...enemy,
              y: enemy.y + enemy.speed * timeSlowMovementFactor,
            };

            // Enemy shooting logic - Different patterns for each enemy type
            const enemyConfig = GAME_CONFIG.ENEMY_TYPES[enemy.type];
            const now = Date.now();

            // Scale enemy fire rate more gradually with level (much more balanced)
            const levelFireModifier = Math.max(
              0.75, // Don't go below 75% of base fire rate
              1 - (gameState.level - 1) * 0.008 // Much gentler scaling: 0.8% per level
            );
            
            // Mobile-specific fire rate optimization to prevent bullet spam
            const baseMobileMultiplier = isMobile ? 2.5 : 1; // 2.5x slower on mobile
            const mobileMinFireRate = isMobile ? 1500 : 800; // Much higher minimum for mobile (1.5s vs 0.8s)
            
            const effectiveEnemyFireRate = Math.max(
              mobileMinFireRate,
              Math.floor(enemyConfig.fireRate * levelFireModifier * baseMobileMultiplier)
            );
            
            // Extra mobile protection: ensure minimum time gap
            const timeSinceLastShot = now - (enemy.lastShot || 0);
            const mobileExtraDelay = isMobile ? 500 : 0; // Additional 500ms delay on mobile
            if (
              enemyConfig.canShoot &&
              timeSinceLastShot > effectiveEnemyFireRate + mobileExtraDelay
            ) {
              if (enemy.type === "shooter") {
                // Shooter: single precise shot
                const enemyBullet: Bullet = {
                  x: enemy.x + Math.floor(enemy.width / 2) - 3,
                  y: enemy.y + enemy.height,
                  width: 6,
                  height: 18,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 1.05,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(enemyBullet);
              } else if (enemy.type === "bomber") {
                // Bomber: Heavy shot
                const enemyBullet: Bullet = {
                  x: enemy.x + Math.floor(enemy.width / 2) - 5,
                  y: enemy.y + enemy.height,
                  width: 10,
                  height: 20,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.7,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(enemyBullet);
              } else if (enemy.type === "stealth") {
                // Stealth: Fast shot
                const enemyBullet: Bullet = {
                  x: enemy.x + Math.floor(enemy.width / 2) - 2,
                  y: enemy.y + enemy.height,
                  width: 4,
                  height: 12,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 1.5,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(enemyBullet);
              } else if (enemy.type === "assassin") {
                // Assassin: Precise shot
                const enemyBullet: Bullet = {
                  x: enemy.x + Math.floor(enemy.width / 2) - 4,
                  y: enemy.y + enemy.height,
                  width: 8,
                  height: 16,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 1.2,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(enemyBullet);
              }

              enemy.lastShot = now;
              
              // Debug log for mobile bullet spam tracking
              if (isMobile) {
                console.log(`📱 Mobile Enemy ${enemy.type} fired: rate=${effectiveEnemyFireRate}ms, extra delay=${mobileExtraDelay}ms, gap=${timeSinceLastShot}ms`);
              }
            }

            return updatedEnemy;
          })
          .filter((enemy) => {
            if (enemy.y > GAME_CONFIG.CANVAS_HEIGHT) {
              // Shield protects only from physical attacks, not tactical failures (enemy escape)
              // Invincibility protects from everything, including enemy escape
              if (!gameState.isInvincible || gameState.hasShield) {
                livesLost += GAME_CONFIG.ENEMY_ESCAPE_DAMAGE;
                console.log(`💀 Enemy escaped! Shield: ${gameState.hasShield}, Invincible: ${gameState.isInvincible}`);
              } else {
                console.log(`⭐ Invincibility protected from enemy escape damage!`);
              }
              return false;
            }
            return true;
          })
          .slice(0, 8); // Limit enemies to 8 for better gameplay balance

        // Update power-ups
        newState.powerUps = newState.powerUps
          .map((powerUp) => {
            const updatedPowerUp = { ...powerUp, y: powerUp.y + powerUp.speed };
            if (magnetActive) {
              const powerUpCenterX =
                updatedPowerUp.x + updatedPowerUp.width / 2;
              const powerUpCenterY =
                updatedPowerUp.y + updatedPowerUp.height / 2;
              const dx = shipCenterX - powerUpCenterX;
              const dy = shipCenterY - powerUpCenterY;
              const distance = Math.hypot(dx, dy) || 1;
              const pullStrength = Math.min(6, 140 / distance);
              updatedPowerUp.x += (dx / distance) * pullStrength;
              updatedPowerUp.y += (dy / distance) * pullStrength;
              updatedPowerUp.x = Math.max(
                0,
                Math.min(
                  updatedPowerUp.x,
                  GAME_CONFIG.CANVAS_WIDTH - updatedPowerUp.width
                )
              );
            }
            return updatedPowerUp;
          })
          .filter((powerUp) => powerUp.y < GAME_CONFIG.CANVAS_HEIGHT);

        // Update explosions
        newState.explosions = newState.explosions
          .map((explosion) => ({ ...explosion, frame: explosion.frame + 1 }))
          .filter((explosion) => explosion.frame < explosion.maxFrames);

        // Update particles
        newState.particles = newState.particles
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vx: particle.vx * 0.98, // Air resistance
            vy: particle.vy * 0.98 + (particle.type === "smoke" ? -0.1 : 0.05), // Gravity/float
            life: particle.life - 1,
            size: particle.size * 0.99, // Shrink over time
          }))
          .filter((particle) => particle.life > 0)
          .slice(0, 100); // Limit particles for performance

        // Update boss (only when not paused)
        if (newState.boss && newState.boss.isActive && !gameState.isPaused) {
          const boss = newState.boss;
          const now = Date.now();
          // Debug log every 3 seconds - less spam
          if (now % 3000 < 16) {
            console.log(
              `👾 Boss: ${boss.type}, Health: ${boss.health}/${
                boss.maxHealth
              }, Pattern: ${boss.ai.movementPattern}, Phase: ${
                boss.ai.currentPhase
              }, X: ${Math.round(boss.x)}, Y: ${Math.round(boss.y)}`
            );
          }
          const time = now * 0.001;

          // Dynamic AI system - aggressive and varied behavior
          const healthPercent = (boss.health / boss.maxHealth) * 100;
          boss.ai.aggressionLevel = Math.max(
            0.2,
            Math.min(1, (100 - healthPercent) / 80)
          ); // Much more aggressive

          // Dynamic phase management with pattern switching
          if (healthPercent <= 25 && boss.ai.currentPhase !== "desperate") {
            boss.ai.currentPhase = "desperate";
            boss.ai.phaseChangeTime = now;
            // Change movement pattern when desperate
            const desperatePatterns = ["figure8", "circle", "vertical"];
            boss.ai.movementPattern = desperatePatterns[
              Math.floor(Math.random() * desperatePatterns.length)
            ] as BossMovementPattern;
            console.log(
              `💀 Boss ${boss.type} entered DESPERATE phase with ${boss.ai.movementPattern} pattern`
            );
          } else if (
            healthPercent <= 60 &&
            boss.ai.currentPhase !== "aggressive" &&
            boss.ai.currentPhase !== "desperate"
          ) {
            boss.ai.currentPhase = "aggressive" as BossPhase;
            boss.ai.phaseChangeTime = now;
            console.log(
              `⚡ Boss ${
                boss.type
              } entered AGGRESSIVE phase at ${healthPercent.toFixed(1)}% health`
            );
          }

          // Dynamic pattern switching every 3-5 seconds for more action
          if (now - boss.ai.patternStartTime > 3000 + Math.random() * 2000) {
            const allPatterns = ["horizontal", "figure8", "circle", "vertical"];
            let newPattern;
            do {
              newPattern =
                allPatterns[Math.floor(Math.random() * allPatterns.length)];
            } while (newPattern === boss.ai.movementPattern);

            boss.ai.movementPattern = newPattern as BossMovementPattern;
            boss.ai.patternStartTime = now;
            console.log(
              `🔄 Boss ${boss.type} switched to ${newPattern} pattern`
            );
          }

          // Fast, visible movement patterns
          const horizontalSpace = GAME_CONFIG.CANVAS_WIDTH - boss.width;
          const maxAmplitude = Math.min(horizontalSpace * 0.7, 180); // Larger amplitude

          // Get target position based on pattern - much faster frequencies
          let targetX = boss.x;
          let targetY = boss.y;

          switch (boss.ai.movementPattern) {
            case "horizontal":
              // Fast horizontal movement
              targetX =
                GAME_CONFIG.CANVAS_WIDTH / 2 -
                boss.width / 2 +
                Math.sin(time * 0.05) * maxAmplitude;
              targetY = 110 + Math.sin(time * 0.025) * 20;
              break;

            case "figure8":
              // Fast Figure-8 pattern
              targetX =
                GAME_CONFIG.CANVAS_WIDTH / 2 -
                boss.width / 2 +
                Math.sin(time * 0.04) * maxAmplitude * 0.8;
              targetY = 120 + Math.sin(time * 0.08) * 30;
              break;

            case "circle":
              // Fast circular movement
              const centerX = GAME_CONFIG.CANVAS_WIDTH / 2 - boss.width / 2;
              const centerY = 130;
              const radius = maxAmplitude * 0.8;
              targetX = centerX + Math.cos(time * 0.03) * radius;
              targetY = centerY + Math.sin(time * 0.03) * 25;
              break;

            case "vertical":
              // Fast vertical movement with horizontal weaving
              targetX =
                GAME_CONFIG.CANVAS_WIDTH / 2 -
                boss.width / 2 +
                Math.sin(time * 0.035) * maxAmplitude * 0.7;
              targetY = 110 + Math.sin(time * 0.06) * 40;
              break;
          }

          // Much faster movement interpolation
          const moveSpeed = boss.speed * 0.3; // 3x faster base movement
          boss.x += (targetX - boss.x) * Math.min(0.4, moveSpeed); // Much faster interpolation
          boss.y += (targetY - boss.y) * Math.min(0.4, moveSpeed);

          // Soft bounds checking - gradually push boss back into bounds
          const margin = 20; // Buffer zone
          const pushForce = 0.1; // How strongly to push back

          // Soft horizontal bounds
          if (boss.x < margin) {
            boss.x += (margin - boss.x) * pushForce;
          } else if (boss.x > GAME_CONFIG.CANVAS_WIDTH - boss.width - margin) {
            boss.x -=
              (boss.x - (GAME_CONFIG.CANVAS_WIDTH - boss.width - margin)) *
              pushForce;
          }

          // Soft vertical bounds
          if (boss.y < 60) {
            boss.y += (60 - boss.y) * pushForce;
          } else if (boss.y > 180) {
            boss.y -= (boss.y - 180) * pushForce;
          }

          // Final safety bounds (hard limits but shouldn't be reached often)
          boss.x = Math.max(
            0,
            Math.min(GAME_CONFIG.CANVAS_WIDTH - boss.width, boss.x)
          );
          boss.y = Math.max(50, Math.min(200, boss.y));

          // Boss shooting - Stable and consistent firing

          // Balanced firing system - much slower and more strategic
          const baseFireRate = boss.fireRate;
          let phaseFireModifier = 1.0; // Default: normal speed
          
          // Mobile-specific boss fire rate optimization to prevent bullet spam
          const mobileBossMultiplier = isMobile ? 1.8 : 1; // 1.8x slower on mobile

          // Dynamic firing modes based on level and randomness
          let firingMode = "normal";
          const levelDifficulty = Math.min(gameState.level / 10, 1); // 0 to 1 based on level

          if (boss.ai.currentPhase === "aggressive") {
            // Much more forgiving progression - early levels very slow
            phaseFireModifier = 1.1 - levelDifficulty * 0.3; // 1.1 to 0.8 (starts slower than base)
            firingMode =
              Math.random() < Math.max(0.05, levelDifficulty * 0.15)
                ? "burst"
                : "normal"; // 5-15% burst chance
          } else if (boss.ai.currentPhase === "desperate") {
            phaseFireModifier = 1.0 - levelDifficulty * 0.4; // 1.0 to 0.6 (more gradual)
            firingMode =
              Math.random() < Math.max(0.08, levelDifficulty * 0.2)
                ? "burst"
                : "normal"; // 8-20% burst chance
          } else {
            // Normal phase - much slower on early levels
            phaseFireModifier = 1.3 - levelDifficulty * 0.2; // 1.3 to 1.1 (always slower than base!)
          }

          // Initialize firing variables if needed
          if (!boss.ai.lastFiringMode) boss.ai.lastFiringMode = firingMode;
          if (!boss.ai.burstCount) boss.ai.burstCount = 0;
          if (!boss.ai.burstCooldown) boss.ai.burstCooldown = 0;
          if (!boss.ai.randomCooldown) boss.ai.randomCooldown = 0;
          if (!boss.ai.shotsSinceLastPause) boss.ai.shotsSinceLastPause = 0;

          let canFire = false;
          const bossFireRate =
            baseFireRate * phaseFireModifier * (timeSlowActive ? 1.2 : 1) * mobileBossMultiplier;

          // Ensure lastShot is initialized for immediate firing
          if (!boss.lastShot || boss.lastShot > now - 200) {
            boss.lastShot = now - bossFireRate - 500; // Force immediate firing capability with extra buffer
            console.log(
              `⚡ Boss ${boss.type} ready to fire immediately (Phase: ${boss.ai.currentPhase}, Level: ${gameState.level})`
            );
          }

          const timeSinceLastShot = now - boss.lastShot;

          // Dynamic random firing logic - much more varied and unpredictable

          // Check if we're in a random cooldown period
          if (now < boss.ai.randomCooldown) {
            canFire = false;
          } else if (firingMode === "burst") {
            // Dynamic burst system
            if (boss.ai.burstCount === 0) {
              // Can start new burst
              canFire = timeSinceLastShot >= bossFireRate;
              if (canFire) {
                // Much smaller burst sizes - especially on early levels
                const maxBurstSize = Math.max(
                  1,
                  Math.floor(levelDifficulty * 2) + 1
                ); // 1-3 shots max
                boss.ai.burstCount =
                  Math.random() < 0.6 ? 1 : Math.min(2, maxBurstSize); // 60% single shot

                // Much longer burst cooldown - early levels get huge breaks
                const baseCooldown = 3 + (1 - levelDifficulty) * 4; // 3-7x fire rate base
                const cooldownMultiplier = baseCooldown + Math.random() * 2; // +0-2x extra
                boss.ai.burstCooldown = now + bossFireRate * cooldownMultiplier;

                console.log(
                  `🎯 Boss ${boss.type} starting ${
                    boss.ai.burstCount
                  }-shot burst, cooldown: ${Math.round(
                    cooldownMultiplier * bossFireRate
                  )}ms`
                );
              }
            } else if (boss.ai.burstCount > 0) {
              // Continue burst with much longer intervals - avoid rapid fire
              const minInterval = 400 + (1 - levelDifficulty) * 600; // 400-1000ms base
              const burstInterval = minInterval + Math.random() * 400; // +0-400ms random
              canFire = timeSinceLastShot >= burstInterval;
              if (canFire) {
                boss.ai.burstCount--;
              }
            } else if (now >= boss.ai.burstCooldown) {
              // Reset for potential next burst
              boss.ai.burstCount = 0;
            }
          } else {
            // Normal firing with random rhythm
            canFire = timeSinceLastShot >= bossFireRate;

            if (canFire) {
              boss.ai.shotsSinceLastPause =
                (boss.ai.shotsSinceLastPause || 0) + 1;

              // Much fewer shots before pause, especially on early levels
              const maxShotsBeforePause = gameState.level <= 5 ? 2 : 3; // Level 1-5: max 2 shots, 6+: max 3 shots
              const shotsBeforePause =
                1 + Math.floor(Math.random() * maxShotsBeforePause); // 1-2 or 1-3 shots
              if (boss.ai.shotsSinceLastPause >= shotsBeforePause) {
                // Much longer breaks, especially on early levels
                const basePause = gameState.level <= 5 ? 2000 : 1500; // Early: 2s, Late: 1.5s base (2.5x longer!)
                const randomPause = gameState.level <= 5 ? 3000 : 2500; // Early: +3s, Late: +2.5s random (2x longer!)
                const pauseDuration =
                  (basePause + Math.random() * randomPause) /
                  Math.max(0.5, levelDifficulty); // Early levels get even longer pauses
                boss.ai.randomCooldown = now + pauseDuration;
                boss.ai.shotsSinceLastPause = 0;

                console.log(
                  `😴 Boss ${boss.type} L${gameState.level} taking ${Math.round(
                    pauseDuration
                  )}ms break after ${shotsBeforePause} shots`
                );
              }
            }
          }

          // Minimal debug logging for firing status
          if (now % 5000 < 16) {
            console.log(
              `🎯 Boss ${boss.type}: ${firingMode} mode, ${Math.round(
                bossFireRate
              )}ms rate, burst: ${boss.ai.burstCount || 0}`
            );
          }

          if (canFire) {
            console.log(
              `🔥 Boss ${boss.type} firing! Base fireRate: ${boss.fireRate}, Phase: ${boss.ai.currentPhase}, Final rate: ${bossFireRate}ms${isMobile ? ' (Mobile optimized: ' + mobileBossMultiplier + 'x)' : ''}`
            );
            const centerX = boss.x + boss.width / 2;
            const centerY = boss.y + boss.height + 10; // Reduced spacing for better positioning

            // Calculate spread based on boss size
            const bossSize = Math.max(boss.width, boss.height);
            const baseSpread = bossSize * 0.85; // Wider base spread
            const maxSpread = Math.min(360, baseSpread + gameState.level * 3); // Expand with level progression

            // Unique shooting patterns for each boss type
            if (boss.type === "destroyer") {
              // Destroyer: 3-shot spread pattern
              for (let i = 0; i < 3; i++) {
                const angle = (i - 1) * 0.3; // -0.3, 0, 0.3
                const spreadX = centerX + Math.sin(angle) * maxSpread * 0.35;
                const bossBullet: Bullet = {
                  x: spreadX - 6,
                  y: centerY + i * 5, // Staggered timing
                  width: 12,
                  height: 18,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * (0.8 + i * 0.1), // Different speeds
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              }
            } else if (boss.type === "interceptor") {
              // Interceptor: Fast 3-shot burst
              const patterns = [
                { angle: -0.35, offset: maxSpread * 0.45 },
                { angle: 0, offset: 0 },
                { angle: 0.35, offset: maxSpread * 0.45 },
              ];
              patterns.forEach((pattern, i) => {
                const spreadX =
                  centerX + Math.sin(pattern.angle) * pattern.offset;
                const bossBullet: Bullet = {
                  x: spreadX - 4,
                  y: centerY + i * 3,
                  width: 8,
                  height: 12,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 1.2,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              });
            } else if (boss.type === "cruiser") {
              // Cruiser: Wave pattern with 5 shots
              const wavePattern = [
                { angle: -0.45, offset: maxSpread * 0.7, speed: 0.62 },
                { angle: -0.25, offset: maxSpread * 0.4, speed: 0.72 },
                { angle: 0, offset: 0, speed: 0.82 },
                { angle: 0.25, offset: maxSpread * 0.4, speed: 0.72 },
                { angle: 0.45, offset: maxSpread * 0.7, speed: 0.62 },
              ];
              wavePattern.forEach((pattern, i) => {
                const spreadX =
                  centerX + Math.sin(pattern.angle) * pattern.offset;
                const bossBullet: Bullet = {
                  x: spreadX - 6,
                  y: centerY + Math.sin(Date.now() * 0.008 + i) * 4,
                  width: 10,
                  height: 15,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * pattern.speed,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              });
            } else if (boss.type === "battleship") {
              // Battleship: Heavy cannon barrage
              for (let i = 0; i < 3; i++) {
                const spreadX = centerX + (i - 1) * maxSpread * 0.35;
                const bossBullet: Bullet = {
                  x: spreadX - 8,
                  y: centerY + i * 10,
                  width: 16,
                  height: 24,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.7,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              }
            } else if (boss.type === "dreadnought") {
              // Dreadnought: Spiral pattern
              for (let i = 0; i < 4; i++) {
                const spiralAngle = i * 1.5 + Date.now() * 0.002;
                const spreadX =
                  centerX + Math.sin(spiralAngle) * (maxSpread * 0.45 + i * 10);
                const bossBullet: Bullet = {
                  x: spreadX - 7,
                  y: centerY + i * 6,
                  width: 14,
                  height: 20,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * (0.6 + i * 0.1),
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              }
            } else if (boss.type === "carrier") {
              // Carrier: Wide spread pattern
              for (let i = 0; i < 5; i++) {
                const angle = (i - 2) * 0.3;
                const spreadX = centerX + Math.sin(angle) * maxSpread * 0.55;
                const bossBullet: Bullet = {
                  x: spreadX - 6,
                  y: centerY + i * 4,
                  width: 12,
                  height: 18,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.8,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              }
            } else if (boss.type === "behemoth") {
              // Behemoth: Concentrated fire
              for (let i = 0; i < 2; i++) {
                const spreadX = centerX + (i - 0.5) * maxSpread * 0.2;
                const bossBullet: Bullet = {
                  x: spreadX - 10,
                  y: centerY + i * 5,
                  width: 20,
                  height: 30,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.5,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              }
            } else if (boss.type === "colossus") {
              // Colossus: Ring pattern
              for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const spreadX = centerX + Math.sin(angle) * maxSpread * 0.35;
                const bossBullet: Bullet = {
                  x: spreadX - 8,
                  y: centerY + Math.cos(angle) * 5,
                  width: 16,
                  height: 24,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.6,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              }
            } else if (boss.type === "leviathan") {
              // Leviathan: Massive spread
              for (let i = 0; i < 7; i++) {
                const angle = (i - 3) * 0.2;
                const spreadX = centerX + Math.sin(angle) * maxSpread * 0.8;
                const bossBullet: Bullet = {
                  x: spreadX - 9,
                  y: centerY + i * 3,
                  width: 18,
                  height: 27,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.4,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              }
            } else if (boss.type === "titan") {
              // Titan: Ultimate boss pattern
              for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const spreadX = centerX + Math.sin(angle) * maxSpread * 0.75;
                const bossBullet: Bullet = {
                  x: spreadX - 10,
                  y: centerY + Math.cos(angle) * 8,
                  width: 20,
                  height: 30,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.3,
                  direction: "down" as const,
                };
                newState.enemyBullets.push(bossBullet);
              }
            } else {
              // Default pattern for unknown bosses
              const bossBullet: Bullet = {
                x: centerX - 5,
                y: centerY,
                width: 10,
                height: 15,
                speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.8,
                direction: "down" as const,
              };
              newState.enemyBullets.push(bossBullet);
            }

            boss.lastShot = now;
            console.log(
              `🚀 Boss bullet created! Total enemy bullets: ${newState.enemyBullets.length}`
            );
          }

          // Boss power-up spawning (slower during boss fights)
          if (Math.random() < 0.001) {
            // Very low chance during boss fight
            const powerUpTypes: PowerUpType[] = [
              "heart",
              "doubleShot",
              "tripleShot",
              "speedBoost",
              "shield",
              "laserBeam",
              "invincibility",
              "magnet",
              "timeSlow",
            ];
            const randomType =
              powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

            const powerUp: PowerUp = {
              x: boss.x + Math.random() * boss.width,
              y: boss.y + boss.height + 20,
              width: GAME_CONFIG.POWER_UP_SIZE,
              height: GAME_CONFIG.POWER_UP_SIZE,
              speed: 1.6 + Math.min(1.4, gameState.level * 0.06), // Faster drops during boss fights
              type: randomType,
              active: false,
              duration: 0,
            };
            newState.powerUps.push(powerUp);
          }

          // Boss special attack - Unique for each boss type with AI phase adjustments
          let phaseSpecialModifier = 1.0;
          if (boss.ai.currentPhase === "aggressive") phaseSpecialModifier = 0.9;
          else if (boss.ai.currentPhase === "desperate")
            phaseSpecialModifier = 0.7;

          const bossSpecialRate =
            boss.specialAttackRate *
            phaseSpecialModifier *
            (timeSlowActive ? 1.25 : 1);
          // Ensure lastSpecialAttack is initialized
          if (!boss.lastSpecialAttack) {
            boss.lastSpecialAttack =
              now - Math.max(1500, Math.floor(bossSpecialRate * 0.6));
          }

          if (now - boss.lastSpecialAttack > bossSpecialRate) {
            const centerX = boss.x + boss.width / 2;
            const centerY = boss.y + boss.height + 10;
            const bossSize = Math.max(boss.width, boss.height);
            const specialSpread = Math.min(
              460,
              bossSize * 1.4 + gameState.level * 4
            );

            if (boss.type === "destroyer") {
              // Destroyer: Massive single shot
              const specialBullet: Bullet = {
                x: centerX - 15,
                y: centerY,
                width: 30,
                height: 45,
                speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.3,
                direction: "down" as const,
                damage: 1, // Reduced from 2 to 1 for better balance
              };
              newState.enemyBullets.push(specialBullet);
            } else if (boss.type === "interceptor") {
              // Interceptor: Rapid fire burst
              for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const spreadX =
                  centerX + Math.sin(angle) * specialSpread * 0.45;
                const specialBullet: Bullet = {
                  x: spreadX - 6,
                  y: centerY + i * 2,
                  width: 12,
                  height: 18,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 1.5,
                  direction: "down" as const,
                  damage: 1, // Reduced from 2 to 1 for better balance
                };
                newState.enemyBullets.push(specialBullet);
              }
            } else if (boss.type === "cruiser") {
              // Cruiser: Wave explosion
              for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI * 2) / 12;
                const spreadX = centerX + Math.sin(angle) * specialSpread * 0.7;
                const specialBullet: Bullet = {
                  x: spreadX - 8,
                  y: centerY + Math.cos(angle) * 10,
                  width: 16,
                  height: 24,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.8,
                  direction: "down" as const,
                  damage: 1, // Reduced from 2 to 1 for better balance
                };
                newState.enemyBullets.push(specialBullet);
              }
            } else if (boss.type === "battleship") {
              // Battleship: Triple heavy cannon
              for (let i = 0; i < 3; i++) {
                const spreadX = centerX + (i - 1) * specialSpread * 0.4;
                const specialBullet: Bullet = {
                  x: spreadX - 20,
                  y: centerY + i * 15,
                  width: 40,
                  height: 60,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.2,
                  direction: "down" as const,
                  damage: 1, // Reduced from 2 to 1 for better balance
                };
                newState.enemyBullets.push(specialBullet);
              }
            } else if (boss.type === "dreadnought") {
              // Dreadnought: Spiral death ray
              for (let i = 0; i < 16; i++) {
                const angle = (i * Math.PI * 2) / 16 + Date.now() * 0.005;
                const spreadX =
                  centerX + Math.sin(angle) * (specialSpread * 0.55 + i * 5);
                const specialBullet: Bullet = {
                  x: spreadX - 10,
                  y: centerY + Math.cos(angle) * 8,
                  width: 20,
                  height: 30,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.6,
                  direction: "down" as const,
                  damage: 1, // Reduced from 2 to 1 for better balance
                };
                newState.enemyBullets.push(specialBullet);
              }
            } else if (boss.type === "carrier") {
              // Carrier: Bomber swarm
              for (let i = 0; i < 10; i++) {
                const spreadX = centerX + (i - 4.5) * specialSpread * 0.18;
                const specialBullet: Bullet = {
                  x: spreadX - 12,
                  y: centerY + i * 5,
                  width: 24,
                  height: 36,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.4,
                  direction: "down" as const,
                  damage: 1, // Reduced from 2 to 1 for better balance
                };
                newState.enemyBullets.push(specialBullet);
              }
            } else if (boss.type === "behemoth") {
              // Behemoth: Concentrated death beam
              const specialBullet: Bullet = {
                x: centerX - 26,
                y: centerY,
                width: 52,
                height: 78,
                speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.12,
                direction: "down" as const,
                damage: 1, // Reduced from 2 to 1 for better balance
              };
              newState.enemyBullets.push(specialBullet);
            } else if (boss.type === "colossus") {
              // Colossus: Ring of destruction
              for (let i = 0; i < 20; i++) {
                const angle = (i * Math.PI * 2) / 20;
                const spreadX =
                  centerX + Math.sin(angle) * specialSpread * 0.85;
                const specialBullet: Bullet = {
                  x: spreadX - 15,
                  y: centerY + Math.cos(angle) * 15,
                  width: 30,
                  height: 45,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.5,
                  direction: "down" as const,
                  damage: 1, // Reduced from 2 to 1 for better balance
                };
                newState.enemyBullets.push(specialBullet);
              }
            } else if (boss.type === "leviathan") {
              // Leviathan: Ultimate spread
              for (let i = 0; i < 24; i++) {
                const angle = (i * Math.PI * 2) / 24;
                const spreadX =
                  centerX + Math.sin(angle) * specialSpread * 0.95;
                const specialBullet: Bullet = {
                  x: spreadX - 18,
                  y: centerY + Math.cos(angle) * 20,
                  width: 36,
                  height: 54,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.3,
                  direction: "down" as const,
                  damage: 1, // Reduced from 2 to 1 for better balance
                };
                newState.enemyBullets.push(specialBullet);
              }
            } else if (boss.type === "titan") {
              // Titan: Apocalypse blast
              for (let i = 0; i < 32; i++) {
                const angle = (i * Math.PI * 2) / 32;
                const spreadX = centerX + Math.sin(angle) * specialSpread;
                const specialBullet: Bullet = {
                  x: spreadX - 20,
                  y: centerY + Math.cos(angle) * 25,
                  width: 40,
                  height: 60,
                  speed: GAME_CONFIG.ENEMY_BULLET_SPEED * 0.2,
                  direction: "down" as const,
                  damage: 1, // Reduced from 2 to 1 for better balance
                };
                newState.enemyBullets.push(specialBullet);
              }
            }

            boss.lastSpecialAttack = now;
          }
        }

        // Check bullet-enemy collisions
        newState.bullets = newState.bullets.filter((bullet) => {
          for (let i = newState.enemies.length - 1; i >= 0; i--) {
            const enemy = newState.enemies[i];
            if (checkCollision(bullet, enemy)) {
              // Create enhanced explosion effect with particles
              createEnhancedExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2,
                "enemy"
              );
              newState.enemies.splice(i, 1);

              // Update combo system
              updateCombo(true);

              // Calculate score with combo multiplier
              const comboMultiplier = gameState.combo.multiplier;
              const points = calculateScore(
                GAME_CONFIG.POINTS_PER_ENEMY,
                comboMultiplier
              );
              scoreIncrease += points;

              return false; // Remove bullet
            }
          }
          return true;
        });

        // Check bullet-boss collisions
        if (newState.boss && newState.boss.isActive) {
          newState.bullets = newState.bullets.filter((bullet) => {
            if (newState.boss && checkCollision(bullet, newState.boss)) {
              const bossDamage = bullet.damage ?? 1;
              newState.boss.health -= bossDamage;

              // Update combo for boss hits too
              updateCombo(true);

              // Boss vuruşlarından skor verilmez; sadece öldürme bonusu verilir

              // Check if boss is defeated
              if (newState.boss && newState.boss.health <= 0) {
                // Create enhanced boss explosion effect with particles
                createEnhancedExplosion(
                  newState.boss.x + newState.boss.width / 2,
                  newState.boss.y + newState.boss.height / 2,
                  "boss"
                );
                newState.boss = null;
                setGameState((prev) => ({ ...prev, isBossFight: false }));

                // Check if this was the final boss (Level 50)
                setGameState((prev) => {
                  if (prev.level >= 50) {
                    // Game completed!
                    console.log(`Game completed! Final score: ${prev.score}`);
                    return {
                      ...prev,
                      gameCompleted: true,
                      isPlaying: false,
                      bossJustDefeated: true,
                      scoreAtLevelStart:
                        prev.score + GAME_CONFIG.BOSS_DEFEAT_BONUS,
                    };
                  } else {
                    // Boss yendikten sonra sadece 1 level artır
                    const newLevel = Math.min(
                      GAME_CONFIG.MAX_LEVEL,
                      prev.level + 1
                    );
                    console.log(
                      `Boss defeated! Level ${prev.level} -> ${newLevel}`
                    );
                    // Unlock player shot tiers at 10/20/30 AFTER defeating the boss
                    const newTier =
                      newLevel >= 30
                        ? 3
                        : newLevel >= 20
                        ? 2
                        : newLevel >= 10
                        ? 2
                        : prev.playerShotTier || 1;
                    return {
                      ...prev,
                      level: newLevel,
                      bossJustDefeated: true,
                      scoreAtLevelStart:
                        prev.score + GAME_CONFIG.BOSS_DEFEAT_BONUS,
                      playerShotTier: newTier,
                    };
                  }
                });

                // Reset bossJustDefeated flag after 10 seconds
                setTimeout(() => {
                  setGameState((prev) => ({
                    ...prev,
                    bossJustDefeated: false,
                  }));
                  console.log("Boss defeat cooldown ended");
                }, 10000);

                // Resume enemy spawning after boss defeat
                setGameState((prev) => {
                  const newLevel = prev.level;
                  const newSpawnInterval = Math.max(
                    3000,
                    6000 - (newLevel - 1) * 200
                  );
                  const newWaveInterval = Math.max(
                    10000,
                    18000 - (newLevel - 1) * 600
                  );
                  const newWaveEnemyCount = Math.min(
                    3,
                    2 + Math.floor((newLevel - 1) / 4)
                  );

                  // Start spawning with new level
                  enemySpawnRef.current = window.setInterval(
                    spawnEnemy,
                    newSpawnInterval
                  );
                  waveSpawnRef.current = window.setInterval(() => {
                    for (let i = 0; i < newWaveEnemyCount; i++) spawnEnemy();
                  }, newWaveInterval);
                  powerUpSpawnRef.current = window.setInterval(
                    spawnPowerUp,
                    5000
                  ); // Much more frequent power-ups

                  return prev; // Don't change state, just start spawning
                });
              }

              return false; // Remove bullet
            }
            return true;
          });
        }

        // Check enemy-ship collisions
        for (let i = newState.enemies.length - 1; i >= 0; i--) {
          const enemy = newState.enemies[i];
          if (checkCollision(enemy, newState.ship) && !gameState.isInvincible && !tookDamageThisFrame) {
            newState.enemies.splice(i, 1);
            livesLost += 1;
            tookDamageThisFrame = true; // Prevent additional damage this frame
            // Trigger vibration and invincibility
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]); // Vibration pattern
            }
            setGameState((prev) => ({
              ...prev,
              isInvincible: true,
              invincibilityEndTime: Date.now() + 3000, // 3 seconds
              isFlashing: true,
              screenShake: 300, // 300ms screen shake for enemy collision
            }));
            break; // Exit loop after taking damage
          }
        }

        // Check boss-ship collisions
        if (
          newState.boss &&
          newState.boss.isActive &&
          checkCollision(newState.boss, newState.ship) &&
          !gameState.isInvincible &&
          !tookDamageThisFrame
        ) {
          livesLost += 1; // All damage sources cost 1 life
          tookDamageThisFrame = true; // Prevent additional damage this frame
          // Trigger vibration and invincibility
          if (navigator.vibrate) {
            navigator.vibrate([300, 100, 300, 100, 300]); // Stronger vibration for boss
          }
          setGameState((prev) => ({
            ...prev,
            isInvincible: true,
            invincibilityEndTime: Date.now() + 3000, // 3 seconds
            isFlashing: true,
            screenShake: 500, // 500ms stronger screen shake for boss collision
          }));
        }

        // Check enemy bullet-ship collisions
        newState.enemyBullets = newState.enemyBullets.filter((bullet) => {
          if (
            checkCollision(bullet, newState.ship) &&
            !gameState.isInvincible &&
            !tookDamageThisFrame
          ) {
            // All attacks now cause exactly 1 life damage for balanced gameplay
            livesLost += 1; // Always 1 damage regardless of bullet type
            tookDamageThisFrame = true; // Prevent additional damage this frame
            // Trigger vibration and invincibility
            if (navigator.vibrate) {
              navigator.vibrate([150, 50, 150]); // Standard feedback for all hits
            }
            setGameState((prev) => ({
              ...prev,
              isInvincible: true,
              invincibilityEndTime: Date.now() + 3000, // 3 seconds
              isFlashing: true,
              screenShake: 250, // Standard shake for all bullets
            }));
            return false; // Remove the bullet that hit
          }
          return true; // Keep bullet if no collision or already took damage this frame
        });

        // Check power-up-ship collisions
        newState.powerUps = newState.powerUps.filter((powerUp) => {
          if (checkCollision(powerUp, newState.ship)) {
            // Check power-up capacity before adding timed power-ups
            const shipConfig = GAME_CONFIG.getShipConfig(gameState.level);
            const currentActivePowerUps = gameState.powerUps?.filter(p => p.active) || [];
            const isTimedPowerUp = !['heart'].includes(powerUp.type); // Heart is instant, others are timed
            
            if (isTimedPowerUp && currentActivePowerUps.length >= shipConfig.powerUpCapacity) {
              // Remove oldest active power-up to make room
              const oldestPowerUp = currentActivePowerUps[0];
              if (oldestPowerUp) {
                setGameState((s) => ({
                  ...s,
                  powerUps: s.powerUps.filter(p => p !== oldestPowerUp),
                  // Remove specific power-up effects
                  hasDoubleShot: oldestPowerUp.type === 'doubleShot' ? false : s.hasDoubleShot,
                  hasSpeedBoost: oldestPowerUp.type === 'speedBoost' ? false : s.hasSpeedBoost,
                  isInvincible: ['invincibility', 'shield'].includes(oldestPowerUp.type) ? false : s.isInvincible,
                  isFlashing: ['invincibility', 'shield'].includes(oldestPowerUp.type) ? false : s.isFlashing,
                  hasShield: ['shield'].includes(oldestPowerUp.type) ? false : s.hasShield,
                }));
                console.log(`🔄 Power-up capacity full! Removed ${oldestPowerUp.type} to make room for ${powerUp.type}`);
              }
            }
            
            // Apply power-up effect
            setGameState((prevState) => {
              const updatedState = { ...prevState };

              switch (powerUp.type) {
                case "heart":
                  updatedState.lives = Math.min(5, updatedState.lives + 1);
                  break;
                case "doubleShot":
                  updatedState.hasDoubleShot = true;
                  updatedState.powerUps = [
                    ...updatedState.powerUps.filter(
                      (p) => !(p.type === "doubleShot" && p.active)
                    ),
                    {
                      ...powerUp,
                      active: true,
                      duration: GAME_CONFIG.POWER_UP_DURATION,
                      endTime: Date.now() + GAME_CONFIG.POWER_UP_DURATION,
                    },
                  ];
                  setTimeout(() => {
                    setGameState((s) => ({
                      ...s,
                      hasDoubleShot: false,
                      powerUps: s.powerUps.filter(
                        (p) => p.type !== "doubleShot" || !p.active
                      ),
                    }));
                  }, GAME_CONFIG.POWER_UP_DURATION);
                  break;
                case "tripleShot":
                  updatedState.powerUps = [
                    ...updatedState.powerUps.filter(
                      (p) => !(p.type === "tripleShot" && p.active)
                    ),
                    {
                      ...powerUp,
                      active: true,
                      duration: GAME_CONFIG.POWER_UP_DURATION,
                      endTime: Date.now() + GAME_CONFIG.POWER_UP_DURATION,
                    },
                  ];
                  setTimeout(() => {
                    setGameState((s) => ({
                      ...s,
                      powerUps: s.powerUps.filter(
                        (p) => p.type !== "tripleShot" || !p.active
                      ),
                    }));
                  }, GAME_CONFIG.POWER_UP_DURATION);
                  break;
                case "speedBoost":
                  updatedState.hasSpeedBoost = true;
                  updatedState.powerUps = [
                    ...updatedState.powerUps.filter(
                      (p) => !(p.type === "speedBoost" && p.active)
                    ),
                    {
                      ...powerUp,
                      active: true,
                      duration: GAME_CONFIG.POWER_UP_DURATION,
                      endTime: Date.now() + GAME_CONFIG.POWER_UP_DURATION,
                    },
                  ];
                  setTimeout(() => {
                    setGameState((s) => ({
                      ...s,
                      hasSpeedBoost: false,
                      powerUps: s.powerUps.filter(
                        (p) => p.type !== "speedBoost" || !p.active
                      ),
                    }));
                  }, GAME_CONFIG.POWER_UP_DURATION);
                  break;
                case "shield":
                  updatedState.isInvincible = true;
                  updatedState.hasShield = true; // Shield-specific protection
                  updatedState.invincibilityEndTime =
                    Date.now() + GAME_CONFIG.POWER_UP_DURATION;
                  updatedState.isFlashing = true;
                  updatedState.powerUps = [
                    ...updatedState.powerUps.filter(
                      (p) => !(p.type === "shield" && p.active)
                    ),
                    {
                      ...powerUp,
                      active: true,
                      duration: GAME_CONFIG.POWER_UP_DURATION,
                      endTime: Date.now() + GAME_CONFIG.POWER_UP_DURATION,
                    },
                  ];
                  setTimeout(() => {
                    setGameState((s) => ({
                      ...s,
                      isInvincible: false,
                      isFlashing: false,
                      hasShield: false, // Remove shield protection
                      powerUps: s.powerUps.filter(
                        (p) => p.type !== "shield" || !p.active
                      ),
                    }));
                  }, GAME_CONFIG.POWER_UP_DURATION);
                  break;
                case "invincibility":
                  updatedState.isInvincible = true;
                  updatedState.hasShield = false; // Full invincibility (not just shield)
                  updatedState.invincibilityEndTime =
                    Date.now() + 8000; // Reduced to 8 seconds for better balance
                  updatedState.isFlashing = true;
                  updatedState.powerUps = [
                    ...updatedState.powerUps.filter(
                      (p) => !(p.type === "invincibility" && p.active)
                    ),
                    {
                      ...powerUp,
                      active: true,
                      duration: 8000, // 8 seconds
                      endTime: Date.now() + 8000,
                    },
                  ];
                  setTimeout(() => {
                    setGameState((s) => ({
                      ...s,
                      isInvincible: false,
                      isFlashing: false,
                      hasShield: false, // Remove all protection
                      powerUps: s.powerUps.filter(
                        (p) => p.type !== "invincibility" || !p.active
                      ),
                    }));
                  }, 8000); // 8 seconds
                  break;
                case "magnet":
                  // Magnet effect - attract nearby power-ups
                  updatedState.powerUps = [
                    ...updatedState.powerUps.filter(
                      (p) => !(p.type === "magnet" && p.active)
                    ),
                    {
                      ...powerUp,
                      active: true,
                      duration: GAME_CONFIG.POWER_UP_DURATION,
                      endTime: Date.now() + GAME_CONFIG.POWER_UP_DURATION,
                    },
                  ];
                  setTimeout(() => {
                    setGameState((s) => ({
                      ...s,
                      powerUps: s.powerUps.filter(
                        (p) => p.type !== "magnet" || !p.active
                      ),
                    }));
                  }, GAME_CONFIG.POWER_UP_DURATION);
                  break;
                case "laserBeam":
                  // Laser beam effect - powerful single shot
                  updatedState.powerUps = [
                    ...updatedState.powerUps.filter(
                      (p) => !(p.type === "laserBeam" && p.active)
                    ),
                    {
                      ...powerUp,
                      active: true,
                      duration: GAME_CONFIG.POWER_UP_DURATION,
                      endTime: Date.now() + GAME_CONFIG.POWER_UP_DURATION,
                    },
                  ];
                  setTimeout(() => {
                    setGameState((s) => ({
                      ...s,
                      powerUps: s.powerUps.filter(
                        (p) => p.type !== "laserBeam" || !p.active
                      ),
                    }));
                  }, GAME_CONFIG.POWER_UP_DURATION);
                  break;
                case "timeSlow":
                  // Time slow effect - slow down enemies
                  updatedState.powerUps = [
                    ...updatedState.powerUps.filter(
                      (p) => !(p.type === "timeSlow" && p.active)
                    ),
                    {
                      ...powerUp,
                      active: true,
                      duration: GAME_CONFIG.POWER_UP_DURATION,
                      endTime: Date.now() + GAME_CONFIG.POWER_UP_DURATION,
                    },
                  ];
                  setTimeout(() => {
                    setGameState((s) => ({
                      ...s,
                      powerUps: s.powerUps.filter(
                        (p) => p.type !== "timeSlow" || !p.active
                      ),
                    }));
                  }, GAME_CONFIG.POWER_UP_DURATION);
                  break;
              }

              return updatedState;
            });
            return false;
          }
          return true;
        });

        // Check invincibility timer and combo timeout
        const now = Date.now();
        if (gameState.isInvincible && now >= gameState.invincibilityEndTime) {
          setGameState((prev) => ({
            ...prev,
            isInvincible: false,
            isFlashing: false,
            hasShield: false, // Remove all protection when timer ends
          }));
        }

        // Update combo system (check for timeouts)
        updateCombo(false);

        // Update screen shake (decrease over time)
        if (gameState.screenShake > 0) {
          setGameState((prev) => ({
            ...prev,
            screenShake: Math.max(0, prev.screenShake - 16), // Decrease by 16ms per frame (60fps)
          }));
        }

        // Update game state
        if (scoreIncrease > 0 || livesLost > 0) {
          setGameState((prevState) => {
            const newScore = prevState.score + scoreIncrease;
            const newLives = Math.max(0, prevState.lives - livesLost);
            // Progressive level system: 40, 60, 80, 100... enemies per level
            let newLevel = prevState.level;
            let newScoreAtLevelStart = prevState.scoreAtLevelStart;
            if (!prevState.isBossFight && !prevState.bossJustDefeated) {
              const progressSinceLevelStart = Math.max(
                0,
                newScore - prevState.scoreAtLevelStart
              );
              
              // Calculate required score for next level: 400 + (currentLevel-1) * 200
              // Level 1: 400 points (40 enemies), Level 2: 600 points (60 enemies), etc.
              const requiredScoreForNextLevel = GAME_CONFIG.LEVEL_UP_THRESHOLD + (prevState.level - 1) * 200;
              
              if (progressSinceLevelStart >= requiredScoreForNextLevel) {
                // Level up!
                newLevel = Math.min(GAME_CONFIG.MAX_LEVEL, prevState.level + 1);
                newScoreAtLevelStart = prevState.scoreAtLevelStart + requiredScoreForNextLevel;
                console.log(`🎉 Level Up! ${prevState.level} → ${newLevel}, Required: ${requiredScoreForNextLevel} points (~${requiredScoreForNextLevel/10} enemies)`);
              }
            }

            // Ship upgrade system - check for upgrades every 10 levels
            let upgradeBonus = 0;
            if (newLevel !== prevState.level) {
              const oldShipConfig = GAME_CONFIG.getShipConfig(prevState.level);
              const newShipConfig = GAME_CONFIG.getShipConfig(newLevel);

              // Check if ship type changed (upgrade occurred)
              if (oldShipConfig.type !== newShipConfig.type) {
                upgradeBonus = 1; // +1 life on ship upgrade
                console.log(
                  `🚀 Ship upgraded to ${newShipConfig.name}! +1 Life bonus`
                );
              }

              // Update ship size while preserving position
              setGameObjects((currentObjects) => ({
                ...currentObjects,
                ship: {
                  ...currentObjects.ship,
                  width: newShipConfig.width,
                  height: newShipConfig.height,
                  // Keep ship in bounds but preserve X position if possible
                  x: Math.max(
                    0,
                    Math.min(
                      GAME_CONFIG.CANVAS_WIDTH - newShipConfig.width,
                      currentObjects.ship.x -
                        (newShipConfig.width - currentObjects.ship.width) / 2
                    )
                  ),
                  // Adjust Y position for larger ships - keep them higher up
                  y: GAME_CONFIG.CANVAS_HEIGHT - newShipConfig.height - 30,
                },
              }));
            }

            // Check for boss spawn (every 5 levels, starting from level 5) - ONLY if not in boss fight and not just defeated
            if (
              newLevel !== prevState.level &&
              newLevel >= 5 &&
              newLevel % 5 === 0 &&
              !prevState.isBossFight &&
              !prevState.bossJustDefeated
            ) {
              console.log(`Spawning boss for level ${newLevel}`);
              spawnBoss(newLevel);
              // Don't update enemy spawn rate if boss is spawning
              return {
                ...prevState,
                score: newScore,
                lives: Math.min(5, newLives + upgradeBonus), // Max 5 lives, add upgrade bonus
                level: newLevel,
                scoreAtLevelStart: newScoreAtLevelStart,
              };
            }

            // Update enemy spawn rate if level changed - eski oyunun mantÄ±ÄŸÄ±
            if (
              newLevel !== prevState.level &&
              enemySpawnRef.current &&
              !prevState.isBossFight
            ) {
              clearInterval(enemySpawnRef.current);
              clearInterval(waveSpawnRef.current);

              // Yeni level'a göre spawn hızlarını ayarla - Daha hızlı
              const newSpawnInterval = Math.max(
                1500,
                5000 - (newLevel - 1) * 200
              );
              const newWaveInterval = Math.max(
                6000,
                12000 - (newLevel - 1) * 500
              );
              const newWaveEnemyCount = Math.min(
                4,
                2 + Math.floor((newLevel - 1) / 3)
              );

              enemySpawnRef.current = window.setInterval(
                spawnEnemy,
                newSpawnInterval
              );
              waveSpawnRef.current = window.setInterval(() => {
                for (let i = 0; i < newWaveEnemyCount; i++) spawnEnemy();
              }, newWaveInterval);
            }

            // Check game over
            if (newLives <= 0) {
              setTimeout(endGame, 100);
            }

            return {
              ...prevState,
              score: newScore,
              lives: Math.min(5, newLives + upgradeBonus), // Max 5 lives, add upgrade bonus
              level: newLevel,
              scoreAtLevelStart: newScoreAtLevelStart,
            };
          });
        }

        return newState;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [
      gameState.isPlaying,
      gameState.isPaused,
      gameState.level,
      gameState.isInvincible,
      gameState.invincibilityEndTime,
      gameState.hasShield,
      gameState.powerUps,
      gameState.combo,
      gameState.screenShake,
      isMobile,
      checkCollision,
      createEnhancedExplosion,
      spawnEnemy,
      endGame,
      spawnBoss,
      spawnPowerUp,
      updateCombo,
      calculateScore,
    ]
  );

  // Start game loop when playing
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameLoop]);

  // Comprehensive cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear animation frame
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = 0;
      }

      // Clear all intervals
      if (enemySpawnRef.current) {
        clearInterval(enemySpawnRef.current);
        enemySpawnRef.current = 0;
      }
      if (powerUpSpawnRef.current) {
        clearInterval(powerUpSpawnRef.current);
        powerUpSpawnRef.current = 0;
      }
      if (waveSpawnRef.current) {
        clearInterval(waveSpawnRef.current);
        waveSpawnRef.current = 0;
      }

      // Reset references
      lastTimeRef.current = 0;
      lastPlayerShotRef.current = 0;
    };
  }, []);

  // Reset game function
  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setGameObjects(initialGameObjects);

    // Clear all intervals
    if (enemySpawnRef.current) {
      clearInterval(enemySpawnRef.current);
      enemySpawnRef.current = 0;
    }
    if (waveSpawnRef.current) {
      clearInterval(waveSpawnRef.current);
      waveSpawnRef.current = 0;
    }
    if (powerUpSpawnRef.current) {
      clearInterval(powerUpSpawnRef.current);
      powerUpSpawnRef.current = 0;
    }

    // Clear game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = 0;
    }

    lastPlayerShotRef.current = 0;
    lastTimeRef.current = 0;
  }, []);

  return {
    gameState,
    gameObjects,
    moveShip,
    moveShipToPosition,
    fireBullet,
    startGame,
    togglePause,
    endGame,
    spawnBoss,
    resetGame,
  };
};
