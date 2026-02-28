"use client"

import { useEffect, useRef } from "react"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

function FloatingOrb({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return (
    <div
      className={`absolute rounded-full opacity-20 blur-3xl ${className}`}
      style={{
        animation: `float ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        33% { transform: translateY(-20px) translateX(10px); }
        66% { transform: translateY(10px) translateX(-10px); }
      }
      @keyframes scrollDown {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(8px); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20"
    >
      {/* Animated background orbs */}
      <FloatingOrb
        className="left-[10%] top-[20%] h-72 w-72 bg-primary"
        delay={0}
      />
      <FloatingOrb
        className="right-[15%] top-[30%] h-96 w-96 bg-accent"
        delay={2}
      />
      <FloatingOrb
        className="bottom-[20%] left-[30%] h-64 w-64 bg-chart-5"
        delay={4}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-chart-3 animate-pulse" />
          Now live for all NITK students
        </div>

        <h1 className="font-mono text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl text-balance">
          Unify Your{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Campus Life
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl text-pretty">
          All clubs, events, and certificates in one intelligent platform.
          Discover events, track attendance, earn rewards, and build your
          campus portfolio.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 text-base"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-border text-foreground hover:bg-secondary px-8 text-base"
          >
            <Play className="h-4 w-4" />
            Watch Demo
          </Button>
        </div>

        {/* Trust indicator */}
        <p className="mt-16 text-sm text-muted-foreground">
          Trusted by{" "}
          <span className="font-semibold text-foreground">5,000+</span> NITK
          students across{" "}
          <span className="font-semibold text-foreground">50+</span> clubs
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-1.5">
          <div
            className="h-2 w-1 rounded-full bg-muted-foreground/50"
            style={{ animation: "scrollDown 1.5s ease-in-out infinite" }}
          />
        </div>
      </div>
    </section>
  )
}
