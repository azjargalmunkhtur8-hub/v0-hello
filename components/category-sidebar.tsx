"use client"

import React from "react"
import { useChat, type Category } from "@/lib/chat-context"
import { 
  X, 
  CalendarOff, 
  Thermometer, 
  ClipboardList, 
  FlaskConical, 
  GraduationCap, 
  FileWarning, 
  MessageCircle 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CategorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Categories mapped to Rasa intents
const categories: { id: Category; label: string; labelEn: string; description: string; descriptionEn: string; icon: React.ElementType; color: string }[] = [
  { 
    id: "leave", 
    label: "Чөлөө авах", 
    labelEn: "Leave Request",
    description: "Чөлөө авах хүсэлт бичих загвар",
    descriptionEn: "Leave request template",
    icon: CalendarOff,
    color: "bg-blue-500"
  },
  { 
    id: "absence", 
    label: "Өвчтэй мэдэгдэх", 
    labelEn: "Absence Notice",
    description: "Ирж чадахгүй гэдгээ мэдэгдэх",
    descriptionEn: "Report absence due to illness",
    icon: Thermometer,
    color: "bg-red-500"
  },
  { 
    id: "assignment", 
    label: "Даалгаврын дүн", 
    labelEn: "Assignment Grade",
    description: "Даалгаврын дүн асуух загвар",
    descriptionEn: "Ask about assignment grades",
    icon: ClipboardList,
    color: "bg-yellow-500"
  },
  { 
    id: "lab", 
    label: "Лабын дүн", 
    labelEn: "Lab Grade",
    description: "Лабораторийн ажлын дүн асуух",
    descriptionEn: "Ask about lab grades",
    icon: FlaskConical,
    color: "bg-purple-500"
  },
  { 
    id: "course", 
    label: "Хичээлийн дүн", 
    labelEn: "Course Grade",
    description: "Эцсийн дүн асуух загвар",
    descriptionEn: "Ask about final course grades",
    icon: GraduationCap,
    color: "bg-green-500"
  },
  { 
    id: "wi", 
    label: "W / I дүн", 
    labelEn: "W / I Grade",
    description: "W, I дүн хүсэх загвар",
    descriptionEn: "Request W or I grade",
    icon: FileWarning,
    color: "bg-orange-500"
  },
  { 
    id: "general", 
    label: "Ерөнхий", 
    labelEn: "General",
    description: "Бусад асуулт, мэндчилгээ",
    descriptionEn: "Other questions, greetings",
    icon: MessageCircle,
    color: "bg-gray-500"
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
