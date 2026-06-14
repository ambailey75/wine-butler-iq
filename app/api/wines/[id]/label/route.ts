import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { createAdminClient } from '@/lib/supabase/admin'

const LABELS_BUCKET = 'labels'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const wine = await prisma.wine.findFirst({ where: { id: params.id, userId: user.id } })
  if (!wine) {
    return NextResponse.json({ error: 'Wine not found' }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image must be smaller than 5MB' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}/${wine.id}-${Date.now()}.${ext}`

  let { error: uploadError } = await supabase.storage.from(LABELS_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  })

  if (uploadError && /bucket not found/i.test(uploadError.message)) {
    await supabase.storage.createBucket(LABELS_BUCKET, { public: true })
    uploadError = (
      await supabase.storage.from(LABELS_BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: true,
      })
    ).error
  }

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabase.storage.from(LABELS_BUCKET).getPublicUrl(path)

  await prisma.wine.update({
    where: { id: wine.id },
    data: { labelPhotoUrl: data.publicUrl },
  })

  revalidatePath(`/dashboard/cellar/${wine.id}`)

  return NextResponse.json({ labelPhotoUrl: data.publicUrl })
}
