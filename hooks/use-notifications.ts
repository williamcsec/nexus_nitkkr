import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface NotificationItem {
    id: string
    title: string
    body: string
    type: 'Event' | 'Registration' | 'Certificate' | 'Points' | 'General' | 'FOMO'
    related_id?: string
    is_read: boolean
    priority: 'Low' | 'Normal' | 'High' | 'Urgent'
    created_at: string
}

export function useNotifications(studentId: string | undefined) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!studentId) {
            setNotifications([])
            setUnreadCount(0)
            setLoading(false)
            return
        }

        async function fetchNotifications() {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("student_id", studentId)
                .order("created_at", { ascending: false })
                .limit(20)

            if (error) {
                console.error("Error fetching notifications:", error)
            } else {
                setNotifications(data as NotificationItem[] || [])
                setUnreadCount((data || []).filter(n => !n.is_read).length)
            }
            setLoading(false)
        }

        fetchNotifications()

        // Optionally set up real-time subscription here
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `student_id=eq.${studentId}`,
                },
                (payload) => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [studentId])

    const markAsRead = async (notificationId: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    const markAllAsRead = async () => {
        if (!studentId) return

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('student_id', studentId)
            .eq('is_read', false)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        }
    }

    return { notifications, unreadCount, loading, markAsRead, markAllAsRead }
}
