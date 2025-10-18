# Space Impact - Farcaster Game

A retro space shooter game built for Farcaster Mini Apps on the Base network. Defend Earth from alien invasion and compete on the blockchain leaderboard!

## Features

- 🚀 **Classic Space Shooter Gameplay**: Move, shoot, and avoid enemies
- 🎮 **Mobile-Optimized Controls**: Touch controls for mobile devices
- 🔗 **Farcaster Integration**: Native Mini App with cast composition
- ⛓️ **Base Network**: On-chain score submission and leaderboard
- 💰 **Wallet Integration**: Connect wallet to save scores permanently
- 🏆 **Global Leaderboard**: Compete with other players
- ⚡ **Power-ups**: Collect hearts, double shot, and speed boosts

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Wagmi, Viem, Base network
- **Farcaster**: Mini App SDK, Wagmi connector
- **Game Engine**: HTML5 Canvas with React integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Farcaster account for testing
- MetaMask or compatible wallet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd farcaster-space-game
```

2. Install dependencies:
```bash
npm install
```

3. Copy game assets from the old HTML game:
```bash
# Windows
copy-assets.bat

# Or manually copy from old-html-game/assets/ to public/
```

4. Create environment file:
```bash
cp .env.local.example .env.local
```

5. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CONTRACT_ADDRESS=your-deployed-contract-address
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Smart Contract Deployment

The game requires a smart contract deployed on Base network:

1. Deploy the `SpaceImpact.sol` contract to Base
2. Update the contract address in your environment variables
3. Configure the contract with proper signer for score verification

## Farcaster Integration

### Testing in Farcaster

1. Use the [Farcaster Mini App Debug Tool](https://warpcast.com/~/developers/mini-apps)
2. Enter your app URL (e.g., `http://localhost:3000`)
3. Test the Mini App functionality

### Publishing

1. Deploy your app to a public domain
2. Update the manifest file at `/.well-known/farcaster.json`
3. Submit for review through Farcaster's developer portal

## Game Controls

### Desktop
- **A/D or Arrow Keys**: Move left/right
- **Spacebar**: Fire bullets
- **P or Escape**: Pause/Resume

### Mobile
- **Touch Controls**: Use on-screen buttons
- **Tap**: Fire bullets
- **Drag**: Move ship (if implemented)

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/
│   └── Game/              # Game components
│       ├── GameCanvas.tsx # Canvas rendering
│       ├── GameControls.tsx # Input handling
│       ├── GameUI.tsx     # UI overlays
│       └── SpaceImpactGame.tsx # Main game
├── hooks/                 # Custom React hooks
│   ├── useBlockchain.ts   # Blockchain integration
│   ├── useFarcaster.ts    # Farcaster SDK
│   ├── useGameState.ts    # Game state management
│   └── useWallet.ts       # Wallet connection
├── providers/             # React providers
│   └── Web3Provider.tsx   # Web3 context
└── types/                 # TypeScript definitions
    └── game.ts            # Game type definitions
