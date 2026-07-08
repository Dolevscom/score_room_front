import { useState, useEffect, useRef } from 'react'
import ScoreBoard from './components/ScoreBoard'
import SummaryScreen from './components/SummaryScreen'
import { useScores, DEFAULT_COUNTING_UNITS, MAX_COUNTING_UNITS } from './hooks/useScores'

// When any score cell drops to 0 from a positive value (reset event), animate
// display values counting down 1-by-1 at 20ms/step instead of snapping to 0.
function useCountdownOnReset(rawScores) {
  const [display, setDisplay] = useState(() => [...rawScores])
  const intervalRef = useRef(null)
  const prevRef = useRef([...rawScores])
  const rawRef = useRef(rawScores)
  const animatingRef = useRef(new Set())

  useEffect(() => { rawRef.current = rawScores }, [rawScores])

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = [...rawScores]

    const newlyReset = []
    for (let i = 0; i < rawScores.length; i++) {
      if (rawScores[i] === 0 && prev[i] > 0) {
        newlyReset.push(i)
        animatingRef.current.add(i)
      }
    }

    if (newlyReset.length === 0) {
      setDisplay(d => animatingRef.current.size === 0
        ? rawScores
        : d.map((v, i) => animatingRef.current.has(i) ? v : rawScores[i])
      )
      return
    }

    setDisplay(d => d.map((v, i) => {
      if (newlyReset.includes(i)) return prev[i]
      if (animatingRef.current.has(i)) return v
      return rawScores[i]
    }))

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setDisplay(d => {
          const raw = rawRef.current
          const next = d.map((v, i) => {
            if (!animatingRef.current.has(i)) return raw[i]
            const nv = v - 1
            if (nv <= 0) { animatingRef.current.delete(i); return 0 }
            return nv
          })
          if (animatingRef.current.size === 0) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return next
        })
      }, 20)
    }
  }, [rawScores])

  useEffect(() => () => clearInterval(intervalRef.current), [])
  return display
}

const FONTS = [
  'ABC Connect Mono Nail',
  'Doto Medium',
  'Doto SemiBold',
  'Doto Bold',
  'The Basics Dots',
  'Narkiss Yair Mono',
  'littlebit-dotty-variable',
  'littlebit-square-variable',
]

const SUMMARY_VARIANTS = [
  { value: 'climbing',  label: '1: climbing' },
  { value: 'normal',    label: '2: normal' },
  { value: 'stretched', label: '2.5: stretched' },
  { value: 'merged',    label: '3: merged' },
  { value: 'territory', label: '4: territory' },
  { value: 'territory-v', label: '4a: territory↕' },
  { value: 'territory-h', label: '4b: territory↔' },
  { value: 'blocks',    label: '5: blocks' },
  { value: 'framed',    label: '6: framed' },
  { value: 'marching',  label: '7: marching' },
]


const DEFAULTS = {
  gutter: 8,
  unitGutter: 0,
  digitsPerUnit: 6,
  unitsPerColumn: DEFAULT_COUNTING_UNITS,
  font: FONTS[0],
  view: 'main',
  summaryVariant: 'normal',
  summaryDigits: 8,
  fontDyna: 0,
  fontGdyn: 0,
  rowOffset: -2,
}

function usePersisted(key, fallback) {
  const isNumber = typeof fallback === 'number'
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key)
    if (saved === null) return fallback
    return isNumber ? Number(saved) : saved
  })
  useEffect(() => { localStorage.setItem(key, value) }, [key, value])
  return [value, setValue]
}

const URL_VIEW = new URLSearchParams(window.location.search).get('view') // 'main' | 'summary' | null

