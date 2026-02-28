"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { DiscoverTab } from "@/components/dashboard/discover-tab"
import { RegistrationsTab } from "@/components/dashboard/registrations-tab"
import { CertificatesTab } from "@/components/dashboard/certificates-tab"
import { WalletTab } from "@/components/dashboard/wallet-tab"

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "discover", label: "Discover Events" },
  { id: "registrations", label: "My Registrations" },
  { id: "certificates", label: "Certificates" },
  { id: "wallet", label: "Wallet" },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

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
        </div>
      </div>
    </div>
  )
}
