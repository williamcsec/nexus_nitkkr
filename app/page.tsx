import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Stats } from "@/components/stats"
import { HowItWorks } from "@/components/how-it-works"
import { UpcomingEvents } from "@/components/upcoming-events"
import { Testimonials } from "@/components/testimonials"
import { ForClubs } from "@/components/for-clubs"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <UpcomingEvents />
      <Testimonials />
      <ForClubs />
      <CTASection />
      <Footer />
    </main>
  )
}
