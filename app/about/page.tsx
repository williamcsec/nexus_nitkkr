"use client"

import Link from "next/link"
import { ArrowLeft, Target, Rocket, Users, Calendar, Award, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const stats = [
    { label: "Active Students", value: "5,000+", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Clubs & Societies", value: "50+", icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Events Monthly", value: "200+", icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Certificates Issued", value: "10,000+", icon: Award, color: "text-amber-400", bg: "bg-amber-400/10" },
]

const team = [
    { name: "Project Lead", role: "Full-Stack Developer", branch: "B.Tech CSE • 4th Year", initials: "PL" },
    { name: "Co-Lead", role: "Product & Design", branch: "B.Tech IT • 4th Year", initials: "CL" },
    { name: "Backend Dev", role: "Backend & Database", branch: "B.Tech ECE • 3rd Year", initials: "BD" },
    { name: "Frontend Dev", role: "UI/UX & Frontend", branch: "B.Tech CSE • 3rd Year", initials: "FD" },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <span className="font-mono text-sm text-muted-foreground">About NITK Nexus</span>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-12">
                {/* Hero */}
                <div className="mb-16 max-w-3xl">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">About NITK Nexus</p>
                    <h1 className="mb-6 text-4xl font-bold text-foreground lg:text-5xl">
                        Revolutionizing Campus Life at NIT Kurukshetra
                    </h1>
                    <p className="mb-4 text-lg text-muted-foreground leading-relaxed">
                        NITK Nexus was born from a simple observation: NIT Kurukshetra&apos;s vibrant campus life was being held back by fragmented communication. With 50+ clubs, 5,000+ students, and 200+ monthly events, information was scattered across WhatsApp groups, Instagram posts, and email threads.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        We built a unified platform that brings everything together — smart event discovery, QR-based attendance, verified certificates, and AI-powered recommendations. Now, students never miss opportunities, clubs manage everything seamlessly, and the entire campus thrives in sync.
                    </p>
                </div>

                {/* Stats */}
                <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((s) => (
                        <Card key={s.label} className="border-border bg-card/50">
                            <CardContent className="p-5 text-center">
                                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                                    <s.icon className={`h-6 w-6 ${s.color}`} />
                                </div>
                                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Mission & Vision */}
                <div className="mb-16 grid gap-6 md:grid-cols-2">
                    <Card className="border-border bg-card/50">
                        <CardContent className="p-8">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <Target className="h-7 w-7 text-primary" />
                            </div>
                            <h2 className="mb-3 text-2xl font-bold text-foreground">Our Mission</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                To empower every NIT Kurukshetra student with seamless access to campus opportunities through intelligent technology. We&apos;re building the digital backbone that connects students, clubs, and administrators in one unified ecosystem.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-card/50">
                        <CardContent className="p-8">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                                <Rocket className="h-7 w-7 text-accent" />
                            </div>
                            <h2 className="mb-3 text-2xl font-bold text-foreground">Our Vision</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                To become the gold standard for campus management platforms across India. Starting with NIT Kurukshetra, we envision every college having a smart, integrated system that makes campus life more engaging, organized, and rewarding.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* How It Works */}
                <div className="mb-16">
                    <h2 className="mb-8 text-3xl font-bold text-foreground">How It Works</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            { step: "01", title: "Sign Up with College Email", desc: "Register using your @nitkkr.ac.in email. Fill in your branch, year, and interests. Takes less than 2 minutes." },
                            { step: "02", title: "Discover Personalized Events", desc: "Browse events tailored to your interests. Get notifications for workshops, competitions, and fests from clubs you care about." },
                            { step: "03", title: "Participate & Earn Rewards", desc: "Register with one click. Scan QR at venue. Get verified certificates. Earn N-Points to redeem for rewards." },
                        ].map((s) => (
                            <Card key={s.step} className="border-border bg-card/50">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 font-mono text-lg font-bold text-primary">
                                        {s.step}
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-foreground">{s.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Team */}
                <div className="mb-16">
                    <h2 className="mb-2 text-3xl font-bold text-foreground">Built by Students, For Students</h2>
                    <p className="mb-8 text-muted-foreground">The team behind NITK Nexus</p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {team.map((t) => (
                            <Card key={t.initials} className="border-border bg-card/50 text-center">
                                <CardContent className="p-6">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl">
                                        {t.initials}
                                    </div>
                                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                                    <p className="text-sm text-primary">{t.role}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{t.branch}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
                    <Zap className="mx-auto mb-4 h-10 w-10 text-primary" />
                    <h2 className="mb-2 text-2xl font-bold text-foreground">Ready to Join?</h2>
                    <p className="mb-6 text-muted-foreground">
                        Sign up with your NITK email and never miss a campus opportunity again.
                    </p>
                    <Link href="/get-started">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Get Started Free
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    )
}
