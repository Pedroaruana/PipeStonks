import type { CSSProperties } from 'react'

type Stage = 'SEED' | 'SPROUT' | 'SAPLING' | 'TREE' | 'FRUIT'

interface Props {
  stage: Stage
  label?: string
  glow?: boolean
  size?: number
}

export default function PixelPlant({ stage, label, glow = false, size = 48 }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ ...styles.pot, width: size, height: size * 1.2, boxShadow: glow ? '0 0 12px rgba(122,182,72,0.6)' : undefined }}>
        <PlantSprite stage={stage} size={size} />
        {/* Pot */}
        <div style={{ ...styles.potBase, width: size * 0.7, height: size * 0.25, bottom: 0 }} />
      </div>
      {label && <span style={styles.label}>{label}</span>}
    </div>
  )
}

function PlantSprite({ stage, size }: { stage: Stage; size: number }) {
  const s = size / 48
  switch (stage) {
    case 'SEED':
      return (
        <div style={{ position: 'absolute', bottom: size * 0.25, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 8 * s, height: 8 * s, background: '#8B6914', border: '2px solid #5c4010', borderRadius: '50%' }} />
        </div>
      )
    case 'SPROUT':
      return (
        <div style={{ position: 'absolute', bottom: size * 0.25, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 2 * s, height: 12 * s, background: '#7ab648', margin: '0 auto' }} />
          <div style={{ width: 8 * s, height: 6 * s, background: '#4d9e22', borderRadius: '50% 50% 0 0', marginTop: -12 * s }} />
        </div>
      )
    case 'SAPLING':
      return (
        <div style={{ position: 'absolute', bottom: size * 0.25, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 3 * s, height: 20 * s, background: '#6b4c1e', margin: '0 auto' }} />
          <div style={{ width: 16 * s, height: 12 * s, background: '#4d9e22', borderRadius: '50% 50% 20% 20%', marginTop: -22 * s, marginLeft: -6 * s }} />
          <div style={{ width: 10 * s, height: 8 * s, background: '#7ab648', borderRadius: '50%', marginTop: -8 * s, marginLeft: 0 }} />
        </div>
      )
    case 'TREE':
      return (
        <div style={{ position: 'absolute', bottom: size * 0.25, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 5 * s, height: 28 * s, background: '#5c3a10', margin: '0 auto' }} />
          <div style={{ width: 24 * s, height: 18 * s, background: '#2d7a14', borderRadius: '50% 50% 30% 30%', marginTop: -30 * s, marginLeft: -10 * s }} />
          <div style={{ width: 18 * s, height: 14 * s, background: '#4d9e22', borderRadius: '50%', marginTop: -10 * s, marginLeft: -4 * s }} />
          <div style={{ width: 12 * s, height: 10 * s, background: '#7ab648', borderRadius: '50%', marginTop: -8 * s }} />
        </div>
      )
    case 'FRUIT':
      return (
        <div style={{ position: 'absolute', bottom: size * 0.25, left: '50%', transform: 'translateX(-50%)' }} className="animate-grow">
          <div style={{ width: 5 * s, height: 28 * s, background: '#5c3a10', margin: '0 auto' }} />
          <div style={{ width: 26 * s, height: 20 * s, background: '#2d7a14', borderRadius: '50% 50% 30% 30%', marginTop: -32 * s, marginLeft: -11 * s }} />
          <div style={{ width: 18 * s, height: 14 * s, background: '#4d9e22', borderRadius: '50%', marginTop: -10 * s, marginLeft: -4 * s }} />
          {/* Fruits */}
          {[[-8, -4], [4, -2], [-2, -8]].map(([x, y], i) => (
            <div key={i} style={{ width: 6 * s, height: 6 * s, background: '#e05a2b', borderRadius: '50%', border: '1px solid #a03010', position: 'absolute', top: (20 + y) * s, left: (13 + x) * s }} />
          ))}
        </div>
      )
  }
}

const styles: Record<string, CSSProperties> = {
  pot: {
    position: 'relative',
    imageRendering: 'pixelated',
  },
  potBase: {
    position: 'absolute',
    background: '#6b4c1e',
    border: '2px solid #3d2a0a',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  label: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '6px',
    color: 'var(--text-secondary)',
    textAlign: 'center' as const,
  },
}
