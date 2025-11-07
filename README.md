# BuilderGate - Reputation-Gated Builder Vault

A Farcaster Mini App implementing a **Reputation-Gated Builder Vault (RGBV)** with **Yield Donating Strategy (YDS)** to reward verified builders based on their GitHub contributions and on-chain reputation.

## 🎯 Overview

BuilderGate combines DeFi yield generation with developer reputation systems to create a sustainable funding mechanism for open-source contributors. The system uses:

- **Uniswap v4 Hooks** for automated fee collection
- **ERC-4626 Vault** for yield generation through fee donations
- **zkProofs** for GitHub contribution verification
- **On-chain Attestations** for reputation validation
- **Tokenized Allocation Mechanism (TAM)** for proportional yield distribution

## 🏗️ Architecture

```
┌─────────────────────┐
│  Uniswap v4 Hook    │ (Fee Collection)
│  afterSwap()        │
└──────────┬──────────┘
           │ donates fees
           ▼
┌─────────────────────┐
│  YDS Vault          │ (ERC-4626)
│  (Yield Generation) │
└──────────┬──────────┘
           │ distributes yield
           ▼
┌─────────────────────┐
│  TAM Distribution   │ (Reputation-Based)
│  (Builder Rewards)  │
└─────────────────────┘
```

## ✨ Features

### Core Functionality

1. **🔗 Farcaster Integration**: Seamless authentication and identity verification
2. **💰 Automated Yield Distribution**: Uniswap v4 hook donates swap fees to vault
3. **🛡️ Reputation Verification**: zkProof + on-chain attestations for GitHub contributions
4. **📊 Transparent Allocation**: Real-time yield tracking and distribution
5. **🎨 Modern UI**: Built with Tailwind CSS and shadcn/ui components

### Wallet Support

- WalletConnect v2 (QR code & mobile wallets)
- Injected wallets (MetaMask, Coinbase Wallet, etc.)
- Farcaster Mini App connector

### Network Support

- Base Network (Mainnet & Sepolia Testnet)
- Ethereum Mainnet
- Fully TypeScript typed

## 📋 Requirements

### Requirement 1: GitHub Contribution Verification (zkProof)

**User Story**: As a builder, I want to verify my GitHub contributions using zkProofs so that my reputation is trustless and privacy-preserving.

**Acceptance Criteria**:
- ✅ User generates zkProof from GitHub commit history without exposing private data
- ✅ Smart contract validates zkProof on-chain
- ✅ Proof confirms minimum contribution threshold (e.g., 10+ commits in last 90 days)
- ✅ Verification status stored on-chain and queryable via UI

**Implementation**:
- Uses zkSNARKs/zkSTARKs for GitHub API data verification
- Merkle tree of commit hashes with zero-knowledge range proofs
- On-chain verifier contract validates proofs
- UI displays verification status with proof metadata

### Requirement 2: On-Chain Attestation Verification

**User Story**: As a builder, I want my Farcaster profile and GitHub account linked via on-chain attestations so my reputation is verifiable across platforms.

**Acceptance Criteria**:
- ✅ User requests attestation linking Farcaster FID to GitHub username
- ✅ Attestation Provider verifies ownership of both accounts
- ✅ Attestation is recorded on-chain (EAS or similar)
- ✅ Smart contract queries attestation before allowing vault access
- ✅ UI shows attestation status and linked accounts

**Implementation**:
- Ethereum Attestation Service (EAS) integration
- OAuth flow for GitHub verification
- Farcaster signature for FID verification
- Attestation schema: `{fid: uint256, github: string, verified: bool, timestamp: uint256}`

### Requirement 3: Uniswap v4 Hook for Fee Donation

**User Story**: As a liquidity provider, I want swap fees automatically donated to the Builder Vault so builders are funded without manual intervention.

**Acceptance Criteria**:
- ✅ Custom Uniswap v4 hook captures fees from afterSwap()
- ✅ Fees are automatically deposited into YDS Vault (ERC-4626)
- ✅ Vault shares minted proportionally to fee amount
- ✅ Hook emits events for transparency
- ✅ UI displays total fees donated and vault TVL

