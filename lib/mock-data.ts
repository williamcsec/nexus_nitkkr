// ─── NITK Nexus Mock Data ────────────────────────────────────────

// ─── CLUBS ───────────────────────────────────────────────────────
export type Club = {
  id: string
  name: string
  shortName: string
  category: "Technical" | "Cultural" | "Sports" | "Social"
  description: string
  members: number
  events: number
  logo: string
  coverGradient: string
  featured?: boolean
}

export const clubs: Club[] = [
  {
    id: "arc",
    name: "Automation and Robotics Club",
    shortName: "ARC",
    category: "Technical",
    description: "Building autonomous systems and robots that push the boundaries of innovation.",
    members: 120,
    events: 18,
    logo: "ARC",
    coverGradient: "from-blue-600 to-cyan-500",
    featured: true,
  },
  {
    id: "cse-society",
    name: "Computer Science Society",
    shortName: "CSS",
    category: "Technical",
    description: "Fostering coding culture through hackathons, CP contests, and open-source contributions.",
    members: 340,
    events: 32,
    logo: "CSS",
    coverGradient: "from-indigo-600 to-blue-500",
    featured: true,
  },
  {
    id: "ieee",
    name: "IEEE Student Branch",
    shortName: "IEEE",
    category: "Technical",
    description: "Advancing technology for the benefit of humanity through workshops and research.",
    members: 180,
    events: 24,
    logo: "IEEE",
    coverGradient: "from-blue-700 to-blue-400",
    featured: true,
  },
  {
    id: "acm",
    name: "ACM Student Chapter",
    shortName: "ACM",
    category: "Technical",
    description: "Competitive programming, algorithms, and building the next generation of coders.",
    members: 150,
    events: 20,
    logo: "ACM",
    coverGradient: "from-sky-600 to-teal-400",
  },
  {
    id: "sae",
    name: "SAE India Collegiate Club",
    shortName: "SAE",
    category: "Technical",
    description: "Engineering high-performance vehicles and autonomous systems for national competitions.",
    members: 95,
    events: 12,
    logo: "SAE",
    coverGradient: "from-red-600 to-orange-500",
  },
  {
    id: "ecell",
    name: "Entrepreneurship Cell",
    shortName: "E-Cell",
    category: "Technical",
    description: "Nurturing startup culture and entrepreneurial mindset through mentorship and events.",
    members: 110,
    events: 15,
    logo: "E-C",
    coverGradient: "from-emerald-600 to-teal-400",
  },
  {
    id: "gdsc",
    name: "Google DSC NITK",
    shortName: "GDSC",
    category: "Technical",
    description: "Google-backed developer community focusing on web, mobile, and cloud technologies.",
    members: 200,
    events: 22,
    logo: "GDSC",
    coverGradient: "from-green-500 to-blue-500",
  },
  {
    id: "astronomy",
    name: "Astronomy Club",
    shortName: "Astro",
    category: "Technical",
    description: "Exploring the cosmos through stargazing sessions, astrophotography, and research.",
    members: 80,
    events: 10,
    logo: "AST",
    coverGradient: "from-purple-600 to-indigo-500",
  },
  {
    id: "nittrika",
    name: "Nittrika - Dance Club",
    shortName: "Nittrika",
    category: "Cultural",
    description: "Expressing emotions through diverse dance forms from classical to contemporary.",
    members: 75,
    events: 14,
    logo: "NTK",
    coverGradient: "from-pink-500 to-rose-400",
    featured: true,
  },
  {
    id: "drishti",
    name: "Drishti - Photography Club",
    shortName: "Drishti",
    category: "Cultural",
    description: "Capturing moments and stories through the art of photography and videography.",
    members: 90,
    events: 16,
    logo: "DRS",
    coverGradient: "from-amber-500 to-orange-400",
  },
  {
    id: "encore",
    name: "Encore - Music Club",
    shortName: "Encore",
    category: "Cultural",
    description: "Harmonizing diverse musical talents from Indian classical to western rock.",
    members: 65,
    events: 12,
    logo: "ENC",
    coverGradient: "from-violet-500 to-purple-400",
  },
  {
    id: "aaina",
    name: "Aaina - Dramatics Club",
    shortName: "Aaina",
    category: "Cultural",
    description: "Theater, street plays, and performance art that mirror society's truths.",
    members: 55,
    events: 10,
    logo: "ANA",
    coverGradient: "from-rose-500 to-red-400",
  },
  {
    id: "literary",
    name: "Literary Club",
    shortName: "LitClub",
    category: "Cultural",
    description: "Debates, poetry slams, creative writing, and literary discussions.",
    members: 70,
    events: 14,
    logo: "LIT",
    coverGradient: "from-teal-500 to-cyan-400",
  },
  {
    id: "cricket",
    name: "Cricket Club",
    shortName: "Cricket",
    category: "Sports",
    description: "From nets to nationals - competitive cricket at inter-college and university level.",
    members: 85,
    events: 8,
    logo: "CRC",
    coverGradient: "from-green-600 to-emerald-400",
  },
  {
    id: "football",
    name: "Football Club",
    shortName: "Football",
    category: "Sports",
    description: "Training sessions, intra-college leagues, and inter-college tournaments.",
    members: 70,
    events: 10,
    logo: "FBC",
    coverGradient: "from-lime-500 to-green-400",
  },
  {
    id: "badminton",
    name: "Badminton Club",
    shortName: "Badminton",
    category: "Sports",
    description: "Competitive and recreational badminton for all skill levels.",
    members: 60,
    events: 8,
    logo: "BMC",
    coverGradient: "from-yellow-500 to-orange-400",
  },
  {
    id: "athletics",
    name: "Athletics Club",
    shortName: "Athletics",
    category: "Sports",
    description: "Track and field events, marathon training, and fitness camps.",
    members: 50,
    events: 6,
    logo: "ATH",
    coverGradient: "from-red-500 to-pink-400",
  },
  {
    id: "nss",
    name: "National Service Scheme",
    shortName: "NSS",
    category: "Social",
    description: "Community service, blood drives, village adoption programs, and social awareness.",
    members: 200,
    events: 20,
    logo: "NSS",
    coverGradient: "from-blue-500 to-indigo-400",
  },
  {
    id: "rotaract",
    name: "Rotaract Club",
    shortName: "Rotaract",
    category: "Social",
    description: "Leadership development and community service for positive social change.",
    members: 130,
    events: 16,
    logo: "RTC",
    coverGradient: "from-cyan-500 to-blue-400",
  },
  {
    id: "enactus",
    name: "Enactus NITK",
    shortName: "Enactus",
    category: "Social",
    description: "Social entrepreneurship projects creating sustainable impact in communities.",
    members: 60,
    events: 8,
    logo: "ENT",
    coverGradient: "from-yellow-500 to-amber-400",
  },
]

