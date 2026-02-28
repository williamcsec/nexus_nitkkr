"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Priya Sharma",
    branch: "CSE, 3rd Year",
    quote:
      "NITK Nexus completely changed how I engage with campus events. I discovered clubs I never knew existed and earned 500+ N-Points in my first semester!",
    avatar: "PS",
  },
  {
    name: "Rahul Menon",
    branch: "ECE, 4th Year",
    quote:
      "As a club coordinator, the analytics dashboard is a game-changer. We can track attendance in real-time and our event participation jumped 40%.",
    avatar: "RM",
  },
  {
    name: "Ananya Reddy",
    branch: "ME, 2nd Year",
    quote:
      "The QR attendance system saved us hours of manual work. Plus, getting digital certificates instantly is amazing for my portfolio.",
    avatar: "AR",
  },
  {
    name: "Vikram Das",
    branch: "IT, 3rd Year",
    quote:
      "The AI recommendations are spot on. It suggested a robotics workshop that led me to join the club and now I lead it. Best platform on campus.",
    avatar: "VD",
  },
  {
    name: "Meera Iyer",
    branch: "Chemical, 4th Year",
    quote:
      "Finally, one place for everything campus-related. No more WhatsApp groups for event updates. NITK Nexus keeps me in the loop effortlessly.",
    avatar: "MI",
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }, [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isPaused, next])

  const getVisibleIndices = () => {
    const indices = []
    for (let i = -1; i <= 1; i++) {
      indices.push(
        (current + i + testimonials.length) % testimonials.length
      )
    }
    return indices
  }

  const visibleIndices = getVisibleIndices()

  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
            Testimonials
          </p>
          <h2 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
            Loved by{" "}
            <span className="text-muted-foreground">students like you</span>
          </h2>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Desktop: 3 cards */}
          <div className="hidden gap-6 md:grid md:grid-cols-3">
            {visibleIndices.map((index, pos) => {
              const t = testimonials[index]
              return (
                <div
                  key={`${t.name}-${pos}`}
                  className={`rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 ${
                    pos === 1
                      ? "scale-105 border-primary/30 shadow-lg shadow-primary/5"
                      : "opacity-70"
                  }`}
                >
                  <Quote className="mb-4 h-8 w-8 text-primary/30" />
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {`"${t.quote}"`}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-mono text-sm font-bold text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.branch}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile: single card */}
          <div className="md:hidden">
            <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm">
              <Quote className="mb-4 h-8 w-8 text-primary/30" />
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {`"${testimonials[current].quote}"`}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-mono text-sm font-bold text-primary">
                  {testimonials[current].avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {testimonials[current].name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonials[current].branch}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
