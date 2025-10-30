import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "سارة جونسون",
      role: "مريضة",
      content:
        "ساعدني Mindconnect في العثور على المعالج المثالي. مطابق الأعراض كان دقيقاً بشكل لا يصدق، وحجز المواعيد سهل جداً.",
      rating: 5,
    },
    {
      name: "د. مايكل تشين",
      role: "طبيب نفسي",
      content:
        "كطبيب، هذه المنصة تجعل إدارة ممارستي سلسة. عملية الموافقة الإدارية تضمن الجودة، ومرضاي يحبون الراحة.",
      rating: 5,
    },
    {
      name: "إيميلي رودريغيز",
      role: "مرافقة مريض",
      content:
        "القدرة على دعم أختي خلال رحلتها نحو الصحة النفسية كانت لا تقدر بثمن. ميزات المرافق تحرص على إبقائي على علم ومشاركة.",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="relative bg-gradient-to-b from-purple-50/30 via-pink-50/20 to-white py-24 md:py-36">
      {/* Smooth transition gradient */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-purple-50/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-4xl text-center mb-20">
          <h2 className="mb-6 text-balance text-4xl font-bold text-slate-900 md:text-5xl">ماذا يقول مجتمعنا</h2>
          <p className="text-pretty text-xl text-slate-600 leading-relaxed">
            قصص حقيقية من المرضى والأطباء والمرافقين الذين وجدوا الدعم من خلال Mindconnect.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden rounded-xl border border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm card-hover">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mb-4 text-sm leading-relaxed text-gray-700 italic">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
