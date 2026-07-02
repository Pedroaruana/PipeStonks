import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { useVisitorStore } from '../store/visitor'
import OxygenBar from '../components/game/OxygenBar'
import bgImg from '../17367799ea49b197516286c72f29ac27.jpg'

const MAX_SLOTS = 6

interface Task {
  id: string
  title: string
  stage: 'SEED' | 'SPROUT' | 'SAPLING' | 'TREE' | 'FRUIT'
  lastWateredAt?: string | null
  createdAt?: string
  plantedAt?: string
}

function canWaterNow(lastWateredAt?: string | null): boolean {
  if (!lastWateredAt) return true
  return Date.now() - new Date(lastWateredAt).getTime() >= 12 * 60 * 60 * 1000
}

function countdown(lastWateredAt: string): string | null {
  const next = new Date(lastWateredAt).getTime() + 12 * 60 * 60 * 1000
  const diff = next - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

const STAGE_LABEL: Record<Task['stage'], string> = {
  SEED: 'SEMENTE', SPROUT: 'BROTO', SAPLING: 'MUDA', TREE: 'CRESCENDO', FRUIT: 'PRONTA!'
}

// 6 plant types — each slot has its own plant
const PLANT_TYPES = ['sunflower', 'cactus', 'tulip', 'rose', 'monstera', 'fern'] as const
type PlantType = typeof PLANT_TYPES[number]

function PlantSVG({ type, stage }: { type: PlantType; stage: Task['stage'] }) {
  const s = stage === 'SEED' ? 0 : stage === 'SPROUT' ? 1 : stage === 'SAPLING' ? 2 : stage === 'TREE' ? 3 : 4

  if (stage === 'SEED') {
    return (
      <svg width="80" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated', display: 'block' }}>
        <ellipse cx="40" cy="44" rx="6" ry="4" fill="#6b4c1e"/>
        <ellipse cx="40" cy="43" rx="4" ry="3" fill="#8B6432"/>
      </svg>
    )
  }

  if (type === 'sunflower') {
    return (
      <svg width="80" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {s >= 1 && <rect x="39" y={52 - s * 10} width="2" height={s * 10} fill="#4a8c1e"/>}
        {s >= 2 && <>
          <rect x="30" y={38 - s * 3} width="8" height="3" fill="#4a8c1e" transform="rotate(-30,34,39)"/>
          <rect x="42" y={38 - s * 3} width="8" height="3" fill="#4a8c1e" transform="rotate(30,46,39)"/>
        </>}
        {s >= 3 && <>
          <circle cx="40" cy={28 - s} r={6 + s} fill="#e8b820"/>
          <circle cx="40" cy={28 - s} r={4 + s * 0.5} fill="#c48c10"/>
          <circle cx="40" cy={28 - s} r={2 + s * 0.3} fill="#5c3010"/>
          {[0,45,90,135,180,225,270,315].map((a, i) => {
            const rad = a * Math.PI / 180
            const px = 40 + Math.cos(rad) * (8 + s)
            const py = (28 - s) + Math.sin(rad) * (8 + s)
            return <ellipse key={i} cx={px} cy={py} rx="3" ry="5" fill="#e8c030" transform={`rotate(${a},${px},${py})`}/>
          })}
        </>}
        {s === 4 && <circle cx="40" cy={24 - s} r={3} fill="#8B4c10"/>}
      </svg>
    )
  }

  if (type === 'cactus') {
    return (
      <svg width="80" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {s >= 1 && <rect x="37" y={52 - s * 8} width="6" height={s * 8} fill="#3d8c20"/>}
        {s >= 2 && <>
          <rect x="37" y="28" width="6" height={s * 6} fill="#3d8c20"/>
          <rect x="26" y="24" width={s * 3} height="5" fill="#3d8c20"/>
          <rect x={54 - s * 3} y="30" width={s * 3} height="5" fill="#3d8c20"/>
        </>}
        {s >= 3 && <>
          <rect x="24" y="16" width="5" height="14" fill="#3d8c20"/>
          <rect x="51" y="22" width="5" height="14" fill="#3d8c20"/>
          {[28,33,38,43,48].map(x => <line key={x} x1={x} y1="26" x2={x} y2={26 + s * 4} stroke="#2d6c10" strokeWidth="1"/>)}
        </>}
        {s === 4 && <>
          <circle cx="40" cy="14" r="5" fill="#e84870"/>
          <circle cx="25" cy="12" r="4" fill="#e84870"/>
          <circle cx="55" cy="18" r="4" fill="#e84870"/>
        </>}
      </svg>
    )
  }

  if (type === 'tulip') {
    return (
      <svg width="80" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {s >= 1 && <rect x="39" y={52 - s * 10} width="2" height={s * 10} fill="#4a8c1e"/>}
        {s >= 2 && <>
          <rect x="30" y="34" width="7" height="3" fill="#5aaa20" transform="rotate(-20,33,35)"/>
          <rect x="43" y="36" width="7" height="3" fill="#5aaa20" transform="rotate(20,47,37)"/>
        </>}
        {s >= 3 && <ellipse cx="40" cy={28 - s * 2} rx={4 + s} ry={6 + s} fill="#e84040"/>}
        {s === 4 && <>
          <ellipse cx="36" cy={24 - s} rx="4" ry="7" fill="#e84040"/>
          <ellipse cx="44" cy={24 - s} rx="4" ry="7" fill="#ff6060"/>
          <ellipse cx="40" cy={22 - s} rx="3" ry="5" fill="#ff8080"/>
        </>}
      </svg>
    )
  }

  if (type === 'rose') {
    return (
      <svg width="80" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {s >= 1 && <rect x="39" y={52 - s * 9} width="2" height={s * 9} fill="#3a7c10"/>}
        {s >= 2 && <>
          <ellipse cx="32" cy="38" rx="7" ry="4" fill="#4aaa20" transform="rotate(-30,32,38)"/>
          <ellipse cx="48" cy="40" rx="7" ry="4" fill="#4aaa20" transform="rotate(20,48,40)"/>
        </>}
        {s >= 3 && <>
          <circle cx="40" cy={26 - s} r={4 + s} fill="#cc2060"/>
          <circle cx="40" cy={24 - s} r={3 + s * 0.6} fill="#e83070"/>
          <circle cx="40" cy={22 - s} r={2 + s * 0.3} fill="#ff6090"/>
        </>}
        {s === 4 && <>
          <ellipse cx="33" cy="20" rx="4" ry="6" fill="#cc2060"/>
          <ellipse cx="47" cy="22" rx="4" ry="6" fill="#e83070"/>
          <circle cx="40" cy="16" r="6" fill="#ff5088"/>
          <circle cx="40" cy="15" r="3" fill="#ff80aa"/>
        </>}
      </svg>
    )
  }

  if (type === 'monstera') {
    return (
      <svg width="80" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated', display: 'block' }}>
        {s >= 1 && <rect x="39" y={52 - s * 8} width="2" height={s * 8} fill="#2d6c10"/>}
        {s >= 2 && <>
          <ellipse cx="30" cy={38 - s} rx={8 + s} ry={5 + s} fill="#2d8c20" transform="rotate(-20,30,38)"/>
          <ellipse cx="50" cy={40 - s} rx={8 + s} ry={5 + s} fill="#2d8c20" transform="rotate(20,50,40)"/>
        </>}
        {s >= 3 && <>
          <ellipse cx="26" cy={28 - s} rx="12" ry="8" fill="#3aaa28" transform="rotate(-30,26,28)"/>
          <rect x="20" y={26 - s} width="3" height="5" fill="#1E0E04"/>
          <rect x="26" y={22 - s} width="3" height="4" fill="#1E0E04"/>
          <ellipse cx="54" cy={30 - s} rx="12" ry="8" fill="#3aaa28" transform="rotate(30,54,30)"/>
          <rect x="51" y={28 - s} width="3" height="5" fill="#1E0E04"/>
          <rect x="57" y={24 - s} width="3" height="4" fill="#1E0E04"/>
        </>}
        {s === 4 && <>
          <ellipse cx="26" cy="18" rx="14" ry="10" fill="#4db830" transform="rotate(-25,26,18)"/>
          <ellipse cx="54" cy="20" rx="14" ry="10" fill="#4db830" transform="rotate(25,54,20)"/>
          <rect x="20" y="16" width="3" height="6" fill="#1E0E04"/>
          <rect x="27" y="12" width="3" height="5" fill="#1E0E04"/>
          <rect x="51" y="18" width="3" height="6" fill="#1E0E04"/>
          <rect x="57" y="14" width="3" height="5" fill="#1E0E04"/>
        </>}
      </svg>
    )
  }

  // fern
  return (
    <svg width="80" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {s >= 1 && <rect x="39" y={52 - s * 8} width="2" height={s * 8} fill="#4a9c1e"/>}
      {s >= 2 && <>
        <path d={`M40,44 Q28,${38 - s * 3} 20,${32 - s * 2}`} stroke="#5aaa20" strokeWidth="2" fill="none"/>
        <path d={`M40,44 Q52,${38 - s * 3} 60,${32 - s * 2}`} stroke="#5aaa20" strokeWidth="2" fill="none"/>
        {[0,1,2,3].map(i => <ellipse key={i} cx={27 + i * 4} cy={38 - s * 2 - i * 3} rx="4" ry="2" fill="#5aaa20" transform={`rotate(-30,${27 + i * 4},${38 - s * 2 - i * 3})`}/>)}
        {[0,1,2,3].map(i => <ellipse key={i} cx={53 - i * 4} cy={38 - s * 2 - i * 3} rx="4" ry="2" fill="#5aaa20" transform={`rotate(30,${53 - i * 4},${38 - s * 2 - i * 3})`}/>)}
      </>}
      {s >= 3 && <>
        <path d={`M40,40 Q22,${28 - s * 2} 14,${18 - s}`} stroke="#4a9c1e" strokeWidth="2" fill="none"/>
        <path d={`M40,40 Q58,${28 - s * 2} 66,${18 - s}`} stroke="#4a9c1e" strokeWidth="2" fill="none"/>
        {[0,1,2,3,4].map(i => <ellipse key={i} cx={21 + i * 5} cy={28 - s - i * 3} rx="5" ry="2" fill="#4a9c1e" transform={`rotate(-25,${21 + i * 5},${28 - s - i * 3})`}/>)}
        {[0,1,2,3,4].map(i => <ellipse key={i} cx={59 - i * 5} cy={28 - s - i * 3} rx="5" ry="2" fill="#4a9c1e" transform={`rotate(25,${59 - i * 5},${28 - s - i * 3})`}/>)}
      </>}
      {s === 4 && <>
        <ellipse cx="40" cy="18" rx="5" ry="8" fill="#6ec030"/>
        <circle cx="38" cy="14" r="3" fill="#ffe060"/>
        <circle cx="42" cy="16" r="2" fill="#ffe060"/>
      </>}
    </svg>
  )
}

function PixelPot() {
  return (
    <svg width="76" height="72" viewBox="0 0 76 72" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="4" y="14" width="68" height="10" fill="#7A2808" rx="1"/>
      <rect x="6" y="15" width="64" height="8" fill="#C84820" rx="1"/>
      <rect x="6" y="15" width="64" height="3" fill="#E06830"/>
      <rect x="6" y="21" width="64" height="2" fill="#9B3410"/>
      <rect x="8" y="20" width="60" height="5" fill="#1E0E04"/>
      <rect x="13" y="21" width="4" height="2" fill="#0E0702"/>
      <rect x="26" y="22" width="5" height="1" fill="#0E0702"/>
      <rect x="44" y="21" width="4" height="2" fill="#0E0702"/>
      <rect x="56" y="22" width="4" height="1" fill="#0E0702"/>
      <polygon points="12,25 64,25 57,66 19,66" fill="#C84820"/>
      <polygon points="12,25 22,25 15,66 19,66" fill="#7A2808"/>
      <polygon points="22,25 30,25 23,66 15,66" fill="#A83C18" opacity="0.45"/>
      <polygon points="50,25 64,25 57,66 46,66" fill="#E06830" opacity="0.35"/>
      <line x1="13" y1="36" x2="63" y2="36" stroke="#9B3410" strokeWidth="1" opacity="0.5"/>
      <line x1="14" y1="48" x2="62" y2="48" stroke="#9B3410" strokeWidth="1" opacity="0.5"/>
      <line x1="15" y1="59" x2="61" y2="59" stroke="#9B3410" strokeWidth="1" opacity="0.5"/>
      <polyline points="40,29 38,41 41,46 39,54" stroke="#7A2808" strokeWidth="1.5" fill="none" opacity="0.65"/>
      <rect x="19" y="64" width="38" height="6" fill="#7A2808" rx="1"/>
      <rect x="21" y="65" width="34" height="4" fill="#9B3410" rx="1"/>
    </svg>
  )
}

const PLANT_NAMES: Record<PlantType, string> = {
  sunflower: 'GIRASSOL', cactus: 'CACTO', tulip: 'TULIPA',
  rose: 'ROSA', monstera: 'MONSTERA', fern: 'SAMAMBAIA'
}

const BRACKET = '#c4a35a'
const B = 12

interface PotSlotProps {
  task?: Task
  slotIndex: number
  onWater: (id: string) => void
  onPlant: (title: string) => void
  onHarvest: (id: string) => void
}

function PotSlot({ task, slotIndex, onWater, onPlant, onHarvest }: PotSlotProps) {
  const [planting, setPlanting] = useState(false)
  const [title, setTitle] = useState('')
  const [stageAnim, setStageAnim] = useState(false)
  const prevStageRef = useRef<string | undefined>(undefined)
  const plantType = PLANT_TYPES[slotIndex]
  const occupied = !!task
  const waterable = canWaterNow(task?.lastWateredAt)
  const timer = task?.lastWateredAt ? countdown(task.lastWateredAt) : null
  const isFruit = task?.stage === 'FRUIT'

  useEffect(() => {
    if (task?.stage && prevStageRef.current && task.stage !== prevStageRef.current) {
      setStageAnim(true)
      const t = setTimeout(() => setStageAnim(false), 900)
      return () => clearTimeout(t)
    }
    prevStageRef.current = task?.stage
  }, [task?.stage])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    onPlant(t)
    setTitle('')
    setPlanting(false)
  }

  const glowColor = isFruit ? '#e8b820' : occupied ? '#7ab648' : 'transparent'

  return (
    <div style={{
      position: 'relative',
      width: 130,
      padding: '10px 10px 14px',
      background: 'rgba(8,5,2,0.88)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0,
      boxShadow: occupied ? `0 0 18px ${glowColor}33, inset 0 0 30px rgba(0,0,0,0.4)` : 'inset 0 0 30px rgba(0,0,0,0.4)',
    }}>
      {/* Corner brackets */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
        <div key={`${v}${h}`} style={{ position: 'absolute', [v]: 0, [h]: 0, width: B, height: B, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', [v]: 0, [h]: 0, width: B, height: 2, background: BRACKET }}/>
          <div style={{ position: 'absolute', [v]: 0, [h]: 0, width: 2, height: B, background: BRACKET }}/>
        </div>
      ))}

      {/* Slot label */}
      <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', color: '#3d3428', letterSpacing: '2px', marginBottom: 4 }}>
        {occupied ? PLANT_NAMES[plantType] : `VASO ${slotIndex + 1}`}
      </p>

      {/* Plant */}
      <div className={stageAnim ? 'animate-stage-up' : undefined} style={{ width: 80, display: 'flex', justifyContent: 'center', marginBottom: -2 }}>
        <PlantSVG type={plantType} stage={task?.stage ?? 'SEED'} />
      </div>

      {/* Pot */}
      <PixelPot />

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8, width: '100%' }}>
        {task ? (
          <>
            <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#c4a35a', textAlign: 'center' }}>
              {task.title.slice(0, 12)}
            </p>
            <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', color: isFruit ? '#e8b820' : '#4a3f33', letterSpacing: '1px' }}>
              {STAGE_LABEL[task.stage]}
            </p>
            {isFruit ? (
              <button
                style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', background: 'rgba(232,184,32,0.12)', border: '1px solid #e8b820', color: '#e8b820', padding: '4px 10px', cursor: 'pointer', letterSpacing: '1px', animation: 'grow-pulse 1.5s ease-in-out infinite' }}
                onClick={() => onHarvest(task.id)}
              >
                🌾 COLHER
              </button>
            ) : (
              <button
                style={{
                  fontFamily: 'var(--pixel-font)', fontSize: '5px', background: 'transparent',
                  border: `1px solid ${waterable ? '#4fc3a0' : '#3d3428'}`,
                  color: waterable ? '#4fc3a0' : '#3d3428',
                  padding: '4px 8px', cursor: waterable ? 'pointer' : 'not-allowed',
                  letterSpacing: '1px', opacity: waterable ? 1 : 0.5,
                }}
                onClick={() => waterable && onWater(task.id)}
              >
                {timer ? `⏳ ${timer}` : '💧 REGAR'}
              </button>
            )}
          </>
        ) : planting ? (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
            <input
              autoFocus
              style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', background: '#0a0704', border: '1px solid #3d2e10', color: '#e8dcc8', padding: '4px 6px', width: 100, outline: 'none' }}
              placeholder="nome..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={18}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', background: 'transparent', border: '1px solid #7ab648', color: '#7ab648', padding: '3px 8px', cursor: 'pointer' }} type="submit">✓</button>
              <button style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', background: 'transparent', border: '1px solid #6b6055', color: '#6b6055', padding: '3px 8px', cursor: 'pointer' }} type="button" onClick={() => { setPlanting(false); setTitle('') }}>✕</button>
            </div>
          </form>
        ) : (
          <button
            style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', background: 'transparent', border: '1px solid #7ab648', color: '#7ab648', padding: '4px 10px', cursor: 'pointer', letterSpacing: '1px' }}
            onClick={() => setPlanting(true)}
          >
            🌱 PLANTAR
          </button>
        )}
      </div>
    </div>
  )
}

