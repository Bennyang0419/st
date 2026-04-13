// ─── Database Types ───────────────────────────────────────────────────────────

export interface Document {
  id: string
  user_id: string
  name: string
  type: 'pdf' | 'markdown' | 'text'
  size: number
  storage_path?: string
  content?: string
  created_at: string
  updated_at: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  content: string
  chunk_index: number
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  category?: string
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  mode: 'general' | 'document'
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface Quiz {
  id: string
  user_id: string
  title: string
  document_id?: string
  topic?: string
  created_at: string
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_idx: number
  explanation?: string
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  question_id: string
  selected_idx: number
  is_correct: boolean
  created_at: string
}

export interface LearningStats {
  id: string
  user_id: string
  topic: string
  mastery_score: number
  questions_asked: number
  correct_answers: number
  updated_at: string
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ChatRequest {
  message: string
  sessionId?: string
  mode: 'general' | 'document'
  documentIds?: string[]
}

export interface ChatResponse {
  content: string
  sessionId: string
}

export interface UploadResponse {
  document: Document
  chunksCreated: number
}

export interface QuizGenerateRequest {
  topic?: string
  documentId?: string
  count?: number
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export interface PomodoroState {
  isRunning: boolean
  mode: 'work' | 'short-break' | 'long-break'
  timeLeft: number
  sessionsCompleted: number
}

export interface ErrorBookEntry {
  attempt: QuizAttempt
  question: QuizQuestion
  document?: Document
}
