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
  ball: '/padel-ball.png',
  shisha: '/shisha.png',
  coffee: '/coffee-cup.png',
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
