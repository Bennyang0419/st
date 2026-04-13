'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  NotebookPen,
  MessageSquare,
  Brain,
  Timer,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: '總覽',     color: 'text-accent-blue' },
  { href: '/documents',   icon: FileText,        label: '資料庫',   color: 'text-accent-teal' },
  { href: '/notes',       icon: NotebookPen,     label: '智能筆記', color: 'text-accent-indigo' },
  { href: '/chat',        icon: MessageSquare,   label: 'AI 問答',  color: 'text-accent-blue' },
  { href: '/quiz',        icon: Brain,           label: '測驗中心', color: 'text-accent-amber' },
  { href: '/focus',       icon: Timer,           label: '專注模式', color: 'text-accent-teal' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full relative z-20 border-r border-white/[0.06]"
      style={{
        background: 'rgba(8,13,20,0.7)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue/30 to-accent-indigo/30
                          border border-accent-blue/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-blue" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-widest text-gray-100">BENNY</h1>
            <p className="text-xs text-gray-500 tracking-wider">STUDYING</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-medium tracking-widest text-gray-600 uppercase px-3 mb-3">
          學習工具
        </p>
        {navItems.map(({ href, icon: Icon, label, color }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'nav-item',
                isActive && 'nav-item-active'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-accent-blue' : color, 'opacity-80')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom info */}
      <div className="p-4">
        <div className="glass-card p-3 text-center">
          <BookOpen className="w-4 h-4 text-accent-teal mx-auto mb-1.5" />
          <p className="text-[11px] text-gray-400">每天學習一點</p>
          <p className="text-[11px] text-gray-500">積累無限可能</p>
        </div>
      </div>
    </aside>
  )
}
