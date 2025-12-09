"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Sparkles, Info } from "lucide-react"

interface ScenarioSelectionProps {
  scenarioId: string
  customScenarioData?: { name: string; prompts: string[] } | null
  onScenarioSelected: (scenario: string) => void
  onBack: () => void
  aiEvaluatorEnabled: boolean
  aiEvaluatorModel: string
  onAiEvaluatorToggle: (enabled: boolean) => void
  onAiEvaluatorModelChange: (model: string) => void
  providers: any[]
}

const SCENARIO_DETAILS: Record<string, any> = {
  "italian-cuisine": {
    title: "Italian Cuisine Expertise",
    prompts: [
      "Generate a traditional Carbonara recipe with authentic ingredients",
      "Explain the difference between Roman and Neapolitan pizza styles",
      "Suggest ingredient substitutions for a vegan Lasagna Bolognese",
      "Describe the regional variations of risotto across Italy",
      "Create a menu for an authentic Italian wedding feast",
      "Explain the proper preparation technique for fresh pasta",
      "Compare Northern vs Southern Italian cooking styles",
      "Suggest wine pairings for a multi-course Italian dinner",
    ],
  },
  "code-review": {
    title: "Code Review & Best Practices",
    prompts: [
      "Review this React component for performance issues",
      "Identify security vulnerabilities in this authentication code",
      "Suggest improvements for this database query optimization",
      "Evaluate this API error handling implementation",
      "Review this TypeScript code for type safety issues",
      "Assess this component's accessibility compliance",
      "Identify code smells and suggest refactoring",
      "Review test coverage and suggest additional test cases",
      "Evaluate state management patterns in this application",
      "Check for potential memory leaks in this code",
    ],
  },
  "customer-support": {
    title: "Customer Support Responses",
    prompts: [
      "Respond to an angry customer about a delayed order",
      "Handle a refund request with empathy and professionalism",
      "Explain a technical issue in simple, non-technical terms",
      "De-escalate a complaint about poor service quality",
      "Address a billing dispute with clear documentation",
      "Respond to a feature request with timeline expectations",
      "Handle a data privacy concern with appropriate urgency",
      "Provide workaround solutions for a known bug",
      "Apologize for a service outage and offer compensation",
    ],
  },
}

export function ScenarioSelection({
  scenarioId,
  customScenarioData,
  onScenarioSelected,
  onBack,
  aiEvaluatorEnabled,
  aiEvaluatorModel,
  onAiEvaluatorToggle,
  onAiEvaluatorModelChange,
  providers,
}: ScenarioSelectionProps) {
  const scenario = customScenarioData || SCENARIO_DETAILS[scenarioId] || SCENARIO_DETAILS["code-review"]

  console.log("[v0] ScenarioSelection - providers:", providers)
  console.log("[v0] ScenarioSelection - aiEvaluatorEnabled:", aiEvaluatorEnabled)
  console.log("[v0] ScenarioSelection - aiEvaluatorModel:", aiEvaluatorModel)

  const availableEvaluatorModels = providers.flatMap((provider) =>
    provider.models
      .filter((model: any) => model.enabled !== false)
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        provider: provider.name,
      })),
  )

  console.log("[v0] ScenarioSelection - availableEvaluatorModels:", availableEvaluatorModels)

  const canProceed = true

  console.log("[v0] ScenarioSelection - canProceed:", canProceed)

  const showEvaluatorError = false

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg leading-tight">{scenario.title || scenario.name}</h1>
            <p className="text-xs text-muted-foreground">{scenario.prompts.length} prompts</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="overflow-y-auto px-4 py-5 pb-4">
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-3 text-foreground">Test Prompts</h2>
          <div className="space-y-3">
            {scenario.prompts.map((prompt: string, index: number) => (
              <Card key={index} className="p-4 border-l-4 border-l-primary">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground flex-1">{prompt}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Evaluator */}
        <Card className="p-4 border-2 border-accent/50 bg-accent/5">
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
                      <SelectItem value="none">None (auto-select)</SelectItem>
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

      {/* Footer */}
      <div className="mt-auto border-t border-border bg-card p-3">
        <Button
          onClick={() => onScenarioSelected(scenarioId)}
          className="w-full min-h-[48px]"
          size="lg"
          disabled={!canProceed}
        >
          Run Test ({scenario.prompts.length} prompts)
        </Button>
      </div>
    </div>
  )
}