// ─── EVENTS ──────────────────────────────────────────────────────
export type EventItem = {
  id: string
  title: string
  clubId: string
  clubName: string
  type: "Workshop" | "Hackathon" | "Competition" | "Seminar" | "Cultural" | "Sports" | "Social"
  date: string
  time: string
  venue: string
  description: string
  registrations: number
  maxCapacity: number
  nPoints: number
  isPaid: boolean
  price?: number
  tags: string[]
  status: "upcoming" | "live" | "completed" | "cancelled"
  matchScore?: number
}

export const events: EventItem[] = [
  {
    id: "e1",
    title: "HackNITK 2026 - 36hr Hackathon",
    clubId: "cse-society",
    clubName: "Computer Science Society",
    type: "Hackathon",
    date: "2026-03-15",
    time: "10:00 AM",
    venue: "LHC Auditorium",
    description: "36-hour hackathon with industry mentors, exciting prizes, and networking opportunities.",
    registrations: 180,
    maxCapacity: 200,
    nPoints: 50,
    isPaid: true,
    price: 200,
    tags: ["AI/ML", "Web Dev", "Blockchain"],
    status: "upcoming",
    matchScore: 95,
  },
  {
    id: "e2",
    title: "RoboWars Championship",
    clubId: "arc",
    clubName: "Automation and Robotics Club",
    type: "Competition",
    date: "2026-03-20",
    time: "2:00 PM",
    venue: "Central Workshop",
    description: "Build combat robots and compete in the arena. Weight categories: 8kg, 15kg, 30kg.",
    registrations: 45,
    maxCapacity: 60,
    nPoints: 40,
    isPaid: true,
    price: 500,
    tags: ["Robotics", "Hardware", "Competition"],
    status: "upcoming",
    matchScore: 88,
  },
  {
    id: "e3",
    title: "ML Workshop: Transformers Deep Dive",
    clubId: "gdsc",
    clubName: "Google DSC NITK",
    type: "Workshop",
    date: "2026-03-10",
    time: "4:00 PM",
    venue: "CS Seminar Hall",
    description: "Hands-on workshop on transformer architectures, attention mechanisms, and fine-tuning LLMs.",
    registrations: 120,
    maxCapacity: 150,
    nPoints: 30,
    isPaid: false,
    tags: ["ML", "AI", "NLP"],
    status: "upcoming",
    matchScore: 92,
  },
  {
    id: "e4",
    title: "Startup Pitch Night",
    clubId: "ecell",
    clubName: "Entrepreneurship Cell",
    type: "Seminar",
    date: "2026-03-12",
    time: "6:00 PM",
    venue: "MBA Auditorium",
    description: "Pitch your startup ideas to a panel of VCs and industry mentors. Top 3 get seed funding.",
    registrations: 65,
    maxCapacity: 100,
    nPoints: 25,
    isPaid: false,
    tags: ["Startup", "Business", "Pitching"],
    status: "upcoming",
    matchScore: 78,
  },
  {
    id: "e5",
    title: "Nittrika Annual Dance Show",
    clubId: "nittrika",
    clubName: "Nittrika - Dance Club",
    type: "Cultural",
    date: "2026-03-18",
    time: "7:00 PM",
    venue: "Open Air Theatre",
    description: "Annual dance extravaganza featuring performances in Bharatanatyam, Hip-Hop, Contemporary, and Bollywood.",
    registrations: 400,
    maxCapacity: 500,
    nPoints: 15,
    isPaid: false,
    tags: ["Dance", "Performance", "Cultural"],
    status: "upcoming",
    matchScore: 72,
  },
  {
    id: "e6",
    title: "IEEE Tech Talk: Quantum Computing",
    clubId: "ieee",
    clubName: "IEEE Student Branch",
    type: "Seminar",
    date: "2026-03-08",
    time: "3:00 PM",
    venue: "ECE Seminar Hall",
    description: "Guest lecture by Dr. Priya Sharma on Quantum Computing applications and future roadmap.",
    registrations: 90,
    maxCapacity: 120,
    nPoints: 20,
    isPaid: false,
    tags: ["Quantum", "Research", "Tech Talk"],
    status: "upcoming",
    matchScore: 85,
  },
  {
    id: "e7",
    title: "Inter-College Cricket Tournament",
    clubId: "cricket",
    clubName: "Cricket Club",
    type: "Sports",
    date: "2026-03-22",
    time: "9:00 AM",
    venue: "Sports Ground",
    description: "Annual inter-college cricket tournament with 16 teams competing over 3 days.",
    registrations: 160,
    maxCapacity: 200,
    nPoints: 35,
    isPaid: true,
    price: 100,
    tags: ["Cricket", "Tournament", "Sports"],
    status: "upcoming",
    matchScore: 60,
  },
  {
    id: "e8",
    title: "ACM-ICPC Practice Contest",
    clubId: "acm",
    clubName: "ACM Student Chapter",
    type: "Competition",
    date: "2026-03-05",
    time: "5:00 PM",
    venue: "CS Lab 1",
    description: "5-hour competitive programming contest to prepare for regionals. Top performers get mentorship.",
    registrations: 75,
    maxCapacity: 80,
    nPoints: 30,
    isPaid: false,
    tags: ["CP", "Algorithms", "DSA"],
    status: "upcoming",
    matchScore: 90,
  },
  {
    id: "e9",
    title: "Blood Donation Camp",
    clubId: "nss",
    clubName: "National Service Scheme",
    type: "Social",
    date: "2026-03-25",
    time: "10:00 AM",
    venue: "Health Centre",
    description: "Annual blood donation drive in collaboration with Red Cross. Every donor gets a certificate.",
    registrations: 140,
    maxCapacity: 200,
    nPoints: 20,
    isPaid: false,
    tags: ["Social", "Health", "Volunteering"],
    status: "upcoming",
    matchScore: 65,
  },
  {
    id: "e10",
    title: "Photography Walk: Sunset Edition",
    clubId: "drishti",
    clubName: "Drishti - Photography Club",
    type: "Cultural",
    date: "2026-03-16",
    time: "5:30 PM",
    venue: "Campus Lake",
    description: "Golden hour photography walk around campus. Learn composition, lighting, and post-processing.",
    registrations: 30,
    maxCapacity: 40,
    nPoints: 15,
    isPaid: false,
    tags: ["Photography", "Creative", "Outdoors"],
    status: "upcoming",
    matchScore: 70,
  },
  {
    id: "e11",
    title: "Open Mic Night",
    clubId: "encore",
    clubName: "Encore - Music Club",
    type: "Cultural",
    date: "2026-03-14",
    time: "8:00 PM",
    venue: "Student Activity Center",
    description: "Perform your favorite songs, poetry, or stand-up comedy. All genres welcome!",
    registrations: 55,
    maxCapacity: 80,
    nPoints: 10,
    isPaid: false,
    tags: ["Music", "Poetry", "Performance"],
    status: "upcoming",
    matchScore: 68,
  },
  {
    id: "e12",
    title: "Formula NITK Car Reveal",
    clubId: "sae",
    clubName: "SAE India Collegiate Club",
    type: "Seminar",
    date: "2026-03-28",
    time: "11:00 AM",
    venue: "Main Ground",
    description: "Unveiling the 2026 Formula car with live demo, technical walkthrough, and recruitment drive.",
    registrations: 210,
    maxCapacity: 300,
    nPoints: 15,
    isPaid: false,
    tags: ["Automotive", "Engineering", "Launch"],
    status: "upcoming",
    matchScore: 75,
  },
]

