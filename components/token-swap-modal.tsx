"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRightLeft, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TokenSwapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  onSwapComplete: (newBalance: number) => void
}

export function TokenSwapModal({ open, onOpenChange, currentBalance, onSwapComplete }: TokenSwapModalProps) {
  const [fromToken, setFromToken] = useState("BGT")
  const [toToken, setToToken] = useState("USDC")
  const [amount, setAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)

  const exchangeRates: Record<string, Record<string, number>> = {
    BGT: { USDC: 0.5, ETH: 0.0002, BTC: 0.000005 },
    USDC: { BGT: 2, ETH: 0.0004, BTC: 0.00001 },
    ETH: { BGT: 5000, USDC: 2500, BTC: 0.025 },
    BTC: { BGT: 200000, USDC: 100000, ETH: 40 },
  }

  const calculateOutput = () => {
    const inputAmount = Number.parseFloat(amount) || 0
    const rate = exchangeRates[fromToken]?.[toToken] || 1
    return (inputAmount * rate).toFixed(6)
  }

  const handleSwap = async () => {
    setIsSwapping(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const inputAmount = Number.parseFloat(amount) || 0
    if (fromToken === "BGT") {
      // Deduct BGT from balance
      onSwapComplete(currentBalance - inputAmount)
    }

    setIsSwapping(false)
    onOpenChange(false)
    setAmount("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Token Swap</DialogTitle>
          <DialogDescription>Exchange your tokens for other cryptocurrencies</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* From Token */}
          <div className="space-y-2">
            <Label htmlFor="from-token">From</Label>
            <div className="flex gap-2">
              <Input
                id="from-token"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BGT">BGT</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: {fromToken === "BGT" ? currentBalance : "0"} {fromToken}
            </p>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-2">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label htmlFor="to-token">To</Label>
            <div className="flex gap-2">
              <Input
                id="to-token"
                type="number"
                placeholder="0.00"
                value={calculateOutput()}
                readOnly
                className="flex-1 bg-muted"
              />
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="BGT">BGT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              1 {fromToken} = {exchangeRates[fromToken]?.[toToken] || 0} {toToken}
            </p>
          </div>

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={
              !amount || Number.parseFloat(amount) <= 0 || Number.parseFloat(amount) > currentBalance || isSwapping
            }
            className="w-full"
          >
            {isSwapping ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Swapping...
              </>
            ) : (
              "Swap Tokens"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
