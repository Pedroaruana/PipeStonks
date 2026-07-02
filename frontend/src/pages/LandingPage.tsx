import { Link, useNavigate } from 'react-router-dom'
import bg from '../c98146de-post-apocalyptic-wasteland-in-gritty-pixel-art-style-compressed.jpg'
import { STORY_SEEN_KEY } from './IntroPage'

export default function LandingPage() {
  const navigate = useNavigate()

  function handlePlay() {
    navigate(localStorage.getItem(STORY_SEEN_KEY) ? '/garden?visitor=true' : '/intro?visitor=true')
  }

  return (
    <div style={styles.root}>
      {/* Background with slow zoom animation */}
      <div style={styles.bg} />

      {/* Overlay layers */}
      <div style={styles.overlayDark} />
      <div style={styles.overlayVignette} />

      {/* Scanlines */}
      <div style={styles.scanlines} />

      {/* Floating dust particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          ...styles.particle,
          left: `${10 + i * 12}%`,
          animationDuration: `${6 + i * 1.5}s`,
          animationDelay: `${i * 0.7}s`,
          width: `${2 + (i % 3)}px`,
          height: `${2 + (i % 3)}px`,
          opacity: 0.2 + (i % 3) * 0.1,
        }} />
      ))}

      {/* Content */}
      <div style={styles.content}>
        {/* Year badge */}
        <div style={styles.yearBadge}>
          <span style={styles.yearText}>— 2056 —</span>
        </div>

        {/* Title */}
        <h1 style={styles.title}>
          WASTELAND<br />
          <span style={styles.titleAccent}>GARDEN</span>
        </h1>

        <p style={styles.tagline}>
          O ar acabou. Mas você ainda pode plantar.
        </p>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerIcon}>✦</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Buttons */}
        <div style={styles.buttons}>
          <button style={styles.btnPrimary} onClick={handlePlay}>
            ▶ JOGAR AGORA
          </button>

          <div style={styles.btnRow}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={styles.btnSecondary}>CRIAR CONTA</button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={styles.btnGhost}>ENTRAR</button>
            </Link>
          </div>
        </div>

        <p style={styles.hint}>
          Jogar agora não precisa de conta — crie uma para salvar seu progresso
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: '#0a0806',
  },
  bg: {
    position: 'absolute',
    inset: '-10%',
    backgroundImage: `url(${bg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    imageRendering: 'pixelated',
    animation: 'bgZoom 30s ease-in-out infinite alternate',
  },
  overlayDark: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(5, 3, 2, 0.65)',
  },
  overlayVignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)',
  },
  scanlines: {
    position: 'absolute',
    inset: 0,
    background: 'repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    bottom: '-10px',
    background: '#c4a35a',
    borderRadius: '1px',
    animation: 'float 6s ease-in-out infinite',
    imageRendering: 'pixelated',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    textAlign: 'center',
  },
  yearBadge: {
    border: '1px solid rgba(196,163,90,0.4)',
    padding: '4px 16px',
    background: 'rgba(196,163,90,0.08)',
  },
  yearText: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '7px',
    color: '#c4a35a',
    letterSpacing: '4px',
  },
  title: {
    fontFamily: 'var(--pixel-font)',
    fontSize: 'clamp(22px, 5vw, 42px)',
    color: '#e8dcc8',
    lineHeight: 1.5,
    textShadow: '0 0 40px rgba(122,182,72,0.3), 2px 2px 0px rgba(0,0,0,0.8)',
    margin: 0,
  },
  titleAccent: {
    color: '#7ab648',
    textShadow: '0 0 30px rgba(122,182,72,0.6), 0 0 60px rgba(122,182,72,0.2)',
  },
  tagline: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '9px',
    color: '#a04a2a',
    letterSpacing: '2px',
    margin: 0,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '200px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(196,163,90,0.3)',
    display: 'block',
  },
  dividerIcon: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '8px',
    color: 'rgba(196,163,90,0.5)',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  btnPrimary: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '10px',
    padding: '10px 28px',
    background: '#2d5a1e',
    border: '2px solid #7ab648',
    color: '#7ab648',
    cursor: 'pointer',
    letterSpacing: '2px',
    boxShadow: '0 0 20px rgba(122,182,72,0.3)',
    transition: 'all 0.1s',
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
  },
  btnSecondary: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '7px',
    padding: '10px 20px',
    background: 'rgba(196,163,90,0.1)',
    border: '2px solid #c4a35a',
    color: '#c4a35a',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.1s',
  },
  btnGhost: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '7px',
    padding: '10px 20px',
    background: 'transparent',
    border: '2px solid rgba(107,96,85,0.5)',
    color: '#6b6055',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.1s',
  },
  hint: {
    fontFamily: 'var(--pixel-font)',
    fontSize: '6px',
    color: '#4a3f33',
    letterSpacing: '1px',
    margin: 0,
  },
}
