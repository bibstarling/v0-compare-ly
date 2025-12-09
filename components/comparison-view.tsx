"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, DollarSign, FileText } from "lucide-react"
import { Logo } from "@/components/logo"

interface ComparisonViewProps {
  models: Array<{ id: string; name: string; provider: string }>
  scenario: string
  customScenarioData?: { name: string; prompts: string[] } | null
  onContinueToScoring: (prompts: string[], responses: Record<string, Record<string, any>>) => void
  onBack: () => void
}

const DEFAULT_PROMPTS = [
  "Explain how to make authentic Cacio e Pepe",
  "What are the regional differences between Roman and Sicilian pizza?",
  "Suggest a vegan substitute for Parmigiano-Reggiano",
]

function generateMockResponse(modelName: string, promptIndex: number) {
  // Different themes for different prompts to provide variety
  const promptThemes = [
    // Theme 1: Software Development
    [
      {
        text: "To implement efficient authentication, use JWT tokens with refresh token rotation. Store access tokens in memory and refresh tokens in httpOnly cookies. Implement a token refresh mechanism that runs before API calls. Add middleware to verify tokens on protected routes and handle token expiration gracefully with automatic renewal.",
        time: (1.2 + Math.random() * 0.8).toFixed(1) + "s",
        tokens: 120 + Math.floor(Math.random() * 40),
        cost: "$0.00" + Math.floor(Math.random() * 4 + 1),
      },
      {
        text: "For robust authentication, consider OAuth 2.0 with PKCE flow for SPAs. Use secure session management with rotating refresh tokens. Implement rate limiting on auth endpoints and add multi-factor authentication support. Store sensitive data encrypted and validate all inputs server-side to prevent injection attacks.",
        time: (1.5 + Math.random() * 1.0).toFixed(1) + "s",
        tokens: 140 + Math.floor(Math.random() * 50),
        cost: "$0.00" + Math.floor(Math.random() * 5 + 2),
      },
      {
        text: "Authentication best practices include using bcrypt for password hashing with appropriate salt rounds. Implement session timeouts and secure cookie flags. Use HTTPS exclusively and add CSRF protection. Consider passwordless options like magic links or WebAuthn for enhanced security and better user experience.",
        time: (0.9 + Math.random() * 0.7).toFixed(1) + "s",
        tokens: 100 + Math.floor(Math.random() * 35),
        cost: "$0.00" + Math.floor(Math.random() * 3 + 1),
      },
    ],
    // Theme 2: Space Exploration
    [
      {
        text: "Mars colonization requires solving life support systems including oxygen generation through MOXIE technology, water extraction from ice deposits, and radiation shielding using regolith. Transportation needs reusable rockets with in-situ propellant production. Habitats must withstand dust storms and provide psychological well-being through biophilic design and communication systems.",
        time: (2.1 + Math.random() * 0.9).toFixed(1) + "s",
        tokens: 180 + Math.floor(Math.random() * 45),
        cost: "$0.00" + Math.floor(Math.random() * 6 + 3),
      },
      {
        text: "Successful Mars missions depend on autonomous systems for real-time decision making given communication delays. Develop closed-loop life support recycling air and water. Use nuclear power for consistent energy. Build underground structures for radiation protection. Establish supply chains with regular resupply missions and eventually local manufacturing capabilities.",
        time: (1.8 + Math.random() * 1.1).toFixed(1) + "s",
        tokens: 160 + Math.floor(Math.random() * 55),
        cost: "$0.00" + Math.floor(Math.random() * 5 + 2),
      },
      {
        text: "Mars settlement requires phased approach: initial robotic missions to set up infrastructure, then small crews with extensive training in multiple disciplines. Focus on agriculture in pressurized greenhouses using Martian soil with amendments. Develop robust communication networks and medical facilities. Plan for psychological support through recreation areas and Earth connection.",
        time: (2.3 + Math.random() * 0.8).toFixed(1) + "s",
        tokens: 195 + Math.floor(Math.random() * 50),
        cost: "$0.00" + Math.floor(Math.random() * 7 + 3),
      },
    ],
    // Theme 3: Renewable Energy
    [
      {
        text: "Transitioning to renewable energy requires grid modernization with smart meters and battery storage systems. Solar and wind need geographical diversity to ensure consistent supply. Implement demand response programs and upgrade transmission infrastructure. Use AI for predictive maintenance and load balancing. Phase out fossil fuels gradually while maintaining energy security.",
        time: (1.6 + Math.random() * 0.9).toFixed(1) + "s",
        tokens: 145 + Math.floor(Math.random() * 40),
        cost: "$0.00" + Math.floor(Math.random() * 5 + 2),
      },
      {
        text: "Renewable energy adoption requires policy incentives like feed-in tariffs and carbon pricing. Invest in grid-scale battery storage and pumped hydro. Develop offshore wind farms and concentrated solar power with thermal storage. Create jobs through workforce retraining programs. Address intermittency with diverse renewable portfolio and flexible demand management systems.",
        time: (1.9 + Math.random() * 1.0).toFixed(1) + "s",
        tokens: 165 + Math.floor(Math.random() * 45),
        cost: "$0.00" + Math.floor(Math.random() * 6 + 2),
      },
      {
        text: "Sustainable energy transition needs community-scale microgrids with local generation and storage. Use vehicle-to-grid technology to leverage EV batteries. Retrofit buildings with heat pumps and better insulation. Implement time-of-use pricing to shift demand. Combine solar, wind, and geothermal based on regional resources for optimal mix.",
        time: (1.4 + Math.random() * 0.8).toFixed(1) + "s",
        tokens: 130 + Math.floor(Math.random() * 38),
        cost: "$0.00" + Math.floor(Math.random() * 4 + 2),
      },
    ],
  ]

  // Select theme based on prompt index
  const theme = promptThemes[promptIndex % promptThemes.length]

  // Use model name hash to consistently select a response variant for each model
  const modelHash = modelName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const responseIndex = modelHash % theme.length

  return theme[responseIndex]
}

