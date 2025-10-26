import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"

export function BlogSection() {
  const posts = [
    {
      title: "فهم القلق: العلامات واستراتيجيات المواجهة",
      excerpt:
        "تعلم التعرف على أعراض القلق واكتشف تقنيات فعالة لإدارة التوتر في حياتك اليومية.",
      author: "د. سارة ويليامز",
      readTime: "5 دقائق قراءة",
      category: "الصحة النفسية",
    },
    {
      title: "أهمية النوم للصحة النفسية",
      excerpt: "اكتشف كيف يؤثر النوم الجيد على صحتك النفسية ونصائح عملية لنظافة نوم أفضل.",
      author: "د. جيمس مارتينيز",
      readTime: "4 دقائق قراءة",
      category: "العافية",
    },
    {
      title: "بناء المرونة: دليل للأوقات الصعبة",
      excerpt: "استكشف استراتيجيات بناء المرونة العاطفية والتنقل في تحديات الحياة بسهولة أكبر.",
      author: "د. إيميلي طومسون",
      readTime: "6 دقائق قراءة",
      category: "الرعاية الذاتية",
    },
  ]

  return (
    <section id="blog" className="relative py-24 md:py-36 bg-white">
      {/* Smooth transition gradient */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-50 to-white"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="mb-16 flex items-end justify-between">
          <div className="max-w-3xl">
            <h2 className="mb-6 text-balance text-4xl font-bold text-slate-900 md:text-5xl">موارد الصحة النفسية</h2>
            <p className="text-pretty text-xl text-slate-600 leading-relaxed">
              رؤى الخبراء ونصائح عملية لرحلتك نحو العافية النفسية.
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 px-6 py-3 text-lg font-medium">
            <Link href="/blog">
              عرض جميع المقالات
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Card key={index} className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
              <CardHeader className="p-5 pb-3">
                <div className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {post.category}
                </div>
                <h3 className="text-balance text-lg font-semibold leading-tight text-card-foreground">
                  {post.title}
                </h3>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{post.author}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Button variant="outline" asChild className="border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 px-6 py-3 text-lg font-medium">
            <Link href="/blog">
              عرض جميع المقالات
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
