"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useChat } from "@/lib/chat-context"
import { Menu, GraduationCap, Globe, LogOut, Trash2, Wifi, WifiOff } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { categories } from "./category-sidebar"

interface ChatHeaderProps {
  onMenuClick: () => void
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { language, setLanguage, selectedCategory, isConnected, clearHistory } = useChat()

  const selectedCategoryData = categories.find(c => c.id === selectedCategory)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const toggleLanguage = () => {
    setLanguage(language === "mn" ? "en" : "mn")
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Menu and Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-foreground">NUM Assistant</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {language === "mn" ? "Сонгосон төрөл:" : "Selected:"}{" "}
                  <span className="text-primary">
                    {language === "mn" ? selectedCategoryData?.label : selectedCategoryData?.labelEn}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
            isConnected ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Rasa</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
            title={language === "mn" ? "Switch to English" : "Монгол хэл рүү шилжих"}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{language === "mn" ? "MN" : "EN"}</span>
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <span className="text-sm text-foreground hidden sm:inline">
                  {user?.name || "User"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.studentId}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearHistory} className="text-muted-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                {language === "mn" ? "Түүх устгах" : "Clear history"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {language === "mn" ? "Гарах" : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
