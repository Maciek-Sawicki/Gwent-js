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
        <div key={card.id} className="hand-card-wrapper">
          <img
            src={card.handSrc || card.src} // Użyj handSrc jeśli dostępny, w przeciwnym razie src
            alt={card.id}
            className={`hand-card ${selectedCardId === card.id ? 'is-selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onSelectCard(card.id)}
            draggable={false}
          />
          <div className="card-power-badge hand-power-badge">
            {card.power ?? 0}
          </div>
        </div>
      ))}
    </section>
  )
}