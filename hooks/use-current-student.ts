'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

const STORAGE_KEY = 'nitk_nexus_student_id'

export type CurrentStudent = {
  id: string
  name: string
  email: string
  branch: string | null
  year: number | null
  avatar: string
  nPoints: number
}

type UseCurrentStudentResult = {
  student: CurrentStudent | null
  loading: boolean
  error: string | null
}

export function setCurrentStudentId(id: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, id)
}

export function clearCurrentStudentId() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function getStoredStudentId(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(STORAGE_KEY)
}

export function useCurrentStudent(): UseCurrentStudentResult {
  const [student, setStudent] = useState<CurrentStudent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = getStoredStudentId()
    if (!id) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: dbError } = await supabase
          .from('students')
          .select('id, name, email, branch, year, n_points, profile_pic_url')
          .eq('id', id)
          .maybeSingle()

        if (dbError) throw dbError
        if (!data) {
          if (!cancelled) {
            setStudent(null)
            clearCurrentStudentId()
          }
          return
        }

        if (!cancelled) {
          const avatar =
            typeof data.name === 'string' && data.name.trim().length > 0
              ? data.name
                  .split(' ')
                  .map((part: string) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'ST'

          setStudent({
            id: data.id as string,
            name: data.name as string,
            email: data.email as string,
            branch: (data.branch as string | null) ?? null,
            year: (data.year as number | null) ?? null,
            avatar,
            nPoints: (data.n_points as number | null) ?? 0,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load student')
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

  return { student, loading, error }
}

