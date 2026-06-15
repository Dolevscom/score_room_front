# חדר ניקוד — Score Room

LED scoreboard display for **Jerusalem Design Week 2026**.

An immersive dark-room installation where physical buttons increment scores displayed on a 2×2 meter modular LED screen. 512×512px resolution, split into red (team A) and blue (team B) halves.

![scoreboard preview](https://raw.githubusercontent.com/dolevsmac/score-room/main/preview.png)

## What it looks like

- **176 independent 7-segment counters** (8 columns × 22 rows), each incrementing at its own rate
- **Red / Blue split** with an 8px physical gap between LED panels
- Tiny 9×10px digits rendered as crisp SVG at pixel-perfect scale

## Modes

| Mode | How it works |
|------|-------------|
| **Demo** | 176 cells increment independently at random speeds — no backend needed |
| **Live** | Polls a plain-text file (8 integers, one per line) from a Raspberry Pi every 250ms |

## Setup

```bash
npm install
npm run dev
```

For live mode, create a `.env` file:

```
VITE_DATA_URL=http://raspberrypi.local:8080/scores.txt
VITE_POLL_MS=250
```

Leave `VITE_DATA_URL` empty (or omit the `.env`) to run in demo mode.

## Backend format

The backend serves a plain text file with **8 integers, one per line** — one value per column:

```
1024
873
2201
456
1100
980
3042
712
```

Columns 1–4 → Red half · Columns 5–8 → Blue half

## Tech

- Vite 5 + React 18
- SVG 7-segment digits (`shapeRendering="crispEdges"`)
- No external UI dependencies
