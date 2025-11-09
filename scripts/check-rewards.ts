import { createPublicClient, http, formatEther } from 'viem'
import { sepolia } from 'viem/chains'
import * as dotenv from 'dotenv'
import ReputationSplitterABI from '../lib/abis/ReputationSplitter.json'

dotenv.config()

const CONTRACT_ADDRESS = '0xc0ca4e370040C15Df77b83F7d2fD52F1a79631F0' as `0x${string}`
const DEV_ADDRESS = '0xc2564e41B7F5Cb66d2d99466450CfebcE9e8228f' as `0x${string}`

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://11155111.rpc.thirdweb.com'),
})

async function main() {
  console.log('🔍 Checking reward details...\n')

  // Get current round and phase
  const currentRound = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ReputationSplitterABI,
    functionName: 'currentRound',
  }) as bigint

  const currentPhase = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ReputationSplitterABI,
    functionName: 'currentPhase',
  }) as number

  console.log('📊 Current Round:', Number(currentRound))
  console.log('📊 Current Phase:', currentPhase, ['Registration', 'Active', 'Distribution'][currentPhase])

  // Get unclaimed rounds for dev
  const unclaimedRounds = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ReputationSplitterABI,
    functionName: 'getUnclaimedRounds',
    args: [DEV_ADDRESS],
  }) as bigint[]

  console.log('\n💰 Unclaimed Rounds:', unclaimedRounds.map(r => Number(r)))

  // Check each unclaimed round
  for (const round of unclaimedRounds) {
    console.log(`\n--- Round ${Number(round)} ---`)

    // Get reward pool
    const rewardPool = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ReputationSplitterABI,
      functionName: 'roundRewardPool',
      args: [round],
    }) as bigint

    console.log('Total Reward Pool:', formatEther(rewardPool), 'ETH')

    // Get dev score
    const devScore = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ReputationSplitterABI,
      functionName: 'roundDevScores',
      args: [round, DEV_ADDRESS],
    }) as bigint

    console.log('Your Score:', Number(devScore))

    // Get total scores for the round
    const registeredDevs = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ReputationSplitterABI,
      functionName: 'getRegisteredDevs',
    }) as `0x${string}`[]

    let totalScore = BigInt(0)
    for (const dev of registeredDevs) {
      const score = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ReputationSplitterABI,
        functionName: 'roundDevScores',
        args: [round, dev],
      }) as bigint
      totalScore += score
    }

    console.log('Total Scores:', Number(totalScore))

    // Calculate expected reward
    if (totalScore > 0 && devScore > 0) {
      const expectedReward = (rewardPool * devScore) / totalScore
      console.log('Expected Reward:', formatEther(expectedReward), 'ETH')
    } else {
      console.log('Expected Reward: 0 ETH (score is 0)')
    }

    // Get dev info
    const devInfo = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ReputationSplitterABI,
      functionName: 'getDevInfo',
      args: [DEV_ADDRESS],
    }) as boolean[]

    console.log('Already Claimed:', devInfo[3])
  }

  // Check contract balance
  const balance = await publicClient.getBalance({
    address: CONTRACT_ADDRESS,
  })
  console.log('\n💎 Contract Balance:', formatEther(balance), 'ETH')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
