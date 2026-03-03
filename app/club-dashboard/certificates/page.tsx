import { getClubSession } from "@/lib/club-session"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Award, FileText, Send, Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IssueCertificateForm } from "@/components/dashboard/IssueCertificateForm"
import { supabase } from "@/lib/supabaseClient"

export default async function ClubCertificatesPage() {
    const club = await getClubSession()
    if (!club) return null

    const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, current_registrations')
        .eq('club_id', club.id)
        .order('start_time', { ascending: false })

    return (
        <div className="space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Certificates</h2>
                    <p className="text-muted-foreground">Issue and manage participation certificates</p>
                </div>
                <IssueCertificateForm events={eventsData || []} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 bg-card/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Batches</CardTitle>
                        <CardDescription>Certificates you have already issued to students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-border">
                            <div className="grid grid-cols-4 gap-4 p-4 text-sm font-semibold text-muted-foreground border-b border-border bg-secondary/30">
                                <div className="col-span-2">Event Name</div>
                                <div>Type</div>
                                <div className="text-right">Issued</div>
                            </div>
                            <div className="divide-y divide-border">
                                {[
                                    { event: "Web3 & Blockchain Hackathon", type: "Winner", count: 3, date: "2024-03-01" },
                                    { event: "Web3 & Blockchain Hackathon", type: "Participation", count: 42, date: "2024-03-01" },
                                    { event: "Annual Tech Symposium", type: "Participation", count: 128, date: "2024-01-15" },
                                ].map((batch, i) => (
                                    <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center text-sm">
                                        <div className="col-span-2">
                                            <p className="font-medium text-foreground truncate">{batch.event}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(batch.date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center px-2 py-1 rounded border border-border bg-background text-xs">
                                                {batch.type}
                                            </span>
                                        </div>
                                        <div className="text-right font-medium text-foreground">
                                            {batch.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-card/50 border-border">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 border border-border rounded-lg bg-background hover:border-primary/50 transition-colors cursor-pointer flex justify-between items-center group">
                                <span className="text-sm font-medium">Standard Participation</span>
                                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="p-3 border border-border rounded-lg bg-background hover:border-primary/50 transition-colors cursor-pointer flex justify-between items-center group">
                                <span className="text-sm font-medium">Winner Merit</span>
                                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </div>

                            <Button variant="outline" className="w-full mt-2 text-primary border-primary/20 hover:bg-primary/5">
                                <Plus className="mr-2 h-4 w-4" /> Upload Template
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
