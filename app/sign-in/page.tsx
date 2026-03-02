"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Zap, Github, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabaseClient"


export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // redirect if already authenticated
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/dashboard')
      }
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const trimmedEmail = email.trim().toLowerCase()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (authError) {
        throw authError
      }

      // check if profile exists and is complete
      const userId = data.user?.id
      const { data: profile, error: dbError } = await supabase
        .from('students')
        .select('id, branch')
        .eq('auth_id', userId)
        .maybeSingle()

      if (dbError) {
        throw dbError
      }

      // if no profile or incomplete profile, redirect to complete it
      if (!profile || !profile.branch) {
        router.push('/complete-profile')
        return
      }

      // redirect on success
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // social OAuth handler
  async function handleOAuth(provider: 'google' | 'github') {
    setError(null)
    setLoading(true)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { scopes: 'email' },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Left branding panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-card/30 p-12 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-mono text-2xl font-bold text-foreground">NITK Nexus</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="font-mono text-4xl font-bold leading-tight text-foreground text-balance">
            Your entire campus life,<br />
            <span className="text-primary">one platform.</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground leading-relaxed">
            Discover events, join clubs, earn certificates, and collect N-Points — all from one intelligent dashboard.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">20+</span>
              <span>Active Clubs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">500+</span>
              <span>Events/Year</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">5000+</span>
              <span>Students</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground">
          NIT Kurukshetra Campus Platform
        </p>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-mono text-xl font-bold text-foreground">NITK Nexus</span>
            </Link>
          </div>

          <div>
            <h2 className="font-mono text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your registered college email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name.roll@nitkkr.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-border bg-secondary/50 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            {error && (
              <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">
                  {error}
                </p>
                {error.includes("Profile not found") && (
                  <Link href="/get-started" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Create a new account →
                  </Link>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <Separator className="bg-border" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleOAuth('google')}
              className="h-11 flex-1 gap-2 border-border bg-secondary/30 text-foreground hover:bg-secondary/60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuth('github')}
              className="h-11 flex-1 gap-2 border-border bg-secondary/30 text-foreground hover:bg-secondary/60"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/get-started" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Get Started
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
