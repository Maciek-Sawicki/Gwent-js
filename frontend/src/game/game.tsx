import { useMemo, useState } from 'react'
import { INITIAL_HAND } from './cards'
import type { BoardRows, RowId } from './types'
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
    [hand, selectedCardId],
  )

  function handleSelectCard(id: string) {
    setSelectedCardId((prev) => (prev === id ? null : id))
  }

  function handleRowClick(row: RowId) {
    if (!selectedCard) return

    setHand((prev) => prev.filter((c) => c.id !== selectedCard.id))
    setRows((prev) => ({
      ...prev,
      [row]: [...prev[row], selectedCard],
    }))
    setSelectedCardId(null)
  }

  return (
    <div className="game-screen">
      <div className="game-main">
        <Board rows={rows} canPlaceCard={Boolean(selectedCard)} onRowClick={handleRowClick} />
        <Hand cards={hand} selectedCardId={selectedCardId} onSelectCard={handleSelectCard} />
      </div>

      <aside className="preview-panel">
        {selectedCard ? (
          <>
            <p className="preview-title">Wybrana karta</p>
            <img src={selectedCard.src} alt={selectedCard.id} className="preview-card" />
          </>
        ) : (
          <p className="preview-empty">Kliknij kartę w ręce, potem kliknij rząd.</p>
        )}
      </aside>
    </div>
  )
}