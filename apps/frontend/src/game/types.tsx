export type RowId = 'melee' | 'ranged' | 'siege'

export type CardData = {
  id: string
  src: string
  rows: RowId[] // Karta może być położona na wiele rzędów
  power: number
}

export type BoardRows = Record<RowId, CardData[]>