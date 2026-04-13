'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

const MODES = {
  work:        { label: '專注', duration: 25 * 60, color: 'text-accent-blue' },
  'short-break': { label: '短休', duration: 5  * 60, color: 'text-accent-teal' },
  'long-break':  { label: '長休', duration: 15 * 60, color: 'text-accent-amber' },
}

type Mode = keyof typeof MODES

export default function PomodoroTimer() {
  const [mode, setMode]       = useState<Mode>('work')
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)

  const reset = useCallback(() => {
    setRunning(false)
    setTimeLeft(MODES[mode].duration)
  }, [mode])

  useEffect(() => { reset() }, [mode, reset])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setRunning(false)
          if (mode === 'work') setSessions(s => s + 1)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, mode])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const progress = 1 - timeLeft / MODES[mode].duration
  const circumference = 2 * Math.PI * 54

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-5">
      {/* Mode selector */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        {(Object.keys(MODES) as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
              mode === m
                ? 'bg-white/[0.10] text-gray-100'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r="54" fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          {/* Progress */}
          <circle cx="60" cy="60" r="54" fill="none"
            stroke={mode === 'work' ? '#4C8EFF' : mode === 'short-break' ? '#38C9A4' : '#F5A623'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-3xl font-mono font-semibold tabular-nums', MODES[mode].color)}>
            {mins}:{secs}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">{MODES[mode].label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={reset} className="btn-ghost p-2">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setRunning(r => !r)}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            running
              ? 'bg-white/[0.08] text-gray-200 hover:bg-white/[0.12]'
              : 'bg-accent-blue/20 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/30'
          )}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? '暫停' : '開始'}
        </button>
      </div>

      {/* Session count */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Coffee className="w-3.5 h-3.5" />
        <span>已完成 {sessions} 個番茄鐘</span>
        <div className="flex gap-1 ml-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(
              'w-2 h-2 rounded-full transition-all',
              i < (sessions % 4) ? 'bg-accent-blue' : 'bg-white/10'
            )} />
          ))}
        </div>
      </div>
    </div>
  )
}
