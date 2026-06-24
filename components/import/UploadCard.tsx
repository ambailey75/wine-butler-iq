'use client'

import { useCallback, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface UploadCardProps {
  title: string
  description: string
  icon: ReactNode
  accept: Record<string, string[]>
  sourceHint?: 'invoice' | 'label'
  isHistoricalImport?: boolean
  historicalConsumedDate?: string
}

export function UploadCard({ title, description, icon, accept, sourceHint, isHistoricalImport, historicalConsumedDate }: UploadCardProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      if (sourceHint) formData.append('sourceHint', sourceHint)
      if (isHistoricalImport) {
        formData.append('isHistoricalImport', 'true')
        if (historicalConsumedDate) formData.append('historicalConsumedDate', historicalConsumedDate)
      }

      try {
        const res = await fetch('/api/import/upload', { method: 'POST', body: formData })
        const body = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(body?.error || 'Upload failed')
        }

        const params = new URLSearchParams()
        if (body.mappingSuggestion) {
          params.set('mapping', JSON.stringify(body.mappingSuggestion))
        }
        if (body.regionSplitColumns && Object.keys(body.regionSplitColumns).length > 0) {
          params.set('regionSplits', JSON.stringify(body.regionSplitColumns))
        }
        if (body.countryStateSplitColumns && Object.keys(body.countryStateSplitColumns).length > 0) {
          params.set('countryStateSplits', JSON.stringify(body.countryStateSplitColumns))
        }
        const query = params.toString() ? `?${params.toString()}` : ''
        router.push(`/dashboard/import/${body.id}${query}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        setUploading(false)
      }
    },
    [router, sourceHint, isHistoricalImport, historicalConsumedDate]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'cursor-pointer border-dashed text-center transition-colors hover:border-primary/50',
        isDragActive && 'border-primary bg-primary/5',
        uploading && 'cursor-default opacity-80'
      )}
    >
      <input {...getInputProps()} />
      <CardHeader className="items-center">
        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : icon}
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {uploading ? 'Uploading and processing...' : 'Drag & drop a file or click to browse'}
        {error && <p className="mt-2 text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
