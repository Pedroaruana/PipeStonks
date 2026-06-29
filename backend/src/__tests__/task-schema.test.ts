import { describe, it, expect } from 'vitest'
import { canWater, daysToStage, isDead } from '../schemas/task.js'

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

describe('isDead', () => {
  it('nao morre se foi regada agora', () => {
    expect(isDead(new Date(), new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))).toBe(false)
  })

  it('nao morre se foi regada ha 12h', () => {
    const t = new Date(Date.now() - 12 * 60 * 60 * 1000)
    expect(isDead(t, new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))).toBe(false)
  })

  it('morre se foi regada ha mais de 24h', () => {
    const t = new Date(Date.now() - 25 * 60 * 60 * 1000)
    expect(isDead(t, new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))).toBe(true)
  })

  it('morre se nunca foi regada e foi plantada ha mais de 24h', () => {
    const planted = new Date(Date.now() - 26 * 60 * 60 * 1000)
    expect(isDead(null, planted)).toBe(true)
  })

  it('nao morre se nunca foi regada mas plantada ha menos de 24h', () => {
    const planted = new Date(Date.now() - 5 * 60 * 60 * 1000)
    expect(isDead(null, planted)).toBe(false)
  })
})
