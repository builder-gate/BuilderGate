# Wallet Detection Setup

This project includes wallet detection functionality that works seamlessly in both browser and Farcaster environments.

## Features

- **Platform Detection**: Automatically detects if the app is running in:
  - Regular browser
  - Farcaster browser
  - Farcaster mobile app

- **Multi-Wallet Support**:
  - Farcaster Mini App connector (auto-activated in Farcaster)
  - Injected wallets (MetaMask, etc.)
  - WalletConnect (mobile wallets)

- **Wagmi & Viem**: Built on the latest Wagmi v2 and Viem for Ethereum interactions

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Then fill in the required values:

```env
# Get your WalletConnect project ID from: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Chain ID (8453 for Base Mainnet, 84532 for Base Sepolia)
NEXT_PUBLIC_CHAIN_ID=8453

# Your site information
NEXT_PUBLIC_SITE_NAME=AppMokup
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Dependencies

All required dependencies have been installed:

```json
{
  "@farcaster/miniapp-sdk": "^0.2.1",
  "@farcaster/miniapp-wagmi-connector": "^1.1.0",
  "@tanstack/react-query": "^5.90.7",
  "viem": "^2.38.6",
  "wagmi": "^2.19.2"
}
```

### 3. Project Structure

```
AppMokup/
├── components/
│   └── ConnectButton.tsx           # Main wallet connection button
├── contexts/
│   └── FarcasterContext.tsx        # Farcaster authentication context
├── hooks/
│   └── usePlatformDetection.ts     # Platform detection hook
├── lib/
│   ├── utils.ts                    # Utilities (includes truncateEthAddress)
│   └── wagmi.ts                    # Wagmi configuration
└── providers/
    └── wagmi-provider.tsx          # Wagmi provider wrapper
```

## Usage

### Basic Usage

Import and use the ConnectButton component:

```tsx
import { ConnectButton } from '@/components/ConnectButton'

export default function Page() {
  return (
    <div>
      <ConnectButton />
    </div>
  )
}
```

### Using Platform Detection

```tsx
import { usePlatformDetection } from '@/hooks/usePlatformDetection'

export function MyComponent() {
  const { platform, isFarcaster, isFarcasterMobile } = usePlatformDetection()

  return (
    <div>
      <p>Platform: {platform}</p>
      {isFarcaster && <p>Running in Farcaster!</p>}
    </div>
  )
}
```

### Using Farcaster Context

```tsx
import { useFarcaster } from '@/contexts/FarcasterContext'

export function UserProfile() {
  const { user, isAuthenticated } = useFarcaster()

  if (!isAuthenticated) return <p>Not authenticated</p>

  return (
    <div>
      <p>Username: @{user.username}</p>
      <p>FID: {user.fid}</p>
    </div>
  )
}
```

### Using Wagmi Hooks

```tsx
import { useAccount, useBalance } from 'wagmi'

export function WalletInfo() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  if (!isConnected) return <p>Connect wallet</p>

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.formatted} {balance?.symbol}</p>
    </div>
  )
}
```

## How It Works

### 1. Platform Detection

The `usePlatformDetection` hook checks:
- User agent for mobile devices
- Farcaster SDK for environment detection
- Returns platform type: `browser`, `farcaster-browser`, or `farcaster-mobile`

### 2. Wallet Connection Flow

**In Farcaster:**
1. FarcasterContext automatically authenticates
2. Platform detection identifies Farcaster environment
3. ConnectButton auto-connects using `farcasterMiniApp` connector

**In Browser:**
1. User clicks "Connect Wallet"
2. ConnectButton tries injected wallet (MetaMask) first
3. Falls back to WalletConnect if no injected wallet found

### 3. Provider Hierarchy

```tsx
<WagmiConfig>
  <FarcasterProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </FarcasterProvider>
</WagmiConfig>
```

## Supported Chains

- Base Mainnet (Chain ID: 8453)
- Base Sepolia (Chain ID: 84532)
- Ethereum Mainnet (Chain ID: 1)

Configure via `NEXT_PUBLIC_CHAIN_ID` environment variable.

## Testing

### Browser Testing
1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Click "Connect Wallet"
4. Test with MetaMask or WalletConnect

### Farcaster Testing
1. Deploy to a public URL or use ngrok
2. Create a Farcaster Mini App manifest
3. Open in Warpcast app
4. Wallet should auto-connect

## Troubleshooting

### Error: "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined"
- Make sure you created `.env.local` file
- Get a project ID from https://cloud.walletconnect.com

### Wallet not auto-connecting in Farcaster
- Check console for Farcaster SDK errors
- Ensure app is properly configured as Farcaster Mini App
- Verify manifest is accessible

### Connection errors
- Check that the selected chain is supported by your wallet
- Verify RPC endpoints are accessible
- Check browser console for detailed error messages

## Additional Resources

- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [Farcaster Mini App Docs](https://docs.farcaster.xyz/developers/guides/apps/miniapps)
- [WalletConnect Docs](https://docs.walletconnect.com)
