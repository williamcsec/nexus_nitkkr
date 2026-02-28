"use client"

import Link from "next/link"
import { Zap, Bell, Search, LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCurrentStudent, clearCurrentStudentId } from "@/hooks/use-current-student"

export function DashboardHeader() {
  const { student } = useCurrentStudent()

  const points = student?.nPoints ?? 0
  const avatar = student?.avatar ?? "ST"
  const name = student?.name ?? "Student"
  const yearLabel = student?.year ? `${student.year} year` : "Student"

  function handleSignOut() {
    clearCurrentStudentId()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
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

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>

          <Link href="/sign-in" className="hidden sm:block">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </Link>

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

