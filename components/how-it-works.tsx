"use client"

import { UserPlus, Search, Calendar, MessageCircle } from "lucide-react"
import { useEffect, useRef } from "react"

export function HowItWorks() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    // Progress line animation with dots
    const progressLine = document.getElementById('progress-line')
    if (progressLine) {
      const howItWorksSection = document.getElementById('how-it-works')
      
      const updateProgress = () => {
        if (!howItWorksSection) return
        
        const sectionTop = howItWorksSection.offsetTop
        const sectionHeight = howItWorksSection.offsetHeight
        const scrollTop = window.pageYOffset
        const windowHeight = window.innerHeight
        
        // Calculate progress within the how-it-works section
        const sectionStart = sectionTop - windowHeight / 2
        const sectionEnd = sectionTop + sectionHeight - windowHeight / 2
        const progress = Math.max(0, Math.min(1, (scrollTop - sectionStart) / (sectionEnd - sectionStart)))
        
        const progressHeight = progress * 100
        
        // Update progress line with green color
        progressLine.style.background = `linear-gradient(to bottom, #10b981 0%, #10b981 ${progressHeight}%, #e2e8f0 ${progressHeight}%, #e2e8f0 100%)`
        
        // Update dots based on their actual position on screen
        steps.forEach((_, index) => {
          const dot = document.getElementById(`dot-${index}`)
          if (dot) {
            const dotRect = dot.getBoundingClientRect()
            const windowHeight = window.innerHeight
            const dotCenter = dotRect.top + dotRect.height / 2
            const viewportCenter = windowHeight / 2
            
            // Activate dot when it's in the center of viewport
            if (dotCenter <= viewportCenter) {
              dot.style.backgroundColor = '#10b981'
              dot.style.transform = 'scale(1.2)'
              dot.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.2)'
            } else {
              dot.style.backgroundColor = '#e2e8f0'
              dot.style.transform = 'scale(1)'
              dot.style.boxShadow = 'none'
            }
          }
        })
      }

      window.addEventListener('scroll', updateProgress)
      updateProgress() // Initial call

      return () => {
        window.removeEventListener('scroll', updateProgress)
        stepRefs.current.forEach((ref) => {
          if (ref) observer.unobserve(ref)
        })
      }
    }

    return () => {
      stepRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])
  const steps = [
    {
      icon: UserPlus,
      title: "أنشئ حسابك",
      description: "سجل كـ مريض، طبيب، أو مرافق. أكمل ملفك الشخصي بالمعلومات ذات الصلة.",
    },
    {
      icon: Search,
      title: "اعثر على المطابق المناسب",
      description: "استخدم مطابق الأعراض للعثور على أطباء متخصصين في احتياجاتك. تصفح الملفات الشخصية والمراجعات.",
    },
    {
      icon: Calendar,
      title: "احجز موعداً",
      description: "جدول المواعيد في الوقت المناسب لك. اختر بين الجلسات الحضورية أو الافتراضية.",
    },
    {
      icon: MessageCircle,
      title: "ابدأ رحلتك",
      description: "تواصل مع طبيبك، تابع تقدمك، واعمل نحو صحة نفسية أفضل.",
    },
  ]

  return (
    <section id="how-it-works" className="relative py-24 md:py-36 bg-slate-50">
      {/* Smooth transition gradient */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-slate-50"></div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-slate-50"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-4xl text-center mb-20">
          <h2 className="mb-6 text-balance text-4xl font-bold text-slate-900 md:text-5xl">كيف يعمل</h2>
          <p className="text-pretty text-xl text-slate-600 leading-relaxed">
            البدء مع عناية العقل بسيط. اتبع هذه الخطوات لتبدأ رحلتك نحو الصحة النفسية.
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="relative">
            {/* Vertical Line in Center */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 hidden md:block transform -translate-x-1/2" id="progress-line"></div>
            
            {/* Progress dots for each step - positioned at start of each step */}
            {steps.map((_, index) => (
              <div
                key={`dot-${index}`}
                className="absolute left-1/2 top-0 hidden md:block transform -translate-x-1/2 -translate-y-2"
                style={{ 
                  top: `${8 + (index * 28)}%` // Better spacing: 8%, 36%, 64%, 92%
                }}
                id={`step-dot-${index}`}
              >
                <div className="h-3 w-3 rounded-full bg-slate-200 transition-all duration-500" id={`dot-${index}`}></div>
              </div>
            ))}
            
            <div className="space-y-24">
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div 
                    key={index} 
                    ref={(el) => { stepRefs.current[index] = el }}
                    className={`relative flex items-center gap-12 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} opacity-0 translate-y-8 transition-all duration-700 ease-out`}
                  >
                    {/* Step Content */}
                    <div className={`flex-1 text-right ${isEven ? 'md:pr-12' : 'md:ml-0'}`}>
                      <div className="max-w-md mx-auto md:mx-0">
                        {/* Step Icon - Above step number */}
                        <div className="mb-4 flex justify-center md:justify-start">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
                            <step.icon className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mb-2 text-sm font-medium text-slate-500">خطوة {index + 1}</div>
                        <h3 className="mb-4 text-3xl font-bold text-slate-900">{step.title}</h3>
                        <p className="text-lg text-slate-600 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                    
                    {/* Empty space for opposite side */}
                    <div className="flex-1 hidden md:block"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
