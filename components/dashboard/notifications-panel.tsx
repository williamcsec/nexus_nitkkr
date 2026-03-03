"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, Loader2, Calendar, Trophy, AlertCircle, Sparkles, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications, NotificationItem } from "@/hooks/use-notifications"
import { useCurrentStudent } from "@/hooks/use-current-student"
import { ScrollArea } from "@/components/ui/scroll-area"

function getNotificationIcon(type: NotificationItem['type']) {
    switch (type) {
        case 'Event': return <Calendar className="h-4 w-4 text-blue-500" />
        case 'Certificate': return <Trophy className="h-4 w-4 text-emerald-500" />
        case 'Registration': return <Check className="h-4 w-4 text-primary" />
        case 'Points': return <Sparkles className="h-4 w-4 text-amber-500" />
        case 'FOMO': return <AlertCircle className="h-4 w-4 text-rose-500" />
        default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />
    }
}

export function NotificationsPanel() {
    const { student } = useCurrentStudent()
    const [isOpen, setIsOpen] = useState(false)

    // Conditionally fetch based on student existence
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(student?.id)

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-foreground hover:bg-secondary/80 focus-visible:ring-0"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0 border-border bg-background/95 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <DropdownMenuLabel className="p-0 font-semibold flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary">
                                {unreadCount} new
                            </Badge>
                        )}
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center gap-2 text-center px-4">
                            <Bell className="h-8 w-8 text-muted-foreground/30" />
                            <p className="text-sm font-medium text-muted-foreground">You're all caught up!</p>
                            <p className="text-xs text-muted-foreground/70">No new notifications right now.</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`flex flex-col items-start gap-1 p-4 cursor-default focus:bg-secondary/50 ${!notification.is_read ? 'bg-secondary/20' : ''
                                        }`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (!notification.is_read) markAsRead(notification.id)
                                    }}
                                >
                                    <div className="flex w-full items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium leading-none ${!notification.is_read ? 'text-foreground' : 'text-foreground/80'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.body}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground/60 mt-1">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {notifications.length > 0 && (
                    <div className="p-2 border-t border-border bg-secondary/10">
                        <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground" disabled>
                            View All History (Coming Soon)
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
