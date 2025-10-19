export type Direction = 'up' | 'down';

export interface Position {
  x: number;
  y: number;
}

export interface Ship extends Position {
  width: number;
  height: number;
  speed: number;
}

export interface Bullet extends Position {
  width: number;
  height: number;
  speed: number;
  direction: Direction;
  damage?: number;
  type?: "normal" | "laser"; // Engine-trail efekti için tip eklendi
}

export type EnemyType = 'basic' | 'shooter' | 'kamikaze' | 'bomber' | 'stealth' | 'assassin';

export interface Enemy extends Position {
  width: number;
  height: number;
  speed: number;
  type: EnemyType;
  health: number;
  lastShot: number;
}

export type PowerUpType = 'heart' | 'doubleShot' | 'speedBoost' | 'shield' | 'tripleShot' | 'laserBeam' | 'invincibility' | 'magnet' | 'timeSlow';

export interface PowerUp extends Position {
  width: number;
  height: number;
  speed: number;
  type: PowerUpType;
  active: boolean;
  duration: number;
  endTime?: number; // when active, UI can show time remaining
}

export type BossType = 'destroyer' | 'cruiser' | 'battleship' | 'dreadnought' | 'interceptor' | 'carrier' | 'titan' | 'behemoth' | 'leviathan' | 'colossus';

export type BossPhase = 'normal' | 'aggressive' | 'desperate';
export type BossMovementPattern = 'horizontal' | 'figure8' | 'circle' | 'vertical';

export interface BossAI {
  currentPhase: BossPhase;
  movementPattern: BossMovementPattern;
  phaseChangeTime: number;
  patternStartTime: number;
  aggressionLevel: number; // 0-1, increases as health decreases
  lastFiringMode?: string; // Track firing mode changes
  burstCount?: number; // For burst firing mode
  burstCooldown?: number; // Cooldown after burst
  randomCooldown?: number; // Random pause between shots
  shotsSinceLastPause?: number; // Track shots for random pauses
}

export interface Boss extends Position {
  width: number;
  height: number;
  speed: number;
  type: BossType;
  health: number;
  maxHealth: number;
  // Dynamic per-instance fire timings (can differ from GAME_CONFIG based on level)
  fireRate: number;
  specialAttackRate: number;
  lastShot: number;
  lastSpecialAttack: number;
  isActive: boolean;
  // Advanced AI system
  ai: BossAI;
}

export interface Particle {
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'spark' | 'smoke' | 'fire' | 'magic';
}

export interface Explosion {
  x: number;
  y: number;
  width: number;
  height: number;
  frame: number;
  maxFrames: number;
  type: 'enemy' | 'boss' | 'player';
}

// Performance optimization interfaces
export interface Poolable {
  isActive: boolean;
  reset?(): void;
}

export interface ObjectPool<T extends Poolable> {
  pool: T[];
  activeCount: number;
  maxSize: number;
  get(): T | null;
  release(obj: T): void;
  clear(): void;
}

export interface PooledBullet extends Bullet, Poolable {}
export interface PooledEnemy extends Enemy, Poolable {}
export interface PooledExplosion extends Explosion, Poolable {}
export interface PooledPowerUp extends PowerUp, Poolable {}

export interface PerformanceConfig {
  enableObjectPooling: boolean;
  enableSpatialOptimization: boolean;
  maxBullets: number;
  maxEnemies: number;
  maxExplosions: number;
  targetFPS: number;
}

export interface GameObjects {
  ship: Ship;
  bullets: Bullet[];
  enemies: Enemy[];
  enemyBullets: Bullet[];
  powerUps: PowerUp[];
  boss: Boss | null;
  explosions: Explosion[];
  particles: Particle[];
  level: number;
}

