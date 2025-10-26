import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Mail } from "lucide-react"

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription>Your doctor account is being reviewed by our admin team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Thank you for registering as a mental health professional. Our team is reviewing your application to ensure
            the highest quality of care for our patients.
          </p>

          <div className="rounded-lg bg-muted p-4 text-left">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              What happens next?
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Our team will review your credentials</li>
              <li>• You'll receive an email within 24-48 hours</li>
              <li>• Once approved, you can access your dashboard</li>
            </ul>
          </div>

          <Button asChild className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
