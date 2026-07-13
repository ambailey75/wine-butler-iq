// Shared region/appellation knowledge base. Single source of truth for both
// lib/import/claude-extractor.ts's column-split detection (deciding whether
// a whole spreadsheet column should be offered as a "split this?" checkbox)
// and lib/wines/normalize.ts's per-value normalization — previously these
// lived as two separate, divergence-prone dictionaries.

// Region -> known sub-regions/appellations nested under it. Lowercase keys
// and values throughout.
export const REGION_SUBREGION_PAIRS: Record<string, string[]> = {
  'napa valley': ['oakville', 'rutherford', 'st. helena', 'stags leap district', 'calistoga', 'yountville', 'howell mountain', 'atlas peak', 'spring mountain district', 'diamond mountain district', 'los carneros', 'mount veeder', 'coombsville', 'chiles valley'],
  'sonoma': ['russian river valley', 'sonoma coast', 'alexander valley', 'dry creek valley', 'knights valley', 'sonoma mountain', 'sonoma valley', 'bennett valley', 'chalk hill', 'green valley', 'moon mountain', 'petaluma gap', 'pine mountain-cloverdale peak'],
  'bordeaux': ['pauillac', 'margaux', 'saint-julien', 'saint-estèphe', 'pessac-léognan', 'saint-émilion', 'pomerol', 'médoc', 'haut-médoc', 'graves', 'sauternes', 'barsac', 'entre-deux-mers', 'fronsac', 'côtes de bourg', 'moulis', 'listrac'],
  'burgundy': ['chablis', 'côte de nuits', 'côte de beaune', 'côte chalonnaise', 'mâconnais', 'mâcon', 'gevrey-chambertin', 'chambolle-musigny', 'vosne-romanée', 'nuits-saint-georges', 'meursault', 'puligny-montrachet', 'chassagne-montrachet', 'pommard', 'volnay', 'beaune', 'corton', 'pouilly-fuissé'],
  'rhône': ['châteauneuf-du-pape', 'hermitage', 'côte-rôtie', 'gigondas', 'vacqueyras', 'crozes-hermitage', 'saint-joseph', 'condrieu', 'tavel', 'lirac', 'rasteau', 'vinsobres', 'cornas'],
  'tuscany': ['chianti', 'chianti classico', 'brunello di montalcino', 'bolgheri', 'montepulciano', 'montalcino', 'san gimignano', 'maremma'],
  'piedmont': ['barolo', 'barbaresco', 'langhe', 'roero', 'gavi', 'asti', 'alba'],
  'rioja': ['rioja alta', 'rioja alavesa', 'rioja oriental'],
  'willamette valley': ['dundee hills', 'eola-amity hills', 'yamhill-carlton', 'ribbon ridge', 'chehalem mountains', 'mcminnville'],
  'russian river valley': ['green valley', 'middle reach', 'east side'],
  'paso robles': ['adelaida district', 'willow creek', 'templeton gap', 'estrella district', 'geneseo district'],
  'santa barbara': ['santa ynez valley', 'sta. rita hills', 'happy canyon', 'los olivos district', 'ballard canyon'],
  'champagne': ['montagne de reims', 'côte des blancs', 'vallée de la marne', 'côte des bar', 'aube'],
  'loire': ['sancerre', 'vouvray', 'pouilly-fumé', 'chinon', 'saumur', 'muscadet'],
  'washington': ['columbia valley', 'walla walla valley', 'red mountain', 'yakima valley', 'horse heaven hills'],
  'mosel': ['bernkastel', 'piesport', 'wehlen', 'graach'],
  'barossa': ['barossa valley', 'eden valley'],
  'marlborough': ['wairau valley', 'awatere valley'],
  'western cape': ['stellenbosch', 'franschhoek', 'paarl', 'swartland', 'constantia', 'walker bay'],
  'abruzzo': [],
}

