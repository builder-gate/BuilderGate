import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractAddress } from '@/lib/contracts'
import ReputationSplitterABI from '@/lib/abis/ReputationSplitter.json'

export function useReputationSplitter() {
  const { address, chainId } = useAccount()
  const contractAddress = chainId ? getContractAddress(chainId, 'ReputationSplitter') : undefined

  // Read current phase (0 = Registration, 1 = Active, 2 = Distribution)
  const { data: currentPhase, refetch: refetchPhase } = useReadContract({
    address: contractAddress,
    abi: ReputationSplitterABI,
    functionName: 'currentPhase',
  })

  // Read current round number
  const { data: currentRound, refetch: refetchRound } = useReadContract({
    address: contractAddress,
    abi: ReputationSplitterABI,
    functionName: 'currentRound',
  })

  // Read unclaimed rounds for user
  const { data: unclaimedRounds, refetch: refetchUnclaimed } = useReadContract({
    address: contractAddress,
    abi: ReputationSplitterABI,
    functionName: 'getUnclaimedRounds',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Read reward pool for specific round
  const useRoundRewardPool = (round: number) => {
    return useReadContract({
      address: contractAddress,
      abi: ReputationSplitterABI,
      functionName: 'roundRewardPool',
      args: [BigInt(round)],
    })
  }

  // Read developer score for specific round
  const useDevScore = (round: number, devAddress: `0x${string}`) => {
    return useReadContract({
      address: contractAddress,
      abi: ReputationSplitterABI,
      functionName: 'roundDevScores',
      args: [BigInt(round), devAddress],
    })
  }

  // Write: Register for current round
  const {
    writeContract: register,
    data: registerHash,
    isPending: isRegisterPending,
    error: registerError,
  } = useWriteContract()

  const handleRegister = () => {
    if (!contractAddress) return
    register({
      address: contractAddress,
      abi: ReputationSplitterABI,
      functionName: 'register',
    })
  }

  // Wait for register transaction
  const { isLoading: isRegisterConfirming, isSuccess: isRegisterSuccess } = useWaitForTransactionReceipt({
    hash: registerHash,
  })

  // Write: Claim rewards
  const {
    writeContract: claim,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
  } = useWriteContract()

  const handleClaim = () => {
    if (!contractAddress) return
    claim({
      address: contractAddress,
      abi: ReputationSplitterABI,
      functionName: 'claim',
    })
  }

  // Wait for claim transaction
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  // Helper to get phase name
  const getPhaseName = (phase: number | undefined) => {
    if (phase === undefined) return 'Unknown'
    switch (phase) {
      case 0:
        return 'Registration'
      case 1:
        return 'Active'
      case 2:
        return 'Distribution'
      default:
        return 'Unknown'
    }
  }

  // Refetch all data
  const refetchAll = () => {
    refetchPhase()
    refetchRound()
    refetchUnclaimed()
  }

  return {
    // Contract info
    contractAddress,
    currentPhase: currentPhase as number | undefined,
    currentRound: currentRound as bigint | undefined,
    phaseName: getPhaseName(currentPhase as number | undefined),

    // User data
    unclaimedRounds: unclaimedRounds as bigint[] | undefined,
    hasUnclaimedRewards: (unclaimedRounds as bigint[] | undefined)?.length ?? 0 > 0,

    // Hooks for specific queries
    useRoundRewardPool,
    useDevScore,

    // Registration
    handleRegister,
    isRegisterPending,
    isRegisterConfirming,
    isRegisterSuccess,
    registerError,
    registerHash,

    // Claiming
    handleClaim,
    isClaimPending,
    isClaimConfirming,
    isClaimSuccess,
    claimError,
    claimHash,

    // Refetch
    refetchAll,
  }
}
