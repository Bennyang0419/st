import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ documents: data })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 })

  const supabase = createServiceClient()

  // Delete storage file if exists
  const { data: doc } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (doc?.storage_path) {
    await supabase.storage.from('documents').remove([doc.storage_path])
  }

  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
