import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { useVisitorStore } from '../store/visitor'

const PLANT_TYPES = ['sunflower', 'cactus', 'tulip', 'rose', 'monstera', 'fern'] as const
type PlantType = typeof PLANT_TYPES[number]

const PLANT_NAMES: Record<PlantType, string> = {
  sunflower: 'GIRASSOL', cactus: 'CACTO', tulip: 'TULIPA',
  rose: 'ROSA', monstera: 'MONSTERA', fern: 'SAMAMBAIA',
}

const PLANT_EMOJI: Record<PlantType, string> = {
  sunflower: '🌻', cactus: '🌵', tulip: '🌷',
  rose: '🌹', monstera: '🌿', fern: '☘',
}

const BRACKET = '#c4a35a'
const B = 10

function getPlantType(id: string): PlantType {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PLANT_TYPES[hash % PLANT_TYPES.length]
}

interface HarvestedTask {
  id: string
  title: string
  plantedAt: string
  completedAt: string
}

function daysAlive(plantedAt: string, completedAt: string): number {
  return Math.max(1, Math.round((new Date(completedAt).getTime() - new Date(plantedAt).getTime()) / (1000 * 60 * 60 * 24)))
}

function groupByMonth(tasks: HarvestedTask[]): [string, HarvestedTask[]][] {
  const map = new Map<string, HarvestedTask[]>()
  for (const t of tasks) {
    const key = new Date(t.completedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  return Array.from(map.entries())
}

function FruitPlant({ type }: { type: PlantType }) {
  if (type === 'sunflower') return (
    <svg width="48" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated' }}>
      <rect x="39" y="10" width="2" height="42" fill="#4a8c1e"/>
      <rect x="30" y="26" width="8" height="3" fill="#4a8c1e" transform="rotate(-30,34,27)"/>
      <rect x="42" y="28" width="8" height="3" fill="#4a8c1e" transform="rotate(30,46,29)"/>
      <circle cx="40" cy="14" r="10" fill="#e8b820"/>
      <circle cx="40" cy="14" r="7" fill="#c48c10"/>
      <circle cx="40" cy="14" r="4" fill="#5c3010"/>
      {[0,45,90,135,180,225,270,315].map((a, i) => {
        const rad = a * Math.PI / 180
        return <ellipse key={i} cx={40 + Math.cos(rad) * 12} cy={14 + Math.sin(rad) * 12} rx="3" ry="5" fill="#e8c030" transform={`rotate(${a},${40 + Math.cos(rad)*12},${14 + Math.sin(rad)*12})`}/>
      })}
      <circle cx="40" cy="10" r="3" fill="#8B4c10"/>
    </svg>
  )
  if (type === 'cactus') return (
    <svg width="48" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated' }}>
      <rect x="37" y="10" width="6" height="42" fill="#3d8c20"/>
      <rect x="37" y="14" width="6" height="32" fill="#3d8c20"/>
      <rect x="24" y="18" width="14" height="5" fill="#3d8c20"/>
      <rect x="42" y="24" width="14" height="5" fill="#3d8c20"/>
      <rect x="24" y="8" width="5" height="14" fill="#3d8c20"/>
      <rect x="51" y="14" width="5" height="14" fill="#3d8c20"/>
      {[28,33,38,43,48].map(x => <line key={x} x1={x} y1="10" x2={x} y2="42" stroke="#2d6c10" strokeWidth="1"/>)}
      <circle cx="40" cy="6" r="5" fill="#e84870"/>
      <circle cx="25" cy="4" r="4" fill="#e84870"/>
      <circle cx="55" cy="10" r="4" fill="#e84870"/>
    </svg>
  )
  if (type === 'tulip') return (
    <svg width="48" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated' }}>
      <rect x="39" y="18" width="2" height="34" fill="#4a8c1e"/>
      <rect x="30" y="34" width="7" height="3" fill="#5aaa20" transform="rotate(-20,33,35)"/>
      <rect x="43" y="36" width="7" height="3" fill="#5aaa20" transform="rotate(20,47,37)"/>
      <ellipse cx="36" cy="14" rx="4" ry="7" fill="#e84040"/>
      <ellipse cx="44" cy="14" rx="4" ry="7" fill="#ff6060"/>
      <ellipse cx="40" cy="12" rx="3" ry="5" fill="#ff8080"/>
    </svg>
  )
  if (type === 'rose') return (
    <svg width="48" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated' }}>
      <rect x="39" y="18" width="2" height="34" fill="#3a7c10"/>
      <ellipse cx="32" cy="38" rx="7" ry="4" fill="#4aaa20" transform="rotate(-30,32,38)"/>
      <ellipse cx="48" cy="40" rx="7" ry="4" fill="#4aaa20" transform="rotate(20,48,40)"/>
      <ellipse cx="33" cy="12" rx="4" ry="6" fill="#cc2060"/>
      <ellipse cx="47" cy="14" rx="4" ry="6" fill="#e83070"/>
      <circle cx="40" cy="8" r="6" fill="#ff5088"/>
      <circle cx="40" cy="7" r="3" fill="#ff80aa"/>
    </svg>
  )
  if (type === 'monstera') return (
    <svg width="48" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated' }}>
      <rect x="39" y="26" width="2" height="26" fill="#2d6c10"/>
      <ellipse cx="26" cy="18" rx="14" ry="10" fill="#4db830" transform="rotate(-25,26,18)"/>
      <ellipse cx="54" cy="20" rx="14" ry="10" fill="#4db830" transform="rotate(25,54,20)"/>
      <rect x="20" y="16" width="3" height="6" fill="#1E0E04"/>
      <rect x="27" y="12" width="3" height="5" fill="#1E0E04"/>
      <rect x="51" y="18" width="3" height="6" fill="#1E0E04"/>
      <rect x="57" y="14" width="3" height="5" fill="#1E0E04"/>
    </svg>
  )
  return (
    <svg width="48" height="52" viewBox="0 0 80 52" style={{ imageRendering: 'pixelated' }}>
      <rect x="39" y="18" width="2" height="34" fill="#4a9c1e"/>
      <path d="M40,44 Q22,28 14,18" stroke="#4a9c1e" strokeWidth="2" fill="none"/>
      <path d="M40,44 Q58,28 66,18" stroke="#4a9c1e" strokeWidth="2" fill="none"/>
      {[0,1,2,3,4].map(i => <ellipse key={i} cx={21+i*5} cy={28-i*3} rx="5" ry="2" fill="#4a9c1e" transform={`rotate(-25,${21+i*5},${28-i*3})`}/>)}
      {[0,1,2,3,4].map(i => <ellipse key={i} cx={59-i*5} cy={28-i*3} rx="5" ry="2" fill="#4a9c1e" transform={`rotate(25,${59-i*5},${28-i*3})`}/>)}
      <ellipse cx="40" cy="14" rx="5" ry="8" fill="#6ec030"/>
      <circle cx="38" cy="10" r="3" fill="#ffe060"/>
      <circle cx="42" cy="12" r="2" fill="#ffe060"/>
    </svg>
  )
}

function CornerBrackets() {
  return (
    <>
      {(['top','bottom'] as const).flatMap(v => (['left','right'] as const).map(h => (
        <div key={`${v}${h}`} style={{ position: 'absolute', [v]: 0, [h]: 0, width: B, height: B, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', [v]: 0, [h]: 0, width: B, height: 2, background: BRACKET }}/>
          <div style={{ position: 'absolute', [v]: 0, [h]: 0, width: 2, height: B, background: BRACKET }}/>
        </div>
      )))}
    </>
  )
}

function PlantGalleryModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div style={{ position: 'relative', width: 480, maxHeight: '80vh', overflowY: 'auto', background: 'rgba(8,6,2,0.97)', border: '2px solid #3d2e10', padding: '28px 24px' }} onClick={(e) => e.stopPropagation()}>
        <CornerBrackets />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '9px', color: '#c4a35a' }}>PLANTAS DISPONÍVEIS</p>
          <button onClick={onClose} style={{ fontFamily: 'var(--pixel-font)', fontSize: '7px', background: 'transparent', border: '1px solid #3d3428', color: '#6b6055', padding: '3px 8px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {PLANT_TYPES.map((type) => (
            <div key={type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: '#1a1410', border: '1px solid #3d3428', padding: '14px 8px' }}>
              <FruitPlant type={type} />
              <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#e8dcc8' }}>{PLANT_EMOJI[type]} {PLANT_NAMES[type]}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', color: '#4a3f33', textAlign: 'center', marginTop: 16, lineHeight: 1.8 }}>
          O tipo de planta é definido automaticamente ao plantar. Colha todas as 6 para completar a coleção!
        </p>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const token = useAuthStore((s) => s.token)
  const visitorTasks = useVisitorStore((s) => s.tasks)
  const [filter, setFilter] = useState<PlantType | 'all'>('all')
  const [showGallery, setShowGallery] = useState(false)

  const { data: apiTasks = [] } = useQuery<HarvestedTask[]>({
    queryKey: ['history'],
    queryFn: () => api.get('/history/harvested').then((r) => r.data),
    enabled: !!token,
  })

  const rawTasks: HarvestedTask[] = token
    ? apiTasks
    : visitorTasks
        .filter((t) => !!t.completedAt)
        .map((t) => ({ id: t.id, title: t.title, plantedAt: t.createdAt, completedAt: t.completedAt! }))
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

  const filtered = filter === 'all' ? rawTasks : rawTasks.filter((t) => getPlantType(t.id) === filter)
  const grouped = groupByMonth(filtered)

  const totalO2 = rawTasks.length * 20
  const totalDias = rawTasks.length > 0
    ? rawTasks.reduce((sum, t) => sum + daysAlive(t.plantedAt, t.completedAt), 0)
    : 0

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      {/* Header */}
      <header style={{ background: '#1a1410', borderBottom: '2px solid #3d3428', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '11px', color: '#c4a35a', letterSpacing: '2px' }}>ESTUFA</p>
          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', color: '#4a3f33', marginTop: 4 }}>PLANTAS COLHIDAS — ARQUIVO DA WASTELAND</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowGallery(true)}
            style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#c4a35a', background: 'transparent', border: '1px solid #c4a35a', padding: '5px 10px', cursor: 'pointer' }}
          >
            🌿 TODAS AS PLANTAS
          </button>
          <Link to="/garden" style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#7ab648', textDecoration: 'none', border: '1px solid #7ab648', padding: '5px 10px' }}>
            ‹ JARDIM
          </Link>
        </div>
      </header>

      {showGallery && <PlantGalleryModal onClose={() => setShowGallery(false)} />}

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'COLHIDAS', value: rawTasks.length, color: '#4fc3a0' },
            { label: 'O₂ GERADO', value: totalO2, color: '#c4a35a' },
            { label: 'DIAS CULTIVADOS', value: totalDias, color: '#7ab648' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ position: 'relative', background: '#1a1410', border: '1px solid #3d3428', padding: '12px 8px', textAlign: 'center' }}>
              <CornerBrackets />
              <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '14px', color, marginBottom: 6 }}>{value}</p>
              <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', color: '#6b6055' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {(['all', ...PLANT_TYPES] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: 'var(--pixel-font)', fontSize: '5px',
                padding: '5px 8px', cursor: 'pointer',
                background: filter === f ? '#2a1e08' : '#1a1410',
                border: `1px solid ${filter === f ? '#c4a35a' : '#3d3428'}`,
                color: filter === f ? '#c4a35a' : '#6b6055',
              }}
            >
              {f === 'all' ? 'TUDO' : `${PLANT_EMOJI[f]} ${PLANT_NAMES[f]}`}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {rawTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '8px', color: '#3d3428', marginBottom: 12 }}>ESTUFA VAZIA</p>
            <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#4a3f33' }}>Colha sua primeira planta no jardim para ver o histórico aqui.</p>
          </div>
        )}

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {grouped.map(([month, tasks]) => (
            <div key={month}>
              {/* Month divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: '#3d3428', flexShrink: 0 }}>{month}</p>
                <div style={{ flex: 1, height: 1, background: '#3d3428' }}/>
                <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', color: '#3d3428', flexShrink: 0 }}>{tasks.length}x</p>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.map((task) => {
                  const type = getPlantType(task.id)
                  const days = daysAlive(task.plantedAt, task.completedAt)
                  const harvestDate = new Date(task.completedAt).toLocaleDateString('pt-BR')
                  const plantDate = new Date(task.plantedAt).toLocaleDateString('pt-BR')

                  return (
                    <div key={task.id} style={{ position: 'relative', background: '#1a1410', border: '1px solid #3d3428', padding: '12px 14px 12px 50px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Left accent */}
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#7ab648' }}/>

                      {/* Plant icon */}
                      <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 48, display: 'flex', justifyContent: 'center' }}>
                        <FruitPlant type={type} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '7px', color: '#e8dcc8', marginBottom: 7 }}>
                          {task.title}
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 7 }}>
                          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', color: '#6b6055' }}>
                            PLANTADA: <span style={{ color: '#c4a35a' }}>{plantDate}</span>
                          </p>
                          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', color: '#6b6055' }}>
                            COLHIDA: <span style={{ color: '#c4a35a' }}>{harvestDate}</span>
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', padding: '3px 6px', border: '1px solid #7ab648', color: '#7ab648', background: '#0a1e0a' }}>
                            {PLANT_EMOJI[type]} {PLANT_NAMES[type]}
                          </span>
                          <span style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', padding: '3px 6px', border: '1px solid #c4a35a', color: '#c4a35a', background: '#1e1408' }}>
                            {days} DIA{days !== 1 ? 'S' : ''}
                          </span>
                          <span style={{ fontFamily: 'var(--pixel-font)', fontSize: '5px', padding: '3px 6px', border: '1px solid #4fc3a0', color: '#4fc3a0', background: '#081e1a' }}>
                            +20 O₂
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
