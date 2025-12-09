"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Search, Zap, Plus, X, FileText, Trash2 } from "lucide-react"
import { Logo } from "@/components/logo"

interface ScenarioLibraryProps {
  onScenarioSelected: (scenarioId: string, customData?: { name: string; prompts: string[] }) => void
  onBack: () => void
  onQuickBenchmark: () => void
  isReturningUser?: boolean
  savedCustomScenarios?: Array<{ id: string; name: string; prompts: string[] }>
  onDeleteCustomScenario?: (id: string) => void
}

export function ScenarioLibrary({
  onScenarioSelected,
  onBack,
  onQuickBenchmark,
  isReturningUser = false,
  savedCustomScenarios = [],
  onDeleteCustomScenario,
}: ScenarioLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customScenarioName, setCustomScenarioName] = useState("")
  const [customPrompts, setCustomPrompts] = useState<string[]>([""])

  const filteredScenarios = savedCustomScenarios.filter((scenario) =>
    scenario.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Logo size={32} className="rounded-lg" />
            <span className="text-lg font-semibold text-foreground">
              Compare<span className="text-primary">LY</span>
            </span>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search test scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card
          className="p-4 border-2 border-accent/40 bg-gradient-to-br from-accent/10 to-accent/5 cursor-pointer hover:border-accent transition-all"
          onClick={onQuickBenchmark}
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-foreground">Quick Benchmark</h3>
                <Badge variant="secondary" className="text-xs font-medium">
                  1-click
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Run 3 curated tests instantly</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-4 mt-3 border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer hover:border-primary transition-all"
          onClick={() => setShowCreateModal(true)}
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground mb-1">Create Custom Scenario</h3>
              <p className="text-sm text-muted-foreground">Design your own test prompts</p>
            </div>
          </div>
        </Card>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredScenarios.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Scenarios</h2>
            {filteredScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => onScenarioSelected(scenario.id, { name: scenario.name, prompts: scenario.prompts })}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{scenario.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {scenario.prompts.length} prompt{scenario.prompts.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {onDeleteCustomScenario && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteCustomScenario(scenario.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-base font-semibold text-foreground mb-1">No scenarios found</h3>
            <p className="text-sm text-muted-foreground">Try a different search term</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="h-16 w-16 mx-auto mb-4 text-primary/50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Get started with Quick Benchmark</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Try our 1-click Quick Benchmark above, or create your own custom test scenario to compare models on your
              specific use cases.
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <Card className="w-full max-w-[360px] max-h-[calc(100%-24px)] overflow-y-auto bg-card">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Create Custom Scenario</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => {
                    setShowCreateModal(false)
                    setCustomScenarioName("")
                    setCustomPrompts([""])
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Scenario Name</label>
                  <Input
                    placeholder="e.g., Customer Support Responses"
                    value={customScenarioName}
                    onChange={(e) => setCustomScenarioName(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-foreground">Test Prompts</label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2 bg-transparent"
                      onClick={() => setCustomPrompts([...customPrompts, ""])}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Prompt
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customPrompts.map((prompt, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-1">
                          <textarea
                            className="w-full min-h-[60px] px-2.5 py-2 text-xs rounded-md border border-input bg-background resize-none"
                            placeholder={`Prompt ${index + 1}`}
                            value={prompt}
                            onChange={(e) => {
                              const newPrompts = [...customPrompts]
                              newPrompts[index] = e.target.value
                              setCustomPrompts(newPrompts)
                            }}
                          />
                        </div>
                        {customPrompts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => {
                              const newPrompts = customPrompts.filter((_, i) => i !== index)
                              setCustomPrompts(newPrompts)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1 text-sm h-9 bg-transparent"
                  onClick={() => {
                    setShowCreateModal(false)
                    setCustomScenarioName("")
                    setCustomPrompts([""])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 text-sm h-9"
                  disabled={!customScenarioName.trim() || customPrompts.every((p) => !p.trim())}
                  onClick={() => {
                    const customId = `custom-${Date.now()}`
                    const filteredPrompts = customPrompts.filter((p) => p.trim())
                    setShowCreateModal(false)
                    onScenarioSelected(customId, {
                      name: customScenarioName,
                      prompts: filteredPrompts,
                    })
                    setCustomScenarioName("")
                    setCustomPrompts([""])
                  }}
                >
                  Start Test
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
