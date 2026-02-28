'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'
import type { Certificate } from '@/lib/mock-data'

type UseSupabaseCertificatesResult = {
  certificates: Certificate[]
  loading: boolean
  error: string | null
}

export function useSupabaseCertificates(studentId: string | null): UseSupabaseCertificatesResult {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setCertificates([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: dbError } = await supabase
          .from('certificates')
          .select('id, certificate_type, issued_at, is_verified')
          .eq('student_id', studentId)

        if (dbError) {
          throw dbError
        }

        const rows = (data ?? []) as any[]

        const normalized: Certificate[] = rows.map((row) => {
          const issued = row.issued_at ? new Date(row.issued_at as string) : new Date()
          const type = (row.certificate_type as string | null) ?? 'Participation'

          return {
            id: row.id as string,
            title: `${type} Certificate`,
            event: '',
            clubName: '',
            type,
            date: issued.toISOString().slice(0, 10),
            verified: Boolean(row.is_verified),
          }
        })

        if (!cancelled) {
          setCertificates(normalized)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load certificates')
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
  }, [studentId])

  return { certificates, loading, error }
}

