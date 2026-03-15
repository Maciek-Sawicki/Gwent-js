export type RowId = 'melee' | 'ranged' | 'siege'

export type CardData = {
  id: string
  src: string // Obrazek dla planszy (bez pasków)
  handSrc?: string // Obrazek dla ręki (z paskami) - jeśli brak, użyj src
  rows: RowId[] // Karta może być położona na wiele rzędów
  power: number
  definitionId?: string // ID definicji karty (do sprawdzania efektów)
  isSpy?: boolean // Czy to karta Spy (kładzie się u przeciwnika)
}

export type BoardRows = Record<RowId, CardData[]>