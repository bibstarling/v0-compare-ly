"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

interface TutorialScreenProps {
  onComplete: () => void
}

const slides = [
  {
    title: "How CompareLY Works",
    subtitle: "Compare models side by side with the same prompt.",
    type: "visual" as const,
    example: {
      prompt: "Write a Python function to sort a list",
      models: [
        {
          name: "Claude 3.5 Sonnet",
          response: "Uses merge sort algorithm with O(n log n) complexity",
          highlight: "green" as const,
        },
        {
          name: "GPT-4o Mini",
          response: "Simple bubble sort implementation with O(n²) complexity",
          highlight: "yellow" as const,
        },
      ],
    },
  },
  {
    title: "Rate and Evaluate",
    subtitle: "Score responses on correctness, clarity, creativity, and behavior.",
    type: "rating" as const,
    metrics: [
      { label: "Correctness", value: 5 },
      { label: "Clarity", value: 4 },
      { label: "Creativity", value: 5 },
      { label: "Safety", value: 5 },
    ],
  },
  {
    title: "Choose the Best Model",
    subtitle: "CompareLY helps you pick the right model for your task.",
    type: "results" as const,
    winner: {
      name: "GPT-4o",
      reason: "Best for speed + clarity",
      stats: [
        { label: "Accuracy", value: "95%" },
        { label: "Speed", value: "2.1s" },
        { label: "Cost", value: "$0.002" },
      ],
    },
  },
]

export function TutorialScreen({ onComplete }: TutorialScreenProps) {
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
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-semibold text-foreground leading-tight text-balance">{slide.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed text-balance">{slide.subtitle}</p>
        </div>

        {slide.type === "visual" && slide.example && (
          <div className="w-full max-w-md space-y-4">
            <Card className="p-4 border border-border bg-muted/30">
              <div className="text-xs text-muted-foreground mb-2">Prompt</div>
              <div className="text-sm text-foreground">{slide.example.prompt}</div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              {slide.example.models.map((model, idx) => (
                <Card
                  key={idx}
                  className={`p-4 border ${
                    model.highlight === "green"
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-yellow-500/50 bg-yellow-500/5"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground mb-2">{model.name}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{model.response}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {slide.type === "rating" && slide.metrics && (
          <Card className="w-full max-w-sm p-6 border border-border">
            <div className="space-y-4">
              {slide.metrics.map((metric, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                    <span className="text-sm font-medium text-foreground">{metric.value}/5</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`h-6 w-6 rounded-full ${star <= metric.value ? "bg-primary" : "bg-border"}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {slide.type === "results" && slide.winner && (
          <Card className="w-full max-w-sm p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Winner</div>
                <div className="text-lg font-semibold text-foreground">{slide.winner.name}</div>
                <div className="text-xs text-muted-foreground">{slide.winner.reason}</div>
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-border">
              {slide.winner.stats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <span className="text-sm font-medium text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-2 pt-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <Button onClick={handleNext} className="w-full min-h-[44px]">
        {currentSlide < slides.length - 1 ? (
          <>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </>
        ) : (
          "Let's Start"
        )}
      </Button>
    </div>
  )
}
