"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Category = 
  | "schedule" 
  | "scholarship" 
  | "dormitory" 
  | "documents" 
  | "payment" 
  | "general"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  category: Category
  attachments?: { name: string; type: string; url: string }[]
}

interface ChatContextType {
  messages: Message[]
  selectedCategory: Category
  language: "mn" | "en"
  isConnected: boolean
  setSelectedCategory: (category: Category) => void
  setLanguage: (lang: "mn" | "en") => void
  sendMessage: (content: string, attachments?: File[]) => Promise<void>
  clearHistory: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const RASA_ENDPOINT = "http://localhost:5005/webhooks/rest/webhook"

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category>("general")
  const [language, setLanguage] = useState<"mn" | "en">("mn")
  const [isConnected, setIsConnected] = useState(false)

  // Load chat history from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("num_chat_history")
    if (stored) {
      const parsed = JSON.parse(stored)
      setMessages(parsed.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })))
    }
    
    // Check Rasa connection
    checkConnection()
  }, [])

  // Save chat history to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("num_chat_history", JSON.stringify(messages))
    }
  }, [messages])

  const checkConnection = async () => {
    try {
      const response = await fetch("http://localhost:5005/", { 
        method: "GET",
        signal: AbortSignal.timeout(3000)
      })
      setIsConnected(response.ok)
    } catch {
      setIsConnected(false)
    }
  }

  const sendMessage = async (content: string, attachments?: File[]) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
      category: selectedCategory,
      attachments: attachments?.map(f => ({
        name: f.name,
        type: f.type,
        url: URL.createObjectURL(f)
      }))
    }

    setMessages(prev => [...prev, userMessage])

    try {
      // Send to Rasa with category metadata
      const payload = {
        sender: "user",
        message: content,
        metadata: {
          category: selectedCategory,
          language: language
        }
      }

      const response = await fetch(RASA_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data && data.length > 0) {
          for (const botResponse of data) {
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: botResponse.text || "Уучлаарай, хариу ирсэнгүй.",
              timestamp: new Date(),
              category: selectedCategory
            }
            setMessages(prev => [...prev, assistantMessage])
          }
        } else {
          addFallbackResponse()
        }
        setIsConnected(true)
      } else {
        addFallbackResponse()
      }
    } catch {
      setIsConnected(false)
      addFallbackResponse()
    }
  }

  const addFallbackResponse = () => {
    const fallbackMessages: Record<Category, Record<"mn" | "en", string>> = {
      schedule: {
        mn: "Хичээлийн хуваарьтай холбоотой асуулт байна. Rasa сервертэй холбогдоход алдаа гарлаа. Localhost:5005 ажиллаж байгаа эсэхийг шалгана уу.",
        en: "This is a schedule-related question. Failed to connect to Rasa server. Please check if localhost:5005 is running."
      },
      scholarship: {
        mn: "Тэтгэлэгтэй холбоотой асуулт байна. Rasa серверт холбогдох боломжгүй байна.",
        en: "This is a scholarship-related question. Unable to connect to Rasa server."
      },
      dormitory: {
        mn: "Дотуур байртай холбоотой асуулт байна. Rasa серверт холбогдох боломжгүй байна.",
        en: "This is a dormitory-related question. Unable to connect to Rasa server."
      },
      documents: {
        mn: "Тодорхойлолттой холбоотой асуулт байна. Rasa серверт холбогдох боломжгүй байна.",
        en: "This is a documents-related question. Unable to connect to Rasa server."
      },
      payment: {
        mn: "Төлбөртэй холбоотой асуулт байна. Rasa серверт холбогдох боломжгүй байна.",
        en: "This is a payment-related question. Unable to connect to Rasa server."
      },
      general: {
        mn: "Rasa серверт холбогдох боломжгүй байна. Localhost:5005 дээр Rasa server ажиллаж байгаа эсэхийг шалгана уу.",
        en: "Unable to connect to Rasa server. Please check if Rasa server is running on localhost:5005."
      }
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: fallbackMessages[selectedCategory][language],
      timestamp: new Date(),
      category: selectedCategory
    }
    setMessages(prev => [...prev, assistantMessage])
  }

  const clearHistory = () => {
    setMessages([])
    sessionStorage.removeItem("num_chat_history")
  }

  return (
    <ChatContext.Provider value={{
      messages,
      selectedCategory,
      language,
      isConnected,
      setSelectedCategory,
      setLanguage,
      sendMessage,
      clearHistory
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
