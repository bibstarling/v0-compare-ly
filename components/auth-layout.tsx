"use client"

import type React from "react"
import { Logo } from "@/components/logo"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function AuthLayout({ children, title, subtitle, showBackButton, onBack }: AuthLayoutProps) {
  return (
    <div className="flex h-full flex-col bg-background overflow-y-auto">
      <div className="flex-1 flex flex-col">
        {showBackButton && onBack && (
          <div className="px-6 py-4 flex-shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Log In
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-6 py-8">
          <div className="mb-8 flex flex-col items-center gap-3 flex-shrink-0">
            <Logo size={56} className="rounded-xl" />
            <div className="flex items-baseline gap-1">
              <h1 className="text-2xl font-semibold">Compare</h1>
              <h1 className="text-2xl font-semibold text-primary">LY</h1>
            </div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground text-center">{subtitle}</p>}
          </div>

          <div className="flex-shrink-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
