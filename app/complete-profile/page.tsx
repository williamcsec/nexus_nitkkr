"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Zap, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { branches, hostels, interestOptions } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"


const steps = [
  { id: 1, title: "Profile", description: "Tell us about yourself" },
  { id: 2, title: "Interests", description: "Personalize your experience" },
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authEmail, setAuthEmail] = useState("")
  const [authName, setAuthName] = useState("")

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user?.email) {
        router.push('/sign-in')
        return
      }

      // Check if profile already exists and is COMPLETE
      const { data: profile, error: profileError } = await supabase
        .from('students')
        .select('id, branch, name')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (profileError) {
        setError('Failed to check profile status')
        setLoading(false)
        return
      }

      if (profile && profile.branch) {
        // Profile exists AND is complete, go to dashboard
        router.push('/dashboard')
        return
      }

      // Set auth info (profile may be a stub from the trigger)
      setAuthEmail(user.email || '')
      setAuthName(profile?.name || user.user_metadata?.full_name || '')
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // Form state
  const [name, setName] = useState("")
  const [branch, setBranch] = useState("")
  const [year, setYear] = useState<number | null>(null)
  const [hostel, setHostel] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  useEffect(() => {
    if (authName) {
      setName(authName)
    }
  }, [authName])

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
      // validate step 1 - all required
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
      setStep(2)
    } else {
      // validate step 2 - min 3 interests
      if (selectedInterests.length < 3) {
        setError("Please select at least 3 interests")
        return
      }

      // Submit profile via RPC
      setLoading(true)
      try {
        const { data, error } = await supabase.rpc('create_student_profile', {
          payload: {
            email: authEmail.toLowerCase(),
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
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
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
            Complete your<br />
            <span className="text-primary">profile</span>
          </h1>

          <p className="max-w-sm text-muted-foreground leading-relaxed">
            We just need a few more details to personalize your NITK Nexus experience and connect you with the right events and opportunities.
          </p>

          <div className="space-y-3 pt-4">
            <p className="text-sm font-medium text-foreground">Email</p>
            <p className="text-sm text-muted-foreground font-mono">{authEmail}</p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          Step {step} of {steps.length}
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="mb-4 flex gap-2">
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

          {/* Step content */}
          <div>
            <h2 className="font-mono text-2xl font-bold text-foreground">
              {step === 1 && "Complete your profile"}
              {step === 2 && "What interests you?"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === 1 && "Help us personalize your experience"}
              {step === 2 && "Select at least 3 topics you love"}
            </p>
            {error && (
              <p className="mt-2 text-red-500 text-sm" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Step 1: Profile */}
          <div className={cn("space-y-5 transition-all duration-300 mt-8", step !== 1 && "hidden")}>
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
              <Label className="text-sm text-foreground">Branch</Label>
              <Select value={branch} onValueChange={(v) => setBranch(v)}>
                <SelectTrigger className="h-11 border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
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
                <SelectContent className="bg-card border-border">
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
                <SelectContent className="bg-card border-border">
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

          {/* Step 2: Interests */}
          <div className={cn("space-y-5 transition-all duration-300 mt-8", step !== 2 && "hidden")}>
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
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className={cn(step === 1 ? "w-full" : "flex-1")}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn("bg-primary text-primary-foreground hover:bg-primary/90", step === 1 ? "w-full" : "flex-1")}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {step === steps.length ? "Complete Profile" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
