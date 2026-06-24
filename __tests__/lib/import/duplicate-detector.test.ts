import { findDuplicates } from '@/lib/import/duplicate-detector'
import type { MappedWineData } from '@/lib/import/constants'

jest.mock('@/lib/prisma/client', () => ({
  prisma: {
    wine: { findMany: jest.fn() },
  },
}))

const { prisma } = jest.requireMock('@/lib/prisma/client') as {
  prisma: { wine: { findMany: jest.fn } }
}

const USER_ID = 'user-123'

describe('findDuplicates', () => {
  beforeEach(() => jest.clearAllMocks())

  it('flags exact match (same producer, wineName, vintage, format)', async () => {
    ;(prisma.wine.findMany as jest.Mock).mockResolvedValue([
      { id: 'wine-1', producer: 'Opus One', wineName: 'Opus One', vintage: 2019, format: '750mL' },
    ])

    const candidates: MappedWineData[] = [
      { producer: 'Opus One', wineName: 'Opus One', vintage: 2019, format: '750mL' },
    ]

    const result = await findDuplicates(USER_ID, candidates)

    expect(result[0]).not.toBeNull()
    expect(result[0]!.wineId).toBe('wine-1')
  })

  it('does not flag near match with different vintage', async () => {
    ;(prisma.wine.findMany as jest.Mock).mockResolvedValue([
      { id: 'wine-1', producer: 'Opus One', wineName: 'Opus One', vintage: 2019, format: '750mL' },
    ])

    const candidates: MappedWineData[] = [
      { producer: 'Opus One', wineName: 'Opus One', vintage: 2020, format: '750mL' },
    ]

    const result = await findDuplicates(USER_ID, candidates)

    expect(result[0]).toBeNull()
  })

  it('returns all nulls for an empty cellar', async () => {
    ;(prisma.wine.findMany as jest.Mock).mockResolvedValue([])

    const candidates: MappedWineData[] = [
      { producer: 'Caymus', wineName: 'Special Selection', vintage: 2018 },
      { producer: 'Silver Oak', wineName: 'Alexander Valley', vintage: 2019 },
    ]

    const result = await findDuplicates(USER_ID, candidates)

    expect(result).toEqual([null, null])
  })

  it('matches case-insensitively', async () => {
    ;(prisma.wine.findMany as jest.Mock).mockResolvedValue([
      { id: 'wine-1', producer: 'Opus One', wineName: 'Opus One', vintage: 2019, format: null },
    ])

    const candidates: MappedWineData[] = [
      { producer: 'opus one', wineName: 'opus one', vintage: 2019 },
    ]

    const result = await findDuplicates(USER_ID, candidates)

    expect(result[0]).not.toBeNull()
    expect(result[0]!.wineId).toBe('wine-1')
  })

  it('treats null format and undefined format as equivalent', async () => {
    ;(prisma.wine.findMany as jest.Mock).mockResolvedValue([
      { id: 'wine-1', producer: 'Test', wineName: 'Wine', vintage: 2020, format: null },
    ])

    const candidates: MappedWineData[] = [
      { producer: 'Test', wineName: 'Wine', vintage: 2020 },
    ]

    const result = await findDuplicates(USER_ID, candidates)

    expect(result[0]).not.toBeNull()
  })

  it('does not flag when format differs', async () => {
    ;(prisma.wine.findMany as jest.Mock).mockResolvedValue([
      { id: 'wine-1', producer: 'Test', wineName: 'Wine', vintage: 2020, format: '750mL' },
    ])

    const candidates: MappedWineData[] = [
      { producer: 'Test', wineName: 'Wine', vintage: 2020, format: '1.5L' },
    ]

    const result = await findDuplicates(USER_ID, candidates)

    expect(result[0]).toBeNull()
  })
})
