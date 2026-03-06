"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CalendarDays, Users, ScanLine, Award, UserCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export function ClubDashboardNav() {
    const pathname = usePathname()

    const items = [
        {
            title: "Overview",
            href: "/club-dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Manage Events",
            href: "/club-dashboard/events",
            icon: CalendarDays,
        },
        {
            title: "Attendance Scanner",
            href: "/club-dashboard/scanner",
            icon: ScanLine,
        },
        {
            title: "Members",
            href: "/club-dashboard/members",
            icon: Users,
        },
        {
            title: "Certificates",
            href: "/club-dashboard/certificates",
            icon: Award,
        },
        {
            title: "Profile",
            href: "/club-dashboard/profile",
            icon: UserCircle,
        },
    ]

    return (
        <nav className="grid items-start gap-2">
            {items.map((item) => {
                const Icon = item.icon
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                            pathname === item.href ? "bg-accent/80 text-accent-foreground" : "transparent"
                        )}
                    >
                        <Icon className={cn("mr-2 h-4 w-4", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
                        <span>{item.title}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
