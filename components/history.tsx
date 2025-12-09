"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Clock, Trophy, FileText, Sparkles, Trash2 } from "lucide-react"
import { Logo } from "@/components/logo"

interface HistoryProps {
  onBack: () => void
  historyItems?: any[]
  onViewTestDetails?: (historyItem: any) => void
  onDeleteHistoryItem?: (id: string) => void
}

export function History({ onBack, historyItems = [], onViewTestDetails, onDeleteHistoryItem }: HistoryProps) {
  const totalTests = historyItems.length
  const modelWins = historyItems.reduce((acc: Record<string, number>, item) => {
    acc[item.winner] = (acc[item.winner] || 0) + 1
    return acc
  }, {})
  const topWinner = Object.entries(modelWins).sort(([, a], [, b]) => (b as number) - (a as number))[0]
  const avgDuration =
    historyItems.length > 0
      ? Math.round(
          historyItems.reduce((sum, item) => {
            const [mins] = item.duration.split("m")
            return sum + Number.parseInt(mins)
          }, 0) / historyItems.length,
        )
      : 0

  return (
    <div className="flex flex-col h-full">
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
            {totalTests} completed test{totalTests !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {historyItems.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No test history yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Your completed tests will appear here. Start your first test to build your comparison history.
            </p>
            <Button onClick={onBack} size="lg">
              Start Your First Test
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Card className="p-3 text-center">
                <FileText className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold mb-1">{totalTests}</p>
                <p className="text-xs text-muted-foreground">Total Tests</p>
              </Card>
              <Card className="p-3 text-center">
                <Trophy className="h-5 w-5 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold mb-1">{topWinner?.[1] || 0}</p>
                <p className="text-xs text-muted-foreground">{topWinner?.[0] || "N/A"} Wins</p>
              </Card>
              <Card className="p-3 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-chart-3" />
                <p className="text-2xl font-bold mb-1">{avgDuration}m</p>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
              </Card>
            </div>

            {/* History List */}
            <div className="space-y-3">
              {historyItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-3 cursor-pointer hover:bg-accent/5 transition-colors group relative"
                  onClick={() => onViewTestDetails?.(item)}
                >
                  {onDeleteHistoryItem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteHistoryItem(item.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2 pr-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{item.scenario}</h3>
                        {item.aiEvaluator && <Sparkles className="h-3 w-3 text-accent" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {item.date} at {item.time}
                        </span>
                        <span>•</span>
                        <span>{item.duration}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0 font-mono text-xs">
                      {item.winnerScore}/5.0
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {item.models.map((model: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{item.winner}</span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="border-t border-border bg-card px-4 py-3">
        <Button onClick={onBack} variant="outline" className="w-full bg-transparent" size="lg">
          Start New Test
        </Button>
      </div>
    </div>
  )
}
