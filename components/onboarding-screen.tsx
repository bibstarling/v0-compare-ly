"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, Check, Clock, FileText, DollarSign, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OnboardingScreenProps {
  onComplete: () => void
}

const slides = [
  {
    emoji: "🎯",
    title: "Why Compare AI Models?",
    subtitle:
      "Not all AI models behave the same. Even with the exact same prompt, results can vary a lot in quality, speed, and cost. Comparing models side-by-side helps you quickly understand which one fits your work best.",
    type: "intro" as const,
    footer: "The right model saves you time, money, and effort — every single day.",
  },
  {
    emoji: "⚡",
    title: "Select Models to Compare",
    subtitle: "Choose from leading AI providers and their latest models. Compare as many as you want side-by-side.",
    type: "models" as const,
    footer: "Add your own API keys to unlock even more models.",
  },
  {
    emoji: "💬",
    title: "Test with Real Prompts",
    subtitle: "Add your actual prompts to see how each model responds. Compare outputs, speed, and cost in real-time.",
    type: "prompt" as const,
    footer: "Use pre-built scenarios or create custom tests for your specific use case.",
  },
  {
    emoji: "📊",
    title: "Rate & Review Responses",
    subtitle:
      "Score each model on correctness, clarity, and relevance. Our AI evaluator also provides automated insights.",
    type: "scoring" as const,
    footer: "Your ratings help identify which model truly performs best for your needs.",
  },
  {
    emoji: "🏆",
    title: "See Clear Winners",
    subtitle: "Get comprehensive results showing top performers, detailed scores, and cost breakdowns for every test.",
    type: "results" as const,
    footer: "Export results as markdown or save to your history for future reference.",
  },
  {
    emoji: "➜",
    title: "Ready to Compare Models?",
    subtitle: "Start testing AI models with your real workflows and find the perfect fit for your needs.",
    type: "final" as const,
  },
]

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const slide = slides[currentSlide]

  return (
    <div className="flex h-full flex-col bg-background p-4">
      <div className="flex flex-1 flex-col items-center justify-center space-y-6">
        {slide.emoji && (
          <div className="text-5xl mb-2" role="img" aria-label="decoration">
            {slide.emoji}
          </div>
        )}

        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-semibold text-foreground leading-tight text-balance">{slide.title}</h2>
          {slide.subtitle && (
            <p className="text-sm text-muted-foreground leading-relaxed text-balance">{slide.subtitle}</p>
          )}
        </div>

        {slide.type === "intro" && (
          <div className="w-full max-w-sm space-y-3">
            <Card className="p-4 border border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">GPT-4o</span>
                <Badge variant="default" className="text-xs">
                  Best Overall
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">High accuracy, fast responses</p>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  1.2s
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  $0.003
                </span>
              </div>
            </Card>
            <Card className="p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Claude Sonnet</span>
                <Badge variant="secondary" className="text-xs">
                  High Cost
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Great reasoning, slower speed</p>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  2.8s
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  $0.008
                </span>
              </div>
            </Card>
          </div>
        )}

        {slide.type === "models" && (
          <div className="w-full max-w-sm space-y-3">
            {/* Provider Card */}
            <Card className="p-4 border-border hover:border-primary/30 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 0-.071 0l4.8303-2.7866a4.4992 4.4992 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">OpenAI</h3>
                    <Badge variant="default" className="text-xs font-normal">
                      2 selected
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Industry-leading models</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>

            {/* Model Cards */}
            <div className="ml-4 space-y-2 border-l-2 border-border pl-4">
              <Card className="p-3 border-primary/50 bg-primary/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">GPT-4o</h4>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        Latest
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Fast, accurate, cost-effective</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Fast
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Low
                      </span>
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                </div>
              </Card>

              <Card className="p-3 border-border hover:border-primary/30 bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">GPT-4o Mini</h4>
                    <p className="text-xs text-muted-foreground mb-2">Ultra-fast, ultra-affordable</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Very Fast
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Very Low
                      </span>
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-full border border-muted-foreground/20" />
                </div>
              </Card>
            </div>
          </div>
        )}

        {slide.type === "prompt" && (
          <div className="w-full max-w-sm space-y-3">
            <Card className="p-4 bg-muted/30 border-border">
              <div className="flex items-start gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prompt</p>
              </div>
              <p className="leading-relaxed text-foreground text-sm">
                Review this Python function and suggest improvements: def calculate_total(items): total = 0 for i in
                items: total = total + i['price'] return total
              </p>
            </Card>

            <Card className="p-4 border-2 border-primary/30 bg-primary/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">GPT-4o</h3>
                  <p className="text-xs text-muted-foreground">OpenAI</p>
                </div>
                <Badge variant="secondary">Complete</Badge>
              </div>
              <p className="leading-relaxed text-sm text-foreground mb-3">
                This function can be improved with list comprehension and error handling...
              </p>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Time</p>
                  <p className="font-mono text-xs font-semibold">1.3s</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Tokens</p>
                  <p className="font-mono text-xs font-semibold">145</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Cost</p>
                  <p className="font-mono text-xs font-semibold">$0.003</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {slide.type === "scoring" && (
          <Card className="w-full max-w-sm p-5 border border-border">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">GPT-4o</h3>
                <Badge variant="secondary" className="text-xs">
                  Score: 4.7/5
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Correctness</span>
                  <span className="text-sm font-semibold text-foreground">5/5</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Clarity</span>
                  <span className="text-sm font-semibold text-foreground">4/5</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "80%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Relevance</span>
                  <span className="text-sm font-semibold text-foreground">5/5</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">AI Evaluator Score</span>
                <Badge variant="default" className="text-xs">
                  4.8/5
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {slide.type === "results" && (
          <div className="w-full max-w-sm space-y-3">
            <Card className="p-5 border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Winner: GPT-4o</h3>
                  <p className="text-xs text-muted-foreground">Best overall performance</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">GPT-4o</h4>
                <span className="text-lg font-semibold text-primary">4.7/5</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5">Time</p>
                  <p className="font-mono font-semibold">1.3s</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Tokens</p>
                  <p className="font-mono font-semibold">145</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Cost</p>
                  <p className="font-mono font-semibold">$0.003</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">Claude Sonnet</h4>
                <span className="text-lg font-semibold">4.3/5</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5">Time</p>
                  <p className="font-mono font-semibold">2.8s</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Tokens</p>
                  <p className="font-mono font-semibold">167</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Cost</p>
                  <p className="font-mono font-semibold">$0.008</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {slide.type === "final" && (
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <ChevronRight className="h-10 w-10 text-primary" />
          </div>
        )}

        {slide.footer && (
          <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-sm px-4">{slide.footer}</p>
        )}

        <div className="flex gap-2 pt-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-border",
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {currentSlide < slides.length - 1 && (
          <Button variant="ghost" onClick={onComplete} className="flex-1 min-h-[44px]">
            Skip
          </Button>
        )}
        <Button onClick={handleNext} className="flex-1 min-h-[44px]">
          {currentSlide < slides.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  )
}
