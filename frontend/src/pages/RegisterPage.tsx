import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { STORY_SEEN_KEY } from './IntroPage'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      setAuth(data.user, data.token)
      navigate(localStorage.getItem(STORY_SEEN_KEY) ? '/garden' : '/intro')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.panel}>
        <h1 style={styles.title}>
          <span style={{ color: 'var(--toxic)' }}>CRIAR</span><br />
          <span style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>seu jardim</span>
        </h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>NOME</label>
          <input style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />

          <label style={styles.label}>E-MAIL</label>
          <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />

          <label style={styles.label}>SENHA</label>
          <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />

          {error && <p style={styles.error}>{error}</p>}

          <button className="px-btn px-btn-green" type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? '...' : '▶ Plantar Primeiro Jardim'}
          </button>
        </form>

        <p style={styles.link}>
          Já tem jardim?{' '}
          <Link to="/login" style={{ color: 'var(--toxic)' }}>Entrar</Link>
        </p>
        <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '6px', fontFamily: 'var(--pixel-font)', textDecoration: 'none' }}>
          ‹ Voltar
        </Link>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '16px 0' },
  panel: { width: '320px', padding: '22px', background: 'var(--bg-panel)', border: '2px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' },
  title: { fontFamily: 'var(--pixel-font)', fontSize: '14px', textAlign: 'center', lineHeight: 1.6 },
  form: { width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--text-secondary)', letterSpacing: '2px' },
  input: { fontFamily: 'var(--pixel-font)', fontSize: '8px', background: 'var(--bg-dark)', border: '2px solid var(--border)', color: 'var(--text-primary)', padding: '8px', outline: 'none', width: '100%' },
  error: { fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--danger)', textAlign: 'center' },
  link: { fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--text-secondary)', textAlign: 'center' },
}
