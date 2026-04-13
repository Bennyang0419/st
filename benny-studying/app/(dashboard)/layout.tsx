'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/ui/Sidebar'
import BreathingOrb from '@/components/ui/BreathingOrb'
import { getTimeOfDay, getAuroraClass } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay())

  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const auroraClass = getAuroraClass(timeOfDay)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 relative">
      {/* Dynamic aurora background */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-[10s] ${auroraClass}`}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="min-h-full p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Breathing orb (bottom-right corner) */}
      <BreathingOrb />
    </div>
  )
}
