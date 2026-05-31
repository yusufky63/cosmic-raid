# Cosmic Raid

Cosmic Raid is a Farcaster arcade game experiment with wallet integration, mobile layout, game assets, and leaderboard-oriented UI.

## Snapshot

- **Category:** Farcaster arcade game
- **Status:** Public repository
- **Live:** https://cosmic-raid.vercel.app
- **Repository:** https://github.com/yusufky63/cosmic-raid
- **Portfolio:** https://codexsha.dev

## Product Scope

Cosmic Raid is documented here as a product repository, not just a code dump. The goal of this README is to make the product purpose, runtime surface, and development path clear for future review and maintenance.

## Core Capabilities

- Arcade shooter-style interface
- Wallet connect/disconnect flow
- Mobile Farcaster layout
- Leaderboard-oriented product surface
- Ships, power-ups, effects, and optimized image assets

## Existing README Coverage Preserved

This refresh keeps the important project-specific areas from the previous documentation:

- README was missing before this documentation refresh

## Tech Stack

- Next.js
- TypeScript
- Farcaster SDK
- Wagmi
- Viem
- Ethers
- React Query
- Axios

## Repository Map

| Path | Purpose |
| --- | --- |
| src/app/ | App routes and shell |
| src/components/ | Game-facing UI and wallet components |
| public/images/ | Ships, effects, and power-up assets |
| optimize-images.js | Image optimization utility |

## Local Development

| Command | Purpose |
| --- | --- |
| npm run dev | Run development server |
| npm run build | Build production app |
| npm run start | Start production server |
| npm run lint | Run lint checks |
| npm run optimize-images | Run image optimization pipeline |

## Environment Notes

Use local environment files for secrets and deployment-specific values. Do not commit real keys.

- Farcaster mini app metadata
- Wallet connector configuration
- Optional leaderboard/API settings

## Operational Notes

- Keep this README aligned with the live product and portfolio copy.
- Prefer small, documented changes over large undocumented rewrites.
- The README now documents the game asset pipeline instead of only describing the web app shell.

## Maintainer

Built by Yusuf / Codexsha.

- GitHub: https://github.com/yusufky63
- X: https://x.com/codexsha
- Telegram: https://t.me/codexsha
