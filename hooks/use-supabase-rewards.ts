'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type Reward = {
  id: string
  title: string
  description: string
  category: string
  stock: number
  cost: number
}

type UseSupabaseRewardsResult = {
  rewards: Reward[]
  loading: boolean
  error: string | null
}

export function useSupabaseRewards(): UseSupabaseRewardsResult {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: dbError } = await supabase
          .from('rewards')
          .select('id, title, description, category, stock, cost')
          .order('cost', { ascending: true })

        if (dbError) {
          // The rewards table may not exist yet — show a friendly message
          if (dbError.message.includes('does not exist') || dbError.code === '42P01' || dbError.code === 'PGRST204') {
            if (!cancelled) setError('Rewards store coming soon!')
            return
          }
          throw dbError
        }
        const rows = (data ?? []) as any[]
        const normalized: Reward[] = rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          category: r.category || '',
          stock: r.stock ?? 0,
          cost: r.cost ?? 0,
        }))
        if (!cancelled) setRewards(normalized)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load rewards')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { rewards, loading, error }
}
