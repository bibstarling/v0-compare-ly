"use client"

import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Palette,
  CreditCard,
  User,
  Info,
  LogOut,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SettingsScreenProps {
  onBack: () => void
  onLogout: () => void
  onProvidersChange: (providers: string[]) => void
  onProvidersDataChange: (providers: any[]) => void
  openAddProviderModal?: boolean
  onAddProviderModalClose?: () => void
  isReturningUser?: boolean
  testsCompleted?: number
  totalPrompts?: number
}

type ConnectedProvider = {
  id: string
  name: string
  apiKey: string
  status: string
  modelCount: number
}

type ConnectionStatus = "connected" | "connecting"

const KNOWN_PROVIDERS = [
  { id: "openai", name: "OpenAI", requiresKey: true, authType: "API Key" },
  { id: "anthropic", name: "Anthropic", requiresKey: true, authType: "API Key" },
  { id: "google", name: "Google AI Studio", requiresKey: true, authType: "API Key" },
  { id: "mistral", name: "Mistral", requiresKey: true, authType: "API Key" },
  { id: "groq", name: "Groq", requiresKey: true, authType: "API Key" },
  { id: "openrouter", name: "OpenRouter", requiresKey: true, authType: "API Key" },
  { id: "azure", name: "Azure OpenAI", requiresKey: true, authType: "API Key" },
]

type FlowState =
  | { stage: "idle" }
  | { stage: "input-key"; providerId: string; providerName: string }
  | { stage: "validating"; providerId: string; providerName: string; apiKey: string }
  | { stage: "fetching-models"; providerId: string; providerName: string; apiKey: string }
  | { stage: "error"; providerId: string; providerName: string; error: string; apiKey: string }
  | { stage: "success"; providerId: string; providerName: string; models: string[] }

type Provider = {
  id: string
  name: string
  description: string
  recommended: boolean
  models: Array<{ id: string; name: string; description: string; speed: string; cost: string; tags?: string[] }>
}

