import { useMemo } from 'react'

type ItemType = 'logo' | 'ball' | 'shisha' | 'coffee'

interface Item {
  type: ItemType
  size: number
  x: number
  y: number
  rotation: number
}

const FILTERS: Record<ItemType, string> = {
  logo: 'grayscale(100%) brightness(0.4)',
  ball: 'none',
  shisha: 'grayscale(100%) brightness(0.4)',
  coffee: 'grayscale(100%) brightness(0.4)',
}

const OPACITY: Record<ItemType, number> = {
  logo: 0.08,
  ball: 0.15,
  shisha: 0.1,
  coffee: 0.1,
}

const SRC: Record<ItemType, string> = {
  logo: '/oliva-logo.png',
  // SVG data URIs for decorative background icons (no local file needed)
  ball: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23fff' stroke='%23ccc' stroke-width='2'/><path d='M50 2 Q70 25 70 50 Q70 75 50 98' fill='none' stroke='%23999' stroke-width='3'/><path d='M50 2 Q30 25 30 50 Q30 75 50 98' fill='none' stroke='%23999' stroke-width='3'/></svg>`,
  shisha: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'><ellipse cx='50' cy='40' rx='22' ry='28' fill='none' stroke='%23fff' stroke-width='4'/><rect x='46' y='2' width='8' height='14' rx='4' fill='%23fff'/><rect x='44' y='66' width='12' height='30' rx='3' fill='%23fff'/><ellipse cx='50' cy='96' rx='20' ry='8' fill='%23fff'/><line x1='20' y1='50' x2='2' y2='80' stroke='%23fff' stroke-width='3' stroke-linecap='round'/></svg>`,
  coffee: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M15 35 L20 85 Q20 90 50 90 Q80 90 80 85 L85 35 Z' fill='none' stroke='%23fff' stroke-width='4'/><rect x='15' y='28' width='70' height='10' rx='3' fill='%23fff'/><path d='M80 45 Q100 45 100 55 Q100 65 80 65' fill='none' stroke='%23fff' stroke-width='4'/><path d='M38 10 Q42 5 38 0' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round'/><path d='M52 10 Q56 5 52 0' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round'/></svg>`,
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const COLS = 4
const ROWS = 4

export default function Background() {
  const items = useMemo<Item[]>(() => {
    const rand = mulberry32(7)
    const cellW = 100 / COLS
    const cellH = 100 / ROWS

    const pool: ItemType[] = [
      ...Array(4).fill('logo'),
      ...Array(5).fill('ball'),
      ...Array(3).fill('shisha'),
      ...Array(3).fill('coffee'),
    ] as ItemType[]

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }

    const cellIndices: number[] = []
    for (let i = 0; i < COLS * ROWS; i++) cellIndices.push(i)
    const skipCell = Math.floor(rand() * cellIndices.length)
    cellIndices.splice(skipCell, 1)

    const result: Item[] = []
    for (let i = 0; i < pool.length; i++) {
      const type = pool[i]
      const cell = cellIndices[i]
      const col = cell % COLS
      const row = Math.floor(cell / COLS)

      const offsetX = 0.2 + rand() * 0.6
      const offsetY = 0.2 + rand() * 0.6

      let size: number
      if (type === 'logo') size = 28 + rand() * 26
      else if (type === 'ball') size = 24 + rand() * 28
      else size = 30 + rand() * 26

      result.push({
        type,
        size,
        x: col * cellW + cellW * offsetX,
        y: row * cellH + cellH * offsetY,
        rotation: type === 'ball'
          ? rand() * 360
          : (rand() - 0.5) * 50,
      })
    }

    return result
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {items.map((item, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${item.x}%`,
          top: `${item.y}%`,
          transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
          opacity: OPACITY[item.type],
          filter: FILTERS[item.type],
        }}>
          <img
            src={SRC[item.type]}
            alt=""
            style={{ width: item.size, height: item.size, objectFit: 'contain' }}
          />
        </div>
      ))}
    </div>
  )
}
