import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Shield, Users, ArrowLeft, Brain, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 md:py-36">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-blue-50 border border-blue-100 px-6 py-3 text-sm font-medium text-blue-700 shadow-sm">
            <Heart className="h-4 w-4" />
            دعم الصحة النفسية المهني
          </div>

          <h1 className="mb-8 text-balance text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">
            رحلتك نحو صحة نفسية أفضل تبدأ من هنا
          </h1>

          <p className="mb-12 text-pretty text-xl text-slate-600 md:text-2xl max-w-4xl mx-auto leading-relaxed">
            تواصل مع متخصصين مؤهلين في الصحة النفسية، تابع تقدمك، واحصل على الدعم الذي تحتاجه. سواء كنت تبحث عن المساعدة
            أو تقدم الرعاية، نحن هنا من أجلك.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row mb-20">
            <Button size="lg" asChild className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
              <Link href="/assessment">
                <Brain className="mr-3 h-5 w-5" />
                اكتشف الطبيب المناسب لك
                <Sparkles className="ml-3 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 px-8 py-4 text-lg font-medium">
              <Link href="/signup?role=doctor">أنا طبيب</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">متخصصون معتمدون</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">جميع الأطباء معتمدون وموافق عليهم من قبل فريق الإدارة</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">رعاية شخصية</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">تطابق مع الأطباء بناءً على أعراضك واحتياجاتك</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">شبكة دعم</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">قم بتضمين المرافقين في رحلة رعايتك للحصول على دعم أفضل</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
