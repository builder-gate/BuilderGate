/**
 * Script to set developer scores and trigger Distribution phase
 *
 * Usage:
 *   npx tsx scripts/set-scores.ts
 *
 * This script:
 *   1. Reads all registered developers from contract
 *   2. Prompts for scores (or uses defaults for testing)
 *   3. Calls setScores() to assign scores
 *   4. Automatically transitions from Active (1) → Distribution (2)
 *
 * Example:
 *   npx tsx scripts/set-scores.ts
 *   # For testing, assigns score of 100 to all registered devs
 */

import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import * as dotenv from 'dotenv'
import ReputationSplitterABI from '../lib/abis/ReputationSplitter.json'

// Load environment variables
dotenv.config()

const CONTRACT_ADDRESS = '0xc0ca4e370040C15Df77b83F7d2fD52F1a79631F0' as `0x${string}`

async function main() {
  // Validate private key
  const privateKey = process.env.OWNER_PRIVATE_KEY
  if (!privateKey) {
    console.error('❌ OWNER_PRIVATE_KEY not found in .env file')
    process.exit(1)
  }

  if (!privateKey.startsWith('0x')) {
    console.error('❌ OWNER_PRIVATE_KEY must start with 0x')
    process.exit(1)
  }

  // Create account from private key
  const account = privateKeyToAccount(privateKey as `0x${string}`)

  // Create public client (for reading)
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  })

  // Create wallet client (for writing)
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  })

  console.log('\n🔐 Using account:', account.address)
  console.log('📝 Contract:', CONTRACT_ADDRESS)
  console.log('🌐 Network: Ethereum Sepolia\n')

  try {
    // Read current phase
    const currentPhase = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ReputationSplitterABI,
      functionName: 'currentPhase',
    }) as number

    const currentRound = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ReputationSplitterABI,
      functionName: 'currentRound',
    }) as bigint

    const phaseName = ['Registration', 'Active', 'Distribution'][currentPhase] || 'Unknown'
    console.log(`📊 Current Phase: ${currentPhase} (${phaseName})`)
    console.log(`📊 Current Round: ${currentRound}\n`)

    if (currentPhase !== 1) {
      console.error(`❌ Cannot set scores. Current phase is ${phaseName}, must be Active (1)`)
      console.error('   Run "npm run phase:start-active" first.')
      process.exit(1)
    }

    // Get registered developers
    const registeredDevs = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ReputationSplitterABI,
      functionName: 'getRegisteredDevs',
    }) as `0x${string}`[]

    console.log(`👥 Registered Developers (${registeredDevs.length}):\n`)
    registeredDevs.forEach((dev, index) => {
      console.log(`   ${index + 1}. ${dev}`)
    })
    console.log()

    if (registeredDevs.length === 0) {
      console.error('❌ No developers registered for this round.')
      process.exit(1)
    }

    // For testing: assign score of 100 to all developers
    // In production, you'd customize these scores
    const scores = registeredDevs.map(() => BigInt(100))

    console.log('📊 Assigning Scores (for testing - all get 100):\n')
    registeredDevs.forEach((dev, index) => {
      console.log(`   ${dev} → ${scores[index]}`)
    })
    console.log()

    console.log('⚠️  NOTE: For production, customize scores based on actual reputation/contributions')
    console.log('⚠️  This will transition phase from Active (1) → Distribution (2)\n')

    console.log('⏳ Calling setScores()...\n')

    // Execute transaction
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReputationSplitterABI,
      functionName: 'setScores',
      args: [registeredDevs, scores],
      account,
    })

    console.log('📤 Transaction sent!')
    console.log('   Hash:', hash)
    console.log('   Explorer: https://sepolia.etherscan.io/tx/' + hash)
    console.log('\n⏳ Waiting for confirmation...\n')

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    if (receipt.status === 'success') {
      console.log('✅ Transaction confirmed!\n')

      // Read new phase
      const newPhase = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ReputationSplitterABI,
        functionName: 'currentPhase',
      }) as number

      const newPhaseName = ['Registration', 'Active', 'Distribution'][newPhase] || 'Unknown'

      console.log(`📊 New Phase: ${newPhase} (${newPhaseName})`)
      console.log(`📊 Round: ${currentRound}`)

      // Verify scores were set
      console.log('\n✅ Verifying scores were set correctly:\n')
      for (let i = 0; i < registeredDevs.length; i++) {
        const score = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ReputationSplitterABI,
          functionName: 'roundDevScores',
          args: [currentRound, registeredDevs[i]],
        }) as bigint

        console.log(`   ${registeredDevs[i]} → Score: ${score}`)
      }

      console.log(`\n✅ Scores successfully set and phase changed to ${newPhaseName}!`)
      console.log('\n🎉 Users can now claim their rewards by calling claim() function.')

    } else {
      console.error('❌ Transaction failed!')
      process.exit(1)
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message || error)

    if (error.message?.includes('OwnableUnauthorizedAccount')) {
      console.error('\n💡 This account is not the contract owner.')
      console.error('   Make sure OWNER_PRIVATE_KEY is the owner\'s private key.')
    }

    process.exit(1)
  }
}

main()
