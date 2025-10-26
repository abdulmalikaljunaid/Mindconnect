import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      content:
        "MindCare helped me find the perfect therapist. The symptoms matcher was incredibly accurate, and booking appointments is so easy.",
      rating: 5,
    },
    {
      name: "Dr. Michael Chen",
      role: "Psychiatrist",
      content:
        "As a doctor, this platform makes managing my practice seamless. The admin approval process ensures quality, and my patients love the convenience.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Patient Companion",
      content:
        "Being able to support my sister through her mental health journey has been invaluable. The companion features keep me informed and involved.",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="bg-muted py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">What Our Community Says</h2>
          <p className="mb-16 text-pretty text-lg text-muted-foreground">
            Real stories from patients, doctors, and companions who have found support through MindCare.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-card-foreground">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
