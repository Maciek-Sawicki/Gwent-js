import type { CardDto } from '@repo/shared'
import type { CardData, RowId } from './types'

/**
 * Konwertuje Row z backendu (MELEE/RANGED/SIEGE) na RowId frontendu (melee/ranged/siege)
 */
function backendRowToFrontendRow(backendRow: string): RowId {
  const mapping: Record<string, RowId> = {
    'MELEE': 'melee',
    'RANGED': 'ranged',
    'SIEGE': 'siege',
  }
  return mapping[backendRow] ?? 'melee'
}

/**
 * Mapuje CardDto z backendu na CardData używany w frontendzie
 * Dla kart w ręce: używa allowedRows
 * Dla kart na planszy: używa row (karta już jest na planszy)
 */
// Lista ID kart Spy
const SPY_CARD_IDS = ['prince_stennis', 'sigismund_dijkstra', 'thaler']

export function mapCardDtoToCardData(cardDto: CardDto, imageSrc?: string): CardData {
  // Jeśli karta jest na planszy (ma row), użyj tego rzędu
  // Jeśli karta jest w ręce (brak row), użyj allowedRows
  const rows: RowId[] = cardDto.allowedRows 
    ? cardDto.allowedRows.map(backendRowToFrontendRow)
    : cardDto.row 
      ? [backendRowToFrontendRow(cardDto.row)]
      : ['melee'] // Domyślnie melee jeśli brak informacji

  // Sprawdź czy to karta Spy
  const isSpy = cardDto.definitionId ? SPY_CARD_IDS.includes(cardDto.definitionId) : false

  return {
    id: cardDto.id,
    src: imageSrc || cardDto.image || '', // Obrazek dla planszy
    handSrc: cardDto.handImage || imageSrc || cardDto.image || '', // Obrazek dla ręki (z paskami)
    rows,
    power: cardDto.power,
    definitionId: cardDto.definitionId,
    isSpy,
  }
}
