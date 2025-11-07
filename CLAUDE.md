# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BuilderGate is a **Reputation-Gated Builder Vault (RGBV)** implemented as a Farcaster Mini App that combines DeFi yield generation with developer reputation systems. The system uses Uniswap v4 hooks for fee collection, ERC-4626 vaults for yield generation, zkProofs for GitHub verification, and on-chain attestations for reputation validation.

## Development Commands

### Essential Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Environment Setup

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect v2 project ID (required)
- `NEXT_PUBLIC_CHAIN_ID` - Target chain (8453 for Base, 84532 for Base Sepolia)
- `NEXT_PUBLIC_SITE_NAME` - Application name
- `NEXT_PUBLIC_SITE_URL` - Deployment URL

## Architecture & Key Patterns

### Provider Hierarchy

The app uses a specific provider nesting order that **must be maintained**:

```tsx
<WagmiConfig>              // Wagmi v2 configuration
  <FarcasterProvider>      // Farcaster authentication
    <ThemeProvider>        // next-themes
      {children}
    </ThemeProvider>
  </FarcasterProvider>
</WagmiConfig>
```

**Critical**: `WagmiProvider` must wrap `QueryClientProvider` (see `providers/wagmi-provider.tsx`). This is the official Farcaster Mini App pattern.

### Multi-Connector Wallet Strategy

Three wallet connectors in priority order:
1. **Farcaster Mini App Connector** - Auto-activates in Farcaster environment
2. **Injected Connector** - Browser extension wallets (MetaMask, Coinbase Wallet)
3. **WalletConnect v2** - QR code and mobile wallet connections

Configuration in `lib/wagmi.ts` uses environment-based chain selection.

### Farcaster Context Pattern

`contexts/FarcasterContext.tsx` implements auto-authentication on mount:
- Detects Farcaster environment via SDK
- Extracts user data from Farcaster context
- Provides `useFarcaster()` hook throughout app
- Falls back gracefully when not in Farcaster

### API Routes for Verification

Three verification endpoints in `app/api/verify/`:
- `github/route.ts` - GitHub contribution verification (currently mock)
- `self-protocol/route.ts` - Self Protocol attestations
- `talent-protocol/route.ts` - Talent Protocol reputation

All use POST method with 2-second simulation delay.

### UI Component System

Built on **shadcn/ui** with Radix UI primitives:
- All UI components in `components/ui/`
- Custom components in `components/` root
- Uses Tailwind CSS v4 with `@tailwindcss/postcss`
- Path alias `@/*` maps to project root

Key custom components:
- `ConnectButton.tsx` - Wallet connection with multi-connector support
- `verification-modal.tsx` - Identity verification flow
- `vault-modal.tsx` - Vault interaction interface
- `builder-score-card.tsx` - Reputation display

### Type Safety

- **Strict TypeScript** enabled in `tsconfig.json`
- Target: ES6
- All imports use `@/*` path alias
- Wagmi v2 and Viem provide full type safety for blockchain interactions

## Smart Contract Integration (Future)

The app is designed to integrate with:

1. **BuilderVault** (ERC-4626) - Yield distribution vault
2. **BuilderVaultHook** (Uniswap v4) - Fee collection hook
3. **ReputationToken** (ERC-20) - Tokenized reputation
4. **ZkVerifier** - zkProof validation

Contract addresses will be stored in `lib/wagmi.ts` and environment variables.

## Common Development Patterns

### Adding New Verification Method

1. Create route in `app/api/verify/{method}/route.ts`
2. Implement POST handler with verification logic
3. Add verification button/modal in main UI
4. Update verification state management

### Adding New Wallet Connector

Modify `lib/wagmi.ts`:
```typescript
import { newConnector } from 'wagmi/connectors'

const connectors = [
  farcasterMiniApp(),
  injected(),
  walletConnect({ projectId, ... }),
  newConnector({ /* config */ }), // Add here
]
```

### Working with Farcaster SDK

```typescript
import { useFarcaster } from '@/contexts/FarcasterContext'

const { user, isAuthenticated, isFarcasterEnvironment } = useFarcaster()

if (isFarcasterEnvironment && user) {
  // Farcaster-specific logic
  console.log(`FID: ${user.fid}, Username: ${user.username}`)
}
```

### Using Wagmi Hooks

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi'

const { address, isConnected } = useAccount()
const { connect, connectors } = useConnect()
const { disconnect } = useDisconnect()
```

## Technical Constraints

### WalletConnect Errors

The app suppresses WalletConnect subscription errors on reload (see `providers/wagmi-provider.tsx`). This is intentional - WalletConnect v2 throws benign errors when subscriptions are interrupted during development hot reloads.

### Next.js 15 App Router

- All pages use Next.js App Router (not Pages Router)
- Client components marked with `"use client"`
- Server components are default
- API routes in `app/api/` directory

### Farcaster Mini App Constraints

When deployed as Farcaster Mini App:
- Must handle both Farcaster and non-Farcaster environments
- SDK context may be null outside Farcaster
- Auto-authentication on load is expected behavior
- Use `isFarcasterEnvironment` check before Farcaster-specific features

## Roadmap & Status

**Completed**:
- ✅ Next.js 15 + TypeScript setup
- ✅ Farcaster Mini App SDK integration
- ✅ Multi-wallet support (Farcaster, Injected, WalletConnect)
- ✅ shadcn/ui component library
- ✅ Theme system with dark mode

**In Progress**:
- 🚧 GitHub OAuth integration (mock API exists)
- 🚧 zkProof generation for GitHub contributions
- 🚧 Smart contract deployment (Base Sepolia)
- 🚧 EAS attestation integration

**Planned**:
- ⏳ Uniswap v4 hook deployment
- ⏳ Reputation token launch
- ⏳ Yield claiming interface
- ⏳ DAO governance
