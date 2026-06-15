export interface ImagePayload {
  base64: string
  mimeType: string
}

export async function fileToBase64(file: File): Promise<ImagePayload> {
  const buffer = Buffer.from(await file.arrayBuffer())
  return { base64: buffer.toString('base64'), mimeType: file.type }
}
