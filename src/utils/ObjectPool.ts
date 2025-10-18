import { 
  Poolable, 
  ObjectPool, 
  PooledBullet, 
  PooledEnemy, 
  PooledExplosion, 
  PooledPowerUp
} from '@/types/game';

class GameObjectPool<T extends Poolable> implements ObjectPool<T> {
  pool: T[] = [];
  activeCount: number = 0;
  maxSize: number;
  private createFunction: () => T;

  constructor(maxSize: number, createFunction: () => T) {
    this.maxSize = maxSize;
    this.createFunction = createFunction;
    
    // Pre-allocate objects for better performance
    for (let i = 0; i < maxSize; i++) {
      const obj = createFunction();
      obj.isActive = false;
      this.pool.push(obj);
    }
  }

  get(): T | null {
    // Find first inactive object
    for (let i = 0; i < this.pool.length; i++) {
      const obj = this.pool[i];
      if (!obj.isActive) {
        obj.isActive = true;
        this.activeCount++;
        return obj;
      }
    }
    
    // No available objects
    return null;
  }

  release(obj: T): void {
    if (obj.isActive) {
      obj.isActive = false;
      this.activeCount--;
      
      // Reset object if it has a reset method
      if (obj.reset) {
        obj.reset();
      }
    }
  }

  clear(): void {
    this.pool.forEach(obj => {
      obj.isActive = false;
      if (obj.reset) {
        obj.reset();
      }
    });
    this.activeCount = 0;
  }

  getActiveObjects(): T[] {
    return this.pool.filter(obj => obj.isActive);
  }

  getInactiveCount(): number {
    return this.maxSize - this.activeCount;
  }
}

// Factory functions for different object types
export const createBulletPool = (maxSize: number): GameObjectPool<PooledBullet> => {
  return new GameObjectPool<PooledBullet>(maxSize, () => ({
    x: 0,
    y: 0,
    width: 8,
    height: 16,
    speed: 20,
    direction: 'up' as const,
    isActive: false,
    reset() {
      this.x = 0;
      this.y = 0;
      this.width = 8;
      this.height = 16;
      this.speed = 20;
      this.direction = 'up';
      this.damage = undefined;
    }
  }));
};

export const createEnemyPool = (maxSize: number): GameObjectPool<PooledEnemy> => {
  return new GameObjectPool<PooledEnemy>(maxSize, () => ({
    x: 0,
    y: 0,
    width: 48,
    height: 48,
    speed: 2,
    type: 'basic',
    health: 1,
    lastShot: 0,
    isActive: false,
    reset() {
      this.x = 0;
      this.y = 0;
      this.width = 48;
      this.height = 48;
      this.speed = 2;
      this.type = 'basic';
      this.health = 1;
      this.lastShot = 0;
    }
  }));
};

export const createExplosionPool = (maxSize: number): GameObjectPool<PooledExplosion> => {
  return new GameObjectPool<PooledExplosion>(maxSize, () => ({
    x: 0,
    y: 0,
    width: 60,
    height: 60,
    frame: 0,
    maxFrames: 12,
    type: 'enemy',
    isActive: false,
    reset() {
      this.x = 0;
      this.y = 0;
      this.width = 60;
      this.height = 60;
      this.frame = 0;
      this.maxFrames = 12;
      this.type = 'enemy';
    }
  }));
};

export const createPowerUpPool = (maxSize: number): GameObjectPool<PooledPowerUp> => {
  return new GameObjectPool<PooledPowerUp>(maxSize, () => ({
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    speed: 3,
    type: 'heart',
    active: false,
    duration: 0,
    isActive: false,
    reset() {
      this.x = 0;
      this.y = 0;
      this.width = 32;
      this.height = 32;
      this.speed = 3;
      this.type = 'heart';
      this.active = false;
      this.duration = 0;
      this.endTime = undefined;
    }
  }));
};

// Spatial optimization helper
export class SpatialGrid {
  private cellSize: number;
  private cols: number;
  private rows: number;
  private grid: Map<string, Poolable[]>;
  private width: number;
  private height: number;

  constructor(width: number, height: number, cellSize: number = 100) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = new Map();
  }

  clear(): void {
    this.grid.clear();
  }

  private getKey(col: number, row: number): string {
    return `${col},${row}`;
  }

  private getCell(x: number, y: number): { col: number; row: number } {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    return {
      col: Math.max(0, Math.min(this.cols - 1, col)),
      row: Math.max(0, Math.min(this.rows - 1, row))
    };
  }

  insert(obj: Poolable & { x: number; y: number; width: number; height: number }): void {
    const { col, row } = this.getCell(obj.x + obj.width / 2, obj.y + obj.height / 2);
    const key = this.getKey(col, row);
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    
    this.grid.get(key)!.push(obj);
  }

  query(x: number, y: number, width: number, height: number): Poolable[] {
    const result: Poolable[] = [];
    const startCell = this.getCell(x, y);
    const endCell = this.getCell(x + width, y + height);

    for (let col = startCell.col; col <= endCell.col; col++) {
      for (let row = startCell.row; row <= endCell.row; row++) {
        const key = this.getKey(col, row);
        const cell = this.grid.get(key);
        if (cell) {
          result.push(...cell);
        }
      }
    }

    return result;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private frameTimeHistory: number[] = [];
  private maxHistorySize = 60; // Track last 60 frames

  updateFrame(currentTime: number): void {
    if (this.lastTime > 0) {
      const frameTime = currentTime - this.lastTime;
      this.frameTimeHistory.push(frameTime);
      
      if (this.frameTimeHistory.length > this.maxHistorySize) {
        this.frameTimeHistory.shift();
      }
      
      // Calculate FPS from average frame time
      if (this.frameTimeHistory.length >= 10) {
        const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b) / this.frameTimeHistory.length;
        this.fps = 1000 / avgFrameTime;
      }
    }
    
    this.lastTime = currentTime;
    this.frameCount++;
  }

  getFPS(): number {
    return Math.round(this.fps);
  }

  getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 16.67; // 60 FPS default
    return this.frameTimeHistory.reduce((a, b) => a + b) / this.frameTimeHistory.length;
  }

  shouldDropQuality(): boolean {
    return this.fps < 20; // Drop quality if FPS is too low
  }

  shouldSkipFrame(targetFPS: number): boolean {
    const targetFrameTime = 1000 / targetFPS;
    const currentFrameTime = this.getAverageFrameTime();
    return currentFrameTime > targetFrameTime * 1.2; // Skip if 20% slower than target
  }
}
