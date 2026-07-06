import { useEffect, useRef, useState } from 'react'
import RollingDigit from './RollingDigit'

// מסך סכה ראשי — total per side. Physical screen 96×48cm (2:1), split into
// two 48×48cm squares. Same visual language as the main board: black
// background, RED/BLUE digit color, shared font.
const RED  = '#FF2200'
const BLUE = '#0055FF'
const SCREEN_W = 306
const SCREEN_H = 153
const DIVIDER = 0
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

// אופציה 5: blocks — קצות חיצוניים קבועים, טקסט קבוע, רק קו האמצע זזז
function BlocksScreen({ redTotal, blueTotal, font, digits }) {
  const total = redTotal + blueTotal
  const redRatio = total === 0 ? 0.5 : redTotal / total
  const redW  = Math.max(4, Math.round(redRatio * (SCREEN_W - DIVIDER)))
  const blueW = Math.max(4, SCREEN_W - DIVIDER - redW)

  const halfW = (SCREEN_W - DIVIDER) / 2
  const fontSize = Math.floor(halfW / (digits * 0.65))

  const renderDigits = (t) => clampDigits(t, digits).split('').map((ch, i) => (
    <RollingDigit key={i} digit={ch} fontSize={fontSize} color="#000" font={font} />
  ))

  return (
    <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, background: '#000' }}>
      {/* בלוק אדום: מעוגן לקצה שמאל, גדל ימינה */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: redW, background: RED, transition: 'width 0.7s ease' }} />
      {/* דיוויידר: עוקב אחרי קצה ימין של האדום */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: redW, width: DIVIDER, background: '#1a1a1a', transition: 'left 0.7s ease' }} />
      {/* בלוק כחול: מעוגן לקצה ימין, גדל שמאלה */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: blueW, background: BLUE, transition: 'width 0.7s ease' }} />

      {/* טקסט אדום: תמיד במרכז ה-half השמאלי */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: halfW, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <div style={{ display: 'flex', flexShrink: 0 }}>{renderDigits(redTotal)}</div>
      </div>
      {/* טקסט כחול: תמיד במרכז ה-half הימני */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: halfW, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <div style={{ display: 'flex', flexShrink: 0 }}>{renderDigits(blueTotal)}</div>
      </div>
    </div>
  )
}

// אופציה 4 / 4a / 4b: territory — משפחת וריאנטים שמראים יחס כוחות
const TERRITORY_AMP = 3  // כל הפרש מוגבר פי 3 ויזואלית (0.55/0.45 → 0.65/0.35)

function ampRatio(redTotal, blueTotal) {
  const total = redTotal + blueTotal
  const raw = total === 0 ? 0.5 : redTotal / total
  const red = Math.max(0.04, Math.min(0.96, 0.5 + (raw - 0.5) * TERRITORY_AMP))
  return { red, blue: 1 - red }
}

// 4: territory (מקורי) — הקו זז, טקסט צבעוני על שחור
function TerritoryScreen({ redTotal, blueTotal, font, digits }) {
  const { red: redRatio, blue: blueRatio } = ampRatio(redTotal, blueTotal)
  const redW = Math.round(redRatio * (SCREEN_W - DIVIDER))
  const blueW = SCREEN_W - DIVIDER - redW

  return (
    <div style={{ width: SCREEN_W, height: SCREEN_H, background: '#000', display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: redW, flexShrink: 0, overflow: 'hidden', transition: 'width 0.7s ease' }}>
        <DigitRow total={redTotal} color={RED} font={font} width={redW} height={SCREEN_H} digits={digits} />
      </div>
      <div style={{ width: DIVIDER, background: '#1a1a1a', flexShrink: 0 }} />
      <div style={{ width: blueW, flexShrink: 0, overflow: 'hidden', transition: 'width 0.7s ease' }}>
        <DigitRow total={blueTotal} color={BLUE} font={font} width={blueW} height={SCREEN_H} digits={digits} />
      </div>
    </div>
  )
}

