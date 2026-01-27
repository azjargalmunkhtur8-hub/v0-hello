"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GraduationCap, MessageSquare, Clock, Globe, Shield } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = sessionStorage.getItem("num_user")
    if (storedUser) {
      router.push("/chat")
    }
  }, [router])

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">NUM Assistant</h1>
              <p className="text-xs text-muted-foreground">Монгол Улсын Их Сургууль</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push("/login")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Нэвтрэх
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary">AI-д суурилсан туслах</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              NUM Assistant
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Монгол Улсын Их Сургуулийн оюутнуудад зориулсан хиймэл оюун ухаант туслах. 
              Хичээл, тэтгэлэг, дотуур байр, бичиг баримт зэрэг бүхий л асуултанд хариулна.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg"
              onClick={() => router.push("/login")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Эхлэх
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border/50 text-left">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">24/7 Бэлэн</h3>
              <p className="text-sm text-muted-foreground">
                Хүссэн үедээ асуулт асууж, шууд хариулт авах боломжтой
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 text-left">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Offline Дэмжлэг</h3>
              <p className="text-sm text-muted-foreground">
                Интернэтгүй орчинд ч ажиллах боломжтой локал сервер
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 text-left">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Аюулгүй</h3>
              <p className="text-sm text-muted-foreground">
                Сургуулийн нэвтрэх системээр баталгаажсан хандалт
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>Монгол Улсын Их Сургууль - NUM Assistant</p>
        </div>
      </footer>
    </main>
  )
}
