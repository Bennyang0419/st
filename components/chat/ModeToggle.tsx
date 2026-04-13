'use client'

import { MessageSquare, Database, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Document } from '@/types'

interface ModeToggleProps {
  mode: 'general' | 'document'
  onModeChange: (mode: 'general' | 'document') => void
  documents: Document[]
  selectedDocs: string[]
  onSelectedDocsChange: (ids: string[]) => void
}

export default function ModeToggle({
  mode, onModeChange, documents, selectedDocs, onSelectedDocsChange,
}: ModeToggleProps) {
  const [showDocs, setShowDocs] = useState(false)

  const toggleDoc = (id: string) => {
    onSelectedDocsChange(
      selectedDocs.includes(id)
        ? selectedDocs.filter(d => d !== id)
        : [...selectedDocs, id]
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Mode pills */}
      <div className="flex p-1 gap-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <button
          onClick={() => onModeChange('general')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            mode === 'general'
              ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          一般模式
        </button>
        <button
          onClick={() => onModeChange('document')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            mode === 'document'
              ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/30'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <Database className="w-3.5 h-3.5" />
          文件模式
        </button>
      </div>

      {/* Document selector (only in document mode) */}
      {mode === 'document' && (
        <div className="relative">
          <button
            onClick={() => setShowDocs(v => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all',
              selectedDocs.length
                ? 'border-accent-teal/30 text-accent-teal bg-accent-teal/10'
                : 'border-white/[0.10] text-gray-400 hover:border-white/20'
            )}
          >
            <Database className="w-3 h-3" />
            {selectedDocs.length ? `已選 ${selectedDocs.length} 份文件` : '選擇文件'}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showDocs && (
            <div className="absolute top-full mt-1 left-0 z-50 w-64 glass-card p-2 space-y-1 shadow-glass-lg">
              {documents.length === 0 ? (
                <p className="text-xs text-gray-500 px-2 py-2">尚未上傳任何文件</p>
              ) : (
                <>
                  <p className="text-[10px] text-gray-500 px-2 pb-1">選擇要查詢的文件（可多選）</p>
                  {documents.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-left transition-all',
                        selectedDocs.includes(doc.id)
                          ? 'bg-accent-teal/10 text-accent-teal'
                          : 'text-gray-400 hover:bg-white/[0.05]'
                      )}
                    >
                      <div className={cn(
                        'w-3 h-3 rounded border flex items-center justify-center',
                        selectedDocs.includes(doc.id)
                          ? 'border-accent-teal bg-accent-teal/30'
                          : 'border-gray-600'
                      )}>
                        {selectedDocs.includes(doc.id) && <span className="text-[8px]">✓</span>}
                      </div>
                      <span className="truncate">{doc.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
