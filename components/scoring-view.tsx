"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Star, Sparkles, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

interface ScoringViewProps {
  models: Array<{ id: string; name: string; provider: string }>
  prompts: string[]
  responses: Record<string, Record<string, { text: string; time: string; tokens: number; cost: string }>>
  onViewResults: (ratings: any) => void
  onBack: () => void
  aiEvaluatorEnabled: boolean
  aiEvaluatorModel: string
}

const RATING_DIMENSIONS = [
  {
    id: "correctness",
    label: "Correctness",
    description: "How factually correct and reliable is the response?",
  },
  {
    id: "clarity",
    label: "Clarity",
    description: "How well-written, understandable, and organized is the response?",
  },
  {
    id: "relevance",
    label: "Relevance",
    description: "Does the answer meaningfully address the prompt?",
  },
]

export function ScoringView({
  models,
  prompts,
  responses,
  onViewResults,
  onBack,
  aiEvaluatorEnabled,
  aiEvaluatorModel,
}: ScoringViewProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [ratings, setRatings] = useState<Record<string, Record<string, Record<string, number>>>>({})
  const [hallucinationFlags, setHallucinationFlags] = useState<Record<string, Record<string, boolean>>>({})
  const [aiScores, setAiScores] = useState<Record<string, Record<string, Record<string, number>>>>({})
  const [showAiScores, setShowAiScores] = useState(false)
  const [currentModelIndex, setCurrentModelIndex] = useState(0)

  const currentPrompt = prompts[currentPromptIndex]
  const currentModel = models[currentModelIndex]

  useEffect(() => {
    if (aiEvaluatorEnabled) {
      const scores: Record<string, Record<string, Record<string, number>>> = {}

      prompts.forEach((_, promptIdx) => {
        const promptKey = `prompt-${promptIdx}`
        scores[promptKey] = {}
        models.forEach((model) => {
          scores[promptKey][model.id] = {
            correctness: Math.floor(Math.random() * 2) + 4,
            clarity: Math.floor(Math.random() * 2) + 4,
            relevance: Math.floor(Math.random() * 2) + 4,
          }
        })
      })

      console.log("[v0] Generated AI scores:", scores)
      setAiScores(scores)
    }
  }, [aiEvaluatorEnabled, models, prompts])

  const setRating = (modelId: string, dimension: string, value: number) => {
    const promptKey = `prompt-${currentPromptIndex}`
    setRatings((prev) => ({
      ...prev,
      [promptKey]: {
        ...prev[promptKey],
        [modelId]: {
          ...prev[promptKey]?.[modelId],
          [dimension]: value,
        },
      },
    }))
  }

  const getRating = (modelId: string, dimension: string) => {
    const promptKey = `prompt-${currentPromptIndex}`
    return ratings[promptKey]?.[modelId]?.[dimension] || 0
  }

  const toggleHallucinationFlag = (modelId: string) => {
    const promptKey = `prompt-${currentPromptIndex}`
    const isCurrentlyFlagged = hallucinationFlags[promptKey]?.[modelId] || false

    setHallucinationFlags((prev) => ({
      ...prev,
      [promptKey]: {
        ...prev[promptKey],
        [modelId]: !isCurrentlyFlagged,
      },
    }))

    if (!isCurrentlyFlagged) {
      setRatings((prev) => ({
        ...prev,
        [promptKey]: {
          ...prev[promptKey],
          [modelId]: {
            correctness: 0,
            clarity: 0,
            relevance: 0,
          },
        },
      }))
    }
  }

  const getHallucinationFlag = (modelId: string) => {
    const promptKey = `prompt-${currentPromptIndex}`
    return hallucinationFlags[promptKey]?.[modelId] || false
  }

  const currentModelRated = () => {
    const isMarkedIncorrect = getHallucinationFlag(currentModel.id)
    if (isMarkedIncorrect) {
      return true
    }

    return RATING_DIMENSIONS.every((dim) => getRating(currentModel.id, dim.id) > 0)
  }

  const handleNext = () => {
    // If there are more models to rate for the current prompt
    if (currentModelIndex < models.length - 1) {
      setCurrentModelIndex(currentModelIndex + 1)
    }
    // If all models rated, move to next prompt
    else if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1)
      setCurrentModelIndex(0)
      setShowAiScores(false)
    }
    // If all prompts and models done, go to results
    else {
      onViewResults({ ratings, hallucinationFlags, aiScores })
    }
  }

  const getNextButtonText = () => {
    if (currentModelIndex < models.length - 1) {
      return "Next Model"
    } else if (currentPromptIndex < prompts.length - 1) {
      return "Next Prompt"
    } else {
      return "Results"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Logo size={28} className="rounded-lg" />
            <span className="font-semibold text-foreground">
              Compare<span className="text-primary">LY</span>
            </span>
          </div>
        </div>
        <div className="ml-12">
          <p className="text-xs text-muted-foreground">
            Prompt {currentPromptIndex + 1} of {prompts.length}
          </p>
        </div>
      </header>

      {/* Model Switcher Tabs */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {models.map((model, idx) => (
            <Button
              key={model.id}
              variant={currentModelIndex === idx ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentModelIndex(idx)}
              className="flex-shrink-0"
            >
              {model.name || model.id}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Prompt */}
        <Card className="p-3 mb-3 bg-muted/30">
          <p className="text-sm font-medium text-muted-foreground mb-1">PROMPT</p>
          <p className="text-foreground leading-relaxed">{currentPrompt}</p>
        </Card>

        {/* AI Evaluator (if enabled) */}
        {aiEvaluatorEnabled && (
          <Card className="mb-3 p-3 border-2 border-accent/50 bg-accent/5">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">AI Evaluator ({aiEvaluatorModel})</p>
                <p className="text-xs text-muted-foreground mb-3">Auto-scored all models for this prompt</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("[v0] Toggling AI scores. Current state:", showAiScores)
                    console.log("[v0] AI scores for current prompt:", aiScores[`prompt-${currentPromptIndex}`])
                    setShowAiScores(!showAiScores)
                  }}
                  className="text-xs"
                >
                  {showAiScores ? "Hide AI Scores" : "Reveal AI Scores"}
                </Button>
                {showAiScores && aiScores[`prompt-${currentPromptIndex}`]?.[currentModel.id] && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/30">
                    <p className="text-xs font-semibold text-accent mb-2">
                      AI Scores for {currentModel.name || currentModel.id}:
                    </p>
                    <div className="flex flex-col gap-1">
                      {RATING_DIMENSIONS.map((dimension) => {
                        const aiScore = aiScores[`prompt-${currentPromptIndex}`]?.[currentModel.id]?.[dimension.id]
                        return (
                          <div key={dimension.id} className="flex items-center justify-between text-xs">
                            <span className="text-foreground">{dimension.label}</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn("h-3 w-3 text-accent", star <= (aiScore || 0) && "fill-current")}
                                />
                              ))}
                              <span className="ml-1 text-accent font-medium">{aiScore}/5</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Model Rating - Show only current model */}
        {currentModel &&
          (() => {
            const promptKey = `prompt-${currentPromptIndex}`
            const response = responses[currentModel.id]?.[promptKey]
            if (!response) return null

            const isHallucinated = getHallucinationFlag(currentModel.id)
            const modelAiScores = aiScores[promptKey]?.[currentModel.id]

            return (
              <Card key={currentModel.id} className="p-3 border-2">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{currentModel.name || currentModel.id}</h3>
                      <p className="text-xs text-muted-foreground">{currentModel.provider}</p>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg mb-3">
                    <p className="text-sm text-foreground leading-relaxed">{response.text}</p>
                  </div>
                </div>

                {/* Rating Dimensions */}
                <div className="space-y-3">
                  {RATING_DIMENSIONS.map((dimension) => {
                    const currentRating = getRating(currentModel.id, dimension.id)
                    const aiScore = modelAiScores?.[dimension.id]

                    return (
                      <div key={dimension.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{dimension.label}</p>
                            <p className="text-xs text-muted-foreground">{dimension.description}</p>
                            {aiEvaluatorEnabled && showAiScores && aiScore && (
                              <p className="text-xs text-accent mt-1">AI Score: {aiScore}/5</p>
                            )}
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">
                            {currentRating > 0 ? `${currentRating}/5` : ""}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              onClick={() => setRating(currentModel.id, dimension.id, value)}
                              disabled={isHallucinated}
                              className={cn(
                                "flex-1 h-11 rounded-lg border-2 transition-all flex items-center justify-center",
                                isHallucinated && "opacity-40 cursor-not-allowed",
                                currentRating === value
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:border-primary/50",
                              )}
                            >
                              <Star className={cn("h-4 w-4", currentRating >= value ? "fill-current" : "")} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => toggleHallucinationFlag(currentModel.id)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all text-sm font-medium",
                      isHallucinated
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border hover:border-destructive/50 text-muted-foreground",
                    )}
                  >
                    <Flag className={cn("h-4 w-4", isHallucinated && "fill-current")} />
                    {isHallucinated ? "Marked as incorrect" : "Mark as incorrect (hallucination)"}
                  </button>
                </div>
              </Card>
            )
          })()}

        {/* Swipe hint */}
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">Swipe or use the tabs above to compare models</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card px-4 py-3">
        <Button onClick={handleNext} disabled={!currentModelRated()} className="w-full min-h-[44px]" size="lg">
          {getNextButtonText()}
        </Button>
        {!currentModelRated() && (
          <p className="text-xs text-center text-muted-foreground mt-1.5">Rate this model to continue</p>
        )}
      </div>
    </div>
  )
}
