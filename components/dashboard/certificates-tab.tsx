"use client"

import { useState } from "react"
import { Award, Download, Share2, Shield, Search, LayoutGrid, List, CheckCircle, Copy, X, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [filterType, setFilterType] = useState("All")
  const [filterClub, setFilterClub] = useState("All")
  const [certModal, setCertModal] = useState<any | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const { student } = useCurrentStudent()
  const studentId = student?.id ?? null
  const { certificates, loading: certsLoading, error: certsError } = useSupabaseCertificates(studentId)

  const thisSemester = certificates.filter((c) => new Date(c.date) >= new Date("2025-07-01"))
  const verified = certificates.filter((c) => c.verified)
  const uniqueClubs = Array.from(new Set(certificates.map(c => c.clubName).filter(Boolean))).sort()

  const filtered = certificates.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.clubName || "").toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === "All" || c.type === filterType
    const matchesClub = filterClub === "All" || c.clubName === filterClub
    return matchesSearch && matchesType && matchesClub
  })

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function handleShareLinkedIn(cert: any) {
    const text = `I'm thrilled to share that I've completed ${cert.title} organized by ${cert.clubName} at NIT Kurukshetra!\n\n#NITK #StudentLife #Learning`
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(text)}`, "_blank")
  }

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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 border-border bg-secondary/50 pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] bg-secondary/30 h-10">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Participation">Participation</SelectItem>
              <SelectItem value="Winner">Winner</SelectItem>
              <SelectItem value="Runner-up">Runner-up</SelectItem>
              <SelectItem value="Completion">Completion</SelectItem>
              <SelectItem value="Merit">Merit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterClub} onValueChange={setFilterClub}>
            <SelectTrigger className="w-[140px] bg-secondary/30 h-10">
              <SelectValue placeholder="Club" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Clubs</SelectItem>
              {uniqueClubs.map(club => (
                <SelectItem key={club as string} value={club as string}>{club as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>

      {/* Certificates */}
      {certsLoading && <p className="py-12 text-center text-muted-foreground">Loading certificates...</p>}
      {certsError && <p className="py-12 text-center text-destructive">{certsError}</p>}
      {!certsLoading && !certsError && (
        <>
          {view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((cert) => (
                <Card
                  key={cert.id}
                  className="border-border bg-card/50 hover:bg-card transition-all overflow-hidden cursor-pointer hover:shadow-md group"
                  onClick={() => setCertModal(cert)}
                >
                  <div className="h-2 bg-gradient-to-r from-primary to-accent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <Badge variant="outline" className={cn("text-xs", typeBadgeColors[cert.type])}>
                        {cert.type}
                      </Badge>
                      {cert.verified && (
                        <div title="Institute Verified"><Shield className="h-4 w-4 text-emerald-400" /></div>
                      )}
                    </div>
                    <h4 className="mb-1 font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{cert.title}</h4>
                    <p className="text-xs text-muted-foreground">{cert.clubName}</p>
                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                      {new Date(cert.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>

                    <div className="mt-3 bg-secondary/30 rounded p-2 flex justify-between items-center text-xs">
                      <span className="font-mono text-muted-foreground truncate mr-2" title={cert.hash}># {(cert.hash || "PENDING").substring(0, 12)}...</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); handleCopyCode(cert.hash || "") }}>
                        {copiedCode === cert.hash ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="secondary" className="flex-1 gap-1" onClick={(e) => { e.stopPropagation(); window.open(cert.url || '#', '_blank') }}>
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Button>
                      <Button size="sm" variant="outline" className="text-muted-foreground hover:text-[#0a66c2] hover:border-[#0a66c2]" aria-label="Share on LinkedIn" onClick={(e) => { e.stopPropagation(); handleShareLinkedIn(cert) }}>
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

      {/* Certificate Modal */}
      {certModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setCertModal(null)}>
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b pb-4">
              <CardTitle className="text-xl">Certificate Details</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCertModal(null)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3 space-y-4">
                  {/* Mock Certificate Preview */}
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-secondary to-background border-2 border-border rounded-lg flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
                    {/* Decorative background */}
                    <div className="absolute top-0 left-0 w-full h-4 bg-primary" />
                    <div className="absolute bottom-0 left-0 w-full h-4 bg-accent" />
                    <Shield className="absolute opacity-5 h-64 w-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                    <h3 className="text-primary font-serif italic text-2xl mb-1 mt-4">Certificate of {certModal.type}</h3>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">NIT Kurukshetra</p>

                    <p className="text-sm">This is proudly presented to</p>
                    <p className="text-2xl font-bold mt-2 mb-4 capitalize">{student?.name || "Student"}</p>

                    <p className="text-sm max-w-[80%] mx-auto">
                      for successfully {certModal.type === "Participation" ? "participating in" : certModal.type === "Winner" ? "winning 1st place in" : "completing"}
                    </p>
                    <p className="font-semibold text-lg mt-1 text-foreground">{certModal.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">organized by {certModal.clubName}</p>

                    <div className="flex justify-between w-full mt-auto mb-2 px-8 pt-8">
                      <div className="text-center">
                        <div className="w-24 h-px bg-foreground/30 mb-1" />
                        <p className="text-[10px] uppercase text-muted-foreground">Date</p>
                      </div>
                      <div className="text-center">
                        <div className="w-24 h-px bg-foreground/30 mb-1" />
                        <p className="text-[10px] uppercase text-muted-foreground">Coordinator</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-foreground">{certModal.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">Issued by {certModal.clubName} on {new Date(certModal.date).toLocaleDateString()}</p>
                    <Badge className={cn(typeBadgeColors[certModal.type])}>{certModal.type}</Badge>
                  </div>

                  <div className="space-y-3 p-4 bg-secondary/30 rounded-lg border border-border">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Recipient</span>
                      <span className="font-medium text-foreground capitalize">{student?.name || "Student"}</span>
                    </div>
                    {/* @ts-ignore */}
                    {student?.roll_number && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Roll No.</span>
                        {/* @ts-ignore */}
                        <span className="font-medium text-foreground">{student.roll_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-emerald-400 flex items-center gap-1"><Shield className="h-3 w-3" /> Verified</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Verification Code</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-secondary/50 p-2 rounded flex-1 border border-border text-primary font-mono select-all overflow-hidden text-ellipsis whitespace-nowrap">
                        {certModal.hash || "PENDING"}
                      </code>
                      <Button variant="outline" size="icon" onClick={() => handleCopyCode(certModal.hash || '')}>
                        {copiedCode === certModal.hash ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">Anyone with this link can verify the authenticity of this certificate.</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <Button className="w-full" onClick={() => window.open(certModal.url || '#', '_blank')}>
                      <Download className="mr-2 h-4 w-4" /> Download as PDF
                    </Button>
                    <Button variant="outline" className="w-full hover:bg-[#0a66c2]/10 hover:text-[#0a66c2] hover:border-[#0a66c2]" onClick={() => handleShareLinkedIn(certModal)}>
                      <Share2 className="mr-2 h-4 w-4" /> Add to LinkedIn Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
