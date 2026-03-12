import { ReactNode } from 'react'

// This is a passthrough layout. Auth checking is handled by app/admin/(protected)/layout.tsx.
// The login page lives directly under /admin/login and must NOT have an auth check in this layout.
export default function AdminRootLayout({ children }: { children: ReactNode }) {
    return <>{children}</>
}
