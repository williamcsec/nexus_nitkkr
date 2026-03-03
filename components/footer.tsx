import { Zap } from "lucide-react"

const footerLinks = {
  Platform: ["Features", "Events", "Clubs", "About", "Certificates", "N-Points"],
  Resources: ["Help Center", "API Docs", "Blog", "Community"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
}

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-mono text-lg font-bold text-foreground">
                NITK Nexus
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Unifying campus life for students and clubs at NIT Kurukshetra.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => {
            const getLinkHref = (category: string, link: string): string => {
              if (category === "Platform") {
                const platformMap: Record<string, string> = {
                  "Features": "#features",
                  "Events": "/events",
                  "Clubs": "/clubs",
                  "About": "/about",
                  "Certificates": "/dashboard",
                  "N-Points": "/dashboard",
                }
                return platformMap[link] || "#"
              }
              return "#"
            }
            return (
              <div key={category}>
                <h3 className="mb-4 font-mono text-sm font-semibold text-foreground">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href={getLinkHref(category, link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            Made with care at NIT Kurukshetra
          </p>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NITK Nexus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
