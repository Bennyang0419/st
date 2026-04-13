import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateQuizQuestions } from '@/lib/ai/anthropic'
import { retrieveRelevantChunks } from '@/lib/ai/rag'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { topic, documentId, count = 5 } = await req.json()
    const supabase = createServiceClient()

    // Get context from document if specified
    let context = ''
    let docName = ''

    if (documentId) {
      const { data: doc } = await supabase
        .from('documents')
        .select('name, content')
        .eq('id', documentId)
        .single()

      if (doc) {
        docName = doc.name
        // Try vector search first, fallback to content
        try {
          const queryText = topic || `summary of ${doc.name}`
          const chunks = await retrieveRelevantChunks(queryText, [documentId], 8)
          context = chunks.map(c => c.content).join('\n\n')
        } catch {
          context = doc.content?.slice(0, 4000) || ''
        }
      }
    }

    const finalTopic = topic || docName || 'General Knowledge'
    const questions = await generateQuizQuestions(finalTopic, context, count)

    // Save quiz to database
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: `${finalTopic} 測驗`,
        document_id: documentId || null,
        topic: finalTopic,
      })
      .select()
      .single()

    if (quizError) throw new Error(quizError.message)

    // Save questions
    const { data: savedQuestions, error: qError } = await supabase
      .from('quiz_questions')
      .insert(questions.map(q => ({ ...q, quiz_id: quiz.id })))
      .select()

    if (qError) throw new Error(qError.message)

    return Response.json({ quiz, questions: savedQuestions })
  } catch (err: any) {
    console.error('Quiz generation error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// Record attempt
export async function PATCH(req: NextRequest) {
  try {
    const { questionId, selectedIdx, isCorrect } = await req.json()
    const supabase = createServiceClient()

    await supabase.from('quiz_attempts').insert({
      question_id:  questionId,
      selected_idx: selectedIdx,
      is_correct:   isCorrect,
    })

    // Update learning stats
    const { data: question } = await supabase
      .from('quiz_questions')
      .select('quiz_id, quizzes(topic)')
      .eq('id', questionId)
      .single()

    const topic = (question as any)?.quizzes?.topic
    if (topic) {
      await supabase.rpc('update_learning_stats', {
        p_topic:      topic,
        p_is_correct: isCorrect,
      }).catch(() => {
        // Fallback upsert
        return supabase.from('learning_stats').upsert({
          topic,
          questions_asked:  1,
          correct_answers:  isCorrect ? 1 : 0,
          mastery_score:    isCorrect ? 0.5 : 0,
        }, { onConflict: 'user_id,topic', ignoreDuplicates: false })
      })
    }

    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// Get error book
export async function GET() {
  const supabase = createServiceClient()

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quiz_questions (
        *,
        quizzes ( document_id, topic )
      )
    `)
    .eq('is_correct', false)
    .order('created_at', { ascending: false })
    .limit(50)

  return Response.json({ attempts: attempts || [] })
}
