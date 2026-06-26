import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OxygenBar from '../components/game/OxygenBar'

describe('OxygenBar', () => {
  it('exibe o percentual correto', () => {
    render(<OxygenBar value={75} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('cor vermelha quando O2 baixo (< 30)', () => {
    const { container } = render(<OxygenBar value={20} />)
    const fill = container.querySelector('.px-progress-fill') as HTMLElement
    expect(fill.style.background).toBe('rgb(192, 57, 43)')
  })

  it('cor laranja quando O2 medio (30-60)', () => {
    const { container } = render(<OxygenBar value={50} />)
    const fill = container.querySelector('.px-progress-fill') as HTMLElement
    expect(fill.style.background).toBe('rgb(224, 160, 48)')
  })

  it('cor verde quando O2 alto (>= 60)', () => {
    const { container } = render(<OxygenBar value={80} />)
    const fill = container.querySelector('.px-progress-fill') as HTMLElement
    expect(fill.style.background).toBe('rgb(79, 195, 160)')
  })

  it('fill width corresponde ao valor', () => {
    const { container } = render(<OxygenBar value={60} />)
    const fill = container.querySelector('.px-progress-fill') as HTMLElement
    expect(fill.style.width).toBe('60%')
  })
})
