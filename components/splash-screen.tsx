"use client"

import { useEffect } from "react"
import { Logo } from "@/components/logo"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 3500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
        <Logo size={80} />
        <div className="flex items-baseline gap-1">
          <h1 className="text-4xl font-semibold">Compare</h1>
          <h1 className="text-4xl font-semibold text-primary">LY</h1>
        </div>
        <p className="text-sm text-muted-foreground">Compare models. Find clarity.</p>
      </div>
      <div className="mt-12 h-1 w-24 animate-pulse rounded-full bg-primary/20" />
    </div>
  )
}
