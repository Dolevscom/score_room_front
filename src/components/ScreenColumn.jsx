import RepeatingCounter from './RepeatingCounter'

const COUNTING_COLUMN_WIDTH = 60 // fixed — independent of the inter-screen gutter

// Renders one עמודת מסך / מסך ספירה: 2 טורי ספירה side by side
export default function ScreenColumn({
  left = [], right = [], color = '#FF2200',
  unitGutter = 0, digitsPerUnit = 6, font = 'ABC Connect Mono Nail',
  innerGap = 8,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <RepeatingCounter values={left}  color={color} columnWidth={COUNTING_COLUMN_WIDTH} unitGutter={unitGutter} digitsPerUnit={digitsPerUnit} font={font} />
      <div style={{ width: innerGap, flexShrink: 0 }} />
      <RepeatingCounter values={right} color={color} columnWidth={COUNTING_COLUMN_WIDTH} unitGutter={unitGutter} digitsPerUnit={digitsPerUnit} font={font} />
    </div>
  )
}
