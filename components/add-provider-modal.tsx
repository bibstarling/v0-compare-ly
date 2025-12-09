"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronRight, Plus } from "lucide-react"
import type { Provider } from "@/types"

interface AddProviderModalProps {
  onClose: () => void
  onProviderAdded?: (provider: Provider) => void // Made optional to handle undefined case
  existingProviders: Provider[]
  editMode?: "provider" | "model"
  editProviderId?: string
  editModelId?: string
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

export function AddProviderModal({
  onClose,
  onProviderAdded,
  existingProviders,
  editMode,
  editProviderId,
  editModelId,
}: AddProviderModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCustomProvider, setIsCustomProvider] = useState(false)
  const [customProviderName, setCustomProviderName] = useState("")
  const [customProviderEndpoint, setCustomProviderEndpoint] = useState("")
  const [customProviderDescription, setCustomProviderDescription] = useState("")

  useEffect(() => {
    if (editMode && editProviderId) {
      const provider = existingProviders.find((p) => p.id === editProviderId)
      if (provider && editMode === "provider") {
        setSelectedProvider(provider.id)
      } else if (provider && editMode === "model" && editModelId) {
        const model = provider.models.find((m) => m.id === editModelId)
        if (model) {
          setSelectedProvider(provider.id)
        }
      }
    }
  }, [editMode, editProviderId, editModelId, existingProviders])

  const isProviderConnected = (providerId: string) => {
    return existingProviders.some((p) => p.id === providerId)
  }

  const handleConnectProvider = async (providerId: string) => {
    setSelectedProvider(providerId)
    setIsCustomProvider(false)
  }

  const handleCustomProvider = () => {
    console.log("[v0] Custom provider button clicked")
    setIsCustomProvider(true)
    setSelectedProvider("custom")
  }

  const handleSubmitApiKey = async () => {
    if (!selectedProvider || !apiKey) return
    if (isCustomProvider && (!customProviderName || !customProviderEndpoint)) return

    setIsConnecting(true)

    setTimeout(() => {
      const providerName = isCustomProvider
        ? customProviderName
        : KNOWN_PROVIDERS.find((p) => p.id === selectedProvider)?.name || selectedProvider

      const providerDescription = isCustomProvider
        ? customProviderDescription || `${customProviderName} provider`
        : `${providerName} provider`

      const newProvider: Provider = {
        id: isCustomProvider ? `custom-${Date.now()}` : selectedProvider,
        name: providerName,
        description: providerDescription,
        models: [
          {
            id: `${selectedProvider}-model-1`,
            name: `${providerName} Standard`,
            description: "Standard model",
            speed: "Fast",
            cost: "Medium",
          },
          {
            id: `${selectedProvider}-model-2`,
            name: `${providerName} Advanced`,
            description: "Advanced model",
            speed: "Medium",
            cost: "High",
          },
        ],
      }

      onProviderAdded?.(newProvider)
      setIsConnecting(false)
      setApiKey("")
      setSelectedProvider(null)
      setIsCustomProvider(false)
      setCustomProviderName("")
      setCustomProviderEndpoint("")
      setCustomProviderDescription("")
      onClose()
    }, 1000)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {editMode === "provider" ? "Edit Provider" : editMode === "model" ? "Edit Model" : "Add Provider"}
          </DialogTitle>
          {!selectedProvider && (
            <DialogDescription>Connect a model provider to start comparing AI models</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {!selectedProvider ? (
            <div className="space-y-4 py-2 pb-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Suggested Providers</h3>
                <div className="space-y-2">
                  {KNOWN_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleConnectProvider(provider.id)}
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
                  <div className="pt-4 border-t border-border mt-4">
                    <button
                      onClick={handleCustomProvider}
                      className="flex w-full items-center justify-between rounded-lg border-2 border-dashed border-border bg-card p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium">Custom Provider</div>
                        <div className="text-xs text-muted-foreground">Add your own provider</div>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {isCustomProvider && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="provider-name">
                      Provider Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="provider-name"
                      type="text"
                      placeholder="e.g., My Custom AI Provider"
                      value={customProviderName}
                      onChange={(e) => setCustomProviderName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endpoint-url">
                      Endpoint Base URL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="endpoint-url"
                      type="url"
                      placeholder="https://api.example.com/v1"
                      value={customProviderEndpoint}
                      onChange={(e) => setCustomProviderEndpoint(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Base URL for API requests</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-description">Description (Optional)</Label>
                    <Input
                      id="provider-description"
                      type="text"
                      placeholder="Brief description of the provider"
                      value={customProviderDescription}
                      onChange={(e) => setCustomProviderDescription(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="api-key">
                  API Key <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key will be stored securely and used to authenticate requests.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {selectedProvider ? (
            <>
              <Button variant="outline" onClick={() => setSelectedProvider(null)} disabled={isConnecting}>
                Back
              </Button>
              <Button
                onClick={handleSubmitApiKey}
                disabled={
                  !apiKey || (isCustomProvider && (!customProviderName || !customProviderEndpoint)) || isConnecting
                }
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