// ─── STUDENT PROFILE ─────────────────────────────────────────────
export const studentProfile = {
  name: "Aarav Sharma",
  email: "aarav.220cs001@nitkkr.ac.in",
  branch: "Computer Science & Engineering",
  year: "3rd Year",
  avatar: "AS",
  nPoints: 1247,
  rank: 42,
  eventsAttended: 24,
  upcomingEvents: 5,
  certificatesCount: 18,
  clubs: ["cse-society", "gdsc", "acm"],
}

// ─── CERTIFICATES ────────────────────────────────────────────────
export type Certificate = {
  id: string
  title: string
  event: string
  clubName: string
  type: "Winner" | "Runner-up" | "Participation" | "Completion" | "Merit"
  date: string
  verified: boolean
}

export const certificates: Certificate[] = [
  { id: "c1", title: "1st Place - HackNITK 2025", event: "HackNITK 2025", clubName: "Computer Science Society", type: "Winner", date: "2025-10-15", verified: true },
  { id: "c2", title: "ML Workshop Completion", event: "ML Bootcamp", clubName: "Google DSC NITK", type: "Completion", date: "2025-09-20", verified: true },
  { id: "c3", title: "2nd Place - Code Sprint", event: "Code Sprint 2025", clubName: "ACM Student Chapter", type: "Runner-up", date: "2025-11-10", verified: true },
  { id: "c4", title: "Participation - RoboWars", event: "RoboWars 2025", clubName: "Automation and Robotics Club", type: "Participation", date: "2025-08-25", verified: true },
  { id: "c5", title: "Best Speaker - Tech Debate", event: "Tech Debate 2025", clubName: "Literary Club", type: "Merit", date: "2025-07-18", verified: true },
  { id: "c6", title: "Completion - Web Dev Bootcamp", event: "Web Dev Bootcamp", clubName: "Google DSC NITK", type: "Completion", date: "2025-12-01", verified: true },
  { id: "c7", title: "Participation - Dance Show", event: "Nittrika Annual 2025", clubName: "Nittrika - Dance Club", type: "Participation", date: "2025-09-05", verified: true },
  { id: "c8", title: "Merit - IEEE Paper Presentation", event: "IEEE Conference", clubName: "IEEE Student Branch", type: "Merit", date: "2025-11-22", verified: true },
  { id: "c9", title: "Volunteer - Blood Donation", event: "Blood Donation Camp", clubName: "National Service Scheme", type: "Participation", date: "2025-06-15", verified: true },
  { id: "c10", title: "1st Place - Photography Contest", event: "Frames 2025", clubName: "Drishti - Photography Club", type: "Winner", date: "2025-10-30", verified: true },
]

