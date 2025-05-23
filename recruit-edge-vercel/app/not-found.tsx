import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-full bg-primary/10">
            <FileQuestion className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-foreground/70 text-lg mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <Button size="lg" className="text-base">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
