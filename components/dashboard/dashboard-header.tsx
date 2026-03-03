"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Bell, Search, LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCurrentStudent, clearCurrentStudentId } from "@/hooks/use-current-student"
import { supabase } from "@/lib/supabaseClient"
import { NotificationsPanel } from "./notifications-panel"

export function DashboardHeader() {
  const { student } = useCurrentStudent()
  const router = useRouter()

  const points = student?.nPoints ?? 0
  const avatar = student?.avatar ?? "ST"
  const name = student?.name ?? "Student"
  const yearLabel = student?.year ? `${student.year} year` : "Student"

  async function handleSignOut() {
    clearCurrentStudentId()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden font-mono text-lg font-bold text-foreground sm:block">
              NITK Nexus
            </span>
          </Link>
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events, clubs..."
                className="h-9 w-64 border-border bg-secondary/50 pl-9 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 font-mono">
            <Zap className="h-3 w-3" />
            {points.toLocaleString()} pts
          </Badge>

          <NotificationsPanel />

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {avatar}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-foreground leading-none">{name}</p>
              <p className="text-xs text-muted-foreground">{yearLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

