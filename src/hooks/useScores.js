import { useState, useEffect, useRef } from 'react'

const DATA_URL = import.meta.env.VITE_DATA_URL || null
const POLL_MS  = Number(import.meta.env.VITE_POLL_MS) || 250

export const NUM_COLS  = 8
export const NUM_ROWS  = 22           // rows visible per column (512px / 24px row-height)
export const NUM_CELLS = NUM_COLS * NUM_ROWS  // 176 independent cells

// Real mode: expand 8 backend values → 176 cells (all rows in a column get same value)
// Parse the JSON state structure:
// {"Red": {"1": [row0, ..., row21], ...}, "Blue": {"1": [row0, ..., row21], ...}}
function parseJsonState(data) {
  const grid = Array(NUM_CELLS).fill(0)
  if (!data) return grid

  const red = data.Red || {}
  const blue = data.Blue || {}

  // Red columns 1-4 map to columns 0-3 on the screen
  for (let c = 0; c < 4; c++) {
    const colKey = String(c + 1)
    const colVals = red[colKey] || []
    for (let r = 0; r < NUM_ROWS; r++) {
      grid[c * NUM_ROWS + r] = Number(colVals[r]) || 0
    }
  }

  // Blue columns 1-4 map to columns 4-7 on the screen
  for (let c = 0; c < 4; c++) {
    const colKey = String(c + 1)
    const colVals = blue[colKey] || []
    for (let r = 0; r < NUM_ROWS; r++) {
      grid[(c + 4) * NUM_ROWS + r] = Number(colVals[r]) || 0
    }
  }

  return grid
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
        const data = await res.json()
        setScores(parseJsonState(data))
      } catch (err) {
        console.error("Error loading scores JSON:", err)
      }
    }
    poll()
    const id = setInterval(poll, POLL_MS)
    return () => clearInterval(id)
  }, [])

  return scores
}
