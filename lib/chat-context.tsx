"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Category = 
  | "leave"           // ask_leave - Чөлөө авах
  | "absence"         // ask_absence - Өвчтэй мэдэгдэх
  | "assignment"      // ask_assignment_grade - Даалгаврын дүн
  | "lab"             // ask_lab_grade - Лабын дүн
  | "course"          // ask_course_grade - Хичээлийн дүн
  | "wi"              // ask_w_i - W/I дүн
  | "general"         // greet, goodbye - Ерөнхий

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
      leave: {
        mn: "Чөлөө авах хүсэлттэй холбоотой. Rasa серверт холбогдох боломжгүй байна.",
        en: "Leave request related. Unable to connect to Rasa server."
      },
      absence: {
        mn: "Өвчтэй/ирж чадахгүй мэдэгдэлтэй холбоотой. Rasa серверт холбогдох боломжгүй байна.",
        en: "Absence notification related. Unable to connect to Rasa server."
      },
      assignment: {
        mn: "Даалгаврын дүнтэй холбоотой. Rasa серверт холбогдох боломжгүй байна.",
        en: "Assignment grade related. Unable to connect to Rasa server."
      },
      lab: {
        mn: "Лабораторийн дүнтэй холбоотой. Rasa серверт холбогдох боломжгүй байна.",
        en: "Lab grade related. Unable to connect to Rasa server."
      },
      course: {
        mn: "Хичээлийн дүнтэй холбоотой. Rasa серверт холбогдох боломжгүй байна.",
        en: "Course grade related. Unable to connect to Rasa server."
      },
      wi: {
        mn: "W/I дүнтэй холбоотой. Rasa серверт холбогдох боломжгүй байна.",
        en: "W/I grade related. Unable to connect to Rasa server."
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
