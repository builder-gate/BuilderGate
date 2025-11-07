"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Wallet, TrendingUp } from "lucide-react"

interface VaultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  onVaultAction: (action: "stake" | "unstake", amount: number) => void
}

export function VaultModal({ open, onOpenChange, currentBalance, onVaultAction }: VaultModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [vaultBalance] = useState(2500) // Available yield in the main vault
  const [earnedYield] = useState(150.75) // Earned yield rewards

  const handleWithdraw = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onVaultAction("unstake", Number.parseFloat(withdrawAmount))
    setWithdrawAmount("")
    setIsProcessing(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw from Vault</DialogTitle>
          <DialogDescription>Withdraw your earned yield to your wallet</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Main Vault Balance</span>
              <span className="font-semibold">{vaultBalance} BGT</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Earned Yield</span>
              <span className="font-semibold text-accent flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {earnedYield} BGT
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Wallet Balance</span>
              <span className="font-semibold">{currentBalance} BGT</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount to Withdraw</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              max={earnedYield}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setWithdrawAmount((earnedYield * 0.25).toFixed(2))}>
                25%
              </Button>
              <Button variant="outline" size="sm" onClick={() => setWithdrawAmount((earnedYield * 0.5).toFixed(2))}>
                50%
              </Button>
              <Button variant="outline" size="sm" onClick={() => setWithdrawAmount((earnedYield * 0.75).toFixed(2))}>
                75%
              </Button>
              <Button variant="outline" size="sm" onClick={() => setWithdrawAmount(earnedYield.toFixed(2))}>
                MAX
              </Button>
            </div>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={
              !withdrawAmount ||
              Number.parseFloat(withdrawAmount) <= 0 ||
              Number.parseFloat(withdrawAmount) > earnedYield ||
              isProcessing
            }
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Withdrawal...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Withdraw to Wallet
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
