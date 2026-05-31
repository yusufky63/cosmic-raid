# Cosmic Raid

Cosmic Raid is a Farcaster-oriented arcade game experiment built with Next.js, TypeScript, wallet libraries, and mobile-first game UI components.

The project combines an arcade shooter-style product surface with Farcaster initialization, wallet connection, and leaderboard-ready screens.

## Features

- Arcade game shell with cosmic/shooter-style UI direction.
- Farcaster Mini App SDK and Quick Auth integration.
- Wallet connection with Wagmi, Viem, and Ethers.
- Mobile-first layout for Farcaster clients.
- Leaderboard-oriented product structure.
- Image optimization script for asset preparation.

| Layer | Tools |
| --- | --- |
| App | Next.js, React, TypeScript, Tailwind CSS |
| Farcaster | Mini App SDK, Mini App Wagmi Connector, Quick Auth |
| Web3 | Wagmi, Viem, Ethers |
| Data/Utilities | React Query, Axios, Joi, optimize-images script |

## Project Structure

- `src/` - game UI, routes, state, Farcaster setup, and wallet logic.
- `public/` - game assets and metadata.
- `optimize-images.js` - asset optimization helper.
- `tailwind.config.js` - styling configuration.

## Development

```bash
npm install
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Build for production. |
| `npm start` | Run the production server. |
| `npm run lint` | Run lint checks. |
| `npm run optimize-images` | Optimize image assets before deployment when needed. |

## Status

- Repository: https://github.com/yusufky63/cosmic-raid
- Live app: https://cosmic-raid.vercel.app
