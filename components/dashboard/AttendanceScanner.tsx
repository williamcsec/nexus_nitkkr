'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, QrCode } from 'lucide-react';

export default function AttendanceScanner() {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        return () => {
            // Cleanup scanner on unmount
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    const startScanner = () => {
        setIsScanning(true);
        setScanResult(null);
        setResponse(null);

        // Minor delay to ensure DOM element is ready
        setTimeout(() => {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            scannerRef.current.render(onScanSuccess, onScanFailure);
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().then(() => {
                setIsScanning(false);
            }).catch(console.error);
        }
    };

    const onScanSuccess = async (decodedText: string) => {
        // Stop scanning temporarily
        if (scannerRef.current) {
            scannerRef.current.pause(true);
        }
        setScanResult(decodedText);
        setLoading(true);
        setResponse(null);

        try {
            const res = await fetch('/api/mark-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCode: decodedText })
            });
            const data = await res.json();
            setResponse(data);
        } catch (err) {
            setResponse({ error: 'Network error or unable to process request.' });
        } finally {
            setLoading(false);
        }
    };

    const onScanFailure = (error: string) => {
        // Keep scanning natively
    };

    const resumeScanning = () => {
        setScanResult(null);
        setResponse(null);
        if (scannerRef.current) {
            scannerRef.current.resume();
        }
    };

    return (
        <Card className="max-w-md mx-auto border-zinc-800 bg-zinc-900 text-zinc-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" /> Event Attendance Scanner
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {!isScanning ? (
                    <Button onClick={startScanner} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Start Camera Scanner
                    </Button>
                ) : (
                    <Button onClick={stopScanner} variant="destructive" className="w-full">
                        Stop Camera
                    </Button>
                )}

                {isScanning && (
                    <div id="reader" className="w-full overflow-hidden rounded-lg border border-zinc-800 bg-black"></div>
                )}

                {loading && (
                    <div className="flex items-center justify-center p-4 text-zinc-400 gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Verifying Ticket...
                    </div>
                )}

                {response && !loading && (
                    <div className={`p-4 rounded-lg border flex flex-col items-center text-center gap-3 ${response.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {response.success ? (
                            <>
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                <div>
                                    <h3 className="text-xl font-bold">{response.message}</h3>
                                    <p className="mt-1 text-sm text-emerald-400">Student: {response.studentName}</p>
                                    <p className="text-xs text-emerald-400">Event: {response.eventTitle}</p>
                                    {response.nPointsAwarded > 0 && (
                                        <p className="mt-2 text-xs font-semibold bg-emerald-500/20 py-1 px-2 rounded-full inline-block">
                                            +{response.nPointsAwarded} N-Points Awarded!
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-12 w-12 text-red-500" />
                                <div>
                                    <h3 className="text-xl font-bold">Verification Failed</h3>
                                    <p className="mt-1 text-sm text-red-400">{response.error}</p>
                                </div>
                            </>
                        )}

                        <Button onClick={resumeScanning} variant={response.success ? "default" : "destructive"} className="mt-2 w-full">
                            Scan Next Ticket
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
