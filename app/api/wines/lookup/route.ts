import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import type { WineLookupResult } from '@/lib/wines/types'

const USER_AGENT_BROWSER =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const USER_AGENT_OFF = 'WineButlerAI/1.0 (winebutlerai.com; contact: ambailey91406@gmail.com)'
const FETCH_TIMEOUT_MS = 2500

async function fetchWithTimeout(url: string, headers: Record<string, string>) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { headers, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function searchVivino(query: string): Promise<WineLookupResult[]> {
  const params = new URLSearchParams({
    country_code: 'US',
    currency_code: 'USD',
    grape_filter: 'varietal',
    min_rating: '1',
    order_by: 'ratings_average',
    order: 'desc',
    page: '1',
    price_range_max: '500',
    price_range_min: '0',
    language: 'en',
    q: query,
  })
  for (const id of ['1', '2', '3', '4']) params.append('wine_type_ids[]', id)

  const res = await fetchWithTimeout(`https://www.vivino.com/api/explore/explore?${params.toString()}`, {
    'User-Agent': USER_AGENT_BROWSER,
    Accept: 'application/json',
  })
  if (!res.ok) throw new Error(`Vivino returned ${res.status}`)

  const data = await res.json()
  const matches: any[] = data?.explore_vintage?.matches ?? []

  return matches
    .slice(0, 6)
    .map((match) => {
      const vintage = match.vintage ?? {}
      const wine = vintage.wine ?? {}
      return {
        producer: wine.winery?.name ?? '',
        wineName: wine.name ?? '',
        vintage: typeof vintage.year === 'number' ? vintage.year : null,
        country: wine.region?.country?.name ?? null,
        region: wine.region?.name ?? null,
        varietal: wine.style?.varietal_name ?? null,
      }
    })
    .filter((entry) => entry.producer && entry.wineName)
}

async function searchOpenFoodFacts(query: string): Promise<WineLookupResult[]> {
  const params = new URLSearchParams({
    search_terms: query,
    tagtype_0: 'categories',
    tag_contains_0: 'contains',
    tag_0: 'wines',
    json: '1',
    page_size: '6',
  })

  const res = await fetchWithTimeout(`https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`, {
    'User-Agent': USER_AGENT_OFF,
  })
  if (!res.ok) throw new Error(`Open Food Facts returned ${res.status}`)

  const data = await res.json()
  const products: any[] = data?.products ?? []

  return products
    .slice(0, 6)
    .map((product) => {
      const rawName: string = product.product_name ?? ''
      const yearMatch = rawName.match(/^(19|20)\d{2}\b/)
      const vintage = yearMatch ? parseInt(yearMatch[0], 10) : null
      const wineName = yearMatch ? rawName.slice(yearMatch[0].length).trim() : rawName
      const producer = (product.brands ?? '').split(',')[0]?.trim() ?? ''
      const country = (product.countries ?? '').split(',')[0]?.trim() || null

      return {
        producer,
        wineName,
        vintage,
        country,
        region: null,
        varietal: null,
      }
    })
    .filter((entry) => entry.producer && entry.wineName)
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (query.length < 2) {
    return NextResponse.json([])
  }

  try {
    const results = await searchVivino(query)
    if (results.length > 0) {
      return NextResponse.json(results)
    }
  } catch {
    // fall through to Open Food Facts
  }

  try {
    const results = await searchOpenFoodFacts(query)
    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
