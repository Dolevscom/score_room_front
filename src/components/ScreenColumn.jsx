import RepeatingCounter from './RepeatingCounter'

const COUNTING_COLUMN_WIDTH = 60 // fixed — independent of the inter-screen gutter
const INNER_SEAM = 2             // fixed seam between the 2 טורי ספירה inside one מסך ספירה

// Renders one עמודת מסך / מסך ספירה: 2 טורי ספירה side by side
export default function ScreenColumn({
  left = [], right = [], color = '#FF2200',
  unitGutter = 0, digitsPerUnit = 6, font = 'ABC Connect Mono Nail',
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <RepeatingCounter values={left}  color={color} columnWidth={COUNTING_COLUMN_WIDTH} unitGutter={unitGutter} digitsPerUnit={digitsPerUnit} font={font} />
      <div style={{ width: INNER_SEAM, background: '#161616', flexShrink: 0 }} />
      <RepeatingCounter values={right} color={color} columnWidth={COUNTING_COLUMN_WIDTH} unitGutter={unitGutter} digitsPerUnit={digitsPerUnit} font={font} />
    </div>
  )
}
