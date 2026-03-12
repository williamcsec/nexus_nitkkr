'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClubAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function CreateClubPage() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);
        const result = await createClubAction(formData);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(`Club successfully created! Generated login string is stored securely.`);
            e.currentTarget.reset();
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
            <div className="mx-auto max-w-2xl space-y-6">
                <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-zinc-50">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>

                <Card className="border-zinc-800 bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-2xl">Register a New Club</CardTitle>
                        <CardDescription className="text-zinc-400">
                            This will create both the public profile and the secure login credentials.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Club Display Name</Label>
                                    <Input id="name" name="name" placeholder="E.g. CodeX" required className="bg-zinc-800 border-zinc-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL Slug</Label>
                                    <Input id="slug" name="slug" placeholder="e.g. codex" required className="bg-zinc-800 border-zinc-700" />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="clubId">Raw Club ID (for login)</Label>
                                    <Input id="clubId" name="clubId" placeholder="e.g. codex.official" required className="bg-zinc-800 border-zinc-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Login Password</Label>
                                    <Input id="password" name="password" type="text" placeholder="A strong password" required className="bg-zinc-800 border-zinc-700 font-mono" />
                                    <p className="text-xs text-zinc-500">Will be instantly hashed via bcrypt.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" placeholder="E.g. Technical, Cultural, Sports" required className="bg-zinc-800 border-zinc-700" />
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="rounded-md bg-emerald-500/10 p-4 text-sm text-emerald-500 flex items-start gap-2 border border-emerald-500/20">
                                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold block mb-1">Success!</span>
                                        {success}
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Provisioning Club...</> : 'Create Club Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
