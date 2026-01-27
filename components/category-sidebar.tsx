"use client"

import React from "react"

import { useChat, type Category } from "@/lib/chat-context"
import { X, Calendar, Award, Home, FileText, CreditCard, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

const categories: { id: Category; label: string; labelEn: string; description: string; descriptionEn: string; icon: React.ElementType; color: string }[] = [
  { 
    id: "schedule", 
    label: "Хичээл / Хуваарь", 
    labelEn: "Classes / Schedule",
    description: "Хичээлийн хуваарь, шалгалт, семинар",
    descriptionEn: "Class schedule, exams, seminars",
    icon: Calendar,
    color: "bg-blue-500"
  },
  { 
    id: "scholarship", 
    label: "Тэтгэлэг", 
    labelEn: "Scholarship",
    description: "Шаардлага, хугацаа, материал",
    descriptionEn: "Requirements, deadlines, materials",
    icon: Award,
    color: "bg-yellow-500"
  },
  { 
    id: "dormitory", 
    label: "Дотуур байр", 
    labelEn: "Dormitory",
    description: "Бүртгэл, төлбөр, журам",
    descriptionEn: "Registration, payment, rules",
    icon: Home,
    color: "bg-orange-500"
  },
  { 
    id: "documents", 
    label: "Тодорхойлолт", 
    labelEn: "Documents",
    description: "Ямар бичиг баримт хаанаас авах",
    descriptionEn: "Where to get documents",
    icon: FileText,
    color: "bg-gray-400"
  },
  { 
    id: "payment", 
    label: "Төлбөр", 
    labelEn: "Payment",
    description: "Төлбөр төлөх, үлдэгдэл, данс",
    descriptionEn: "Pay fees, balance, account",
    icon: CreditCard,
    color: "bg-green-500"
  },
  { 
    id: "general", 
    label: "Ерөнхий", 
    labelEn: "General",
    description: "Бусад асуулт",
    descriptionEn: "Other questions",
    icon: MessageCircle,
    color: "bg-purple-500"
  }
]

export function CategorySidebar({ isOpen, onClose }: CategorySidebarProps) {
  const { selectedCategory, setSelectedCategory, language } = useChat()

  const handleSelect = (category: Category) => {
    setSelectedCategory(category)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">
                {language === "mn" ? "Асуух төрөл" : "Question type"}
              </p>
              <h2 className="text-lg font-semibold text-foreground">
                {language === "mn" ? "Категори сонго" : "Select category"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {categories.map((category) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleSelect(category.id)}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all",
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary/50 hover:bg-secondary text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    isSelected ? "bg-white/20" : category.color
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      isSelected ? "text-primary-foreground" : "text-white"
                    )} />
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-medium",
                      isSelected ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {language === "mn" ? category.label : category.labelEn}
                    </h3>
                    <p className={cn(
                      "text-sm mt-0.5",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {language === "mn" ? category.description : category.descriptionEn}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer note */}
          <div className="mt-4 p-4 bg-secondary/30 rounded-xl">
            <p className="text-sm text-muted-foreground">
              {language === "mn" 
                ? "Сонгосон төрлөөр bot илүү оновчтой хариулна."
                : "The bot will respond more accurately based on the selected category."}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export { categories }
