'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameObjects, GameState, GAME_CONFIG } from '@/types/game';

interface GameCanvasProps {
  gameObjects: GameObjects;
  gameState: GameState;
  isPlaying: boolean;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameObjects, gameState, isPlaying, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const scaleRef = useRef(1);
  const dprRef = useRef(1);

  // Performance optimization refs
  const lastRenderTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const skipFrameCountRef = useRef(0);
  
  // Mobile performance detection
  const isMobile = typeof window !== 'undefined' && 
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
     window.innerWidth <= 768);

  // Optimized image loading for mobile performance
  useEffect(() => {
    // Priority-based image loading: Load essential images first
    const essentialImages = {
      // Player ships - always needed
      ship: '/images/ships/player/player-ship-basic.png',
      // Basic enemies - most common
      enemyBasic: '/images/ships/enemy/enemy-basic.png',
      enemyShooter: '/images/ships/enemy/enemy-shooter.png',
      // Essential power-ups
      heart: '/images/power-up/heart.png',
      doubleShot: '/images/power-up/double-shot.png',
      // Basic effects
      explosion: '/images/effects/explosion.png',
    };

    const secondaryImages = {
      // Advanced player ships - loaded after essentials
      shipElite: '/images/ships/player/player-ship-elite.png',
      shipCommander: '/images/ships/player/player-ship-commander.png',
      shipLegend: '/images/ships/player/player-ship-legend.png',
      shipSupreme: '/images/ships/player/player-ship-dreadnought.png',
      
      // Advanced enemies
      enemyKamikaze: '/images/ships/enemy/enemy-kamikaze.png',
      enemyBomber: '/images/ships/enemy/enemy-bomber.png',
      enemyStealth: '/images/ships/enemy/enemy-stealth.png',
      enemyAssassin: '/images/ships/enemy/enemy-assassin.png',
      
      // More power-ups
      speedBoost: '/images/power-up/speed-boost.png',
      shield: '/images/power-up/shield.png',
      tripleShot: '/images/power-up/triple-shot.png',
      laserBeam: '/images/power-up/laser-beam.png',
      invincibility: '/images/power-up/invincibility.png',
      magnet: '/images/power-up/magnet.png',
      timeSlow: '/images/power-up/time-slow.png',
      powerUpGlow: '/images/power-up/power-up-glow.png',
      
      // Effects
      shieldEffect: '/images/effects/shield-effect.png',
      engineTrail: '/images/effects/engine-trail.png',
    };

    const bossImages = {
      // Boss ships - loaded on demand when needed
      bossDestroyer: '/images/ships/boss/boss-interceptor.png',
      bossInterceptor: '/images/ships/boss/boss-destroyer.png',
      bossCruiser: '/images/ships/boss/boss-cruiser.png',
      bossBattleship: '/images/ships/boss/boss-battleship.png',
      bossDreadnought: '/images/ships/boss/boss-dreadnought.png',
      bossCarrier: '/images/ships/boss/boss-carrier.png',
      bossTitan: '/images/ships/boss/boss-titan.png',
      bossBehemoth: '/images/ships/boss/boss-behemoth.png',
      bossLeviathan: '/images/ships/boss/boss-leviathan.png',
      bossColossus: '/images/ships/boss/boss-colossus.png',
    };

    const loaded: { [key: string]: HTMLImageElement } = {};

    // Helper function to load images with retry and compression
    const loadImageBatch = (imageUrls: Record<string, string>, onComplete: () => void) => {
      let count = 0;
      const total = Object.keys(imageUrls).length;
      
      if (total === 0) {
        onComplete();
        return;
      }

      Object.entries(imageUrls).forEach(([key, url]) => {
        const img = new Image();
        
        // Optimize images for mobile
        img.loading = 'eager'; // Load immediately for essential images
        img.decoding = 'async'; // Decode asynchronously
        
        img.onload = () => {
          loaded[key] = img;
          count++;
          if (key === 'laserBeam') {
            console.log(`🎯 GameCanvas: Laser beam image loaded successfully`);
          }
          if (count === total) {
            onComplete();
          }
        };
        
        img.onerror = (error) => {
          console.warn(`⚠️ Failed to load image: ${key}`, error);
          count++;
          if (count === total) {
            onComplete();
          }
        };
        
        img.src = url;
      });
    };

    // Progressive loading: Essential -> Secondary -> Boss images
    loadImageBatch(essentialImages, () => {
      setImages({ ...loaded });
      setImagesLoaded(true); // Allow game to start with essential images
      console.log('📦 Essential images loaded, game ready!');

      // Load secondary images
      loadImageBatch(secondaryImages, () => {
        setImages({ ...loaded });
        console.log('📦 Secondary images loaded');

        // Load boss images on demand
        loadImageBatch(bossImages, () => {
          setImages({ ...loaded });
          console.log('📦 All images loaded');
        });
      });
    });
  }, []);

  // Optimized responsive sizing for mobile performance
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce resize calls for performance
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const el = containerRef.current;
        const canvas = canvasRef.current;
        if (!el || !canvas) return;
        
        const cw = el.clientWidth;
        const ch = el.clientHeight;
        
        // Optimize DPR for mobile performance (limit to 2x max)
        const rawDPR = window.devicePixelRatio || 1;
        const dpr = isMobile ? Math.min(2, Math.max(1, Math.floor(rawDPR))) : Math.max(1, Math.floor(rawDPR));
        
        const scale = Math.min(cw / GAME_CONFIG.CANVAS_WIDTH, ch / GAME_CONFIG.CANVAS_HEIGHT) || 1;
        scaleRef.current = scale;
        dprRef.current = dpr;
        
        const renderW = Math.floor(GAME_CONFIG.CANVAS_WIDTH * scale);
        const renderH = Math.floor(GAME_CONFIG.CANVAS_HEIGHT * scale);
        
        // Update canvas size
        canvas.style.width = `${renderW}px`;
        canvas.style.height = `${renderH}px`;
        canvas.width = Math.floor(renderW * dpr);
        canvas.height = Math.floor(renderH * dpr);
        
        // Optimize canvas rendering context for performance
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Disable antialiasing for better performance
          ctx.imageSmoothingEnabled = false;
          // Set pixel rendering mode for crisp pixels
          if (isMobile) {
            ctx.imageSmoothingQuality = 'low';
          }
        }
      }, isMobile ? 100 : 50); // Longer debounce on mobile
    };

    handleResize();
    
    // Use ResizeObserver with debouncing
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : undefined;
    const container = containerRef.current;
    if (ro && container) ro.observe(container);
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      if (ro && container) ro.unobserve(container);
    };
  }, [isMobile]);

  // Mobile-optimized starfield background - reduced complexity for better performance
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const time = Date.now() * 0.0003; // Even slower for mobile performance
    
    // Simple dark gradient - optimized for mobile
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#000510');
    gradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    
    ctx.save();
    
    // Reduced star count for mobile performance (was 80, now 20)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 127.3 + time * 4) % GAME_CONFIG.CANVAS_WIDTH;
      const y = (i * 83.7 + time * 2) % GAME_CONFIG.CANVAS_HEIGHT;
      const size = i % 4 === 0 ? 2 : 1; // Deterministic size for performance
      const twinkle = Math.sin(time * 2 + i) * 0.2 + 0.8;
      
      ctx.globalAlpha = twinkle * 0.7;
      ctx.fillRect(x, y, size, size);
    }
    
    // Fewer bright stars for mobile (was 20, now 5)
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    for (let i = 0; i < 5; i++) {
      const x = (i * 213.1 + time * 3) % GAME_CONFIG.CANVAS_WIDTH;
      const y = (i * 157.9 + time * 1.5) % GAME_CONFIG.CANVAS_HEIGHT;
      const size = 1.5;
      const twinkle = Math.sin(time * 1.5 + i * 0.5) * 0.3 + 0.7;
      
      ctx.globalAlpha = twinkle;
      ctx.fillRect(x, y, size, size);
    }
    
    // Minimal accent stars for mobile performance (was 5, now 1)
    ctx.fillStyle = 'rgba(100, 150, 255, 0.6)';
    for (let i = 0; i < 1; i++) {
      const x = (i * 341.7 + time * 6) % GAME_CONFIG.CANVAS_WIDTH;
      const y = (i * 197.3 + time * 4) % GAME_CONFIG.CANVAS_HEIGHT;
      const size = 1;
      const pulse = Math.sin(time + i) * 0.4 + 0.6;
      
      ctx.globalAlpha = pulse * 0.5;
      ctx.fillRect(x, y, size, size);
    }
    
    ctx.restore();
  }, []);

  const drawShip = useCallback((ctx: CanvasRenderingContext2D, ship: GameObjects['ship'], level: number = 1) => {
    // Select ship based on level (5 tiers now)
    let shipKey: keyof typeof images = 'ship';
    if (level >= 40) shipKey = 'shipSupreme'; // Will use shipLegend as fallback
    else if (level >= 30) shipKey = 'shipLegend';
    else if (level >= 20) shipKey = 'shipCommander';
    else if (level >= 10) shipKey = 'shipElite';
    
    // Get progressive ship size based on level
    const shipConfig = GAME_CONFIG.getShipConfig(level);
    const actualWidth = shipConfig.width;
    const actualHeight = shipConfig.height;

    ctx.save();
    if (gameState.isFlashing) {
      const pulse = (Math.sin(Date.now() / 120) + 1) / 2; // 0..1
      ctx.globalAlpha = 0.55 + 0.35 * pulse;
    }
    
    // Engine trail when speed boost active
    if (gameState.hasSpeedBoost) {
      const trail = images.engineTrail;
      ctx.save();
      ctx.globalAlpha = gameState.isFlashing ? 0.4 : 0.6;
      if (trail) {
        // Draw a few faded trail instances behind the ship - reduced for mobile
        for (let i = 1; i <= 2; i++) { // Reduced trail instances for mobile
          const offset = i * 10;
          ctx.globalAlpha = ((gameState.isFlashing ? 0.18 : 0.25) / i);
          ctx.drawImage(trail, ship.x, ship.y + offset, actualWidth, Math.max(8, actualHeight * 0.5));
        }
      } else {
        // Fallback glow - reduced for mobile
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 5; // Reduced shadow blur for mobile performance
        ctx.fillStyle = 'rgba(0,255,255,0.2)';
        ctx.fillRect(ship.x + 4, ship.y + actualHeight, actualWidth - 8, 12);
      }
      ctx.restore();
    }

    const sprite = images[shipKey];
    if (sprite) {
      // Add level-based glow effect
      ctx.save();
      if (level >= 20) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8; // Reduced shadow blur for mobile
      } else if (level >= 15) {
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 6; // Reduced shadow blur for mobile
      } else if (level >= 10) {
        ctx.shadowColor = '#00BFFF';
        ctx.shadowBlur = 4; // Reduced shadow blur for mobile
      }
      ctx.drawImage(sprite, ship.x, ship.y, actualWidth, actualHeight);
      ctx.restore();
    } else {
      // Fallback colors based on level
      let color = '#4A90E2';
      if (level >= 20) color = '#FFD700'; // Gold for Legend
      else if (level >= 15) color = '#FF4500'; // Orange for Commander
      else if (level >= 10) color = '#00BFFF'; // Blue for Elite
      
      ctx.fillStyle = color;
      ctx.fillRect(ship.x, ship.y, actualWidth, actualHeight);
      ctx.fillStyle = '#2E5C8A';
      ctx.fillRect(ship.x + 5, ship.y + 5, actualWidth - 10, actualHeight - 10);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(ship.x + actualWidth / 2 - 3, ship.y + actualHeight / 2 - 3, 6, 6);
    }

    ctx.restore();

    // Shield visual when invincible
    if (gameState.isInvincible) {
      const shield = images.shieldEffect;
      ctx.save();
      // Pulse alpha based on time
      const t = (Date.now() % 1000) / 1000;
      const alpha = 0.4 + Math.sin(t * Math.PI * 2) * 0.2;
      ctx.globalAlpha = alpha;
      if (shield) {
        ctx.drawImage(shield, ship.x - 8, ship.y - 8, ship.width + 16, ship.height + 16);
      } else {
        ctx.strokeStyle = 'rgba(135,206,250,0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(ship.x - 6, ship.y - 6, ship.width + 12, ship.height + 12, 10);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [images, gameState.hasSpeedBoost, gameState.isInvincible, gameState.isFlashing]);

  const drawBullet = useCallback((ctx: CanvasRenderingContext2D, bullet: GameObjects['bullets'][0], gameLevel: number = 1) => {
    const centerX = bullet.x + bullet.width / 2;
    const centerY = bullet.y + bullet.height / 2;
    const radius = Math.min(bullet.width, bullet.height) / 2;
    
    if (bullet.direction === 'up') {
      // Player bullets - special handling for laser beam and heavy shots
      ctx.save();
      const heavyPlayerShot = (bullet.damage ?? 1) > 1;
      const isLaserBeam = (bullet.damage ?? 1) >= 5 && bullet.width >= 30; // Laser beam detection
      
      if (isLaserBeam) {
        // LASER BEAM - Epic wide beam effect with engine trail
        const beamWidth = bullet.width;
        const beamHeight = bullet.height;
        
        // Enhanced trail effect using engine-trail image
        const trail = images.engineTrail;
        if (trail) {
          ctx.save();
          // Draw multiple trail instances for epic laser effect - reduced for mobile
          for (let i = 1; i <= 3; i++) { // Reduced trail instances for mobile
            const trailOffset = i * 15;
            const trailAlpha = 0.6 / i; // Fading trail
            const trailWidth = beamWidth + (i * 4); // Expanding trail
            const trailHeight = beamHeight * 0.8;
            
            ctx.globalAlpha = trailAlpha;
            ctx.filter = `hue-rotate(${i * 30}deg) saturate(150%)`; // Rainbow effect
            ctx.drawImage(trail, 
              bullet.x - (i * 2), 
              bullet.y + trailOffset, 
              trailWidth, 
              trailHeight
            );
          }
          ctx.filter = 'none';
          ctx.restore();
        }
        
        // Outer glow - wide red/orange aura - reduced for mobile
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 12; // Reduced shadow blur for mobile performance
        const outerGrad = ctx.createLinearGradient(centerX, bullet.y + beamHeight, centerX, bullet.y);
        outerGrad.addColorStop(0, 'rgba(255, 69, 0, 0.1)');   // Fade tail
        outerGrad.addColorStop(0.3, 'rgba(255, 69, 0, 0.4)');  // Orange glow
        outerGrad.addColorStop(0.7, 'rgba(255, 20, 147, 0.8)'); // Hot pink
        outerGrad.addColorStop(1, '#FFFFFF');                   // White core tip
        ctx.fillStyle = outerGrad;
        ctx.fillRect(bullet.x - 4, bullet.y, beamWidth + 8, beamHeight);
        
        // Main beam - bright core - reduced for mobile
        ctx.shadowBlur = 8; // Reduced shadow blur for mobile performance
        ctx.shadowColor = '#FF1493';
        const mainGrad = ctx.createLinearGradient(centerX, bullet.y + beamHeight, centerX, bullet.y);
        mainGrad.addColorStop(0, 'rgba(255, 20, 147, 0.3)');   // Pink fade
        mainGrad.addColorStop(0.4, '#FF1493');                 // Deep pink
        mainGrad.addColorStop(0.8, '#FF69B4');                 // Hot pink
        mainGrad.addColorStop(1, '#FFFFFF');                   // White hot tip
        ctx.fillStyle = mainGrad;
        ctx.fillRect(bullet.x, bullet.y, beamWidth, beamHeight);
        
        // Inner white core - blazing center - reduced for mobile
        const coreWidth = beamWidth * 0.3;
        const coreX = centerX - coreWidth / 2;
        ctx.shadowBlur = 4; // Reduced shadow blur for mobile performance
        ctx.shadowColor = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(coreX, bullet.y, coreWidth, beamHeight);
        
        // Tip flare effect
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(coreX, bullet.y, coreWidth, beamHeight * 0.2);
        
      } else if (heavyPlayerShot) {
        // Heavy shots - cyan beam
        const gradient = ctx.createLinearGradient(centerX, bullet.y + bullet.height, centerX, bullet.y);
        gradient.addColorStop(0, 'rgba(0,255,255,0)');
        gradient.addColorStop(0.35, 'rgba(0,255,255,0.5)');
        gradient.addColorStop(1, '#E0FFFF');
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 9; // Reduced shadow blur for mobile performance
        ctx.fillStyle = gradient;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      } else {
        // Level-based bullet design - size and color progression
        
        // Determine ship tier based on level
        let tier = 'basic';
        if (gameLevel >= 40) { tier = 'supreme'; }
        else if (gameLevel >= 30) { tier = 'legend'; }
        else if (gameLevel >= 20) { tier = 'commander'; }
        else if (gameLevel >= 10) { tier = 'elite'; }
        else { tier = 'basic'; }
        
        // Base bullet dimensions - progressively larger with ship tier
        const baseWidth = tier === 'basic' ? 3 : 
                         tier === 'elite' ? 4 :
                         tier === 'commander' ? 5 :
                         tier === 'legend' ? 6 : 7; // supreme
        
        const baseHeight = tier === 'basic' ? 14 : 
                          tier === 'elite' ? 18 :
                          tier === 'commander' ? 22 :
                          tier === 'legend' ? 26 : 30; // supreme
        
        // For multi-shot, keep size consistent but change color
        const isMultiShot = heavyPlayerShot && (bullet.damage ?? 1) <= 4; // Multi-shot detection
        const bulletWidth = Math.max(baseWidth, bullet.width * 0.8);
        const bulletHeight = Math.max(baseHeight, bullet.height * 1.8);
        const bulletX = centerX - bulletWidth / 2;
        const bulletY = bullet.y;
        
        // Color scheme based on tier and multi-shot
        let mainColors: string[] = ['rgba(255, 215, 0, 0.3)', '#FFD700', '#FFF700', '#FFFFFF'];
        let glowColor: string = '#FFD700';
        if (isMultiShot) {
          // Multi-shot: Enhanced glow version of tier color
          switch(tier) {
            case 'basic': 
              mainColors = ['rgba(255, 215, 0, 0.4)', '#FFD700', '#FFF700', '#FFFFFF'];
              glowColor = '#FFD700';
              break;
            case 'elite':
              mainColors = ['rgba(255, 140, 0, 0.4)', '#FF8C00', '#FFA500', '#FFFFFF'];
              glowColor = '#FF8C00';
              break;
            case 'commander':
              mainColors = ['rgba(255, 20, 147, 0.4)', '#FF1493', '#FF69B4', '#FFFFFF'];
              glowColor = '#FF1493';
              break;
            case 'legend':
              mainColors = ['rgba(138, 43, 226, 0.4)', '#8A2BE2', '#9370DB', '#FFFFFF'];
              glowColor = '#8A2BE2';
              break;
            case 'supreme':
              mainColors = ['rgba(255, 255, 255, 0.4)', '#FFFFFF', '#F8F8FF', '#FFFFFF'];
              glowColor = '#FFFFFF';
              break;
          }
        } else {
          // Single shot: Standard tier colors
          switch(tier) {
            case 'basic': 
              mainColors = ['rgba(255, 215, 0, 0.3)', '#FFD700', '#FFF700', '#FFFFFF'];
              glowColor = '#FFD700';
              break;
            case 'elite':
              mainColors = ['rgba(255, 140, 0, 0.3)', '#FF8C00', '#FFA500', '#FFFFFF'];
              glowColor = '#FF8C00';
              break;
            case 'commander':
              mainColors = ['rgba(255, 20, 147, 0.3)', '#FF1493', '#FF69B4', '#FFFFFF'];
              glowColor = '#FF1493';
              break;
            case 'legend':
              mainColors = ['rgba(138, 43, 226, 0.3)', '#8A2BE2', '#9370DB', '#FFFFFF'];
              glowColor = '#8A2BE2';
              break;
            case 'supreme':
              mainColors = ['rgba(255, 255, 255, 0.3)', '#FFFFFF', '#F0F8FF', '#FFFFFF'];
              glowColor = '#FFFFFF';
              break;
          }
        }
        
        // Outer glow effect - reduced for mobile performance
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isMultiShot ? 8 : 6; // Reduced shadow blur for mobile
        
        // Main bullet body - gradient with tier colors
        const gradient = ctx.createLinearGradient(bulletX, bulletY + bulletHeight, bulletX, bulletY);
        gradient.addColorStop(0, mainColors[0]); // Tail fade
        gradient.addColorStop(0.2, mainColors[1]); // Body color
        gradient.addColorStop(0.7, mainColors[2]); // Bright center
        gradient.addColorStop(1, mainColors[3]);   // White hot tip
        
        ctx.fillStyle = gradient;
        ctx.fillRect(bulletX, bulletY, bulletWidth, bulletHeight);
        
        // Inner bright core - simplified for mobile
        const coreWidth = bulletWidth * 0.4;
        const coreX = centerX - coreWidth / 2;
        ctx.shadowBlur = isMultiShot ? 4 : 3; // Reduced shadow blur
        ctx.shadowColor = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(coreX, bulletY, coreWidth, bulletHeight * 0.8);
        
        // Tip glow effect
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(coreX, bulletY, coreWidth, bulletHeight * 0.3);
        
        // Ship tier sparkle effect for higher tiers
        if (tier !== 'basic' && Math.random() < 0.3) {
          ctx.fillStyle = glowColor;
          ctx.fillRect(bulletX - 1, bulletY + Math.random() * bulletHeight, 2, 2);
        }
      }
      ctx.restore();
    } else {
      // Enemy bullets - differentiate heavy shots
      ctx.save();
      const heavyHit = (bullet.damage ?? 1) > 1;
      if (heavyHit) {
        ctx.shadowColor = '#FF00A8';
        ctx.shadowBlur = 5; // Reduced shadow blur for mobile
        ctx.fillStyle = '#FF00A8';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFA6F6';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.shadowColor = '#FF4444';
        ctx.shadowBlur = 3; // Reduced shadow blur for mobile
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        // Add inner highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FF8888';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }, [images.engineTrail]);

  const drawEnemy = useCallback((ctx: CanvasRenderingContext2D, enemy: GameObjects['enemies'][0]) => {
    let key: keyof typeof images = 'enemyBasic';
    if (enemy.type === 'shooter') key = 'enemyShooter';
    if (enemy.type === 'kamikaze') key = 'enemyKamikaze';
    if (enemy.type === 'bomber') key = 'enemyBomber';
    if (enemy.type === 'stealth') key = 'enemyStealth';
    if (enemy.type === 'assassin') key = 'enemyAssassin';
    
    const sprite = images[key];
    if (sprite) {
      // Stealth enemy - make it semi-transparent
      if (enemy.type === 'stealth') {
        ctx.save();
        ctx.globalAlpha = 0.6; // 60% opacity
        ctx.drawImage(sprite, enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.restore();
      } else {
        ctx.drawImage(sprite, enemy.x, enemy.y, enemy.width, enemy.height);
      }
    } else {
      let color = '#FF4444';
      if (enemy.type === 'shooter') color = '#FF8844';
      if (enemy.type === 'kamikaze') color = '#FF0000';
      if (enemy.type === 'bomber') color = '#8B4513'; // Brown for bomber
      if (enemy.type === 'stealth') color = '#4A4A4A'; // Dark gray for stealth
      if (enemy.type === 'assassin') color = '#8B008B'; // Purple for assassin
      
      ctx.fillStyle = color;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      ctx.fillStyle = '#AA0000';
      ctx.fillRect(enemy.x + 3, enemy.y + 3, enemy.width - 6, enemy.height - 6);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(enemy.x + enemy.width / 2 - 2, enemy.y + enemy.height / 2 - 2, 4, 4);
      
      // Special effects for new enemy types
      if (enemy.type === 'bomber') {
        // Draw bomb icon
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x + enemy.width / 2 - 3, enemy.y - 5, 6, 6);
      }
      if (enemy.type === 'stealth') {
        // Draw stealth effect
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.restore();
      }
      if (enemy.type === 'assassin') {
        // Draw assassin effect - purple glow
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(enemy.x - 2, enemy.y - 2, enemy.width + 4, enemy.height + 4);
        ctx.restore();
      }
    }
  }, [images]);

  const drawPowerUp = useCallback((ctx: CanvasRenderingContext2D, powerUp: GameObjects['powerUps'][0]) => {
    let key: keyof typeof images = 'heart';
    if (powerUp.type === 'doubleShot') key = 'doubleShot';
    if (powerUp.type === 'speedBoost') key = 'speedBoost';
    if (powerUp.type === 'shield') key = 'shield';
    if (powerUp.type === 'tripleShot') key = 'tripleShot';
    if (powerUp.type === 'laserBeam') key = 'laserBeam';
    if (powerUp.type === 'invincibility') key = 'invincibility';
    if (powerUp.type === 'magnet') key = 'magnet';
    if (powerUp.type === 'timeSlow') key = 'timeSlow';
    
    const sprite = images[key];
    // Debug laser beam image loading
    if (powerUp.type === 'laserBeam') {
      console.log(`🔫 LaserBeam power-up: Image loaded = ${!!sprite}, Key = ${key}, ImagesLoaded = ${imagesLoaded}`);
    }
    if (sprite) {
      // Add glow effect for power-ups - reduced for mobile
      ctx.save();
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 5; // Reduced shadow blur for mobile performance
      ctx.drawImage(sprite, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      ctx.restore();
    } else {
      let color = '#00FF00';
      if (powerUp.type === 'heart') color = '#FF69B4';
      if (powerUp.type === 'doubleShot') color = '#00FFFF';
      if (powerUp.type === 'speedBoost') color = '#FFFF00';
      if (powerUp.type === 'shield') color = '#00BFFF';
      if (powerUp.type === 'tripleShot') color = '#FF00FF';
      if (powerUp.type === 'laserBeam') color = '#FF4500';
      if (powerUp.type === 'invincibility') color = '#FFD700';
      if (powerUp.type === 'magnet') color = '#8A2BE2';
      if (powerUp.type === 'timeSlow') color = '#20B2AA';
      
      ctx.fillStyle = color;
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(powerUp.x + 2, powerUp.y + 2, powerUp.width - 4, powerUp.height - 4);
    }
  }, [images, imagesLoaded]);

  // Particle system removed for better mobile performance - using explosion images instead

  const drawExplosion = useCallback((ctx: CanvasRenderingContext2D, explosion: GameObjects['explosions'][0]) => {
    const image = images.explosion;
    const progress = explosion.frame / explosion.maxFrames;
    const alpha = 1 - progress;
    const size = explosion.width * (0.3 + progress * 0.7);
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    if (image) {
      // Use explosion spritesheet if available
      // Assume square frames laid out horizontally; derive frame count from aspect ratio
      const derivedFrameCount = Math.max(1, Math.floor(image.width / image.height));
      const frameCount = derivedFrameCount || explosion.maxFrames;
      const currentFrame = Math.min(frameCount - 1, Math.floor(progress * frameCount));
      const frameWidth = image.width / frameCount;
      const sourceX = currentFrame * frameWidth;
      
      // Add multiple glow layers for better effect - reduced for mobile
      ctx.shadowColor = explosion.type === 'boss' ? '#FF4500' : '#FFD700';
      ctx.shadowBlur = 10; // Reduced shadow blur for mobile performance
      ctx.drawImage(
        image,
        sourceX, 0, frameWidth, image.height,
        explosion.x, explosion.y, explosion.width, explosion.height
      );
      
      // Add extra glow layer - reduced for mobile
      ctx.shadowBlur = 15; // Reduced shadow blur for mobile performance
      ctx.globalAlpha = alpha * 0.5;
      ctx.drawImage(
        image,
        sourceX, 0, frameWidth, image.height,
        explosion.x - 5, explosion.y - 5, explosion.width + 10, explosion.height + 10
      );
    } else {
      // Enhanced fallback explosion effect
      const centerX = explosion.x + explosion.width/2;
      const centerY = explosion.y + explosion.height/2;
      
      // Outer explosion ring - reduced for mobile
      ctx.shadowColor = explosion.type === 'boss' ? '#FF4500' : '#FFD700';
      ctx.shadowBlur = 12; // Reduced shadow blur for mobile performance
      ctx.fillStyle = explosion.type === 'boss' ? '#FF4500' : '#FFD700';
      ctx.beginPath();
      ctx.arc(centerX, centerY, size/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Middle explosion ring - reduced for mobile
      ctx.shadowBlur = 8; // Reduced shadow blur for mobile performance
      ctx.fillStyle = explosion.type === 'boss' ? '#FF6600' : '#FFA500';
      ctx.beginPath();
      ctx.arc(centerX, centerY, size/3, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner explosion core - reduced for mobile
      ctx.shadowBlur = 5; // Reduced shadow blur for mobile performance
      ctx.fillStyle = explosion.type === 'boss' ? '#FF0000' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX, centerY, size/6, 0, Math.PI * 2);
      ctx.fill();
      
      // Add sparkle effects - reduced for mobile
      ctx.shadowBlur = 3; // Reduced shadow blur for mobile performance
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 4; i++) { // Reduced sparkle count for mobile
        const angle = (i * Math.PI) / 4;
        const sparkleX = centerX + Math.cos(angle) * (size/2 + progress * 20);
        const sparkleY = centerY + Math.sin(angle) * (size/2 + progress * 20);
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2 + progress * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }, [images]);

  const drawBoss = useCallback((ctx: CanvasRenderingContext2D, boss: GameObjects['boss']) => {
    if (!boss || !imagesLoaded) return;
    
    const imageKey = `boss${boss.type.charAt(0).toUpperCase() + boss.type.slice(1)}` as keyof typeof images;
    const image = images[imageKey];
    
    if (image) {
      // Draw boss with special effects
      ctx.save();
      
      // Boss glow effect - reduced for mobile
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10; // Reduced shadow blur for mobile performance
      
      // Draw boss image
      ctx.drawImage(image, boss.x, boss.y, boss.width, boss.height);
      
      // Boss health indicator removed from canvas - only shown in UI
      
      ctx.restore();
    } else {
      // Fallback: draw colored rectangle
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    }
  }, [images, imagesLoaded]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastRenderTimeRef.current;
    frameCountRef.current++;

    // Adaptive frame skipping for mobile performance
    const targetFrameTime = isMobile ? 33.33 : 16.67; // 30fps mobile, 60fps desktop
    if (deltaTime < targetFrameTime && frameCountRef.current > 10) {
      return; // Skip frame to maintain target framerate
    }

    // Skip every other frame on mobile when performance is poor
    if (isMobile && deltaTime > targetFrameTime * 2) {
      if (skipFrameCountRef.current % 2 === 0) {
        skipFrameCountRef.current++;
        return;
      }
      skipFrameCountRef.current++;
    }

    lastRenderTimeRef.current = currentTime;

    // Optimized canvas setup
    const scale = scaleRef.current;
    const dpr = dprRef.current;
    
    // Enable image smoothing only when needed (disabled for pixel art performance)
    ctx.imageSmoothingEnabled = false;
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply screen shake effect if player took damage
    let shakeX = 0, shakeY = 0;
    if (gameState.screenShake > 0) {
      const intensity = Math.min(gameState.screenShake / 80, 6); // Max 6px shake
      shakeX = (Math.random() - 0.5) * intensity;
      shakeY = (Math.random() - 0.5) * intensity;
    }
    
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, shakeX * dpr, shakeY * dpr);

    // Background - drawn only when not paused for performance
    if (!isPaused) {
      drawBackground(ctx);
    }

    if (!isPlaying) {
      if (!imagesLoaded) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading game assets...', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2);
      }
      return;
    }

    // Batch rendering for performance - reduce context state changes
    ctx.save();
    
    // Draw static objects first (ship)
    drawShip(ctx, gameObjects.ship, gameObjects.level || 1);
    
    // Draw bullets in batch to minimize context switches
    if (gameObjects.bullets.length > 0) {
      gameObjects.bullets.forEach(b => drawBullet(ctx, b, gameObjects.level || 1));
    }
    
    if (gameObjects.enemyBullets.length > 0) {
      gameObjects.enemyBullets.forEach(b => drawBullet(ctx, b, gameObjects.level || 1));
    }
    
    // Draw enemies
    if (gameObjects.enemies.length > 0) {
      gameObjects.enemies.forEach(e => drawEnemy(ctx, e));
    }
    
    // Draw power-ups
    if (gameObjects.powerUps.length > 0) {
      gameObjects.powerUps.forEach(p => drawPowerUp(ctx, p));
    }
    
    // Draw explosions (reasonable limit for mobile performance)
    const maxExplosions = isMobile ? 8 : 15; // Increased limits for better visual effects
    const explosionsToRender = gameObjects.explosions.slice(0, maxExplosions);
    if (explosionsToRender.length > 0) {
      explosionsToRender.forEach(e => drawExplosion(ctx, e));
    }
    
    // Draw boss if present and alive
    if (gameObjects.boss && gameObjects.boss.health > 0) {
      drawBoss(ctx, gameObjects.boss);
    }
    
    ctx.restore();

    // Pause overlay
    if (isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2);
      ctx.font = '24px Arial';
      ctx.fillText('Press P to resume', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 50);
    }

    // Game completion overlay
    if (gameState.gameCompleted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
      
      // Victory text
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VICTORY!', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 - 100);
      
      // Final score
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(`Final Score: ${gameState.score.toLocaleString()}`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 - 20);
      
      // Level reached
      ctx.font = 'bold 28px Arial';
      ctx.fillText(`Level Reached: ${gameState.level}`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 20);
      
      // Congratulations
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Congratulations! You have conquered all bosses!', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 80);
      
      // Restart instruction
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '20px Arial';
      ctx.fillText('Press R to restart', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 120);
    }
  }, [gameObjects, gameState, isPlaying, isPaused, imagesLoaded, drawBackground, drawShip, drawBullet, drawEnemy, drawPowerUp, drawExplosion, drawBoss, isMobile]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [render]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ zIndex: 10 }}>
      <canvas ref={canvasRef} className="block bg-black" style={{ imageRendering: 'pixelated', zIndex: 10 }} />
      {!imagesLoaded && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white">Loading game assets...</p>
          </div>
        </div>
      )}
    </div>
  );
};
