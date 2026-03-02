"use client"

import { useState } from "react"
import { Award, Download, Share2, Shield, Search, LayoutGrid, List } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCurrentStudent } from "@/hooks/use-current-student"
import { useSupabaseCertificates } from "@/hooks/use-supabase-certificates"

const typeBadgeColors: Record<string, string> = {
  Winner: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Runner-up": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Participation: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Completion: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Merit: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

export function CertificatesTab() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")

  const { student } = useCurrentStudent()
  const studentId = student?.id ?? null
  const { certificates, loading: certsLoading, error: certsError } = useSupabaseCertificates(studentId)

  const thisSemester = certificates.filter((c) => new Date(c.date) >= new Date("2025-07-01"))
  const verified = certificates.filter((c) => c.verified)

  const filtered = certificates.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.clubName || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Stats banner */}
      {certsLoading && <p className="py-12 text-center text-muted-foreground">Loading certificates...</p>}
      {certsError && <p className="py-12 text-center text-destructive">{certsError}</p>}
      {!certsLoading && !certsError && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border bg-card/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                <Award className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{certificates.length}</p>
                <p className="text-xs text-muted-foreground">Total Certificates</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">
                <Award className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{thisSemester.length}</p>
                <p className="text-xs text-muted-foreground">This Semester</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{verified.length}/{certificates.length}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and view toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 border-border bg-secondary/50 pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex rounded-lg border border-border">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-10 w-10 rounded-r-none", view === "grid" && "bg-primary/20 text-primary")}
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-10 w-10 rounded-l-none", view === "list" && "bg-primary/20 text-primary")}
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Certificates */}
      {certsLoading && <p className="py-12 text-center text-muted-foreground">Loading certificates...</p>}
      {certsError && <p className="py-12 text-center text-destructive">{certsError}</p>}
      {!certsLoading && !certsError && (
        <>
          {view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((cert) => (
                <Card key={cert.id} className="border-border bg-card/50 hover:bg-card transition-colors overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <Badge variant="outline" className={cn("text-xs", typeBadgeColors[cert.type])}>
                        {cert.type}
                      </Badge>
                      {cert.verified && (
                        <Shield className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <h4 className="mb-1 font-semibold text-foreground line-clamp-2">{cert.title}</h4>
                    <p className="text-xs text-muted-foreground">{cert.clubName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(cert.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary">
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground" aria-label="Share certificate">
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((cert) => (
                <Card key={cert.id} className="border-border bg-card/50 hover:bg-card transition-colors">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-foreground">{cert.title}</h4>
                        <Badge variant="outline" className={cn("text-xs", typeBadgeColors[cert.type])}>
                          {cert.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{cert.clubName} - {new Date(cert.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="gap-1 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground" aria-label="Share">
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