export default function App() {
  const { scores: rawScores } = useScores()
  const scores = useCountdownOnReset(rawScores)
  const redTotal  = scores.slice(0, 4 * MAX_COUNTING_UNITS).reduce((a, b) => a + b, 0)
  const blueTotal = scores.slice(4 * MAX_COUNTING_UNITS).reduce((a, b) => a + b, 0)
  const [gutter, setGutter]                 = usePersisted('scoreroom_gutter', DEFAULTS.gutter)
  const [unitGutter, setUnitGutter]         = usePersisted('scoreroom_unitGutter', DEFAULTS.unitGutter)
  const [digitsPerUnit, setDigitsPerUnit]   = usePersisted('scoreroom_digitsPerUnit', DEFAULTS.digitsPerUnit)
  const [unitsPerColumn, setUnitsPerColumn] = usePersisted('scoreroom_unitsPerColumn', DEFAULTS.unitsPerColumn)
  const [font, setFont]                     = usePersisted('scoreroom_font', DEFAULTS.font)
  const [view, setView]                     = usePersisted('scoreroom_view', DEFAULTS.view)
  const [summaryVariant, setSummaryVariant] = usePersisted('scoreroom_summaryVariant', DEFAULTS.summaryVariant)
  const [summaryDigits, setSummaryDigits]   = usePersisted('scoreroom_summaryDigits', DEFAULTS.summaryDigits)
  const [fontDyna, setFontDyna]             = usePersisted('scoreroom_fontDyna', DEFAULTS.fontDyna)
  const [fontGdyn, setFontGdyn]             = usePersisted('scoreroom_fontGdyn', DEFAULTS.fontGdyn)
  const [rowOffset, setRowOffset]           = usePersisted('scoreroom_rowOffset', DEFAULTS.rowOffset)

  const effectiveView = URL_VIEW || view
  const isLittlebit = font.includes('littlebit')
  const [showControls, setShowControls] = useState(true)
  const [flash, setFlash] = useState(null)
  const flashKeyRef = useRef(0)
  const flashTimerRef = useRef(null)
  const prevLeaderRef = useRef(null)

  useEffect(() => {
    if (redTotal + blueTotal === 0) return
    const leader = redTotal > blueTotal ? 'red' : blueTotal > redTotal ? 'blue' : null
    if (leader !== null && prevLeaderRef.current !== null && leader !== prevLeaderRef.current) {
      clearTimeout(flashTimerRef.current)
      flashKeyRef.current += 1
      setFlash({ color: leader === 'red' ? '#FF2200' : '#0055FF', key: flashKeyRef.current })
      flashTimerRef.current = setTimeout(() => setFlash(null), 1050)
    }
    if (leader !== null) prevLeaderRef.current = leader
  }, [redTotal, blueTotal])

  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    timeout = setTimeout(() => setShowControls(false), 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const resetDefaults = () => {
    setGutter(DEFAULTS.gutter)
    setUnitGutter(DEFAULTS.unitGutter)
    setDigitsPerUnit(DEFAULTS.digitsPerUnit)
    setUnitsPerColumn(DEFAULTS.unitsPerColumn)
    setFont(DEFAULTS.font)
    setSummaryDigits(DEFAULTS.summaryDigits)
    setFontDyna(DEFAULTS.fontDyna)
    setFontGdyn(DEFAULTS.fontGdyn)
    setRowOffset(DEFAULTS.rowOffset)
  }



  const fontVariationSettings = isLittlebit
    ? `'DYNA' ${fontDyna}, 'GDYN' ${fontGdyn}`
    : undefined

  const isLocked = !!URL_VIEW

  return (
    <div style={{
      width: 512,
      height: 384,
      minWidth: 512,
      minHeight: 384,
      background: '#000',
      position: 'relative',
      overflow: 'hidden',
      fontVariationSettings,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 512, height: 384 }}>
        {effectiveView === 'main' ? (
          <ScoreBoard
            scores={scores}
            gutter={gutter}
            unitGutter={unitGutter}
            digitsPerUnit={digitsPerUnit}
            unitsPerColumn={unitsPerColumn}
            font={font}
            locked={true}
            rowOffset={rowOffset}
          />
        ) : summaryVariant === 'framed' ? (
          <SummaryFrame font={font}>
            <SummaryScreen redTotal={redTotal} blueTotal={blueTotal} variant="normal" font={font} digits={summaryDigits} />
          </SummaryFrame>
        ) : summaryVariant === 'marching' ? (
          <MarchingFrame font={font} color={redTotal >= blueTotal ? RED_C : BLUE_C}>
            <SummaryScreen redTotal={redTotal} blueTotal={blueTotal} variant="normal" font={font} digits={summaryDigits} />
          </MarchingFrame>
        ) : (
          <div style={{ width: 306, height: 153, overflow: 'hidden', background: '#000' }}>
            <SummaryScreen redTotal={redTotal} blueTotal={blueTotal} variant={summaryVariant} font={font} digits={summaryDigits} />
          </div>
        )}
      </div>

      {flash && effectiveView === 'summary' && (
        <div
          key={flash.key}
          className="overtake-flash"
          style={{ position: 'absolute', inset: 0, background: flash.color, zIndex: 10, pointerEvents: 'none' }}
          onAnimationEnd={() => setFlash(null)}
        />
      )}

      <div className="scoreroom-controls" style={{
        position: 'fixed', bottom: 6, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
        gap: 10, color: '#888', fontFamily: 'monospace', fontSize: 9,
        opacity: showControls ? 1 : 0,
        pointerEvents: showControls ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
      }}>
        {!URL_VIEW && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            screen
            <select value={view} onChange={(e) => setView(e.target.value)}>
              <option value="main">main board</option>
              <option value="summary">summary screen</option>
            </select>
          </label>
        )}

        {effectiveView === 'main' && (
          <>
            <Slider label="screen gap" value={gutter} min={0} max={80} onChange={setGutter} />
            <Slider label="unit gap" value={unitGutter} min={-20} max={20} onChange={setUnitGutter} />
            <Slider label="digits" value={digitsPerUnit} min={1} max={10} onChange={setDigitsPerUnit} />
            <Slider label="units" value={unitsPerColumn} min={4} max={48} onChange={setUnitsPerColumn} />
            <Slider label="row offset" value={rowOffset} min={-16} max={16} onChange={setRowOffset} />
          </>
        )}

        {effectiveView === 'summary' && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              layout
              <select value={summaryVariant} onChange={(e) => setSummaryVariant(e.target.value)}>
                {SUMMARY_VARIANTS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </label>
            {summaryVariant !== 'climbing' && summaryVariant !== 'territory' && (
              <Slider label="digits" value={summaryDigits} min={1} max={16} onChange={setSummaryDigits} />
            )}
          </>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          font
          <select value={font} onChange={(e) => setFont(e.target.value)}>
            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        {isLittlebit && (
          <>
            <Slider label="DYNA" value={fontDyna} min={0} max={100} onChange={setFontDyna} />
            <Slider label="GDYN" value={fontGdyn} min={0} max={100} onChange={setFontGdyn} />
          </>
        )}
        <button onClick={resetDefaults}>reset</button>
        <button onClick={() => { window.__pumpScores?.(80); setTimeout(() => window.__simulateReset?.(), 800) }}>test reset anim</button>
      </div>
    </div>
  )
}

const FRAME_CHAR = '*'
const FRAME_CELL = 8   // square cell — horizontal pitch = vertical pitch
const FRAME_PAD  = 3   // inner gap: chosen so totalW = 8+306+6+8 = 328 = 41×8 exactly
const CONTENT_W  = 306
const CONTENT_H  = 153
const RED_C  = '#FF2200'
const BLUE_C = '#0055FF'

function SummaryFrame({ font, children }) {
  // totalW = FRAME_CELL + CONTENT_W + FRAME_PAD*2 + FRAME_CELL = 328 = 41*8 (exact)
  const totalW = FRAME_CELL + CONTENT_W + FRAME_PAD * 2 + FRAME_CELL
  const innerH = CONTENT_H + FRAME_PAD * 2

  const hCount = totalW / FRAME_CELL        // 41 — exact, no rounding
  const halfH  = Math.floor(hCount / 2)     // 20 red, 21 blue
  const vCount = Math.ceil(innerH / FRAME_CELL)  // 20, clips 1px via overflow:hidden

  const cell = (color, k) => (
    <span key={k} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: FRAME_CELL, height: FRAME_CELL, flexShrink: 0,
      fontSize: FRAME_CELL * 0.85, lineHeight: 1,
      color, fontFamily: font,
    }}>{FRAME_CHAR}</span>
  )

  const HRow = () => (
    <div style={{ display: 'flex', height: FRAME_CELL }}>
      {Array.from({ length: halfH },          (_, i) => cell(RED_C,  i))}
      {Array.from({ length: hCount - halfH }, (_, i) => cell(BLUE_C, `b${i}`))}
    </div>
  )

  const VCol = ({ color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', width: FRAME_CELL, height: innerH, overflow: 'hidden', flexShrink: 0 }}>
      {Array.from({ length: vCount }, (_, i) => cell(color, i))}
    </div>
  )

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', background: '#000' }}>
      <HRow />
      <div style={{ display: 'flex' }}>
        <VCol color={RED_C} />
        <div style={{ padding: FRAME_PAD, background: '#000', flexShrink: 0 }}>
          {children}
        </div>
        <VCol color={BLUE_C} />
      </div>
      <HRow />
    </div>
  )
}

