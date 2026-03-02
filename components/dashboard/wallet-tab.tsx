"use client"

import { useState, useMemo } from "react"
import { Zap, TrendingUp, ShoppingBag, History, Trophy, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DashboardNav } from "@/components/dashboard-nav"
import { cn } from "@/lib/utils"
import { useCurrentStudent } from "@/hooks/use-current-student"
import { useSupabasePoints } from "@/hooks/use-supabase-points"
import { useSupabaseVouchers } from "@/hooks/use-supabase-vouchers"
import { useSupabaseRewards } from "@/hooks/use-supabase-rewards"
import { useSupabaseLeaderboard } from "@/hooks/use-supabase-leaderboard"

export function WalletTab() {
  const [activeTab, setActiveTab] = useState("rewards")

  const tabs = [
    { id: "rewards", label: "Rewards Store" },
    { id: "vouchers", label: "My Vouchers" },
    { id: "history", label: "Points History" },
    { id: "leaderboard", label: "Leaderboard" },
  ]

  const { student, loading: studentLoading } = useCurrentStudent()
  const studentId = student?.id ?? null

  const {
    balance,
    transactions,
    loading: pointsLoading,
    error: pointsError,
  } = useSupabasePoints(studentId)

  const {
    vouchers,
    loading: vouchersLoading,
    error: vouchersError,
  } = useSupabaseVouchers(studentId)

  const {
    rewards,
    loading: rewardsLoading,
    error: rewardsError,
  } = useSupabaseRewards()

  const {
    entries: boardEntries,
    loading: boardLoading,
    error: boardError,
  } = useSupabaseLeaderboard(50)

  const rank = useMemo(() => {
    if (!studentId || boardEntries.length === 0) return undefined
    const idx = boardEntries.findIndex((e) => e.id === studentId)
    return idx >= 0 ? idx + 1 : undefined
  }, [boardEntries, studentId])

  return (
    <div className="space-y-6">
      {/* Points Hero Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-card to-accent/10 overflow-hidden">
        <CardContent className="relative flex flex-col items-center gap-2 p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <div className="sm:ml-4 flex-1">
            <p className="text-sm text-muted-foreground">Your N-Points Balance</p>
            <p className="font-mono text-4xl font-bold text-foreground">
              {pointsLoading ? '...' : balance.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 sm:items-end">
            {rank && (
              <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                <TrendingUp className="h-3 w-3" /> Rank #{rank}
              </Badge>
            )}
            {pointsError && (
              <p className="text-sm text-destructive">{pointsError}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <DashboardNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Rewards Store */}
      {activeTab === "rewards" && (
        <>
          {rewardsLoading && <p className="py-12 text-center text-muted-foreground">Loading rewards...</p>}
          {rewardsError && <p className="py-12 text-center text-destructive">{rewardsError}</p>}
          {!rewardsLoading && !rewardsError && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rewards.map((reward) => (
                <Card key={reward.id} className="border-border bg-card/50 hover:bg-card transition-colors">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                        {reward.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{reward.stock} left</span>
                    </div>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground">{reward.title}</h4>
                    <p className="mb-4 text-xs text-muted-foreground">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-mono text-sm font-bold text-primary">
                        <Zap className="h-3.5 w-3.5" /> {reward.cost} pts
                      </span>
                      <Button
                        size="sm"
                        className={cn(
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                          balance < reward.cost && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={balance < reward.cost}
                      >
                        Redeem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* My Vouchers */}
      {activeTab === "vouchers" && (
        <>
          {vouchersLoading && <p className="py-12 text-center text-muted-foreground">Loading vouchers...</p>}
          {vouchersError && <p className="py-12 text-center text-destructive">{vouchersError}</p>}
          {!vouchersLoading && !vouchersError && (
            <div className="space-y-3">
              {vouchers.map((v) => (
                <Card key={v.id} className="border-border bg-card/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10">
                      <ShoppingBag className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{v.description}</h4>
                      <p className="text-xs text-muted-foreground">
                        Redeemed on {new Date(v.redeemedAt || '').toLocaleDateString()} 
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {v.isRedeemed ? 'Used' : 'Active'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Points History */}
      {activeTab === "history" && (
        <>
          {pointsLoading && <p className="py-12 text-center text-muted-foreground">Loading history...</p>}
          {pointsError && <p className="py-12 text-center text-destructive">{pointsError}</p>}
          {!pointsLoading && !pointsError && (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <Card key={tx.id} className="border-border bg-card/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      tx.points >= 0 ? "bg-emerald-400/10" : "bg-red-400/10"
                    )}>
                      {tx.points >= 0
                        ? <ArrowUp className="h-5 w-5 text-emerald-400" />
                        : <ArrowDown className="h-5 w-5 text-red-400" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <span className={cn(
                      "font-mono text-sm font-bold",
                      tx.points >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {tx.points >= 0 ? "+" : ""}{tx.points}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Leaderboard */}
      {activeTab === "leaderboard" && (
        <>
          {boardLoading && <p className="py-12 text-center text-muted-foreground">Loading leaderboard...</p>}
          {boardError && <p className="py-12 text-center text-destructive">{boardError}</p>}
          {!boardLoading && !boardError && (
            <div className="space-y-6">
              {/* Top 3 podium */}
              <div className="flex items-end justify-center gap-4 py-6">
                {[boardEntries[1], boardEntries[0], boardEntries[2]].map((entry, i) => {
                  if (!entry) return null
                  const order = [2, 1, 3]
                  const heights = ["h-24", "h-32", "h-20"]
                  const colors = ["text-gray-300", "text-amber-400", "text-orange-400"]
                  return (
                    <div key={entry.id} className="flex flex-col items-center gap-2">
                      <Avatar className="h-12 w-12 border-2 border-border">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">{entry.avatar}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-medium text-foreground">{entry.name.split(" ")[0]}</p>
                      <p className="font-mono text-sm font-bold text-primary">{entry.points.toLocaleString()}</p>
                      <div className={cn(
                        "flex w-20 items-start justify-center rounded-t-xl bg-secondary/50 pt-3 font-mono text-lg font-bold",
                        heights[i], colors[i]
                      )}>
                        #{order[i]}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Full list */}
              <div className="space-y-2">
                {boardEntries.slice(3).map((entry, idx) => (
                  <Card key={entry.id} className={cn(
                    "border-border bg-card/50",
                    entry.id === studentId && "border-primary/30 bg-primary/5"
                  )}>
                    <CardContent className="flex items-center gap-4 p-3">
                      <span className="w-8 text-center font-mono text-sm font-bold text-muted-foreground">
                        #{idx + 4}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{entry.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.branch}</p>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{entry.points.toLocaleString()}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
