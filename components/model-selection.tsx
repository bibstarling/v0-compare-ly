"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AddProviderModal } from "@/components/add-provider-modal" // Import AddProviderModal
import {
  Check,
  Settings,
  Zap,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Plus,
  Sparkles,
  History,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Provider {
  id: string
  name: string
  description: string
  models: Array<{ id: string; name: string; description: string; speed: string; cost: string; tags?: string[] }>
}

interface ModelSelectionProps {
  selected: Array<{ id: string; name: string; provider: string }>
  onSelectionChange: (models: Array<{ id: string; name: string; provider: string }>) => void
  onNext: () => void
  onHistory: () => void
  onSettings: () => void
  onAddProvider?: () => void
  connectedProviders: string[]
  providers: Provider[]
  onProvidersChange?: (providers: string[]) => void
  onProvidersDataChange?: (providers: Provider[]) => void
  handleDeleteProvider?: (providerId: string) => void
  handleEditProvider?: (providerId: string) => void
  handleDeleteModel?: (providerId: string, modelId: string) => void
  handleEditModel?: (providerId: string, modelId: string) => void
  handleProviderAdded?: (provider: Provider) => void // Add handleProviderAdded prop
}

const KNOWN_PROVIDERS = [
  { id: "openai", name: "OpenAI", authType: "API Key", isOAuth: false },
  { id: "anthropic", name: "Anthropic", authType: "API Key", isOAuth: false },
  { id: "google", name: "Google", authType: "API Key", isOAuth: false },
  { id: "mistral", name: "Mistral", authType: "API Key", isOAuth: false },
  { id: "groq", name: "Groq", authType: "API Key", isOAuth: false },
  { id: "openrouter", name: "OpenRouter", authType: "API Key", isOAuth: false },
  { id: "azure", name: "Azure OpenAI", authType: "API Key", isOAuth: false },
]

type FlowState =
  | { stage: "idle" }
  | { stage: "input-key"; providerId: string; providerName: string }
  | { stage: "validating"; providerId: string; providerName: string; apiKey: string }
  | { stage: "fetching-models"; providerId: string; providerName: string; apiKey: string }
  | { stage: "error"; providerId: string; providerName: string; error: string; apiKey: string }
  | { stage: "success"; providerId: string; providerName: string; models: string[] }

const ModelSelection = ({
  selected: initialSelected = [],
  onSelectionChange,
  providers = [],
  connectedProviders = [],
  onNext,
  onHistory,
  onSettings,
  onAddProvider,
  onProvidersChange,
  onProvidersDataChange,
  handleDeleteProvider,
  handleEditProvider,
  handleDeleteModel,
  handleEditModel,
  handleProviderAdded,
}: ModelSelectionProps) => {
  const [selected, setSelected] = useState(initialSelected.map((m) => m.id))
  const [showAddProviderModal, setShowAddProviderModal] = useState(false)
  const [flowState, setFlowState] = useState<FlowState>({ stage: "idle" })
  const [providerApiKey, setProviderApiKey] = useState("")
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set(["openai", "google"]))
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean
    type: "provider" | "model"
    providerId: string
    modelId?: string
    name: string
  } | null>(null)
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [editingModel, setEditingModel] = useState<{ providerId: string; modelId: string } | null>(null)

  useEffect(() => {
    // Implementation for useEffect
  }, [providers])

  const toggleProvider = (providerId: string) => {
    const newExpandedProviders = new Set(expandedProviders)
    if (newExpandedProviders.has(providerId)) {
      newExpandedProviders.delete(providerId)
    } else {
      newExpandedProviders.add(providerId)
    }
    setExpandedProviders(newExpandedProviders)
  }

  const toggleModel = (modelId: string, providerId: string) => {
    const newSelected = selected.includes(modelId) ? selected.filter((m) => m !== modelId) : [...selected, modelId]
    setSelected(newSelected)

    const modelsWithNames = newSelected.map((id) => {
      const provider = providers.find((p) => p.id === providerId)
      const model = provider?.models.find((m) => m.id === id)
      return {
        id,
        name: model?.name || id,
        provider: providerId,
      }
    })
    onSelectionChange(modelsWithNames)
  }

  const getSelectedCount = (provider: Provider) => {
    return provider.models.filter((model) => selected.includes(model.id)).length
  }

  const handleConnectProvider = (providerId: string, isOAuth: boolean) => {
    console.log("[v0] Connecting provider:", providerId, "OAuth:", isOAuth)

    if (isOAuth) {
      console.log("[v0] Starting OAuth flow for", providerId)
      setShowAddProviderModal(false)

      // Simulate OAuth flow
      setTimeout(() => {
        const mockModels = mockProviderModels[providerId] || []

        if (mockModels.length === 0) {
          alert(`Cannot connect ${providerId}: No models available for this provider.`)
          return
        }

        const newProvider: Provider = {
          id: providerId,
          name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
          description: `${providerId} provider`,
          models: mockModels,
        }

        if (onProvidersDataChange) {
          onProvidersDataChange([...providers, newProvider])
        }
        if (onProvidersChange) {
          onProvidersChange([...connectedProviders, providerId])
        }
      }, 1000)
    } else {
      const providerName = KNOWN_PROVIDERS.find((p) => p.id === providerId)?.name || providerId
      setShowAddProviderModal(false)
      setFlowState({
        stage: "input-key",
        providerId,
        providerName,
      })
    }
  }

  const handleSaveApiKey = async () => {
    if (flowState.stage !== "input-key" || !providerApiKey.trim()) return

    const { providerId, providerName } = flowState
    console.log("[v0] Validating API key for", providerId)

    setFlowState({
      stage: "validating",
      providerId,
      providerName,
      apiKey: providerApiKey,
    })

    await new Promise((resolve) => setTimeout(resolve, 1500))

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

    setFlowState({
      stage: "fetching-models",
      providerId,
      providerName,
      apiKey: providerApiKey,
    })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockModels = mockProviderModels[providerId] || []

    if (mockModels.length === 0) {
      setFlowState({
        stage: "error",
        providerId,
        providerName,
        error: "No models available for this provider. Please try a different provider or check back later.",
        apiKey: providerApiKey,
      })
      return
    }

    const newProvider: Provider = {
      id: providerId,
      name: providerName,
      description: `${providerId} provider`,
      models: mockModels,
    }

    if (onProvidersDataChange) {
      onProvidersDataChange([...providers, newProvider])
    }
    if (onProvidersChange) {
      onProvidersChange([...connectedProviders, providerId])
    }

    setFlowState({
      stage: "success",
      providerId,
      providerName,
      models: mockModels.map((m) => m.name),
    })

    setProviderApiKey("")
  }

  const handleCloseFlow = () => {
    setFlowState({ stage: "idle" })
    setProviderApiKey("")
  }

  const handleRetry = () => {
    if (flowState.stage === "error") {
      setFlowState({
        stage: "input-key",
        providerId: flowState.providerId,
        providerName: flowState.providerName,
      })
      setProviderApiKey(flowState.apiKey)
    }
  }

  const handleFinish = () => {
    setFlowState({ stage: "idle" })
    setProviderApiKey("")
  }

  const isProviderConnected = (providerId: string) => {
    return connectedProviders.includes(providerId)
  }

  const displayedProviders = providers.filter((provider) => provider.models.length > 0)

  const hasProviders = providers.length > 0 || connectedProviders.length > 0

  const handleOpenEditProvider = (providerId: string) => {
    console.log("[v0] Opening edit mode for provider:", providerId)
    setEditingProvider(providerId)
    setIsAddProviderOpen(true)
  }

  const handleOpenEditModel = (providerId: string, modelId: string) => {
    console.log("[v0] Opening edit mode for model:", providerId, modelId)
    setEditingModel({ providerId, modelId })
    setIsAddProviderOpen(true)
  }

  const handleCloseProviderModal = () => {
    setIsAddProviderOpen(false)
    setEditingProvider(null)
    setEditingModel(null)
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return

    if (deleteConfirmation.type === "provider") {
      // Remove provider from providers list
      if (onProvidersDataChange) {
        onProvidersDataChange(providers.filter((p) => p.id !== deleteConfirmation.providerId))
      }
      if (onProvidersChange) {
        onProvidersChange(connectedProviders.filter((p) => p !== deleteConfirmation.providerId))
      }
      // Deselect all models from this provider
      const providerToDelete = providers.find((p) => p.id === deleteConfirmation.providerId)
      if (providerToDelete) {
        const modelIdsToRemove = providerToDelete.models.map((m) => m.id)
        const newSelected = selected.filter((id) => !modelIdsToRemove.includes(id))
        setSelected(newSelected)
        const modelsWithNames = newSelected
          .map((id) => {
            const provider = providers.find((p) => p.models.some((m) => m.id === id))
            const model = provider?.models.find((m) => m.id === id)
            return model
              ? {
                  id,
                  name: model.name,
                  provider: provider!.id,
                }
              : null
          })
          .filter((m): m is { id: string; name: string; provider: string } => m !== null)
        onSelectionChange(modelsWithNames)
      }
    } else if (deleteConfirmation.type === "model" && deleteConfirmation.modelId) {
      // Remove model from provider
      if (onProvidersDataChange) {
        const updatedProviders = providers.map((p) => {
          if (p.id === deleteConfirmation.providerId) {
            return {
              ...p,
              models: p.models.filter((m) => m.id !== deleteConfirmation.modelId),
            }
          }
          return p
        })
        onProvidersDataChange(updatedProviders)
      }
      // Deselect the model
      const newSelected = selected.filter((id) => id !== deleteConfirmation.modelId)
      setSelected(newSelected)
      const modelsWithNames = newSelected
        .map((id) => {
          const provider = providers.find((p) => p.models.some((m) => m.id === id))
          const model = provider?.models.find((m) => m.id === id)
          return model
            ? {
                id,
                name: model.name,
                provider: provider!.id,
              }
            : null
        })
        .filter((m): m is { id: string; name: string; provider: string } => m !== null)
      onSelectionChange(modelsWithNames)
    }

    setDeleteConfirmation(null)
  }

  const handleProviderAddedInternal = (provider: Provider) => {
    console.log("[v0] Provider added:", provider)

    // Call the prop handler if it exists
    if (handleProviderAdded) {
      handleProviderAdded(provider)
    } else {
      // Fallback: add provider to local state
      if (onProvidersDataChange) {
        onProvidersDataChange([...providers, provider])
      }
    }
  }

  return (
    <div className="h-full bg-background flex flex-col">
      <header className="flex-shrink-0 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-base font-semibold">
            Hi, Sanford from Sierra Studio <span className="text-muted-foreground">👋</span>
          </h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onHistory} className="h-9 w-9">
              <History className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onSettings} className="h-9 w-9">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Pick models to compare</p>
      </header>

      {providers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Models Yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">Connect a provider to start comparing AI models</p>
          <Button onClick={() => setShowAddProviderModal(true)} size="lg" className="min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-shrink-0 px-4 py-3 border-b border-border">
            <Button
              onClick={() => setShowAddProviderModal(true)}
              variant="outline"
              className="w-full justify-start h-auto py-3 border-2 border-dashed hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {displayedProviders.map((provider) => (
              <div key={provider.id} className="space-y-2">
                <Card
                  className={cn(
                    "p-3 cursor-pointer transition-all duration-200 border-border hover:border-primary/30 bg-card",
                    getSelectedCount(provider) > 0 && "border-primary/30",
                  )}
                  onClick={() => toggleProvider(provider.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="h-9 w-9 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {provider.id === "openai" && (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 0-.071 0l4.8303-2.7866a4.4992 4.4992 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                        </svg>
                      )}
                      {provider.id === "anthropic" && (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.573h-2.828l-1.223-3.139H9.157l-1.223 3.139H5.106L9.75 6.427h2.5l4.644 11.146zm-7.198-5.297h3.608L12.5 8.144h-.032l-1.772 4.132z" />
                        </svg>
                      )}
                      {provider.id === "google" && (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      )}
                      {!["openai", "anthropic", "google"].includes(provider.id) && (
                        <span className="text-base font-normal text-muted-foreground/70">
                          {provider.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-semibold text-sm text-foreground truncate">{provider.name}</h3>
                        {getSelectedCount(provider) > 0 && (
                          <Badge variant="default" className="text-[10px] px-1.5 h-4 font-normal flex-shrink-0">
                            {getSelectedCount(provider)} selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{provider.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirmation({
                              open: true,
                              type: "provider",
                              providerId: provider.id,
                              name: provider.name,
                            })
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEditProvider(provider.id)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span>{provider.models.length} models</span>
                        {expandedProviders.has(provider.id) ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {expandedProviders.has(provider.id) && (
                  <div className="ml-3 mt-2 space-y-2 border-l-2 border-border pl-3">
                    {provider.models.map((model) => {
                      const isSelected = selected.includes(model.id)
                      return (
                        <Card
                          key={model.id}
                          className={cn(
                            "p-3 cursor-pointer transition-all duration-200",
                            isSelected
                              ? "border-primary/50 bg-primary/5"
                              : "border-border hover:border-primary/30 bg-card",
                          )}
                          onClick={(e) => {
                            const target = e.target as HTMLElement
                            if (!target.closest("button")) {
                              toggleModel(model.id, provider.id)
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-1.5 mb-1">
                                <h4 className="font-medium text-sm text-foreground truncate flex-1">{model.name}</h4>
                                {model.tags && model.tags.length > 0 && (
                                  <div className="flex gap-1 flex-shrink-0">
                                    {model.tags.slice(0, 2).map((tag, i) => (
                                      <Badge
                                        key={i}
                                        variant="secondary"
                                        className="text-[9px] px-1.5 py-0 h-4 font-normal"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{model.description}</p>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{model.speed}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{model.cost}</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteConfirmation({
                                    open: true,
                                    type: "model",
                                    providerId: provider.id,
                                    modelId: model.id,
                                    name: model.name,
                                  })
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                              {isSelected && (
                                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-shrink-0 bg-background pt-3 pb-3 border-t border-border px-4">
            <Button onClick={onNext} disabled={selected.length < 2} className="w-full font-medium min-h-[48px]">
              {selected.length < 2
                ? "Select at least 2 models"
                : `Continue with ${selected.length} model${selected.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </>
      )}

      <Dialog open={showAddProviderModal} onOpenChange={setShowAddProviderModal}>
        <DialogContent className="max-h-[80vh] flex flex-col sm:max-w-[425px]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add Provider</DialogTitle>
            <DialogDescription>Connect a model provider to start comparing AI models</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 py-2 pb-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium px-1">Suggested Providers</h3>
              <div className="space-y-2">
                {KNOWN_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleConnectProvider(provider.id, provider.isOAuth)}
                    disabled={isProviderConnected(provider.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

              <div className="border-t border-border pt-4 mt-4">
                <button
                  onClick={() => {
                    setShowAddProviderModal(false)
                    setIsAddProviderOpen(true)
                  }}
                  className="flex w-full items-center justify-between rounded-lg border-2 border-dashed border-border bg-card p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="text-left flex items-center gap-2">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Custom Provider</div>
                      <div className="text-xs text-muted-foreground">Add your own provider</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setShowAddProviderModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={flowState.stage === "validating"}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validating API Key</DialogTitle>
            <DialogDescription>Please wait while we verify your credentials...</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={flowState.stage === "fetching-models"}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fetching Models</DialogTitle>
            <DialogDescription>Retrieving available models from the provider...</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={flowState.stage === "error"} onOpenChange={handleCloseFlow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connection Failed</DialogTitle>
            <DialogDescription>{flowState.stage === "error" ? flowState.error : ""}</DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseFlow}>
              Cancel
            </Button>
            <Button onClick={handleRetry}>Try Again</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={flowState.stage === "success"} onOpenChange={handleFinish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provider Connected!</DialogTitle>
            <DialogDescription>
              {flowState.stage === "success"
                ? `Successfully connected ${flowState.providerName} with ${flowState.models.length} models.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Available Models:</h4>
              <div className="flex flex-wrap gap-2">
                {flowState.stage === "success" &&
                  flowState.models.map((model) => (
                    <Badge key={model} variant="secondary">
                      {model}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleFinish}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirmation?.open ?? false}
        onOpenChange={(open) => !open && setDeleteConfirmation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation?.type === "provider"
                ? `Delete ${deleteConfirmation.name} and all its models? This action cannot be undone.`
                : `Delete ${deleteConfirmation?.name}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isAddProviderOpen && (
        <AddProviderModal
          onClose={handleCloseProviderModal}
          onProviderAdded={handleProviderAddedInternal}
          existingProviders={providers}
          editMode={editingModel ? "model" : editingProvider ? "provider" : undefined}
          editProviderId={editingProvider || editingModel?.providerId}
          editModelId={editingModel?.modelId}
        />
      )}
    </div>
  )
}

const mockProviderModels: Record<string, any[]> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o", description: "Most capable model", speed: "Fast", cost: "Medium", enabled: true },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      description: "Fast and efficient",
      speed: "Very Fast",
      cost: "Low",
      enabled: true,
    },
  ],
  anthropic: [
    {
      id: "claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      description: "Balanced performance",
      speed: "Fast",
      cost: "Medium",
      enabled: true,
    },
  ],
  google: [
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      description: "Cost-effective option",
      speed: "Fast",
      cost: "Low",
      enabled: true,
    },
  ],
  mistral: [
    {
      id: "mistral-large",
      name: "Mistral Large",
      description: "Most capable model",
      speed: "Fast",
      cost: "Medium",
      enabled: true,
    },
    {
      id: "mistral-medium",
      name: "Mistral Medium",
      description: "Balanced performance",
      speed: "Fast",
      cost: "Low",
      enabled: true,
    },
  ],
  groq: [
    {
      id: "llama-3.1-70b",
      name: "Llama 3.1 70B",
      description: "Ultra-fast inference",
      speed: "Ultra Fast",
      cost: "Low",
      enabled: true,
    },
    {
      id: "mixtral-8x7b",
      name: "Mixtral 8x7B",
      description: "Fast and efficient",
      speed: "Ultra Fast",
      cost: "Low",
      enabled: true,
    },
  ],
  openrouter: [
    {
      id: "openrouter-auto",
      name: "Auto (Best Available)",
      description: "Automatically selects best model",
      speed: "Fast",
      cost: "Medium",
      enabled: true,
    },
    {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      description: "Best for complex tasks",
      speed: "Fast",
      cost: "High",
      enabled: true,
    },
    {
      id: "openai/gpt-4-turbo",
      name: "GPT-4 Turbo",
      description: "Most capable OpenAI model",
      speed: "Fast",
      cost: "High",
      enabled: true,
    },
    {
      id: "google/gemini-pro-1.5",
      name: "Gemini Pro 1.5",
      description: "Long context window",
      speed: "Fast",
      cost: "Medium",
      enabled: true,
    },
    {
      id: "meta-llama/llama-3.1-70b-instruct",
      name: "Llama 3.1 70B",
      description: "Open-source powerhouse",
      speed: "Fast",
      cost: "Low",
      enabled: true,
    },
    {
      id: "mistralai/mixtral-8x7b-instruct",
      name: "Mixtral 8x7B",
      description: "Fast mixture of experts",
      speed: "Very Fast",
      cost: "Low",
      enabled: true,
    },
  ],
  azure: [
    {
      id: "azure-gpt-4",
      name: "GPT-4 (Azure)",
      description: "Enterprise-grade GPT-4",
      speed: "Fast",
      cost: "Medium",
      enabled: true,
    },
    {
      id: "azure-gpt-35-turbo",
      name: "GPT-3.5 Turbo (Azure)",
      description: "Cost-effective option",
      speed: "Very Fast",
      cost: "Low",
      enabled: true,
    },
  ],
}

export { ModelSelection }
