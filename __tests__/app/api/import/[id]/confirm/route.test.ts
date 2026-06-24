import { POST } from '@/app/api/import/[id]/confirm/route'

jest.mock('@/lib/auth/current-user', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('@/lib/import/queries', () => ({
  getImport: jest.fn(),
}))

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        download: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
      })),
    },
  })),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockCreateMany = jest.fn()
const mockFindMany = jest.fn()
const mockImportRowUpdate = jest.fn()
const mockImportUpdate = jest.fn()

jest.mock('@/lib/prisma/client', () => ({
  prisma: {
    wine: {
      createMany: (...args: unknown[]) => mockCreateMany(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    importRow: {
      update: (...args: unknown[]) => mockImportRowUpdate(...args),
    },
    import: {
      update: (...args: unknown[]) => mockImportUpdate(...args),
    },
  },
}))

const { getCurrentUser } = jest.requireMock('@/lib/auth/current-user') as {
  getCurrentUser: jest.Mock
}
const { getImport } = jest.requireMock('@/lib/import/queries') as {
  getImport: jest.Mock
}

const mockUser = { id: 'user-123', email: 'test@example.com' }

function makeParams(id: string) {
  return { params: { id } }
}

function makeRow(
  id: string,
  status: string,
  mappedData: Record<string, unknown>
) {
  return { id, status, mappedData }
}

function makeImportRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'import-1',
    userId: 'user-123',
    status: 'REVIEW',
    sourceType: 'EXCEL',
    storagePath: 'user-123/file.xlsx',
    rows: [],
    ...overrides,
  }
}

async function readStream(response: Response): Promise<unknown[]> {
  const text = await response.text()
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line))
}

describe('POST /api/import/[id]/confirm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateMany.mockResolvedValue({ count: 0 })
    mockFindMany.mockResolvedValue([])
    mockImportRowUpdate.mockResolvedValue({})
    mockImportUpdate.mockResolvedValue({})
  })

  it('returns 401 when not authenticated', async () => {
    getCurrentUser.mockResolvedValue(null)

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))

    expect(response.status).toBe(401)
  })

  it('returns 404 when import does not belong to user', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(null)

    const response = await POST(new Request('http://localhost'), makeParams('import-other'))

    expect(response.status).toBe(404)
  })

  it('returns 400 when import status is not REVIEW', async () => {
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ status: 'COMPLETE' }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/not ready/)
  })

  it('creates Wine records for all included rows and sets status to CONFIRMED', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { producer: 'Opus One', wineName: 'Opus One', vintage: 2019 }),
      makeRow('row-2', 'PENDING', { producer: 'Caymus', wineName: 'Special Selection', vintage: 2018 }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))
    mockCreateMany.mockResolvedValue({ count: 2 })
    mockFindMany.mockResolvedValue([
      { id: 'wine-1', producer: 'Opus One', wineName: 'Opus One', vintage: 2019 },
      { id: 'wine-2', producer: 'Caymus', wineName: 'Special Selection', vintage: 2018 },
    ])

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    expect(mockCreateMany).toHaveBeenCalledTimes(1)
    expect(mockCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ producer: 'Opus One', userId: 'user-123' }),
        expect.objectContaining({ producer: 'Caymus', userId: 'user-123' }),
      ]),
    })

    expect(mockImportRowUpdate).toHaveBeenCalledTimes(2)
    expect(mockImportRowUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'row-1' },
        data: expect.objectContaining({ status: 'CONFIRMED' }),
      })
    )

    expect(events).toContainEqual(
      expect.objectContaining({ type: 'complete', imported: 2 })
    )

    expect(mockImportUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'import-1' },
        data: expect.objectContaining({ status: 'COMPLETE', recordCount: 2 }),
      })
    )
  })

  it('skips SKIPPED rows and does not create Wine records for them', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { producer: 'Opus One', wineName: 'Opus One', vintage: 2019 }),
      makeRow('row-2', 'SKIPPED', { producer: 'Bad Data', wineName: 'Skip Me' }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))
    mockCreateMany.mockResolvedValue({ count: 1 })
    mockFindMany.mockResolvedValue([
      { id: 'wine-1', producer: 'Opus One', wineName: 'Opus One', vintage: 2019 },
    ])

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ producer: 'Opus One' })],
    })
    expect(mockCreateMany).not.toHaveBeenCalledWith({
      data: expect.arrayContaining([expect.objectContaining({ producer: 'Bad Data' })]),
    })

    expect(events).toContainEqual(
      expect.objectContaining({ type: 'complete', imported: 1 })
    )

    expect(mockImportUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ recordCount: 1, skippedCount: 1 }),
      })
    )
  })

  it('does not create Wine when all rows are skipped (duplicate set to skip)', async () => {
    const rows = [
      makeRow('row-1', 'SKIPPED', { producer: 'Opus One', wineName: 'Opus One', vintage: 2019 }),
      makeRow('row-2', 'SKIPPED', { producer: 'Caymus', wineName: 'Special Selection' }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/No rows selected/)
    expect(mockCreateMany).not.toHaveBeenCalled()
  })

  it('marks import as FAILED and streams error when createMany throws', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { producer: 'Opus One', wineName: 'Opus One' }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))
    mockCreateMany.mockRejectedValue(new Error('Database connection lost'))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    expect(events).toContainEqual(
      expect.objectContaining({ type: 'error', error: 'Database connection lost' })
    )

    expect(mockImportUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED', errorMessage: 'Database connection lost' }),
      })
    )

    expect(mockImportRowUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CONFIRMED' }),
      })
    )
  })

  it('returns 400 when rows are missing required producer or wineName', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { wineName: 'No Producer' }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/missing a producer or wine name/)
    expect(body.rowIds).toContain('row-1')
    expect(mockCreateMany).not.toHaveBeenCalled()
  })
})
