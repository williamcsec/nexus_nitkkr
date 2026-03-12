'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Users, CalendarDays, Shield,
    Building2, ClipboardList, BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/clubs', label: 'Clubs & Credentials', icon: Building2 },
    { href: '/admin/events', label: 'Events', icon: CalendarDays },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/venues', label: 'Venue Bookings', icon: BookOpen },
    { href: '/admin/audit', label: 'Audit Log', icon: ClipboardList },
]

export function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent'
                        )}
                    >
                        <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-indigo-400' : '')} />
                        {label}
                    </Link>
                )
            })}
        </nav>
    )
}
