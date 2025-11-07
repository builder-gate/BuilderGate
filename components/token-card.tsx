"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, ArrowRightLeft, Vault } from "lucide-react"

interface TokenCardProps {
  enabled: boolean
  balance: number
  onSwapClick: () => void
  onVaultClick: () => void
}

export function TokenCard({ enabled, balance, onSwapClick, onVaultClick }: TokenCardProps) {
  return (
    <Card className={enabled ? "border-accent" : "opacity-50"}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-accent" />
          <CardTitle>BuilderGate Tokens</CardTitle>
        </div>
        <CardDescription>
          {enabled ? "Congratulations! You have received your tokens" : "Complete all verifications to receive tokens"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled && (
          <>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-3xl font-bold mt-1">{balance.toLocaleString()} BGT</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="default" className="w-full" onClick={onSwapClick} disabled={!enabled || balance <= 0}>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Token Swap
              </Button>

              <Button variant="outline" className="w-full bg-transparent" onClick={onVaultClick} disabled={!enabled}>
                <Vault className="w-4 h-4 mr-2" />
                Vault
              </Button>
            </div>
          </>
        )}

        {!enabled && (
          <div className="bg-muted rounded-lg p-8 text-center">
            <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Complete all 3 verifications to unlock your tokens</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
