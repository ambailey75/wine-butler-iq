import {
  normalizeVarietal,
  normalizeRegionSpelling,
  normalizeRegionAndSubRegion,
  normalizeWineData,
  getDisplayRegion,
  getDisplaySubRegion,
} from '@/lib/wines/normalize'

describe('normalizeVarietal', () => {
  it('expands common shorthand', () => {
    expect(normalizeVarietal('Cab')).toBe('Cabernet Sauvignon')
    expect(normalizeVarietal('PN')).toBe('Pinot Noir')
  })

  it('corrects a misspelling', () => {
    expect(normalizeVarietal('Pino Noir')).toBe('Pinot Noir')
  })

  it('preserves regional-name distinctions rather than merging them', () => {
    expect(normalizeVarietal('Shiraz')).toBe('Shiraz')
    expect(normalizeVarietal('Primitivo')).toBe('Primitivo')
  })

  it('splits, normalizes, and rejoins a blend', () => {
    expect(normalizeVarietal('Cab / Merlot / P. verdot')).toBe('Cabernet Sauvignon / Merlot / Petit Verdot')
  })

  it('expands "Cab Franc" within a blend', () => {
    expect(normalizeVarietal('Cab Franc, Merlot')).toBe('Cabernet Franc / Merlot')
  })

  it('preserves protected whole-string blend names without splitting', () => {
    expect(normalizeVarietal('GSM')).toBe('GSM')
    expect(normalizeVarietal('Meritage')).toBe('Meritage')
    expect(normalizeVarietal('Bordeaux Blend')).toBe('Bordeaux Blend')
  })

  it('title-cases an unrecognized component as a best-effort fallback', () => {
    expect(normalizeVarietal('some unknown grape')).toBe('Some Unknown Grape')
  })

  it('returns an empty string for blank input', () => {
    expect(normalizeVarietal('')).toBe('')
    expect(normalizeVarietal('   ')).toBe('')
  })
})

describe('normalizeRegionSpelling', () => {
  it('corrects capitalization', () => {
    expect(normalizeRegionSpelling('napa valley')).toBe('Napa Valley')
  })

  it('corrects a misspelling with missing accents', () => {
    expect(normalizeRegionSpelling('chateauneuf-de-pape')).toBe('Châteauneuf-du-Pape')
  })

  it('returns the input unchanged when there is no known correction', () => {
    expect(normalizeRegionSpelling('Some Random Vineyard Name')).toBe('Some Random Vineyard Name')
  })

  it('returns an empty string for blank input', () => {
    expect(normalizeRegionSpelling('')).toBe('')
  })
})

