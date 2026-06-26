import { useEffect, useRef, useState, memo } from 'react'

const DURATION = 220 // ms — medium-speed roll

// One ספרה. When `digit` changes, the old digit slides up and out while the
// new one slides up from below into place. Digits that don't change never animate.
function RollingDigit({ digit, fontSize, color, font }) {
  const lastDigit = useRef(digit)
  const [prevDigit, setPrevDigit] = useState(null)
  const [rolling, setRolling] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (digit === lastDigit.current) return
    setPrevDigit(lastDigit.current)
    lastDigit.current = digit
    setRolling(false)

    const raf = requestAnimationFrame(() => setRolling(true))
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setPrevDigit(null)
      setRolling(false)
    }, DURATION)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeoutRef.current)
    }
  }, [digit])

  const slotStyle = {
    display: 'inline-block',
    width: '1ch',
    height: fontSize,
    overflow: 'hidden',
    position: 'relative',
    fontFamily: `'${font}', monospace`,
    fontSize, lineHeight: 1, color,
  }

  if (prevDigit === null) {
    return <span style={slotStyle}>{digit}</span>
  }

  const offset = rolling ? '-100%' : '0%'
  return (
    <span style={slotStyle}>
      <span style={{ position: 'absolute', top: 0, left: 0, transform: `translateY(${offset})`, transition: `transform ${DURATION}ms ease` }}>
        {prevDigit}
      </span>
      <span style={{ position: 'absolute', top: '100%', left: 0, transform: `translateY(${offset})`, transition: `transform ${DURATION}ms ease` }}>
        {digit}
      </span>
    </span>
  )
}

export default memo(RollingDigit)
