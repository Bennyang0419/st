import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TimeOfDay } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

export function getAuroraClass(timeOfDay: TimeOfDay): string {
  const map: Record<TimeOfDay, string> = {
    morning:   'bg-aurora-morning',
    afternoon: 'bg-aurora-afternoon',
    evening:   'bg-aurora-evening',
    night:     'bg-aurora-night',
  }
  return map[timeOfDay]
}

export function getGreeting(timeOfDay: TimeOfDay): string {
  const map: Record<TimeOfDay, string> = {
    morning:   '早安，準備好開始學習了嗎？',
    afternoon: '午後時光，保持專注。',
    evening:   '傍晚好，繼續今天的進度。',
    night:     '夜深了，記得適時休息。',
  }
  return map[timeOfDay]
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
