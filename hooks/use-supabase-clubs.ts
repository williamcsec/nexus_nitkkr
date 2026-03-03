'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type Club = {
  id: string
  slug: string
  name: string
  category: string
  description: string
  logoUrl: string | null
  totalMembers: number
}

type UseSupabaseClubsResult = {
  clubs: Club[]
  loading: boolean
  error: string | null
}

export function useSupabaseClubs(): UseSupabaseClubsResult {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: dbError } = await supabase
          .from('clubs')
          .select('id, slug, name, category, description, logo_url, total_members')

        if (dbError) throw dbError
        const rows = (data ?? []) as any[]
        const normalized: Club[] = rows.map((r) => ({
          id: r.id,
          slug: r.slug || r.id,
          name: r.name,
          category: r.category || 'Other',
          description: r.description || '',
          logoUrl: r.logo_url || null,
          totalMembers: r.total_members || 0,
        }))
        if (!cancelled) setClubs(normalized)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load clubs')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { clubs, loading, error }
}
