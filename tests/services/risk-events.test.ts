import { describe, expect, it } from 'vitest'
import { sanitizeRiskMeta } from '@/src/server/services/risk-events'

describe('sanitizeRiskMeta', () => {
  it('removes textual keys to preservar privacidade', () => {
    const sanitized = sanitizeRiskMeta({
      raw_text: 'conteúdo sensível',
      classifier: 'heuristic',
      confidence: 0.9,
    })

    expect(sanitized).toEqual({
      classifier: 'heuristic',
      confidence: 0.9,
    })
  })

  it('retains numeric and boolean metadata', () => {
    const sanitized = sanitizeRiskMeta({
      score: 0.75,
      severity: 'HIGH',
      flag: true,
    })

    expect(sanitized).toEqual({
      score: 0.75,
      severity: 'HIGH',
      flag: true,
    })
  })

  it('returns null when nothing whitelisted remains', () => {
    const sanitized = sanitizeRiskMeta({
      messageContent: 'texto',
    })

    expect(sanitized).toBeNull()
  })
})
