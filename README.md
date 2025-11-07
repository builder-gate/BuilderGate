# BuilderGate - Farcaster Mini App Template

A Next.js 14 template for building Farcaster Mini Apps with WalletConnect integration, built with modern web3 technologies.

## ✨ Features

- **🔗 Farcaster SDK Integration**: Auto-connects in Farcaster environments (Warpcast, etc.)
- **💰 Multi-Wallet Support**:
  - WalletConnect v2 (QR code & mobile wallets)
  - Injected wallets (MetaMask, Coinbase Wallet, etc.)
  - Farcaster Mini App connector
- **🎨 Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **📱 Platform Detection**: Automatically detects browser, Farcaster browser, or Farcaster mobile
- **⚡ Base Network**: Configured for Base (Mainnet & Sepolia Testnet)
- **🌐 TypeScript**: Fully typed for better DX

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A WalletConnect Project ID ([Get one here](https://cloud.walletconnect.com/))

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your WalletConnect Project ID:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_SITE_NAME=BuilderGate
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

3. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 🏗️ Project Structure

```
BuilderGate/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── dropdown-menu.tsx
│   ├── ConnectButton.tsx  # Wallet connection button
│   └── sdk-initializer.tsx # Farcaster SDK setup
├── contexts/
│   └── FarcasterContext.tsx # Farcaster authentication
├── hooks/
│   └── usePlatformDetection.ts # Platform detection hook
├── lib/
│   ├── utils.ts            # Utility functions
│   └── wagmi.ts            # Wagmi configuration
└── providers/
    └── wagmi-provider.tsx  # Wagmi provider wrapper
```

## 🔧 Configuration

### Supported Chains

By default, the app supports:
- Base Mainnet (Chain ID: 8453)
- Base Sepolia Testnet (Chain ID: 84532)
- Ethereum Mainnet

You can modify the chains in `lib/wagmi.ts`.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID | ✅ Yes |
| `NEXT_PUBLIC_CHAIN_ID` | Default chain ID (8453 for Base) | No |
| `NEXT_PUBLIC_SITE_NAME` | Your app name | No |
| `NEXT_PUBLIC_SITE_URL` | Your app URL | No |

## 📦 Key Dependencies

- **Next.js 14**: React framework with App Router
- **Wagmi v2**: React hooks for Ethereum
- **Farcaster SDK**: Official Farcaster Mini App SDK
- **WalletConnect**: Web3 wallet connection
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Re-usable components built with Radix UI
- **Lucide React**: Icon library

## 🎯 Usage

### Connect Wallet

The `ConnectButton` component automatically detects the environment and shows appropriate connection options:

```tsx
import { ConnectButton } from '@/components/ConnectButton'

export default function Page() {
  return <ConnectButton />
}
```

### Access Farcaster User

```tsx
import { useFarcaster } from '@/contexts/FarcasterContext'

export default function Component() {
  const { user, isAuthenticated } = useFarcaster()

  if (!isAuthenticated) return <div>Not authenticated</div>

  return <div>Hello {user?.displayName}</div>
}
```

### Platform Detection

```tsx
import { usePlatformDetection } from '@/hooks/usePlatformDetection'

export default function Component() {
  const { platform, isFarcaster } = usePlatformDetection()

  return <div>Platform: {platform}</div>
}
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Build the production version:

```bash
npm run build
npm start
```

## 📝 License

MIT

## 🙏 Acknowledgments

- Based on the [Farcaster Mini App Template](https://github.com/farcasterxyz/miniapp-template)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
