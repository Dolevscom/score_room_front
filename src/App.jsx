import { useState, useEffect } from 'react'
import ScoreBoard from './components/ScoreBoard'
import SummaryScreen from './components/SummaryScreen'
import { useScores, DEFAULT_COUNTING_UNITS } from './hooks/useScores'

const FONTS = [
  'ABC Connect Mono Nail',
  'Doto Regular',
  'Doto Medium',
  'Doto SemiBold',
  'Doto Bold',
  'Doto Black',
  'The Basics Dots',
]

const SUMMARY_VARIANTS = [
  { value: 'climbing',  label: '1: climbing' },
  { value: 'normal',    label: '2: normal' },
  { value: 'stretched', label: '2.5: stretched' },
  { value: 'merged',    label: '3: merged' },
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

export default function App() {
  const { scores, redTotal, blueTotal } = useScores()
  const [gutter, setGutter]                 = usePersisted('scoreroom_gutter', DEFAULTS.gutter)
  const [unitGutter, setUnitGutter]         = usePersisted('scoreroom_unitGutter', DEFAULTS.unitGutter)
  const [digitsPerUnit, setDigitsPerUnit]   = usePersisted('scoreroom_digitsPerUnit', DEFAULTS.digitsPerUnit)
  const [unitsPerColumn, setUnitsPerColumn] = usePersisted('scoreroom_unitsPerColumn', DEFAULTS.unitsPerColumn)
  const [font, setFont]                     = usePersisted('scoreroom_font', DEFAULTS.font)
  const [view, setView]                     = usePersisted('scoreroom_view', DEFAULTS.view)
  const [summaryVariant, setSummaryVariant] = usePersisted('scoreroom_summaryVariant', DEFAULTS.summaryVariant)
  const [summaryDigits, setSummaryDigits]   = usePersisted('scoreroom_summaryDigits', DEFAULTS.summaryDigits)

  const resetDefaults = () => {
    setGutter(DEFAULTS.gutter)
    setUnitGutter(DEFAULTS.unitGutter)
    setDigitsPerUnit(DEFAULTS.digitsPerUnit)
    setUnitsPerColumn(DEFAULTS.unitsPerColumn)
    setFont(DEFAULTS.font)
    setSummaryDigits(DEFAULTS.summaryDigits)
  }



  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {view === 'main' ? (
        <ScoreBoard
          scores={scores}
          gutter={gutter}
          unitGutter={unitGutter}
          digitsPerUnit={digitsPerUnit}
          unitsPerColumn={unitsPerColumn}
          font={font}
        />
      ) : (
        <SummaryScreen redTotal={redTotal} blueTotal={blueTotal} variant={summaryVariant} font={font} digits={summaryDigits} />
      )}

      <div className="scoreroom-controls" style={{
        position: 'fixed', bottom: 6, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
        gap: 10, color: '#888', fontFamily: 'monospace', fontSize: 9,
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          screen
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="main">main board</option>
            <option value="summary">summary screen</option>
          </select>
        </label>

        {view === 'main' && (
          <>
            <Slider label="screen gap" value={gutter} min={0} max={80} onChange={setGutter} />
            <Slider label="unit gap" value={unitGutter} min={-20} max={20} onChange={setUnitGutter} />
            <Slider label="digits" value={digitsPerUnit} min={1} max={10} onChange={setDigitsPerUnit} />
            <Slider label="units" value={unitsPerColumn} min={4} max={48} onChange={setUnitsPerColumn} />
          </>
        )}

        {view === 'summary' && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              layout
              <select value={summaryVariant} onChange={(e) => setSummaryVariant(e.target.value)}>
                {SUMMARY_VARIANTS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </label>
            {summaryVariant !== 'climbing' && (
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
        <button onClick={resetDefaults}>reset</button>
      </div>
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
