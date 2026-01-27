"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  name: string
  studentId: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from session)
    const storedUser = sessionStorage.getItem("num_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate authentication with university credentials
    // In production, this would connect to NUM's authentication system
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Demo: Accept any username/password for testing
    // In production, validate against university LDAP/SSO
    if (username && password) {
      const userData: User = {
        id: crypto.randomUUID(),
        username: username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        studentId: `NUM${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`
      }
      setUser(userData)
      sessionStorage.setItem("num_user", JSON.stringify(userData))
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("num_user")
    sessionStorage.removeItem("num_chat_history")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
