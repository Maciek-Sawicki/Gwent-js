import { useMemo, useState } from 'react'
import { INITIAL_HAND } from './cards'
import type { BoardRows, RowId, CardData } from './types'
import { Hand } from './hand'
import { Board } from './board'
import './Game.css'

const EMPTY_ROWS: BoardRows = {
  melee: [],
  ranged: [],
  siege: [],
}

export function GameScreen() {
  const [hand, setHand] = useState(INITIAL_HAND)
  const [rows, setRows] = useState<BoardRows>(EMPTY_ROWS)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const selectedCard = useMemo(
    () => hand.find((c) => c.id === selectedCardId) ?? null,
    [hand, selectedCardId]
  )

  function handleSelectCard(id: string) {
    setSelectedCardId((prev) => (prev === id ? null : id))
  }

  function handleRowClick(row: RowId) {
    if (!selectedCard) return

    const card = selectedCard

    setHand((prev) => prev.filter((c) => c.id !== card.id))

    setRows((prev) => ({
      ...prev,
      [row]: [...prev[row], card],
    }))

    setSelectedCardId(null)
  }

  const playerScore =
    rows.melee.reduce((s, c) => s + (c.power ?? 0), 0) +
    rows.ranged.reduce((s, c) => s + (c.power ?? 0), 0) +
    rows.siege.reduce((s, c) => s + (c.power ?? 0), 0)

  return (
    <div className="game-screen">
      <div className="game-main">

        <h2 className="player-score">Player score: {playerScore}</h2>

        <Board
          rows={rows}
          canPlaceCard={Boolean(selectedCard)}
          selectedCardRow={selectedCard?.row ?? null}
          onRowClick={handleRowClick}
        />

        <Hand
          cards={hand}
          selectedCardId={selectedCardId}
          onSelectCard={handleSelectCard}
        />

      </div>

      <aside className="preview-panel">
        {selectedCard ? (
          <>
            <p className="preview-title">Wybrana karta</p>

            <img
              src={selectedCard.src}
              alt={selectedCard.id}
              className="preview-card"
            />

            <p>Moc karty: {selectedCard.power ?? 0}</p>
            <p>Rząd: {selectedCard.row.toUpperCase()}</p>
          </>
        ) : (
          <p className="preview-empty">
            Kliknij kartę w ręce, potem kliknij rząd.
          </p>
        )}
      </aside>
    </div>
  )
}