"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Logo } from "@/components/logo"

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col bg-background px-4 py-4">
      <div className="flex flex-1 flex-col items-center justify-center space-y-6 max-w-sm mx-auto w-full">
        <Logo size={72} />

        <div className="flex items-baseline gap-1">
          <h1 className="text-3xl font-semibold">Compare</h1>
          <h1 className="text-3xl font-semibold text-primary">LY</h1>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium text-foreground leading-tight text-balance">Welcome to CompareLY</h2>
          <p className="text-sm text-muted-foreground leading-relaxed text-balance">
            Compare AI models side by side and find the best one for your work.
          </p>
        </div>
      </div>

      <Button onClick={onGetStarted} className="w-full min-h-[48px]">
        Get Started
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}