// ─── WALLET / REWARDS ────────────────────────────────────────────
export type Reward = {
  id: string
  title: string
  description: string
  cost: number
  stock: number
  category: "Merch" | "Voucher" | "Experience" | "Academic"
}

export const rewards: Reward[] = [
  { id: "r1", title: "NITK Nexus T-Shirt", description: "Exclusive limited edition merch", cost: 300, stock: 50, category: "Merch" },
  { id: "r2", title: "Canteen Voucher - Rs. 100", description: "Redeemable at campus canteen", cost: 150, stock: 100, category: "Voucher" },
  { id: "r3", title: "Priority Event Registration", description: "Skip the queue for any event", cost: 200, stock: 20, category: "Experience" },
  { id: "r4", title: "Library Late Fee Waiver", description: "One-time late fee waiver", cost: 100, stock: 30, category: "Academic" },
  { id: "r5", title: "Workshop Certificate Frame", description: "Premium wooden certificate frame", cost: 250, stock: 15, category: "Merch" },
  { id: "r6", title: "1-on-1 Mentorship Session", description: "30 min with industry professional", cost: 500, stock: 10, category: "Experience" },
]

export type Transaction = {
  id: string
  type: "earned" | "spent"
  amount: number
  description: string
  date: string
}

export const transactions: Transaction[] = [
  { id: "t1", type: "earned", amount: 50, description: "Attended HackNITK 2025", date: "2025-10-15" },
  { id: "t2", type: "earned", amount: 30, description: "ML Workshop Completion", date: "2025-09-20" },
  { id: "t3", type: "spent", amount: -150, description: "Redeemed Canteen Voucher", date: "2025-09-25" },
  { id: "t4", type: "earned", amount: 40, description: "RoboWars Participation", date: "2025-08-25" },
  { id: "t5", type: "earned", amount: 25, description: "IEEE Tech Talk Attendance", date: "2025-11-22" },
  { id: "t6", type: "spent", amount: -300, description: "Redeemed NITK Nexus T-Shirt", date: "2025-12-01" },
  { id: "t7", type: "earned", amount: 20, description: "Blood Donation Camp", date: "2025-06-15" },
  { id: "t8", type: "earned", amount: 35, description: "Code Sprint 2nd Place", date: "2025-11-10" },
]

