'use client'

import { useEffect, useState, useCallback } from 'react'
import { Brain, BookMarked } from 'lucide-react'
import { cn } from '@/lib/utils'
import QuizGenerator from '@/components/quiz/QuizGenerator'
import ErrorBook     from '@/components/quiz/ErrorBook'
import type { Document, ErrorBookEntry } from '@/types'

type Tab = 'quiz' | 'errors'

export default function QuizPage() {
  const [tab,       setTab]       = useState<Tab>('quiz')
  const [documents, setDocuments] = useState<Document[]>([])
  const [errors,    setErrors]    = useState<ErrorBookEntry[]>([])

  const fetchErrors = useCallback(async () => {
    const res  = await fetch('/api/quiz')
    const data = await res.json()

    // Flatten to ErrorBookEntry shape
    const entries: ErrorBookEntry[] = (data.attempts || []).map((a: any) => ({
      attempt:  a,
      question: a.quiz_questions,
      document: undefined,
    }))
    setErrors(entries)
  }, [])

  useEffect(() => {
    fetch('/api/documents').then(r => r.json()).then(d => setDocuments(d.documents || []))
    fetchErrors()
  }, [fetchErrors])

  const handleAttempt = async (questionId: string, selectedIdx: number, isCorrect: boolean) => {
    await fetch('/api/quiz', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, selectedIdx, isCorrect }),
    })
    if (!isCorrect) fetchErrors()
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-amber" />
            測驗中心
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            AI 根據主題或文件自動生成題目，錯題記錄在錯題本中
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6 w-fit">
        {([
          { key: 'quiz',   label: '生成測驗', icon: Brain },
          { key: 'errors', label: `錯題本 ${errors.length > 0 ? `(${errors.length})` : ''}`, icon: BookMarked },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === key
                ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'quiz' ? (
        <QuizGenerator documents={documents} onAttempt={handleAttempt} />
      ) : (
        <ErrorBook entries={errors} />
      )}
    </div>
  )
}
