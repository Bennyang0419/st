'use client'

import { useState } from 'react'
import { FileText, Trash2, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { Document } from '@/types'
import { formatFileSize } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface DocumentListProps {
  documents: Document[]
  onRefresh: () => void
}

const typeColors: Record<string, string> = {
  pdf:      'text-red-400 bg-red-400/10',
  markdown: 'text-blue-400 bg-blue-400/10',
  text:     'text-gray-400 bg-gray-400/10',
}

export default function DocumentList({ documents, onRefresh }: DocumentListProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleting, setDeleting]  = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async (doc: Document) => {
    if (!confirm(`確定刪除「${doc.name}」？此操作無法復原。`)) return
    setDeleting(doc.id)
    try {
      const res = await fetch(`/api/documents?id=${doc.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('刪除失敗')
      toast.success(`已刪除「${doc.name}」`)
      onRefresh()
    } catch {
      toast.error('刪除失敗，請重試')
    } finally {
      setDeleting(null)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">尚未上傳任何文件</p>
        <p className="text-xs mt-1 text-gray-600">上傳 PDF 或筆記，AI 將自動建立知識庫</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div key={doc.id} className="glass-card-hover overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
              className="flex items-center gap-3 flex-1 text-left min-w-0"
            >
              {expanded === doc.id
                ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
              }
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase shrink-0 ${typeColors[doc.type] || typeColors.text}`}>
                {doc.type}
              </div>
              <span className="text-sm font-medium text-gray-200 truncate">{doc.name}</span>
              <span className="text-xs text-gray-500 shrink-0 ml-auto">{formatFileSize(doc.size)}</span>
            </button>
            <button
              onClick={() => handleDelete(doc)}
              disabled={deleting === doc.id}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10
                         transition-all duration-200 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expanded content preview */}
          {expanded === doc.id && (
            <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <Clock className="w-3 h-3" />
                <span>上傳時間：{new Date(doc.created_at).toLocaleString('zh-TW')}</span>
              </div>
              {doc.content && (
                <div className="bg-white/[0.03] rounded-xl p-3 font-mono text-xs text-gray-400
                                max-h-40 overflow-y-auto leading-relaxed">
                  {doc.content.slice(0, 800)}{doc.content.length > 800 ? '...' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
