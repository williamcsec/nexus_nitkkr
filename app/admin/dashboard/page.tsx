import { getAdminSession, adminLogout } from '../login/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, PlusCircle, LogOut, Users } from 'lucide-react';

export default async function AdminDashboardPage() {
    const session = await getAdminSession();

    if (!session) {
        redirect('/admin/login');
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
            <div className="mx-auto max-w-5xl space-y-8">
                <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
                        <p className="text-zinc-400">Welcome back, {session.name} ({session.role})</p>
                    </div>
                    <form action={adminLogout}>
                        <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </form>
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <Shield className="h-8 w-8 text-indigo-400 mb-2" />
                            <CardTitle>Security Overview</CardTitle>
                            <CardDescription className="text-zinc-400">System health and audit logs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-300">All club passwords are now hashed and secure. Lock settings are active.</p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <Users className="h-8 w-8 text-emerald-400 mb-2" />
                            <CardTitle>Manage Clubs</CardTitle>
                            <CardDescription className="text-zinc-400">Add, suspend, or manage club accounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/admin/create-club">
                                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Club
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
