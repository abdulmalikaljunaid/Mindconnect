import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Shield, Users, ArrowLeft, Brain, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-24 md:py-36">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-indigo-50 border border-indigo-200 px-6 py-3 text-sm font-medium text-indigo-700 shadow-sm">
            <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
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
            <Button size="lg" asChild className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 animate-glow">
              <Link href="/assessment">
                <Brain className="mr-3 h-5 w-5" />
                اكتشف الطبيب المناسب لك
                <Sparkles className="ml-3 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 px-8 py-4 text-lg font-medium">
              <Link href="/signup?role=doctor">أنا طبيب</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-white/80 backdrop-blur-sm p-6 text-center shadow-sm card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">متخصصون معتمدون</h3>
              <p className="text-sm text-gray-600 leading-relaxed">جميع الأطباء معتمدون وموافق عليهم من قبل فريق الإدارة</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-pink-100 bg-white/80 backdrop-blur-sm p-6 text-center shadow-sm card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 mx-auto">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">رعاية شخصية</h3>
              <p className="text-sm text-gray-600 leading-relaxed">تطابق مع الأطباء بناءً على أعراضك واحتياجاتك</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white/80 backdrop-blur-sm p-6 text-center shadow-sm card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mx-auto">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">شبكة دعم</h3>
              <p className="text-sm text-gray-600 leading-relaxed">قم بتضمين المرافقين في رحلة رعايتك للحصول على دعم أفضل</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
