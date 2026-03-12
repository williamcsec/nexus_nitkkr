import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAdminSession, adminLogout } from './login/actions'
import { Shield, LogOut } from 'lucide-react'
import { AdminNav } from './admin-nav'

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getAdminSession()

    if (!session) {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            {/* Sidebar */}
            <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col fixed top-0 left-0 z-40">
                <div className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-5 w-5 text-indigo-400" />
                        <span className="font-bold text-lg text-white">Nexus Admin</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">Logged in as {session.email}</p>
                </div>

                <AdminNav />

                <div className="p-4 border-t border-zinc-800">
                    <form action={adminLogout}>
                        <button
                            type="submit"
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-transparent"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 min-h-screen p-8">
                {children}
            </main>
        </div>
    )
}
