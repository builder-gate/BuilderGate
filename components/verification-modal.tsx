"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"

interface VerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  endpoint: string
  onSuccess: () => void
}

export function VerificationModal({ open, onOpenChange, title, endpoint, onSuccess }: VerificationModalProps) {
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleVerify = async () => {
    setStatus("verifying")
    setMessage("")

    try {
      const res = await fetch(endpoint, { method: "POST" })
      const data = await res.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
        onSuccess()

        // Auto-close after success animation
        setTimeout(() => {
          onOpenChange(false)
          setStatus("idle")
        }, 1500)
      } else {
        setStatus("error")
        setMessage(data.message || "Verification failed")
      }
    } catch {
      setStatus("error")
      setMessage("Network error occurred")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {status === "idle" && "Click the button below to start verification"}
            {status === "verifying" && "Verifying your credentials..."}
            {status === "success" && "Successfully verified!"}
            {status === "error" && "Verification failed"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 gap-4">
          {status === "idle" && (
            <Button
              onClick={handleVerify}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6"
            >
              Verify Now
            </Button>
          )}

          {status === "verifying" && (
            <>
              <Loader2
                className="w-20 h-20 text-black dark:text-primary animate-spin"
                style={{ color: "currentColor" }}
              />
              <p className="text-lg font-semibold">Verifying...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="relative">
                <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-500 animate-in zoom-in duration-500" />
              </div>
              <p className="text-lg font-semibold text-green-600 dark:text-green-500">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <span className="text-4xl text-red-600 dark:text-red-500">✕</span>
              </div>
              <p className="text-lg font-semibold text-red-600 dark:text-red-500">{message}</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
