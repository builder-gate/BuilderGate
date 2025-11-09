# Contract Management Scripts

Scripts for managing the ReputationSplitter smart contract on Ethereum Sepolia.

## Prerequisites

1. **Owner Private Key**: Set `OWNER_PRIVATE_KEY` in `.env` file
2. **Network**: Scripts run on Ethereum Sepolia (chain ID: 11155111)
3. **Contract**: `0x652cc79a37Ef6c9CD76179c6238A6C4CC3018493`

## Available Scripts

### 1. Start Active Phase

Moves the contract from **Registration (Phase 0)** to **Active (Phase 1)**.

```bash
npm run phase:start-active
```

Or directly:
```bash
npx tsx scripts/change-phase.ts start-active
```

**Requirements**:
- Current phase must be **0 (Registration)**
- Only contract owner can execute
- Ends the registration period
- Owner must then call `setScores()` to assign developer scores

**What happens**:
- Phase changes from 0 → 1
- No more registrations allowed
- Round remains the same

---

### 2. Start New Round

Moves the contract from **Distribution (Phase 2)** to **Registration (Phase 0)** and increments the round number.

```bash
npm run phase:start-new-round
```

Or directly:
```bash
npx tsx scripts/change-phase.ts start-new-round
```

**Requirements**:
- Current phase must be **2 (Distribution)**
- Only contract owner can execute
- All rewards from previous round should be claimed

**What happens**:
- Phase changes from 2 → 0
- Round number increments (e.g., Round 2 → Round 3)
- New registration period begins
- Previous registered developers list is preserved

---

## Phase Flow

```
Registration (0) → Active (1) → Distribution (2) → Registration (0) [new round]
      ↓                ↓                ↓                    ↓
  Users register   Owner sets      Users claim         New round starts
                    scores          rewards
```

### Complete Workflow

1. **Registration Phase (0)**
   - Users connect wallet
   - Complete GitHub + Self Protocol verifications
   - Call `register()` function
   - Run: `npm run phase:start-active` when registration period ends

2. **Active Phase (1)**
   - Owner calls `setScores(addresses[], scores[])` via Etherscan
   - Assigns reputation scores to registered developers
   - ETH deposits accumulate in contract

3. **Distribution Phase (2)**
   - Users call `claim()` to withdraw their ETH rewards
   - Rewards calculated based on reputation scores
   - Run: `npm run phase:start-new-round` to begin next round

---

## Script Output Example

```bash
$ npm run phase:start-active

🔐 Using account: 0x1234...5678
📝 Contract: 0x652cc79a37Ef6c9CD76179c6238A6C4CC3018493
🌐 Network: Ethereum Sepolia

📊 Current Phase: 0 (Registration)
📊 Current Round: 2

⏳ Calling startActivePhase()...
   This will change phase from Registration (0) → Active (1)

📤 Transaction sent!
   Hash: 0xabcd...ef01
   Explorer: https://sepolia.etherscan.io/tx/0xabcd...ef01

⏳ Waiting for confirmation...

✅ Transaction confirmed!

📊 New Phase: 1 (Active)
📊 New Round: 2

✅ Phase successfully changed to Active!
```

---

## Error Handling

### "OwnableUnauthorizedAccount"
```
❌ This account is not the contract owner.
   Make sure OWNER_PRIVATE_KEY is the owner's private key.
```

**Solution**: Verify `OWNER_PRIVATE_KEY` in `.env` matches the contract owner's private key.

---

### "Cannot start Active phase. Current phase is Active, must be Registration (0)"
```
❌ Cannot start Active phase. Current phase is Active, must be Registration (0)
```

**Solution**: Phase transitions must follow the correct order. Check current phase and use the appropriate script.

---

## Security Notes

⚠️ **NEVER commit `.env` file or share `OWNER_PRIVATE_KEY`**

- The `.env` file is in `.gitignore`
- Private key has full owner permissions on the contract
- Only run scripts from secure environment
- Verify transaction details before confirming

---

## Manual Operations (via Etherscan)

Some operations must be done manually on Etherscan:

### Set Developer Scores

After moving to Active phase, set scores for registered developers:

1. Go to: https://sepolia.etherscan.io/address/0x652cc79a37Ef6c9CD76179c6238A6C4CC3018493#writeContract
2. Connect wallet with owner account
3. Find `setScores` function
4. Input:
   - `devs`: Array of developer addresses (from `getRegisteredDevs()`)
   - `scores`: Array of scores (same order, e.g., [100, 250, 500])
5. Execute transaction

### Deposit ETH Rewards

Deposit ETH to the contract (automatically allocated to current round):

1. Go to contract on Etherscan
2. Use "Write Contract" → `receive` function
3. Send ETH amount
4. Or send ETH directly to contract address

---

## Troubleshooting

### Script won't run
```bash
# Make sure dependencies are installed
npm install

# Check Node.js version (requires v18+)
node --version

# Verify .env file exists and has OWNER_PRIVATE_KEY
cat .env | grep OWNER_PRIVATE_KEY
```

### Transaction fails
- Check you have enough Sepolia ETH for gas
- Verify you're the contract owner
- Ensure current phase allows the transition
- Check Sepolia network is not congested

### Get Sepolia ETH
- Faucet: https://sepoliafaucet.com/
- Alternative: https://www.alchemy.com/faucets/ethereum-sepolia

---

## Development

To modify or extend the scripts:

```bash
# Edit the script
code scripts/change-phase.ts

# Test locally (dry run - won't actually execute)
# Add console.log() statements to verify logic

# Run with TypeScript directly
npx tsx scripts/change-phase.ts start-active
```
