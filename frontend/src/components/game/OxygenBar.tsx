import { useEffect, useState } from 'react'

interface Props {
  value: number
  animated?: boolean
}

export default function OxygenBar({ value, animated }: Props) {
  const [display, setDisplay] = useState(animated ? 0 : value)

  useEffect(() => {
    if (!animated) { setDisplay(value); return }
    const step = value / 40
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + step, value)
      setDisplay(Math.round(current))
      if (current >= value) clearInterval(timer)
    }, 40)
    return () => clearInterval(timer)
  }, [value, animated])

  const color = display < 30 ? '#c0392b' : display < 60 ? '#e0a030' : '#4fc3a0'

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div className="px-progress" style={{ width: '100%' }}>
        <div className="px-progress-fill" style={{ width: `${display}%`, background: color, transition: 'background 0.3s' }} />
      </div>
      <span style={{ fontFamily: 'var(--pixel-font)', fontSize: '7px', color, textAlign: 'right' }}>
        {display}%
      </span>
    </div>
  )
}
