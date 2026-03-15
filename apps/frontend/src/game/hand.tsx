import type { CardData } from './types'
import './Hand.css'

export function Hand({
  cards,
  selectedCardId,
  onSelectCard,
  disabled = false,
}: {
  cards: CardData[]
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  disabled?: boolean
}) {
  return (
    <section className={`hand ${disabled ? 'disabled' : ''}`}>
      {cards.map((card) => (
        <img
          key={card.id}
          src={card.src}
          alt={card.id}
          className={`hand-card ${selectedCardId === card.id ? 'is-selected' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && onSelectCard(card.id)}
          draggable={false}
        />
      ))}
    </section>
  )
}