import { inferStyle } from '@/lib/wines/inferStyle'

describe('inferStyle', () => {
  describe('red varietals', () => {
    it('Cabernet Sauvignon → Red', () => {
      expect(inferStyle({ varietal: 'Cabernet Sauvignon' })).toBe('Red')
    })

    it('Pinot Noir → Red', () => {
      expect(inferStyle({ varietal: 'Pinot Noir' })).toBe('Red')
    })

    it('Bordeaux Blend → Red', () => {
      expect(inferStyle({ varietal: 'Bordeaux Blend' })).toBe('Red')
    })
  })

  describe('white varietals', () => {
    it('Chardonnay → White', () => {
      expect(inferStyle({ varietal: 'Chardonnay' })).toBe('White')
    })

    it('Sauvignon Blanc → White', () => {
      expect(inferStyle({ varietal: 'Sauvignon Blanc' })).toBe('White')
    })
  })

  describe('sparkling', () => {
    it('Champagne region → Sparkling', () => {
      expect(inferStyle({ region: 'Champagne' })).toBe('Sparkling')
    })

    it('Franciacorta region → Sparkling', () => {
      expect(inferStyle({ region: 'Franciacorta' })).toBe('Sparkling')
    })

    it('wine name containing "Brut" → Sparkling', () => {
      expect(inferStyle({ wineName: 'Dom Pérignon Brut' })).toBe('Sparkling')
    })

    it('wine name containing "Blanc de Blancs" → Sparkling', () => {
      expect(inferStyle({ wineName: 'Salon Blanc de Blancs' })).toBe('Sparkling')
    })
  })

  describe('dessert', () => {
    it('Sauternes region → Dessert', () => {
      expect(inferStyle({ region: 'Sauternes' })).toBe('Dessert')
    })

    it('Tokaj region → Dessert', () => {
      expect(inferStyle({ region: 'Tokaj' })).toBe('Dessert')
    })

    it('wine name containing "Late Harvest" → Dessert', () => {
      expect(inferStyle({ wineName: 'Late Harvest Riesling' })).toBe('Dessert')
    })
  })

  describe('fortified', () => {
    it('Port → Fortified', () => {
      expect(inferStyle({ varietal: 'Port' })).toBe('Fortified')
    })

    it('wine name containing "Sherry" → Fortified', () => {
      expect(inferStyle({ wineName: 'Fino Sherry' })).toBe('Fortified')
    })

    it('wine name containing "Madeira" → Fortified', () => {
      expect(inferStyle({ wineName: 'Blandy\'s Madeira' })).toBe('Fortified')
    })
  })

  describe('rosé', () => {
    it('wine name containing "Rosé" → Rosé', () => {
      expect(inferStyle({ wineName: 'Whispering Angel Rosé' })).toBe('Rosé')
    })

    it('varietal "Rosato" → Rosé', () => {
      expect(inferStyle({ varietal: 'Rosato' })).toBe('Rosé')
    })
  })

  describe('priority ordering', () => {
    it('Rosé keyword takes priority over red varietal', () => {
      expect(inferStyle({ varietal: 'Cabernet Sauvignon', wineName: 'Rosé of Cabernet' })).toBe('Rosé')
    })

    it('Fortified takes priority over red varietal', () => {
      expect(inferStyle({ wineName: 'Vintage Port', varietal: 'Touriga Nacional' })).toBe('Fortified')
    })

    it('Dessert region takes priority over white varietal', () => {
      expect(inferStyle({ region: 'Sauternes', varietal: 'Semillon' })).toBe('Dessert')
    })
  })

  describe('graceful null return', () => {
    it('unknown varietal with unknown region → null', () => {
      expect(inferStyle({ varietal: 'Obscure Grape', region: 'Unknown Place' })).toBeNull()
    })

    it('all empty inputs → null', () => {
      expect(inferStyle({})).toBeNull()
    })

    it('null fields → null', () => {
      expect(inferStyle({ varietal: null, region: null, wineName: null })).toBeNull()
    })
  })
})
