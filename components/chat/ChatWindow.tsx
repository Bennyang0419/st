'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Bot, User, Copy, Check, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ModeToggle from './ModeToggle'
import type { Document } from '@/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatWindowProps {
  documents: Document[]
}

export default function ChatWindow({ documents }: ChatWindowProps) {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [mode, setMode]           = useState<'general' | 'document'>('general')
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [copiedId, setCopiedId]   = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          mode,
          documentIds: mode === 'document' ? selectedDocs : undefined,
        }),
      })

      if (!res.ok) throw new Error('請求失敗')
      if (!res.body) throw new Error('無回應串流')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        // Parse SSE data lines
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullContent += parsed.text
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m)
                )
              }
              if (parsed.sessionId && !sessionId) setSessionId(parsed.sessionId)
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: '抱歉，發生了錯誤。請稍後重試。' }
          : m
      ))
      toast.error(err.message || 'AI 回應失敗')
    } finally {
      setLoading(false)
    }
  }, [input, loading, mode, selectedDocs, sessionId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setSessionId(undefined)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <ModeToggle
          mode={mode}
          onModeChange={setMode}
          documents={documents}
          selectedDocs={selectedDocs}
          onSelectedDocsChange={setSelectedDocs}
        />
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-ghost text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            清除對話
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 border border-accent-blue/20
                            flex items-center justify-center mb-4 animate-float">
              <Bot className="w-6 h-6 text-accent-blue" />
            </div>
            <h3 className="text-gray-300 font-medium mb-2">
              {mode === 'general' ? '有什麼可以幫你的嗎？' : '針對文件提問'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {mode === 'general'
                ? '我是你的 AI 學習助理，可以解釋概念、整理筆記、或幫你思考問題。'
                : '我會根據你上傳的文件來回答問題，並引用相關段落。'
              }
            </p>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-md">
              {(mode === 'general'
                ? ['解釋一個概念給我', '幫我整理學習重點', '生成練習題目']
                : ['這份文件的主要論點是什麼？', '幫我總結重要內容', '有哪些關鍵術語？']
              ).map(s => (
                <button key={s} onClick={() => setInput(s)}
                  className="tag hover:border-white/20 hover:text-gray-200 cursor-pointer
                             transition-all text-xs py-1.5 px-3">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={cn('flex gap-3 group', msg.role === 'user' && 'flex-row-reverse')}>
            {/* Avatar */}
            <div className={cn(
              'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
              msg.role === 'assistant'
                ? 'bg-accent-blue/20 border border-accent-blue/30'
                : 'bg-accent-indigo/20 border border-accent-indigo/30'
            )}>
              {msg.role === 'assistant'
                ? <Bot className="w-3.5 h-3.5 text-accent-blue" />
                : <User className="w-3.5 h-3.5 text-accent-indigo" />
              }
            </div>

            {/* Bubble */}
            <div className={cn(
              'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-accent-indigo/15 border border-accent-indigo/20 text-gray-100 rounded-tr-md'
                : 'glass-card text-gray-200 rounded-tl-md'
            )}>
              {msg.role === 'assistant' ? (
                msg.content
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}
                      className="prose prose-invert prose-sm max-w-none
                                 prose-pre:bg-white/[0.06] prose-pre:border prose-pre:border-white/[0.08]
                                 prose-code:text-accent-teal prose-a:text-accent-blue">
                      {msg.content}
                    </ReactMarkdown>
                  : <span className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      思考中...
                    </span>
              ) : (
                <p>{msg.content}</p>
              )}

              {/* Copy button */}
              {msg.content && (
                <button
                  onClick={() => copyMessage(msg.id, msg.content)}
                  className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity
                             flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300"
                >
                  {copiedId === msg.id
                    ? <><Check className="w-3 h-3" /> 已複製</>
                    : <><Copy className="w-3 h-3" /> 複製</>
                  }
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="mt-4">
        <div className="glass-card p-3 flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'general' ? '輸入你的問題... (Enter 送出)' : '針對已選文件提問...'}
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600
                       outline-none resize-none leading-relaxed max-h-32 overflow-y-auto"
            style={{ minHeight: '24px' }}
            onInput={e => {
              const el = e.target as HTMLTextAreaElement
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 128) + 'px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={cn(
              'p-2.5 rounded-xl transition-all duration-200 shrink-0',
              input.trim() && !loading
                ? 'bg-accent-blue/20 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/30'
                : 'bg-white/[0.04] border border-white/[0.06] text-gray-600 cursor-not-allowed'
            )}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
        <p className="text-[11px] text-gray-600 mt-1.5 text-center">
          AI 可能犯錯，重要資訊請自行驗證
        </p>
      </div>
    </div>
  )
}
