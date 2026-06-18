import { useEffect, useState } from 'react'
import PixelCharacter from './PixelCharacter'
import PixelPlant from './PixelPlant'

type Stage = 'SEED' | 'SPROUT' | 'SAPLING' | 'TREE' | 'FRUIT'

interface ScenePlant {
  id: string
  stage: Stage
}

interface Props {
  plants: ScenePlant[]
  activeId?: string
}

export default function GameScene({ plants, activeId }: Props) {
  const [charPos, setCharPos] = useState(0)
  const [walking, setWalking] = useState(false)
  const [step, setStep] = useState(false)

  const visible = plants.slice(0, 5)

  useEffect(() => {
    if (!activeId) return
    const idx = visible.findIndex((p) => p.id === activeId)
    if (idx === -1) return

    const targetPct = 15 + idx * (70 / Math.max(visible.length, 1))
    setWalking(true)
    setCharPos(targetPct)

    const stepInterval = setInterval(() => setStep((s) => !s), 150)
    const stopTimer = setTimeout(() => {
      setWalking(false)
      clearInterval(stepInterval)
    }, 600)

    return () => { clearTimeout(stopTimer); clearInterval(stepInterval) }
  }, [activeId])

  return (
    <div style={styles.scene}>
      {/* Ground */}
      <div style={styles.ground} />

      {/* Dust particles when walking */}
      {walking && (
        <>
          <div style={{ ...styles.dust, left: `${charPos - 2}%`, animationDelay: '0s' }} />
          <div style={{ ...styles.dust, left: `${charPos - 4}%`, animationDelay: '0.15s' }} />
        </>
      )}

      {/* Character */}
      <div style={{
        ...styles.charWrap,
        left: `${charPos}%`,
        transition: 'left 0.5s steps(8)',
        transform: walking && step ? 'translateY(-2px)' : 'translateY(0px)',
      }}>
        <PixelCharacter size={48} />
      </div>

      {/* Plants */}
      {visible.map((plant, i) => {
        const pos = 15 + i * (70 / Math.max(visible.length, 1))
        return (
          <div key={plant.id} style={{ ...styles.plantWrap, left: `${pos + 8}%` }}>
            <PixelPlant stage={plant.stage} size={36} glow={plant.id === activeId} />
          </div>
        )
      })}

      {/* Empty state */}
      {visible.length === 0 && (
        <p style={styles.hint}>Plante sua primeira semente...</p>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  scene: {
    width: '100%',
    height: '110px',
    background: 'linear-gradient(180deg, #1a0e05 0%, #0d0d0d 70%)',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '2px solid var(--border)',
    imageRendering: 'pixelated',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '6px',
    background: 'repeating-linear-gradient(90deg, #3d2a0a 0px, #3d2a0a 8px, #2a1a06 8px, #2a1a06 16px)',
  },
  charWrap: {
    position: 'absolute',
    bottom: '6px',
    transition: 'left 0.5s steps(8)',
  },
  plantWrap: {
    position: 'absolute',
    bottom: '6px',
  },
  dust: {
    position: 'absolute',
    bottom: '10px',
    width: '4px',
    height: '4px',
    background: 'var(--sand)',
    opacity: 0.5,
    animation: 'dust 0.4s ease-out forwards',
  },
  hint: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'var(--pixel-font)',
    fontSize: '6px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
}
