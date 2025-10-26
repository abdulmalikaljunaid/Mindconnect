import { UserPlus, Search, Calendar, MessageCircle } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Account",
      description: "Sign up as a patient, doctor, or companion. Complete your profile with relevant information.",
    },
    {
      icon: Search,
      title: "Find the Right Match",
      description: "Use our symptoms matcher to find doctors specialized in your needs. Browse profiles and reviews.",
    },
    {
      icon: Calendar,
      title: "Book an Appointment",
      description: "Schedule appointments at your convenience. Choose between in-person or virtual sessions.",
    },
    {
      icon: MessageCircle,
      title: "Start Your Journey",
      description: "Connect with your doctor, track your progress, and work towards better mental health.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">How It Works</h2>
          <p className="mb-16 text-pretty text-lg text-muted-foreground">
            Getting started with MindCare is simple. Follow these steps to begin your mental health journey.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <step.icon className="h-8 w-8" />
              </div>
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                {index + 1}
              </div>
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
