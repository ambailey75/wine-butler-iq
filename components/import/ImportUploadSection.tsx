'use client'

import { useCallback, useState, type ReactNode } from 'react'
import { ImportTypeSelector, type ImportTypeValue } from './ImportTypeSelector'
import { UploadCard } from './UploadCard'

interface ImportUploadSectionProps {
  cards: {
    title: string
    description: string
    icon: ReactNode
    accept: Record<string, string[]>
    sourceHint?: 'invoice' | 'label'
  }[]
}

export function ImportUploadSection({ cards }: ImportUploadSectionProps) {
  const [importType, setImportType] = useState<ImportTypeValue | null>(null)
  const [historicalDate, setHistoricalDate] = useState(() => new Date().toISOString().split('T')[0])

  const handleDateChange = useCallback((date: string) => {
    setHistoricalDate(date)
  }, [])

  return (
    <div className="space-y-5">
      <ImportTypeSelector
        importType={importType}
        onSelect={setImportType}
        historicalDate={historicalDate}
        onDateChange={handleDateChange}
      />
      {importType && (
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <UploadCard
              key={card.title}
              {...card}
              importType={importType}
              historicalConsumedDate={
                importType === 'HISTORICAL_CONSUMED' ? historicalDate : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