```

## Development

### Adding New Features

1. **New Enemy Types**: Update `GAME_CONFIG.ENEMY_TYPES` in `types/game.ts`
2. **Power-ups**: Add new types to `PowerUp` interface and update spawn logic
3. **Game Mechanics**: Modify `useGameState.ts` hook
4. **UI Changes**: Update components in `components/Game/`

### Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Follow us on Farcaster

## 🎮 GAME SYSTEM DOCUMENTATION

### 🚀 PLAYER SHIP SYSTEM

#### **Ship Progression (Level-based)**
- **Level 1-10**: Basic Ship (80x80px) - Dark blue hull, golden details
- **Level 11-25**: Elite Ship (90x90px) - Green engines, larger wings
- **Level 26-40**: Commander Ship (100x100px) - Purple engines, massive wings
- **Level 41-50**: Legend Ship (120x120px) - Rainbow engines, ultimate design

#### **Ship Upgrades**
- **Fire Power**: Increases with level
  - Level 1-10: Single shot
  - Level 11-25: Enhanced single shot (faster)
  - Level 26-40: Double shot capability
  - Level 41-50: Triple shot capability
- **Speed**: Base speed 25, can be boosted with power-ups
- **Health**: 3 lives (can be increased with heart power-ups)

### 🎯 ENEMY SYSTEM

#### **Enemy Types & Spawn Levels (Detailed)**

##### **Early Game Enemies (Level 1-5)**
- **Basic** (Level 1+): Red, 1 HP, 6.0 speed, 40% spawn chance
- **Shooter** (Level 1+): Orange, 2 HP, 5.0 speed, 30% spawn chance
- **Kamikaze** (Level 1+): Bright red, 1 HP, 7.0 speed, 30% spawn chance

##### **Mid Game Enemies (Level 6-15)**
- **Basic** (Level 1+): Red, 1 HP, 6.0 speed, 25% spawn chance
- **Shooter** (Level 1+): Orange, 2 HP, 5.0 speed, 20% spawn chance
- **Kamikaze** (Level 1+): Bright red, 1 HP, 7.0 speed, 20% spawn chance
- **Bomber** (Level 10+): Brown, 3 HP, 4.0 speed, 20% spawn chance
- **Stealth** (Level 10+): Dark gray, 1 HP, 8.0 speed, 15% spawn chance

##### **Advanced Game Enemies (Level 16-25)**
- **Basic** (Level 1+): Red, 1 HP, 6.0 speed, 20% spawn chance
- **Shooter** (Level 1+): Orange, 2 HP, 5.0 speed, 15% spawn chance
- **Kamikaze** (Level 1+): Bright red, 1 HP, 7.0 speed, 15% spawn chance
- **Bomber** (Level 10+): Brown, 3 HP, 4.0 speed, 20% spawn chance
- **Stealth** (Level 10+): Dark gray, 1 HP, 8.0 speed, 15% spawn chance
- **Assassin** (Level 20+): Purple, 2 HP, 6.5 speed, 15% spawn chance

##### **Expert Game Enemies (Level 26-35)**
- **Basic** (Level 1+): Red, 1 HP, 6.0 speed, 15% spawn chance
- **Shooter** (Level 1+): Orange, 2 HP, 5.0 speed, 15% spawn chance
- **Kamikaze** (Level 1+): Bright red, 1 HP, 7.0 speed, 15% spawn chance
- **Bomber** (Level 10+): Brown, 3 HP, 4.0 speed, 20% spawn chance
- **Stealth** (Level 10+): Dark gray, 1 HP, 8.0 speed, 15% spawn chance
- **Assassin** (Level 20+): Purple, 2 HP, 6.5 speed, 20% spawn chance

##### **Master Game Enemies (Level 36-50)**
- **Basic** (Level 1+): Red, 1 HP, 6.0 speed, 10% spawn chance
- **Shooter** (Level 1+): Orange, 2 HP, 5.0 speed, 15% spawn chance
- **Kamikaze** (Level 1+): Bright red, 1 HP, 7.0 speed, 15% spawn chance
- **Bomber** (Level 10+): Brown, 3 HP, 4.0 speed, 20% spawn chance
- **Stealth** (Level 10+): Dark gray, 1 HP, 8.0 speed, 20% spawn chance
- **Assassin** (Level 20+): Purple, 2 HP, 6.5 speed, 20% spawn chance

#### **Enemy Scaling by Level Ranges**

##### **Level 1-5 (Learning Phase)**
- **Speed Multiplier**: 1.0x (base speed)
- **Fire Rate**: 0.003 (very slow)
- **Spawn Interval**: 6000ms (6 seconds)
- **Enemy Limit**: 8 on screen

##### **Level 6-15 (Intermediate Phase)**
- **Speed Multiplier**: 1.0x - 1.5x (gradual increase)
- **Fire Rate**: 0.003 - 0.008 (increasing)
- **Spawn Interval**: 6000ms - 4500ms (faster spawning)
- **Enemy Limit**: 10 on screen

##### **Level 16-25 (Advanced Phase)**
- **Speed Multiplier**: 1.5x - 2.0x (faster enemies)
- **Fire Rate**: 0.008 - 0.015 (more aggressive)
- **Spawn Interval**: 4500ms - 3500ms (rapid spawning)
- **Enemy Limit**: 12 on screen

##### **Level 26-35 (Expert Phase)**
- **Speed Multiplier**: 2.0x - 2.5x (very fast)
- **Fire Rate**: 0.015 - 0.025 (aggressive)
- **Spawn Interval**: 3500ms - 3000ms (constant pressure)
- **Enemy Limit**: 12 on screen

##### **Level 36-50 (Master Phase)**
- **Speed Multiplier**: 2.5x - 3.0x (maximum speed)
- **Fire Rate**: 0.025 - 0.035 (overwhelming)
- **Spawn Interval**: 3000ms (constant barrage)
- **Enemy Limit**: 15 on screen

#### **Special Enemy Behaviors**

##### **Bomber (Level 10+)**
- **Bomb Drop Rate**: Every 3-5 seconds
- **Bomb Size**: 8x20px (larger than bullets)
- **Bomb Speed**: 70% of normal bullet speed
- **Bomb Damage**: 1 hit (same as bullet)

##### **Stealth (Level 10+)**
- **Transparency**: 60% opacity
- **Detection Range**: Reduced collision detection
- **Speed Boost**: +20% faster than normal
- **Special Effect**: Cyan glow when moving

##### **Assassin (Level 20+)**
- **Rapid Fire**: 1.5x normal fire rate
- **Bullet Size**: 4x12px (smaller, faster)
- **Bullet Speed**: 120% of normal bullet speed
- **Special Effect**: Purple glow aura

#### **Enemy Spawn Patterns**

##### **Wave System**
- **Small Wave** (Level 1-15): 2-3 enemies
- **Medium Wave** (Level 16-30): 3-4 enemies
- **Large Wave** (Level 31-45): 4-5 enemies
- **Massive Wave** (Level 46-50): 5-6 enemies

##### **Spawn Timing**
- **Regular Spawn**: Every 3-6 seconds (based on level)
- **Wave Spawn**: Every 10-18 seconds (based on level)
- **Boss Levels**: No regular enemies during boss fight
- **Post-Boss**: Increased spawn rate for 30 seconds

### 👑 BOSS SYSTEM

#### **Boss Progression (Every 5 Levels)**
- **Level 5**: Destroyer (50 HP, 2-shot, 120x120px)
- **Level 10**: Interceptor (40 HP, 1-shot, 100x100px)
- **Level 15**: Cruiser (100 HP, 3-shot, 140x140px)
- **Level 20**: Battleship (200 HP, 4-shot, 160x160px)
- **Level 25**: Dreadnought (300 HP, 5-shot, 180x180px)
- **Level 30**: Carrier (400 HP, 6-shot, 200x200px)
- **Level 35**: Titan (500 HP, 7-shot, 220x220px)
- **Level 40**: Behemoth (750 HP, 8-shot, 250x250px)
- **Level 45**: Leviathan (1000 HP, 10-shot, 280x280px)
- **Level 50**: Colossus (1500 HP, 12-shot, 320x320px)

#### **Boss Mechanics**
- **Health Bar**: Displayed at top of screen
- **Special Attacks**: Spread shot every few seconds
- **Movement**: Side-to-side oscillation
- **Reward**: 5x normal enemy points

### 💎 POWER-UP SYSTEM

#### **Power-up Types & Effects**
- **Heart**: +1 life, 10 second duration
- **Double Shot**: 2 bullets, 10 second duration
- **Speed Boost**: 2x movement speed, 10 second duration
- **Shield**: 3-hit protection, 15 second duration
- **Triple Shot**: 3 bullets, 12 second duration
- **Laser Beam**: Continuous beam, 8 second duration
- **Invincibility**: No damage, 5 second duration
- **Magnet**: Attracts power-ups, 10 second duration
- **Time Slow**: Slows enemies, 6 second duration

#### **Power-up Spawning**
- **Frequency**: Every 8 seconds
- **Spawn Level**: All power-ups available from Level 1
- **Visual Effects**: Glowing aura around ship when active

### 🎮 GAME MECHANICS

#### **Level System**
- **Max Level**: 50
- **Level Up**: Every 100 points
- **Enemy Scaling**: Speed +15% per level
- **Boss Frequency**: Every 5 levels

#### **Scoring System**
- **Basic Enemy**: 10 points
- **Shooter Enemy**: 10 points
- **Kamikaze Enemy**: 10 points
- **Bomber Enemy**: 10 points
- **Stealth Enemy**: 10 points
- **Assassin Enemy**: 10 points
- **Boss Hit**: 50 points (5x multiplier)

#### **Difficulty Scaling**
- **Level 1-10**: Learning phase (3 enemy types)
- **Level 10-20**: Intermediate (6 enemy types)
- **Level 20-30**: Advanced (faster enemies)
- **Level 30-40**: Expert (high spawn rates)
- **Level 40-50**: Master (maximum difficulty)

### 🎨 VISUAL EFFECTS

#### **Ship Effects**
- **Engine Trail**: Blue glow behind ship
- **Wing Animation**: Subtle wing movement
- **Power-up Glow**: Colored aura when power-up active
- **Damage Effect**: Red flash when hit

#### **Enemy Effects**
- **Bomber**: Red bomb icon above ship
- **Stealth**: 60% transparency + cyan glow
- **Assassin**: Purple glow effect
- **Explosion**: Orange/yellow particle effect

#### **Boss Effects**
- **Health Bar**: Color changes (green→yellow→red)
- **Glow**: Red energy aura
- **Special Attack**: Spread shot pattern

### 🎵 AUDIO SYSTEM

#### **Sound Effects**
- **Ship Engine**: Continuous hum
- **Bullet Fire**: Pew pew sounds
- **Enemy Explosion**: Boom sound
- **Power-up Collection**: Chime sound
- **Boss Spawn**: Dramatic music
- **Boss Defeat**: Victory fanfare

#### **Background Music**
- **Menu**: Ambient space music
- **Gameplay**: Upbeat electronic music
- **Boss Fight**: Intense battle music
- **Game Over**: Somber music

### 📊 BALANCE SYSTEM

#### **Enemy Spawn Rates**
- **Level 1-9**: 3 enemy types, slower spawn
- **Level 10+**: 6 enemy types, faster spawn
- **Boss Levels**: No regular enemies during boss fight

#### **Power-up Balance**
- **Rare Power-ups**: Invincibility (5s), Time Slow (6s)
- **Common Power-ups**: Heart, Double Shot, Speed Boost
- **Duration**: 5-15 seconds based on power level

#### **Difficulty Curve**
- **Early Game**: Easy learning curve
- **Mid Game**: Steady difficulty increase
- **Late Game**: Challenging but fair
- **Boss Fights**: Peak difficulty moments

### 🔧 TECHNICAL SPECIFICATIONS

#### **Performance**
- **Target FPS**: 30 FPS
- **Canvas Size**: 1200x2000px
- **Enemy Limit**: 12 on screen
- **Bullet Limit**: 20 player, 10 enemy
- **Memory Usage**: Optimized for mobile

#### **Mobile Optimization**
- **Touch Controls**: Responsive touch input
- **Screen Scaling**: Adaptive to different screen sizes
- **Battery Usage**: Optimized rendering
- **Network**: Minimal data usage

## Roadmap

- [ ] NFT rewards for high scores
- [ ] Multiplayer battles
- [ ] Tournament system
- [ ] Custom ship skins
- [ ] Achievement system
- [ ] Mobile app version
- [ ] Additional power-up types
- [ ] More enemy varieties
- [ ] Boss attack patterns
- [ ] Sound effects system
- [ ] Particle effects
- [ ] Daily challenges
- [ ] Leaderboard rewards