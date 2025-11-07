"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2 } from "lucide-react"

interface VerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  endpoint: string
  onSuccess: (data?: any) => void
}

export function VerificationModal({ open, onOpenChange, title, endpoint, onSuccess }: VerificationModalProps) {
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [proofData, setProofData] = useState<any>(null)

  const handleVerify = async () => {
    if (!username.trim()) {
      setStatus("error")
      setMessage("Please enter a username")
      return
    }

    setStatus("verifying")
    setMessage("")

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim() })
      })
      const data = await res.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
        setProofData(data.data)
        onSuccess(data.data)

        // Auto-close after success animation
        setTimeout(() => {
          onOpenChange(false)
          setStatus("idle")
          setUsername("")
          setProofData(null)
        }, 2000)
      } else {
        setStatus("error")
        setMessage(data.message || "Verification failed")
      }
    } catch {
      setStatus("error")
      setMessage("Network error occurred")
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setStatus("idle")
      setMessage("")
      setUsername("")
      setProofData(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {status === "idle" && "Enter your username to start verification"}
            {status === "verifying" && "Verifying your credentials..."}
            {status === "success" && "Successfully verified!"}
            {status === "error" && "Verification failed"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {status === "idle" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder={`Enter your ${title === "GitHub" ? "GitHub" : "GitHub"} username`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleVerify}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6"
              >
                Verify Now
              </Button>
            </>
          )}

          {status === "verifying" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2
                className="w-20 h-20 text-black dark:text-primary animate-spin"
                style={{ color: "currentColor" }}
              />
              <p className="text-lg font-semibold">Verifying {username}...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="relative">
                <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-500 animate-in zoom-in duration-500" />
              </div>
              <p className="text-lg font-semibold text-green-600 dark:text-green-500">{message}</p>
              {proofData && (
                <div className="mt-4 p-4 bg-muted rounded-lg w-full">
                  <p className="text-sm font-medium mb-2">Verification Details:</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Username: <span className="font-medium text-foreground">{proofData.username}</span></p>
                    {proofData.rank && <p>Rank: <span className="font-medium text-foreground">{proofData.rank}</span></p>}
                    {proofData.points !== undefined && <p>Points: <span className="font-medium text-foreground">{proofData.points}</span></p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <span className="text-4xl text-red-600 dark:text-red-500">✕</span>
              </div>
              <p className="text-lg font-semibold text-red-600 dark:text-red-500">{message}</p>
              <Button
                onClick={() => setStatus("idle")}
                variant="outline"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
