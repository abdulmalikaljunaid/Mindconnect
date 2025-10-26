import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <span className="text-xl font-bold text-slate-900">ع</span>
              </div>
              <span className="text-2xl font-bold">عناية العقل</span>
            </Link>
            <p className="text-slate-300 leading-relaxed mb-6">دعم مهني للصحة النفسية للجميع.</p>
            <div className="flex items-center gap-2 text-slate-400">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span className="text-sm">صُنع لصحة نفسية أفضل</span>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">للمرضى</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/find-doctors" className="text-slate-300 hover:text-white transition-colors duration-200">
                  البحث عن الأطباء
                </Link>
              </li>
              <li>
                <Link href="/symptoms-matcher" className="text-slate-300 hover:text-white transition-colors duration-200">
                  مطابق الأعراض
                </Link>
              </li>
              <li>
                <Link href="/book-appointment" className="text-slate-300 hover:text-white transition-colors duration-200">
                  حجز موعد
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">للأطباء</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/doctor-signup" className="text-slate-300 hover:text-white transition-colors duration-200">
                  انضم كطبيب
                </Link>
              </li>
              <li>
                <Link href="/doctor-dashboard" className="text-slate-300 hover:text-white transition-colors duration-200">
                  لوحة تحكم الطبيب
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">الموارد</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className="text-slate-300 hover:text-white transition-colors duration-200">
                  المدونة
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white transition-colors duration-200">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white transition-colors duration-200">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col items-center justify-between gap-4 text-slate-400 md:flex-row">
          <p className="text-sm">© 2025 عناية العقل. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4 text-sm">
            <span>صُنع بـ</span>
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span>لصحة نفسية أفضل</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
