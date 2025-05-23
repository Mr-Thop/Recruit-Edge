import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="container flex flex-col md:flex-row items-center justify-between py-8 gap-4">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-sm text-foreground/70">
            &copy; {new Date().getFullYear()} Recruit-Edge. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6">
          <Link href="/terms" className="text-sm text-foreground/70 hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm text-foreground/70 hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/contact" className="text-sm text-foreground/70 hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
