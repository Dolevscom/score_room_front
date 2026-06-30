import { useState, useEffect, useRef } from 'react'

const DATA_URL = import.meta.env.VITE_DATA_URL || null
const POLL_MS  = Number(import.meta.env.VITE_POLL_MS) || 250

// Shared vocabulary (small → large):
// ספרה (digit) → יחידת ספירה (counting unit, N digits) → טור ספירה (counting column, N counting units)
// → עמודת מסך / מסך ספירה (screen column, 2 counting columns)
export const COUNTING_COLUMNS = 8         // total טורי ספירה (4 screen columns × 2)
export const DEFAULT_COUNTING_UNITS = 24  // default יחידות ספירה בכל טור ספירה
export const MAX_COUNTING_UNITS = 64      // headroom so the live "units per column" slider needs no re-init
export const NUM_CELLS = COUNTING_COLUMNS * MAX_COUNTING_UNITS

// Real mode: parse the JSON state structure:
// {"Red": {"1": [unit0, unit1, ...], ...}, "Blue": {"1": [...], ...}, "RedTotal": 0, "BlueTotal": 0}
function parseJsonState(data) {
  const grid = Array(NUM_CELLS).fill(0)
  if (!data) return { scores: grid, redTotal: 0, blueTotal: 0 }

  const red = data.Red || {}
  const blue = data.Blue || {}

  // Red counting columns 1-4 map to columns 0-3 on the screen
  for (let c = 0; c < 4; c++) {
    const colKey = String(c + 1)
    const colVals = red[colKey] || []
    for (let u = 0; u < Math.min(colVals.length, MAX_COUNTING_UNITS); u++) {
      grid[c * MAX_COUNTING_UNITS + u] = Number(colVals[u]) || 0
    }
  }

  // Blue counting columns 1-4 map to columns 4-7 on the screen
  for (let c = 0; c < 4; c++) {
    const colKey = String(c + 1)
    const colVals = blue[colKey] || []
    for (let u = 0; u < Math.min(colVals.length, MAX_COUNTING_UNITS); u++) {
      grid[(c + 4) * MAX_COUNTING_UNITS + u] = Number(colVals[u]) || 0
    }
  }

  return { scores: grid, redTotal: data.RedTotal || 0, blueTotal: data.BlueTotal || 0 }
}

export function useScores() {
  const [state, setState] = useState({ scores: Array(NUM_CELLS).fill(0), redTotal: 0, blueTotal: 0 })
  const cellRef = useRef(Array(NUM_CELLS).fill(0))

  useEffect(() => {
    if (!DATA_URL) {
      // Simulate sparse, discrete button-press events (like the real Arduino),
      // not a dense simultaneous random walk — so individual digit-roll
      // transitions are actually visible and testable.
      const TICK = 250          // ms between checks
      const PRESS_CHANCE = 0.6  // probability of one press happening this tick
      const id = setInterval(() => {
        if (Math.random() < PRESS_CHANCE) {
          const i = Math.floor(Math.random() * NUM_CELLS)
          cellRef.current[i] += 1
          setState(prev => {
            const isRed = i < 4 * MAX_COUNTING_UNITS
            return {
              scores: [...cellRef.current],
              redTotal: prev.redTotal + (isRed ? 1 : 0),
              blueTotal: prev.blueTotal + (isRed ? 0 : 1),
            }
          })
        }
      }, TICK)

      return () => clearInterval(id)
    }

    // Real backend polling
    const poll = async () => {
      try {
        const res  = await fetch(DATA_URL, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        setState(parseJsonState(data))
      } catch (err) {
        console.error("Error loading scores JSON:", err)
      }
    }
    poll()
    const id = setInterval(poll, POLL_MS)
    return () => clearInterval(id)
  }, [])

  return state
}
