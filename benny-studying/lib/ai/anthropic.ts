import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const SYSTEM_PROMPT = `You are Benny's intelligent study assistant — calm, precise, and encouraging.
You help with learning by explaining concepts clearly, generating quizzes, and answering questions about uploaded documents.
Always respond in the same language the user writes in. Be concise but thorough.
When discussing study materials, cite the relevant sections when possible.`

export const DOCUMENT_SYSTEM_PROMPT = `You are Benny's intelligent study assistant with access to the user's uploaded documents.
Answer questions based ONLY on the provided document excerpts. If the answer isn't in the documents, say so clearly.
Always cite which document you're referencing. Be precise and educational.
Respond in the same language as the user.`

export async function streamChatCompletion(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string = SYSTEM_PROMPT
) {
  return anthropic.messages.stream({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  })
}

export async function generateQuizQuestions(
  topic: string,
  context: string,
  count: number = 5
): Promise<Array<{
  question: string
  options: string[]
  correct_idx: number
  explanation: string
}>> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: `Generate ${count} multiple-choice quiz questions about: "${topic}"

Context from study materials:
${context}

Return ONLY a valid JSON array with this exact format (no markdown, no extra text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_idx": 0,
    "explanation": "Brief explanation of why this is correct."
  }
]

Make questions progressively more challenging. Use the provided context when available.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Failed to parse quiz questions from AI response')

  return JSON.parse(jsonMatch[0])
}

export async function generateLearningAdvice(
  weakTopics: string[],
  stats: Array<{ topic: string; mastery_score: number }>
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 800,
    messages: [
      {
        role: 'user',
        content: `Based on this learning performance data, provide concise study advice (2-3 paragraphs max):

Weak areas (topics with most errors): ${weakTopics.join(', ')}

Mastery scores: ${JSON.stringify(stats)}

Give specific, actionable advice. Be encouraging but honest. Write in a supportive tutor tone.`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
