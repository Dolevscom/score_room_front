import { useState, useEffect } from 'react'
import ScoreBoard from './components/ScoreBoard'
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

const DEFAULTS = {
  gutter: 8,
  unitGutter: 0,
  digitsPerUnit: 6,
  unitsPerColumn: DEFAULT_COUNTING_UNITS,
  font: FONTS[0],
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
  const scores = useScores()
  const [gutter, setGutter]                 = usePersisted('scoreroom_gutter', DEFAULTS.gutter)
  const [unitGutter, setUnitGutter]         = usePersisted('scoreroom_unitGutter', DEFAULTS.unitGutter)
  const [digitsPerUnit, setDigitsPerUnit]   = usePersisted('scoreroom_digitsPerUnit', DEFAULTS.digitsPerUnit)
  const [unitsPerColumn, setUnitsPerColumn] = usePersisted('scoreroom_unitsPerColumn', DEFAULTS.unitsPerColumn)
  const [font, setFont]                     = usePersisted('scoreroom_font', DEFAULTS.font)

  const resetDefaults = () => {
    setGutter(DEFAULTS.gutter)
    setUnitGutter(DEFAULTS.unitGutter)
    setDigitsPerUnit(DEFAULTS.digitsPerUnit)
    setUnitsPerColumn(DEFAULTS.unitsPerColumn)
    setFont(DEFAULTS.font)
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
      <ScoreBoard
        scores={scores}
        gutter={gutter}
        unitGutter={unitGutter}
        digitsPerUnit={digitsPerUnit}
        unitsPerColumn={unitsPerColumn}
        font={font}
      />

      <div className="scoreroom-controls" style={{
        position: 'fixed', bottom: 6, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
        gap: 10, color: '#888', fontFamily: 'monospace', fontSize: 9,
      }}>
        <Slider label="screen gap" value={gutter} min={0} max={80} onChange={setGutter} />
        <Slider label="unit gap" value={unitGutter} min={-20} max={20} onChange={setUnitGutter} />
        <Slider label="digits" value={digitsPerUnit} min={1} max={10} onChange={setDigitsPerUnit} />
        <Slider label="units" value={unitsPerColumn} min={4} max={48} onChange={setUnitsPerColumn} />
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
