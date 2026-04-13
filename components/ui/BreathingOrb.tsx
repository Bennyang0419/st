'use client'

import { useState } from 'react'

export default function BreathingOrb() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      {expanded && (
        <div className="glass-card px-3 py-2 text-center animate-fade-in">
          <p className="text-[11px] text-gray-400">跟著節奏呼吸</p>
          <p className="text-[10px] text-gray-600">吸氣 4 秒・屏息 4 秒・呼氣 4 秒</p>
        </div>
      )}
      <button
        onClick={() => setExpanded(e => !e)}
        className="relative w-12 h-12 rounded-full focus:outline-none group"
        title="呼吸引導"
      >
        {/* Outer pulse ring */}
        <span className="absolute inset-0 rounded-full bg-accent-teal/10 animate-breathe" />
        {/* Inner orb */}
        <span className="absolute inset-2 rounded-full bg-gradient-to-br from-accent-teal/40 to-accent-blue/40
                          border border-accent-teal/30 animate-breathe"
          style={{ animationDelay: '0.2s' }}
        />
        {/* Core dot */}
        <span className="absolute inset-[14px] rounded-full bg-accent-teal/60 animate-breathe"
          style={{ animationDelay: '0.4s' }}
        />
      </button>
    </div>
  )
}