export const leaderboard = [
  { rank: 1, name: "Priya Patel", branch: "CSE", points: 2340, avatar: "PP" },
  { rank: 2, name: "Rohan Kumar", branch: "ECE", points: 2180, avatar: "RK" },
  { rank: 3, name: "Sneha Reddy", branch: "IT", points: 1950, avatar: "SR" },
  { rank: 4, name: "Arjun Singh", branch: "ME", points: 1820, avatar: "AS" },
  { rank: 5, name: "Ananya Gupta", branch: "CSE", points: 1760, avatar: "AG" },
  { rank: 6, name: "Vikram Joshi", branch: "EE", points: 1680, avatar: "VJ" },
  { rank: 7, name: "Meera Nair", branch: "CE", points: 1590, avatar: "MN" },
  { rank: 8, name: "Kavya Iyer", branch: "CSE", points: 1520, avatar: "KI" },
  { rank: 9, name: "Aditya Rao", branch: "ECE", points: 1480, avatar: "AR" },
  { rank: 10, name: "Neha Verma", branch: "IT", points: 1350, avatar: "NV" },
]

// ─── REGISTRATIONS ───────────────────────────────────────────────
export type Registration = {
  id: string
  eventId: string
  eventTitle: string
  clubName: string
  date: string
  venue: string
  status: "upcoming" | "attended" | "missed" | "cancelled"
  hasCertificate: boolean
}

