import { cleanFieldValue, extractPairedValue, cleanMappedData } from '@/lib/import/clean-field-values'

describe('cleanFieldValue', () => {
  it('truncates a region value at a " > " separator', () => {
    expect(cleanFieldValue('Napa Valley > Spring Mountain', 'region')).toBe('Napa Valley')
  })

  it('truncates on a " | " separator', () => {
    expect(cleanFieldValue('Bordeaux | Pauillac', 'region')).toBe('Bordeaux')
  })

  it('truncates on a " / " separator', () => {
    expect(cleanFieldValue('Rhône / Châteauneuf-du-Pape', 'region')).toBe('Rhône')
  })

  it('truncates on a " - " separator', () => {
    expect(cleanFieldValue('Tuscany - Montalcino', 'region')).toBe('Tuscany')
  })

  it('truncates on a " . " separator', () => {
    expect(cleanFieldValue('Napa Valley . Oakville', 'region')).toBe('Napa Valley')
  })

  it('does not split a hyphenated compound name with no surrounding spaces', () => {
    expect(cleanFieldValue('Châteauneuf-du-Pape', 'region')).toBe('Châteauneuf-du-Pape')
  })

  it('does not split slashes in a varietal blend', () => {
    expect(cleanFieldValue('Cab / Merlot / P. verdot', 'varietal')).toBe('Cab / Merlot / P. verdot')
  })

  it('does not split a wine name containing a hyphen', () => {
    expect(cleanFieldValue('Pinot Noir-based Blend', 'wineName')).toBe('Pinot Noir-based Blend')
  })

  it('trims whitespace and collapses internal double spaces', () => {
    expect(cleanFieldValue('  Napa   Valley  ', 'region')).toBe('Napa Valley')
  })

  it('strips a leading separator symbol', () => {
    expect(cleanFieldValue('- Opus One', 'wineName')).toBe('Opus One')
  })

  it('strips trailing punctuation', () => {
    expect(cleanFieldValue('Bordeaux,', 'region')).toBe('Bordeaux')
  })

  it('reduces a value that is only a separator symbol to an empty string', () => {
    expect(cleanFieldValue('-', 'region')).toBe('')
    expect(cleanFieldValue('>', 'subRegion')).toBe('')
  })

  it('preserves parentheses and ampersands', () => {
    expect(cleanFieldValue('Château Smith & Sons (Reserve)', 'producer')).toBe('Château Smith & Sons (Reserve)')
  })
})

describe('extractPairedValue', () => {
  it('returns the sub-region half of a combined region value', () => {
    expect(extractPairedValue('Napa Valley > Spring Mountain', 'region')).toBe('Spring Mountain')
  })

  it('returns the state half of a combined country value', () => {
    expect(extractPairedValue('United States - California', 'country')).toBe('California')
  })

  it('returns null when there is no separator', () => {
    expect(extractPairedValue('Napa Valley', 'region')).toBeNull()
  })

  it('returns null for fields with no documented pair (e.g. vineyard)', () => {
    expect(extractPairedValue('To Kalon > Block 5', 'vineyard')).toBeNull()
  })
})

describe('cleanMappedData', () => {
  it('splits a combined region into region + subRegion when subRegion is blank', () => {
    const result = cleanMappedData({ region: 'Napa Valley > Spring Mountain' })
    expect(result.region).toBe('Napa Valley')
    expect(result.subRegion).toBe('Spring Mountain')
  })

  it('does not overwrite an existing subRegion value', () => {
    const result = cleanMappedData({ region: 'Napa Valley > Spring Mountain', subRegion: 'Oakville' })
    expect(result.region).toBe('Napa Valley')
    expect(result.subRegion).toBe('Oakville')
  })

  it('splits a combined country into country + state when state is blank', () => {
    const result = cleanMappedData({ country: 'United States | California' })
    expect(result.country).toBe('United States')
    expect(result.state).toBe('California')
  })

  it('leaves varietal blends and hyphenated wine names untouched', () => {
    const result = cleanMappedData({
      varietal: 'Cab / Merlot / P. verdot',
      wineName: 'Châteauneuf-du-Pape Réserve',
    })
    expect(result.varietal).toBe('Cab / Merlot / P. verdot')
    expect(result.wineName).toBe('Châteauneuf-du-Pape Réserve')
  })

  it('drops a field that cleans down to nothing', () => {
    const result = cleanMappedData({ region: '-', producer: 'Opus One' })
    expect(result.region).toBeUndefined()
    expect(result.producer).toBe('Opus One')
  })

  it('leaves non-string fields untouched', () => {
    const result = cleanMappedData({ vintage: 2019, quantity: 6 })
    expect(result.vintage).toBe(2019)
    expect(result.quantity).toBe(6)
  })
})
