import RollingDigit from './RollingDigit'

// מסך סכמה ראשי — total per side. Physical screen 96×48cm (2:1), split into
// two 48×48cm squares. Same visual language as the main board: black
// background, RED/BLUE digit color, shared font.
const RED  = '#FF2200'
const BLUE = '#0055FF'
const SCREEN_W = 600
const SCREEN_H = 300
const DIVIDER = 2
const STRETCH_FACTOR = 2.6

function clampDigits(total, digits) {
  const maxVal = 10 ** digits - 1
  return String(Math.min(Math.max(Math.floor(total ?? 0), 0), maxVal)).padStart(digits, '0')
}

// אופציה 1: ספירה משתרכת — 4×4 ספרות, מתחיל בפינה ימנית-תחתונה (יחידות)
// ומטפס שורה-שורה כלפי מעלה ככל שהמספר גדל. תמיד 16 ספרות (קבוע למבנה הרשת).
function ClimbingGrid({ total, color, font, size }) {
  const str = clampDigits(total, 16)
  const cellSize = size / 4
  const fontSize = Math.floor(cellSize / 1.7)

  const cells = []
  for (let row = 3; row >= 0; row--) {
    for (let col = 3; col >= 0; col--) {
      const place = (3 - row) * 4 + (3 - col)
      const ch = str[str.length - 1 - place]
      cells.push({ row, col, ch, key: `${row}-${col}` })
    }
  }

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {cells.map(({ row, col, ch, key }) => (
        <div key={key} style={{
          position: 'absolute', left: col * cellSize, top: row * cellSize,
          width: cellSize, height: cellSize,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <RollingDigit digit={ch} fontSize={fontSize} color={color} font={font} />
        </div>
      ))}
    </div>
  )
}

// אופציה 2 / 2.5: שורת ספרות אחת, ממורכזת. stretch>1 מותח אנכית (2.5)
function DigitRow({ total, color, font, width, height, digits, stretch = 1 }) {
  const str = clampDigits(total, digits)
  const fontSize = Math.floor(width / (digits * 0.65))

  return (
    <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', transform: stretch !== 1 ? `scaleY(${stretch})` : undefined }}>
        {str.split('').map((ch, i) => (
          <RollingDigit key={i} digit={ch} fontSize={fontSize} color={color} font={font} />
        ))}
      </div>
    </div>
  )
}

function Square({ total, color, variant, font, size, digits }) {
  if (variant === 'climbing') {
    return <ClimbingGrid total={total} color={color} font={font} size={size} />
  }
  const stretch = variant === 'stretched' ? STRETCH_FACTOR : 1
  return <DigitRow total={total} color={color} font={font} width={size} height={SCREEN_H} digits={digits} stretch={stretch} />
}

// אופציה 3: בלי גאטר בין שני הצדדים — מספר אחד רצוף משני קצוות המסך, ההבדל היחיד הוא הצבע
function MergedStrip({ redTotal, blueTotal, font, digits }) {
  const redStr  = clampDigits(redTotal, digits)
  const blueStr = clampDigits(blueTotal, digits)
  const fontSize = Math.floor(SCREEN_W / (digits * 2 * 0.65))

  return (
    <div style={{
      width: SCREEN_W, height: SCREEN_H, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {redStr.split('').map((ch, i) => (
        <RollingDigit key={`r${i}`} digit={ch} fontSize={fontSize} color={RED} font={font} />
      ))}
      {blueStr.split('').map((ch, i) => (
        <RollingDigit key={`b${i}`} digit={ch} fontSize={fontSize} color={BLUE} font={font} />
      ))}
    </div>
  )
}

export default function SummaryScreen({ redTotal = 0, blueTotal = 0, variant = 'normal', font = 'ABC Connect Mono Nail', digits = 8 }) {
  if (variant === 'merged') {
    return <MergedStrip redTotal={redTotal} blueTotal={blueTotal} font={font} digits={digits} />
  }

  const squareSize = (SCREEN_W - DIVIDER) / 2

  return (
    <div style={{ width: SCREEN_W, height: SCREEN_H, background: '#000', display: 'flex' }}>
      <Square total={redTotal} color={RED} variant={variant} font={font} size={squareSize} digits={digits} />
      <div style={{ width: DIVIDER, height: '100%', background: '#1a1a1a', flexShrink: 0 }} />
      <Square total={blueTotal} color={BLUE} variant={variant} font={font} size={squareSize} digits={digits} />
    </div>
  )
}
