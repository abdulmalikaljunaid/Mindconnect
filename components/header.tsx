import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">ع</span>
          </div>
          <span className="text-xl font-semibold">عناية العقل</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            كيف يعمل
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            آراء العملاء
          </Link>
          <Link
            href="#blog"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            المدونة
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">ابدأ الآن</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
