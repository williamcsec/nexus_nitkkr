'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await adminLogin(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push('/admin/dashboard');
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        🔐 Admin Login
                    </CardTitle>
                    <p className="text-sm text-zinc-400">
                        NITK Nexus Administration
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Admin Email"
                                required
                                className="bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Password"
                                required
                                className="bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                            />
                        </div>
                        {error && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
