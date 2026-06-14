import Section from './Section'
import { NUM_ROWS } from '../hooks/useScores'

const RED  = '#FF2200'
const BLUE = '#0055FF'

// Layout: [sec0(126)][2px][sec1(126)] [8px gap] [sec2(126)][2px][sec3(126)]
// Total: 2×(126+2+126) + 8 = 2×254 + 8 = 516px → 4px clipped on right (overflow:hidden)

export default function ScoreBoard({ scores = [] }) {
  // Split flat 176-cell array into 8 column-arrays of NUM_ROWS each
  const col = (n) => scores.slice(n * NUM_ROWS, (n + 1) * NUM_ROWS)

  return (
    <div style={{
      width: 512, height: 512,
      background: '#000',
      display: 'flex', flexDirection: 'row',
      overflow: 'hidden',
    }}>
      {/* RED half */}
      <Section left={col(0)} right={col(1)} color={RED} />
      <div style={{ width: 2, height: '100%', background: '#1a1a1a', flexShrink: 0 }} />
      <Section left={col(2)} right={col(3)} color={RED} />

      {/* Physical screen gap between RED and BLUE panels */}
      <div style={{ width: 8, height: '100%', background: '#080808', flexShrink: 0 }} />

      {/* BLUE half */}
      <Section left={col(4)} right={col(5)} color={BLUE} />
      <div style={{ width: 2, height: '100%', background: '#1a1a1a', flexShrink: 0 }} />
      <Section left={col(6)} right={col(7)} color={BLUE} />
    </div>
  )
}
