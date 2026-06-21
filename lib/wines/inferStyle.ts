const RED_VARIETALS = new Set([
  'cabernet sauvignon', 'merlot', 'pinot noir', 'syrah', 'shiraz',
  'sangiovese', 'nebbiolo', 'tempranillo', 'malbec', 'zinfandel',
  'grenache', 'garnacha', 'mourvèdre', 'mourvedre', 'barbera',
  'primitivo', 'carmenere', 'carménère', 'petite sirah', 'petit verdot',
  'gamay', 'carignan', 'corvina', 'nero d\'avola', 'aglianico',
  'montepulciano', 'dolcetto', 'tannat', 'touriga nacional',
  'pinotage', 'blaufränkisch', 'blaufrankisch', 'zweigelt',
  'st. laurent', 'norton', 'bonarda', 'cinsault', 'counoise',
  'cabernet franc', 'bordeaux blend', 'rhône blend', 'rhone blend',
  'gsm', 'meritage', 'super tuscan', 'red blend',
])

const WHITE_VARIETALS = new Set([
  'chardonnay', 'sauvignon blanc', 'riesling', 'pinot grigio',
  'pinot gris', 'viognier', 'albariño', 'albarino', 'chenin blanc',
  'gewürztraminer', 'gewurztraminer', 'semillon', 'sémillon',
  'marsanne', 'roussanne', 'grüner veltliner', 'gruner veltliner',
  'torrontés', 'torrontes', 'vermentino', 'fiano', 'falanghina',
  'trebbiano', 'garganega', 'arneis', 'cortese', 'verdejo',
  'godello', 'furmint', 'müller-thurgau', 'muller-thurgau',
  'sylvaner', 'muscadet', 'melon de bourgogne', 'white blend',
  'white burgundy', 'white bordeaux', 'white rhône blend',
  'white rhone blend', 'friulano', 'ribolla gialla', 'pecorino',
])

const SPARKLING_REGIONS = new Set([
  'champagne', 'franciacorta', 'trento',
])

const SPARKLING_KEYWORDS = [
  'champagne', 'cava', 'prosecco', 'crémant', 'cremant',
  'sparkling', 'spumante', 'sekt', 'méthode traditionnelle',
  'methode traditionnelle', 'brut', 'blanc de blancs', 'blanc de noirs',
]

const DESSERT_REGIONS = new Set(['sauternes', 'barsac', 'tokaj', 'tokaji'])

const DESSERT_KEYWORDS = [
  'sauternes', 'ice wine', 'eiswein', 'late harvest',
  'trockenbeerenauslese', 'beerenauslese', 'auslese',
  'vin santo', 'passito', 'recioto', 'moscato d\'asti',
  'dessert', 'sweet', 'botrytis',
]

const FORTIFIED_KEYWORDS = [
  'port', 'porto', 'sherry', 'jerez', 'madeira', 'marsala',
  'vermouth', 'fortified', 'vdn', 'vin doux naturel',
  'banyuls', 'maury', 'rivesaltes', 'rutherglen muscat',
]

const ROSE_KEYWORDS = ['rosé', 'rose', 'rosato', 'rosado']

interface InferStyleInput {
  varietal?: string | null
  region?: string | null
  wineName?: string | null
  classification?: string | null
}

export function inferStyle(input: InferStyleInput): string | null {
  const varietal = input.varietal?.toLowerCase().trim() ?? ''
  const region = input.region?.toLowerCase().trim() ?? ''
  const wineName = input.wineName?.toLowerCase().trim() ?? ''
  const classification = input.classification?.toLowerCase().trim() ?? ''
  const allText = `${varietal} ${wineName} ${classification}`

  if (ROSE_KEYWORDS.some((k) => allText.includes(k))) return 'Rosé'

  if (FORTIFIED_KEYWORDS.some((k) => allText.includes(k))) return 'Fortified'

  if (
    DESSERT_REGIONS.has(region) ||
    DESSERT_KEYWORDS.some((k) => allText.includes(k))
  ) {
    return 'Dessert'
  }

  if (
    SPARKLING_REGIONS.has(region) ||
    SPARKLING_KEYWORDS.some((k) => allText.includes(k))
  ) {
    return 'Sparkling'
  }

  if (varietal && RED_VARIETALS.has(varietal)) return 'Red'
  if (varietal && WHITE_VARIETALS.has(varietal)) return 'White'

  return null
}
