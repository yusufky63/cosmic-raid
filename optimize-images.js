const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Resim boyutları ve ayarları
const imageConfigs = {
  // Oyuncu Gemileri
  'player-ship-basic.png': { width: 80, height: 80, quality: 85 },
  'player-ship-elite.png': { width: 90, height: 90, quality: 85 },
  'player-ship-commander.png': { width: 100, height: 100, quality: 85 },
  'player-ship-legend.png': { width: 120, height: 120, quality: 85 },
  
  // Düşman Gemileri
  'enemy-basic.png': { width: 64, height: 64, quality: 80 },
  'enemy-shooter.png': { width: 64, height: 64, quality: 80 },
  'enemy-kamikaze.png': { width: 64, height: 64, quality: 80 },
  'enemy-bomber.png': { width: 64, height: 64, quality: 80 },
  'enemy-stealth.png': { width: 64, height: 64, quality: 80 },
  'enemy-assassin.png': { width: 64, height: 64, quality: 80 },
  
  // Boss Gemileri
  'boss-destroyer.png': { width: 120, height: 120, quality: 85 },
  'boss-interceptor.png': { width: 100, height: 100, quality: 85 },
  'boss-cruiser.png': { width: 140, height: 140, quality: 85 },
  'boss-battleship.png': { width: 160, height: 160, quality: 85 },
  'boss-dreadnought.png': { width: 180, height: 180, quality: 85 },
  'boss-carrier.png': { width: 200, height: 200, quality: 85 },
  'boss-titan.png': { width: 220, height: 220, quality: 85 },
  'boss-behemoth.png': { width: 250, height: 250, quality: 85 },
  'boss-leviathan.png': { width: 280, height: 280, quality: 85 },
  'boss-colossus.png': { width: 320, height: 320, quality: 85 },
  
  // Power-up'lar
  'heart.png': { width: 48, height: 48, quality: 80 },
  'double-shot.png': { width: 48, height: 48, quality: 80 },
  'speed-boost.png': { width: 48, height: 48, quality: 80 },
  'shield.png': { width: 48, height: 48, quality: 80 },
  'triple-shot.png': { width: 48, height: 48, quality: 80 },
  'laser-beam.png': { width: 48, height: 48, quality: 80 },
  'invincibility.png': { width: 48, height: 48, quality: 80 },
  'magnet.png': { width: 48, height: 48, quality: 80 },
  'time-slow.png': { width: 48, height: 48, quality: 80 },
  'power-up-glow.png': { width: 80, height: 80, quality: 80 },
  
  // Efektler
  'explosion.png': { width: 64, height: 64, quality: 80 },
  'shield-effect.png': { width: 120, height: 120, quality: 80 },
  'engine-trail.png': { width: 40, height: 80, quality: 80 }
};

// Klasör yolları
const inputDir = './input-images/';
const outputDir = './public/images/';

// Alt klasörler
const subDirs = {
  'ships/player/': ['player-ship-basic.png', 'player-ship-elite.png', 'player-ship-commander.png', 'player-ship-legend.png'],
  'ships/enemy/': ['enemy-basic.png', 'enemy-shooter.png', 'enemy-kamikaze.png', 'enemy-bomber.png', 'enemy-stealth.png', 'enemy-assassin.png'],
  'ships/boss/': ['boss-destroyer.png', 'boss-interceptor.png', 'boss-cruiser.png', 'boss-battleship.png', 'boss-dreadnought.png', 'boss-carrier.png', 'boss-titan.png', 'boss-behemoth.png', 'boss-leviathan.png', 'boss-colossus.png'],
  'power-up/': ['heart.png', 'double-shot.png', 'speed-boost.png', 'shield.png', 'triple-shot.png', 'laser-beam.png', 'invincibility.png', 'magnet.png', 'time-slow.png', 'power-up-glow.png'],
  'effects/': ['explosion.png', 'shield-effect.png', 'engine-trail.png']
};

// Klasörleri oluştur
function createDirectories() {
  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
    console.log(`📁 Created input directory: ${inputDir}`);
  }
  
  // Alt klasörleri oluştur
  Object.keys(subDirs).forEach(subDir => {
    const fullPath = path.join(outputDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${fullPath}`);
    }
  });
}

// Resim optimizasyonu
async function optimizeImage(filename, config, subDir = '') {
  const inputPath = path.join(inputDir, filename);
  const outputPath = path.join(outputDir, subDir, filename);
  
  try {
    // Dosya var mı kontrol et
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Input file not found: ${filename}`);
      return false;
    }
    
    // Orijinal dosya boyutunu al
    const originalStats = fs.statSync(inputPath);
    const originalSizeKB = Math.round(originalStats.size / 1024);
    
    // Resmi optimize et
    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ 
        quality: config.quality,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(outputPath);
    
    // Optimize edilmiş dosya boyutunu al
    const optimizedStats = fs.statSync(outputPath);
    const optimizedSizeKB = Math.round(optimizedStats.size / 1024);
    const reductionPercent = Math.round(((originalSizeKB - optimizedSizeKB) / originalSizeKB) * 100);
    
    console.log(`✅ ${filename}: ${config.width}x${config.height}px | ${originalSizeKB}KB → ${optimizedSizeKB}KB (${reductionPercent}% reduction)`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error optimizing ${filename}:`, error.message);
    return false;
  }
}

// Ana optimizasyon fonksiyonu
async function optimizeAllImages() {
  console.log('🚀 Starting image optimization...\n');
  
  // Klasörleri oluştur
  createDirectories();
  
  let successCount = 0;
  let totalCount = 0;
  
  // Her alt klasör için resimleri optimize et
  for (const [subDir, filenames] of Object.entries(subDirs)) {
    console.log(`\n📂 Processing ${subDir}:`);
    
    for (const filename of filenames) {
      if (imageConfigs[filename]) {
        totalCount++;
        const success = await optimizeImage(filename, imageConfigs[filename], subDir);
        if (success) successCount++;
      }
    }
  }
  
  console.log(`\n🎉 Optimization complete!`);
  console.log(`📊 Successfully optimized: ${successCount}/${totalCount} images`);
  
  if (successCount < totalCount) {
    console.log(`\n⚠️  Missing files in ${inputDir}:`);
    for (const [subDir, filenames] of Object.entries(subDirs)) {
      for (const filename of filenames) {
        if (imageConfigs[filename]) {
          const inputPath = path.join(inputDir, filename);
          if (!fs.existsSync(inputPath)) {
            console.log(`   - ${filename} (${imageConfigs[filename].width}x${imageConfigs[filename].height}px)`);
          }
        }
      }
    }
  }
  
  console.log(`\n📁 Optimized images saved to: ${outputDir}`);
  console.log(`\n🎮 Ready to play! All images are optimized and ready.`);
}

// Script'i çalıştır
if (require.main === module) {
  optimizeAllImages().catch(console.error);
}

module.exports = { optimizeAllImages, imageConfigs };