export const registrations: Registration[] = [
  { id: "reg1", eventId: "e1", eventTitle: "HackNITK 2026 - 36hr Hackathon", clubName: "Computer Science Society", date: "2026-03-15", venue: "LHC Auditorium", status: "upcoming", hasCertificate: false },
  { id: "reg2", eventId: "e3", eventTitle: "ML Workshop: Transformers Deep Dive", clubName: "Google DSC NITK", date: "2026-03-10", venue: "CS Seminar Hall", status: "upcoming", hasCertificate: false },
  { id: "reg3", eventId: "e6", eventTitle: "IEEE Tech Talk: Quantum Computing", clubName: "IEEE Student Branch", date: "2026-03-08", venue: "ECE Seminar Hall", status: "upcoming", hasCertificate: false },
  { id: "reg4", eventId: "e8", eventTitle: "ACM-ICPC Practice Contest", clubName: "ACM Student Chapter", date: "2026-03-05", venue: "CS Lab 1", status: "upcoming", hasCertificate: false },
  { id: "reg5", eventId: "e5", eventTitle: "Nittrika Annual Dance Show", clubName: "Nittrika - Dance Club", date: "2026-03-18", venue: "Open Air Theatre", status: "upcoming", hasCertificate: false },
  // Past registrations
  { id: "reg6", eventId: "past1", eventTitle: "HackNITK 2025", clubName: "Computer Science Society", date: "2025-10-15", venue: "LHC Auditorium", status: "attended", hasCertificate: true },
  { id: "reg7", eventId: "past2", eventTitle: "ML Bootcamp", clubName: "Google DSC NITK", date: "2025-09-20", venue: "CS Seminar Hall", status: "attended", hasCertificate: true },
  { id: "reg8", eventId: "past3", eventTitle: "Code Sprint 2025", clubName: "ACM Student Chapter", date: "2025-11-10", venue: "CS Lab 1", status: "attended", hasCertificate: true },
  { id: "reg9", eventId: "past4", eventTitle: "RoboWars 2025", clubName: "Automation and Robotics Club", date: "2025-08-25", venue: "Central Workshop", status: "attended", hasCertificate: true },
  { id: "reg10", eventId: "past5", eventTitle: "Startup Pitch Night 2025", clubName: "Entrepreneurship Cell", date: "2025-07-05", venue: "MBA Auditorium", status: "missed", hasCertificate: false },
  // Cancelled
  { id: "reg11", eventId: "canc1", eventTitle: "Debate Championship", clubName: "Literary Club", date: "2025-06-20", venue: "Seminar Hall", status: "cancelled", hasCertificate: false },
  { id: "reg12", eventId: "canc2", eventTitle: "Badminton Open", clubName: "Badminton Club", date: "2025-05-10", venue: "Indoor Court", status: "cancelled", hasCertificate: false },
]

