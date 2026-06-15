import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function LoginPage() {
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
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.user, data.token)
      navigate('/garden')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.panel}>
        <h1 style={styles.title}>
          <span style={{ color: 'var(--toxic)' }}>ENTRAR</span><br />
          <span style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>no seu jardim</span>
        </h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>E-MAIL</label>
          <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />

          <label style={styles.label}>SENHA</label>
          <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

          {error && <p style={styles.error}>{error}</p>}

          <button className="px-btn px-btn-green" type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? '...' : '▶ Entrar'}
          </button>
        </form>

        <p style={styles.link}>
          Sem jardim ainda?{' '}
          <Link to="/register" style={{ color: 'var(--toxic)' }}>Criar conta</Link>
        </p>
        <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '6px', fontFamily: 'var(--pixel-font)', textDecoration: 'none' }}>
          ‹ Voltar
        </Link>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' },
  panel: { width: '320px', padding: '32px', background: 'var(--bg-panel)', border: '2px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' },
  title: { fontFamily: 'var(--pixel-font)', fontSize: '14px', textAlign: 'center', lineHeight: 2 },
  form: { width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--text-secondary)', letterSpacing: '2px' },
  input: { fontFamily: 'var(--pixel-font)', fontSize: '8px', background: 'var(--bg-dark)', border: '2px solid var(--border)', color: 'var(--text-primary)', padding: '8px', outline: 'none', width: '100%' },
  error: { fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--danger)', textAlign: 'center' },
  link: { fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--text-secondary)', textAlign: 'center' },
}