export function ComparisonView({
  models,
  scenario,
  customScenarioData,
  onContinueToScoring,
  onBack,
}: ComparisonViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [promptIndex, setPromptIndex] = useState(0)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const currentModel = models[currentIndex]
  const prompts = customScenarioData?.prompts || DEFAULT_PROMPTS

  const currentResponse = generateMockResponse(currentModel?.name || currentModel?.id, promptIndex)

  const modelColor = currentIndex === 0 ? "bg-primary/10 border-primary/30" : "bg-accent/10 border-accent/30"

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) {
      // Swipe left - next model
      if (currentIndex < models.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }

    if (touchEndX.current - touchStartX.current > 75) {
      // Swipe right - previous model
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
    }
  }

  const handleContinueToScoring = () => {
    const allResponses: Record<string, Record<string, any>> = {}

    models.forEach((model) => {
      allResponses[model.id] = {}
      prompts.forEach((_, idx) => {
        allResponses[model.id][`prompt-${idx}`] = generateMockResponse(model.name, idx)
      })
    })

    console.log("[v0] ComparisonView - Passing prompts to scoring:", prompts)
    console.log("[v0] ComparisonView - Response keys:", Object.keys(allResponses[models[0]?.id] || {}))
    onContinueToScoring(prompts, allResponses)
  }

  const handleNext = () => {
    // If not at last model, go to next model for same prompt
    if (currentIndex < models.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    // If at last model but not at last prompt, go to first model of next prompt
    else if (promptIndex < prompts.length - 1) {
      setCurrentIndex(0)
      setPromptIndex(promptIndex + 1)
    }
    // Otherwise we're at the end, do nothing
  }

  const handlePrevious = () => {
    // If not at first model, go to previous model for same prompt
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
    // If at first model but not at first prompt, go to last model of previous prompt
    else if (promptIndex > 0) {
      setCurrentIndex(models.length - 1)
      setPromptIndex(promptIndex - 1)
    }
    // Otherwise we're at the beginning, do nothing
  }

  const isAtEnd = currentIndex === models.length - 1 && promptIndex === prompts.length - 1
  const isAtStart = currentIndex === 0 && promptIndex === 0

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Logo size={24} className="rounded-lg" />
            <span className="font-semibold text-foreground text-sm">
              Compare<span className="text-primary">LY</span>
            </span>
          </div>
        </div>
        <div className="ml-10">
          <p className="text-xs text-muted-foreground">
            Prompt {promptIndex + 1} of {prompts.length}
          </p>
        </div>
      </header>

      {/* Prompt Navigation Tabs */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground mb-2">Tested Prompts</p>
        <div className="flex gap-2 overflow-x-auto">
          {prompts.map((_, idx) => (
            <Button
              key={idx}
              variant={promptIndex === idx ? "default" : "outline"}
              size="sm"
              onClick={() => setPromptIndex(idx)}
              className="flex-shrink-0 h-8"
            >
              Prompt {idx + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Model Switcher */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground mb-2">Model Responses</p>
        <div className="flex gap-2 overflow-x-auto">
          {models.map((model, idx) => (
            <Button
              key={model.id}
              variant={currentIndex === idx ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentIndex(idx)}
              className="flex-shrink-0 h-8"
            >
              {model.name || model.id}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Prompt */}
        <Card className="p-3 mb-3 bg-muted/30 border-border">
          <div className="flex items-start gap-2 mb-1.5">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prompt</p>
          </div>
          <p className="leading-relaxed text-sm text-foreground">{prompts[promptIndex]}</p>
        </Card>

        {/* Response */}
        {currentModel && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm text-foreground">{currentModel.name}</h3>
                <p className="text-xs text-muted-foreground">{currentModel.provider}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Complete
              </Badge>
            </div>
            <Card className={`p-3 border-2 ${modelColor}`}>
              <p className="leading-relaxed mb-3 text-sm text-foreground">{currentResponse.text}</p>

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Time</span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-foreground">{currentResponse.time}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <FileText className="h-3 w-3" />
                    <span>Tokens</span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-foreground">{currentResponse.tokens}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Cost</span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-foreground">{currentResponse.cost}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation hint */}
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">Swipe, tap, or use buttons to switch models</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-border bg-card px-4 py-3 space-y-3">
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isAtStart}
            className="flex-1 bg-transparent h-10"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={isAtEnd} className="flex-1 h-10">
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <Button onClick={handleContinueToScoring} className="w-full h-10" variant="secondary">
          Continue to Scoring
        </Button>
      </div>
    </div>
  )
}
