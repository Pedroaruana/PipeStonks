import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import img1 from '../assets/story/1.jpg'
import img2 from '../assets/story/2.jpg'
import img3 from '../assets/story/3.jpg'
import img4 from '../assets/story/4.jpg'
import img5 from '../assets/story/5.jpg'

export const STORY_SEEN_KEY = 'wg-story-seen'

const SLIDES = [
  { img: img1, text: 'No ano de 2056, a humanidade está à beira da extinção.' },
  { img: img2, text: 'Guerras e desastres transformaram o mundo em um deserto tóxico.' },
  { img: img3, text: 'Os poucos sobreviventes lutam todos os dias por recursos — e principalmente, por oxigênio.' },
  { img: img4, text: 'O ar está cada vez mais raro. Cada respiração é uma conquista.' },
  { img: img5, text: 'Mas onde há vida, há esperança. E a esperança... cresce em pequenos brotos.' },
]

export default function IntroPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [fade, setFade] = useState(true)

  const isLast = step >= SLIDES.length

  useEffect(() => {
    if (isLast) return
    setFade(true)
    const t = setTimeout(() => setFade(false), 3200)
    return () => clearTimeout(t)
  }, [step, isLast])

  useEffect(() => {
    if (isLast || fade) return
    const t = setTimeout(() => setStep((s) => s + 1), 400)
    return () => clearTimeout(t)
  }, [fade, isLast])

  function skip() {
    setStep(SLIDES.length)
  }

  function begin() {
    localStorage.setItem(STORY_SEEN_KEY, '1')
    const visitor = params.get('visitor')
    navigate(visitor ? '/garden?visitor=true' : '/garden')
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLast ? 'default' : 'pointer', overflow: 'hidden' }}
      onClick={() => !isLast && setStep((s) => s + 1)}
    >
      {!isLast ? (
        <>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 90,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px',
          }}>
            <img
              key={step}
              src={SLIDES[step].img}
              style={{
                maxWidth: '900px', width: '100%', maxHeight: '100%', height: 'auto', objectFit: 'contain',
                opacity: fade ? 1 : 0, transition: 'opacity 0.6s ease',
              }}
            />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />

          <p style={{
            position: 'absolute', bottom: 80, left: 40, right: 40, textAlign: 'center',
            fontFamily: 'var(--pixel-font)', fontSize: '9px', color: '#e8dcc8', lineHeight: 2,
            opacity: fade ? 1 : 0, transition: 'opacity 0.6s ease', textShadow: '0 2px 8px #000',
          }}>
            {SLIDES[step].text}
          </p>

          <button
            onClick={(e) => { e.stopPropagation(); skip() }}
            style={{ position: 'absolute', top: 24, right: 24, fontFamily: 'var(--pixel-font)', fontSize: '6px', background: 'transparent', border: '1px solid #6b6055', color: '#8a7a65', padding: '6px 12px', cursor: 'pointer' }}
          >
            PULAR »
          </button>

          <div style={{ position: 'absolute', bottom: 24, display: 'flex', gap: 6 }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, background: i === step ? '#7ab648' : '#3d3428' }} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '10px', color: '#7ab648', letterSpacing: '4px', marginBottom: 16 }}>
            — 2056 —
          </p>
          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: '13px', color: '#e8dcc8', letterSpacing: '2px', marginBottom: 40 }}>
            CONSTRUA SUA ESTUFA.<br />CULTIVE OXIGÊNIO.<br />SOBREVIVA.
          </p>
          <button
            onClick={begin}
            style={{ fontFamily: 'var(--pixel-font)', fontSize: '9px', background: 'transparent', border: '1px solid #7ab648', color: '#7ab648', padding: '14px 36px', cursor: 'pointer', letterSpacing: '2px' }}
          >
            ▶ COMEÇAR
          </button>
        </div>
      )}
    </div>
  )
}
