import RepeatingCounter from './RepeatingCounter'

// 126px wide: col(62) + divider(2) + col(62) = 126
export default function Section({ left = [], right = [], color = '#FF2200' }) {
  return (
    <div style={{
      width: 126, height: '100%',
      display: 'flex', flexDirection: 'row', flexShrink: 0,
    }}>
      <RepeatingCounter values={left}  color={color} columnWidth={62} height={512} />
      <div style={{ width: 2, height: '100%', background: '#161616', flexShrink: 0 }} />
      <RepeatingCounter values={right} color={color} columnWidth={62} height={512} />
    </div>
  )
}
