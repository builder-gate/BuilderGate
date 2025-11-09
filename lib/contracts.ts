import { sepolia } from 'wagmi/chains'

// Contract addresses - Only Sepolia network
export const CONTRACTS = {
  [sepolia.id]: {
    ReputationSplitter: '0x652cc79a37Ef6c9CD76179c6238A6C4CC3018493' as `0x${string}`,
  },
} as const

// Get contract address for current network
export function getContractAddress(
  chainId: number,
  contractName: keyof typeof CONTRACTS[typeof sepolia.id]
): `0x${string}` | undefined {
  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS]
  if (!contracts) {
    // Return undefined instead of throwing for unsupported chains
    return undefined
  }
  return contracts[contractName]
}
