import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import PixelPlant from '../components/game/PixelPlant'
import OxygenBar from '../components/game/OxygenBar'

interface Task {
  id: string
  title: string
  description?: string
  stage: 'SEED' | 'SPROUT' | 'SAPLING' | 'TREE' | 'FRUIT'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  progress: number
  dueDate?: string
  category?: { name: string; color: string }
}

const DIFF_LABEL = { EASY: 'Fácil', MEDIUM: 'Médio', HARD: 'Difícil' }
const DIFF_COLOR = { EASY: 'var(--toxic)', MEDIUM: 'var(--sand)', HARD: 'var(--danger)' }

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [diff, setDiff] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((r) => r.data),
  })

  const plant = useMutation({
    mutationFn: (body: object) => api.post('/tasks', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setShowForm(false); setTitle(''); setDesc('') },
  })

  const water = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      api.patch(`/tasks/${id}/water`, { progress }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const harvest = useMutation({
    mutationFn: (id: string) => api.patch(`/tasks/${id}/harvest`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const prune = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  function handleLogout() { logout(); navigate('/') }

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>🌱 WASTELAND GARDEN</span>
          <span style={styles.greeting}>Bom dia, {user?.name}</span>
        </div>
        <div style={styles.headerRight}>
          <div style={{ width: '120px' }}>
            <span style={styles.oxyLabel}>O₂ {user?.oxygenLevel ?? 0}</span>
            <OxygenBar value={Math.min(100, user?.oxygenLevel ?? 0)} />
          </div>
          <Link to="/history" style={styles.navLink}>Estufa</Link>
          <button className="px-btn px-btn-red" onClick={handleLogout} style={{ fontSize: '6px' }}>Sair</button>
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.toolbar}>
          <h2 style={styles.sectionTitle}>Canteiro Principal <span style={styles.count}>{tasks.length} planta{tasks.length !== 1 ? 's' : ''}</span></h2>
          <button className="px-btn px-btn-green" onClick={() => setShowForm((v) => !v)} style={{ fontSize: '7px' }}>
            {showForm ? '✕ Cancelar' : '+ Plantar'}
          </button>
        </div>

        {/* New task form */}
        {showForm && (
          <form onSubmit={(e) => { e.preventDefault(); plant.mutate({ title, description: desc, difficulty: diff }) }} style={styles.form}>
            <input style={styles.input} placeholder="Nome da tarefa..." value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input style={styles.input} placeholder="Descrição (opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <select style={styles.input} value={diff} onChange={(e) => setDiff(e.target.value as typeof diff)}>
              <option value="EASY">Fácil</option>
              <option value="MEDIUM">Médio</option>
              <option value="HARD">Difícil</option>
            </select>
            <button className="px-btn px-btn-green" type="submit" disabled={plant.isPending}>
              {plant.isPending ? '...' : '🌱 Plantar'}
            </button>
          </form>
        )}

        {isLoading && <p style={styles.empty}>Carregando jardim...</p>}
        {!isLoading && tasks.length === 0 && (
          <p style={styles.empty}>Nenhuma planta ainda. Plante sua primeira tarefa!</p>
        )}

        {/* Task grid */}
        <div style={styles.grid}>
          {tasks.map((task) => (
            <div key={task.id} style={styles.card} className="px-border">
              <PixelPlant stage={task.stage} size={40} />

              <div style={styles.cardBody}>
                <p style={styles.taskTitle}>{task.title}</p>
                {task.description && <p style={styles.taskDesc}>{task.description}</p>}

                <div style={styles.tags}>
                  <span style={{ ...styles.tag, color: DIFF_COLOR[task.difficulty] }}>{DIFF_LABEL[task.difficulty]}</span>
                  {task.category && <span style={{ ...styles.tag, color: task.category.color }}>{task.category.name}</span>}
                  {task.dueDate && <span style={styles.tag}>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>}
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <span style={{ ...styles.tag, color: 'var(--text-muted)' }}>Crescimento {task.progress}%</span>
                  <OxygenBar value={task.progress} />
                </div>

                <div style={styles.actions}>
                  <button className="px-btn px-btn-green" style={{ fontSize: '6px' }}
                    onClick={() => water.mutate({ id: task.id, progress: Math.min(100, task.progress + 20) })}>
                    💧 Regar
                  </button>
                  <button className="px-btn px-btn-sand" style={{ fontSize: '6px' }}
                    onClick={() => harvest.mutate(task.id)}>
                    🌾 Colher
                  </button>
                  <button className="px-btn px-btn-red" style={{ fontSize: '6px' }}
                    onClick={() => prune.mutate(task.id)}>
                    ✂
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' },
  header: { background: 'var(--bg-panel)', borderBottom: '2px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  logo: { fontFamily: 'var(--pixel-font)', fontSize: '10px', color: 'var(--toxic)' },
  greeting: { fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--text-secondary)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  oxyLabel: { fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--oxygen)', display: 'block', marginBottom: '2px' },
  navLink: { fontFamily: 'var(--pixel-font)', fontSize: '7px', color: 'var(--sand)', textDecoration: 'none' },
  main: { flex: 1, padding: '24px', maxWidth: '960px', margin: '0 auto', width: '100%' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  sectionTitle: { fontFamily: 'var(--pixel-font)', fontSize: '10px', color: 'var(--text-primary)' },
  count: { fontSize: '7px', color: 'var(--text-muted)', marginLeft: '8px' },
  form: { background: 'var(--bg-panel)', border: '2px solid var(--border)', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-end' },
  input: { fontFamily: 'var(--pixel-font)', fontSize: '7px', background: 'var(--bg-dark)', border: '2px solid var(--border)', color: 'var(--text-primary)', padding: '6px 8px', outline: 'none', minWidth: '160px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  card: { background: 'var(--bg-card)', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' },
  cardBody: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  taskTitle: { fontFamily: 'var(--pixel-font)', fontSize: '7px', color: 'var(--text-primary)', lineHeight: 1.6 },
  taskDesc: { fontFamily: 'var(--pixel-font)', fontSize: '6px', color: 'var(--text-secondary)', lineHeight: 1.6 },
  tags: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  tag: { fontFamily: 'var(--pixel-font)', fontSize: '5px', color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '2px 4px', border: '1px solid var(--border)' },
  actions: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  empty: { fontFamily: 'var(--pixel-font)', fontSize: '7px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' },
}
