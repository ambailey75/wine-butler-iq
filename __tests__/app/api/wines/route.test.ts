import { GET, POST } from '@/app/api/wines/route'

jest.mock('@/lib/auth/current-user', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/wines/queries', () => ({
  listWines: jest.fn(),
  serializeWines: jest.fn((wines: unknown[]) => wines),
}))

jest.mock('@/lib/wines/actions', () => ({
  createWine: jest.fn(),
}))

jest.mock('@/lib/wines/schema', () => {
  const { z } = jest.requireActual('zod')
  return {
    wineFormSchema: z.object({
      producer: z.string().min(1),
      wineName: z.string().min(1),
      quantity: z.number().int().min(0),
      vintage: z.number().optional(),
    }),
  }
})

const { getCurrentUser } = jest.requireMock('@/lib/auth/current-user') as {
  getCurrentUser: jest.Mock
}
const { listWines } = jest.requireMock('@/lib/wines/queries') as {
  listWines: jest.Mock
}
const { createWine } = jest.requireMock('@/lib/wines/actions') as {
  createWine: jest.Mock
}

const mockUser = { id: 'user-123', email: 'test@example.com' }

describe('GET /api/wines', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    getCurrentUser.mockResolvedValue(null)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns wines belonging to the authenticated user', async () => {
    const wines = [
      { id: 'w1', producer: 'Opus One', wineName: 'Opus One', vintage: 2019 },
      { id: 'w2', producer: 'Caymus', wineName: 'Special Selection', vintage: 2018 },
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    listWines.mockResolvedValue(wines)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(listWines).toHaveBeenCalledWith('user-123')
    expect(body).toHaveLength(2)
    expect(body[0].producer).toBe('Opus One')
  })
})

describe('POST /api/wines', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    getCurrentUser.mockResolvedValue(null)

    const request = new Request('http://localhost/api/wines', {
      method: 'POST',
      body: JSON.stringify({ producer: 'Test', wineName: 'Wine', quantity: 1 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('creates wine with valid data and returns 201', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    createWine.mockResolvedValue({ id: 'new-wine-1' })

    const request = new Request('http://localhost/api/wines', {
      method: 'POST',
      body: JSON.stringify({ producer: 'Screaming Eagle', wineName: 'Cabernet Sauvignon', quantity: 2, vintage: 2019 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.id).toBe('new-wine-1')
    expect(createWine).toHaveBeenCalledWith(
      expect.objectContaining({ producer: 'Screaming Eagle', wineName: 'Cabernet Sauvignon' })
    )
  })

  it('returns 400 for missing required fields', async () => {
    getCurrentUser.mockResolvedValue(mockUser)

    const request = new Request('http://localhost/api/wines', {
      method: 'POST',
      body: JSON.stringify({ quantity: 1 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid field types', async () => {
    getCurrentUser.mockResolvedValue(mockUser)

    const request = new Request('http://localhost/api/wines', {
      method: 'POST',
      body: JSON.stringify({ producer: 'Test', wineName: 'Wine', quantity: -5 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})
