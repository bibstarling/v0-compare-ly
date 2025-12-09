"use client"

import { useEffect } from "react"

interface RunningComparisonProps {
  models: Array<{ id: string; name: string; provider: string }>
  onComplete: () => void
}

export function RunningComparison({ models, onComplete }: RunningComparisonProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-4">
          <div className="h-32 w-12 animate-pulse rounded-xl bg-primary/20" />
          <div className="h-32 w-12 animate-pulse rounded-xl bg-accent/20" style={{ animationDelay: "150ms" }} />
        </div>
        <div className="text-center">
          <h2 className="mb-2 text-xl font-medium">Comparing responses...</h2>
          <p className="text-sm text-muted-foreground">Testing {models.length} models across multiple prompts</p>
        </div>
      </div>
    </div>
  )
}
