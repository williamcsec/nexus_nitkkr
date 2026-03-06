"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentStudent } from "@/hooks/use-current-student"
import { supabase } from "@/lib/supabaseClient"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { DiscoverTab } from "@/components/dashboard/discover-tab"
import { RegistrationsTab } from "@/components/dashboard/registrations-tab"
import { CertificatesTab } from "@/components/dashboard/certificates-tab"
import { WalletTab } from "@/components/dashboard/wallet-tab"
import { ProfileTab } from "@/components/dashboard/profile-tab"

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "discover", label: "Discover Events" },
  { id: "registrations", label: "My Registrations" },
  { id: "certificates", label: "Certificates" },
  { id: "wallet", label: "Wallet" },
  { id: "profile", label: "Profile" },
]

export default function DashboardPage() {
  const router = useRouter()
  const { student, loading } = useCurrentStudent()

  // Set initial tab from hash if available, otherwise "overview"
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "")
      return tabs.some(t => t.id === hash) ? hash : "overview"
    }
    return "overview"
  })

  const [checkingAuth, setCheckingAuth] = useState(true)

  // Update hash when tab changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.hash = activeTab
    }
  }, [activeTab])

  // Check authentication and profile status
  useEffect(() => {
    async function checkAuthStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id) {
        // Not authenticated
        router.push('/sign-in')
        return
      }

      // Check if profile exists AND is complete
      const { data: profile } = await supabase
        .from('students')
        .select('id, branch')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!profile || !profile.branch) {
        // Authenticated but no complete profile - redirect to complete profile
        router.push('/complete-profile')
        return
      }

      setCheckingAuth(false)
    }

    checkAuthStatus()
  }, [router])

  if (checkingAuth || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return null // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <DashboardNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-8"
        />

        <div className="transition-all duration-300">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "discover" && <DiscoverTab />}
          {activeTab === "registrations" && <RegistrationsTab />}
          {activeTab === "certificates" && <CertificatesTab />}
          {activeTab === "wallet" && <WalletTab />}
          {activeTab === "profile" && <ProfileTab />}
        </div>
      </div>
    </div>
  )
}
