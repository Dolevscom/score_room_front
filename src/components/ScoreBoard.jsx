import ScreenColumn from './ScreenColumn'
import { MAX_COUNTING_UNITS, DEFAULT_COUNTING_UNITS } from '../hooks/useScores'

const RED  = '#FF2200'
const BLUE = '#0055FF'

// Renders the 4 מסכי ספירה (2 red, 2 blue). `gutter` controls the gap between
// screen columns only — it never touches digit size or counting-column width.
export default function ScoreBoard({
  scores = [],
  gutter = 8,
  unitGutter = 0,
  digitsPerUnit = 6,
  unitsPerColumn = DEFAULT_COUNTING_UNITS,
  font = 'ABC Connect Mono Nail',
}) {
  // Each counting column owns a MAX_COUNTING_UNITS-sized slot; only show the first `unitsPerColumn`
  const col = (n) => scores.slice(n * MAX_COUNTING_UNITS, n * MAX_COUNTING_UNITS + unitsPerColumn)

  const screenColumnProps = { unitGutter, digitsPerUnit, font }

  return (
    <div style={{
      background: '#000',
      display: 'flex', flexDirection: 'row',
      gap: gutter,
    }}>
      <ScreenColumn left={col(0)} right={col(1)} color={RED}  {...screenColumnProps} />
      <ScreenColumn left={col(2)} right={col(3)} color={RED}  {...screenColumnProps} />
      <ScreenColumn left={col(4)} right={col(5)} color={BLUE} {...screenColumnProps} />
      <ScreenColumn left={col(6)} right={col(7)} color={BLUE} {...screenColumnProps} />
    </div>
  )
}
