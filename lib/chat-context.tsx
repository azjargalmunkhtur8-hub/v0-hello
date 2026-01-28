"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Category = 
  | "general"         // Ерөнхий асуулт
  | "forms"           // Маягт ба тодорхойлолт
  | "payment"         // Төлбөр
  | "location"        // Байршил

// Rasa endpoints for each category (different projects)
export const RASA_ENDPOINTS: Record<Category, string> = {
  general: "http://localhost:5005/webhooks/rest/webhook",
  forms: "http://localhost:5006/webhooks/rest/webhook",
  payment: "http://localhost:5007/webhooks/rest/webhook",
  location: "http://localhost:5008/webhooks/rest/webhook"
}

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

// Messages stored separately for each category
type CategoryMessages = Record<Category, Message[]>

export function ChatProvider({ children }: { children: ReactNode }) {
  const [categoryMessages, setCategoryMessages] = useState<CategoryMessages>({
    general: [],
    forms: [],
    payment: [],
    location: []
  })
  const [selectedCategory, setSelectedCategory] = useState<Category>("general")
  const [language, setLanguage] = useState<"mn" | "en">("mn")
  const [isConnected, setIsConnected] = useState(false)

  // Get messages for current category
  const messages = categoryMessages[selectedCategory]

  // Load chat history from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("num_chat_history_v2")
    if (stored) {
      const parsed = JSON.parse(stored)
      const restored: CategoryMessages = {
        general: [],
        forms: [],
        payment: [],
        location: []
      }
      for (const cat of Object.keys(restored) as Category[]) {
        if (parsed[cat]) {
          restored[cat] = parsed[cat].map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }
      }
      setCategoryMessages(restored)
    }
    
    // Check Rasa connection for current category
    checkConnection(selectedCategory)
  }, [])

  // Check connection when category changes
  useEffect(() => {
    checkConnection(selectedCategory)
  }, [selectedCategory])

  // Save chat history to session storage
  useEffect(() => {
    sessionStorage.setItem("num_chat_history_v2", JSON.stringify(categoryMessages))
  }, [categoryMessages])

  const checkConnection = async (category: Category) => {
    try {
      const baseUrl = RASA_ENDPOINTS[category].replace("/webhooks/rest/webhook", "")
      const response = await fetch(baseUrl, { 
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

    // Add message to current category
    setCategoryMessages(prev => ({
      ...prev,
      [selectedCategory]: [...prev[selectedCategory], userMessage]
    }))

    try {
      // Send to the correct Rasa endpoint based on category
      const endpoint = RASA_ENDPOINTS[selectedCategory]
      const payload = {
        sender: "user",
        message: content,
        metadata: {
          category: selectedCategory,
          language: language
        }
      }

      const response = await fetch(endpoint, {
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
            setCategoryMessages(prev => ({
              ...prev,
              [selectedCategory]: [...prev[selectedCategory], assistantMessage]
            }))
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
      general: {
        mn: "Ерөнхий асуултын Rasa серверт холбогдох боломжгүй байна. Localhost:5005 дээр ажиллаж байгаа эсэхийг шалгана уу.",
        en: "Unable to connect to General Rasa server. Please check if it's running on localhost:5005."
      },
      forms: {
        mn: "Маягт ба тодорхойлолтын Rasa серверт холбогдох боломжгүй байна. Localhost:5006 дээр ажиллаж байгаа эсэхийг шалгана уу.",
        en: "Unable to connect to Forms Rasa server. Please check if it's running on localhost:5006."
      },
      payment: {
        mn: "Төлбөрийн Rasa серверт холбогдох боломжгүй байна. Localhost:5007 дээр ажиллаж байгаа эсэхийг шалгана уу.",
        en: "Unable to connect to Payment Rasa server. Please check if it's running on localhost:5007."
      },
      location: {
        mn: "Байршилын Rasa серверт холбогдох боломжгүй байна. Localhost:5008 дээр ажиллаж байгаа эсэхийг шалгана уу.",
        en: "Unable to connect to Location Rasa server. Please check if it's running on localhost:5008."
      }
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: fallbackMessages[selectedCategory][language],
      timestamp: new Date(),
      category: selectedCategory
    }
    setCategoryMessages(prev => ({
      ...prev,
      [selectedCategory]: [...prev[selectedCategory], assistantMessage]
    }))
  }

  const clearHistory = () => {
    setCategoryMessages(prev => ({
      ...prev,
      [selectedCategory]: []
    }))
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
