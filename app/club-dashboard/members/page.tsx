import { getClubSession } from "@/lib/club-session"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, MoreVertical, Mail, ShieldAlert } from "lucide-react"

export default async function ClubMembersPage() {
    const club = await getClubSession()
    if (!club) return null

    return (
        <div className="space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Member Management</h2>
                    <p className="text-muted-foreground">Manage roles and view analytics for {club.name}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 bg-card/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-lg">Core Team & Members</CardTitle>
                        <CardDescription>People with official roles in your club.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-border">
                            <div className="grid grid-cols-4 gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-border bg-secondary/30">
                                <div className="col-span-2">Name</div>
                                <div>Role</div>
                                <div className="text-right">Action</div>
                            </div>
                            <div className="divide-y divide-border">
                                {[
                                    { name: "Aarav Sharma", role: "President", email: "aarav@nitk.edu.in" },
                                    { name: "Priya Patel", role: "Vice President", email: "priya@nitk.edu.in" },
                                    { name: "Rohan Kumar", role: "Event Lead", email: "rohan@nitk.edu.in" },
                                ].map((member, i) => (
                                    <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center text-sm">
                                        <div className="col-span-2">
                                            <p className="font-medium text-foreground">{member.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                                {member.role}
                                            </span>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-muted-foreground hover:text-foreground"><Mail className="h-4 w-4" /></button>
                                            <button className="p-2 text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-primary">
                            <ShieldAlert className="h-5 w-5" />
                            Role Permissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-foreground/80 space-y-4">
                        <p>Members added here will be able to access this dashboard if they log in via the student portal, assuming their email matches.</p>
                        <p className="font-semibold mt-4">Coming Soon:</p>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                            <li>Role-based access control (RBAC)</li>
                            <li>Direct member invites</li>
                            <li>Engagement analytics</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
