"use client"

import { useActionState, useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Eye, Check, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createEvent } from "./actions"
import { EventCard } from "@/components/event-card"
import type { EventItem } from "@/lib/types"
import confetti from "canvas-confetti"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={pending}>
            {pending ? "Publishing..." : "Publish Event"}
            {!pending && <Check className="ml-2 h-4 w-4" />}
        </Button>
    )
}

export default function CreateEventPage() {
    const router = useRouter()
    const [state, formAction] = useActionState(createEvent, null)
    const [step, setStep] = useState<1 | 2>(1)

    // Live form state for preview
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState("Workshop")
    const [venue, setVenue] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [maxCapacity, setMaxCapacity] = useState("100")
    const [nPoints, setNPoints] = useState("0")
    const [isPaid, setIsPaid] = useState(false)
    const [price, setPrice] = useState("")

    const handleReview = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const form = e.currentTarget.closest("form")
        if (form && !form.checkValidity()) {
            form.reportValidity()
            return
        }
        setStep(2)
    }

    useEffect(() => {
        if (state?.success) {
            const duration = 2000
            const end = Date.now() + duration

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#000000', '#ffffff', '#3b82f6']
                })
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#000000', '#ffffff', '#3b82f6']
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            }
            frame()

            const timer = setTimeout(() => {
                router.push("/club-dashboard/events")
            }, 2500)

            return () => clearTimeout(timer)
        }
    }, [state?.success, router])

    const mockEvent: EventItem = {
        id: "preview-id",
        clubId: "preview-club",
        status: "upcoming",
        slug: "",
        title: title || "Event Title",
        clubName: "Your Club",
        description: description,
        type: type || "Workshop",
        date: date || new Date().toISOString(),
        time: time || "10:00 AM",
        venue: venue || "Venue",
        maxCapacity: parseInt(maxCapacity) || 100,
        registrations: 0,
        nPoints: parseInt(nPoints) || 0,
        isPaid: isPaid,
        price: parseInt(price) || 0,
        tags: []
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full pb-20">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => step === 2 ? setStep(1) : undefined} asChild={step === 1}>
                        {step === 1 ? (
                            <Link href="/club-dashboard/events">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        ) : (
                            <ArrowLeft className="h-4 w-4 cursor-pointer" />
                        )}
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {step === 1 ? "Create New Event" : "Review Event"}
                        </h2>
                        <p className="text-muted-foreground">
                            {step === 1 ? "Fill in the details to publish your event" : "Preview how your event will look to students"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                </div>
            </div>

            <Card className="bg-card/50 border-border">
                <CardHeader>
                    <CardTitle>{step === 1 ? "Event Details" : "Ready to Publish?"}</CardTitle>
                    <CardDescription>
                        {step === 1 ? "Provide comprehensive information to attract attendees." : "Please verify the information below before publishing."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-6">

                        {state?.error && (
                            <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 mb-6">
                                {state.error}
                            </div>
                        )}

                        {/* STEP 1: FORM */}
                        <div className={`grid gap-6 sm:grid-cols-2 ${step !== 1 ? 'hidden' : ''}`}>
                            <div className="space-y-2 sm:col-span-2">
                                <label htmlFor="title" className="text-sm font-medium">Event Title</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Intro to Web3 Workshop"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label htmlFor="description" className="text-sm font-medium">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={4}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="What will happen at this event?"
                                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="type" className="text-sm font-medium">Event Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    required
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Select type...</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Competition">Competition</option>
                                    <option value="Seminar">Seminar</option>
                                    <option value="Social">Social</option>
                                    <option value="Fest">Fest</option>
                                    <option value="Meeting">Meeting</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="venue" className="text-sm font-medium">Venue</label>
                                <input
                                    id="venue"
                                    name="venue"
                                    type="text"
                                    required
                                    value={venue}
                                    onChange={e => setVenue(e.target.value)}
                                    placeholder="e.g. Main Seminar Hall"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="date" className="text-sm font-medium">Date</label>
                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="time" className="text-sm font-medium">Time</label>
                                <input
                                    id="time"
                                    name="time"
                                    type="time"
                                    required
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="maxCapacity" className="text-sm font-medium">Max Capacity</label>
                                <input
                                    id="maxCapacity"
                                    name="maxCapacity"
                                    type="number"
                                    min="1"
                                    required
                                    value={maxCapacity}
                                    onChange={e => setMaxCapacity(e.target.value)}
                                    placeholder="e.g. 100"
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="nPoints" className="text-sm font-medium">N-Points Awarded</label>
                                <input
                                    id="nPoints"
                                    name="nPoints"
                                    type="number"
                                    min="0"
                                    value={nPoints}
                                    onChange={e => setNPoints(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2 pt-4 border-t border-border mt-2">
                                <h3 className="text-sm font-semibold mb-3">Ticketing</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        id="isPaid"
                                        name="isPaid"
                                        checked={isPaid}
                                        onChange={e => setIsPaid(e.target.checked)}
                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isPaid" className="text-sm font-medium">Paid Event?</label>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="price" className="text-sm font-medium">Price (INR)</label>
                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        disabled={!isPaid}
                                        placeholder="e.g. 200"
                                        className="flex h-10 w-full sm:max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                                    />
                                    <p className="text-xs text-muted-foreground">Leave empty if the event is free.</p>
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: PREVIEW */}
                        <div className={`space-y-8 ${step !== 2 ? 'hidden' : ''}`}>
                            <div className="p-1 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-primary/20">
                                <div className="bg-background rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-primary" /> Live Preview
                                    </h3>
                                    <div className="max-w-md mx-auto pointer-events-none">
                                        <EventCard event={mockEvent} />
                                    </div>
                                    <div className="mt-6 p-4 bg-secondary/30 rounded-lg text-sm border border-border">
                                        <p className="text-muted-foreground font-medium mb-1">Description:</p>
                                        <p className="whitespace-pre-line">{description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setStep(1)}
                                >
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                                </Button>
                                <div className="flex-1">
                                    <SubmitButton />
                                </div>
                            </div>
                        </div>

                        {/* STEP 1 BUTTONS */}
                        {step === 1 && (
                            <div className="pt-6 mt-6 border-t border-border flex justify-end">
                                <Button type="button" onClick={handleReview} className="bg-primary hover:bg-primary/90">
                                    Continue to Review <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                                </Button>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
