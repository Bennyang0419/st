import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { chunkText, createEmbeddings } from '@/lib/ai/embeddings'

export const runtime = 'nodejs'

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text
  }

  if (
    file.name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  // Plain text / markdown
  return buffer.toString('utf-8')
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

    const supabase = createServiceClient()

    // Extract text content
    const content = await extractText(file)
    if (!content.trim()) {
      return Response.json({ error: 'Could not extract text from file' }, { status: 422 })
    }

    // Determine type
    const type = file.name.endsWith('.pdf') ? 'pdf'
               : file.name.match(/\.(md|markdown)$/i) ? 'markdown'
               : 'text'

    // Upload original file to Supabase Storage
    let storagePath: string | undefined
    try {
      const path = `documents/${Date.now()}_${file.name}`
      const { error } = await supabase.storage
        .from('documents')
        .upload(path, file, { contentType: file.type || 'application/octet-stream' })
      if (!error) storagePath = path
    } catch {}

    // Insert document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        type,
        size: file.size,
        storage_path: storagePath,
        content: content.slice(0, 50_000), // store first 50k chars for preview
      })
      .select()
      .single()

    if (docError) throw new Error(docError.message)

    // Chunk the text
    const chunks = chunkText(content, 400, 40)

    // Create embeddings in batches
    const batchSize = 10
    let chunksCreated = 0

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      const embeddings = await createEmbeddings(batch)

      const rows = batch.map((c, j) => ({
        document_id: document.id,
        content: c,
        embedding: embeddings[j],
        chunk_index: i + j,
      }))

      const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert(rows)

      if (!chunkError) chunksCreated += batch.length
    }

    return Response.json({ document, chunksCreated })
  } catch (err: any) {
    console.error('Upload error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
