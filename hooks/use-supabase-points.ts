'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type PointsTransaction = {
  id: string
  points: number
  description: string
  createdAt: string
  balanceAfter: number
}

type UseSupabasePointsResult = {
  balance: number
  transactions: PointsTransaction[]
  loading: boolean
  error: string | null
}

export function useSupabasePoints(studentId: string | null): UseSupabasePointsResult {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setBalance(0)
      setTransactions([])
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [{ data: studentData, error: studErr }, { data: transData, error: transErr }] =
          await Promise.all([
            supabase
              .from('students')
              .select('n_points')
              .eq('id', studentId)
              .maybeSingle(),
            supabase
              .from('n_points_transactions')
              .select('id, points, description, created_at, balance_after')
              .eq('student_id', studentId)
              .order('created_at', { ascending: false })
              .limit(20),
          ])
        if (studErr) throw studErr
        if (transErr) throw transErr
        if (!cancelled) {
          setBalance((studentData as any)?.n_points ?? 0)
          const normalized: PointsTransaction[] = (transData ?? []).map((t: any) => ({
            id: t.id,
            points: t.points,
            description: t.description || '',
            createdAt: t.created_at,
            balanceAfter: t.balance_after,
          }))
          setTransactions(normalized)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load points')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [studentId])

  return { balance, transactions, loading, error }
}
