'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type Voucher = {
  id: string
  description: string
  value: number
  isRedeemed: boolean
  redeemedAt: string | null
  qrCode: string
}

type UseSupabaseVouchersResult = {
  vouchers: Voucher[]
  loading: boolean
  error: string | null
}

export function useSupabaseVouchers(studentId: string | null): UseSupabaseVouchersResult {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setVouchers([])
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
          .from('vouchers')
          .select('id, description, value, is_redeemed, redeemed_at, qr_code')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })

        if (dbError) throw dbError
        const rows = (data ?? []) as any[]
        const normalized: Voucher[] = rows.map((v) => ({
          id: v.id,
          description: v.description || '',
          value: v.value,
          isRedeemed: v.is_redeemed,
          redeemedAt: v.redeemed_at || null,
          qrCode: v.qr_code,
        }))
        if (!cancelled) setVouchers(normalized)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load vouchers')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [studentId])

  return { vouchers, loading, error }
}
