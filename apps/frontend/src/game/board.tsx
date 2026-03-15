import './Board.css'
import type { BoardRows, RowId } from './types'
import boardImg from '../assets/board/board.jpeg'

function RowZone({
  rowId,
  cards,
  className,
  canPlaceCard,
  onRowClick,
  isOpponent = false,
}: {
  rowId: RowId
  cards: BoardRows[RowId]
  className: string
  canPlaceCard: boolean
  onRowClick: (row: RowId) => void
  isOpponent?: boolean
}) {
  const rowScore = cards.reduce((sum, card) => sum + (card.power ?? 0), 0)

  return (
    <div
      className={`row-zone ${isOpponent ? 'opponent-row' : 'player-row'} ${className} ${canPlaceCard ? 'is-placeable' : ''}`}
      onClick={() => {
        if (canPlaceCard && !isOpponent) {
          onRowClick(rowId)
        }
      }}
    >
      <div className="row-score">{rowScore}</div>

      <div className="row-cards">
        {cards.map((card) => (
          <img
            key={card.id}
            src={card.src}
            alt={card.id}
            className="row-card"
          />
        ))}
      </div>
    </div>
  )
}

export function Board({
  opponentRows,
  playerRows,
  canPlaceCard,
  selectedCardRows,
  onRowClick,
}: {
  opponentRows: BoardRows
  playerRows: BoardRows
  canPlaceCard: boolean
  selectedCardRows: RowId[]
  onRowClick: (row: RowId) => void
}) {
  return (
    <section
      className="board"
      style={{ backgroundImage: `url(${boardImg})` }}
    >
      {/* Górna połowa - przeciwnik */}
      <div className="enemy-half">
        <RowZone
          rowId="siege"
          cards={opponentRows.siege}
          className="row-1"
          canPlaceCard={false}
          onRowClick={() => {}}
          isOpponent={true}
        />

        <RowZone
          rowId="ranged"
          cards={opponentRows.ranged}
          className="row-2"
          canPlaceCard={false}
          onRowClick={() => {}}
          isOpponent={true}
        />

        <RowZone
          rowId="melee"
          cards={opponentRows.melee}
          className="row-3"
          canPlaceCard={false}
          onRowClick={() => {}}
          isOpponent={true}
        />
      </div>

      {/* Dolna połowa - gracz */}
      <div className="player-half">
        <RowZone
          rowId="melee"
          cards={playerRows.melee}
          className="row-1"
          canPlaceCard={canPlaceCard && selectedCardRows.includes('melee')}
          onRowClick={onRowClick}
          isOpponent={false}
        />

        <RowZone
          rowId="ranged"
          cards={playerRows.ranged}
          className="row-2"
          canPlaceCard={canPlaceCard && selectedCardRows.includes('ranged')}
          onRowClick={onRowClick}
          isOpponent={false}
        />

        <RowZone
          rowId="siege"
          cards={playerRows.siege}
          className="row-3"
          canPlaceCard={canPlaceCard && selectedCardRows.includes('siege')}
          onRowClick={onRowClick}
          isOpponent={false}
        />
      </div>
    </section>
  )
}