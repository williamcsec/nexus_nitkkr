'use client';

import { useState } from 'react';
import { issueCertificates } from '@/app/actions/certificates';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Award } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function IssueCertificateForm({ events }: { events: { id: string; title: string; current_registrations: number }[] }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    async function handleAction(formData: FormData) {
        setLoading(true);
        const res = await issueCertificates(formData);
        setLoading(false);

        if (res.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        } else {
            toast({ title: 'Success!', description: `Issued ${res.count} certificates successfully across all Present attendees.` });
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Issue New Certificate
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-zinc-800 bg-zinc-950 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" /> Issue Certificates
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Select a past event. Cloudinary will dynamically overlay student names and event titles on the active template and distribute them via the Notification bell.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleAction} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Event</label>
                        <Select name="eventId" required>
                            <SelectTrigger className="border-zinc-800 bg-zinc-900">
                                <SelectValue placeholder="Choose an event..." />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                                {events.map(ev => (
                                    <SelectItem key={ev.id} value={ev.id}>
                                        {ev.title} ({ev.current_registrations} regs)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cloudinary Template Public ID</label>
                        <input
                            name="templateId"
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500"
                            placeholder="e.g. nexus_cert_template"
                            defaultValue="nexus_cert_template"
                        />
                        <p className="text-xs text-zinc-500">The Base template pre-uploaded to Cloudinary.</p>
                    </div>

                    <Button type="submit" className="w-full bg-primary" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting Certificates...</> : 'Generate & Send'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