// Country -> known states/provinces/regions treated as "state" level.
export const COUNTRY_STATE_PAIRS: Record<string, string[]> = {
  'united states': ['california', 'oregon', 'washington', 'new york', 'virginia', 'texas', 'michigan', 'colorado', 'idaho', 'missouri', 'north carolina', 'ohio', 'pennsylvania', 'arizona', 'new mexico', 'maryland', 'georgia', 'illinois', 'indiana', 'iowa', 'minnesota', 'new jersey', 'connecticut', 'massachusetts'],
  'usa': ['california', 'oregon', 'washington', 'new york', 'virginia', 'texas', 'michigan', 'colorado', 'idaho', 'missouri'],
  'us': ['california', 'oregon', 'washington', 'new york', 'virginia', 'texas', 'michigan', 'colorado', 'idaho', 'missouri'],
  'australia': ['south australia', 'victoria', 'new south wales', 'western australia', 'tasmania', 'queensland'],
  'canada': ['british columbia', 'ontario', 'nova scotia', 'quebec'],
  'argentina': ['mendoza', 'salta', 'patagonia', 'san juan'],
  'germany': ['mosel', 'rheingau', 'pfalz', 'rheinhessen', 'baden', 'franken', 'nahe', 'württemberg', 'sachsen'],
  'italy': ['tuscany', 'piedmont', 'veneto', 'sicily', 'sardinia', 'lombardy', 'friuli', 'campania', 'puglia', 'trentino', 'alto adige', 'abruzzo', 'umbria', 'marche', 'liguria', 'emilia-romagna'],
  'spain': ['rioja', 'ribera del duero', 'priorat', 'galicia', 'catalonia', 'andalusia', 'castilla y león', 'navarra', 'valencia'],
  'france': ['bordeaux', 'burgundy', 'champagne', 'rhône', 'loire', 'alsace', 'languedoc', 'provence', 'jura', 'savoie', 'corsica', 'beaujolais'],
  'new zealand': ['marlborough', 'central otago', 'hawke\'s bay', 'martinborough', 'waiheke island', 'gisborne', 'wairarapa'],
  'south africa': ['stellenbosch', 'franschhoek', 'paarl', 'swartland', 'constantia', 'walker bay', 'elgin'],
  'chile': ['maipo valley', 'colchagua', 'casablanca', 'rapel', 'aconcagua', 'bio bio', 'itata'],
  'portugal': ['douro', 'alentejo', 'dão', 'bairrada', 'vinho verde', 'lisbon'],
}

// Misspellings/non-standard capitalization -> corrected form. Keys are
// lowercase; values are the display-correct form.
export const REGION_SPELLING_CORRECTIONS: Record<string, string> = {
  'chateauneuf-de-pape': 'Châteauneuf-du-Pape',
  'chateauneuf du pape': 'Châteauneuf-du-Pape',
  'chateauneuf-du-pape': 'Châteauneuf-du-Pape',
  'chateauneuf': 'Châteauneuf-du-Pape',
  'napa valley': 'Napa Valley',
  'sonoma county': 'Sonoma County',
  'sonoma': 'Sonoma County',
  'st helena': 'St. Helena',
  'saint helena': 'St. Helena',
  'stags leap': 'Stags Leap District',
  'stags leap district': 'Stags Leap District',
  'spring mountain': 'Spring Mountain District',
  'spring mountain district': 'Spring Mountain District',
  'diamond mountain': 'Diamond Mountain District',
  'diamond mountain district': 'Diamond Mountain District',
  'willamette valley': 'Willamette Valley',
  'willamette': 'Willamette Valley',
  'cotes du rhone': 'Côtes du Rhône',
  'côtes du rhone': 'Côtes du Rhône',
  'burgandy': 'Burgundy',
  'burgundy': 'Burgundy',
  'bordeaux': 'Bordeaux',
  'medoc': 'Médoc',
  'saint emilion': 'Saint-Émilion',
  'st emilion': 'Saint-Émilion',
  'st. emilion': 'Saint-Émilion',
  'pessac leognan': 'Pessac-Léognan',
  'gevrey chambertin': 'Gevrey-Chambertin',
  'chambolle musigny': 'Chambolle-Musigny',
  'vosne romanee': 'Vosne-Romanée',
  'nuits st georges': 'Nuits-Saint-Georges',
  'nuits-st-georges': 'Nuits-Saint-Georges',
  'puligny montrachet': 'Puligny-Montrachet',
  'cote rotie': 'Côte-Rôtie',
  'cote-rotie': 'Côte-Rôtie',
  'chianti classico': 'Chianti Classico',
  'brunello di montalcino': 'Brunello di Montalcino',
  'rioja alta': 'Rioja Alta',
  'rioja alavesa': 'Rioja Alavesa',
  'rioja baja': 'Rioja Oriental',
  'rioja oriental': 'Rioja Oriental',
  'columbia valley': 'Columbia Valley',
  'walla walla': 'Walla Walla Valley',
  'walla walla valley': 'Walla Walla Valley',
  'russian river': 'Russian River Valley',
  'russian river valley': 'Russian River Valley',
  'dry creek': 'Dry Creek Valley',
  'dry creek valley': 'Dry Creek Valley',
  'alexander valley': 'Alexander Valley',
  'rheingau': 'Rheingau',
  'mosel': 'Mosel',
  'moselle': 'Mosel',
  'rhône': 'Rhône Valley',
  'rhone': 'Rhône Valley',
  'rhône valley': 'Rhône Valley',
  'rhone valley': 'Rhône Valley',
  'tuscany': 'Tuscany',
  'piedmont': 'Piedmont',
  'rioja': 'Rioja',
  'champagne': 'Champagne',
  'loire': 'Loire Valley',
  'loire valley': 'Loire Valley',
  'barossa': 'Barossa',
  'washington': 'Washington',
}