const MARCH_PERIOD = 8  // seconds per full clockwise revolution

function MarchingFrame({ font, color, children }) {
  const totalW     = FRAME_CELL + CONTENT_W + FRAME_PAD * 2 + FRAME_CELL
  const innerH     = CONTENT_H + FRAME_PAD * 2
  const hCount     = totalW / FRAME_CELL
  const vCount     = Math.ceil(innerH / FRAME_CELL)
  const totalPerim = 2 * hCount + 2 * vCount

  const cell = (perimIdx, k) => (
    <span key={k} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: FRAME_CELL, height: FRAME_CELL, flexShrink: 0,
      fontSize: FRAME_CELL * 0.85, lineHeight: 1,
      color, fontFamily: font,
      animation: `march ${MARCH_PERIOD}s linear infinite`,
      animationDelay: `${-((perimIdx / totalPerim) * MARCH_PERIOD).toFixed(3)}s`,
    }}>{FRAME_CHAR}</span>
  )

  const topCells    = Array.from({ length: hCount }, (_, i) => cell(i, `t${i}`))
  const rightCells  = Array.from({ length: vCount }, (_, i) => cell(hCount + i, `r${i}`))
  const bottomCells = Array.from({ length: hCount }, (_, i) => cell(hCount + vCount + i, `b${i}`))
  const leftCells   = Array.from({ length: vCount }, (_, i) => cell(2 * hCount + 2 * vCount - 1 - i, `l${i}`))

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', background: '#000' }}>
      <div style={{ display: 'flex', height: FRAME_CELL }}>{topCells}</div>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: FRAME_CELL, height: innerH, overflow: 'hidden', flexShrink: 0 }}>
          {leftCells}
        </div>
        <div style={{ padding: FRAME_PAD, background: '#000', flexShrink: 0 }}>
          {children}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: FRAME_CELL, height: innerH, overflow: 'hidden', flexShrink: 0 }}>
          {rightCells}
        </div>
      </div>
      <div style={{ display: 'flex', height: FRAME_CELL }}>{bottomCells}</div>
    </div>
  )
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {label} {value}
      <input
        type="range" min={min} max={max} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}
