'use client'

import { useState, useEffect, useCallback } from 'react'
import { NotebookPen, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import NoteEditor from '@/components/notes/NoteEditor'
import NoteList   from '@/components/notes/NoteList'
import type { Note } from '@/types'

export default function NotesPage() {
  const [notes,    setNotes]    = useState<Note[]>([])
  const [active,   setActive]   = useState<Partial<Note> | null>(null)
  const [loading,  setLoading]  = useState(true)

  const fetchNotes = useCallback(async () => {
    const res  = await fetch('/api/notes')
    const data = await res.json()
    setNotes(data.notes || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const handleNew = () => {
    setActive({ title: '', content: '', tags: [] })
  }

  const handleSelect = (note: Note) => setActive(note)

  const handleSave = async (note: Partial<Note>) => {
    if (note.id) {
      // Update existing
      const res = await fetch('/api/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      const data = await res.json()
      setNotes(prev => prev.map(n => n.id === data.note.id ? data.note : n))
      setActive(data.note)
    } else {
      // Create new
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      const data = await res.json()
      setNotes(prev => [data.note, ...prev])
      setActive(data.note)
    }
  }

  const handleDelete = async () => {
    if (!active?.id) { setActive(null); return }
    if (!confirm('確定刪除這則筆記？')) return
    await fetch(`/api/notes?id=${active.id}`, { method: 'DELETE' })
    setNotes(prev => prev.filter(n => n.id !== active.id))
    setActive(null)
    toast.success('筆記已刪除')
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 animate-fade-in -m-6 lg:-m-8 p-6 lg:p-8">
      {/* Left panel - note list */}
      <div className="w-64 shrink-0 glass-card p-4 overflow-y-auto">
        <NoteList
          notes={notes}
          activeId={active?.id ?? null}
          onSelect={handleSelect}
          onNew={handleNew}
        />
      </div>

      {/* Right panel - editor */}
      <div className="flex-1 glass-card p-6 overflow-hidden flex flex-col">
        {active ? (
          <>
            <NoteEditor note={active} onSave={handleSave} />
            <div className="mt-3 pt-3 border-t border-white/[0.05] flex justify-end">
              <button onClick={handleDelete} className="btn-ghost text-xs text-red-400 hover:text-red-300">
                <Trash2 className="w-3.5 h-3.5" />
                刪除筆記
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <NotebookPen className="w-12 h-12 text-gray-700 mb-4 animate-float" />
            <p className="text-gray-400 font-medium">選擇一則筆記開始編輯</p>
            <p className="text-sm text-gray-600 mt-2 mb-6">或建立一則全新的筆記</p>
            <button onClick={handleNew} className="btn-primary">
              <Plus className="w-4 h-4" />
              新建筆記
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
