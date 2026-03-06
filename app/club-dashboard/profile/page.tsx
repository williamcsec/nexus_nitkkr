import { redirect } from "next/navigation"
import { getClubSession } from "@/lib/club-session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export const dynamic = 'force-dynamic'

export default async function ClubProfilePage() {
    const club = await getClubSession()

    if (!club) {
        redirect("/club-login")
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Club Profile</h2>
                <p className="text-muted-foreground">Manage your club details and contact information.</p>
            </div>

            <Card className="bg-card/50 border-border">
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Basic information about your organization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Club Name</Label>
                            <p className="font-medium text-lg">{club.name}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
