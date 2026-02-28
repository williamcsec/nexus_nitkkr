'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Status = 'idle' | 'connecting' | 'connected' | 'error'

export function SupabaseStatus() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        setStatus('connecting')
        setMessage('Pinging Supabase from the browser...')

        // Simple, low-cost call to verify the client works.
        const { data, error } = await supabase.from('clubs').select('*').limit(1)

        if (error) {
          setStatus('error')
          setMessage(error.message)
          return
        }

        setStatus('connected')
        setMessage(
          `Supabase client is configured. Sample query returned ${data?.length ?? 0} row(s) from the "clubs" table.`,
        )
      } catch (err) {
        const error =
          err instanceof Error ? err.message : 'Unknown error connecting to Supabase'
        setStatus('error')
        setMessage(error)
      }
    }

    void checkConnection()
  }, [])

  const badgeVariant =
    status === 'connected'
      ? 'default'
      : status === 'error'
        ? 'destructive'
        : 'secondary'

  return (
    <Card className="mt-10 max-w-xl border-dashed">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-base">Supabase connection status</CardTitle>
          <Badge variant={badgeVariant}>
            {status === 'idle'
              ? 'Idle'
              : status === 'connecting'
                ? 'Connecting'
                : status === 'connected'
                  ? 'Connected'
                  : 'Error'}
          </Badge>
        </div>
        <CardDescription>
          Using your Supabase URL and anon key from this Next.js app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {message ??
            'The Supabase client is set up. As soon as this page mounts, we will run a small test query.'}
        </p>
      </CardContent>
    </Card>
  )
}

