"use client"

import { useState } from "react"
import { useSelf } from "@/contexts/SelfContext"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, Shield, Copy, QrCode } from "lucide-react"
import { SelfQRcodeWrapper } from "@selfxyz/qrcode"

interface SelfVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SelfVerificationModal({ open, onOpenChange, onSuccess }: SelfVerificationModalProps) {
  const {
    isVerified,
    verificationData,
    isVerifying,
    error,
    universalLink,
    selfApp,
    initiateSelfVerification,
    clearVerification,
  } = useSelf()

  const [showQR, setShowQR] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)
  const [hasTriggeredSuccess, setHasTriggeredSuccess] = useState(false)

  const copyToClipboard = () => {
    if (!universalLink) return

    navigator.clipboard.writeText(universalLink)
      .then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      })
      .catch((err) => {
        console.error('Failed to copy:', err)
      })
  }

  const handleSuccess = () => {
    if (hasTriggeredSuccess) return
    setHasTriggeredSuccess(true)
    onSuccess()
    setTimeout(() => {
      onOpenChange(false)
      setHasTriggeredSuccess(false)
    }, 1500)
  }

  // Auto-close on successful verification
  if (isVerified && verificationData && !hasTriggeredSuccess) {
    handleSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Self Protocol Verification
          </DialogTitle>
          <DialogDescription>
            {isVerified
              ? "Successfully verified!"
              : isVerifying
              ? "Complete verification in Self app"
              : "Privacy-preserving identity verification"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 gap-4">
          {/* Error State */}
          {error && !isVerifying && (
            <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success State */}
          {isVerified && verificationData && (
            <>
              <div className="relative">
                <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-500 animate-in zoom-in duration-500" />
              </div>
              <div className="space-y-2 text-sm w-full">
                {verificationData.date_of_birth && (
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span className="font-medium">{verificationData.date_of_birth}</span>
                  </div>
                )}
                {verificationData.name && (
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{verificationData.name}</span>
                  </div>
                )}
                {verificationData.nationality && (
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-muted-foreground">Nationality:</span>
                    <span className="font-medium">{verificationData.nationality}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Verifying State */}
          {isVerifying && !isVerified && (
            <>
              <Loader2
                className="w-20 h-20 text-black dark:text-primary animate-spin"
                style={{ color: "currentColor" }}
              />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Processing verification...</p>
                <p className="text-sm text-muted-foreground">
                  This may take up to 5 minutes. Keep this window open.
                </p>
              </div>
            </>
          )}

          {/* QR Code Display */}
          {!isVerified && !isVerifying && showQR && selfApp && (
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-white p-4 rounded-lg border">
                <SelfQRcodeWrapper
                  selfApp={selfApp}
                  onSuccess={() => {
                    console.log('QR verification successful')
                    // Trigger the verification flow - this will mark the card as verified
                    handleSuccess()
                  }}
                  onError={(err) => {
                    console.error('QR verification error:', err)
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan with Self Protocol mobile app
              </p>
            </div>
          )}

          {/* Idle State - Show action buttons */}
          {!isVerified && !isVerifying && !showQR && (
            <>
              <Button
                onClick={initiateSelfVerification}
                disabled={!universalLink}
                className="w-full"
                size="lg"
              >
                <Shield className="mr-2 h-4 w-4" />
                Open Self App
              </Button>

              {universalLink && (
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    {linkCopied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    onClick={() => setShowQR(true)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <QrCode className="mr-2 h-3 w-3" />
                    Show QR
                  </Button>
                </div>
              )}

              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>
                  Self Protocol uses zero-knowledge proofs to verify your identity
                  without exposing personal data.
                </p>
                <p className="font-medium">
                  Minimum age: 18 years old
                </p>
              </div>
            </>
          )}

          {/* Show QR state - hide QR button */}
          {!isVerified && !isVerifying && showQR && (
            <Button
              onClick={() => setShowQR(false)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Hide QR Code
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
