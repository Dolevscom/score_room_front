import { useState, useEffect, useRef } from 'react'

const DATA_URL = import.meta.env.VITE_DATA_URL || null
const POLL_MS  = Number(import.meta.env.VITE_POLL_MS) || 250

export const NUM_COLS  = 8
export const NUM_ROWS  = 22           // rows visible per column (512px / 24px row-height)
export const NUM_CELLS = NUM_COLS * NUM_ROWS  // 176 independent cells

// Real mode: expand 8 backend values → 176 cells (all rows in a column get same value)
function expandToGrid(eightVals) {
  const grid = []
  for (let col = 0; col < NUM_COLS; col++) {
    const v = eightVals[col] ?? 0
    for (let row = 0; row < NUM_ROWS; row++) grid.push(v)
  }
  return grid
}

function parseTextFile(text) {
  const lines = text.trim().split(/[\n,\s]+/).filter(Boolean)
  return lines.slice(0, NUM_COLS).map(n => {
    const v = parseInt(n, 10)
    return isNaN(v) ? 0 : Math.max(0, v)
  })
}

export function useScores() {
  const [scores, setScores] = useState(Array(NUM_CELLS).fill(0))
  const cellRef   = useRef(Array(NUM_CELLS).fill(0))
  const speedsRef = useRef(null)

  useEffect(() => {
    if (!DATA_URL) {
      // Pre-compute a random increment speed per cell (increments/sec)
      if (!speedsRef.current) {
        speedsRef.current = Array.from({ length: NUM_CELLS }, (_, i) => {
          const col = Math.floor(i / NUM_ROWS)
          // RED cols (0–3) slightly faster than BLUE (4–7) initially — will diverge
          const colBias = col < 4 ? 1.2 : 0.9
          return colBias * (0.3 + Math.random() * 2.5)   // 0.3–3.2 increments/sec
        })
      }

      const TICK = 120  // ms
      const id = setInterval(() => {
        let dirty = false
        const p = speedsRef.current
        for (let i = 0; i < NUM_CELLS; i++) {
          // Probability of increment this tick
          if (Math.random() < p[i] * (TICK / 1000)) {
            cellRef.current[i] += 1
            dirty = true
          }
        }
        if (dirty) setScores([...cellRef.current])
      }, TICK)

      return () => clearInterval(id)
    }

    // Real backend polling
    const poll = async () => {
      try {
        const res  = await fetch(DATA_URL, { cache: 'no-store' })
        if (!res.ok) return
        const text = await res.text()
        const vals = parseTextFile(text)
        setScores(expandToGrid(vals))
      } catch { /* ignore */ }
    }
    poll()
    const id = setInterval(poll, POLL_MS)
    return () => clearInterval(id)
  }, [])

  return scores
}
