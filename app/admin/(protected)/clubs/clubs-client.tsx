'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Eye, EyeOff, Copy, Check, Users, PlusCircle, Key, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { resetClubPassword } from '../actions'

type CredentialInfo = {
    id: string
    club_id: string
    plainPassword: string
    created_at: string
    created_by: string
}

type Club = {
    id: string
    name: string
    slug: string
    category: string | null
    is_verified: boolean
    total_members: number
    created_at: string
    credential: CredentialInfo | null
}

export function AdminClubsClient({ clubs }: { clubs: Club[] }) {
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [resetingId, setResetingId] = useState<string | null>(null)
    const [resetForm, setResetForm] = useState<{ id: string; newPass: string } | null>(null)
    const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null)

    async function handleCopy(text: string, key: string) {
        await navigator.clipboard.writeText(text)
        setCopiedId(key)
        setTimeout(() => setCopiedId(null), 2000)
    }

    async function handleReset(credId: string, clubId: string) {
        if (!resetForm || resetForm.id !== credId) return
        setResetingId(credId)
        const result = await resetClubPassword(credId, clubId, resetForm.newPass)
        setResetingId(null)
        if (result.success) {
            setFeedback({ id: credId, msg: 'Password reset successfully!', ok: true })
            setResetForm(null)
        } else {
            setFeedback({ id: credId, msg: result.error ?? 'Error', ok: false })
        }
        setTimeout(() => setFeedback(null), 4000)
    }

    const categoryColors: Record<string, string> = {
        Cultural: 'bg-pink-500/20 text-pink-400',
        Technical: 'bg-blue-500/20 text-blue-400',
        Sports: 'bg-green-500/20 text-green-400',
        Literary: 'bg-violet-500/20 text-violet-400',
        Social: 'bg-amber-500/20 text-amber-400',
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Clubs & Credentials</h1>
                    <p className="text-zinc-400 mt-1">Manage all clubs and their portal login credentials</p>
                </div>
                <Link href="/admin/create-club">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <PlusCircle className="h-4 w-4 mr-2" /> Create Club
                    </Button>
                </Link>
            </div>

            {/* Summary */}
            <div className="flex gap-4 text-sm text-zinc-400">
                <span className="text-emerald-400 font-medium">{clubs.filter(c => c.credential).length} clubs with credentials</span>
                <span>·</span>
                <span className="text-red-400 font-medium">{clubs.filter(c => !c.credential).length} clubs missing credentials</span>
            </div>

            <div className="space-y-3">
                {clubs.map((club) => (
                    <Card key={club.id} className="border-zinc-800 bg-zinc-900/50">
                        <CardContent className="p-5">
                            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                                {/* Club Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <Building2 className="h-4 w-4 text-zinc-400" />
                                        <h3 className="font-semibold text-white text-base">{club.name}</h3>
                                        {club.category && (
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[club.category] ?? 'bg-zinc-700 text-zinc-400'}`}>
                                                {club.category}
                                            </span>
                                        )}
                                        {club.is_verified && (
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Verified</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500">ID: {club.id}</p>
                                </div>

                                {/* Credentials */}
                                {club.credential ? (
                                    <div className="w-full lg:w-auto flex flex-col gap-2">
                                        {/* Club Login ID */}
                                        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
                                            <Key className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                                            <span className="text-xs text-zinc-400 mr-2">Club ID:</span>
                                            <span className="font-mono text-sm text-white">{club.credential.club_id}</span>
                                            <button
                                                onClick={() => handleCopy(club.credential!.club_id, `cid-${club.id}`)}
                                                className="ml-1 text-zinc-500 hover:text-white transition-colors"
                                            >
                                                {copiedId === `cid-${club.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                            </button>
                                        </div>

                                        {/* Password */}
                                        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
                                            <span className="text-xs text-zinc-400 mr-2">Password:</span>
                                            <span className="font-mono text-sm text-white">
                                                {visiblePasswords[club.id] ? club.credential.plainPassword : '••••••••••••••'}
                                            </span>
                                            <button
                                                onClick={() => setVisiblePasswords(v => ({ ...v, [club.id]: !v[club.id] }))}
                                                className="ml-1 text-zinc-500 hover:text-white transition-colors"
                                            >
                                                {visiblePasswords[club.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                            </button>
                                            <button
                                                onClick={() => handleCopy(club.credential!.plainPassword, `pwd-${club.id}`)}
                                                className="text-zinc-500 hover:text-white transition-colors"
                                            >
                                                {copiedId === `pwd-${club.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                            </button>
                                        </div>

                                        {/* Reset password form toggle */}
                                        {resetForm?.id === club.credential.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="New password..."
                                                    value={resetForm.newPass}
                                                    onChange={e => setResetForm({ id: club.credential!.id, newPass: e.target.value })}
                                                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReset(club.credential!.id, club.credential!.club_id)}
                                                    disabled={resetingId === club.credential.id}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                >
                                                    {resetingId === club.credential.id ? 'Saving…' : 'Save'}
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setResetForm(null)} className="text-zinc-400">
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setResetForm({ id: club.credential!.id, newPass: '' })}
                                                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
                                            >
                                                <RefreshCw className="h-3 w-3" /> Reset password
                                            </button>
                                        )}

                                        {feedback?.id === club.credential.id && (
                                            <p className={`text-xs ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.msg}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                                            No credentials set
                                        </span>
                                        {/* This case shouldn't happen since we bulk-inserted all — but just in case */}
                                        <Link href="/admin/create-club">
                                            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300">
                                                Set Up
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
