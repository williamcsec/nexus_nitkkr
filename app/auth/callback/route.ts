import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)

    // Handle both PKCE flow (code) and implicit flow (token_hash)
    const code = requestUrl.searchParams.get('code')
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (code) {
        // PKCE flow: exchange code for session
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(new URL(next, requestUrl.origin))
        }
    }

    if (token_hash && type) {
        // Implicit/magic-link flow: verify the OTP
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'signup' | 'email',
        })

        if (!error) {
            return NextResponse.redirect(new URL(next, requestUrl.origin))
        }
    }

    // If we get here, the auth exchange failed or no valid params were provided
    // Redirect to sign-in with an error indicator
    return NextResponse.redirect(
        new URL('/sign-in?error=auth_callback_error', requestUrl.origin)
    )
}
