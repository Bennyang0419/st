'use client'

import { useEffect, useState } from 'react'
import { FileText, NotebookPen, Brain, Zap, TrendingUp, Clock } from 'lucide-react'
import { getGreeting, getTimeOfDay } from '@/lib/utils'
import type { Document, Note, LearningStats } from '@/types'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const [docs,  setDocs]  = useState<Document[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [stats, setStats] = useState<LearningStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const greeting = getGreeting(getTimeOfDay())

  useEffect(() => {
    async function load() {
      const [docsRes, notesRes, statsRes] = await Promise.all([
        supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('notes').select('*').order('updated_at', { ascending: false }).limit(5),
        supabase.from('learning_stats').select('*').order('mastery_score', { ascending: false }).limit(6),
      ])
      setDocs(docsRes.data || [])
      setNotes(notesRes.data || [])
      setStats(statsRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: '已上傳文件', value: docs.length, icon: FileText,    color: 'text-accent-teal',   href: '/documents' },
    { label: '學習筆記',   value: notes.length, icon: NotebookPen, color: 'text-accent-indigo', href: '/notes' },
    { label: '學習主題',   value: stats.length, icon: Brain,       color: 'text-accent-amber',  href: '/quiz' },
    { label: '知識片段',   value: '∞',          icon: Zap,         color: 'text-accent-blue',   href: '/chat' },
  ]

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-100 tracking-tight">
          {greeting}
        </h1>
        <p className="text-gray-500 mt-2">你的智能學習空間已準備好。</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="glass-card-hover p-5 group">
            <Icon className={`w-5 h-5 ${color} mb-3 group-hover:scale-110 transition-transform`} />
            <p className="text-2xl font-bold text-gray-100">{loading ? '—' : value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent documents */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-teal" />
              最近上傳
            </h2>
            <Link href="/documents" className="text-xs text-accent-blue hover:underline">查看全部</Link>
          </div>
          {docs.length === 0 ? (
            <p className="text-xs text-gray-600 py-4 text-center">尚無文件</p>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <FileText className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span className="text-sm text-gray-300 truncate flex-1">{doc.name}</span>
                  <span className="text-[10px] text-gray-600 shrink-0">
                    {new Date(doc.created_at).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learning stats */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-amber" />
              學習進度
            </h2>
            <Link href="/quiz" className="text-xs text-accent-blue hover:underline">開始測驗</Link>
          </div>
          {stats.length === 0 ? (
            <p className="text-xs text-gray-600 py-4 text-center">完成測驗後將顯示掌握度</p>
          ) : (
            <div className="space-y-3">
              {stats.map(s => (
                <div key={s.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 truncate mr-2">{s.topic}</span>
                    <span className="text-gray-500 shrink-0">{Math.round(s.mastery_score * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-teal
                                 transition-all duration-700"
                      style={{ width: `${Math.min(s.mastery_score * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent notes */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-accent-indigo" />
              最近筆記
            </h2>
            <Link href="/notes" className="text-xs text-accent-blue hover:underline">查看全部</Link>
          </div>
          {notes.length === 0 ? (
            <p className="text-xs text-gray-600 py-4 text-center">尚無筆記</p>
          ) : (
            <div className="space-y-2">
              {notes.map(note => (
                <div key={note.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <NotebookPen className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {note.title || '未命名'}
                  </span>
                  <span className="text-[10px] text-gray-600 shrink-0 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(note.updated_at).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-blue" />
            快速操作
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '上傳文件', href: '/documents', color: 'border-accent-teal/20 hover:border-accent-teal/40', icon: '📄' },
              { label: '新建筆記', href: '/notes',     color: 'border-accent-indigo/20 hover:border-accent-indigo/40', icon: '✍️' },
              { label: 'AI 問答',  href: '/chat',      color: 'border-accent-blue/20 hover:border-accent-blue/40', icon: '🤖' },
              { label: '生成測驗', href: '/quiz',      color: 'border-accent-amber/20 hover:border-accent-amber/40', icon: '🧠' },
            ].map(a => (
              <Link
                key={a.label}
                href={a.href}
                className={`flex items-center gap-2 p-3 rounded-xl border bg-white/[0.02]
                            transition-all duration-200 hover:bg-white/[0.05] text-sm text-gray-300 ${a.color}`}
              >
                <span>{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
