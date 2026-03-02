"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Zap, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { branches, hostels, interestOptions } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"


const steps = [
  { id: 1, title: "Account", description: "Create your login credentials" },
  { id: 2, title: "Profile", description: "Tell us about yourself" },
  { id: 3, title: "Interests", description: "Personalize your experience" },
]

export default function GetStartedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <GetStartedInner />
    </Suspense>
  )
}

function GetStartedInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // prefill email from url query param
  useEffect(() => {
    const pre = searchParams.get('email')
    if (pre) {
      setEmail(pre)
    }
  }, [searchParams])

  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  // form state - initialize email from search params
  const [name, setName] = useState("")
  const [email, setEmail] = useState(() => searchParams.get('email') ?? "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [branch, setBranch] = useState("")
  const [year, setYear] = useState<number | null>(null)
  const [hostel, setHostel] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  async function handleNext() {
    setError(null)
    if (step === 1) {
      // validate email domain
      if (!email.endsWith('@nitkkr.ac.in')) {
        setError("Please use your NITK college email (@nitkkr.ac.in)")
        return
      }
      // validate passwords
      if (password.length < 8) {
        setError("Password must be at least 8 characters")
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }
      // attempt signup and sign-in so subsequent RPCs run with an authenticated session
      setLoading(true)
      const trimmedEmail = email.trim().toLowerCase()
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { full_name: name?.trim() || trimmedEmail.split('@')[0] },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/complete-profile`,
        },
      })
      if (signUpError) {
        // If user already exists, try signing in instead
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          })
          setLoading(false)
          if (signInError) {
            setError(signInError.message)
            return
          }
          setStep(2)
          return
        }
        setLoading(false)
        setError(signUpError.message)
        return
      }

      // If signUp returns a session (auto-confirm enabled), we're already logged in
      if (signUpData?.session) {
        setLoading(false)
        setStep(2)
        return
      }

      // Otherwise, try to sign in (email might be auto-confirmed by Supabase)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })
      setLoading(false)
      if (signInError) {
        setError("Account created! Please check your email (" + trimmedEmail + ") to confirm your account, then sign in.")
        return
      }

      setStep(2)
    } else if (step === 2) {
      // validate step 2 - all required
      if (!name.trim()) {
        setError("Full name is required")
        return
      }
      if (name.trim().length < 3) {
        setError("Name must be at least 3 characters")
        return
      }
      if (!branch) {
        setError("Please select your branch")
        return
      }
      if (!year) {
        setError("Please select your year")
        return
      }
      if (!hostel) {
        setError("Please select your hostel")
        return
      }
      if (!phone.trim()) {
        setError("Phone number is required")
        return
      }
      setStep(3)
    } else {
      // validate step 3 - min 3 interests
      if (selectedInterests.length < 3) {
        setError("Please select at least 3 interests")
        return
      }
      // final submit - create student profile via RPC
      setLoading(true)
      try {
        const { data, error } = await supabase.rpc('create_student_profile', {
          payload: {
            email: email.trim().toLowerCase(),
            name: name.trim(),
            branch,
            year,
            hostel,
            phone: phone.trim(),
            interests: selectedInterests,
          },
        })

        if (error) {
          throw error
        }

        // RPC returns array with { id }
        const newId = data?.[0]?.id ?? null
        if (newId) {
          console.log('Created student profile:', newId)
        }

        router.push('/dashboard')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create profile')
      } finally {
        setLoading(false)
      }
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-mono text-2xl font-bold text-foreground">NITK Nexus</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="font-mono text-4xl font-bold leading-tight text-foreground text-balance">
            Join the campus<br />
            <span className="text-primary">revolution.</span>
          </h1>

          {/* Step progress */}
          <div className="space-y-4">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                    step > s.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : step === s.id
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="h-5 w-5" /> : s.id}
                </div>
                <div>
                  <p className={cn(
                    "font-medium transition-colors",
                    step >= s.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}
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
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-mono text-xl font-bold text-foreground">NITK Nexus</span>
            </Link>

            {/* Mobile step indicator */}
            <div className="mb-6 flex items-center gap-2">
              {steps.map((s) => (
                <div key={s.id} className="flex flex-1 items-center gap-2">
                  <div className={cn(
                    "h-2 flex-1 rounded-full transition-all duration-300",
                    step >= s.id ? "bg-primary" : "bg-border"
                  )} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-mono text-2xl font-bold text-foreground">
              {step === 1 && "Create your account"}
              {step === 2 && "Complete your profile"}
              {step === 3 && "What interests you?"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === 1 && "Start with your basic details"}
              {step === 2 && "Help us personalize your experience"}
              {step === 3 && "Select at least 3 topics you love"}
            </p>
            {error && (
              <p className="mt-2 text-red-500 text-sm" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Step 1: Account */}
          <div className={cn("space-y-5 transition-all duration-300", step !== 1 && "hidden")}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-foreground">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="h-11 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm text-foreground">College Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name.roll@nitkkr.ac.in"
                className="h-11 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-sm text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="h-11 border-border bg-secondary/50 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary"
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm text-foreground">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="h-11 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </div>

          {/* Step 2: Profile */}
          <div className={cn("space-y-5 transition-all duration-300", step !== 2 && "hidden")}>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Branch</Label>
              <Select value={branch} onValueChange={(v) => setBranch(v)}>
                <SelectTrigger className="h-11 border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-card border-border">
                  {branches.map((b) => (
                    <SelectItem key={b} value={b} className="text-foreground">{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Year</Label>
              <Select value={year ? String(year) : ""} onValueChange={(v) => {
                const num = parseInt(v, 10)
                if (!isNaN(num)) setYear(num)
                else setYear(null)
              }}>
                <SelectTrigger className="h-11 border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-card border-border">
                  {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((label, idx) => {
                    const val = String(idx + 1)
                    return (
                      <SelectItem key={val} value={val} className="text-foreground">{label}</SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Hostel</Label>
              <Select value={hostel} onValueChange={(v) => setHostel(v)}>
                <SelectTrigger className="h-11 border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Select your hostel" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-card border-border">
                  {hostels.map((h) => (
                    <SelectItem key={h} value={h} className="text-foreground">{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-foreground">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-11 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </div>

          {/* Step 3: Interests */}
          <div className={cn("space-y-5 transition-all duration-300", step !== 3 && "hidden")}>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                    selectedInterests.includes(interest)
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {selectedInterests.includes(interest) && <Check className="mr-1 inline h-3.5 w-3.5" />}
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {selectedInterests.length}/20 (minimum 3)
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="h-11 flex-1 gap-2 border-border text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn(
                "h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
                step === 1 ? "w-full" : "flex-1"
              )}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Creating account...
                </span>
              ) : step === 3 ? (
                <span className="flex items-center gap-2">
                  Create Account <Check className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
