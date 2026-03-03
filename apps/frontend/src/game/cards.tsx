import type { CardData } from './types'

import c11 from '../assets/cards/card_1_1.png'
import c12 from '../assets/cards/card_1_2.png'
import c13 from '../assets/cards/card_1_3.png'
import c14 from '../assets/cards/card_1_4.png'
import c21 from '../assets/cards/card_2_1.png'
import c22 from '../assets/cards/card_2_2.png'

export const INITIAL_HAND: CardData[] = [
  { id: 'c11', src: c11, row: 'ranged' },
  { id: 'c12', src: c12, row: 'melee' },
  { id: 'c13', src: c13, row: 'melee' },
  { id: 'c14', src: c14, row: 'melee' },
  { id: 'c21', src: c21, row: 'melee' },
  { id: 'c22', src: c22, row: 'ranged' },
]