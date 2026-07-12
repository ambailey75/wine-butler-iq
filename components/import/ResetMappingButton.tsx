'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

interface ResetMappingButtonProps {
  importId: string
}

export function ResetMappingButton({ importId }: ResetMappingButtonProps) {
  const router = useRouter()
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReset() {
    setResetting(true)
    setError(null)
    try {
      const res = await fetch(`/api/import/${importId}/reset`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Could not reset mapping')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset mapping')
      setResetting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleReset}
        disabled={resetting}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
      >
        {resetting ? 'Resetting…' : 'Wrong mapping? Reset and remap'}
        <ArrowRight className="h-3 w-3" />
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
