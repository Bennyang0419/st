'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Tag, X, Mic, MicOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from 'use-debounce'
import type { Note } from '@/types'

interface NoteEditorProps {
  note: Partial<Note>
  onSave: (note: Partial<Note>) => Promise<void>
}

export default function NoteEditor({ note, onSave }: NoteEditorProps) {
  const [title,   setTitle]   = useState(note.title   ?? '')
  const [content, setContent] = useState(note.content ?? '')
  const [tags,    setTags]    = useState<string[]>(note.tags ?? [])
  const [tagInput,setTagInput]= useState('')
  const [saving,  setSaving]  = useState(false)
  const [recording, setRecording] = useState(false)

  // Dynamically import md editor to avoid SSR issues
  const [MDEditor, setMDEditor] = useState<any>(null)
  useEffect(() => {
    import('@uiw/react-md-editor').then(m => setMDEditor(() => m.default))
  }, [])

  const [debouncedContent] = useDebounce(content, 2000)
  const [debouncedTitle]   = useDebounce(title,   2000)

  // Auto-save
  useEffect(() => {
    if (!debouncedContent && !debouncedTitle) return
    if (debouncedContent === note.content && debouncedTitle === note.title) return
    handleSave(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, debouncedTitle])

  const handleSave = useCallback(async (silent = false) => {
    setSaving(true)
    try {
      await onSave({ ...note, title, content, tags })
      if (!silent) toast.success('筆記已儲存')
    } catch {
      toast.error('儲存失敗')
    } finally {
      setSaving(false)
    }
  }, [note, title, content, tags, onSave])

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('您的瀏覽器不支援語音輸入')
      return
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'zh-TW'
    recognition.continuous = false
    recognition.interimResults = false

    setRecording(true)
    recognition.start()
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setContent(prev => prev + '\n\n' + transcript)
      setRecording(false)
    }
    recognition.onerror = () => {
      toast.error('語音識別失敗，請重試')
      setRecording(false)
    }
    recognition.onend = () => setRecording(false)
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="筆記標題..."
        className="text-2xl font-semibold bg-transparent border-none outline-none
                   text-gray-100 placeholder-gray-600 w-full"
      />

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {tags.map(tag => (
          <span key={tag} className="tag flex items-center gap-1">
            # {tag}
            <button onClick={() => setTags(tags.filter(t => t !== tag))}
              className="hover:text-red-400 transition-colors">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <Tag className="w-3 h-3 text-gray-600" />
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="新增標籤..."
            className="text-xs bg-transparent outline-none text-gray-400
                       placeholder-gray-600 w-24"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceInput}
            disabled={recording}
            className={`btn-ghost text-xs ${recording ? 'text-red-400' : ''}`}
          >
            {recording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {recording ? '錄音中...' : '語音輸入'}
          </button>
        </div>
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="btn-primary text-xs"
        >
          {saving
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Save className="w-3.5 h-3.5" />
          }
          {saving ? '儲存中' : '儲存'}
        </button>
      </div>

      {/* Markdown editor */}
      <div className="flex-1 min-h-0" data-color-mode="dark">
        {MDEditor ? (
          <MDEditor
            value={content}
            onChange={(v: string | undefined) => setContent(v ?? '')}
            height="100%"
            preview="live"
            className="h-full"
          />
        ) : (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="開始寫筆記... (支援 Markdown 語法)"
            className="input-glass h-full resize-none font-mono text-sm leading-relaxed"
          />
        )}
      </div>
    </div>
  )
}
