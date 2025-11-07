"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationCardProps {
  title: string
  logo: string
  endpoint: string
  verified: boolean
  onVerify: () => void
}

export function VerificationCard({ title, logo, endpoint, verified, onVerify }: VerificationCardProps) {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300", verified && "border-accent")}>
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="relative w-20 h-20 rounded-xl bg-card flex items-center justify-center p-3 border">
          <Image src={logo || "/placeholder.svg"} alt={title} width={60} height={60} className="object-contain" />
          {verified && (
            <div className="absolute -top-1 -right-1 bg-accent rounded-full p-1">
              <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{verified ? "Verified" : "Not verified"}</p>
        </div>

        <Button
          onClick={onVerify}
          disabled={verified}
          className={cn("w-full", verified && "opacity-50 cursor-not-allowed")}
        >
          {verified ? "Verified" : "Verify Now"}
        </Button>
      </CardContent>
    </Card>
  )
}
