import Digit from './Digit'

const DIGIT_PLACES = 6
const DIGIT_W = 50
const DIGIT_H = 70

export default function Counter({ value = 0, color }) {
  const clamped = Math.min(Math.max(Math.floor(value), 0), 999999)
  const str = String(clamped).padStart(DIGIT_PLACES, '0')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      width: '100%',
      height: '100%',
    }}>
      {str.split('').map((ch, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${100 / DIGIT_PLACES}%`,
            width: '100%',
          }}
        >
          <Digit value={Number(ch)} width={DIGIT_W} height={DIGIT_H} color={color} />
        </div>
      ))}
    </div>
  )
}
