'use client'

import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import ChatWindow from '@/components/chat/ChatWindow'
import type { Document } from '@/types'

export default function ChatPage() {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(d => setDocuments(d.documents || []))
  }, [])

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)] animate-fade-in -mt-6 lg:-mt-8 pt-6 lg:pt-8">
      <div className="mb-4">
        <h1 className="section-title flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent-blue" />
          AI 智庫問答
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          切換「文件模式」可針對你上傳的資料進行深度問答
        </p>
      </div>
      <div className="flex-1 glass-card p-5 flex flex-col overflow-hidden min-h-0">
        <ChatWindow documents={documents} />
      </div>
    </div>
  )
}
