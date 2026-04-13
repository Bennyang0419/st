'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import FileUploader from '@/components/documents/FileUploader'
import DocumentList from '@/components/documents/DocumentList'
import type { Document } from '@/types'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading,   setLoading]   = useState(true)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data.documents || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-teal" />
            資料管理中心
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            上傳學習資料，AI 會自動建立向量索引，支援智能問答
          </p>
        </div>
        <button onClick={fetchDocuments} className="btn-ghost">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Upload area */}
      <div className="mb-6">
        <FileUploader onUploadComplete={fetchDocuments} />
      </div>

      {/* Stats bar */}
      {documents.length > 0 && (
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span>{documents.length} 份文件</span>
          <span className="w-px h-3 bg-white/10" />
          <span>
            總大小：{(documents.reduce((s, d) => s + d.size, 0) / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
      )}

      {/* Document list */}
      <DocumentList documents={documents} onRefresh={fetchDocuments} />
    </div>
  )
}
