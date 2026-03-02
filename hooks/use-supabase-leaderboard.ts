'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type LeaderboardEntry = {
  id: string
  name: string
  branch?: string
  points: number
  avatar?: string
}

type UseSupabaseLeaderboardResult = {
  entries: LeaderboardEntry[]
  loading: boolean
  error: string | null
}

export function useSupabaseLeaderboard(limit: number = 50): UseSupabaseLeaderboardResult {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: dbError } = await supabase
          .from('students')
          .select('id, name, branch, n_points')
          .order('n_points', { ascending: false })
          .limit(limit)

        if (dbError) throw dbError
        const rows = (data ?? []) as any[]
        const normalized: LeaderboardEntry[] = rows.map((r) => ({
          id: r.id,
          name: r.name,
          branch: r.branch,
          points: r.n_points ?? 0,
          avatar: r.name ? r.name.charAt(0) : undefined,
        }))
        if (!cancelled) setEntries(normalized)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [limit])

  return { entries, loading, error }
}
