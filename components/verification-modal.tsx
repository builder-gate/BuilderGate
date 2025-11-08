"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, Github } from "lucide-react"

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
  const [proofData, setProofData] = useState<any>(null)

  const isGitHub = title === "GitHub"

  // Listen for OAuth callback messages
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Security: verify origin in production
      if (event.data.type === 'github-auth-success') {
        console.log('✅ GitHub OAuth success:', event.data.data)
        setStatus("verifying")
        setMessage("Processing GitHub verification...")

        try {
          // Send OAuth data to backend
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ githubData: event.data.data })
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
              setProofData(null)
            }, 2000)
          } else {
            setStatus("error")
            setMessage(data.message || "Verification failed")
          }
        } catch (err) {
          console.error('Error processing GitHub data:', err)
          setStatus("error")
          setMessage("Failed to process GitHub verification")
        }
      } else if (event.data.type === 'github-auth-error') {
        console.error('❌ GitHub OAuth error:', event.data.error)
        setStatus("error")
        setMessage(`GitHub authentication failed: ${event.data.error}`)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [endpoint, onSuccess, onOpenChange])

  const handleGitHubOAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    if (!clientId) {
      setStatus("error")
      setMessage("GitHub OAuth not configured")
      return
    }

    setStatus("verifying")
    setMessage("Opening GitHub authentication...")

    const redirectUri = `${window.location.origin}/api/auth/github/callback`
    const scope = 'read:user user:email'
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`

    // Open popup window
    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    window.open(
      authUrl,
      'github-auth',
      `width=${width},height=${height},left=${left},top=${top}`
    )
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setStatus("idle")
      setMessage("")
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
            {status === "idle" && "Connect your GitHub account to verify ownership"}
            {status === "verifying" && "Verifying your credentials..."}
            {status === "success" && "Successfully verified!"}
            {status === "error" && "Verification failed"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {status === "idle" && isGitHub && (
            <Button
              onClick={handleGitHubOAuth}
              size="lg"
              className="w-full bg-[#24292e] hover:bg-[#1b1f23] text-white font-bold text-lg py-6 flex items-center justify-center gap-2"
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </Button>
          )}

          {status === "verifying" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2
                className="w-20 h-20 text-black dark:text-primary animate-spin"
                style={{ color: "currentColor" }}
              />
              <p className="text-lg font-semibold">Verifying your account...</p>
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
