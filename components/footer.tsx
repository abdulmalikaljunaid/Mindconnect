import Link from "next/link"
import { Heart, Brain } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Mindconnect</span>
            </Link>
            <p className="text-slate-300 leading-relaxed mb-6">دعم مهني للصحة النفسية للجميع.</p>
            <div className="flex items-center gap-2 text-slate-400">
              <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
              <span className="text-sm">صُنع لصحة نفسية أفضل</span>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">للمرضى</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/find-doctors" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  البحث عن الأطباء
                </Link>
              </li>
              <li>
                <Link href="/assessment" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  تقييم الأعراض
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  المواعيد
                </Link>
              </li>
              <li>
                <Link href="/medical-history" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  السجل الطبي
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">للأطباء</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/signup/doctor" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  انضم كطبيب
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  لوحة التحكم
                </Link>
              </li>
              <li>
                <Link href="/availability" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  الأوقات المتاحة
                </Link>
              </li>
              <li>
                <Link href="/patients" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  المرضى
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">روابط سريعة</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  إنشاء حساب
                </Link>
              </li>
              <li>
                <Link href="/doctor-approvals" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  موافقات الأطباء
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-slate-300 hover:text-indigo-300 transition-colors duration-200">
                  الإعدادات
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col items-center justify-between gap-4 text-slate-400 md:flex-row">
          <p className="text-sm">© 2025 Mindconnect. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4 text-sm">
            <span>صُنع بـ</span>
            <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
            <span>لصحة نفسية أفضل</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
