import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { streamChatCompletion, SYSTEM_PROMPT } from '@/lib/ai/anthropic'
import { retrieveRelevantChunks, buildRAGSystemPrompt } from '@/lib/ai/rag'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, mode, documentIds } = await req.json()
    if (!message?.trim()) {
      return Response.json({ error: 'Message required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get or create session
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data } = await supabase
        .from('chat_sessions')
        .insert({ mode, title: message.slice(0, 50) })
        .select('id')
        .single()
      currentSessionId = data?.id
    }

    // Load message history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    const messages = [
      ...(history || []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ]

    // Build system prompt (RAG or general)
    let systemPrompt = SYSTEM_PROMPT
    if (mode === 'document') {
      const chunks = await retrieveRelevantChunks(message, documentIds, 6)
      systemPrompt = buildRAGSystemPrompt(chunks)
    }

    // Save user message
    await supabase.from('chat_messages').insert({
      session_id: currentSessionId,
      role: 'user',
      content: message,
    })

    // Stream response
    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send sessionId first
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ sessionId: currentSessionId })}\n\n`)
          )

          const anthropicStream = await streamChatCompletion(messages, systemPrompt)

          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text
              fullResponse += text
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              )
            }
          }

          // Save assistant message
          await supabase.from('chat_messages').insert({
            session_id: currentSessionId,
            role: 'assistant',
            content: fullResponse,
          })

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