describe('normalizeRegionAndSubRegion', () => {
  it('splits a combined region value on ">"', () => {
    const result = normalizeRegionAndSubRegion('Napa Valley > Spring Mountain', undefined, 'United States')
    expect(result.region).toBe('Napa Valley')
    expect(result.subRegion).toBe('Spring Mountain District')
    expect(result.appellation).toBe('Spring Mountain District AVA')
    expect(result.ambiguous).toBe(false)
  })

  it('splits "Rhône > Châteauneuf-du-Pape" into region, subRegion, and appellation', () => {
    const result = normalizeRegionAndSubRegion('Rhône > Châteauneuf-du-Pape', undefined, undefined)
    expect(result.region).toBe('Rhône Valley')
    expect(result.subRegion).toBe('Châteauneuf-du-Pape')
    expect(result.appellation).toBe('Châteauneuf-du-Pape AOC')
    expect(result.ambiguous).toBe(false)
  })

  it('splits "Napa valley, Stags Leap District" on a comma', () => {
    const result = normalizeRegionAndSubRegion('Napa valley, Stags Leap District', undefined, undefined)
    expect(result.region).toBe('Napa Valley')
    expect(result.subRegion).toBe('Stags Leap District')
    expect(result.appellation).toBe('Stags Leap District AVA')
    expect(result.ambiguous).toBe(false)
  })

  it('splits "Marlborough - Wairau Valley" and finds the Marlborough GI', () => {
    const result = normalizeRegionAndSubRegion('Marlborough - Wairau Valley', undefined, undefined)
    expect(result.region).toBe('Marlborough')
    expect(result.subRegion).toBe('Wairau Valley')
    expect(result.appellation).toBe('Marlborough GI')
    expect(result.ambiguous).toBe(false)
  })

  it('splits "Western Cape > Stellenbosch" and finds the Stellenbosch WO', () => {
    const result = normalizeRegionAndSubRegion('Western Cape > Stellenbosch', undefined, undefined)
    expect(result.region).toBe('Western Cape')
    expect(result.subRegion).toBe('Stellenbosch')
    expect(result.appellation).toBe('Stellenbosch WO')
    expect(result.ambiguous).toBe(false)
  })

  it('splits "Tuscany | Montalcino" and finds the Brunello di Montalcino DOCG', () => {
    const result = normalizeRegionAndSubRegion('Tuscany | Montalcino', undefined, undefined)
    expect(result.region).toBe('Tuscany')
    expect(result.subRegion).toBe('Montalcino')
    expect(result.appellation).toBe('Brunello di Montalcino DOCG')
    expect(result.ambiguous).toBe(false)
  })

  it('looks up an exact sub-region match (scenario A: Oakville)', () => {
    const result = normalizeRegionAndSubRegion('Napa Valley', 'Oakville', 'United States')
    expect(result.appellation).toBe('Oakville AVA')
  })

  it('falls back to the region-level appellation when subRegion is blank (scenario C: Champagne)', () => {
    const result = normalizeRegionAndSubRegion('Champagne', undefined, 'France')
    expect(result.region).toBe('Champagne')
    expect(result.subRegion).toBe('')
    expect(result.appellation).toBe('Champagne AOC')
  })

  it('strips a designation suffix already present on a raw subRegion value', () => {
    const result = normalizeRegionAndSubRegion('Napa Valley', 'Stags Leap District AVA', 'United States')
    expect(result.subRegion).toBe('Stags Leap District')
    expect(result.appellation).toBe('Stags Leap District AVA')
  })

  it('resolves "Brunello di Montalcino" as a subRegion to the same DOCG as "Montalcino"', () => {
    const result = normalizeRegionAndSubRegion('Tuscany', 'Brunello di Montalcino', 'Italy')
    expect(result.appellation).toBe('Brunello di Montalcino DOCG')
  })

  it('disambiguates Montepulciano the Tuscan appellation from Montepulciano d\'Abruzzo the grape/DOC', () => {
    const tuscanResult = normalizeRegionAndSubRegion('Tuscany', 'Montepulciano', 'Italy')
    expect(tuscanResult.appellation).toBe('Vino Nobile di Montepulciano DOCG')

    const abruzzoResult = normalizeRegionAndSubRegion('Abruzzo', undefined, 'Italy')
    expect(abruzzoResult.appellation).toBe("Montepulciano d'Abruzzo DOC")

    expect(tuscanResult.appellation).not.toBe(abruzzoResult.appellation)
  })

  it('splits a combined region value on a comma', () => {
    const result = normalizeRegionAndSubRegion('Bordeaux, Pauillac', undefined, 'France')
    expect(result.region).toBe('Bordeaux')
    expect(result.subRegion).toBe('Pauillac')
  })

  it('does not re-split when subRegion is already provided', () => {
    const result = normalizeRegionAndSubRegion('Napa Valley', 'Oakville', 'United States')
    expect(result.region).toBe('Napa Valley')
    expect(result.subRegion).toBe('Oakville')
  })

  it('corrects spelling on both halves after splitting', () => {
    const result = normalizeRegionAndSubRegion('napa valley > stags leap', undefined, 'United States')
    expect(result.region).toBe('Napa Valley')
    expect(result.subRegion).toBe('Stags Leap District')
  })

  it('infers a known appellation from the sub-region', () => {
    const result = normalizeRegionAndSubRegion('Napa Valley', 'Stags Leap District', 'United States')
    expect(result.appellation).toBe('Stags Leap District AVA')
  })

  it('infers an Italian DOCG appellation that does not follow a simple suffix rule', () => {
    const result = normalizeRegionAndSubRegion('Tuscany', 'Montalcino', 'Italy')
    expect(result.appellation).toBe('Brunello di Montalcino DOCG')
  })

  it('flags an ambiguous sub-region (Carneros) and returns raw values unchanged', () => {
    const result = normalizeRegionAndSubRegion('Napa Valley', 'Carneros', 'United States')
    expect(result.ambiguous).toBe(true)
    expect(result.region).toBe('Napa Valley')
    expect(result.subRegion).toBe('Carneros')
    expect(result.appellation).toBe('')
  })

  it('flags Sonoma Valley as ambiguous', () => {
    const result = normalizeRegionAndSubRegion('Sonoma', 'Sonoma Valley', 'United States')
    expect(result.ambiguous).toBe(true)
  })

  it('back-fills a blank region from a recognized nested sub-region', () => {
    const result = normalizeRegionAndSubRegion(undefined, 'Chablis', 'France')
    expect(result.region).toBe('Burgundy')
    expect(result.subRegion).toBe('Chablis')
  })

  it('does not split a hyphenated compound place name', () => {
    const result = normalizeRegionAndSubRegion('Châteauneuf-du-Pape', undefined, 'France')
    expect(result.region).toBe('Châteauneuf-du-Pape')
    expect(result.subRegion).toBe('')
  })
})

