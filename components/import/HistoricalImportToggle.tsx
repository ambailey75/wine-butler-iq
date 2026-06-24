'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface HistoricalImportToggleProps {
  onChange: (isHistorical: boolean, date: string) => void
}

export function HistoricalImportToggle({ onChange }: HistoricalImportToggleProps) {
  const [enabled, setEnabled] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  function handleToggle() {
    const next = !enabled
    setEnabled(next)
    onChange(next, date)
  }

  function handleDateChange(value: string) {
    setDate(value)
    onChange(enabled, value)
  }

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <Label className="cursor-pointer text-sm font-medium text-foreground" onClick={handleToggle}>
          This is a historical / already consumed collection
        </Label>
      </div>
      {enabled && (
        <div className="mt-3 ml-14 space-y-1">
          <Label htmlFor="historical-date" className="text-xs text-muted-foreground">
            Date consumed (approximate)
          </Label>
          <Input
            id="historical-date"
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-48"
          />
          <p className="text-xs text-muted-foreground">
            All wines in this import will be marked as consumed and added to your drinking history
          </p>
        </div>
      )}
    </div>
  )
}