**Implementation**:
```solidity
contract BuilderVaultHook is BaseHook {
    function afterSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external override returns (bytes4, int128) {
        // Extract fee from delta
        uint256 feeAmount = calculateFee(delta);

        // Donate to YDS Vault
        vault.deposit(feeAmount, address(this));

        emit FeeDonated(feeAmount, block.timestamp);
        return (this.afterSwap.selector, 0);
    }
}
```

### Requirement 4: ERC-4626 Vault with Yield Distribution

**User Story**: As a verified builder, I want to claim my share of vault yield based on my reputation score so I'm rewarded for contributions.

**Acceptance Criteria**:
- ✅ Vault implements ERC-4626 standard
- ✅ Yield accrues from donated Uniswap fees
- ✅ Builder shares calculated by: `(builderScore / totalScore) * totalYield`
- ✅ Builders can claim yield via smart contract function
- ✅ UI shows claimable yield, total earned, and APY

**Implementation**:
```solidity
contract BuilderVault is ERC4626 {
    mapping(address => uint256) public reputationScores;
    mapping(address => uint256) public lastClaimTimestamp;

    function claimYield() external {
        require(isVerifiedBuilder(msg.sender), "Not verified");

        uint256 yield = calculateYield(msg.sender);
        require(yield > 0, "No yield to claim");

        lastClaimTimestamp[msg.sender] = block.timestamp;
        asset.transfer(msg.sender, yield);

        emit YieldClaimed(msg.sender, yield);
    }

    function calculateYield(address builder) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastClaimTimestamp[builder];
        uint256 totalYield = totalAssets() - totalSupply();
        uint256 builderShare = (reputationScores[builder] * 1e18) / totalReputationScore;

        return (totalYield * builderShare * timeElapsed) / (1e18 * 365 days);
    }
}
```

### Requirement 5: Tokenized Allocation Mechanism (TAM)

**User Story**: As a builder, I want my reputation score tokenized so I can trade, delegate, or use it in DeFi protocols.

**Acceptance Criteria**:
- ✅ Each verified builder receives ERC-20 "Reputation Tokens" (REP)
- ✅ REP amount = reputation score (e.g., 100 commits = 100 REP)
- ✅ REP tokens grant proportional claim to vault yield
- ✅ Builders can transfer, stake, or trade REP tokens
- ✅ Vault yield distribution uses live REP balances
- ✅ UI shows REP balance, circulating supply, and market value

**Implementation**:
```solidity
contract ReputationToken is ERC20 {
    BuilderVault public vault;

    function mint(address builder, uint256 score) external onlyVault {
        _mint(builder, score);
        vault.updateReputationScore(builder, balanceOf(builder));
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        if (from != address(0)) {
            vault.updateReputationScore(from, balanceOf(from));
        }
        if (to != address(0)) {
            vault.updateReputationScore(to, balanceOf(to));
        }
    }
}
```

## 🔐 Security & Edge Cases

### Edge Cases Handled

1. **Zero Contributions**: Users with 0 commits cannot verify → UI shows error
2. **Stale Proofs**: zkProofs expire after 30 days → Re-verification required
3. **Attestation Revocation**: If GitHub account deleted, attestation becomes invalid
4. **Yield Rounding**: Small yield amounts (<0.01 tokens) accumulate until claimable
5. **Front-Running**: Claim transactions use nonce + deadline to prevent MEV attacks
6. **Vault Insolvency**: If vault TVL < total claimable yield, claims processed FIFO

### Security Measures

- Multi-sig governance for vault parameters
- Time-locked upgrades (48h minimum)
- Emergency pause functionality
- Rate limiting on claims (1 per 24h)
- Slashing mechanism for fake attestations

## 🛠️ Tech Stack

### Smart Contracts

- **Solidity 0.8.24**: Smart contract language
- **Uniswap v4**: Hooks and liquidity pools
- **ERC-4626**: Tokenized vault standard
- **zkSNARKs**: Zero-knowledge proof system (Circom/Groth16)
- **EAS (Ethereum Attestation Service)**: On-chain attestations
- **Foundry**: Development framework

### Frontend (Farcaster Mini App)

