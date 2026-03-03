import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getClubSession } from "@/lib/club-session"
import { ClubDashboardNav } from "@/components/club-dashboard-nav"
import { signOutClub } from "./actions"

export default async function ClubDashboardLayout({ children }: { children: ReactNode }) {
    const club = await getClubSession()

    if (!club) {
        redirect("/club-login")
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-2xl items-center justify-between mx-auto px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{club.name} Portal</span>
                    </div>
                    <form action={signOutClub}>
                        <button type="submit" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign Out</button>
                    </form>
                </div>
            </header>
            <div className="container mx-auto px-4 md:px-8 flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 pt-8">
                <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
                    <ClubDashboardNav />
                </aside>
                <main className="flex w-full flex-col overflow-hidden pb-12">
                    {children}
                </main>
            </div>
        </div>
    )
}
