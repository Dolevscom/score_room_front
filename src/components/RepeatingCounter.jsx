import RollingDigit from './RollingDigit'

const COUNTING_UNIT_H = 16 // height of one יחידת ספירה at the default spec

// Renders one טור ספירה: a vertical stack of independent multi-digit values
export default function RepeatingCounter({
  values = [],
  color = '#FF2200',
  columnWidth = 60,
  unitGutter = 0,
  digitsPerUnit = 6,
  font = 'ABC Connect Mono Nail',
}) {
  const fontSize = Math.floor(columnWidth / (digitsPerUnit * 0.6)) // mono chars fill columnWidth
  const maxVal = 10 ** digitsPerUnit - 1

  return (
    // marginTop (not CSS `gap`) so unitGutter can go negative and overlap rows
    <div style={{ width: columnWidth, display: 'flex', flexDirection: 'column' }}>
      {values.map((cellVal, i) => {
        const str = String(Math.min(Math.max(Math.floor(cellVal ?? 0), 0), maxVal)).padStart(digitsPerUnit, '0')
        return (
          <div
            key={i}
            style={{
              height: COUNTING_UNIT_H, flexShrink: 0,
              marginTop: i === 0 ? 0 : unitGutter,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {str.split('').map((ch, j) => (
              <RollingDigit key={j} digit={ch} fontSize={fontSize} color={color} font={font} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
