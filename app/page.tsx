"use client"

import { useState, useEffect } from "react"
import { VerificationCard } from "@/components/verification-card"
import { VerificationModal } from "@/components/verification-modal"
import { SelfVerificationModal } from "@/components/self-verification-modal"
import { TokenCard } from "@/components/token-card"
import { TokenSwapModal } from "@/components/token-swap-modal"
import { VaultModal } from "@/components/vault-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { ConnectButton } from "@/components/ConnectButton"
import { BuilderScoreCard } from "@/components/builder-score-card"
import { useSelf } from "@/contexts/SelfContext"
import { Shield, Zap, Users, TrendingUp } from "lucide-react"

export default function Home() {
  const { isVerified: selfVerified } = useSelf()

  const [verifications, setVerifications] = useState({
    talentProtocol: false,
    github: false,
    selfProtocol: false,
  })

  const [tokenBalance, setTokenBalance] = useState(1000)
  const [builderScore, setBuilderScore] = useState(0)

  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [showVaultModal, setShowVaultModal] = useState(false)
  const [showSelfModal, setShowSelfModal] = useState(false)

  // Update Self Protocol verification status from context
  useEffect(() => {
    if (selfVerified) {
      setVerifications((prev) => ({
        ...prev,
        selfProtocol: true,
      }))
    }
  }, [selfVerified])

  const platforms = [
    {
      id: "talentProtocol",
      title: "Talent Protocol",
      logo: "/images/talent-protocol.png",
      endpoint: "/api/verify-talent",
    },
    {
      id: "github",
      title: "GitHub",
      logo: "/images/github.png",
      endpoint: "/api/verify-github",
    },
    {
      id: "selfProtocol",
      title: "Self Protocol",
      logo: "/images/self-protocol.png",
      endpoint: "/api/verify/self-protocol",
    },
  ]

  const allVerified = Object.values(verifications).every((v) => v)

  const handleVerifySuccess = (platformId: string) => {
    setVerifications((prev) => ({
      ...prev,
      [platformId]: true,
    }))
    const newVerifications = {
      ...verifications,
      [platformId]: true,
    }
    const verifiedCount = Object.values(newVerifications).filter(Boolean).length
    if (verifiedCount === 3) {
      setBuilderScore(Math.floor(Math.random() * 500) + 500)
    }
  }

  const handleSwapComplete = (newBalance: number) => {
    setTokenBalance(newBalance)
  }

  const handleVaultAction = (action: "stake" | "unstake", amount: number) => {
    if (action === "stake") {
      setTokenBalance((prev) => prev - amount)
    } else {
      setTokenBalance((prev) => prev + amount)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <ConnectButton />
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-center gap-3 mb-4 pt-10">
            <Shield
              className="w-10 h-10 [&>path]:stroke-black dark:[&>path]:stroke-transparent"
              style={{ fill: "#f4ff00", strokeWidth: 2 }}
            />
            <h1 className="text-5xl font-bold tracking-tight">BuilderGate</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Reputation-Gated Yield Distribution for Web3 Builders
          </p>
          <p className="text-base text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Prove your contributions. Access exclusive yield. No applications, no governance votes, just verifiable
            reputation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary stroke-black dark:stroke-primary" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-balance">Reputation-Gated Vault</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access yield by proving meaningful Web3 contributions through zkProofs and attestations
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-accent stroke-black dark:stroke-accent" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-balance">Yield Donating Strategy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Powered by Uniswap v4 hooks that redirect protocol fees into an ERC-4626 vault
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary stroke-black dark:stroke-primary" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-balance">Builder-First Design</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built for developers, maintainers, and technical creators—not passive capital providers
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-accent stroke-black dark:stroke-accent" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-balance">Impact-Based Rewards</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dynamic yield scaling based on contributor impact via tokenized allocation mechanisms
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Verify Your Reputation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your GitHub, Talent Protocol builder score, and Self Protocol proof of humanity to validate your
                contributions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Receive BGT Tokens</h3>
              <p className="text-muted-foreground leading-relaxed">
                Once verified, automatically receive BuilderGate tokens based on your reputation score multiplier
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Access Yield & Trade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Stake tokens to earn yield from protocol fees, or swap them in the Builder/ETH pool
              </p>
            </div>
          </div>
        </div>

        {/* Verification Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Identity Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BuilderScoreCard score={builderScore} verified={allVerified} />

            {platforms.map((platform) => (
              <VerificationCard
                key={platform.id}
                title={platform.title}
                logo={platform.logo}
                endpoint={platform.endpoint}
                verified={verifications[platform.id as keyof typeof verifications]}
                onVerify={() => {
                  if (platform.id === "selfProtocol") {
                    setShowSelfModal(true)
                  } else {
                    setActiveModal(platform.id)
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Token Card */}
        <div className="max-w-2xl mx-auto">
          <TokenCard
            enabled={allVerified}
            balance={tokenBalance}
            onSwapClick={() => setShowSwapModal(true)}
            onVaultClick={() => setShowVaultModal(true)}
          />
        </div>

        {/* Verification Modals */}
        {platforms
          .filter((p) => p.id !== "selfProtocol")
          .map((platform) => (
            <VerificationModal
              key={platform.id}
              open={activeModal === platform.id}
              onOpenChange={(open) => !open && setActiveModal(null)}
              title={platform.title}
              endpoint={platform.endpoint}
              onSuccess={() => handleVerifySuccess(platform.id)}
            />
          ))}

        {/* Self Protocol Modal */}
        <SelfVerificationModal
          open={showSelfModal}
          onOpenChange={setShowSelfModal}
          onSuccess={() => handleVerifySuccess("selfProtocol")}
        />

        <TokenSwapModal
          open={showSwapModal}
          onOpenChange={setShowSwapModal}
          currentBalance={tokenBalance}
          onSwapComplete={handleSwapComplete}
        />

        <VaultModal
          open={showVaultModal}
          onOpenChange={setShowVaultModal}
          currentBalance={tokenBalance}
          onVaultAction={handleVaultAction}
        />
      </div>
    </main>
  )
}
