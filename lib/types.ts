// Shared TypeScript interfaces for Supabase data

export type Club = {
  id: string
  name: string
  description?: string
  category?: string
  image_url?: string
  // display fields used in UI, can be derived or fetched as needed
  coverGradient?: string
  logo?: string
  featured?: boolean
  members?: number
  events?: number
}

export type EventItem = {
  id: string
  title: string
  clubId: string
  clubName: string
  type: string
  date: string // YYYY-MM-DD
  time: string // human-readable
  venue: string
  description: string
  registrations: number
  maxCapacity: number
  nPoints: number
  isPaid: boolean
  price?: number
  tags: string[]
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  matchScore?: number
}

export type Registration = {
  id: string
  eventId: string
  eventTitle: string
  clubName: string
  date: string // YYYY-MM-DD
  venue: string
  status: 'upcoming' | 'attended' | 'missed' | 'cancelled'
  hasCertificate: boolean
}

export type Certificate = {
  id: string
  title: string
  event: string
  clubName?: string
  type: string
  date: string // YYYY-MM-DD
  verified: boolean
}

// Additional types can be added as needed
