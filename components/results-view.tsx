"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Trophy,
  Clock,
  DollarSign,
  Download,
  ChevronRight,
  ChevronDown,
  Copy,
  Share2,
  Camera,
  ArrowLeft,
  Home,
  MessageCircle,
  Mail,
  FileText,
  Folder,
  Printer,
  MoreHorizontal,
  Scale,
  Equal,
  AlertTriangle,
  CheckCircle2,
  Zap,
  X,
  Sparkles,
} from "lucide-react"
import { Logo } from "@/components/logo"

interface ResultsViewProps {
  models: Array<{ id: string; name: string; provider: string }>
  prompts: string[]
  responses: Record<string, Record<string, any>>
  ratings: any
  aiEvaluatorScores?: any
  aiEvaluatorEnabled?: boolean
  aiEvaluatorModel?: string
  onBack: () => void
  onNewTest?: () => void
  onBackToHistory?: () => void
}

function FullResponseModal({
  isOpen,
  onClose,
  modelName,
  promptIndex,
  response,
  ratings,
  hasHallucination,
}: {
  isOpen: boolean
  onClose: () => void
  modelName: string
  promptIndex: number
  response: any
  ratings: { correctness: number; clarity: number; relevance: number }
  hasHallucination: boolean
}) {
  const { toast } = useToast()

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response?.text || "")
      toast({ title: "Copied to clipboard" })
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" })
    }
  }

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-3 py-2 flex items-center justify-between flex-shrink-0">
        <h2 className="text-sm font-semibold truncate">
          {modelName} — Prompt {promptIndex + 1}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Full response text */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
          {response?.text || "No response available"}
        </div>
      </div>

      {/* Metadata footer */}
      <div className="border-t border-border p-3 flex-shrink-0 space-y-2">
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {response?.time || "N/A"}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {response?.cost || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px]">
            Correctness {ratings.correctness.toFixed(1)}/5
          </Badge>
          <Badge variant="outline" className="text-[9px]">
            Clarity {ratings.clarity.toFixed(1)}/5
          </Badge>
          <Badge variant="outline" className="text-[9px]">
            Relevance {ratings.relevance.toFixed(1)}/5
          </Badge>
        </div>
        {hasHallucination && (
          <div className="flex items-center gap-1 text-red-500 text-[10px]">
            <AlertTriangle className="h-3 w-3" />
            Hallucination detected
          </div>
        )}
      </div>
    </div>
  )
}

