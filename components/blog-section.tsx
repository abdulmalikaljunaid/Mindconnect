import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"

export function BlogSection() {
  const posts = [
    {
      title: "Understanding Anxiety: Signs and Coping Strategies",
      excerpt:
        "Learn to recognize anxiety symptoms and discover effective techniques to manage stress in your daily life.",
      author: "Dr. Sarah Williams",
      readTime: "5 min read",
      category: "Mental Health",
    },
    {
      title: "The Importance of Sleep for Mental Wellness",
      excerpt: "Discover how quality sleep impacts your mental health and practical tips for better sleep hygiene.",
      author: "Dr. James Martinez",
      readTime: "4 min read",
      category: "Wellness",
    },
    {
      title: "Building Resilience: A Guide for Difficult Times",
      excerpt: "Explore strategies to build emotional resilience and navigate life's challenges with greater ease.",
      author: "Dr. Emily Thompson",
      readTime: "6 min read",
      category: "Self-Care",
    },
  ]

  return (
    <section id="blog" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">Mental Health Resources</h2>
            <p className="text-pretty text-lg text-muted-foreground">
              Expert insights and practical advice for your mental wellness journey.
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Card key={index} className="group cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {post.category}
                </div>
                <h3 className="text-balance text-xl font-semibold leading-tight group-hover:text-primary">
                  {post.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="ghost" asChild>
            <Link href="/blog">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
