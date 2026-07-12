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

const mockCreate = jest.fn()
const mockWineUpdate = jest.fn()
const mockImportRowUpdate = jest.fn()
const mockImportUpdate = jest.fn()
const mockConsumptionLogCreate = jest.fn()

jest.mock('@/lib/prisma/client', () => ({
  prisma: {
    wine: {
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockWineUpdate(...args),
    },
    importRow: {
      update: (...args: unknown[]) => mockImportRowUpdate(...args),
    },
    import: {
      update: (...args: unknown[]) => mockImportUpdate(...args),
    },
    consumptionLog: {
      create: (...args: unknown[]) => mockConsumptionLogCreate(...args),
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

function overflowError() {
  return new Error('numeric field overflow (22003)')
}

async function readStream(response: Response): Promise<unknown[]> {
  const text = await response.text()
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line))
}

describe('POST /api/import/[id]/confirm', () => {
  let createIdCounter = 0

  beforeEach(() => {
    jest.clearAllMocks()
    createIdCounter = 0
    mockCreate.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: `wine-${++createIdCounter}`,
      ...data,
    }))
    mockWineUpdate.mockResolvedValue({})
    mockImportRowUpdate.mockResolvedValue({})
    mockImportUpdate.mockResolvedValue({})
    mockConsumptionLogCreate.mockResolvedValue({})
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

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ producer: 'Opus One', userId: 'user-123' }),
    })
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ producer: 'Caymus', userId: 'user-123' }),
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

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ producer: 'Opus One' }),
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
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('continues importing remaining rows when one row fails for a non-overflow reason, leaving it PENDING (never SKIPPED)', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { producer: 'Opus One', wineName: 'Opus One' }),
      makeRow('row-2', 'PENDING', { producer: 'Caymus', wineName: 'Special Selection' }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))
    mockCreate
      .mockImplementationOnce(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'wine-1', ...data }))
      .mockImplementationOnce(async () => {
        throw new Error('Connection reset')
      })

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    const complete = events.find((e) => (e as { type: string }).type === 'complete') as {
      imported: number
      skipped: number
      failed: number
      errors: Array<{ rowId: string; error: string }>
    }
    expect(complete.imported).toBe(1)
    expect(complete.skipped).toBe(0)
    expect(complete.failed).toBe(1)
    expect(complete.errors).toEqual([
      expect.objectContaining({ rowId: 'row-2', error: 'Connection reset' }),
    ])

    // A DB-error failure must never be marked SKIPPED — that status is
    // reserved for rows the user explicitly chose to skip.
    expect(mockImportRowUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'row-2' }, data: expect.objectContaining({ status: 'SKIPPED' }) })
    )

    expect(mockImportUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'COMPLETE', recordCount: 1, skippedCount: 0 }),
      })
    )
  })

  it('marks import as FAILED only when every row fails to import', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { producer: 'Opus One', wineName: 'Opus One' }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))
    mockCreate.mockRejectedValue(new Error('Database connection lost'))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    const complete = events.find((e) => (e as { type: string }).type === 'complete') as {
      imported: number
      errors: Array<{ rowId: string; error: string }>
    }
    expect(complete.imported).toBe(0)
    expect(complete.errors).toEqual([
      expect.objectContaining({ rowId: 'row-1', error: 'Database connection lost' }),
    ])

    expect(mockImportUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED', recordCount: 0 }),
      })
    )
  })

  it('clamps a rating extracted as 940 down to 94.0 instead of overflowing', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { producer: 'Silver Ridge', wineName: 'Sonoma Coast Pinot Noir', rating: 940 }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    await readStream(response)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ rating: 94 }),
    })
  })

  it('nulls a rating that is still out of range after the /10 correction', async () => {
    const rows = [makeRow('row-1', 'PENDING', { producer: 'A', wineName: 'B', rating: 5000 })]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    await readStream(response)

    expect(mockCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ rating: null }) })
  })

  it('nulls an out-of-range vintage instead of storing it', async () => {
    const rows = [makeRow('row-1', 'PENDING', { producer: 'A', wineName: 'B', vintage: 3050 })]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    await readStream(response)

    expect(mockCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ vintage: null }) })
  })

  it('nulls a negative purchasePrice', async () => {
    const rows = [makeRow('row-1', 'PENDING', { producer: 'A', wineName: 'B', purchasePrice: -50 })]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    await readStream(response)

    expect(mockCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ purchasePrice: null }) })
  })

  it('defaults an out-of-range quantity to 1', async () => {
    const rows = [makeRow('row-1', 'PENDING', { producer: 'A', wineName: 'B', quantity: 5000 })]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    await readStream(response)

    expect(mockCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ quantity: 1 }) })
  })

  it('falls back to nulling one numeric field on a 22003 overflow and confirms the row with a note', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { producer: 'Silver Ridge', wineName: 'Sonoma Coast Pinot Noir', rating: 94 }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))
    mockCreate
      .mockRejectedValueOnce(overflowError())
      .mockImplementationOnce(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'wine-1',
        notes: null,
        ...data,
      }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    expect(mockCreate).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({ rating: null }),
    })
    expect(mockWineUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'wine-1' },
        data: { notes: 'Field rating was cleared due to a value error' },
      })
    )
    expect(mockImportRowUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'row-1' }, data: { status: 'CONFIRMED', wineId: 'wine-1' } })
    )
    const complete = events.find((e) => (e as { type: string }).type === 'complete') as { imported: number; fallback: number }
    expect(complete.imported).toBe(1)
    expect(complete.fallback).toBe(1)
  })

  it('falls back to a minimum producer/wineName/quantity record as a last resort', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { producer: 'Silver Ridge', wineName: 'Sonoma Coast Pinot Noir', rating: 94 }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))
    mockCreate
      .mockRejectedValueOnce(overflowError()) // initial attempt
      .mockRejectedValueOnce(overflowError()) // fallback 1 (null rating)
      .mockRejectedValueOnce(overflowError()) // fallback 2 (null all numeric fields)
      .mockImplementationOnce(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'wine-1',
        notes: null,
        ...data,
      }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    await readStream(response)

    expect(mockCreate).toHaveBeenCalledTimes(4)
    expect(mockCreate).toHaveBeenNthCalledWith(4, {
      data: {
        userId: 'user-123',
        importId: 'import-1',
        producer: 'Silver Ridge',
        wineName: 'Sonoma Coast Pinot Noir',
        quantity: 1,
      },
    })
    expect(mockWineUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          notes:
            'Only producer, wine name, and quantity were imported due to repeated value errors — please update manually in your cellar',
        },
      })
    )
  })

  it('reports a row as failed (not Skipped) when every fallback tier also overflows', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { producer: 'Silver Ridge', wineName: 'Sonoma Coast Pinot Noir', rating: 94 }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))
    mockCreate.mockRejectedValue(overflowError())

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    const complete = events.find((e) => (e as { type: string }).type === 'complete') as {
      imported: number
      failed: number
      errors: Array<{ rowId: string; error: string }>
    }
    expect(complete.imported).toBe(0)
    expect(complete.failed).toBe(1)
    expect(complete.errors[0].rowId).toBe('row-1')
    expect(mockImportRowUpdate).not.toHaveBeenCalled()
  })

  it('defaults a blank producer to "Unknown" instead of blocking the import', async () => {
    const rows = [
      makeRow('row-1', 'PENDING', { wineName: 'No Producer' }),
    ]
    getCurrentUser.mockResolvedValue(mockUser)
    getImport.mockResolvedValue(makeImportRecord({ rows }))

    const response = await POST(new Request('http://localhost'), makeParams('import-1'))
    const events = await readStream(response)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ producer: 'Unknown', wineName: 'No Producer' }),
    })
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'complete', imported: 1 })
    )
  })
})
