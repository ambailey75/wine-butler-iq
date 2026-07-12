import {
  detectCountryStateSplit,
  splitCountryStateValue,
  detectRegionSplit,
  splitRegionValue,
  suggestColumnMapping,
  extractWinesFromPdf,
} from '@/lib/import/claude-extractor'

jest.mock('@/lib/ai/client', () => ({
  anthropic: {
    messages: { create: jest.fn() },
  },
  CLAUDE_MODEL: 'claude-sonnet-4-6',
}))

const { anthropic } = jest.requireMock('@/lib/ai/client') as {
  anthropic: { messages: { create: jest.fn } }
}

function toolUseResponse(toolName: string, input: unknown) {
  return {
    content: [{ type: 'tool_use', name: toolName, input }],
  }
}

describe('suggestColumnMapping', () => {
  beforeEach(() => jest.clearAllMocks())

  it('correctly maps standard headers via Claude tool call', async () => {
    const headers = ['Producer', 'Wine Name', 'Vintage', 'Qty']
    const sampleRows = [
      { Producer: 'Opus One', 'Wine Name': 'Opus One', Vintage: '2019', Qty: '6' },
    ]
    ;(anthropic.messages.create as jest.Mock).mockResolvedValueOnce(
      toolUseResponse('suggest_mapping', {
        mapping: {
          Producer: 'producer',
          'Wine Name': 'wineName',
          Vintage: 'vintage',
          Qty: 'quantity',
        },
      })
    )

    const result = await suggestColumnMapping(headers, sampleRows)

    expect(result.mapping).toEqual({
      Producer: 'producer',
      'Wine Name': 'wineName',
      Vintage: 'vintage',
      Qty: 'quantity',
    })
  })

  it('nullifies invalid target field keys returned by Claude', async () => {
    const headers = ['Foo']
    const sampleRows = [{ Foo: 'bar' }]
    ;(anthropic.messages.create as jest.Mock).mockResolvedValueOnce(
      toolUseResponse('suggest_mapping', {
        mapping: { Foo: 'nonExistentField' },
      })
    )

    const result = await suggestColumnMapping(headers, sampleRows)

    expect(result.mapping.Foo).toBeNull()
  })

  it('returns empty mapping when Claude returns unparseable response', async () => {
    const headers = ['Producer']
    const sampleRows = [{ Producer: 'Test' }]
    ;(anthropic.messages.create as jest.Mock).mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Sorry I cannot help' }],
    })

    const result = await suggestColumnMapping(headers, sampleRows)

    expect(result.mapping).toEqual({})
  })
})

describe('detectCountryStateSplit', () => {
  it('detects "Country/State" combined column with comma separator', () => {
    const samples = [
      'United States, California',
      'United States, Oregon',
      'France, Bordeaux',
    ]
    const result = detectCountryStateSplit(samples)

    expect(result.shouldSplit).toBe(true)
    expect(result.separator).toBe(', ')
  })

  it('does not split when values are plain country names', () => {
    const samples = ['France', 'Italy', 'Spain']
    const result = detectCountryStateSplit(samples)

    expect(result.shouldSplit).toBe(false)
  })
})

describe('splitCountryStateValue', () => {
  it('splits on the detected separator', () => {
    const result = splitCountryStateValue('United States, California', ', ')

    expect(result.country).toBe('United States')
    expect(result.state).toBe('California')
  })

  it('returns full value as country when separator is missing', () => {
    const result = splitCountryStateValue('France', ', ')

    expect(result.country).toBe('France')
    expect(result.state).toBe('')
  })
})

describe('detectRegionSplit', () => {
  it('detects "Region/Sub-Region" combined column', () => {
    const samples = [
      'Napa Valley, Oakville',
      'Napa Valley, Rutherford',
      'Sonoma, Russian River Valley',
    ]
    const result = detectRegionSplit(samples)

    expect(result.shouldSplit).toBe(true)
    expect(result.separator).toBe(', ')
  })

  it('does not split when values are standalone regions', () => {
    const samples = ['Napa Valley', 'Sonoma', 'Paso Robles']
    const result = detectRegionSplit(samples)

    expect(result.shouldSplit).toBe(false)
  })
})

describe('splitRegionValue', () => {
  it('splits region and sub-region on detected separator', () => {
    const result = splitRegionValue('Bordeaux, Pauillac', ', ')

    expect(result.region).toBe('Bordeaux')
    expect(result.subRegion).toBe('Pauillac')
  })
})

describe('extractWinesFromPdf', () => {
  beforeEach(() => jest.clearAllMocks())

  it('parses valid JSON tool response into extracted rows', async () => {
    ;(anthropic.messages.create as jest.Mock).mockResolvedValue(
      toolUseResponse('extract_wines', {
        wines: [
          {
            mappedData: { producer: 'Opus One', wineName: 'Opus One', vintage: 2019 },
            confidenceScores: { producer: 0.95, wineName: 0.95, vintage: 0.99 },
          },
        ],
      })
    )

    const result = await extractWinesFromPdf(['Page 1 text with wine data'], 5)

    expect(result).toHaveLength(1)
    expect(result[0].mappedData.producer).toBe('Opus One')
    expect(result[0].confidenceScores.vintage).toBe(0.99)
  })

  it('retries once on malformed JSON then returns empty on second failure', async () => {
    ;(anthropic.messages.create as jest.Mock)
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'not a tool call' }],
      })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'still not a tool call' }],
      })

    const result = await extractWinesFromPdf(['Some text'], 5)

    expect(result).toEqual([])
    expect(anthropic.messages.create).toHaveBeenCalledTimes(2)
  })

  it('returns empty array for zero-length pages array', async () => {
    const result = await extractWinesFromPdf([], 5)

    expect(result).toEqual([])
    expect(anthropic.messages.create).not.toHaveBeenCalled()
  })

  it('batches pages correctly', async () => {
    ;(anthropic.messages.create as jest.Mock).mockResolvedValue(
      toolUseResponse('extract_wines', { wines: [] })
    )

    await extractWinesFromPdf(['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5'], 2)

    expect(anthropic.messages.create).toHaveBeenCalledTimes(3)
  })

  it('strips placeholder strings and a zero vintage from extracted rows', async () => {
    ;(anthropic.messages.create as jest.Mock).mockResolvedValue(
      toolUseResponse('extract_wines', {
        wines: [
          {
            mappedData: {
              producer: 'Unknown',
              wineName: 'Domaine des Étoile Brut Rosé',
              vintage: 0,
              vendor: 'N/A',
              region: 'Not specified',
              country: 'France',
            },
            confidenceScores: {
              producer: 0.4,
              wineName: 0.9,
              vintage: 0.5,
              vendor: 0.3,
              region: 0.2,
              country: 0.9,
            },
          },
        ],
      })
    )

    const result = await extractWinesFromPdf(['Page 1 text with wine data'], 5)

    expect(result).toHaveLength(1)
    expect(result[0].mappedData.producer).toBeUndefined()
    expect(result[0].mappedData.vintage).toBeUndefined()
    expect(result[0].mappedData.vendor).toBeUndefined()
    expect(result[0].mappedData.region).toBeUndefined()
    expect(result[0].mappedData.country).toBe('France')
    expect(result[0].mappedData.wineName).toBe('Domaine des Étoile Brut Rosé')
    expect(result[0].confidenceScores.producer).toBeUndefined()
    expect(result[0].confidenceScores.vintage).toBeUndefined()
  })
})
