import { GET, PUT, PATCH, DELETE } from '@/app/api/wines/[id]/route'

jest.mock('@/lib/auth/current-user', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/wines/queries', () => ({
  getWine: jest.fn(),
  serializeWine: jest.fn((w: unknown) => w),
}))

jest.mock('@/lib/wines/actions', () => ({
  updateWine: jest.fn(),
  deleteWine: jest.fn(),
}))

jest.mock('@/lib/prisma/client', () => ({
  prisma: {
    wine: { update: jest.fn() },
  },
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/wines/schema', () => {
  const { z } = jest.requireActual('zod')
  return {
    wineFormSchema: z.object({
      producer: z.string().min(1),
      wineName: z.string().min(1),
      quantity: z.number().int().min(0),
      vintage: z.number().optional(),
      region: z.string().optional(),
      varietal: z.string().optional(),
    }),
  }
})

const { getCurrentUser } = jest.requireMock('@/lib/auth/current-user') as {
  getCurrentUser: jest.Mock
}
const { getWine } = jest.requireMock('@/lib/wines/queries') as {
  getWine: jest.Mock
}
const { updateWine, deleteWine } = jest.requireMock('@/lib/wines/actions') as {
  updateWine: jest.Mock
  deleteWine: jest.Mock
}
const { prisma } = jest.requireMock('@/lib/prisma/client') as {
  prisma: { wine: { update: jest.Mock } }
}

const mockUser = { id: 'user-123', email: 'test@example.com' }
const mockWine = {
  id: 'wine-1',
  userId: 'user-123',
  producer: 'Opus One',
  wineName: 'Opus One',
  vintage: 2019,
  region: 'Napa Valley',
  varietal: 'Bordeaux Blend',
  quantity: 6,
  storageLocation: 'Cellar A',
}

function makeParams(id: string) {
  return { params: { id } }
}

describe('GET /api/wines/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    getCurrentUser.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost'), makeParams('wine-1'))

    expect(response.status).toBe(401)
  })

  it('returns wine when it belongs to the authenticated user', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(mockWine)

    const response = await GET(new Request('http://localhost'), makeParams('wine-1'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(getWine).toHaveBeenCalledWith('user-123', 'wine-1')
    expect(body.producer).toBe('Opus One')
    expect(body.vintage).toBe(2019)
  })

  it('returns 404 when wineId belongs to a different user', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost'), makeParams('wine-other-user'))
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Not found')
  })

  it('returns 404 for nonexistent wineId', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost'), makeParams('nonexistent'))

    expect(response.status).toBe(404)
  })
})

describe('PUT /api/wines/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    getCurrentUser.mockResolvedValue(null)

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ producer: 'Test', wineName: 'Wine', quantity: 1 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PUT(request, makeParams('wine-1'))

    expect(response.status).toBe(401)
  })

  it('returns 404 when wine does not belong to user', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(null)

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ producer: 'Test', wineName: 'Wine', quantity: 1 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PUT(request, makeParams('wine-other'))

    expect(response.status).toBe(404)
  })

  it('updates wine with valid full payload', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(mockWine)
    updateWine.mockResolvedValue({ id: 'wine-1' })

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({
        producer: 'Opus One',
        wineName: 'Opus One',
        quantity: 12,
        vintage: 2020,
        region: 'Napa Valley',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PUT(request, makeParams('wine-1'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.id).toBe('wine-1')
    expect(updateWine).toHaveBeenCalledWith(
      'wine-1',
      expect.objectContaining({ quantity: 12, vintage: 2020 })
    )
  })

  it('returns 400 for invalid payload', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(mockWine)

    const request = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({ quantity: 1 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PUT(request, makeParams('wine-1'))

    expect(response.status).toBe(400)
  })
})

describe('PATCH /api/wines/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates only provided fields, leaves others unchanged', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(mockWine)
    prisma.wine.update.mockResolvedValue({ ...mockWine, quantity: 3, region: 'Sonoma' })

    const request = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ quantity: 3, region: 'Sonoma' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PATCH(request, makeParams('wine-1'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.wine.update).toHaveBeenCalledWith({
      where: { id: 'wine-1' },
      data: { quantity: 3, region: 'Sonoma' },
    })
    expect(body.producer).toBe('Opus One')
    expect(body.quantity).toBe(3)
    expect(body.region).toBe('Sonoma')
  })

  it('allows setting a field to null', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(mockWine)
    prisma.wine.update.mockResolvedValue({ ...mockWine, storageLocation: null })

    const request = new Request('http://localhost', {
      method: 'PATCH',
      body: JSON.stringify({ storageLocation: null }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PATCH(request, makeParams('wine-1'))

    expect(response.status).toBe(200)
    expect(prisma.wine.update).toHaveBeenCalledWith({
      where: { id: 'wine-1' },
      data: { storageLocation: null },
    })
  })
})

describe('DELETE /api/wines/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    getCurrentUser.mockResolvedValue(null)

    const response = await DELETE(new Request('http://localhost'), makeParams('wine-1'))

    expect(response.status).toBe(401)
  })

  it('returns 404 when wine does not belong to user', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(null)

    const response = await DELETE(new Request('http://localhost'), makeParams('wine-other'))

    expect(response.status).toBe(404)
  })

  it('deletes wine and returns success', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getWine.mockResolvedValue(mockWine)
    deleteWine.mockResolvedValue(undefined)

    const response = await DELETE(new Request('http://localhost'), makeParams('wine-1'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(deleteWine).toHaveBeenCalledWith('wine-1')
  })
})
