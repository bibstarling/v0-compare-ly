"use client"

import { useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { WelcomeScreen } from "@/components/welcome-screen"
import { LoginScreen } from "@/components/login-screen"
import { TutorialScreen } from "@/components/tutorial-screen"
import { ModelSelection } from "@/components/model-selection"
import { ScenarioLibrary } from "@/components/scenario-library"
import { ScenarioSelection } from "@/components/scenario-selection"
import { RunningComparison } from "@/components/running-comparison"
import { ComparisonView } from "@/components/comparison-view"
import { ScoringView } from "@/components/scoring-view"
import { ResultsView } from "@/components/results-view"
import { History } from "@/components/history"
import { SettingsScreen } from "@/components/settings-screen"
import { QuickBenchmark } from "@/components/quick-benchmark"
import { ForgotPasswordScreen } from "@/components/forgot-password-screen"

type Screen =
  | "splash"
  | "welcome"
  | "login"
  | "forgot-password"
  | "tutorial"
  | "models"
  | "scenario-library"
  | "scenarios"
  | "running"
  | "comparison"
  | "scoring"
  | "results"
  | "history"
  | "settings"
  | "quick-benchmark"

interface Provider {
  id: string
  name: string
  description: string
  models: {
    id: string
    name: string
    description: string
    speed: string
    cost: string
    tags?: string[]
    enabled?: boolean
  }[]
  recommended?: boolean
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash")
  const [selectedModels, setSelectedModels] = useState<Array<{ id: string; name: string; provider: string }>>([])
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [customScenarioData, setCustomScenarioData] = useState<{ name: string; prompts: string[] } | null>(null)
  const [aiEvaluatorEnabled, setAiEvaluatorEnabled] = useState(false)
  const [aiEvaluatorModel, setAiEvaluatorModel] = useState<string>("gpt-5.1")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [connectedProviders, setConnectedProviders] = useState<string[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [comparisonData, setComparisonData] = useState<{
    prompts: string[]
    responses: Record<string, Record<string, any>>
  }>({ prompts: [], responses: {} })
  const [ratingsData, setRatingsData] = useState<any>(null)
  const [shouldOpenAddProvider, setShouldOpenAddProvider] = useState(false)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [viewingHistoryItem, setViewingHistoryItem] = useState<any>(null)
  const [quickBenchmarkPrompts, setQuickBenchmarkPrompts] = useState<string[]>([])
  const [savedCustomScenarios, setSavedCustomScenarios] = useState<
    Array<{ id: string; name: string; prompts: string[] }>
  >([])

  const saveTestToHistory = (testData: {
    scenario: string
    models: Array<{ id: string; name: string; provider: string }>
    prompts: string[]
    responses: Record<string, Record<string, any>>
    ratings: any
    winner?: { model: string; score: number }
    duration?: string
    aiEvaluatorScores?: any
  }) => {
    const newHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      scenario: testData.scenario,
      models: testData.models.map((m) => m.name),
      modelsData: testData.models,
      prompts: testData.prompts,
      responses: testData.responses,
      ratings: testData.ratings,
      winner: testData.winner?.model || testData.models[0].name,
      winnerScore: testData.winner?.score || 0,
      duration: testData.duration || "0m 0s",
      aiEvaluator: aiEvaluatorEnabled,
      aiEvaluatorModel: aiEvaluatorEnabled ? aiEvaluatorModel : undefined,
      aiEvaluatorScores: testData.aiEvaluatorScores,
      status: "completed",
    }
    setHistoryItems((prev) => [newHistoryItem, ...prev])
  }

  const generateMockHistory = () => {
    const mockModels = [
      { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
    ]
    const mockPrompts = ["Explain quantum computing", "Write a poem about AI"]
    const mockResponses = {
      "gpt-4o": {
        "Explain quantum computing": {
          text: "Quantum computing harnesses quantum mechanics principles...",
          timestamp: Date.now(),
        },
        "Write a poem about AI": {
          text: "In circuits deep and neural nets so bright...",
          timestamp: Date.now(),
        },
      },
      "gpt-4o-mini": {
        "Explain quantum computing": {
          text: "Quantum computing uses quantum bits or qubits...",
          timestamp: Date.now(),
        },
        "Write a poem about AI": {
          text: "Algorithms dance in silicon dreams...",
          timestamp: Date.now(),
        },
      },
    }
    const mockRatings = {
      "gpt-4o": { correctness: 4, clarity: 4, relevance: 4 },
      "gpt-4o-mini": { correctness: 3, clarity: 3, relevance: 4 },
    }
    const mockAiEvaluatorScores = {
      model: "gpt-4o",
      scores: {
        "prompt-0": {
          "gpt-4o": { correctness: 5, clarity: 4, relevance: 5 },
          "gpt-4o-mini": { correctness: 4, clarity: 4, relevance: 4 },
        },
        "prompt-1": {
          "gpt-4o": { correctness: 4, clarity: 5, relevance: 4 },
          "gpt-4o-mini": { correctness: 3, clarity: 4, relevance: 4 },
        },
      },
      summary: "AI-powered evaluation completed for all model responses.",
    }

    return [
      {
        id: "1",
        date: "2025-01-14",
        time: "14:30",
        scenario: "Software Architecture Review",
        models: ["GPT-4o", "GPT-4o Mini"],
        modelsData: mockModels,
        prompts: mockPrompts,
        responses: mockResponses,
        ratings: mockRatings,
        winner: "GPT-4o",
        winnerScore: 4.0,
        duration: "3m 45s",
        aiEvaluator: true,
        aiEvaluatorModel: "gpt-4o",
        aiEvaluatorScores: mockAiEvaluatorScores,
        status: "completed",
      },
      {
        id: "2",
        date: "2025-01-13",
        time: "09:15",
        scenario: "Customer Support Responses",
        models: ["GPT-4o Mini", "GPT-4o"],
        modelsData: mockModels,
        prompts: mockPrompts,
        responses: mockResponses,
        ratings: mockRatings,
        winner: "GPT-4o Mini",
        winnerScore: 3.5,
        duration: "2m 12s",
        aiEvaluator: false,
        status: "completed",
      },
      {
        id: "3",
        date: "2025-01-12",
        time: "16:45",
        scenario: "Creative Writing",
        models: ["GPT-4o", "GPT-4o Mini"],
        modelsData: mockModels,
        prompts: mockPrompts,
        responses: mockResponses,
        ratings: mockRatings,
        winner: "GPT-4o",
        winnerScore: 4.7,
        duration: "4m 20s",
        aiEvaluator: true,
        aiEvaluatorModel: "gpt-4o",
        aiEvaluatorScores: mockAiEvaluatorScores,
        status: "completed",
      },
    ]
  }

  const getAiEvaluatorModel = () => {
    if (!aiEvaluatorEnabled) return ""
    if (aiEvaluatorModel) return aiEvaluatorModel

    const availableModels = providers.flatMap((provider) =>
      provider.models.filter((model: any) => model.enabled !== false).map((model: any) => model.id),
    )

    if (availableModels.length > 0) {
      const randomModel = availableModels[Math.floor(Math.random() * availableModels.length)]
      console.log("[v0] Auto-selected AI evaluator model:", randomModel)
      return randomModel
    }

    return ""
  }

  return (
    <div className="bg-background h-full">
      {currentScreen === "splash" && (
        <SplashScreen
          onComplete={() => {
            setCurrentScreen("welcome")
          }}
        />
      )}
      {currentScreen === "welcome" && (
        <WelcomeScreen
          onGetStarted={() => {
            setCurrentScreen("login")
          }}
        />
      )}
      {currentScreen === "login" && (
        <LoginScreen
          onLogin={() => {
            setIsAuthenticated(true)
            setIsReturningUser(true)
            setHistoryItems(generateMockHistory())
            setSelectedModels([])
            setConnectedProviders(["openai"])
            setProviders([
              {
                id: "openai",
                name: "OpenAI",
                description: "Leading AI research company",
                models: [
                  {
                    id: "gpt-4o",
                    name: "GPT-4o",
                    description: "Most capable GPT-4 model",
                    speed: "Fast",
                    cost: "$$",
                    tags: ["reasoning", "creative"],
                    enabled: true,
                  },
                  {
                    id: "gpt-4o-mini",
                    name: "GPT-4o Mini",
                    description: "Faster, cost-effective version",
                    speed: "Very Fast",
                    cost: "$",
                    tags: ["fast", "economical"],
                    enabled: true,
                  },
                ],
                recommended: true,
              },
            ])
            setCurrentScreen("models")
          }}
          onSignUpComplete={() => {
            setIsAuthenticated(true)
            setIsReturningUser(false)
            setHistoryItems([])
            setCurrentScreen("tutorial")
          }}
          onForgotPassword={() => {
            setCurrentScreen("forgot-password")
          }}
        />
      )}
      {currentScreen === "forgot-password" && (
        <ForgotPasswordScreen
          onBack={() => {
            setCurrentScreen("login")
          }}
        />
      )}
      {currentScreen === "tutorial" && (
        <TutorialScreen
          onComplete={() => {
            setCurrentScreen("models")
          }}
        />
      )}
      {currentScreen === "models" && (
        <ModelSelection
          selected={selectedModels}
          onSelectionChange={setSelectedModels}
          onNext={() => setCurrentScreen("scenario-library")}
          onHistory={() => setCurrentScreen("history")}
          onSettings={() => setCurrentScreen("settings")}
          onAddProvider={() => {}}
          connectedProviders={connectedProviders}
          providers={providers}
          onProvidersChange={setConnectedProviders}
          onProvidersDataChange={setProviders}
          handleEditProvider={(providerId) => {
            console.log("[v0] Edit provider:", providerId)
          }}
          handleEditModel={(providerId, modelId) => {
            console.log("[v0] Edit model:", providerId, modelId)
          }}
        />
      )}
      {currentScreen === "scenario-library" && (
        <ScenarioLibrary
          onScenarioSelected={(scenarioId, customData) => {
            setSelectedScenario(scenarioId)
            if (customData) {
              setCustomScenarioData(customData)
              if (customData.name && customData.prompts.length > 0) {
                setSavedCustomScenarios((prev) => {
                  const exists = prev.some((s) => s.name === customData.name)
                  if (!exists) {
                    return [...prev, { id: scenarioId, name: customData.name, prompts: customData.prompts }]
                  }
                  return prev
                })
              }
            } else {
              setCustomScenarioData(null)
            }
            setCurrentScreen("scenarios")
          }}
          onBack={() => setCurrentScreen("models")}
          onQuickBenchmark={() => setCurrentScreen("quick-benchmark")}
          isReturningUser={isReturningUser}
          savedCustomScenarios={savedCustomScenarios}
          onDeleteCustomScenario={(id) => {
            setSavedCustomScenarios((prev) => prev.filter((s) => s.id !== id))
          }}
        />
      )}
      {currentScreen === "quick-benchmark" && (
        <QuickBenchmark
          onNext={(selectedTestIds) => {
            const allScenarios = [
              {
                id: "code-review",
                name: "Code Review",
                prompt:
                  "Review this Python function and suggest improvements:\n\ndef calculate_total(items):\n    total = 0\n    for i in items:\n        total = total + i['price']\n    return total",
              },
              {
                id: "creative-writing",
                name: "Creative Writing",
                prompt:
                  "Write a compelling product description for an AI-powered productivity tool that helps teams collaborate better.",
              },
              {
                id: "data-analysis",
                name: "Data Analysis",
                prompt:
                  "Analyze this sales data trend: Q1: $45k, Q2: $52k, Q3: $48k, Q4: $61k. What insights can you provide?",
              },
            ]

            const selectedScenarios = allScenarios.filter((s) => selectedTestIds.includes(s.id))
            setQuickBenchmarkPrompts(selectedScenarios.map((s) => s.prompt))
            setSelectedScenario("quick-benchmark")
            setCustomScenarioData({ name: "Quick Benchmark", prompts: selectedScenarios.map((s) => s.prompt) })
            setCurrentScreen("running")
          }}
          onBack={() => setCurrentScreen("scenario-library")}
          aiEvaluatorEnabled={aiEvaluatorEnabled}
          aiEvaluatorModel={aiEvaluatorModel}
          onAiEvaluatorToggle={setAiEvaluatorEnabled}
          onAiEvaluatorModelChange={setAiEvaluatorModel}
          providers={providers}
        />
      )}
      {currentScreen === "scenarios" && (
        <ScenarioSelection
          scenarioId={selectedScenario}
          customScenarioData={customScenarioData}
          onScenarioSelected={(scenario) => {
            setSelectedScenario(scenario)
            setCurrentScreen("running")
          }}
          onBack={() => setCurrentScreen("scenario-library")}
          aiEvaluatorEnabled={aiEvaluatorEnabled}
          aiEvaluatorModel={aiEvaluatorModel}
          onAiEvaluatorToggle={(enabled) => setAiEvaluatorEnabled(enabled)}
          onAiEvaluatorModelChange={(model) => setAiEvaluatorModel(model)}
          providers={providers}
        />
      )}
      {currentScreen === "running" && (
        <RunningComparison models={selectedModels} onComplete={() => setCurrentScreen("comparison")} />
      )}
      {currentScreen === "comparison" && (
        <ComparisonView
          models={selectedModels}
          scenario={selectedScenario}
          customScenarioData={customScenarioData}
          onContinueToScoring={(prompts, responses) => {
            setComparisonData({ prompts, responses })
            setCurrentScreen("scoring")
          }}
          onBack={() => setCurrentScreen("scenarios")}
        />
      )}
      {currentScreen === "scoring" && (
        <ScoringView
          models={selectedModels}
          prompts={comparisonData.prompts}
          responses={comparisonData.responses}
          onViewResults={(ratings) => {
            setRatingsData(ratings)
            setCurrentScreen("results")
          }}
          onBack={() => setCurrentScreen("comparison")}
          aiEvaluatorEnabled={aiEvaluatorEnabled}
          aiEvaluatorModel={getAiEvaluatorModel()}
        />
      )}
      {currentScreen === "results" && (
        <ResultsView
          models={viewingHistoryItem ? viewingHistoryItem.modelsData : selectedModels}
          prompts={viewingHistoryItem ? viewingHistoryItem.prompts : comparisonData.prompts}
          responses={viewingHistoryItem ? viewingHistoryItem.responses : comparisonData.responses}
          ratings={viewingHistoryItem ? viewingHistoryItem.ratings : ratingsData}
          aiEvaluatorScores={
            viewingHistoryItem
              ? viewingHistoryItem.aiEvaluatorScores
              : ratingsData?.aiScores
                ? {
                    model: getAiEvaluatorModel(),
                    scores: ratingsData.aiScores,
                    summary: "AI-powered evaluation completed for all model responses.",
                  }
                : undefined
          }
          aiEvaluatorEnabled={viewingHistoryItem ? viewingHistoryItem.aiEvaluator : aiEvaluatorEnabled}
          aiEvaluatorModel={viewingHistoryItem ? viewingHistoryItem.aiEvaluatorModel : getAiEvaluatorModel()}
          onBack={() => {
            if (viewingHistoryItem) {
              setViewingHistoryItem(null)
              setCurrentScreen("history")
            } else {
              if (selectedModels.length > 0 && comparisonData.prompts.length > 0) {
                saveTestToHistory({
                  scenario: customScenarioData?.name || selectedScenario || "Test",
                  models: selectedModels,
                  prompts: comparisonData.prompts,
                  responses: comparisonData.responses,
                  ratings: ratingsData,
                  aiEvaluatorScores: ratingsData?.aiScores
                    ? {
                        model: getAiEvaluatorModel(),
                        scores: ratingsData.aiScores,
                        summary: "AI-powered evaluation completed for all model responses.",
                      }
                    : undefined,
                })
              }
              setCurrentScreen("models")
              setSelectedModels([])
              setSelectedScenario("")
              setComparisonData({ prompts: [], responses: {} })
              setRatingsData(null)
              setQuickBenchmarkPrompts([])
            }
          }}
          onNewTest={() => {
            setViewingHistoryItem(null)
            if (selectedModels.length > 0 && comparisonData.prompts.length > 0) {
              saveTestToHistory({
                scenario: customScenarioData?.name || selectedScenario || "Test",
                models: selectedModels,
                prompts: comparisonData.prompts,
                responses: comparisonData.responses,
                ratings: ratingsData,
                aiEvaluatorScores: ratingsData?.aiScores
                  ? {
                      model: getAiEvaluatorModel(),
                      scores: ratingsData.aiScores,
                      summary: "AI-powered evaluation completed for all model responses.",
                    }
                  : undefined,
              })
            }
            setCurrentScreen("models")
            setSelectedModels([])
            setSelectedScenario("")
            setComparisonData({ prompts: [], responses: {} })
            setRatingsData(null)
            setQuickBenchmarkPrompts([])
          }}
          onBackToHistory={
            viewingHistoryItem
              ? () => {
                  setViewingHistoryItem(null)
                  setCurrentScreen("history")
                }
              : undefined
          }
        />
      )}
      {currentScreen === "history" && (
        <History
          onBack={() => setCurrentScreen("models")}
          historyItems={historyItems}
          onViewTestDetails={(item) => {
            setViewingHistoryItem(item)
            setCurrentScreen("results")
          }}
          onDeleteHistoryItem={(id) => {
            setHistoryItems((prev) => prev.filter((item) => item.id !== id))
          }}
        />
      )}
      {currentScreen === "settings" && (
        <SettingsScreen
          onBack={() => setCurrentScreen("models")}
          onLogout={() => {
            setIsAuthenticated(false)
            setCurrentScreen("login")
          }}
          onProvidersChange={setConnectedProviders}
          onProvidersDataChange={setProviders}
          openAddProviderModal={shouldOpenAddProvider}
          onAddProviderModalClose={() => setShouldOpenAddProvider(false)}
          isReturningUser={isReturningUser}
          testsCompleted={historyItems.length}
          totalPrompts={historyItems.reduce((sum, item) => sum + (item.prompts?.length || 0), 0)}
        />
      )}
    </div>
  )
}
