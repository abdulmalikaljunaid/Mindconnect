import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">M</span>
              </div>
              <span className="text-xl font-semibold">MindCare</span>
            </Link>
            <p className="text-sm text-muted-foreground">Professional mental health support for everyone.</p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">For Patients</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/find-doctors" className="text-muted-foreground hover:text-foreground">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/symptoms-matcher" className="text-muted-foreground hover:text-foreground">
                  Symptoms Matcher
                </Link>
              </li>
              <li>
                <Link href="/book-appointment" className="text-muted-foreground hover:text-foreground">
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">For Doctors</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/doctor-signup" className="text-muted-foreground hover:text-foreground">
                  Join as Doctor
                </Link>
              </li>
              <li>
                <Link href="/doctor-dashboard" className="text-muted-foreground hover:text-foreground">
                  Doctor Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 MindCare. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 fill-accent text-accent" />
            <span>for better mental health</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
