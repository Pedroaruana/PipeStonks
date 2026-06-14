import type { CSSProperties } from 'react'

interface Props {
  size?: number
}

export default function PixelCharacter({ size = 64 }: Props) {
  const s = size / 64
  return (
    <div className="animate-float" style={{ ...styles.wrap, width: size, height: size * 1.5 }}>
      {/* Head */}
      <div style={{ ...styles.head, width: 32 * s, height: 28 * s, top: 0, left: 16 * s }}>
        {/* Goggles */}
        <div style={{ ...styles.goggle, width: 8 * s, height: 6 * s, top: 8 * s, left: 4 * s, background: '#4fc3a0' }} />
        <div style={{ ...styles.goggle, width: 8 * s, height: 6 * s, top: 8 * s, left: 20 * s, background: '#4fc3a0' }} />
        <div style={{ width: 4 * s, height: 2 * s, background: '#2a2a2a', position: 'absolute', top: 10 * s, left: 14 * s }} />
        {/* Mask */}
        <div style={{ ...styles.mask, width: 24 * s, height: 10 * s, bottom: 0, left: 4 * s }} />
        <div style={{ ...styles.maskFilter, width: 6 * s, height: 4 * s, bottom: 3 * s, left: 13 * s }} />
      </div>

      {/* Body */}
      <div style={{ ...styles.body, width: 36 * s, height: 28 * s, top: 26 * s, left: 14 * s }}>
        {/* Worn jacket detail */}
        <div style={{ width: 2 * s, height: 16 * s, background: '#3d2e10', position: 'absolute', top: 4 * s, left: 8 * s }} />
        <div style={{ width: 2 * s, height: 16 * s, background: '#3d2e10', position: 'absolute', top: 4 * s, right: 8 * s }} />
      </div>

      {/* Left arm */}
      <div style={{ ...styles.arm, width: 10 * s, height: 22 * s, top: 28 * s, left: 4 * s }} />
      {/* Right arm holding a small plant */}
      <div style={{ ...styles.arm, width: 10 * s, height: 22 * s, top: 28 * s, right: 4 * s }}>
        <div className="animate-grow" style={{ position: 'absolute', bottom: -6 * s, left: 1 * s, width: 8 * s, height: 10 * s }}>
          <div style={{ width: 2 * s, height: 6 * s, background: '#7ab648', position: 'absolute', bottom: 0, left: 3 * s }} />
          <div style={{ width: 6 * s, height: 4 * s, background: '#4d9e22', borderRadius: '50% 50% 0 0', position: 'absolute', top: 0, left: 1 * s }} />
        </div>
      </div>

      {/* Legs */}
      <div style={{ ...styles.leg, width: 14 * s, height: 26 * s, bottom: 0, left: 14 * s }} />
      <div style={{ ...styles.leg, width: 14 * s, height: 26 * s, bottom: 0, right: 14 * s }} />

      {/* Boots */}
      <div style={{ ...styles.boot, width: 16 * s, height: 8 * s, bottom: 0, left: 12 * s }} />
      <div style={{ ...styles.boot, width: 16 * s, height: 8 * s, bottom: 0, right: 12 * s }} />
    </div>
  )
}

const base: CSSProperties = { position: 'absolute', imageRendering: 'pixelated' }

const styles: Record<string, CSSProperties> = {
  wrap: { position: 'relative', imageRendering: 'pixelated' },
  head: { ...base, background: '#c8a060', border: '2px solid #5c3a10' },
  goggle: { ...base, border: '2px solid #2d8a74', boxShadow: '0 0 4px #4fc3a0' },
  mask: { ...base, background: '#2a2a2a', border: '2px solid #444' },
  maskFilter: { ...base, background: '#1a1a1a', border: '1px solid #555', display: 'grid', placeItems: 'center' },
  body: { ...base, background: '#4a3828', border: '2px solid #2a1e10' },
  arm: { ...base, background: '#3a2a18', border: '2px solid #1e1208', borderRadius: '2px' },
  leg: { ...base, background: '#2a2218', border: '2px solid #14100a' },
  boot: { ...base, background: '#1a1410', border: '2px solid #0a0806' },
}
