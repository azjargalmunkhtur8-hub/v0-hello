"use client"

import React from "react"

import { useState, useRef } from "react"
import { useChat } from "@/lib/chat-context"
import { ArrowUp, Paperclip, X, ImageIcon, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { categories } from "./category-sidebar"

export function ChatInput() {
  const { sendMessage, selectedCategory, language } = useChat()
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedCategoryData = categories.find(c => c.id === selectedCategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!message.trim() && attachments.length === 0) || isSubmitting) return

    setIsSubmitting(true)
    await sendMessage(message, attachments.length > 0 ? attachments : undefined)
    setMessage("")
    setAttachments([])
    setIsSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const placeholder = language === "mn" 
    ? `(${selectedCategoryData?.label || "Ерөнхий"}) Асуултаа энд бичнэ үү...`
    : `(${selectedCategoryData?.labelEn || "General"}) Type your question here...`

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg"
            >
              {file.type.startsWith("image/") ? (
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <File className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground max-w-32 truncate">
                {file.name}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="p-1 hover:bg-background rounded transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* File attachment button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          title={language === "mn" ? "Файл хавсаргах" : "Attach file"}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full bg-secondary border border-border rounded-2xl px-4 py-3 pr-14 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px] max-h-32"
            style={{ 
              height: "auto",
              minHeight: "48px"
            }}
            disabled={isSubmitting}
          />
          
          {/* Send button */}
          <button
            type="submit"
            disabled={(!message.trim() && attachments.length === 0) || isSubmitting}
            className={cn(
              "absolute right-2 bottom-2 p-2 rounded-xl transition-all",
              (message.trim() || attachments.length > 0) && !isSubmitting
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        {language === "mn" ? "Enter дарж илгээж болно." : "Press Enter to send."}
      </p>
    </div>
  )
}
