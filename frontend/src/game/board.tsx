import './Board.css'
import type { BoardRows, RowId } from './types'
import boardImg from '../assets/board/board.jpeg'

function RowZone({
  rowId,
  cards,
  className,
  canPlaceCard,
  onRowClick,
}: {
  rowId: RowId
  cards: BoardRows[RowId]
  className: string
  canPlaceCard: boolean
  onRowClick: (row: RowId) => void
}) {
  return (
    <div
      className={`player-row ${className} ${canPlaceCard ? 'is-placeable' : ''}`}
      onClick={() => onRowClick(rowId)}
    >
      <div className="row-cards">
        {cards.map((card) => (
          <img key={card.id} src={card.src} alt={card.id} className="row-card" />
        ))}
      </div>
    </div>
  )
}

export function Board({
  rows,
  canPlaceCard,
  onRowClick,
}: {
  rows: BoardRows
  canPlaceCard: boolean
  onRowClick: (row: RowId) => void
}) {
  return (
    <section className="board" style={{ backgroundImage: `url(${boardImg})` }}>
      <div className="enemy-half" />

      <div className="player-half">
        <RowZone
          rowId="melee"
          cards={rows.melee}
          className="row-1"
          canPlaceCard={canPlaceCard}
          onRowClick={onRowClick}
        />
        <RowZone
          rowId="ranged"
          cards={rows.ranged}
          className="row-2"
          canPlaceCard={canPlaceCard}
          onRowClick={onRowClick}
        />
        <RowZone
          rowId="siege"
          cards={rows.siege}
          className="row-3"
          canPlaceCard={canPlaceCard}
          onRowClick={onRowClick}
        />
      </div>
    </section>
  )
}