describe('normalizeWineData', () => {
  it('normalizes varietal, region, and subRegion together', () => {
    const result = normalizeWineData({
      producer: 'Opus One',
      wineName: 'Opus One',
      varietal: 'cab',
      region: 'napa valley > stags leap',
    })
    expect(result.varietal).toBe('Cabernet Sauvignon')
    expect(result.region).toBe('Napa Valley')
    expect(result.subRegion).toBe('Stags Leap District')
    expect(result.appellation).toBe('Stags Leap District AVA')
  })

  it('never overwrites an existing non-blank appellation', () => {
    const result = normalizeWineData({
      region: 'Napa Valley',
      subRegion: 'Stags Leap District',
      appellation: 'A Manually Entered Value',
    })
    expect(result.appellation).toBe('A Manually Entered Value')
  })

  it('strips stray separator symbols as a final pass', () => {
    const result = normalizeWineData({ vineyard: '- To Kalon' })
    expect(result.vineyard).toBe('To Kalon')
  })

  it('leaves fields untouched when region/subRegion is ambiguous', () => {
    const result = normalizeWineData({ region: 'Napa Valley', subRegion: 'Carneros' })
    expect(result.region).toBe('Napa Valley')
    expect(result.subRegion).toBe('Carneros')
  })

  it('never throws — returns the input unchanged on an internal failure', () => {
    // A non-string region (malformed data slipping past the type system)
    // triggers a real runtime error inside normalizeRegionAndSubRegion
    // (`.trim()` isn't a function on a number) — the catch path should
    // return the original input rather than propagate.
    const malformed = { region: 123 } as unknown as Partial<import('@/lib/import/constants').MappedWineData>
    const result = normalizeWineData(malformed)
    expect(result).toBe(malformed)
  })

  it('leaves producer and wineName untouched', () => {
    const result = normalizeWineData({ producer: 'opus one', wineName: 'opus one' })
    expect(result.producer).toBe('opus one')
    expect(result.wineName).toBe('opus one')
  })

  it('moves a bare designation token out of classification and into appellation via the region-level fallback', () => {
    const result = normalizeWineData({ region: 'Tuscany', classification: 'DOCG' })
    expect(result.classification).toBeUndefined()
    expect(result.appellation).toBe('Toscana IGT')
  })

  it('cleans a separator artifact before checking whether classification looks like an appellation', () => {
    const result = normalizeWineData({ classification: '- Chablis' })
    expect(result.classification).toBeUndefined()
    expect(result.appellation).toBe('Chablis')
  })

  it('keeps a genuine quality tier in classification', () => {
    const result = normalizeWineData({ country: 'France', region: 'Burgundy', classification: 'Grand Cru' })
    expect(result.classification).toBe('Grand Cru')
    // Burgundy with no subRegion always gets the region-level appellation
    // fallback (Item 3, scenario C) regardless of classification handling —
    // this confirms that fallback firing didn't clobber a valid tier value.
    expect(result.appellation).toBe('Bourgogne AOC')
  })
})

describe('getDisplayRegion / getDisplaySubRegion', () => {
  it('defensively re-splits a raw combined region value instead of showing it verbatim', () => {
    // Real shape of dirty data found in the live cellar database: the
    // region column itself still holds the full unsplit string.
    expect(getDisplayRegion('Rhône > Châteauneuf-du-Pape')).toBe('Rhône Valley')
    expect(getDisplayRegion('Napa valley, Stags Leap District')).toBe('Napa Valley')
  })

  it('returns a clean region unchanged', () => {
    expect(getDisplayRegion('Mosel')).toBe('Mosel')
  })

  it('strips a designation suffix from a subRegion value for display', () => {
    expect(getDisplaySubRegion('Stags Leap District AVA')).toBe('Stags Leap District')
  })

  it('returns an empty string for blank input', () => {
    expect(getDisplayRegion(null)).toBe('')
    expect(getDisplaySubRegion(undefined)).toBe('')
  })
})
