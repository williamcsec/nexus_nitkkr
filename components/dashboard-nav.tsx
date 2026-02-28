"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

type Tab = {
  id: string
  label: string
  count?: number
}

type DashboardNavProps = {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function DashboardNav({ tabs, activeTab, onTabChange, className }: DashboardNavProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const activeEl = container.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      })
    }
  }, [activeTab])

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide rounded-xl bg-secondary/50 p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative z-10 flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  activeTab === tab.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-lg bg-primary transition-all duration-300 ease-out"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </div>
    </div>
  )
}
