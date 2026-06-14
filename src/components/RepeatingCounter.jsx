import Digit from './Digit'

const DIGIT_H   = 10
const ROW_GAP   = 14
const ROW_H     = DIGIT_H + ROW_GAP   // 24px → ~21 rows in 512px
const DIGIT_GAP = 1

// Each row gets its own independent value from the `values` array
export default function RepeatingCounter({ values = [], color = '#FF2200', columnWidth = 62, height = 512 }) {
  const DIGIT_W = Math.floor((columnWidth - 4 - 5 * DIGIT_GAP) / 6)
  const usedW   = 6 * DIGIT_W + 5 * DIGIT_GAP
  const xPad    = Math.floor((columnWidth - usedW) / 2)
  const numRows = Math.ceil(height / ROW_H) + 1

  return (
    <div style={{ width: columnWidth, height, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {Array.from({ length: numRows }, (_, i) => {
        const cellVal = values[i] ?? 0
        const str = String(Math.min(Math.max(Math.floor(cellVal), 0), 999999)).padStart(6, '0')
        return (
          <div
            key={i}
            style={{
              display: 'flex', flexDirection: 'row', gap: DIGIT_GAP,
              paddingLeft: xPad, height: ROW_H, flexShrink: 0,
              alignItems: 'flex-start', paddingTop: 2,
            }}
          >
            {str.split('').map((ch, j) => (
              <Digit key={j} value={Number(ch)} width={DIGIT_W} height={DIGIT_H} color={color} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
