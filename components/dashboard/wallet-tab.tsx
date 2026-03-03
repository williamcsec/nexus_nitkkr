"use client"

import { useState, useMemo } from "react"
import { Zap, TrendingUp, ShoppingBag, History, Trophy, ArrowUp, ArrowDown, QrCode, X, CheckCircle, Copy, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardNav } from "@/components/dashboard-nav"
import { cn } from "@/lib/utils"
import { useCurrentStudent } from "@/hooks/use-current-student"
import { useSupabasePoints } from "@/hooks/use-supabase-points"
import { useSupabaseVouchers } from "@/hooks/use-supabase-vouchers"
import { useSupabaseRewards } from "@/hooks/use-supabase-rewards"
import { useSupabaseLeaderboard } from "@/hooks/use-supabase-leaderboard"
import { supabase } from "@/lib/supabaseClient"

export function WalletTab() {
  const [activeTab, setActiveTab] = useState("rewards")

  const tabs = [
    { id: "rewards", label: "Rewards Store" },
    { id: "vouchers", label: "My Vouchers" },
    { id: "history", label: "Points History" },
    { id: "leaderboard", label: "Leaderboard" },
  ]

  const [redeemModal, setRedeemModal] = useState<any | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [voucherQrModal, setVoucherQrModal] = useState<{ id: string, title: string, code: string } | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [leaderboardFilter, setLeaderboardFilter] = useState("All")

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

  const uniqueBranches = Array.from(new Set(boardEntries.map(e => e.branch).filter(Boolean))).sort()
  const filteredBoard = leaderboardFilter === "All" ? boardEntries : boardEntries.filter(e => e.branch === leaderboardFilter)

  async function handleRedeemConfirm() {
    if (!studentId || !redeemModal) return
    setIsRedeeming(true)

    // 1. deduct points
    const { error: pErr } = await supabase.from("points_ledger").insert({
      student_id: studentId,
      points: -redeemModal.cost,
      description: `Redeemed: ${redeemModal.title}`
    })

    if (pErr) {
      console.error(pErr)
      setIsRedeeming(false)
      return
    }

    // 2. add voucher
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    const { error: vErr } = await supabase.from("vouchers").insert({
      student_id: studentId,
      description: redeemModal.title,
      value: redeemModal.cost,
      is_redeemed: false,
      qr_code: code
    })

    if (vErr) {
      console.error(vErr)
    }

    setIsRedeeming(false)
    setRedeemModal(null)
    window.location.reload()
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

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
                        onClick={() => setRedeemModal(reward)}
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
                <Card
                  key={v.id}
                  className={cn("border-border bg-card/50 transition-colors", !v.isRedeemed && "hover:bg-card cursor-pointer")}
                  onClick={() => { if (!v.isRedeemed) setVoucherQrModal({ id: v.id, title: v.description, code: v.qrCode }) }}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", v.isRedeemed ? "bg-muted text-muted-foreground" : "bg-emerald-400/10 text-emerald-400")}>
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className={cn("font-semibold", v.isRedeemed ? "text-muted-foreground" : "text-foreground")}>{v.description}</h4>
                      <p className="text-xs text-muted-foreground">
                        {v.isRedeemed ? `Redeemed on ${new Date(v.redeemedAt || '').toLocaleDateString()}` : "Tap to show QR code"}
                      </p>
                    </div>
                    {v.isRedeemed ? (
                      <Badge variant="outline" className="text-muted-foreground border-border">Used</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
              {vouchers.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  <p className="text-lg font-medium">No vouchers yet</p>
                  <p className="text-sm">Redeem your points in the Rewards store!</p>
                </div>
              )}
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

              <div className="flex justify-end">
                <Select value={leaderboardFilter} onValueChange={setLeaderboardFilter}>
                  <SelectTrigger className="w-[180px] bg-secondary/30 h-9">
                    <div className="flex items-center gap-2 text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Branch</div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Branches</SelectItem>
                    {uniqueBranches.map(branch => {
                      const b = branch as string
                      return <SelectItem key={b} value={b}>{b}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Top 3 podium */}
              {leaderboardFilter === "All" && filteredBoard.length >= 3 && (
                <div className="flex items-end justify-center gap-4 py-2">
                  {[filteredBoard[1], filteredBoard[0], filteredBoard[2]].map((entry, i) => {
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
              )}

              {/* Full list */}
              <div className="space-y-2">
                {(leaderboardFilter === "All" ? filteredBoard.slice(3) : filteredBoard).map((entry, idx) => (
                  <Card key={entry.id} className={cn(
                    "border-border bg-card/50",
                    entry.id === studentId && "border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                  )}>
                    <CardContent className="flex items-center gap-4 p-3">
                      <span className="w-8 text-center font-mono text-sm font-bold text-muted-foreground">
                        #{leaderboardFilter === "All" ? idx + 4 : idx + 1}
                      </span>
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{entry.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm font-medium", entry.id === studentId ? "text-primary" : "text-foreground")}>
                          {entry.name} {entry.id === studentId && "(You)"}
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.branch}</p>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{entry.points.toLocaleString()}</span>
                    </CardContent>
                  </Card>
                ))}
                {filteredBoard.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No students found for this branch.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Redeem Confirmation Modal */}
      {redeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setRedeemModal(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 text-muted-foreground" onClick={() => setRedeemModal(null)}>
              <X className="h-4 w-4" />
            </Button>
            <div className="text-center space-y-4 pt-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Redeem Reward</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to redeem <strong className="text-foreground">{redeemModal.title}</strong>?
              </p>
              <div className="bg-secondary/50 rounded-lg p-3 inline-block">
                <p className="text-sm">Cost: <strong className="text-primary font-mono">{redeemModal.cost} pts</strong></p>
                <p className="text-xs text-muted-foreground mt-1">Your new balance will be {balance - redeemModal.cost} pts</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="w-full" onClick={() => setRedeemModal(null)}>Cancel</Button>
                <Button className="w-full" disabled={isRedeeming} onClick={handleRedeemConfirm}>
                  {isRedeeming ? "Processing..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voucher QR Modal */}
      {voucherQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setVoucherQrModal(null)}>
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              onClick={() => setVoucherQrModal(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="text-center space-y-4">
              <h3 className="text-lg font-bold text-foreground">Redeem Voucher</h3>
              <p className="text-sm text-muted-foreground">{voucherQrModal.title}</p>

              {/* QR Code display */}
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5">
                <div className="text-center">
                  <QrCode className="mx-auto h-16 w-16 text-emerald-500 mb-2" />
                  <p className="text-xs font-mono text-emerald-500 break-all px-2 tracking-widest">{voucherQrModal.code}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Show this code at the checkout counter or event desk to redeem your item.
              </p>

              <Button
                variant="outline"
                className="w-full gap-2 hover:text-emerald-500 hover:border-emerald-500/50"
                onClick={() => handleCopyCode(voucherQrModal.code)}
              >
                {copiedCode === voucherQrModal.code ? (
                  <><CheckCircle className="h-4 w-4 text-emerald-500" /> Copied!</>
                ) : (
                  <><Copy className="h-4 w-4" /> Copy Code</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