// ─── CLUB PORTAL DATA ────────────────────────────────────────────
export const clubPortalData = {
  club: {
    name: "Computer Science Society",
    shortName: "CSS",
    description: "Fostering coding culture through hackathons, CP contests, and open-source contributions.",
    totalMembers: 280,
    activeMembers: 156,
    coreTeam: 8,
    pendingRequests: 12,
    totalEvents: 32,
    upcomingEvents: 5,
    nPointsDistributed: 4500,
    revenue: 45000,
  },
  members: [
    { id: "m1", name: "Aarav Sharma", branch: "CSE", year: "3rd", role: "President", attendance: 95, avatar: "AS" },
    { id: "m2", name: "Priya Patel", branch: "CSE", year: "3rd", role: "Vice President", attendance: 92, avatar: "PP" },
    { id: "m3", name: "Rohan Kumar", branch: "ECE", year: "2nd", role: "Tech Lead", attendance: 88, avatar: "RK" },
    { id: "m4", name: "Sneha Reddy", branch: "IT", year: "3rd", role: "Events Head", attendance: 90, avatar: "SR" },
    { id: "m5", name: "Arjun Singh", branch: "ME", year: "2nd", role: "Design Lead", attendance: 85, avatar: "AS" },
    { id: "m6", name: "Ananya Gupta", branch: "CSE", year: "4th", role: "Core Member", attendance: 80, avatar: "AG" },
    { id: "m7", name: "Vikram Joshi", branch: "EE", year: "2nd", role: "Core Member", attendance: 78, avatar: "VJ" },
    { id: "m8", name: "Meera Nair", branch: "CE", year: "3rd", role: "Core Member", attendance: 82, avatar: "MN" },
    { id: "m9", name: "Kavya Iyer", branch: "CSE", year: "1st", role: "Member", attendance: 70, avatar: "KI" },
    { id: "m10", name: "Aditya Rao", branch: "ECE", year: "1st", role: "Member", attendance: 65, avatar: "AR" },
  ],
  portalEvents: [
    { id: "pe1", title: "HackNITK 2026", type: "Hackathon", date: "2026-03-15", registrations: 180, maxCapacity: 200, status: "approved" as const },
    { id: "pe2", title: "Web Dev Bootcamp", type: "Workshop", date: "2026-03-22", registrations: 0, maxCapacity: 100, status: "draft" as const },
    { id: "pe3", title: "Code Sprint March", type: "Competition", date: "2026-03-28", registrations: 45, maxCapacity: 80, status: "approved" as const },
    { id: "pe4", title: "Open Source Hackday", type: "Hackathon", date: "2026-04-05", registrations: 0, maxCapacity: 150, status: "pending" as const },
    { id: "pe5", title: "DSA Masterclass", type: "Workshop", date: "2026-04-10", registrations: 0, maxCapacity: 60, status: "draft" as const },
    { id: "pe6", title: "ML Paper Reading Group", type: "Seminar", date: "2026-02-20", registrations: 30, maxCapacity: 40, status: "completed" as const },
    { id: "pe7", title: "CP Contest #12", type: "Competition", date: "2026-02-15", registrations: 60, maxCapacity: 80, status: "completed" as const },
    { id: "pe8", title: "Intro to Rust", type: "Workshop", date: "2026-03-01", registrations: 55, maxCapacity: 60, status: "live" as const },
  ],
  analyticsData: {
    attendanceTrend: [
      { month: "Sep", attendance: 120 },
      { month: "Oct", attendance: 185 },
      { month: "Nov", attendance: 160 },
      { month: "Dec", attendance: 140 },
      { month: "Jan", attendance: 170 },
      { month: "Feb", attendance: 195 },
    ],
    memberGrowth: [
      { month: "Sep", members: 210 },
      { month: "Oct", members: 230 },
      { month: "Nov", members: 245 },
      { month: "Dec", members: 255 },
      { month: "Jan", members: 268 },
      { month: "Feb", members: 280 },
    ],
    eventPopularity: [
      { name: "Hackathon", registrations: 180 },
      { name: "Workshop", registrations: 120 },
      { name: "Competition", registrations: 95 },
      { name: "Seminar", registrations: 75 },
      { name: "Social", registrations: 60 },
    ],
    engagementData: [
      { name: "Active", value: 156 },
      { name: "Occasional", value: 84 },
      { name: "Inactive", value: 40 },
    ],
  },
}

// ─── INTERESTS ───────────────────────────────────────────────────
export const interestOptions = [
  "ML/AI", "Web Development", "App Development", "Competitive Programming",
  "Robotics", "IoT", "Blockchain", "Cybersecurity",
  "Photography", "Dance", "Music", "Dramatics",
  "Cricket", "Football", "Badminton", "Athletics",
  "Entrepreneurship", "Social Service", "Public Speaking", "Creative Writing",
]

export const branches = [
  "CSE", "ECE", "EE", "ME", "CE", "IT", "PIE", "CHE", "BT", "MME",
]

export const hostels = [
  "Abhimanyu Bhawan (H-1)",
  "Bhishma Bhawan (H-2)",
  "Chakradhar Bhawan (H-3)",
  "Dronacharya Bhawan (H-4)",
  "Eklavya Bhawan (H-5)",
  "Fanibhushan Bhawan (H-6)",
  "Girivar Bhawan (H-7)",
  "Harihar Bhawan (H-8)",
  "Indivar Bhawan (H-9)",
  "Visvesvaraya Bhawan (H-10)",
  "Vivekananda Bhawan (H-11)",
  "Bhagirathi Bhawan",
  "Cauvery Bhawan",
  "Kalpana Chawla Hostel",
]
