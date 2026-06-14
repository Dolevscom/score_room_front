// 7-segment LED display for a single digit (0-9)
const SEGMENT_MAP = {
  0: 'abcdef',
  1: 'bc',
  2: 'abdeg',
  3: 'abcdg',
  4: 'bcfg',
  5: 'acdfg',
  6: 'acdefg',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcdfg',
}

const DEFAULT_COLOR = '#FF2200'
const COLOR_OFF = '#000000'

export default function Digit({ value = 0, width = 50, height = 70, color = DEFAULT_COLOR }) {
  // Scale T and G proportionally so segments never go negative
  const T  = Math.max(1, Math.round(width * 0.11))
  const G  = Math.max(1, Math.round(width * 0.08))
  const R  = Math.floor(T / 2)
  const MH = height / 2

  const segs = {
    a: [T + G, 0,          width - 2 * (T + G), T],
    b: [width - T, T + G,  T, MH - T - 2 * G],
    c: [width - T, MH + G, T, MH - T - 2 * G],
    d: [T + G, height - T, width - 2 * (T + G), T],
    e: [0, MH + G,         T, MH - T - 2 * G],
    f: [0, T + G,          T, MH - T - 2 * G],
    g: [T + G, MH - T / 2, width - 2 * (T + G), T],
  }

  const on = new Set(SEGMENT_MAP[value] ?? '')
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
      shapeRendering="crispEdges"
    >
      {Object.entries(segs).map(([key, [x, y, w, h]]) => {
        const active = on.has(key)
        // Skip segments with non-positive dimensions
        if (w <= 0 || h <= 0) return null
        return (
          <rect
            key={key}
            x={x} y={y} width={w} height={h}
            rx={R} ry={R}
            fill={active ? color : COLOR_OFF}
          />
        )
      })}
    </svg>
  )
}
