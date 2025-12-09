"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, ChevronLeft, Sparkles, Info } from "lucide-react"

interface QuickBenchmarkProps {
  onNext: (selectedTests: string[]) => void
  onBack: () => void
  aiEvaluatorEnabled: boolean
  aiEvaluatorModel: string
  onAiEvaluatorToggle: (enabled: boolean) => void
  onAiEvaluatorModelChange: (model: string) => void
  providers: any[]
}

export function QuickBenchmark({
  onNext,
  onBack,
  aiEvaluatorEnabled,
  aiEvaluatorModel,
  onAiEvaluatorToggle,
  onAiEvaluatorModelChange,
  providers,
}: QuickBenchmarkProps) {
  const scenarios = [
    {
      id: "code-review",
      name: "Code Review",
      icon: "💻",
      prompt:
        "Review this Python function and suggest improvements:\n\ndef calculate_total(items):\n    total = 0\n    for i in items:\n        total = total + i['price']\n    return total",
    },
    {
      id: "creative-writing",
      name: "Creative Writing",
      icon: "✍️",
      prompt:
        "Write a compelling product description for an AI-powered productivity tool that helps teams collaborate better.",
    },
    {
      id: "data-analysis",
      name: "Data Analysis",
      icon: "📊",
      prompt: "Analyze this sales data trend: Q1: $45k, Q2: $52k, Q3: $48k, Q4: $61k. What insights can you provide?",
    },
  ]

  const [selectedTests, setSelectedTests] = useState<string[]>(scenarios.map((s) => s.id))

  const toggleTest = (testId: string) => {
    setSelectedTests((prev) => {
      if (prev.includes(testId)) {
        return prev.filter((id) => id !== testId)
      } else {
        return [...prev, testId]
      }
    })
  }

  const availableEvaluatorModels = providers.flatMap((provider) =>
    provider.models
      .filter((model: any) => model.enabled !== false)
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        provider: provider.name,
      })),
  )

  const selectedCount = selectedTests.length
  const canProceed = selectedCount > 0

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg leading-tight">Quick Benchmark</h1>
            <p className="text-xs text-muted-foreground">Choose tests to run</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 mx-auto">
            <Zap className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-center text-balance">Instant Model Comparison</h2>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md mx-auto leading-relaxed">
            Select which tests to run and evaluate which model performs best
          </p>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Available Tests</h3>
            <div className="w-full max-w-md mx-auto space-y-3">
              {scenarios.map((scenario) => {
                const isSelected = selectedTests.includes(scenario.id)
                return (
                  <Card
                    key={scenario.id}
                    className={`p-4 border-2 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{scenario.icon}</span>
                      <span className="text-sm font-medium text-foreground flex-1">{scenario.name}</span>
                      <Switch checked={isSelected} onCheckedChange={() => toggleTest(scenario.id)} />
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <Card className="p-4 border-2 border-accent/50 bg-accent/5 max-w-md mx-auto mb-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">AI Evaluator</h3>
                  <Switch checked={aiEvaluatorEnabled} onCheckedChange={onAiEvaluatorToggle} />
                </div>
                <p className="text-xs text-muted-foreground">Get automated scoring to validate your ratings</p>
              </div>
            </div>
            {aiEvaluatorEnabled && (
              <div className="pt-3 border-t border-border">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Evaluator model</label>
                {availableEvaluatorModels.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
                    No models connected. Add a provider to use AI Evaluator.
                  </div>
                ) : (
                  <>
                    <Select value={aiEvaluatorModel} onValueChange={onAiEvaluatorModelChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose model (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEvaluatorModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-2 p-2 bg-muted/50 rounded-md flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        If no model is selected, one will be randomly chosen from your available models
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="border-t border-border bg-card p-3">
        <div className="max-w-md mx-auto">
          <Button onClick={() => onNext(selectedTests)} className="w-full min-h-[44px]" disabled={!canProceed}>
            <Zap className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {canProceed
                ? `Run Quick Benchmark (${selectedCount} ${selectedCount === 1 ? "test" : "tests"})`
                : "Select at least 1 test"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