// Region -> sub-region (or "" for the region itself) -> official appellation
// designation string. Outer and inner keys are lowercase; lookups must
// lowercase both the region and sub-region before indexing in.
//
// Deliberately a direct lookup rather than a generic "append AVA/AOC" suffix
// rule — Italian DOCG names in particular bundle a wine name with the place
// name (Brunello di Montalcino DOCG, not "Montalcino DOCG"), which a suffix
// rule would get wrong.
//
// Montepulciano appears twice below under two unrelated entries — Tuscany's
// "montepulciano" (the hill town, Vino Nobile di Montepulciano DOCG) and
// Abruzzo's region-level "" entry (Montepulciano d'Abruzzo DOC, named for
// the grape variety grown there). These are two different things that
// happen to share a name — do not merge or alias them.
//
// The Abruzzo "" fallback is accurate for red wine only. White Abruzzo is
// Trebbiano d'Abruzzo DOC and rosé is its own separate Cerasuolo d'Abruzzo
// DOC (split out in 2010) — this table has no style-awareness today, so a
// white/rosé Abruzzo wine with no sub-region will get the red DOC name here.
// Known limitation, not a silent guess.
//
// Tuscany's "" fallback (Toscana IGT) is the only real region-wide blanket
// designation, but most collectible Tuscan wine is DOCG, not IGT — treat
// this as a last resort only, never preferred over a specific sub-region
// match above it.
export const APPELLATION_LOOKUP: Record<string, Record<string, string>> = {
  'napa valley': {
    'oakville': 'Oakville AVA',
    'stags leap district': 'Stags Leap District AVA',
    'rutherford': 'Rutherford AVA',
    'st. helena': 'St. Helena AVA',
    'howell mountain': 'Howell Mountain AVA',
    'spring mountain district': 'Spring Mountain District AVA',
    'diamond mountain district': 'Diamond Mountain District AVA',
    'mount veeder': 'Mount Veeder AVA',
    'yountville': 'Yountville AVA',
    'coombsville': 'Coombsville AVA',
    'calistoga': 'Calistoga AVA',
    'atlas peak': 'Atlas Peak AVA',
    'los carneros': 'Los Carneros AVA',
    '': 'Napa Valley AVA',
  },
  'sonoma county': {
    'russian river valley': 'Russian River Valley AVA',
    'sonoma coast': 'Sonoma Coast AVA',
    'alexander valley': 'Alexander Valley AVA',
    'dry creek valley': 'Dry Creek Valley AVA',
    '': 'Sonoma County',
  },
  'bordeaux': {
    'pauillac': 'Pauillac AOC',
    'saint-estèphe': 'Saint-Estèphe AOC',
    'saint-julien': 'Saint-Julien AOC',
    'margaux': 'Margaux AOC',
    'pomerol': 'Pomerol AOC',
    'saint-émilion': 'Saint-Émilion AOC',
    'pessac-léognan': 'Pessac-Léognan AOC',
    'moulis': 'Moulis-en-Médoc AOC',
    'listrac': 'Listrac-Médoc AOC',
    '': 'Bordeaux AOC',
  },
  'burgundy': {
    'gevrey-chambertin': 'Gevrey-Chambertin AOC',
    'chambolle-musigny': 'Chambolle-Musigny AOC',
    'vosne-romanée': 'Vosne-Romanée AOC',
    'nuits-saint-georges': 'Nuits-Saint-Georges AOC',
    'pommard': 'Pommard AOC',
    'volnay': 'Volnay AOC',
    'meursault': 'Meursault AOC',
    'puligny-montrachet': 'Puligny-Montrachet AOC',
    'chassagne-montrachet': 'Chassagne-Montrachet AOC',
    'chablis': 'Chablis AOC',
    'mâcon': 'Mâcon AOC',
    '': 'Bourgogne AOC',
  },
  'rhône valley': {
    'châteauneuf-du-pape': 'Châteauneuf-du-Pape AOC',
    'hermitage': 'Hermitage AOC',
    'côte-rôtie': 'Côte-Rôtie AOC',
    'gigondas': 'Gigondas AOC',
    'vacqueyras': 'Vacqueyras AOC',
    'crozes-hermitage': 'Crozes-Hermitage AOC',
    '': 'Côtes du Rhône AOC',
  },
  'champagne': {
    'montagne de reims': 'Champagne AOC',
    'vallée de la marne': 'Champagne AOC',
    'côte des blancs': 'Champagne AOC',
    '': 'Champagne AOC',
  },
  'tuscany': {
    'montalcino': 'Brunello di Montalcino DOCG',
    'brunello di montalcino': 'Brunello di Montalcino DOCG',
    'montepulciano': 'Vino Nobile di Montepulciano DOCG',
    'chianti classico': 'Chianti Classico DOCG',
    'bolgheri': 'Bolgheri DOC',
    '': 'Toscana IGT',
  },
  'abruzzo': {
    '': "Montepulciano d'Abruzzo DOC",
  },
  'piedmont': {
    'barolo': 'Barolo DOCG',
    'barbaresco': 'Barbaresco DOCG',
    'asti': 'Asti DOCG',
    '': 'Piemonte DOC',
  },
  'marlborough': {
    'wairau valley': 'Marlborough GI',
    'awatere valley': 'Marlborough GI',
    '': 'Marlborough GI',
  },
  'western cape': {
    'stellenbosch': 'Stellenbosch WO',
    'franschhoek': 'Franschhoek WO',
    'paarl': 'Paarl WO',
    'swartland': 'Swartland WO',
    'constantia': 'Constantia WO',
    'walker bay': 'Walker Bay WO',
    '': 'Western Cape WO',
  },
  'rioja': {
    'rioja alta': 'Rioja DOCa',
    'rioja alavesa': 'Rioja DOCa',
    'rioja oriental': 'Rioja DOCa',
    '': 'Rioja DOCa',
  },
  'mosel': {
    'bernkastel': 'Mosel',
    'piesport': 'Mosel',
    '': 'Mosel',
  },
}

