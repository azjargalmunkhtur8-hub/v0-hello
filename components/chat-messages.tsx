"use client"

import { useRef, useEffect } from "react"
import { useChat, type Message } from "@/lib/chat-context"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Bot, User, ImageIcon, FileText } from "lucide-react"

function MessageBubble({ message }: { message: Message }) {
  const { user } = useAuth()
  const isUser = message.role === "user"

  return (
    <div className={cn(
      "flex gap-3 max-w-3xl",
      isUser ? "ml-auto flex-row-reverse" : ""
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-primary" : "bg-secondary"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-foreground" />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        "flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}>
        <span className="text-xs text-muted-foreground">
          {isUser ? (user?.name || "You") : "NUM Assistant"}
        </span>
        
        <div className={cn(
          "px-4 py-3 rounded-2xl max-w-lg",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-secondary text-foreground rounded-tl-sm"
        )}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map((attachment, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-lg text-sm",
                    isUser ? "bg-white/20" : "bg-background"
                  )}
                >
                  {attachment.type.startsWith("image/") ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span className="max-w-24 truncate">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString("mn-MN", { 
            hour: "2-digit", 
            minute: "2-digit" 
          })}
        </span>
      </div>
    </div>
  )
}

export function ChatMessages() {
  const { messages, language, selectedCategory } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {language === "mn" ? "Сайн уу! Асуух зүйлээ бичнэ үү!" : "Hello! Type your question!"}
          </h2>
          <p className="text-muted-foreground">
            {language === "mn" 
              ? `Одоогийн сонголт: ${getCategoryLabel(selectedCategory, language)}`
              : `Current selection: ${getCategoryLabel(selectedCategory, language)}`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

function getCategoryLabel(category: string, language: "mn" | "en"): string {
  const labels: Record<string, Record<"mn" | "en", string>> = {
    general: { mn: "Ерөнхий асуулт", en: "General Questions" },
    forms: { mn: "Маягт ба тодорхойлолт", en: "Forms & Documents" },
    payment: { mn: "Төлбөр", en: "Payment" },
    location: { mn: "Байршил", en: "Location" }
  }
  return labels[category]?.[language] || category
}
