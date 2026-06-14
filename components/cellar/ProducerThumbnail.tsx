'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Wine } from 'lucide-react'
import { vivinoProducerLogoUrl } from '@/lib/wines/vivinoImage'

interface ProducerThumbnailProps {
  producer: string
  size?: number
}

export function ProducerThumbnail({ producer, size = 32 }: ProducerThumbnailProps) {
  const logoUrl = vivinoProducerLogoUrl(producer)
  const [failed, setFailed] = useState(!logoUrl)

  if (!logoUrl || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded bg-wine-burgundy/10"
        style={{ width: size, height: size }}
      >
        <Wine className="h-1/2 w-1/2 text-wine-burgundy" />
      </div>
    )
  }

  return (
    <div className="shrink-0 overflow-hidden rounded" style={{ width: size, height: size }}>
      <Image
        src={logoUrl}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  )
}
