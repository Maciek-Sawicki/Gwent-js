export type RowId = 'melee' | 'ranged' | 'siege'

export type CardData = {
  id: string
  src: string
  row: RowId
}

export type BoardRows = Record<RowId, CardData[]>