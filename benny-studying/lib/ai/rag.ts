import { createServiceClient } from '@/lib/supabase/server'
import { createEmbedding } from './embeddings'
import { DOCUMENT_SYSTEM_PROMPT } from './anthropic'

export interface RetrievedChunk {
  id: string
  document_id: string
  content: string
  similarity: number
  document_name?: string
}

/**
 * Retrieve relevant chunks from the vector database for a query
 */
export async function retrieveRelevantChunks(
  query: string,
  documentIds?: string[],
  limit: number = 6
): Promise<RetrievedChunk[]> {
  const supabase = createServiceClient()

  // Create query embedding
  const queryEmbedding = await createEmbedding(query)

  // Search for similar chunks
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: limit,
  })

  if (error) throw new Error(`Vector search failed: ${error.message}`)

  let chunks = (data || []) as RetrievedChunk[]

  // Filter by document IDs if specified
  if (documentIds?.length) {
    chunks = chunks.filter(c => documentIds.includes(c.document_id))
  }

  // Enrich with document names
  if (chunks.length > 0) {
    const docIds = [...new Set(chunks.map(c => c.document_id))]
    const { data: docs } = await supabase
      .from('documents')
      .select('id, name')
      .in('id', docIds)

    const docMap = new Map(docs?.map(d => [d.id, d.name]) || [])
    chunks = chunks.map(c => ({ ...c, document_name: docMap.get(c.document_id) }))
  }

  return chunks
}

/**
 * Build augmented system prompt with retrieved context
 */
export function buildRAGSystemPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return DOCUMENT_SYSTEM_PROMPT + '\n\nNo relevant document content was found for this query.'
  }

  const context = chunks
    .map(c => `[From: ${c.document_name || 'Unknown Document'}]\n${c.content}`)
    .join('\n\n---\n\n')

  return `${DOCUMENT_SYSTEM_PROMPT}

## Retrieved Document Excerpts:
${context}

Use these excerpts to answer the user's question. Always mention which document you're citing.`
}
