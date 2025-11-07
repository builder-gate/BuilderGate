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
- `NEXT_PUBLIC_SELF_SCOPE` - Self Protocol scope identifier (default: "buildergate")
- `NEXT_PUBLIC_SELF_APP_NAME` - Self Protocol app name (default: "BuilderGate")
- `NEXT_PUBLIC_SELF_USE_MOCK` - Use mock passport for testing (default: false)

## Architecture & Key Patterns

### Provider Hierarchy

The app uses a specific provider nesting order that **must be maintained**:

```tsx
<WagmiConfig>              // Wagmi v2 configuration
  <FarcasterProvider>      // Farcaster authentication
    <SelfProvider>         // Self Protocol verification
      <ThemeProvider>      // next-themes
        {children}
      </ThemeProvider>
    </SelfProvider>
  </FarcasterProvider>
</WagmiConfig>
```

**Critical**:
- `WagmiProvider` must wrap `QueryClientProvider` (see `providers/wagmi-provider.tsx`). This is the official Farcaster Mini App pattern.
- `SelfProvider` must be inside `WagmiConfig` to access wallet connection state via `useAccount()`

### Multi-Connector Wallet Strategy

Three wallet connectors in priority order:
1. **Farcaster Mini App Connector** - Auto-activates in Farcaster environment
2. **Injected Connector** - Browser extension wallets (MetaMask, Coinbase Wallet)
3. **WalletConnect v2** - QR code and mobile wallet connections

Configuration in `lib/wagmi.ts` uses environment-based chain selection.

### Context Patterns

**Farcaster Context** (`contexts/FarcasterContext.tsx`):
- Detects Farcaster environment via SDK
- Extracts user data from Farcaster context
- Provides `useFarcaster()` hook throughout app
- Falls back gracefully when not in Farcaster

**Self Protocol Context** (`contexts/SelfContext.tsx`):
- Initializes Self Protocol SDK with wallet address
- Manages verification state and polling
- Provides QR code generation via `SelfQRcodeWrapper`
- Auto-checks verification status on mount
- Polling mechanism: 5-second intervals, max 5 minutes (60 attempts)

### API Routes for Verification

**Self Protocol Backend Verification** (`app/api/verify-self/`):
- `route.ts` - POST endpoint receives zkProof from Self Protocol mobile app
  - Verifies attestation using `SelfBackendVerifier`
  - Extracts wallet address from `userContextData` hex
  - Converts date of birth from YYMMDD to YYYY-MM-DD format
  - Stores result in global verification cache (1-hour TTL)
  - GET endpoint provides health check

- `check/route.ts` - POST endpoint for polling verification status
  - Accepts `userId` (wallet address) in request body
  - Returns cached verification data if available
  - Auto-expires entries older than 1 hour

**Other Verification Endpoints** (`app/api/verify/`):
- `github/route.ts` - GitHub contribution verification (currently mock)
- `talent-protocol/route.ts` - Talent Protocol reputation (mock)

**Important**: Self Protocol uses backend verification mode (not contract mode). The backend receives the zkProof callback from Self's mobile app after user scans QR or opens deeplink.

### UI Component System

Built on **shadcn/ui** with Radix UI primitives:
- All UI components in `components/ui/`
- Custom components in `components/` root
- Uses Tailwind CSS v4 with `@tailwindcss/postcss`
- Path alias `@/*` maps to project root

Key custom components:
- `ConnectButton.tsx` - Wallet connection with multi-connector support
- `verification-modal.tsx` - Generic identity verification flow
- `self-verification-modal.tsx` - Self Protocol verification with QR code and deeplink
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

### Working with Self Protocol

```typescript
import { useSelf } from '@/contexts/SelfContext'

const {
  isVerified,
  verificationData,
  isVerifying,
  error,
  selfApp,
  universalLink,
  initiateSelfVerification,
  checkVerificationStatus,
  clearVerification
} = useSelf()

// Trigger verification (opens Self app or shows QR)
await initiateSelfVerification()

// Check if user is verified
if (isVerified && verificationData) {
  console.log('DOB:', verificationData.date_of_birth)
  console.log('Name:', verificationData.name)
  console.log('Nationality:', verificationData.nationality)
}
```

**Self Protocol Verification Flow**:
1. User clicks "Verify with Self" button
2. `SelfVerificationModal` opens with options:
   - **"Open Self App"** - Deeplink to Self Protocol mobile app
   - **"Show QR"** - Display QR code for scanning
   - **"Copy Link"** - Copy universal link for sharing
3. User completes verification in Self mobile app
4. Self app sends zkProof to backend (`/api/verify-self`)
5. Backend verifies proof and stores result in cache
6. Frontend polls `/api/verify-self/check` every 5 seconds
7. When verified, modal shows success and updates UI state

**Important**: Self Protocol requires users to have the Self mobile app installed to complete verification. The verification proves age (18+) without revealing exact date of birth to the app.

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
- ✅ Self Protocol zkProof verification (backend mode)
- ✅ QR code and deeplink support for Self Protocol

**In Progress**:
- 🚧 GitHub OAuth integration (mock API exists)
- 🚧 zkProof generation for GitHub contributions
- 🚧 Smart contract deployment (Base Sepolia)
- 🚧 Talent Protocol integration

**Planned**:
- ⏳ Uniswap v4 hook deployment
- ⏳ Reputation token launch
- ⏳ Yield claiming interface
- ⏳ DAO governance
