import type { CardData } from './types'

import c11 from '../assets/cards/card_1_1.png'
import c12 from '../assets/cards/card_1_2.png'
import c13 from '../assets/cards/card_1_3.png'
import c14 from '../assets/cards/card_1_4.png'
import c21 from '../assets/cards/card_2_1.png'
import c22 from '../assets/cards/card_2_2.png'

export const INITIAL_HAND: CardData[] = [
  { id: 'c11', src: c11, rows: ['ranged'], power: 4 },
  { id: 'c12', src: c12, rows: ['melee'], power: 3 },
  { id: 'c13', src: c13, rows: ['melee'], power: 3 },
  { id: 'c14', src: c14, rows: ['melee'], power: 3 },
  { id: 'c21', src: c21, rows: ['melee', 'ranged'], power: 3 }, // Przykład karty z dwoma rzędami
  { id: 'c22', src: c22, rows: ['ranged'], power: 2 },
]