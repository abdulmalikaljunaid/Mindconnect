import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Shield, Users, ArrowLeft } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            <Heart className="h-4 w-4" />
            دعم الصحة النفسية المهني
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
            رحلتك نحو صحة نفسية أفضل تبدأ من هنا
          </h1>

          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
            تواصل مع متخصصين مؤهلين في الصحة النفسية، تابع تقدمك، واحصل على الدعم الذي تحتاجه. سواء كنت تبحث عن المساعدة
            أو تقدم الرعاية، نحن هنا من أجلك.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/signup?role=patient">
                ابحث عن طبيب
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto bg-transparent">
              <Link href="/signup?role=doctor">أنا طبيب</Link>
            </Button>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">متخصصون معتمدون</h3>
              <p className="text-sm text-muted-foreground">جميع الأطباء معتمدون وموافق عليهم من قبل فريق الإدارة</p>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">رعاية شخصية</h3>
              <p className="text-sm text-muted-foreground">تطابق مع الأطباء بناءً على أعراضك واحتياجاتك</p>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">شبكة دعم</h3>
              <p className="text-sm text-muted-foreground">قم بتضمين المرافقين في رحلة رعايتك للحصول على دعم أفضل</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
