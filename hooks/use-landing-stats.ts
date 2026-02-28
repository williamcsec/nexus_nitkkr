'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

export type LandingStats = {
  students: number
  clubs: number
  eventsMonthly: number
  certificates: number
}

type UseLandingStatsResult = {
  stats: LandingStats
  loading: boolean
  error: string | null
}

const initialStats: LandingStats = {
  students: 0,
  clubs: 0,
  eventsMonthly: 0,
  certificates: 0,
}

export function useLandingStats(): UseLandingStatsResult {
  const [stats, setStats] = useState<LandingStats>(initialStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const startOfMonthIso = startOfMonth.toISOString()
        const endOfMonthIso = new Date(
          endOfMonth.getFullYear(),
          endOfMonth.getMonth(),
          endOfMonth.getDate(),
          23,
          59,
          59,
        ).toISOString()

        const [
          { count: studentsCount, error: studentsError },
          { count: clubsCount, error: clubsError },
          { count: eventsCount, error: eventsError },
          { count: certificatesCount, error: certificatesError },
        ] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('clubs').select('id', { count: 'exact', head: true }),
          supabase
            .from('events')
            .select('id', { count: 'exact', head: true })
            .gte('start_time', startOfMonthIso)
            .lte('start_time', endOfMonthIso),
          supabase.from('certificates').select('id', { count: 'exact', head: true }),
        ])

        if (studentsError || clubsError || eventsError || certificatesError) {
          throw studentsError || clubsError || eventsError || certificatesError
        }

        if (!cancelled) {
          setStats({
            students: studentsCount ?? 0,
            clubs: clubsCount ?? 0,
            eventsMonthly: eventsCount ?? 0,
            certificates: certificatesCount ?? 0,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load landing stats')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return { stats, loading, error }
}

