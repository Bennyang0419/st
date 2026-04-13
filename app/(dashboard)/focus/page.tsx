'use client'

import { useState } from 'react'
import { Timer, Music, Volume2, VolumeX } from 'lucide-react'
import PomodoroTimer from '@/components/ui/PomodoroTimer'

const AMBIENT_SOUNDS = [
  { id: 'rain',   label: '雨聲',   emoji: '🌧️', url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3' },
  { id: 'forest', label: '森林鳥鳴', emoji: '🌲', url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3' },
  { id: 'waves',  label: '海浪聲',  emoji: '🌊', url: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3' },
]

export default function FocusPage() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [audio,   setAudio]   = useState<HTMLAudioElement | null>(null)

  const toggleSound = (id: string, url: string) => {
    if (playing === id) {
      audio?.pause()
      setAudio(null)
      setPlaying(null)
      return
    }
    audio?.pause()
    const a = new Audio(url)
    a.loop = true
    a.volume = 0.4
    a.play().catch(() => {})
    setAudio(a)
    setPlaying(id)
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <Timer className="w-5 h-5 text-accent-teal" />
          沉浸式專注模式
        </h1>
        <p className="text-sm text-gray-500 mt-1">番茄工作法 · 環境音效 · 呼吸引導</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pomodoro Timer */}
        <PomodoroTimer />

        {/* Ambient sounds */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
            <Music className="w-4 h-4 text-accent-indigo" />
            環境音效
          </h3>
          <div className="space-y-2">
            {AMBIENT_SOUNDS.map(s => (
              <button
                key={s.id}
                onClick={() => toggleSound(s.id, s.url)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border
                            transition-all duration-200 text-sm ${
                  playing === s.id
                    ? 'border-accent-indigo/40 bg-accent-indigo/10 text-accent-indigo'
                    : 'border-white/[0.06] hover:border-white/[0.15] text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="flex-1 text-left">{s.label}</span>
                {playing === s.id
                  ? <Volume2 className="w-4 h-4" />
                  : <VolumeX className="w-4 h-4 opacity-30" />
                }
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-600 mt-4 text-center">音量預設 40%，舒適聆聽</p>
        </div>
      </div>

      {/* Breathing guide */}
      <div className="glass-card p-10 text-center">
        <p className="text-sm font-medium text-gray-300 mb-2">呼吸引導</p>
        <p className="text-xs text-gray-500 mb-8">感到壓力時，跟著節奏緩緩呼吸</p>
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-28 h-28">
            <span className="absolute inset-0 rounded-full bg-accent-teal/8 animate-breathe" />
            <span className="absolute inset-3 rounded-full bg-accent-teal/15 animate-breathe"
              style={{ animationDelay: '0.3s' }} />
            <span className="absolute inset-6 rounded-full bg-accent-teal/25 animate-breathe"
              style={{ animationDelay: '0.6s' }} />
            <span className="absolute inset-[38px] rounded-full bg-accent-teal/50 animate-breathe"
              style={{ animationDelay: '0.9s' }} />
          </div>
        </div>
        <div className="flex justify-center gap-8 text-xs text-gray-500">
          <div className="text-center">
            <p className="text-lg font-mono text-accent-teal">4s</p>
            <p>吸氣</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono text-accent-indigo">4s</p>
            <p>屏息</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono text-accent-blue">4s</p>
            <p>呼氣</p>
          </div>
        </div>
      </div>
    </div>
  )
}
