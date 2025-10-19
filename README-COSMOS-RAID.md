# 🚀 COSMOS RAID - Blockchain Space Shooter

**Defend the galaxy from cosmic invasion!** 🌌

## 🎮 Game Features

- **FREE TO PLAY** on Base Network! 🎉
- Progressive ship upgrades (5 ship classes)
- 50 challenging levels with epic boss fights every 5 levels
- 10+ power-ups with strategic gameplay
- Real-time leaderboard on blockchain
- Anti-cheat validation system
- Mobile-optimized controls

## 🏆 Leaderboard & Scoring

- Save your best scores to Base blockchain (only gas fee required)
- Compete with other pilots in the galaxy
- Persistent global leaderboard
- Track enemies killed, bosses defeated, and playtime

## 🛸 Ship Classes

1. **BASIC** (Lv 1-9): 1 shot, 3 power-up slots
2. **ELITE** (Lv 10-19): 2 shots, 5 power-up slots
3. **COMMANDER** (Lv 20-29): 3 shots, 7 power-up slots
4. **LEGEND** (Lv 30-39): 4 shots, 9 power-up slots
5. **SUPREME** (Lv 40-50): 5 shots, 10 power-up slots

## 👾 Boss Fights

Epic boss encounters every 5 levels:
- **Level 5**: Destroyer (100 HP)
- **Level 10**: Interceptor (200 HP)
- **Level 15**: Cruiser (300 HP)
- **Level 20**: Battleship (450 HP)
- **Level 25**: Dreadnought (650 HP)
- **Level 30**: Carrier (850 HP)
- **Level 35**: Titan (1,200 HP)
- **Level 40**: Behemoth (1,600 HP)
- **Level 45**: Leviathan (2,200 HP)
- **Level 50**: Colossus (3,000 HP) - Final Boss!

## ⚡ Power-ups

- **Heart**: Extra life
- **Double Shot**: 2x firing rate (15s)
- **Triple Shot**: 3x firing rate (15s)
- **Laser Beam**: Penetrating beam weapon (8s)
- **Speed Boost**: Faster movement (15s)
- **Shield**: Damage protection (15s)
- **Invincibility**: Complete protection (15s)
- **Magnet**: Auto-collect power-ups (15s)
- **Time Slow**: Slow enemy movement (15s)

## 🔗 Blockchain Integration

### Smart Contract: `CosmosRaid.sol`
- Deployed on Base Network
- EIP-712 signature verification
- Anti-cheat game validation
- Gas-only transactions (no additional fees!)

### API Routes
- `/api/game/get-signature` - Backend score validation & signing
- `/api/game/leaderboard` - Global leaderboard data
- `/api/game/fee` - Network fee information

### Wallet Requirements
- Connect any Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- Switch to Base network automatically
- Only gas fees required for score submission

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Solidity, wagmi, viem
- **Backend**: Next.js API Routes
- **Validation**: Joi schema validation
- **Network**: Base (Ethereum L2)

## 🎯 Anti-Cheat System

- Server-side game logic validation
- Score vs level/time/enemies correlation checks
- EIP-712 cryptographic signatures
- Nonce-based replay protection
- Reasonable gameplay time validation

## 🚀 Farcaster Integration

- Built as a Farcaster Miniapp
- Share high scores with the community
- Social leaderboard features
- Frame-compatible design

## 🎮 How to Play

1. **Connect Wallet**: Connect your Web3 wallet to Base network
2. **Start Game**: Touch/click to move ship, auto-fire enabled
3. **Collect Power-ups**: Strategically manage your power-up inventory
4. **Survive Waves**: Each level increases difficulty and enemy variety
5. **Defeat Bosses**: Epic battles every 5 levels with unique attack patterns
6. **Save Score**: Submit your best runs to the blockchain leaderboard!

## 💡 Pro Tips

- **Priority**: Heart → Invincibility → Triple Shot → Time Slow → Magnet
- **Combo System**: Hit enemies consecutively for 3x score multiplier
- **Capacity Management**: Higher ship classes hold more power-ups
- **Boss Strategy**: Use time slow and invincibility for tough fights

## 🌟 Community

- Share scores on Farcaster
- Compete in global leaderboard
- Join the cosmic pilot community
- Follow development updates

---

**Ready to defend the galaxy? Connect your wallet and start your cosmic raid!** 🚀✨
