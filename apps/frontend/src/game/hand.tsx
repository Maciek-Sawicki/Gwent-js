import type { CardData } from './types'
import './Hand.css'

export function Hand({
  cards,
  selectedCardId,
  onSelectCard,
}: {
  cards: CardData[]
  selectedCardId: string | null
  onSelectCard: (id: string) => void
}) {
  return (
    <section className="hand">
      {cards.map((card) => (
        <img
          key={card.id}
          src={card.src}
          alt={card.id}
          className={`hand-card ${selectedCardId === card.id ? 'is-selected' : ''}`}
          onClick={() => onSelectCard(card.id)}
          draggable={false}
        />
      ))}
    </section>
  )
}