function SettingsScreen({
  onBack,
  onLogout,
  onProvidersChange,
  onProvidersDataChange,
  openAddProviderModal = false,
  onAddProviderModalClose,
  isReturningUser = false,
  testsCompleted = 0,
  totalPrompts = 0,
}: SettingsScreenProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [showCustomProvider, setShowCustomProvider] = useState(false)
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [showAppearanceScreen, setShowAppearanceScreen] = useState(false)
  const [providerApiKey, setProviderApiKey] = useState("")
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system")
  const [connectedProviders, setConnectedProviders] = useState<ConnectedProvider[]>([])
  const [flowState, setFlowState] = useState<FlowState>({ stage: "idle" })
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [enabledModels, setEnabledModels] = useState<Record<string, boolean>>({
    "openai-gpt4o": true,
    "openai-gpt4o-mini": true,
    "openai-gpt35-turbo": true,
    "anthropic-claude35-sonnet": true,
    "anthropic-claude3-opus": true,
  })
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [tokensThisWeek, setTokensThisWeek] = useState(isReturningUser ? 127450 : 0)
  const [estimatedCost, setEstimatedCost] = useState(isReturningUser ? 12.45 : 0)

  useEffect(() => {
    if (openAddProviderModal) {
      setShowAddProvider(true)
      onAddProviderModalClose?.()
    }
  }, [openAddProviderModal, onAddProviderModalClose])

  const mockProvidersDataForModels = (providerIds: string[]): Provider[] => {
    return providerIds
      .map((id) => {
        const p = KNOWN_PROVIDERS.find((kp) => kp.id === id)
        if (!p) return null

        const modelsList: Record<
          string,
          Array<{ name: string; description: string; speed: string; cost: string; tags?: string[] }>
        > = {
          openai: [
            { name: "GPT-4o", description: "Most capable model", speed: "Fast", cost: "$$$", tags: ["Latest"] },
            { name: "GPT-4o Mini", description: "Fast and efficient", speed: "Very Fast", cost: "$$" },
            { name: "GPT-3.5 Turbo", description: "Cost-effective option", speed: "Ultra Fast", cost: "$" },
          ],
          anthropic: [
            {
              name: "Claude 3.5 Sonnet",
              description: "Most capable model",
              speed: "Fast",
              cost: "$$$",
              tags: ["Latest"],
            },
            { name: "Claude 3 Opus", description: "Powerful and balanced", speed: "Fast", cost: "$$$" },
            { name: "Claude 3 Haiku", description: "Fast and cost-effective", speed: "Ultra Fast", cost: "$" },
          ],
          google: [
            { name: "Gemini Pro", description: "Most capable model", speed: "Fast", cost: "$$$", tags: ["Latest"] },
            { name: "Gemini Flash", description: "Fast and efficient", speed: "Very Fast", cost: "$$" },
          ],
          mistral: [
            { name: "Mistral Large", description: "Most capable model", speed: "Fast", cost: "$$$" },
            { name: "Mistral Medium", description: "Balanced performance", speed: "Fast", cost: "$$" },
            { name: "Mistral Small", description: "Cost-effective option", speed: "Very Fast", cost: "$" },
          ],
          groq: [
            {
              name: "Llama 3.1 70B",
              description: "Ultra-fast inference",
              speed: "Ultra Fast",
              cost: "$$",
              tags: ["Latest"],
            },
            { name: "Mixtral 8x7B", description: "Fast and efficient", speed: "Ultra Fast", cost: "$" },
          ],
          openrouter: [{ name: "Various Models", description: "Access multiple providers", speed: "Fast", cost: "$$" }],
          azure: [
            { name: "GPT-4 (Azure)", description: "Enterprise-grade GPT-4", speed: "Fast", cost: "$$$" },
            { name: "GPT-3.5 Turbo (Azure)", description: "Cost-effective option", speed: "Very Fast", cost: "$$" },
          ],
        }

        const models = modelsList[id] || [
          { name: "Default Model", description: "Generic model", speed: "Fast", cost: "$$" },
        ]

        return {
          id: p.id,
          name: p.name,
          description: `Connected via API key`,
          recommended: true,
          models: models.map((model, index) => ({
            id: `${p.id}-${index + 1}`,
            name: model.name,
            description: model.description,
            speed: model.speed,
            cost: model.cost,
            tags: model.tags,
            enabled: true,
          })),
        }
      })
      .filter(Boolean) as Provider[]
  }

  const handleConnectProvider = async (providerId: string, isOAuth = false) => {
    const provider = KNOWN_PROVIDERS.find((p) => p.id === providerId)
    if (!provider) return

    if (isOAuth) {
      // Simulate OAuth flow
      console.log("[v0] Starting OAuth flow for", providerId)
      setFlowState({
        stage: "validating",
        providerId,
        providerName: provider.name,
        apiKey: "oauth-token",
      })
      setShowAddProvider(false)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate fetching models
      setFlowState({
        stage: "fetching-models",
        providerId,
        providerName: provider.name,
        apiKey: "oauth-token",
      })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockModelsData = {
        openai: ["GPT-4o", "GPT-4o Mini", "GPT-3.5 Turbo"],
        anthropic: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude 3 Haiku"],
        google: ["Gemini Pro", "Gemini Flash"],
        mistral: ["Mistral Large", "Mistral Medium", "Mistral Small"],
        groq: ["Llama 3.1 70B", "Mixtral 8x7B"],
        openrouter: ["Various Models"],
        azure: ["GPT-4 (Azure)", "GPT-3.5 Turbo (Azure)"],
      }

      const mockModels = mockModelsData[providerId] || ["Model 1", "Model 2"]
      const newProvider: ConnectedProvider = {
        id: providerId,
        name: provider.name,
        apiKey: "oauth-connected",
        status: "connected",
        modelCount: mockModels.length,
      }

      const updatedProviders = [...connectedProviders, newProvider]
      setConnectedProviders(updatedProviders)
      onProvidersChange(updatedProviders.map((p) => p.id))
      onProvidersDataChange(mockProvidersDataForModels(updatedProviders.map((p) => p.id)))

      setFlowState({
        stage: "success",
        providerId,
        providerName: provider.name,
        models: mockModels,
      })
    } else {
      setShowAddProvider(false)
      setFlowState({
        stage: "input-key",
        providerId,
        providerName: provider.name,
      })
      setConnectingProvider(providerId)
    }
  }

  const handleSaveApiKey = async () => {
    if (flowState.stage !== "input-key" || !providerApiKey.trim()) return

    const { providerId, providerName } = flowState
    console.log("[v0] Validating API key for", providerId)

    // Move to validating state
    setFlowState({
      stage: "validating",
      providerId,
      providerName,
      apiKey: providerApiKey,
    })

    // Simulate API validation - would be a real API call in production
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate random success/failure for demo (90% success rate)
    const isValid = Math.random() > 0.1

    if (!isValid) {
      console.log("[v0] Invalid API key")
      setFlowState({
        stage: "error",
        providerId,
        providerName,
        error: "Invalid API key. Please check your key and try again.",
        apiKey: providerApiKey,
      })
      return
    }

    console.log("[v0] API key valid, fetching models")

    // Move to fetching models state
    setFlowState({
      stage: "fetching-models",
      providerId,
      providerName,
      apiKey: providerApiKey,
    })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate model fetching - mock different model lists per provider
    const mockModelsData = {
      openai: ["GPT-4o", "GPT-4o Mini", "GPT-3.5 Turbo"],
      anthropic: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude 3 Haiku"],
      google: ["Gemini Pro", "Gemini Flash"],
      mistral: ["Mistral Large", "Mistral Medium", "Mistral Small"],
      groq: ["Llama 3.1 70B", "Mixtral 8x7B"],
      openrouter: ["Various Models"],
      azure: ["GPT-4 (Azure)", "GPT-3.5 Turbo (Azure)"],
    }

    const models = mockModelsData[providerId] || ["Model 1", "Model 2"]

    const newProvider: ConnectedProvider = {
      id: providerId,
      name: providerName,
      apiKey: providerApiKey,
      status: "connected",
      modelCount: models.length,
    }

    const updatedProviders = [...connectedProviders, newProvider]
    setConnectedProviders(updatedProviders)
    onProvidersChange(updatedProviders.map((p) => p.id))
    onProvidersDataChange(mockProvidersDataForModels(updatedProviders.map((p) => p.id)))

    setFlowState({
      stage: "success",
      providerId,
      providerName,
      models,
    })
    setProviderApiKey("")
    setConnectingProvider(null)
  }

  const handleRetryConnection = () => {
    if (flowState.stage !== "error") return

    const { providerId, providerName, apiKey } = flowState
    setFlowState({
      stage: "input-key",
      providerId,
      providerName,
    })
    setProviderApiKey(apiKey)
    setConnectingProvider(providerId)
  }

  const handleCloseFlow = () => {
    setFlowState({ stage: "idle" })
    setProviderApiKey("")
    setConnectingProvider(null)
  }

  const handleConnectCustomProvider = async () => {
    if (!providerApiKey.trim() || !connectingProvider) return

    console.log("[v0] Connecting to", connectingProvider, "and fetching models")

    // Simulate API connection and model fetch
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newProvider: ConnectedProvider = {
      id: connectingProvider,
      name: KNOWN_PROVIDERS.find((p) => p.id === connectingProvider)?.name || connectingProvider,
      apiKey: providerApiKey,
      status: "connected",
      modelCount: Math.floor(Math.random() * 5) + 2,
    }

    const updatedProviders = [...connectedProviders, newProvider]
    setConnectedProviders(updatedProviders)
    onProvidersChange(updatedProviders.map((p) => p.id))
    setConnectingProvider(null)
    setProviderApiKey("")
    setShowAddProvider(false)
  }

  const handleDisconnect = (providerId: string) => {
    const updatedProviders = connectedProviders.filter((p) => p.id !== providerId)
    setConnectedProviders(updatedProviders)
    onProvidersChange(updatedProviders.map((p) => p.id))
    onProvidersDataChange(mockProvidersDataForModels(updatedProviders.map((p) => p.id)))
  }

  const handleRefreshModels = async (providerId: string) => {
    console.log("[v0] Refreshing models for", providerId)

    // Set provider to connecting state
    setConnectedProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, status: "connecting" as ConnectionStatus } : p)),
    )

    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Update with new model count
    setConnectedProviders((prev) => {
      const updated = prev.map((p) =>
        p.id === providerId
          ? { ...p, status: "connected" as ConnectionStatus, modelCount: Math.floor(Math.random() * 5) + 2 }
          : p,
      )
      onProvidersDataChange(mockProvidersDataForModels(updated.map((p) => p.id)))
      return updated
    })
  }

  const isProviderConnected = (providerId: string) => {
    return connectedProviders.some((p) => p.id === providerId)
  }

  const toggleModel = (modelId: string) => {
    setEnabledModels((prev) => ({
      ...prev,
      [modelId]: !prev[modelId],
    }))
  }

  const maskApiKey = (apiKey: string) => {
    if (!apiKey) return ""
    return "•".repeat(32) + apiKey.slice(-4)
  }

  const handleResetUsage = () => {
    setTokensThisWeek(0)
    setEstimatedCost(0)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Logo size={28} className="rounded-md" />
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-medium">Compare</span>
              <span className="text-base font-medium text-primary">LY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Account */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Account
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
              <span className="text-sm">sanford@sierra.studio</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Free Plan</span>
                <span className="text-xs text-muted-foreground">Unlimited comparisons</span>
              </div>
            </div>
          </div>
        </section>

        {/* Usage */}
        <section className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            Usage
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            {testsCompleted === 0 && totalPrompts === 0 ? (
              <div className="py-3 text-center">
                <p className="text-sm text-muted-foreground">No usage data yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Start running comparisons to track your usage</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tests completed</span>
                  <span className="text-sm font-medium">{testsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total prompts</span>
                  <span className="text-sm font-medium">{totalPrompts}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* About */}
        <section className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            About
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
              <span className="text-sm">Version</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <button className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 hover:bg-muted/50">
              <span className="text-sm">Privacy Policy</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 hover:bg-muted/50">
              <span className="text-sm">Terms of Service</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Appearance */}
        <section className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Palette className="h-3.5 w-3.5" />
            Appearance
          </div>
          <button
            onClick={() => setShowAppearanceScreen(true)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 hover:bg-muted/50"
          >
            <span className="text-sm capitalize">System Default</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>

        <div className="mt-4">
          <Button variant="destructive" className="w-full" onClick={() => setShowLogoutDialog(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>

      {/* Add Provider Selection Dialog */}
      <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Provider</DialogTitle>
            <DialogDescription>Connect a model provider to start comparing AI models</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Suggested Providers</h3>
              <div className="space-y-2">
                {KNOWN_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleConnectProvider(provider.id, provider.isOAuth)}
                    disabled={isProviderConnected(provider.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">{provider.name}</div>
                      <div className="text-xs text-muted-foreground">{provider.authType}</div>
                    </div>
                    {isProviderConnected(provider.id) ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowAddProvider(false)
                  setShowCustomProvider(true)
                }}
                className="flex w-full items-center justify-between rounded-lg border border-dashed border-border bg-muted/20 p-3 hover:bg-muted/50"
              >
                <div className="text-left">
                  <div className="text-sm font-medium">Custom Provider</div>
                  <div className="text-xs text-muted-foreground">Advanced: Add your own API endpoint</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProvider(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Input Dialog */}
      <Dialog open={flowState.stage === "input-key"} onOpenChange={handleCloseFlow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {flowState.stage === "input-key" ? flowState.providerName : ""}</DialogTitle>
            <DialogDescription>Enter your API key to connect this provider</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                value={providerApiKey}
                onChange={(e) => setProviderApiKey(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseFlow}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey} disabled={providerApiKey.trim().length < 5}>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validating/Fetching Models Loading Dialog */}
      <Dialog open={flowState.stage === "validating" || flowState.stage === "fetching-models"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" hideClose>
          <DialogHeader>
            <DialogTitle>
              {flowState.stage === "validating"
                ? `Connecting to ${flowState.stage === "validating" ? flowState.providerName : ""}...`
                : `Fetching models from ${flowState.stage === "fetching-models" ? flowState.providerName : ""}...`}
            </DialogTitle>
            <DialogDescription>
              {flowState.stage === "validating"
                ? "Validating your API key and establishing connection."
                : "Loading available models from your provider."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              {flowState.stage === "validating" ? "Please wait..." : "This may take a moment..."}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={flowState.stage === "error"} onOpenChange={handleCloseFlow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Couldn't Connect to {flowState.stage === "error" ? flowState.providerName : ""}</DialogTitle>
            <DialogDescription>{flowState.stage === "error" ? flowState.error : ""}</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Your API key appears to be invalid or the connection failed. Please verify your credentials and try again.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseFlow}>
              Cancel
            </Button>
            <Button onClick={handleRetryConnection}>Retry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Confirmation Dialog */}
      <Dialog open={flowState.stage === "success"} onOpenChange={handleCloseFlow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              {flowState.stage === "success" ? flowState.providerName : ""} Connected
            </DialogTitle>
            <DialogDescription>Your API key is valid and your models are ready to use.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {flowState.stage === "success" && flowState.models.length} models added
              </span>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">
                Model list automatically updates when your provider releases new versions.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseFlow} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Provider Dialog - Not implemented fully */}
      <Dialog open={showCustomProvider} onOpenChange={setShowCustomProvider}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Provider</DialogTitle>
            {/* Updated description for custom provider dialog */}
            <DialogDescription>This feature is coming soon</DialogDescription>
          </DialogHeader>
          {/* Removed input fields from custom provider dialog */}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomProvider(false)
                setShowAddProvider(true)
              }}
            >
              Back
            </Button>
            {/* Removed Connect button from custom provider dialog */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out of CompareLY?</DialogTitle>
            <DialogDescription>You'll need to sign in again to access your account.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowLogoutDialog(false)
                onLogout()
              }}
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing provider and managing models */}
      <Dialog open={editingProvider !== null} onOpenChange={() => setEditingProvider(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{connectedProviders.find((p) => p.id === editingProvider)?.name} Models</DialogTitle>
            <DialogDescription>Manage available models for this provider</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {connectedProviders.find((p) => p.id === editingProvider)?.modelCount || 0} models detected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (editingProvider) {
                    handleRefreshModels(editingProvider)
                  }
                }}
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Refresh Models
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">
                Models are automatically fetched from your connected provider. Click Refresh to update the list.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Available Models</div>
              <div className="space-y-2">
                {/* Mock models - in real app, these would come from the API */}
                {editingProvider === "openai" && (
                  <>
                    <button
                      onClick={() => toggleModel("openai-gpt4o")}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left hover:bg-muted/50"
                    >
                      <div>
                        <div className="text-sm font-medium">GPT-4o</div>
                        <div className="text-xs text-muted-foreground">Most capable model</div>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                          enabledModels["openai-gpt4o"]
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30 bg-background"
                        }`}
                      >
                        {enabledModels["openai-gpt4o"] && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </button>
                    <button
                      onClick={() => toggleModel("openai-gpt4o-mini")}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left hover:bg-muted/50"
                    >
                      <div>
                        <div className="text-sm font-medium">GPT-4o Mini</div>
                        <div className="text-xs text-muted-foreground">Fast and efficient</div>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                          enabledModels["openai-gpt4o-mini"]
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30 bg-background"
                        }`}
                      >
                        {enabledModels["openai-gpt4o-mini"] && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </button>
                    <button
                      onClick={() => toggleModel("openai-gpt35-turbo")}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left hover:bg-muted/50"
                    >
                      <div>
                        <div className="text-sm font-medium">GPT-3.5 Turbo</div>
                        <div className="text-xs text-muted-foreground">Cost-effective option</div>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                          enabledModels["openai-gpt35-turbo"]
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30 bg-background"
                        }`}
                      >
                        {enabledModels["openai-gpt35-turbo"] && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </button>
                  </>
                )}
                {editingProvider === "anthropic" && (
                  <>
                    <button
                      onClick={() => toggleModel("anthropic-claude35-sonnet")}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left hover:bg-muted/50"
                    >
                      <div>
                        <div className="text-sm font-medium">Claude 3.5 Sonnet</div>
                        <div className="text-xs text-muted-foreground">Best overall model</div>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                          enabledModels["anthropic-claude35-sonnet"]
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30 bg-background"
                        }`}
                      >
                        {enabledModels["anthropic-claude35-sonnet"] && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => toggleModel("anthropic-claude3-opus")}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left hover:bg-muted/50"
                    >
                      <div>
                        <div className="text-sm font-medium">Claude 3 Opus</div>
                        <div className="text-xs text-muted-foreground">Most powerful</div>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                          enabledModels["anthropic-claude3-opus"]
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30 bg-background"
                        }`}
                      >
                        {enabledModels["anthropic-claude3-opus"] && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </button>
                  </>
                )}
                {editingProvider && editingProvider !== "openai" && editingProvider !== "anthropic" && (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      Models will appear here once fetched from the provider
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Connection Details
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">API Key</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {showApiKey[editingProvider || ""]
                        ? connectedProviders.find((p) => p.id === editingProvider)?.apiKey
                        : maskApiKey(connectedProviders.find((p) => p.id === editingProvider)?.apiKey || "")}
                    </span>
                    <button
                      onClick={() =>
                        setShowApiKey((prev) => ({
                          ...prev,
                          [editingProvider || ""]: !prev[editingProvider || ""],
                        }))
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey[editingProvider || ""] ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Update API Key
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (editingProvider) {
                    handleDisconnect(editingProvider)
                  }
                }}
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="mr-2 h-3.5 w-3.5" />
                Disconnect Provider
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setEditingProvider(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appearance Subscreen Dialog */}
      <Dialog open={showAppearanceScreen} onOpenChange={setShowAppearanceScreen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appearance</DialogTitle>
            <DialogDescription>Choose how CompareLY looks on your device</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {[
              { value: "system", label: "System Default", description: "Match your device settings" },
              { value: "light", label: "Light", description: "Light mode" },
              { value: "dark", label: "Dark", description: "Dark mode" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value as typeof theme)
                  // Persist theme preference
                  localStorage.setItem("comparely-theme", option.value)
                  // Apply theme to document
                  if (option.value === "system") {
                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
                    document.documentElement.classList.toggle("dark", prefersDark)
                  } else {
                    document.documentElement.classList.toggle("dark", option.value === "dark")
                  }
                }}
                className="flex w-full items-start justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="text-left">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
                {theme === option.value && (
                  <div className="mt-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowAppearanceScreen(false)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { SettingsScreen }
