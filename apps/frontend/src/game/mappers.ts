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
export function mapCardDtoToCardData(cardDto: CardDto, imageSrc?: string): CardData {
  // Jeśli karta jest na planszy (ma row), użyj tego rzędu
  // Jeśli karta jest w ręce (brak row), użyj allowedRows
  const rows: RowId[] = cardDto.allowedRows 
    ? cardDto.allowedRows.map(backendRowToFrontendRow)
    : cardDto.row 
      ? [backendRowToFrontendRow(cardDto.row)]
      : ['melee'] // Domyślnie melee jeśli brak informacji

  return {
    id: cardDto.id,
    src: imageSrc || cardDto.image || '',
    rows,
    power: cardDto.power,
  }
}