export interface ComboSystem {
  consecutiveHits: number;
  multiplier: number;
  lastHitTime: number;
  comboTimer: number;
  maxCombo: number;
  comboEndTime: number;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  // Level progression baseline to avoid big jumps from accumulated score (e.g., after bosses)
  scoreAtLevelStart: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  gameCompleted: boolean;
  hasDoubleShot: boolean;
  hasSpeedBoost: boolean;
  isBossFight: boolean;
  bossJustDefeated: boolean;
  powerUps: PowerUp[];
  isInvincible: boolean;
  invincibilityEndTime: number;
  isFlashing: boolean;
  hasShield: boolean; // Shield-specific protection (doesn't protect from enemy escape)
  // Player shot tier: 1=single, 2=double, 3=triple (unlocks at 10/20/30 after boss)
  playerShotTier?: number;
  // Combo system for consecutive hits
  combo: ComboSystem;
  // Screen shake when player takes damage
  screenShake: number; // Duration in ms, decreases over time
  // Statistics for blockchain submission
  gameStartTime: number; // When the game started
}

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 1480,

  // Sizes tuned for mobile scaling (virtual units)
  SHIP_WIDTH: 64, // Legacy - now using SHIP_SIZES
  SHIP_HEIGHT: 64, // Legacy - now using SHIP_SIZES
  
  // Progressive ship sizes and stats based on level
  SHIP_UPGRADES: {
    basic: { 
      width: 80, height: 80, 
      shotCount: 1, damage: 1, 
      powerUpCapacity: 3, // Can hold 3 active power-ups
      levels: [1, 9], name: 'BASIC FIGHTER'
    },
    elite: { 
      width: 100, height: 100, 
      shotCount: 2, damage: 1.5, 
      powerUpCapacity: 5, // Can hold 5 active power-ups
      levels: [10, 19], name: 'ELITE INTERCEPTOR'
    },
    commander: { 
      width: 140, height: 140, 
      shotCount: 3, damage: 2, 
      powerUpCapacity: 7, // Can hold 7 active power-ups
      levels: [20, 29], name: 'COMMANDER CRUISER'
    },
    legend: { 
      width: 160, height: 160, 
      shotCount: 4, damage: 2.5, 
      powerUpCapacity: 9, // Can hold 9 active power-ups
      levels: [30, 39], name: 'LEGEND BATTLESHIP'
    },
    supreme: { 
      width: 200, height: 200, 
      shotCount: 5, damage: 3, 
      powerUpCapacity: 10, // Can hold 11 active power-ups
      levels: [40, 50], name: 'SUPREME DREADNOUGHT'
    }
  },
  ENEMY_SIZE: 48,
  POWER_UP_SIZE: 32,

  SHIP_SPEED: 10,
  BULLET_SPEED: 20,
  ENEMY_BULLET_SPEED: 7,
  POINTS_PER_ENEMY: 10,
  ENEMY_ESCAPE_DAMAGE: 1,

  LEVEL_UP_THRESHOLD: 400, // Base threshold for level 1 (40 enemies). Progressive: L1=400, L2=600, L3=800, etc.
  MAX_LEVEL: 50,

  POWER_UP_DURATION: 15000, // ms - Extended duration for better gameplay
  
  // Combo System Configuration
  COMBO_TIMEOUT: 4500, // ms - Extended for easier combo building
  COMBO_MULTIPLIERS: [1.0, 1.2, 1.5, 2.0, 2.5, 3.0], // score multipliers for combo levels
  MAX_COMBO_LEVEL: 5,

  ENEMY_TYPES: {
    basic: { speed: 1.4, health: 1, canShoot: false, fireRate: 0 },
    shooter: { speed: 1.8, health: 2, canShoot: true, fireRate: 2200 }, // Slower: 1400 -> 2200ms
    kamikaze: { speed: 3.2, health: 1, canShoot: false, fireRate: 0 },
    bomber: { speed: 1.0, health: 4, canShoot: true, fireRate: 3500 }, // Güçlü ama 4 canlı
    stealth: { speed: 3.4, health: 4, canShoot: true, fireRate: 1800 }, // Much slower: 1000 -> 1800ms
    assassin: { speed: 3.2, health: 5, canShoot: true, fireRate: 2000 }, // Slower: 1200 -> 2000ms
  } as Record<EnemyType, { speed: number; health: number; canShoot: boolean; fireRate: number }>,

  // Bonus points for defeating a boss (avoid per-hit score inflation)
  BOSS_DEFEAT_BONUS: 500,

  BOSS_TYPES: {
    destroyer: { 
      speed: 2.4, 
      health: 100, // Swapped with interceptor - now lighter
      width: 120, 
      height: 120, 
      bulletCount: 1, // Single bullet - first boss easy
      fireRate: 2000, // Much much slower for first boss - manageable for beginners
      specialAttackRate: 25000 // Much slower special
    },
    interceptor: { 
      speed: 3.4, 
      health: 200, // Swapped with destroyer - now tougher
      width: 120, 
      height: 120, 
      bulletCount: 2, // Two bullets - second boss progression
      fireRate: 1800, // Slower fire rate
      specialAttackRate: 22000 // Slower special
    },
    cruiser: { 
      speed: 1.9, 
      health: 300, // Increased from 210
      width: 140, 
      height: 140, 
      bulletCount: 3, // Three bullets - third boss progression
      fireRate: 1600, // Slower fire rate
      specialAttackRate: 20000 // Slower cooldown
    },
    battleship: { 
      speed: 1.3, 
      health: 450, // Increased from 320
      width: 160, 
      height: 160, 
      bulletCount: 4, // Four bullets - fourth boss progression
      fireRate: 1400, // Much slower fire rate  
      specialAttackRate: 18000 // Slower cooldown
    },
    dreadnought: { 
      speed: 1.1, 
      health: 650, // Increased from 470
      width: 180, 
      height: 180, 
      bulletCount: 5, // Five bullets - fifth boss progression
      fireRate: 1300, // Much slower fire rate
      specialAttackRate: 19000 // Slower cooldown
    },
    carrier: { 
      speed: 0.9, 
      health: 850, // Increased from 650
      width: 200, 
      height: 200, 
      bulletCount: 6, // Six bullets - sixth boss progression
      fireRate: 1200, // Much slower fire rate
      specialAttackRate: 21000 // Slower cooldown
    },
    titan: { 
      speed: 0.8, 
      health: 1200, // Increased from 900
      width: 220, 
      height: 220, 
      bulletCount: 7, // Seven bullets - seventh boss progression
      fireRate: 1100, // Much slower but still challenging
      specialAttackRate: 22000 // Slower cooldown
    },
    behemoth: { 
      speed: 0.7, 
      health: 1600, // Increased from 1300
      width: 250, 
      height: 250, 
      bulletCount: 8, // Eight bullets - eighth boss progression
      fireRate: 1000, // Much slower - manageable
      specialAttackRate: 23000 // Slower cooldown
    },
    leviathan: { 
      speed: 0.6, 
      health: 2200, // Increased from 1850
      width: 280, 
      height: 280, 
      bulletCount: 9, // Nine bullets - ninth boss progression
      fireRate: 950, // Slower but still challenging
      specialAttackRate: 24000 // Slower cooldown
    },
    colossus: { 
      speed: 0.5, 
      health: 3000, // Increased from 2900
      width: 320, 
      height: 320, 
      bulletCount: 10, // Ten bullets - final boss challenge
      fireRate: 900, // Much slower for final boss - still challenging but fair
      specialAttackRate: 25000 // Slower final boss intensity
    }
  } as Record<BossType, { 
    speed: number; 
    health: number; 
    width: number; 
    height: number; 
    bulletCount: number;
    fireRate: number;
    specialAttackRate: number;
  }>,
  
  // Helper function to get ship configuration based on level
  getShipConfig: (level: number) => {
    if (level >= 40) return { type: 'supreme', ...GAME_CONFIG.SHIP_UPGRADES.supreme };
    if (level >= 30) return { type: 'legend', ...GAME_CONFIG.SHIP_UPGRADES.legend };
    if (level >= 20) return { type: 'commander', ...GAME_CONFIG.SHIP_UPGRADES.commander };
    if (level >= 10) return { type: 'elite', ...GAME_CONFIG.SHIP_UPGRADES.elite };
    return { type: 'basic', ...GAME_CONFIG.SHIP_UPGRADES.basic };
  }
} as const;
