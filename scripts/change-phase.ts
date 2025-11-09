/**
 * Script to change ReputationSplitter contract phase
 *
 * Usage:
 *   npx tsx scripts/change-phase.ts <action>
 *
 * Actions:
 *   - start-active: Move from Registration (0) to Active (1)
 *   - start-new-round: Move from Distribution (2) to Registration (0) for new round
 *
 * Example:
 *   npx tsx scripts/change-phase.ts start-active
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
  const action = process.argv[2]

  if (!action || !['start-active', 'start-new-round'].includes(action)) {
    console.error('❌ Invalid action. Use: start-active or start-new-round')
    console.error('Example: npx tsx scripts/change-phase.ts start-active')
    process.exit(1)
  }

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

    // Determine function to call
    let functionName: 'startActivePhase' | 'startNewRound'
    let expectedCurrentPhase: number
    let newPhase: number
    let newPhaseName: string

    if (action === 'start-active') {
      functionName = 'startActivePhase'
      expectedCurrentPhase = 0 // Registration
      newPhase = 1
      newPhaseName = 'Active'

      if (currentPhase !== 0) {
        console.error(`❌ Cannot start Active phase. Current phase is ${phaseName}, must be Registration (0)`)
        process.exit(1)
      }
    } else {
      functionName = 'startNewRound'
      expectedCurrentPhase = 2 // Distribution
      newPhase = 0
      newPhaseName = 'Registration'

      if (currentPhase !== 2) {
        console.error(`❌ Cannot start new round. Current phase is ${phaseName}, must be Distribution (2)`)
        process.exit(1)
      }
    }

    console.log(`⏳ Calling ${functionName}()...`)
    console.log(`   This will change phase from ${phaseName} (${currentPhase}) → ${newPhaseName} (${newPhase})\n`)

    // Execute transaction
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ReputationSplitterABI,
      functionName,
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
      const newPhaseValue = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ReputationSplitterABI,
        functionName: 'currentPhase',
      }) as number

      const newRound = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ReputationSplitterABI,
        functionName: 'currentRound',
      }) as bigint

      const newPhaseNameActual = ['Registration', 'Active', 'Distribution'][newPhaseValue] || 'Unknown'

      console.log(`📊 New Phase: ${newPhaseValue} (${newPhaseNameActual})`)
      console.log(`📊 New Round: ${newRound}`)
      console.log(`\n✅ Phase successfully changed to ${newPhaseNameActual}!`)

      if (action === 'start-new-round') {
        console.log(`\n🎉 New round ${newRound} started! Users can now register.`)
      }
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
