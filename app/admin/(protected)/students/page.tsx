import { redirect } from 'next/navigation'
import { getAdminSession } from '../../login/actions'
import { supabase } from '@/lib/supabaseClient'
import { Users, Zap, Mail, GraduationCap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage() {
    const session = await getAdminSession()
    if (!session) redirect('/admin/login')

    const { data: students } = await supabase
        .from('students')
        .select('id, name, email, branch, year, n_points, is_active, created_at, roll_number')
        .order('n_points', { ascending: false })

    const totalPoints = (students ?? []).reduce((sum: number, s: any) => sum + (s.n_points ?? 0), 0)
    const activeCount = (students ?? []).filter((s: any) => s.is_active).length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Students</h1>
                <p className="text-zinc-400 mt-1">{students?.length ?? 0} registered students · {activeCount} active · {totalPoints.toLocaleString()} total N-Points distributed</p>
            </div>

            {/* Overview badges */}
            <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-zinc-300">{students?.length ?? 0} Total</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-zinc-300">{totalPoints.toLocaleString()} N-Points</span>
                </div>
            </div>

            {/* Students table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/80">
                            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Name</th>
                            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Email</th>
                            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Branch / Year</th>
                            <th className="text-right px-4 py-3 text-zinc-400 font-medium">N-Points</th>
                            <th className="text-center px-4 py-3 text-zinc-400 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(students ?? []).map((student: any, i: number) => (
                            <tr key={student.id} className={`border-b border-zinc-800/50 ${i % 2 === 0 ? 'bg-zinc-900/30' : ''} hover:bg-zinc-800/30 transition-colors`}>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-white">{student.name}</p>
                                    {student.roll_number && <p className="text-xs text-zinc-500 font-mono">{student.roll_number}</p>}
                                </td>
                                <td className="px-4 py-3 text-zinc-400">{student.email}</td>
                                <td className="px-4 py-3 text-zinc-300">
                                    {student.branch ?? '—'} {student.year ? `· Year ${student.year}` : ''}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-mono font-bold text-amber-400">{(student.n_points ?? 0).toLocaleString()}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${student.is_active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {student.is_active !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
