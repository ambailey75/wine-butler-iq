'use client'

import { useCallback, useState, type ReactNode } from 'react'
import { HistoricalImportToggle } from './HistoricalImportToggle'
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
  const [historicalState, setHistoricalState] = useState({ isHistorical: false, date: '' })

  const handleToggle = useCallback((isHistorical: boolean, date: string) => {
    setHistoricalState({ isHistorical, date })
  }, [])

  return (
    <div className="space-y-4">
      <HistoricalImportToggle onChange={handleToggle} />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <UploadCard
            key={card.title}
            {...card}
            isHistoricalImport={historicalState.isHistorical}
            historicalConsumedDate={historicalState.isHistorical ? historicalState.date : undefined}
          />
        ))}
      </div>
    </div>
  )
}
