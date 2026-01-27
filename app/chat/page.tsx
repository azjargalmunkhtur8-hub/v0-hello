"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { ChatProvider } from "@/lib/chat-context"
import { CategorySidebar } from "@/components/category-sidebar"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"
import { Loader2 } from "lucide-react"

function ChatContent() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Уншиж байна...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ChatProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <CategorySidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatMessages />
          <ChatInput />
        </main>
      </div>
    </ChatProvider>
  )
}

export default function ChatPage() {
  return (
    <AuthProvider>
      <ChatContent />
    </AuthProvider>
  )
}