// 4a: territory↕ — מחלקה קבועה 50/50, שחור, מתיחה אנכית לפי יחס
function TerritoryVScreen({ redTotal, blueTotal, font, digits }) {
  const { red: redRatio, blue: blueRatio } = ampRatio(redTotal, blueTotal)
  const halfW = (SCREEN_W - DIVIDER) / 2
  const fontSize = Math.floor(halfW / (digits * 0.65))
  const redScaleY = STRETCH_FACTOR * 2 * redRatio
  const blueScaleY = STRETCH_FACTOR * 2 * blueRatio

  const renderSide = (total, color, scaleY) => (
    <div style={{ width: halfW, height: SCREEN_H, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ display: 'flex', transform: `scaleY(${scaleY})`, transition: 'transform 0.7s ease' }}>
        {clampDigits(total, digits).split('').map((ch, i) => (
          <RollingDigit key={i} digit={ch} fontSize={fontSize} color={color} font={font} />
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ width: SCREEN_W, height: SCREEN_H, background: '#000', display: 'flex' }}>
      {renderSide(redTotal, RED, redScaleY)}
      <div style={{ width: DIVIDER, background: '#1a1a1a', flexShrink: 0 }} />
      {renderSide(blueTotal, BLUE, blueScaleY)}
    </div>
  )
}

// 4b: territory↔ — הדיוויידר נע (דוחפים), שחור, מתיחה אופקית לפי יחס
function TerritoryHScreen({ redTotal, blueTotal, font, digits }) {
  const { red: redRatio, blue: blueRatio } = ampRatio(redTotal, blueTotal)
  const redW = Math.round(redRatio * (SCREEN_W - DIVIDER))
  const blueW = SCREEN_W - DIVIDER - redW
  const halfW = (SCREEN_W - DIVIDER) / 2
  const fontSize = Math.floor(halfW / (digits * 0.65))
  const redScaleX = redRatio * 2
  const blueScaleX = blueRatio * 2

  const renderSide = (total, color, width, scaleX) => (
    <div style={{ width, flexShrink: 0, height: SCREEN_H, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'width 0.7s ease' }}>
      <div style={{ display: 'flex', flexShrink: 0, transform: `scaleX(${scaleX})`, transition: 'transform 0.7s ease' }}>
        {clampDigits(total, digits).split('').map((ch, i) => (
          <RollingDigit key={i} digit={ch} fontSize={fontSize} color={color} font={font} />
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ width: SCREEN_W, height: SCREEN_H, background: '#000', display: 'flex', overflow: 'hidden' }}>
      {renderSide(redTotal, RED, redW, redScaleX)}
      <div style={{ width: DIVIDER, background: '#1a1a1a', flexShrink: 0 }} />
      {renderSide(blueTotal, BLUE, blueW, blueScaleX)}
    </div>
  )
}

export default function SummaryScreen({ redTotal = 0, blueTotal = 0, variant = 'normal', font = 'ABC Connect Mono Nail', digits = 8 }) {
  const [flash, setFlash] = useState(null) // { color, key }
  const prevLeaderRef = useRef(null)
  const flashTimerRef = useRef(null)
  const flashKeyRef = useRef(0)

  useEffect(() => {
    if (redTotal + blueTotal === 0) return
    const leader = redTotal > blueTotal ? 'red' : 'blue'
    if (prevLeaderRef.current !== null && leader !== prevLeaderRef.current) {
      clearTimeout(flashTimerRef.current)
      flashKeyRef.current += 1
      setFlash({ color: leader === 'red' ? RED : BLUE, key: flashKeyRef.current })
      flashTimerRef.current = setTimeout(() => setFlash(null), 1050)
    }
    prevLeaderRef.current = leader
  }, [redTotal, blueTotal])

  let content
  if (variant === 'merged') {
    content = <MergedStrip redTotal={redTotal} blueTotal={blueTotal} font={font} digits={digits} />
  } else if (variant === 'territory') {
    content = <TerritoryScreen redTotal={redTotal} blueTotal={blueTotal} font={font} digits={digits} />
  } else if (variant === 'territory-v') {
    content = <TerritoryVScreen redTotal={redTotal} blueTotal={blueTotal} font={font} digits={digits} />
  } else if (variant === 'territory-h') {
    content = <TerritoryHScreen redTotal={redTotal} blueTotal={blueTotal} font={font} digits={digits} />
  } else if (variant === 'blocks') {
    content = <BlocksScreen redTotal={redTotal} blueTotal={blueTotal} font={font} digits={digits} />
  } else {
    const squareSize = (SCREEN_W - DIVIDER) / 2
    content = (
      <>
        <Square total={redTotal} color={RED} variant={variant} font={font} size={squareSize} digits={digits} />
        <div style={{ width: DIVIDER, height: '100%', background: '#1a1a1a', flexShrink: 0 }} />
        <Square total={blueTotal} color={BLUE} variant={variant} font={font} size={squareSize} digits={digits} />
      </>
    )
  }

  return (
    <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, background: '#000', display: 'flex' }}>
      {content}
      {flash && (
        <div
          key={flash.key}
          className="overtake-flash"
          style={{ position: 'absolute', inset: 0, background: flash.color, zIndex: 20 }}
          onAnimationEnd={() => setFlash(null)}
        />
      )}
    </div>
  )
}
