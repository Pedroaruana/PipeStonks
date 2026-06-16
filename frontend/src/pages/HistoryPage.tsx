import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import PixelPlant from '../components/game/PixelPlant'

interface HarvestedTask {
  id: string
  title: string
  completedAt: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  category?: { name: string; color: string }
}

export default function HistoryPage() {
  const { data: tasks = [] } = useQuery<HarvestedTask[]>({
    queryKey: ['history'],
    queryFn: () => api.get('/history/harvested').then((r) => r.data),
  })

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>🏚 ESTUFA DE HISTÓRICO</span>
        <Link to="/garden" style={styles.back}>‹ Voltar ao Jardim</Link>
      </header>

      <main style={styles.main}>
        {tasks.length === 0 && (
          <p style={styles.empty}>Nenhuma planta colhida ainda.</p>
        )}

        <div style={styles.grid}>
          {tasks.map((task) => (
            <div key={task.id} style={styles.card} className="px-border">
              <PixelPlant stage="FRUIT" size={36} />
              <div style={styles.body}>
                <p style={styles.title}>{task.title}</p>
                <p style={styles.date}>
                  Colhida em {new Date(task.completedAt).toLocaleDateString('pt-BR')}
                </p>
                {task.category && (
                  <span style={{ ...styles.tag, color: task.category.color }}>{task.category.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: 'var(--bg-dark)' },
  header: { background: 'var(--bg-panel)', borderBottom: '2px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontFamily: 'var(--pixel-font)', fontSize: '10px', color: 'var(--sand)' },
  back: { fontFamily: 'var(--pixel-font)', fontSize: '7px', color: 'var(--toxic)', textDecoration: 'none' },
  main: { padding: '24px', maxWidth: '960px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  card: { background: 'var(--bg-card)', padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' },
  body: { display: 'flex', flexDirection: 'column', gap: '4px' },
  title: { fontFamily: 'var(--pixel-font)', fontSize: '7px', color: 'var(--text-primary)' },
  date: { fontFamily: 'var(--pixel-font)', fontSize: '5px', color: 'var(--text-muted)' },
  tag: { fontFamily: 'var(--pixel-font)', fontSize: '5px', background: 'var(--bg-dark)', padding: '2px 4px', border: '1px solid var(--border)' },
  empty: { fontFamily: 'var(--pixel-font)', fontSize: '7px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' },
}
