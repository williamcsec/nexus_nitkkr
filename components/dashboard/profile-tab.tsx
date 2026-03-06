"use client"

import { useCurrentStudent } from "@/hooks/use-current-student"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function ProfileTab() {
    const { student } = useCurrentStudent()

    if (!student) return null

    return (
        <div className="space-y-6">
            <Card className="bg-card/50 border-border">
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>View your student details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Name</Label>
                            <p className="font-medium text-lg">{student.name}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                            <p className="text-lg">{student.email}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Branch</Label>
                            <p className="text-lg">{student.branch}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Year of Study</Label>
                            <p className="text-lg">{student.year}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Total Points</Label>
                            <p className="font-bold text-primary text-lg">{student.nPoints} pts</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