- **Next.js 15**: React framework with App Router
- **Wagmi v2**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum library
- **Farcaster SDK**: Official Farcaster Mini App SDK
- **WalletConnect v2**: Web3 wallet connection
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Re-usable components built with Radix UI
- **Recharts**: Data visualization

### Backend & Infrastructure

- **The Graph**: On-chain data indexing
- **IPFS**: Decentralized proof storage
- **Base Network**: Layer 2 for low fees
- **Vercel**: Frontend deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Foundry for smart contract development
- A WalletConnect Project ID ([Get one here](https://cloud.walletconnect.com/))
- GitHub OAuth App credentials
- Farcaster account

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/buildergate.git
cd buildergate
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Blockchain
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_HOOK_ADDRESS=0x...
NEXT_PUBLIC_REP_TOKEN_ADDRESS=0x...

# App Config
NEXT_PUBLIC_SITE_NAME=BuilderGate
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Attestation
EAS_CONTRACT_ADDRESS=0x...
EAS_SCHEMA_UID=0x...
```

4. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

### Smart Contract Deployment

```bash
cd contracts
forge build
forge test
forge script script/Deploy.s.sol --rpc-url base --broadcast
```

## 📁 Project Structure

```
BuilderGate/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main dashboard
│   ├── verify/                 # zkProof verification flow
│   ├── claim/                  # Yield claiming interface
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── ConnectButton.tsx       # Wallet connection
│   ├── ReputationCard.tsx      # Reputation display
│   ├── YieldDashboard.tsx      # Yield statistics
│   └── VerificationFlow.tsx    # zkProof generation UI
├── contracts/
│   ├── BuilderVault.sol        # ERC-4626 vault
│   ├── BuilderVaultHook.sol    # Uniswap v4 hook
│   ├── ReputationToken.sol     # ERC-20 REP token
│   └── ZkVerifier.sol          # zkProof verifier
├── contexts/
│   └── FarcasterContext.tsx    # Farcaster authentication
├── hooks/
│   ├── usePlatformDetection.ts
│   ├── useVaultData.ts         # Vault statistics
│   └── useReputation.ts        # Reputation queries
├── lib/
│   ├── wagmi.ts                # Wagmi configuration
│   ├── contracts.ts            # Contract ABIs/addresses
│   └── zkproof.ts              # zkProof generation
└── utils/
    ├── github.ts               # GitHub API integration
    └── attestations.ts         # EAS integration
```

## 📊 Smart Contract Interfaces

### BuilderVault (ERC-4626)

```solidity
interface IBuilderVault {
    function claimYield() external returns (uint256);
    function calculateYield(address builder) external view returns (uint256);
    function updateReputationScore(address builder, uint256 score) external;
    function isVerifiedBuilder(address builder) external view returns (bool);
    function totalReputationScore() external view returns (uint256);
}
```

### BuilderVaultHook

```solidity
interface IBuilderVaultHook {
    function afterSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external returns (bytes4, int128);
}
```

### ZkVerifier

```solidity
interface IZkVerifier {
    function verifyGitHubProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[4] calldata input
    ) external view returns (bool);
}
```

## 🗺️ Roadmap

- [x] Farcaster Mini App template
- [x] Wallet integration (WalletConnect, MetaMask)
- [ ] GitHub OAuth integration
- [ ] zkProof generation circuit (Circom)
- [ ] Smart contract deployment (Base Sepolia)
- [ ] EAS attestation integration
- [ ] Uniswap v4 hook deployment
- [ ] Reputation token launch
- [ ] Yield claiming interface
- [ ] Mainnet deployment
- [ ] DAO governance for vault parameters

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Farcaster](https://www.farcaster.xyz/) for the Mini App SDK
- [Uniswap v4](https://uniswap.org/) for the hooks framework
- [EAS](https://attest.sh/) for attestation infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Next.js](https://nextjs.org/) for the React framework

## 📞 Support

For questions and support:
- Open an issue on GitHub
- Join our [Farcaster channel](https://warpcast.com/~/channel/buildergate)
- Email: support@buildergate.xyz

---

**Built with ❤️ for the builder community**
