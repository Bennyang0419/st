'use client'

import { useCallback, useState } from 'react'
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onUploadComplete: () => void
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')

  const upload = useCallback(async (file: File) => {
    const allowed = ['application/pdf', 'text/plain', 'text/markdown', 'text/x-markdown']
    const extAllowed = file.name.match(/\.(pdf|txt|md|markdown)$/i)
    if (!allowed.includes(file.type) && !extAllowed) {
      toast.error('僅支援 PDF、TXT、Markdown 格式')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('檔案大小不得超過 10MB')
      return
    }

    setUploading(true)
    setProgress('正在上傳檔案...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      setProgress('解析文件內容...')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '上傳失敗')
      }

      const data = await res.json()
      setProgress('建立向量索引...')
      await new Promise(r => setTimeout(r, 600))

      toast.success(`✅ 已上傳「${file.name}」，建立了 ${data.chunksCreated} 個知識片段`)
      onUploadComplete()
    } catch (err: any) {
      toast.error(err.message || '上傳失敗，請重試')
    } finally {
      setUploading(false)
      setProgress('')
    }
  }, [onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [upload])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }, [upload])

  return (
    <label
      className={cn(
        'block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center',
        'transition-all duration-300',
        dragging
          ? 'border-accent-blue/60 bg-accent-blue/5'
          : 'border-white/[0.10] hover:border-white/[0.20] hover:bg-white/[0.02]',
        uploading && 'pointer-events-none'
      )}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input type="file" className="hidden" accept=".pdf,.txt,.md,.markdown" onChange={handleChange} />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
          <p className="text-sm text-accent-blue">{progress}</p>
          <p className="text-xs text-gray-500">正在處理中，請稍候...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 border border-accent-blue/20
                          flex items-center justify-center">
            <Upload className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">拖曳檔案至此，或點擊上傳</p>
            <p className="text-xs text-gray-500 mt-1">支援 PDF · Markdown · TXT，最大 10MB</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {['PDF', 'MD', 'TXT'].map(ext => (
              <span key={ext} className="tag">
                <FileText className="w-2.5 h-2.5 mr-1" />{ext}
              </span>
            ))}
          </div>
        </div>
      )}
    </label>
  )
}
