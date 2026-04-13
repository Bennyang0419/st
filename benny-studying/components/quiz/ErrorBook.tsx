'use client'

import { XCircle, TrendingUp, BookOpen } from 'lucide-react'
import type { ErrorBookEntry } from '@/types'
import { cn } from '@/lib/utils'

interface ErrorBookProps {
  entries: ErrorBookEntry[]
}

export default function ErrorBook({ entries }: ErrorBookProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">錯題本是空的</p>
        <p className="text-xs mt-1 text-gray-600">完成測驗後，答錯的題目會出現在這裡</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-accent-amber" />
        <p className="text-sm text-gray-400">共 <span className="text-gray-200 font-medium">{entries.length}</span> 道錯題，需要加強複習</p>
      </div>

      {entries.map(({ attempt, question, document: doc }) => (
        <div key={attempt.id} className="glass-card p-4 space-y-3 border-l-2 border-l-red-500/40">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200">{question.question}</p>
              {doc && <p className="text-[11px] text-gray-600 mt-0.5">來源：{doc.name}</p>}
            </div>
          </div>

          <div className="pl-6 space-y-1.5">
            {question.options.map((opt, i) => (
              <div key={i} className={cn(
                'text-xs px-3 py-1.5 rounded-lg',
                i === question.correct_idx
                  ? 'bg-accent-teal/10 text-accent-teal border border-accent-teal/20'
                  : i === attempt.selected_idx
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'text-gray-600'
              )}>
                <span className="font-mono mr-1.5">{String.fromCharCode(65 + i)}.</span>
                {opt}
                {i === question.correct_idx && <span className="ml-2 text-[10px]">✓ 正確</span>}
                {i === attempt.selected_idx && i !== question.correct_idx && (
                  <span className="ml-2 text-[10px]">✗ 你的答案</span>
                )}
              </div>
            ))}
          </div>

          {question.explanation && (
            <p className="text-xs text-gray-400 pl-6 border-t border-white/[0.05] pt-2">
              <span className="text-accent-amber font-medium">解析：</span>
              {question.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
