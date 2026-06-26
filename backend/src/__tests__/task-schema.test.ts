import { describe, it, expect } from 'vitest'
import { canWater, daysToStage } from '../schemas/task.js'

describe('canWater', () => {
  it('retorna true quando nunca regou', () => {
    expect(canWater(null)).toBe(true)
  })

  it('retorna false quando regou agora', () => {
    expect(canWater(new Date())).toBe(false)
  })

  it('retorna false quando regou ha 6h', () => {
    const t = new Date(Date.now() - 6 * 60 * 60 * 1000)
    expect(canWater(t)).toBe(false)
  })

  it('retorna true quando regou ha mais de 12h', () => {
    const t = new Date(Date.now() - 13 * 60 * 60 * 1000)
    expect(canWater(t)).toBe(true)
  })
})

describe('daysToStage', () => {
  it('retorna SEED no mesmo dia', () => {
    expect(daysToStage(new Date())).toBe('SEED')
  })

  it('retorna SPROUT apos 2 dias', () => {
    const t = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    expect(daysToStage(t)).toBe('SPROUT')
  })

  it('retorna SAPLING apos 4 dias', () => {
    const t = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    expect(daysToStage(t)).toBe('SAPLING')
  })

  it('retorna TREE apos 6 dias', () => {
    const t = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    expect(daysToStage(t)).toBe('TREE')
  })

  it('retorna FRUIT apos 7+ dias', () => {
    const t = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    expect(daysToStage(t)).toBe('FRUIT')
  })
})
