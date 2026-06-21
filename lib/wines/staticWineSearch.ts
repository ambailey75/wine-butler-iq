import Fuse from 'fuse.js'

export interface StaticWineEntry {
  producer: string
  wineName: string
  country: string | null
  region: string | null
  subRegion: string | null
  vineyard: string | null
  classification: string | null
  varietal: string | null
  format: string | null
}

let fusePromise: Promise<Fuse<StaticWineEntry>> | null = null

function loadFuse(): Promise<Fuse<StaticWineEntry>> {
  if (!fusePromise) {
    fusePromise = fetch('/wine-data.json')
      .then((res) => res.json())
      .then((data: StaticWineEntry[]) => {
        return new Fuse(data, {
          keys: [
            { name: 'producer', weight: 0.6 },
            { name: 'wineName', weight: 0.4 },
          ],
          threshold: 0.35,
          ignoreLocation: true,
        })
      })
      .catch(() => new Fuse<StaticWineEntry>([], { keys: ['producer', 'wineName'] }))
  }
  return fusePromise
}

export async function searchStaticWines(query: string, limit = 6): Promise<StaticWineEntry[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const fuse = await loadFuse()
  return fuse
    .search(trimmed, { limit })
    .map((result) => result.item)
}
