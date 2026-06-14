import ScoreBoard from './components/ScoreBoard'
import { useScores } from './hooks/useScores'

export default function App() {
  const scores = useScores()

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <ScoreBoard scores={scores} />
    </div>
  )
}