// ── Toast system ────────────────────────────────────────────────────────────
interface Toast { id: number; msg: string; type: 'ok' | 'err' | 'info' }
let _toastId = 0
const _listeners = new Set<(t: Toast) => void>()
function emitToast(msg: string, type: Toast['type'] = 'ok') {
  const t = { id: ++_toastId, msg, type }
  _listeners.forEach((fn) => fn(t))
}
export const toast = {
  ok:   (msg: string) => emitToast(msg, 'ok'),
  err:  (msg: string) => emitToast(msg, 'err'),
  info: (msg: string) => emitToast(msg, 'info'),
}

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3000)
  }, [])
  useEffect(() => {
    _listeners.add(addToast)
    return () => { _listeners.delete(addToast) }
  }, [addToast])
  return toasts
}

const TOAST_COLOR = { ok: '#7ab648', err: '#c0392b', info: '#c4a35a' }

function ToastContainer() {
  const toasts = useToasts()
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          fontFamily: 'var(--pixel-font)',
          fontSize: '6px',
          padding: '8px 14px',
          background: 'rgba(8,5,2,0.96)',
          border: `2px solid ${TOAST_COLOR[t.type]}`,
          color: TOAST_COLOR[t.type],
          letterSpacing: '1px',
          boxShadow: `0 0 12px ${TOAST_COLOR[t.type]}55`,
          animation: 'oxyText 0.2s ease-out both',
          whiteSpace: 'nowrap',
        }}>
          {t.type === 'ok' ? '▶ ' : t.type === 'err' ? '✕ ' : '· '}{t.msg}
        </div>
      ))}
    </div>
  )
}

