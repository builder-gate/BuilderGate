"use client"

import { Trophy } from "lucide-react"

interface BuilderScoreCardProps {
  score: number
  verified: boolean
}

export function BuilderScoreCard({ score, verified }: BuilderScoreCardProps) {
  const baseScore = 100
  const displayScore = verified ? score : baseScore

  return (
    <div className="bg-card rounded-xl p-8 border-2 border-primary shadow-lg">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-primary [&>path]:stroke-black [&>path]:dark:stroke-current" />
        </div>

        <h3 className="text-2xl font-bold mb-2">BuilderGate Score</h3>

        <div className="text-6xl font-bold text-primary my-4">{displayScore}</div>
        <p className="text-sm text-muted-foreground">
          {verified
            ? "Your reputation score determines your yield multiplier and token allocation"
            : "Base score: 100. Complete verifications to increase your BuilderGate Score"}
        </p>
      </div>
    </div>
  )
}
