'use client'

import { useState } from 'react'
import { Brain, Loader2, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Document, QuizQuestion } from '@/types'

interface QuizGeneratorProps {
  documents: Document[]
  onAttempt: (questionId: string, selectedIdx: number, isCorrect: boolean) => Promise<void>
}

export default function QuizGenerator({ documents, onAttempt }: QuizGeneratorProps) {
  const [topic,       setTopic]       = useState('')
  const [selectedDoc, setSelectedDoc] = useState('')
  const [count,       setCount]       = useState(5)
  const [generating,  setGenerating]  = useState(false)
  const [questions,   setQuestions]   = useState<QuizQuestion[]>([])
  const [answers,     setAnswers]     = useState<Record<string, number>>({})
  const [submitted,   setSubmitted]   = useState(false)

  const generate = async () => {
    if (!topic && !selectedDoc) {
      toast.error('請輸入主題或選擇文件')
      return
    }
    setGenerating(true)
    setQuestions([])
    setAnswers({})
    setSubmitted(false)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, documentId: selectedDoc || undefined, count }),
      })
      if (!res.ok) throw new Error('生成失敗')
      const data = await res.json()
      setQuestions(data.questions)
    } catch (err: any) {
      toast.error(err.message || '生成題目失敗')
    } finally {
      setGenerating(false)
    }
  }

  const submit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error(`請回答所有 ${questions.length} 道題目`)
      return
    }
    setSubmitted(true)
    // Record all attempts
    for (const q of questions) {
      const selected = answers[q.id]
      if (selected !== undefined) {
        await onAttempt(q.id, selected, selected === q.correct_idx)
      }
    }
  }

  const score = submitted
    ? questions.filter(q => answers[q.id] === q.correct_idx).length
    : 0

  return (
    <div className="space-y-6">
      {/* Config panel */}
      {!questions.length && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-accent-amber" />
            <h3 className="font-medium text-gray-200">生成測驗</h3>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">測驗主題</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="例：機器學習、微積分、世界史..."
              className="input-glass"
            />
          </div>

          {documents.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">或選擇文件（可選）</label>
              <select
                value={selectedDoc}
                onChange={e => setSelectedDoc(e.target.value)}
                className="input-glass"
              >
                <option value="">— 不指定文件 —</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">題目數量：{count} 題</label>
            <input
              type="range" min={3} max={15} value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-full accent-accent-amber"
            />
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-accent-amber/20 border border-accent-amber/30 text-accent-amber
                       hover:bg-accent-amber/30 transition-all font-medium"
          >
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" />AI 正在生成題目...</>
              : <><Brain className="w-4 h-4" />開始生成 {count} 道題目</>
            }
          </button>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          {/* Score banner (after submit) */}
          {submitted && (
            <div className={cn(
              'glass-card p-4 flex items-center gap-4',
              score >= questions.length * 0.7 ? 'border-accent-teal/30' : 'border-accent-amber/30'
            )}>
              <div className="text-4xl font-bold text-gray-100">
                {score}<span className="text-xl text-gray-400">/{questions.length}</span>
              </div>
              <div>
                <p className="font-medium text-gray-200">
                  {score === questions.length ? '完美！全部答對！🎉'
                    : score >= questions.length * 0.7 ? '表現不錯！繼續加油！'
                    : '需要加強，別氣餒！'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  正確率：{Math.round(score / questions.length * 100)}%
                </p>
              </div>
              <button
                onClick={() => { setQuestions([]); setAnswers({}); setSubmitted(false) }}
                className="ml-auto btn-ghost text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重新生成
              </button>
            </div>
          )}

          {questions.map((q, qi) => {
            const selected  = answers[q.id]
            const isCorrect = selected === q.correct_idx

            return (
              <div key={q.id} className={cn(
                'glass-card p-5 space-y-3',
                submitted && (isCorrect ? 'border-accent-teal/20' : 'border-red-500/20')
              )}>
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-500 font-mono mt-0.5 shrink-0">Q{qi + 1}</span>
                  <p className="text-sm font-medium text-gray-100">{q.question}</p>
                  {submitted && (
                    <span className="ml-auto shrink-0">
                      {isCorrect
                        ? <CheckCircle2 className="w-5 h-5 text-accent-teal" />
                        : <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 pl-6">
                  {q.options.map((opt, oi) => {
                    const isSelected = selected === oi
                    const isAnswer   = q.correct_idx === oi
                    return (
                      <button
                        key={oi}
                        onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: oi }))}
                        disabled={submitted}
                        className={cn(
                          'text-left px-4 py-2.5 rounded-xl text-sm border transition-all duration-200',
                          !submitted && isSelected
                            ? 'border-accent-blue/40 bg-accent-blue/15 text-accent-blue'
                            : !submitted
                            ? 'border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.04] text-gray-300'
                            : submitted && isAnswer
                            ? 'border-accent-teal/40 bg-accent-teal/10 text-accent-teal'
                            : submitted && isSelected && !isAnswer
                            ? 'border-red-500/40 bg-red-500/10 text-red-400'
                            : 'border-white/[0.04] text-gray-500'
                        )}
                      >
                        <span className="font-mono text-xs mr-2 opacity-50">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {/* Explanation */}
                {submitted && q.explanation && (
                  <div className="pl-6 pt-1 border-t border-white/[0.05]">
                    <p className="text-xs text-gray-400">
                      <span className="text-accent-amber font-medium">解析：</span>
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            )
          })}

          {!submitted && (
            <button
              onClick={submit}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-accent-blue/20 border border-accent-blue/30 text-accent-blue
                         hover:bg-accent-blue/30 transition-all font-medium"
            >
              提交答案
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
