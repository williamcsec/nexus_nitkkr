"use client"

import AttendanceScanner from "@/components/dashboard/AttendanceScanner"

export default function ScannerPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto w-full">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Attendance Scanner</h2>
                <p className="text-muted-foreground">Scan event ticket QR codes</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Scanner UI */}
                <AttendanceScanner />

                {/* Instructions */}
                <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                        <h4 className="font-semibold text-lg mb-2 text-primary">How to use</h4>
                        <p className="text-muted-foreground leading-relaxed">
                            Position the student's QR code in the center of the camera frame. The scanner will automatically verify the ticket against the database.
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-zinc-400">
                            <li>Valid tickets map to <strong>Present</strong> in the DB.</li>
                            <li>N-Points are automatically issued on scan.</li>
                            <li>Already-scanned tickets will be rejected.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
