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

  // Get list of all registered developers (simpler than getDevInfo)
  const { data: registeredDevs, refetch: refetchRegisteredDevs } = useReadContract({
    address: contractAddress,
    abi: ReputationSplitterABI,
    functionName: 'getRegisteredDevs',
    query: {
      enabled: !!contractAddress,
    },
  })

  // Debug: Log registered developers
  console.log('🔍 getRegisteredDevs:', {
    walletAddress: address,
    registeredDevs: registeredDevs as `0x${string}`[] | undefined,
    isRegistered: address && registeredDevs
      ? (registeredDevs as `0x${string}`[]).map(a => a.toLowerCase()).includes(address.toLowerCase())
      : false,
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

  const handleRegister = async () => {
    if (!contractAddress) return
    try {
      await register({
        address: contractAddress,
        abi: ReputationSplitterABI,
        functionName: 'register',
      })
    } catch (error) {
      // Silently handle wallet popup closure errors
      console.error('Registration error:', error)
    }
  }

  // Wait for register transaction
  const { isLoading: isRegisterConfirming, isSuccess: isRegisterSuccess } = useWaitForTransactionReceipt({
    hash: registerHash,
    query: {
      enabled: !!registerHash,
    },
  })

  // Write: Claim rewards
  const {
    writeContract: claim,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
  } = useWriteContract()

  const handleClaim = async () => {
    if (!contractAddress) return
    try {
      await claim({
        address: contractAddress,
        abi: ReputationSplitterABI,
        functionName: 'claim',
      })
    } catch (error) {
      // Silently handle wallet popup closure errors
      console.error('Claim error:', error)
    }
  }

  // Wait for claim transaction
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
    query: {
      enabled: !!claimHash,
    },
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
    refetchRegisteredDevs()
  }

  // Check if user is already registered (check if address is in registeredDevs array)
  const isAlreadyRegistered = address && registeredDevs
    ? (registeredDevs as `0x${string}`[]).map(a => a.toLowerCase()).includes(address.toLowerCase())
    : false

  return {
    // Contract info
    contractAddress,
    currentPhase: currentPhase as number | undefined,
    currentRound: currentRound as bigint | undefined,
    phaseName: getPhaseName(currentPhase as number | undefined),

    // User data
    unclaimedRounds: unclaimedRounds as bigint[] | undefined,
    hasUnclaimedRewards: (unclaimedRounds as bigint[] | undefined)?.length ?? 0 > 0,
    isAlreadyRegistered,
    registeredDevs: registeredDevs as `0x${string}`[] | undefined,

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
