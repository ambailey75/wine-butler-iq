export function vivinoProducerSlug(producer: string): string {
  return producer
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function vivinoProducerLogoUrl(producer: string): string | null {
  const slug = vivinoProducerSlug(producer)
  if (!slug) return null
  return `https://images.vivino.com/thumbs/${slug}/pb_x130.png`
}
