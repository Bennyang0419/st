'use client'

import { Plus, Search, FileText } from 'lucide-react'
import type { Note } from '@/types'
import { cn, truncate } from '@/lib/utils'

interface NoteListProps {
  notes: Note[]
  activeId: string | null
  onSelect: (note: Note) => void
  onNew: () => void
}

export default function NoteList({ notes, activeId, onSelect, onNew }: NoteListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-300">筆記列表</h2>
        <button onClick={onNew} className="btn-ghost p-1.5">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search (decorative for now) */}
      <div className="flex items-center gap-2 input-glass mb-4 py-2">
        <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <span className="text-xs text-gray-600">搜尋筆記...</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {notes.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            <FileText className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p className="text-xs">尚無筆記</p>
          </div>
        )}
        {notes.map(note => (
          <button
            key={note.id}
            onClick={() => onSelect(note)}
            className={cn(
              'w-full text-left p-3 rounded-xl transition-all duration-200',
              activeId === note.id
                ? 'bg-accent-blue/10 border border-accent-blue/20'
                : 'hover:bg-white/[0.04]'
            )}
          >
            <p className={cn(
              'text-sm font-medium truncate',
              activeId === note.id ? 'text-accent-blue' : 'text-gray-300'
            )}>
              {note.title || '未命名筆記'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5 truncate">
              {truncate(note.content.replace(/[#*`]/g, ''), 50) || '空白筆記'}
            </p>
            {note.tags.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {note.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag text-[10px] px-1.5 py-0">#{tag}</span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
