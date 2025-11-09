"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useReputationSplitter } from "@/hooks/useReputationSplitter"
import { useAccount, useSwitchChain } from "wagmi"
import { Wallet, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { formatEther } from "viem"
import { useEffect } from "react"
import { sepolia } from "wagmi/chains"

interface RewardsCardProps {
  githubVerified: boolean
  selfVerified: boolean
}

export function RewardsCard({ githubVerified, selfVerified }: RewardsCardProps) {
  const { isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const {
    contractAddress,
    currentPhase,
    currentRound,
    phaseName,
    unclaimedRounds,
    hasUnclaimedRewards,
    isAlreadyRegistered,
    hasAlreadyClaimed,
    handleRegister,
    isRegisterPending,
    isRegisterConfirming,
    isRegisterSuccess,
    registerError,
    handleClaim,
    isClaimPending,
    isClaimConfirming,
    isClaimSuccess,
    claimError,
    refetchAll,
  } = useReputationSplitter()

  // Refetch data when transactions complete
  useEffect(() => {
    if (isRegisterSuccess || isClaimSuccess) {
      setTimeout(() => refetchAll(), 2000)
    }
  }, [isRegisterSuccess, isClaimSuccess, refetchAll])

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Withdraw ETH
          </CardTitle>
          <CardDescription>Connect your wallet to withdraw earnings</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Show network warning if contract not available
  if (!contractAddress) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Withdraw ETH
          </CardTitle>
          <CardDescription>Switch to Ethereum Sepolia to withdraw earnings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-2">
              ⚠️ Unsupported Network
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Please switch your wallet to Ethereum Sepolia network to interact with the ReputationSplitter contract.
            </p>
          </div>

          <Button
            onClick={() => switchChain({ chainId: sepolia.id })}
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Switch to Ethereum Sepolia
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isRegistrationPhase = currentPhase === 0
  const isDistributionPhase = currentPhase === 2
  const proofsCompleted = githubVerified && selfVerified

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Withdraw ETH
        </CardTitle>
        <CardDescription>Withdraw your reputation-based ETH earnings</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Round Info */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Current Round</p>
            <p className="text-2xl font-bold">
              {currentRound !== undefined ? Number(currentRound) : '—'}
            </p>
          </div>
          <Badge variant={isDistributionPhase ? "default" : "secondary"}>
            {phaseName}
          </Badge>
        </div>

        {/* Registration Phase */}
        {isRegistrationPhase && (
          <div className="space-y-4">
            {!proofsCompleted && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-2">
                  ⚠️ Verification Required
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Complete your identity verification before registering:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    {githubVerified ? '✅' : '❌'} GitHub verification
                  </li>
                  <li className="flex items-center gap-2">
                    {selfVerified ? '✅' : '❌'} Self Protocol verification
                  </li>
                </ul>
              </div>
            )}

            {isAlreadyRegistered && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm font-medium text-green-600 dark:text-green-500 mb-2">
                  ✅ Already Registered
                </p>
                <p className="text-sm text-muted-foreground">
                  You are already registered for this round. Wait for the Active phase to complete and scores to be set.
                </p>
              </div>
            )}

            {proofsCompleted && !isAlreadyRegistered && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium mb-2">📝 Registration Open</p>
                <p className="text-sm text-muted-foreground">
                  Register now to participate in this round's reward distribution
                </p>
              </div>
            )}

            <Button
              onClick={handleRegister}
              disabled={!proofsCompleted || isAlreadyRegistered || isRegisterPending || isRegisterConfirming}
              className="w-full"
              size="lg"
            >
              {isRegisterPending || isRegisterConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRegisterConfirming ? 'Confirming...' : 'Registering...'}
                </>
              ) : isAlreadyRegistered ? (
                'Already Registered'
              ) : (
                'Register for Round'
              )}
            </Button>

            {isRegisterSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-600">Successfully registered!</p>
              </div>
            )}

            {registerError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600">
                  {registerError.message.includes('already registered')
                    ? 'Already registered for this round'
                    : 'Registration failed. Try again.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Distribution Phase - Claim Rewards */}
        {isDistributionPhase && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Unclaimed Rounds</p>
              <p className="text-3xl font-bold">
                {unclaimedRounds?.length ?? 0}
              </p>
            </div>

            {hasAlreadyClaimed && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm font-medium text-green-600 dark:text-green-500 mb-2">
                  ✅ Already Claimed
                </p>
                <p className="text-sm text-muted-foreground">
                  You have already claimed your rewards for this round.
                </p>
              </div>
            )}

            {!hasAlreadyClaimed && hasUnclaimedRewards && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium mb-2">💰 ETH Available</p>
                <p className="text-sm text-muted-foreground mb-3">
                  You have ETH to withdraw from {unclaimedRounds?.length} round(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {unclaimedRounds?.map((round) => (
                    <Badge key={round.toString()} variant="outline">
                      Round {Number(round)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleClaim}
              disabled={hasAlreadyClaimed || !hasUnclaimedRewards || isClaimPending || isClaimConfirming}
              className="w-full"
              size="lg"
            >
              {isClaimPending || isClaimConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isClaimConfirming ? 'Confirming...' : 'Withdrawing...'}
                </>
              ) : hasAlreadyClaimed ? (
                'Already Claimed'
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Withdraw ETH
                </>
              )}
            </Button>

            {!hasUnclaimedRewards && !hasAlreadyClaimed && (
              <p className="text-center text-sm text-muted-foreground">
                No ETH to withdraw at this time
              </p>
            )}

            {isClaimSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-600">ETH withdrawn successfully!</p>
              </div>
            )}

            {claimError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600">Withdrawal failed. Try again.</p>
              </div>
            )}
          </div>
        )}

        {/* Active Phase - Waiting */}
        {currentPhase === 1 && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm font-medium mb-2">⏳ Active Phase</p>
            <p className="text-sm text-muted-foreground">
              Scores are being calculated. Distribution will open soon.
            </p>
          </div>
        )}

        {/* Contract Info */}
        {contractAddress && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