export function ResultsView({
  models,
  prompts,
  responses,
  ratings,
  onBack,
  aiEvaluatorScores,
  aiEvaluatorEnabled,
  aiEvaluatorModel,
}: ResultsViewProps) {
  const [fullComparisonExpanded, setFullComparisonExpanded] = React.useState(false)
  const [expandedPrompts, setExpandedPrompts] = React.useState<Set<number>>(new Set())
  const [shareDrawerOpen, setShareDrawerOpen] = React.useState(false)
  const [screenshotting, setScreenshotting] = React.useState(false)
  const [localToast, setLocalToast] = React.useState<{ title: string; description?: string } | null>(null)
  const [markdownCopied, setMarkdownCopied] = React.useState(false)
  const [fullResponseModal, setFullResponseModal] = React.useState<{
    isOpen: boolean
    modelId: string
    modelName: string
    promptIndex: number
  } | null>(null)
  const { toast } = useToast()

  const togglePromptExpanded = (idx: number) => {
    setExpandedPrompts((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  const truncateResponse = (text: string, maxChars = 220) => {
    if (!text) return "No response"
    const lines = text.split("\n").slice(0, 5).join("\n")
    if (lines.length <= maxChars) return lines
    return lines.slice(0, maxChars) + "..."
  }

  const getRatingsForPrompt = (modelId: string, promptIndex: number) => {
    const promptKey = `prompt-${promptIndex}`
    const isHistoryView = !ratings?.ratings && typeof ratings === "object"

    if (isHistoryView) {
      return ratings[modelId] || { correctness: 0, clarity: 0, relevance: 0 }
    }
    return ratings?.ratings?.[promptKey]?.[modelId] || { correctness: 0, clarity: 0, relevance: 0 }
  }

  const getHallucinationForPrompt = (modelId: string, promptIndex: number) => {
    const promptKey = `prompt-${promptIndex}`
    const isHistoryView = !ratings?.ratings && typeof ratings === "object"

    if (isHistoryView) return false
    return ratings?.hallucinationFlags?.[promptKey]?.[modelId] || false
  }

  const getResponseForPrompt = (modelId: string, promptIndex: number) => {
    const promptKey = `prompt-${promptIndex}`
    return responses?.[modelId]?.[promptKey] || responses?.[modelId]?.[prompts[promptIndex]] || null
  }

  const modelScores = React.useMemo(() => {
    if (!models || !ratings) return []

    const isHistoryView = !ratings.ratings && typeof ratings === "object"

    return models
      .map((model) => {
        let totalCorrectness = 0
        let totalClarity = 0
        let totalRelevance = 0
        let hallucinationCount = 0
        let totalTime = 0
        let totalCost = 0
        let responseCount = 0

        prompts.forEach((prompt, idx) => {
          const promptKey = `prompt-${idx}`
          const response = responses?.[model.id]?.[promptKey] || responses?.[model.id]?.[prompt]

          let promptRatings
          let isHallucination = false

          if (isHistoryView) {
            promptRatings = ratings[model.id] || {}
          } else {
            promptRatings = ratings.ratings?.[promptKey]?.[model.id] || {}
            isHallucination = ratings.hallucinationFlags?.[promptKey]?.[model.id] || false
          }

          if (response || promptRatings.correctness) {
            totalCorrectness += promptRatings.correctness || 0
            totalClarity += promptRatings.clarity || 0
            totalRelevance += promptRatings.relevance || 0
            if (isHallucination) hallucinationCount++
            totalTime += Number.parseFloat(response?.time || "0")
            totalCost += Number.parseFloat((response?.cost || "$0").replace("$", ""))
            responseCount++
          }
        })

        const count = responseCount || 1
        const avgCorrectness = totalCorrectness / count
        const avgClarity = totalClarity / count
        const avgRelevance = totalRelevance / count
        const overallScore = (avgCorrectness + avgClarity + avgRelevance) / 3

        return {
          id: model.id,
          name: model.name,
          provider: model.provider,
          score: overallScore,
          correctness: avgCorrectness,
          clarity: avgClarity,
          relevance: avgRelevance,
          hallucinationCount,
          hallucinationRate: responseCount > 0 ? Math.round((hallucinationCount / responseCount) * 100) : 0,
          time: totalTime / count,
          timeStr: (totalTime / count).toFixed(2) + "s",
          cost: totalCost / count,
          costStr: "$" + (totalCost / count).toFixed(4),
          responseCount,
        }
      })
      .filter((m) => m.responseCount > 0 || m.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [models, prompts, responses, ratings])

  const modelA = modelScores[0]
  const modelB = modelScores[1]

  const comparisonState = React.useMemo(() => {
    if (!modelA || !modelB) return { state: "single", winner: modelA }

    const scoreDiff = modelA.score - modelB.score

    if (scoreDiff === 0) {
      return { state: "tie", winner: null, diff: 0 }
    } else if (scoreDiff >= 0.3) {
      return { state: "clear-winner", winner: modelA, loser: modelB, diff: scoreDiff }
    } else {
      return { state: "too-close", winner: modelA, loser: modelB, diff: scoreDiff }
    }
  }, [modelA, modelB])

  const keyDifferences = React.useMemo(() => {
    if (!modelA || !modelB) return []

    const diffs: string[] = []
    const correctnessDiff = modelA.correctness - modelB.correctness
    const clarityDiff = modelA.clarity - modelB.clarity
    const relevanceDiff = modelA.relevance - modelB.relevance
    const timeDiff = modelA.time - modelB.time
    const hallucinationDiff = modelA.hallucinationCount - modelB.hallucinationCount

    if (Math.abs(correctnessDiff) >= 0.3) {
      const better = correctnessDiff > 0 ? modelA.name : modelB.name
      diffs.push(`${better} is stronger in correctness (+${Math.abs(correctnessDiff).toFixed(1)})`)
    }

    if (Math.abs(clarityDiff) >= 0.3) {
      const better = clarityDiff > 0 ? modelA.name : modelB.name
      diffs.push(`${better} provides clearer responses (+${Math.abs(clarityDiff).toFixed(1)})`)
    }

    if (Math.abs(relevanceDiff) >= 0.3) {
      const better = relevanceDiff > 0 ? modelA.name : modelB.name
      diffs.push(`${better} is more relevant (+${Math.abs(relevanceDiff).toFixed(1)})`)
    }

    if (Math.abs(timeDiff) >= 0.3) {
      const faster = timeDiff < 0 ? modelA.name : modelB.name
      diffs.push(`${faster} responded faster (${Math.abs(timeDiff).toFixed(2)}s difference)`)
    }

    if (hallucinationDiff !== 0) {
      if (modelA.hallucinationCount === 0 && modelB.hallucinationCount > 0) {
        diffs.push(`${modelA.name} had no hallucinations`)
      } else if (modelB.hallucinationCount === 0 && modelA.hallucinationCount > 0) {
        diffs.push(`${modelB.name} had no hallucinations`)
      } else if (hallucinationDiff < 0) {
        diffs.push(`${modelA.name} hallucinated less`)
      } else {
        diffs.push(`${modelB.name} hallucinated less`)
      }
    }

    if (diffs.length === 0) {
      diffs.push("Both models performed similarly across all dimensions")
    }

    return diffs.slice(0, 3)
  }, [modelA, modelB])

  const aiEvaluatorAggregated = React.useMemo(() => {
    if (!aiEvaluatorScores?.scores || !aiEvaluatorEnabled) return null

    const scores = aiEvaluatorScores.scores
    const modelTotals: Record<string, { correctness: number; clarity: number; relevance: number; count: number }> = {}

    // Aggregate scores per model across all prompts
    Object.keys(scores).forEach((promptKey) => {
      const promptScores = scores[promptKey]
      if (promptScores) {
        Object.keys(promptScores).forEach((modelId) => {
          const modelScore = promptScores[modelId]
          if (!modelTotals[modelId]) {
            modelTotals[modelId] = { correctness: 0, clarity: 0, relevance: 0, count: 0 }
          }
          modelTotals[modelId].correctness += modelScore.correctness || 0
          modelTotals[modelId].clarity += modelScore.clarity || 0
          modelTotals[modelId].relevance += modelScore.relevance || 0
          modelTotals[modelId].count += 1
        })
      }
    })

    // Calculate averages and overall score
    const results = Object.entries(modelTotals)
      .map(([modelId, totals]) => {
        const count = totals.count || 1
        const correctness = totals.correctness / count
        const clarity = totals.clarity / count
        const relevance = totals.relevance / count
        const overall = (correctness + clarity + relevance) / 3
        const modelInfo = models.find((m) => m.id === modelId)
        return {
          modelId,
          modelName: modelInfo?.name || modelId,
          correctness,
          clarity,
          relevance,
          overall,
        }
      })
      .sort((a, b) => b.overall - a.overall)

    return results
  }, [aiEvaluatorScores, aiEvaluatorEnabled, models])

  const generateMarkdown = () => {
    const timestamp = new Date().toLocaleString()
    let markdown = `# AI Model Comparison Results\n\n`
    markdown += `*Generated on ${timestamp}*\n\n`

    if (modelA && comparisonState) {
      markdown += `## Top Performer\n\n`
      if (comparisonState.winner) {
        markdown += `**${comparisonState.winner.name}** - Score: ${comparisonState.winner.score.toFixed(1)}/5.0\n\n`
      } else {
        markdown += `**Tie** - Both models performed equally\n\n`
      }
    }

    markdown += `## Model Performance\n\n`
    markdown += `| Model | Overall | Correctness | Clarity | Relevance | Hallucination | Time | Cost |\n`
    markdown += `|-------|---------|-------------|---------|-----------|---------------|------|------|\n`

    modelScores.forEach((result) => {
      markdown += `| ${result.name} | ${result.score.toFixed(1)}/5.0 | ${result.correctness.toFixed(1)} | ${result.clarity.toFixed(1)} | ${result.relevance.toFixed(1)} | ${result.hallucinationRate}% | ${result.timeStr} | ${result.costStr} |\n`
    })

    if (aiEvaluatorAggregated) {
      markdown += `\n## AI Evaluator Scores\n\n`
      markdown += `| Model | Correctness | Clarity | Relevance | Overall |\n`
      markdown += `|-------|-------------|---------|-----------|---------|\n`
      aiEvaluatorAggregated.forEach((result) => {
        markdown += `| ${result.modelName} | ${result.correctness.toFixed(1)} | ${result.clarity.toFixed(1)} | ${result.relevance.toFixed(1)} | ${result.overall.toFixed(1)} |\n`
      })
    }

    markdown += `\n---\n\n*Generated by CompareLY*\n`
    return markdown
  }

  const handleCopyMarkdown = async () => {
    const markdown = generateMarkdown()
    try {
      await navigator.clipboard.writeText(markdown)
      setMarkdownCopied(true)
      setTimeout(() => setMarkdownCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleExportMarkdown = () => {
    const markdown = generateMarkdown()
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `comparison-results-${timestamp}.md`

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    setShareDrawerOpen(true)
  }

  const handleShareAction = async (action: string) => {
    const markdown = generateMarkdown()
    await navigator.clipboard.writeText(markdown)
    setShareDrawerOpen(false)
    toast({ title: `Shared via ${action}` })
  }

  const handleScreenshot = () => {
    setScreenshotting(true)
    setTimeout(() => {
      setScreenshotting(false)
    }, 400)
    setTimeout(() => {
      setLocalToast({
        title: "Screenshot captured",
        description: "Your results have been captured successfully",
      })
      // Auto-dismiss after 3 seconds
      setTimeout(() => setLocalToast(null), 3000)
    }, 500)
  }

  if (!modelScores.length) {
    return (
      <div className="flex flex-col h-full">
        {/* Standardized header padding */}
        <header className="border-b border-border bg-card px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size={26} />
            <span className="font-semibold text-foreground text-sm">
              Compare<span className="text-primary">LY</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground ml-9">Comparison Results</p>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">No Results Yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Complete a comparison to see detailed results and performance metrics.
            </p>
            <Button onClick={onBack} size="lg">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Local Toast - single instance at top */}
      {localToast && (
        <div className="absolute bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-foreground text-background rounded-lg p-3 shadow-lg flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{localToast.title}</p>
              {localToast.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{localToast.description}</p>
              )}
            </div>
            <button
              onClick={() => setLocalToast(null)}
              className="flex-shrink-0 text-muted-foreground hover:text-background transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Share Drawer Overlay */}
      {shareDrawerOpen && (
        <div
          className="absolute inset-0 bg-black/40 z-40 animate-in fade-in duration-300"
          onClick={() => setShareDrawerOpen(false)}
        />
      )}

      {/* Screenshot overlay */}
      {screenshotting && <div className="absolute inset-0 bg-white pointer-events-none z-50" />}

      {fullResponseModal?.isOpen && (
        <FullResponseModal
          isOpen={true}
          onClose={() => setFullResponseModal(null)}
          modelName={fullResponseModal.modelName}
          promptIndex={fullResponseModal.promptIndex}
          response={getResponseForPrompt(fullResponseModal.modelId, fullResponseModal.promptIndex)}
          ratings={getRatingsForPrompt(fullResponseModal.modelId, fullResponseModal.promptIndex)}
          hasHallucination={getHallucinationForPrompt(fullResponseModal.modelId, fullResponseModal.promptIndex)}
        />
      )}

      {/* Standardized header padding (results with data) */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Logo size={26} className="rounded-lg" />
          <span className="font-semibold text-foreground text-sm">
            Compare<span className="text-primary">LY</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground ml-9">Comparison Results</p>
      </header>

      {/* Standardized content padding */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* 1. COMPARISON SUMMARY BLOCK */}
        {modelA && (
          <Card
            className={cn(
              "p-3 mb-3",
              // Updated dark mode colors for better contrast
              comparisonState.state === "clear-winner" &&
                "bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/40 dark:to-blue-950/20 border-blue-200 dark:border-blue-700",
              comparisonState.state === "too-close" &&
                "bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/40 dark:to-gray-900/20 border-gray-200 dark:border-gray-600",
              comparisonState.state === "tie" && "bg-muted/30 border-border",
            )}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  comparisonState.state === "clear-winner" && "bg-primary",
                  comparisonState.state === "too-close" && "bg-muted-foreground/30",
                  comparisonState.state === "tie" && "bg-muted-foreground/20",
                )}
              >
                {comparisonState.state === "clear-winner" && <Trophy className="h-4 w-4 text-primary-foreground" />}
                {comparisonState.state === "too-close" && <Scale className="h-4 w-4 text-muted-foreground" />}
                {comparisonState.state === "tie" && <Equal className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="mb-1 text-[10px] px-1.5 py-0">
                  {comparisonState.state === "clear-winner" && "Top Performer"}
                  {comparisonState.state === "too-close" && "Very Close"}
                  {comparisonState.state === "tie" && "Tie"}
                </Badge>
                <h2 className="text-sm font-bold text-foreground">
                  {comparisonState.state === "clear-winner" && `${modelA.name} wins`}
                  {comparisonState.state === "too-close" && "Models performed similarly"}
                  {comparisonState.state === "tie" && "Identical scores"}
                </h2>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {comparisonState.state === "clear-winner" &&
                    modelB &&
                    `Outperforms ${modelB.name} by +${comparisonState.diff?.toFixed(1)} overall score.`}
                  {comparisonState.state === "too-close" &&
                    modelB &&
                    `${modelA.name} leads by only +${comparisonState.diff?.toFixed(1)} — effectively tied.`}
                  {comparisonState.state === "tie" && "Both models received identical scores."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* 2. CATEGORY-BY-CATEGORY COMPARISON */}
        {modelA && modelB && (
          <Card className="p-3 mb-3">
            <h3 className="text-xs font-semibold mb-2 text-foreground">Score Comparison</h3>

            {/* Correctness */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Correctness</span>
                {Math.abs(modelA.correctness - modelB.correctness) >= 0.2 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1 py-0",
                      modelA.correctness > modelB.correctness
                        ? "text-green-600 border-green-300"
                        : "text-blue-600 border-blue-300",
                    )}
                  >
                    +{Math.abs(modelA.correctness - modelB.correctness).toFixed(1)}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 truncate">{modelA.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(modelA.correctness / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono w-6">{modelA.correctness.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 truncate">{modelB.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(modelB.correctness / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono w-6">{modelB.correctness.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Clarity */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Clarity</span>
                {Math.abs(modelA.clarity - modelB.clarity) >= 0.2 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1 py-0",
                      modelA.clarity > modelB.clarity
                        ? "text-green-600 border-green-300"
                        : "text-blue-600 border-blue-300",
                    )}
                  >
                    +{Math.abs(modelA.clarity - modelB.clarity).toFixed(1)}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 truncate">{modelA.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(modelA.clarity / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono w-6">{modelA.clarity.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 truncate">{modelB.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(modelB.clarity / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono w-6">{modelB.clarity.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Relevance */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Relevance</span>
                {Math.abs(modelA.relevance - modelB.relevance) >= 0.2 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1 py-0",
                      modelA.relevance > modelB.relevance
                        ? "text-green-600 border-green-300"
                        : "text-blue-600 border-blue-300",
                    )}
                  >
                    +{Math.abs(modelA.relevance - modelB.relevance).toFixed(1)}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 truncate">{modelA.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(modelA.relevance / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono w-6">{modelA.relevance.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 truncate">{modelB.name}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(modelB.relevance / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono w-6">{modelB.relevance.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* 3. HALLUCINATION COMPARISON */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Hallucination</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {modelA.hallucinationCount === 0 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-[10px]">{modelA.name}</span>
                  <span
                    className={cn(
                      "text-[10px] font-mono",
                      modelA.hallucinationCount === 0 ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {modelA.hallucinationCount === 0
                      ? "None"
                      : `${modelA.hallucinationCount} issue${modelA.hallucinationCount > 1 ? "s" : ""}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {modelB.hallucinationCount === 0 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-[10px]">{modelB.name}</span>
                  <span
                    className={cn(
                      "text-[10px] font-mono",
                      modelB.hallucinationCount === 0 ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {modelB.hallucinationCount === 0
                      ? "None"
                      : `${modelB.hallucinationCount} issue${modelB.hallucinationCount > 1 ? "s" : ""}`}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 4. LATENCY & COST COMPARISON */}
        {modelA && modelB && (
          <Card className="p-3 mb-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <Zap className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Latency</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] truncate">{modelA.name}</span>
                    <span className="text-[10px] font-mono">{modelA.timeStr}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] truncate">{modelB.name}</span>
                    <span className="text-[10px] font-mono">{modelB.timeStr}</span>
                  </div>
                  {modelA.time !== modelB.time && (
                    <div className="flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                      <span className="text-[9px] text-green-600">
                        {modelA.time < modelB.time ? modelA.name : modelB.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Cost</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] truncate">{modelA.name}</span>
                    <span className="text-[10px] font-mono">{modelA.costStr}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] truncate">{modelB.name}</span>
                    <span className="text-[10px] font-mono">{modelB.costStr}</span>
                  </div>
                  {modelA.cost !== modelB.cost && (
                    <div className="flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                      <span className="text-[9px] text-green-600">
                        {modelA.cost < modelB.cost ? modelA.name : modelB.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 5. KEY DIFFERENCES SUMMARY */}
        {keyDifferences.length > 0 && (
          <Card className="p-3 mb-3 bg-muted/30">
            <h3 className="text-[10px] font-semibold text-muted-foreground mb-2">Key Differences</h3>
            <ul className="space-y-1">
              {keyDifferences.map((diff, idx) => (
                <li key={idx} className="text-[11px] text-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  {diff}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {aiEvaluatorEnabled && aiEvaluatorAggregated && aiEvaluatorAggregated.length > 0 && (
          <Card className="p-3 mb-3 bg-gradient-to-b from-violet-50/50 to-white dark:from-violet-900/40 dark:to-violet-950/20 border-violet-200 dark:border-violet-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-xs font-semibold text-foreground">AI Evaluator</h3>
              </div>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-violet-300 text-violet-600">
                {aiEvaluatorModel || "Auto"}
              </Badge>
            </div>

            <div className="space-y-1.5">
              {aiEvaluatorAggregated.map((result, idx) => (
                <div
                  key={result.modelId}
                  className="flex items-center justify-between py-1 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {idx === 0 && aiEvaluatorAggregated.length > 1 && <Trophy className="h-3 w-3 text-violet-500" />}
                    <span className="text-[11px] font-medium">{result.modelName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">C</span>
                      <span className="text-[10px] font-mono">{result.correctness.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">Cl</span>
                      <span className="text-[10px] font-mono">{result.clarity.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground">R</span>
                      <span className="text-[10px] font-mono">{result.relevance.toFixed(1)}</span>
                    </div>
                    <Badge
                      variant={idx === 0 ? "default" : "secondary"}
                      className={cn("text-[10px] px-1.5 py-0 ml-1", idx === 0 && "bg-violet-500")}
                    >
                      {result.overall.toFixed(1)}/5
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-muted-foreground mt-2 leading-snug">
              Scores generated by AI evaluator analyzing response quality.
            </p>
          </Card>
        )}

        {/* 7. VIEW FULL DETAILS BUTTON */}
        <Button
          variant="ghost"
          className="w-full justify-between text-xs h-9 mb-3"
          onClick={() => setFullComparisonExpanded(!fullComparisonExpanded)}
        >
          <span>View Full Details</span>
          {fullComparisonExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>

        {fullComparisonExpanded && (
          <div className="space-y-3 mb-3">
            {prompts.map((prompt, promptIdx) => (
              <Card key={promptIdx} className="overflow-hidden">
                {/* Prompt Header - Collapsible */}
                <button
                  className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => togglePromptExpanded(promptIdx)}
                >
                  <span className="text-xs font-semibold">Prompt {promptIdx + 1}</span>
                  {expandedPrompts.has(promptIdx) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {/* Expanded Prompt Content */}
                {expandedPrompts.has(promptIdx) && (
                  <div className="border-t border-border">
                    {/* Prompt Text Block */}
                    <div className="bg-muted/30 p-3 relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground font-medium">PROMPT</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={async () => {
                            await navigator.clipboard.writeText(prompt)
                            toast({ title: "Prompt copied" })
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{prompt}</p>
                    </div>

                    {/* Model Responses */}
                    <div className="p-3 space-y-3">
                      {models.map((model) => {
                        const response = getResponseForPrompt(model.id, promptIdx)
                        const modelRatings = getRatingsForPrompt(model.id, promptIdx)
                        const hasHallucination = getHallucinationForPrompt(model.id, promptIdx)

                        return (
                          <div key={model.id} className="border border-border rounded-xl p-3 bg-background">
                            {/* Model Name */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold">{model.name}</span>
                              {hasHallucination && (
                                <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                                  Hallucination
                                </Badge>
                              )}
                            </div>

                            {/* Response Preview */}
                            <div className="bg-muted/30 rounded-lg p-2 mb-2">
                              <p className="text-[11px] text-foreground leading-relaxed font-mono">
                                {truncateResponse(response?.text || "")}
                              </p>
                            </div>

                            {/* Metadata Row */}
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {response?.time || "N/A"}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {response?.cost || "N/A"}
                              </span>
                            </div>

                            {/* Score Pills */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                C: {modelRatings.correctness?.toFixed(1) || "0"}/5
                              </Badge>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                Cl: {modelRatings.clarity?.toFixed(1) || "0"}/5
                              </Badge>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                R: {modelRatings.relevance?.toFixed(1) || "0"}/5
                              </Badge>
                            </div>

                            {/* See Full Response Link */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] text-primary p-0"
                              onClick={() =>
                                setFullResponseModal({
                                  isOpen: true,
                                  modelId: model.id,
                                  modelName: model.name,
                                  promptIndex: promptIdx,
                                })
                              }
                            >
                              See full response <ChevronRight className="h-3 w-3 ml-0.5" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Export & Share */}
        <div className="mb-3">
          <h3 className="text-[10px] font-semibold text-muted-foreground mb-2">Export & Share</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="default" className="justify-start h-auto py-2.5 text-left" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              <div>
                <div className="text-xs font-medium">Share</div>
                <div className="text-[9px] opacity-80">Send to app</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-2.5 text-left bg-transparent"
              onClick={handleCopyMarkdown}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              <div>
                <div className="text-xs font-medium">{markdownCopied ? "Copied!" : "Copy"}</div>
                <div className="text-[9px] text-muted-foreground">Markdown</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-2.5 text-left bg-transparent"
              onClick={handleExportMarkdown}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <div>
                <div className="text-xs font-medium">Export</div>
                <div className="text-[9px] text-muted-foreground">.md file</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-2.5 text-left bg-transparent"
              onClick={handleScreenshot}
            >
              <Camera className="h-3.5 w-3.5 mr-1.5" />
              <div>
                <div className="text-xs font-medium">Screenshot</div>
                <div className="text-[9px] text-muted-foreground">Capture</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Standardized footer padding */}
      <div className="border-t border-border bg-card px-4 py-3 flex-shrink-0">
        <Button onClick={onBack} className="w-full" size="sm">
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Share Drawer */}
      {shareDrawerOpen && (
        <div className="absolute inset-0 z-50 flex items-end pointer-events-none">
          <div className="relative w-full bg-background/95 backdrop-blur-xl rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 pointer-events-auto">
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            <div className="px-3 py-4 border-b border-border/50">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: MessageCircle, label: "Message", color: "bg-green-500" },
                  { icon: Mail, label: "Mail", color: "bg-blue-500" },
                  { icon: FileText, label: "Notes", color: "bg-amber-400" },
                  { icon: Folder, label: "Files", color: "bg-indigo-500" },
                ].map(({ icon: Icon, label, color }) => (
                  <button
                    key={label}
                    onClick={() => handleShareAction(label)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[10px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-3 py-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Copy, label: "Copy" },
                  { icon: Printer, label: "Print" },
                  { icon: Download, label: "Export" },
                  { icon: MoreHorizontal, label: "More" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    onClick={() => handleShareAction(label)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-3 pb-4">
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onClick={() => setShareDrawerOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
