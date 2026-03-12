import { redirect } from 'next/navigation'
import { getAdminSession } from '../../login/actions'
import { supabase } from '@/lib/supabaseClient'
import { ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminAuditPage() {
    const session = await getAdminSession()
    if (!session) redirect('/admin/login')

    const { data: logs } = await supabase
        .from('audit_log')
        .select('id, club_id, action, details, ip_address, created_at')
        .order('created_at', { ascending: false })
        .limit(200)

    const actionColors: Record<string, string> = {
        'CLUB_CREATED': 'bg-emerald-500/20 text-emerald-400',
        'CREDENTIALS_GENERATED': 'bg-blue-500/20 text-blue-400',
        'PASSWORD_RESET': 'bg-amber-500/20 text-amber-400',
        'CLUB_LOGIN': 'bg-indigo-500/20 text-indigo-400',
        'CLUB_LOGOUT': 'bg-zinc-700 text-zinc-400',
        'EVENT_CREATED': 'bg-violet-500/20 text-violet-400',
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Audit Log</h1>
                <p className="text-zinc-400 mt-1">Last 200 actions on the platform</p>
            </div>

            {(logs?.length ?? 0) === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No audit logs yet.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-zinc-800 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900/80">
                                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Timestamp</th>
                                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Action</th>
                                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Club ID</th>
                                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(logs ?? []).map((log: any, i: number) => (
                                <tr key={log.id} className={`border-b border-zinc-800/50 ${i % 2 === 0 ? 'bg-zinc-900/30' : ''} hover:bg-zinc-800/30 transition-colors`}>
                                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs font-mono">
                                        {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${actionColors[log.action] ?? 'bg-zinc-700 text-zinc-400'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{log.club_id ?? '—'}</td>
                                    <td className="px-4 py-3 text-zinc-400 text-xs max-w-xs">
                                        {log.details ? (
                                            <span className="font-mono">
                                                {Object.entries(log.details as Record<string, any>)
                                                    .map(([k, v]) => `${k}: ${v}`)
                                                    .join(' · ')}
                                            </span>
                                        ) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
