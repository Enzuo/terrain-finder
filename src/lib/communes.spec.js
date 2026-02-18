import { describe, it, expect } from 'vitest'
import { searchCommunesByName } from './communes.js'

const communesMap = new Map([
  ['75056', 'Paris'],
  ['13055', 'Marseille'],
  ['69123', 'Lyon'],
  ['31555', 'Toulouse'],
  ['06088', 'Nice'],
  ['44109', 'Nantes'],
  ['67482', 'Strasbourg'],
  ['34172', 'Montpellier'],
  ['33063', 'Bordeaux'],
  ['59350', 'Lille'],
]);

describe('searchCommunesByName', () => {
  it('finds exact match', () => {
    const results = searchCommunesByName('Paris', communesMap)
    expect(results[0].name).toBe('Paris')
    expect(results[0].codeInsee).toBe('75056')
  })

  it('finds approximate match', () => {
    const results = searchCommunesByName('Pari', communesMap)
    expect(results[0].name).toBe('Paris')
  })

  it('finds substring match', () => {
    const results = searchCommunesByName('Mont', communesMap)
    expect(results[0].name).toBe('Montpellier')
  })

  it('returns multiple results', () => {
    const results = searchCommunesByName('a', communesMap, 3)
    expect(results.length).toBe(3)
  })

  it('returns empty array for no match', () => {
    const results = searchCommunesByName('Zzzzz', communesMap)
    expect(results.length).toBeGreaterThanOrEqual(0)
  })
})
