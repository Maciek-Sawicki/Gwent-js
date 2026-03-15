export type RowId = 'melee' | 'ranged' | 'siege'

export type CardData = {
  id: string
  src: string
  row: RowId
  power: number
}

export type BoardRows = Record<RowId, CardData[]>