// Sub-regions that legitimately mean different things depending on context
// (e.g. Carneros straddles Napa and Sonoma) — normalizeRegionAndSubRegion
// returns these unchanged with `ambiguous: true` rather than guessing.
export const AMBIGUOUS_SUBREGIONS = new Set<string>(['carneros', 'los carneros', 'sonoma valley'])

// Country -> region -> valid quality/classification tier values for that
// region's own system. Keys are lowercase; used to tell a genuine quality
// tier (Grand Cru, Reserva, ...) apart from a value that's actually an
// appellation name that landed in the wrong field.
//
// France/Bordeaux mixes Saint-Émilion-only terms (Premier Grand Cru Classé
// A/B) with Médoc-only terms (the Cru Bourgeois tiers) — this table only
// keys down to region, not sub-appellation, so it can't express that a
// given bottle should only ever show one family of these, not both.
//
// USA tiers (Reserve, Library) are producer-discretionary marketing terms
// with no legal definition, unlike the regulated European terms elsewhere
// in this table. "Estate" is the exception — that one is TTB-defined.
export const QUALITY_TIER_LOOKUP: Record<string, Record<string, string[]>> = {
  'france': {
    'burgundy': ['Grand Cru', 'Premier Cru', 'Village', 'Régionale'],
    'bordeaux': [
      'Premier Grand Cru Classé A',
      'Premier Grand Cru Classé B',
      'Grand Cru Classé',
      'Cru Bourgeois Exceptionnel',
      'Cru Bourgeois Supérieur',
      'Cru Bourgeois',
    ],
    'champagne': ['Non-Vintage', 'Vintage', 'Prestige Cuvée', 'Blanc de Blancs', 'Blanc de Noirs', 'Rosé'],
    'rhône valley': ['Cru', 'Villages', 'Régionale'],
  },
  'italy': {
    'tuscany': ['Riserva', 'Gran Selezione', 'Superiore'],
    'piedmont': ['Riserva', 'Superiore'],
  },
  'spain': {
    'rioja': ['Gran Reserva', 'Reserva', 'Crianza', 'Joven'],
  },
  'germany': {
    'mosel': ['QbA', 'Kabinett', 'Spätlese', 'Auslese', 'Beerenauslese', 'Eiswein', 'Trockenbeerenauslese'],
  },
  'usa': {
    'napa valley': ['Reserve', 'Estate', 'Single Vineyard', 'Library'],
    'sonoma county': ['Reserve', 'Estate', 'Single Vineyard'],
  },
  'united states': {
    'napa valley': ['Reserve', 'Estate', 'Single Vineyard', 'Library'],
    'sonoma county': ['Reserve', 'Estate', 'Single Vineyard'],
  },
  'us': {
    'napa valley': ['Reserve', 'Estate', 'Single Vineyard', 'Library'],
    'sonoma county': ['Reserve', 'Estate', 'Single Vineyard'],
  },
}
