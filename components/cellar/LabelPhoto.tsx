'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LabelPhotoProps {
  src: string | null
  alt: string
  initial: string
}

export function LabelPhoto({ src, alt, initial }: LabelPhotoProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-wine-burgundy text-4xl font-semibold text-white">
        {initial}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border" style={{ width: 200 }}>
      <Image
        src={src}
        alt={alt}
        width={200}
        height={200}
        className="h-auto w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
