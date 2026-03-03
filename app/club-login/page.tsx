"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { ArrowRight, ShieldCheck, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { loginClub } from "./actions"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={pending}>
            {pending ? "Authenticating..." : "Access Dashboard"}
            {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
    )
}

export default function ClubLoginPage() {
    const [state, formAction] = useActionState(loginClub, null)

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className="flex flex-1 items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                            Club Portal
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Sign in with your admin credentials
                        </p>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/50 p-6 shadow-xl backdrop-blur-sm sm:p-8">
                        <form action={formAction} className="space-y-6">

                            {state?.error && (
                                <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 text-center">
                                    {state.error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label
                                    htmlFor="clubId"
                                    className="block text-sm font-medium leading-6 text-foreground"
                                >
                                    Club ID
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <UserCog className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="clubId"
                                        name="clubId"
                                        type="text"
                                        required
                                        className="block w-full rounded-xl border border-border bg-background/50 py-2.5 pl-10 pr-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                        placeholder="e.g. icell-nitk"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6 text-foreground"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full rounded-xl border border-border bg-background/50 py-2.5 px-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <SubmitButton />
                            </div>
                        </form>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-8">
                        Only authorized club coordinators can access this portal.<br />
                        If you need access, please contact the Nexus administration.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