// ── Ambient FX ───────────────────────────────────────────────────────────────
const ACID_DROPS = Array.from({ length: 18 }, (_, i) => ({
  left: `${4 + (i * 5.4) % 93}%`,
  delay: `${(i * 0.31) % 4}s`,
  dur: `${1.8 + (i * 0.17) % 1.4}s`,
  width: i % 3 === 0 ? 2 : 1,
  height: 6 + (i * 3) % 8,
  color: i % 2 === 0 ? '#7ab64888' : '#4fc3a066',
}))

const DUST_MOTES = Array.from({ length: 14 }, (_, i) => ({
  left: `${6 + (i * 6.8) % 88}%`,
  bottom: `${10 + (i * 7) % 40}%`,
  delay: `${(i * 0.5) % 5}s`,
  dur: `${4 + (i * 0.4) % 4}s`,
  size: 2 + (i % 3),
  dx: `${-20 + (i * 11) % 40}px`,
  color: i % 3 === 0 ? '#c4a35a55' : i % 3 === 1 ? '#6b605588' : '#3d342877',
}))

function AcidRain() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
      {ACID_DROPS.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: d.left,
          width: d.width, height: d.height,
          background: d.color,
          borderRadius: 1,
          animation: `acidDrop ${d.dur} ${d.delay} linear infinite`,
          imageRendering: 'pixelated',
        }} />
      ))}
    </div>
  )
}

function DustParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
      {DUST_MOTES.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: d.left, bottom: d.bottom,
          width: d.size, height: d.size,
          background: d.color,
          ['--dx' as string]: d.dx,
          animation: `dustFloat ${d.dur} ${d.delay} ease-in-out infinite`,
          imageRendering: 'pixelated',
        }} />
      ))}
    </div>
  )
}

const TUTORIAL_KEY = 'wg-tutorial-seen'

const STEPS = [
  { icon: '🌱', text: 'Clique em PLANTAR num vaso vazio para jogar uma semente' },
  { icon: '💧', text: 'Regue sua planta a cada 12 horas para ela crescer' },
  { icon: '📅', text: 'Em 7 dias ela estará PRONTA — cada rega acelera o crescimento' },
  { icon: '🌾', text: 'Quando estiver PRONTA, clique COLHER para ganhar O₂' },
  { icon: '⚡', text: '5 colheitas enchem a barra — e a Terra respira de novo!' },
]

function TutorialModal({ onClose }: { onClose: () => void }) {
  const B = 10
  const SAND = '#c4a35a'

  function close() {
    localStorage.setItem(TUTORIAL_KEY, '1')
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
      <div style={{ position: 'relative', width: 480, background: 'rgba(8,6,2,0.97)', border: '2px solid #3d2e10', padding: '36px 32px 28px' }}>

        {/* Corner brackets */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={`${v}${h}`} style={{ position: 'absolute', [v]: 0, [h]: 0 }}>
            <div style={{ position: 'absolute', [v]: 0, [h]: 0, width: B, height: 2, background: SAND }}/>
            <div style={{ position: 'absolute', [v]: 0, [h]: 0, width: 2, height: B, background: SAND }}/>
          </div>
        ))}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#4a3f33', letterSpacing: '4px', marginBottom: 10 }}>— TUTORIAL —</p>
          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '13px', color: '#c4a35a', letterSpacing: '2px' }}>COMO JOGAR</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 26 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flexShrink: 0, width: 30, height: 30, background: '#1a1208', border: '1px solid #3d2e10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {step.icon}
              </div>
              <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '7px', color: '#8a7a65', lineHeight: 2.2, margin: 0 }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #3d2e10, transparent)', marginBottom: 16 }} />

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={close}
            style={{ fontFamily: 'var(--pixel-font)', fontSize: '8px', background: 'transparent', border: '1px solid #7ab648', color: '#7ab648', padding: '10px 32px', cursor: 'pointer', letterSpacing: '2px' }}
          >
            ENTENDIDO! →
          </button>
        </div>
      </div>
    </div>
  )
}

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  x: 5 + (i * 3.4) % 92,
  delay: (i * 0.18) % 3,
  dur: 2.5 + (i * 0.13) % 2,
  size: 7 + (i * 7) % 12,
  char: ['O₂', '✦', '○', '◇', '✧', '◆'][i % 6],
  color: i % 3 === 0 ? '#4fc3a0' : i % 3 === 1 ? '#7ab648' : '#c4a35a',
}))

function OxygenRestoredOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div onClick={onDone} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,8,4,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', animation: 'oxyIn 0.35s ease-out' }}>

      {/* Shockwave rings */}
      <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '3px solid #4fc3a0', animation: 'shockwave 1.4s 0.1s ease-out forwards', opacity: 0 }} />
      <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '2px solid #7ab648', animation: 'shockwave 1.4s 0.4s ease-out forwards', opacity: 0 }} />
      <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '1px solid #c4a35a', animation: 'shockwave 1.6s 0.7s ease-out forwards', opacity: 0 }} />

      {/* Particles rising */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{ position: 'absolute', bottom: '-10px', left: `${p.x}%`, fontFamily: 'var(--pixel-font)', fontSize: `${p.size}px`, color: p.color, animation: `particleRise ${p.dur}s ${p.delay}s ease-in infinite`, pointerEvents: 'none' }}>
          {p.char}
        </div>
      ))}

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '8px', color: '#4fc3a0', letterSpacing: '6px', animation: 'oxyText 0.5s 0.6s both' }}>— 2056 —</p>

        <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '48px', color: '#7ab648', letterSpacing: '4px', margin: 0, animation: 'oxyText 0.6s 0.9s both', textShadow: '0 0 60px #7ab64888, 0 0 20px #7ab648' }}>
          O₂
        </p>

        <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '13px', color: '#4fc3a0', letterSpacing: '8px', margin: 0, animation: 'scanReveal 1.2s 1.5s both' }}>
          RESTAURADO
        </p>

        <div style={{ width: 200, height: 2, background: 'linear-gradient(90deg, transparent, #7ab648, transparent)', animation: 'oxyText 0.4s 2.4s both', opacity: 0 }} />

        <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '7px', color: '#3d6b28', letterSpacing: '3px', animation: 'oxyText 0.4s 2.6s both' }}>
          A TERRA RESPIRA DE NOVO
        </p>

        <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '7px', color: '#3d8c56', letterSpacing: '2px', marginTop: 8, animation: 'oxyText 0.4s 3s both' }}>
          5 PLANTAS COLHIDAS ✓
        </p>
      </div>

      <p style={{ position: 'absolute', bottom: 24, fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#2a2a2a', letterSpacing: '2px', animation: 'oxyText 0.4s 3.5s both' }}>
        [ CLIQUE PARA CONTINUAR ]
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const updateOxygen = useAuthStore((s) => s.updateOxygen)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const isVisitor = !user && searchParams.get('visitor') === 'true'
  const visitor = useVisitorStore()

  const [showOxyAnim, setShowOxyAnim] = useState(false)
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem(TUTORIAL_KEY))
  const prevOxyRef = useRef(0)

  const { data: apiTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((r) => r.data),
    enabled: !!user,
  })

  useEffect(() => {
    if (user) return
    const killed = visitor.purgeDead()
    if (killed > 0) toast.err(`${killed} planta${killed > 1 ? 's morreram' : ' morreu'} de sede! -${killed * 10} O₂`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const unsortedTasks: Task[] = user
    ? apiTasks
    : visitor.tasks.filter((t) => !(t as { completedAt?: string; diedAt?: string }).completedAt && !(t as { diedAt?: string }).diedAt)

  const tasks: Task[] = [...unsortedTasks].sort((a, b) => {
    const da = new Date(a.plantedAt ?? a.createdAt ?? 0).getTime()
    const db = new Date(b.plantedAt ?? b.createdAt ?? 0).getTime()
    return da - db
  })

  const oxygenLevel = user ? (user.oxygenLevel ?? 0) : visitor.oxygenLevel
  const barValue = oxygenLevel % 100 === 0 && oxygenLevel > 0 ? 100 : oxygenLevel % 100

  useEffect(() => {
    const prev = prevOxyRef.current
    if (Math.floor(oxygenLevel / 100) > Math.floor(prev / 100) && oxygenLevel > 0) {
      setShowOxyAnim(true)
    }
    prevOxyRef.current = oxygenLevel
  }, [oxygenLevel])

  async function syncOxygen() {
    if (!user) return
    const { data } = await api.get('/auth/me')
    if (data?.oxygenLevel !== undefined) updateOxygen(data.oxygenLevel)
  }

  const plantMutation = useMutation({
    mutationFn: (title: string) => api.post('/tasks', { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const waterMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/tasks/${id}/water`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); syncOxygen() },
  })

  const harvestMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/tasks/${id}/harvest`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); syncOxygen() },
  })

  function handlePlant(title: string) {
    if (!user) visitor.addTask(title, '')
    else plantMutation.mutate(title)
    toast.ok(`${title.slice(0, 10)} plantada!`)
  }

  function handleWater(id: string) {
    if (!user) visitor.waterTask(id)
    else waterMutation.mutate(id)
    toast.info('Regada — próxima em 8h')
  }

  function handleHarvest(id: string) {
    if (!user) visitor.harvestTask(id)
    else harvestMutation.mutate(id)
    toast.ok('+10 O₂ coletado!')
  }

  const slots: (Task | undefined)[] = Array.from({ length: MAX_SLOTS }, (_, i) => tasks[i])

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <ToastContainer />
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      {showOxyAnim && <OxygenRestoredOverlay onDone={() => setShowOxyAnim(false)} />}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, imageRendering: 'pixelated' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.62)', zIndex: 1 }} />
      <AcidRain />
      <DustParticles />

      <header className="wg-header" style={{ position: 'relative', zIndex: 10, background: 'rgba(8,6,3,0.92)', borderBottom: '2px solid #3d3428', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--pixel-font)', fontSize: '10px', color: '#7ab648' }}>🌱 WASTELAND GARDEN</span>
          <span style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#8a7a65' }}>{isVisitor ? 'Modo visitante' : user?.name}</span>
        </div>
        <div className="wg-header-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="wg-oxygen-bar" style={{ width: 120 }}>
            <span style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#4fc3a0', display: 'block', marginBottom: 2 }}>O₂ {oxygenLevel}</span>
            <OxygenBar value={barValue} />
          </div>
          <Link to="/history" style={{ fontFamily: 'var(--pixel-font)', fontSize: '7px', color: '#c4a35a', textDecoration: 'none' }}>Estufa</Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
            <button className="px-btn px-btn-red" onClick={() => { logout(); navigate('/') }} style={{ fontSize: '6px' }}>Sair</button>
            <button
              onClick={() => setShowTutorial(true)}
              style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', background: 'transparent', border: '1px solid #c4a35a', color: '#c4a35a', padding: '4px 8px', cursor: 'pointer' }}
            >
              Como funciona
            </button>
          </div>
        </div>
      </header>

      {isVisitor && (
        <div className="wg-visitor-banner" style={{ position: 'relative', zIndex: 10, background: 'rgba(42,30,8,0.92)', borderBottom: '2px solid #c4a35a', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#c4a35a' }}>
          <span>⚠ Modo visitante — progresso não salvo</span>
          <Link to="/register" style={{ color: '#7ab648', fontFamily: 'var(--pixel-font)', fontSize: '6px', textDecoration: 'none' }}>Criar conta para salvar →</Link>
        </div>
      )}

      <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 16 }}>
        <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '7px', color: '#3d3428', letterSpacing: '4px' }}>— CANTEIRO —</p>
        <div className="wg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 130px)', gap: 18 }}>
          {slots.map((task, i) => (
            <PotSlot key={task?.id ?? `slot-${i}`} task={task} slotIndex={i} onWater={handleWater} onPlant={handlePlant} onHarvest={handleHarvest} />
          ))}
        </div>
      </main>
    </div>
  )
}
