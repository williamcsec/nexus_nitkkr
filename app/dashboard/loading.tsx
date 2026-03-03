import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-transparent">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Syncing Student Dashboard...
                </p>
            </div>
        </div>
    )
}
