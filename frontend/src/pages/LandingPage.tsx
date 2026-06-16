import { Link } from 'react-router-dom'
import PixelCharacter from '../components/game/PixelCharacter'
import PixelPlant from '../components/game/PixelPlant'
import OxygenBar from '../components/game/OxygenBar'

export default function LandingPage() {
  return (
    <div style={styles.root}>
      {/* Sky / toxic atmosphere */}
      <div style={styles.sky}>
        <span style={styles.year}>2056</span>
        <div style={styles.clouds}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ ...styles.cloud, left: `${10 + i * 18}%`, animationDelay: `${i * 0.8}s` }} />
          ))}
        </div>
      </div>

      {/* Ground scene */}
      <div style={styles.scene}>
        <PixelCharacter />

        <div style={styles.plantRow}>
          <PixelPlant stage="SEED" label="Plante" />
          <div style={styles.arrow}>›</div>
          <PixelPlant stage="SPROUT" label="Regue" />
          <div style={styles.arrow}>›</div>
          <PixelPlant stage="SAPLING" label="Cresça" />
          <div style={styles.arrow}>›</div>
          <PixelPlant stage="TREE" label="Colha" />
          <div style={styles.arrow}>›</div>
          <PixelPlant stage="FRUIT" label="Oxigênio!" glow />
        </div>

        <div style={styles.oxygenDemo}>
          <span style={styles.oxygenLabel}>Nível de O₂</span>
          <OxygenBar value={62} animated />
        </div>
      </div>

      {/* Ground line */}
      <div style={styles.ground} />

      {/* Foreground ruins */}
      <div style={styles.ruins}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ ...styles.ruin, height: `${20 + Math.sin(i) * 14}px`, left: `${i * 13}%` }} />
        ))}
      </div>

      {/* Content panel */}
      <div style={styles.panel}>
        <h1 style={styles.title}>
          <span style={{ color: 'var(--toxic)' }}>WASTELAND</span>
          <br />
          GARDEN
        </h1>

        <p style={styles.tagline}>
          O ar acabou.<br />
          Mas você ainda pode plantar.
        </p>

        <p style={styles.desc}>
          Cada tarefa é uma planta. Você cultiva, rega e acompanha o crescimento
          num mundo onde cada grão de oxigênio importa.
        </p>

        <div style={styles.actions}>
          <Link to="/garden?visitor=true" style={{ textDecoration: 'none' }}>
            <button className="px-btn px-btn-green" style={{ fontSize: '8px', padding: '10px 20px' }}>
              ▶ Jogar agora
            </button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="px-btn px-btn-sand" style={{ fontSize: '7px', padding: '8px 16px' }}>
              Criar conta
            </button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="px-btn" style={{ fontSize: '7px', padding: '8px 16px', background: 'transparent', borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>
              Já tenho jardim
            </button>
          </Link>
        </div>

        <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Jogar agora não precisa de conta — crie uma para salvar seu progresso
        </p>

        <div style={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.label} style={styles.feature}>
              <span style={{ color: 'var(--toxic)', fontSize: '16px' }}>{f.icon}</span>
              <span style={styles.featureLabel}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: '🌱', label: 'Plante tarefas' },
  { icon: '💧', label: 'Regue com progresso' },
  { icon: '🌳', label: 'Colha concluídas' },
  { icon: '🔗', label: 'Sync Google Tasks' },
]

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1a0e05 0%, #0d0d0d 60%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sky: {
    width: '100%',
    height: '160px',
    background: 'linear-gradient(180deg, #1a0805 0%, #2d1a08 50%, transparent 100%)',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '16px',
  },
  year: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '10px',
    color: 'var(--rust)',
    letterSpacing: '4px',
    opacity: 0.6,
    animation: 'flicker 4s ease-in-out infinite',
  },
  clouds: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  cloud: {
    position: 'absolute',
    top: '30px',
    width: '40px',
    height: '12px',
    background: 'rgba(160,74,42,0.2)',
    boxShadow: '0 0 8px rgba(160,74,42,0.3)',
    animation: 'float 6s ease-in-out infinite',
  },
  scene: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    paddingTop: '8px',
    zIndex: 1,
  },
  plantRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
  },
  arrow: {
    fontFamily: 'var(--pixel-font)',
    color: 'var(--text-muted)',
    fontSize: '14px',
    paddingBottom: '20px',
  },
  oxygenDemo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    width: '200px',
  },
  oxygenLabel: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '7px',
    color: 'var(--oxygen)',
    letterSpacing: '2px',
  },
  ground: {
    width: '100%',
    height: '4px',
    background: 'repeating-linear-gradient(90deg, var(--sand) 0px, var(--sand) 8px, var(--rust) 8px, var(--rust) 16px)',
    opacity: 0.4,
    marginTop: '8px',
  },
  ruins: {
    position: 'absolute',
    bottom: '320px',
    left: 0,
    width: '100%',
    height: '60px',
    pointerEvents: 'none',
  },
  ruin: {
    position: 'absolute',
    bottom: 0,
    width: '10px',
    background: 'var(--ash)',
    opacity: 0.3,
  },
  panel: {
    width: '100%',
    maxWidth: '520px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    zIndex: 2,
  },
  title: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '20px',
    textAlign: 'center',
    lineHeight: 1.6,
    color: 'var(--text-primary)',
    textShadow: '0 0 20px rgba(122,182,72,0.4)',
  },
  tagline: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '9px',
    color: 'var(--rust)',
    textAlign: 'center',
    lineHeight: 2,
    letterSpacing: '1px',
  },
  desc: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '7px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    lineHeight: 2.2,
    maxWidth: '380px',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  features: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '8px',
  },
  feature: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  featureLabel: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '6px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
}
