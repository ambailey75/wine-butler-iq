import * as XLSX from 'xlsx'
import { parseSpreadsheet, applyColumnMapping } from '@/lib/import/excel'
import { MAX_CSV_ROWS } from '@/lib/import/constants'

function makeBuffer(rows: Record<string, string>[]): Buffer {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
}

describe('parseSpreadsheet', () => {
  it('parses valid CSV buffer and returns correct headers and rows', () => {
    const input = [
      { Producer: 'Opus One', 'Wine Name': 'Opus One', Vintage: '2019', Qty: '6' },
      { Producer: 'Caymus', 'Wine Name': 'Special Selection', Vintage: '2018', Qty: '3' },
    ]
    const result = parseSpreadsheet(makeBuffer(input))

    expect(result.headers).toEqual(['Producer', 'Wine Name', 'Vintage', 'Qty'])
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({
      Producer: 'Opus One',
      'Wine Name': 'Opus One',
      Vintage: '2019',
      Qty: '6',
    })
  })

  it('returns empty rows and headers for an empty file', () => {
    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet([])
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')
    const buffer = Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))

    const result = parseSpreadsheet(buffer)

    expect(result.headers).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('returns empty result for a workbook with only an empty sheet', () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Header']]), 'Empty')
    const buffer = Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))

    const result = parseSpreadsheet(buffer)

    expect(result.headers).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('returns rows with empty strings for missing columns, not errors', () => {
    const input = [
      { Producer: 'Opus One', Vintage: '2019' },
    ]
    const result = parseSpreadsheet(makeBuffer(input))

    expect(result.headers).toEqual(['Producer', 'Vintage'])
    expect(result.rows[0]).toEqual({ Producer: 'Opus One', Vintage: '2019' })
    expect(result.rows[0]['Wine Name']).toBeUndefined()
  })

  it('truncates rows at MAX_CSV_ROWS', () => {
    const rows = Array.from({ length: MAX_CSV_ROWS + 50 }, (_, i) => ({
      Producer: `Producer ${i}`,
      Wine: `Wine ${i}`,
    }))
    const result = parseSpreadsheet(makeBuffer(rows))

    expect(result.rows).toHaveLength(MAX_CSV_ROWS)
  })
})

describe('applyColumnMapping', () => {
  it('maps string fields correctly', () => {
    const raw = { 'My Producer': 'Screaming Eagle', 'My Wine': 'Cabernet Sauvignon' }
    const mapping = { 'My Producer': 'producer', 'My Wine': 'wineName' }

    const { mappedData } = applyColumnMapping(raw, mapping)

    expect(mappedData.producer).toBe('Screaming Eagle')
    expect(mappedData.wineName).toBe('Cabernet Sauvignon')
  })

  it('strips currency symbols from numeric fields', () => {
    const raw = { Price: '$1,250.00', Qty: '12' }
    const mapping = { Price: 'purchasePrice', Qty: 'quantity' }

    const { mappedData } = applyColumnMapping(raw, mapping)

    expect(mappedData.purchasePrice).toBe(1250)
    expect(mappedData.quantity).toBe(12)
  })

  it('sets low confidence for missing required fields', () => {
    const raw = { Vintage: '2019' }
    const mapping = { Vintage: 'vintage' }

    const { confidenceScores } = applyColumnMapping(raw, mapping)

    expect(confidenceScores.producer).toBe(0.3)
    expect(confidenceScores.wineName).toBe(0.3)
  })

  it('skips null mappings', () => {
    const raw = { Notes: 'some text', Producer: 'Test' }
    const mapping = { Notes: null, Producer: 'producer' }

    const { mappedData } = applyColumnMapping(raw, mapping)

    expect(mappedData.producer).toBe('Test')
    expect((mappedData as Record<string, unknown>)['Notes']).toBeUndefined()
  })
})
