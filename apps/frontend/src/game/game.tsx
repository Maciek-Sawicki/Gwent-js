import { useMemo, useState, useEffect } from 'react'
import type { GameStateDto } from '@repo/shared'
import type { BoardRows, RowId, CardData } from './types'
import { Hand } from './hand'
import { Board } from './board'
import { connectSocket } from '../network/socket'
import { mapCardDtoToCardData } from './mappers'
import './Game.css'

const EMPTY_ROWS: BoardRows = {
  melee: [],
  ranged: [],
  siege: [],
}

interface GameScreenProps {
  gameId: string
  onLeaveGame?: () => void
}

export function GameScreen({ gameId, onLeaveGame }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameStateDto | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Połącz z grą przy montowaniu komponentu
  useEffect(() => {
    // Połącz socket dopiero gdy użytkownik dołącza do gry
    const gameSocket = connectSocket()

    // Jeśli socket już jest połączony, od razu dołącz do gry
    if (gameSocket.connected) {
      console.log('Socket already connected:', gameSocket.id)
      gameSocket.emit('join_game', { gameId })
    }

    gameSocket.on('connect', () => {
      console.log('Connected:', gameSocket.id)
      gameSocket.emit('join_game', { gameId })
    })

    // Odbierz informację o tym, który gracz to "my"
    gameSocket.on('you_are_player', ({ playerId: myPlayerId }: { playerId: string }) => {
      console.log('You are player:', myPlayerId)
      setPlayerId(myPlayerId)
    })

    gameSocket.on('state_update', (state: GameStateDto) => {
      console.log('State update received:', state)
      console.log('Current playerId:', playerId)
      console.log('Current player:', state.currentPlayer)
      console.log('Players:', state.players.map(p => ({ id: p.id, passed: p.passed })))
      
      setGameState(state)
    })

    gameSocket.on('error', (err: string) => {
      console.error('Socket error:', err)
      setError(err)
    })

    return () => {
      gameSocket.off('connect')
      gameSocket.off('you_are_player')
      gameSocket.off('state_update')
      gameSocket.off('error')
    }
  }, [gameId]) // Uruchamia się gdy zmienia się gameId

  // Mapowanie danych z backendu
  const myPlayer = useMemo(() => {
    if (!gameState || !playerId) return null
    return gameState.players.find(p => p.id === playerId) || gameState.players[0]
  }, [gameState, playerId])

  const opponentPlayer = useMemo(() => {
    if (!gameState || !playerId) return null
    return gameState.players.find(p => p.id !== playerId) || gameState.players[1]
  }, [gameState, playerId])

  const hand: CardData[] = useMemo(() => {
    if (!myPlayer) return []
    return myPlayer.hand.map(card => mapCardDtoToCardData(card))
  }, [myPlayer])

  const rows: BoardRows = useMemo(() => {
    if (!myPlayer) return EMPTY_ROWS
    return {
      melee: myPlayer.board.MELEE.map(card => mapCardDtoToCardData(card)),
      ranged: myPlayer.board.RANGED.map(card => mapCardDtoToCardData(card)),
      siege: myPlayer.board.SIEGE.map(card => mapCardDtoToCardData(card)),
    }
  }, [myPlayer])

  const opponentRows: BoardRows = useMemo(() => {
    if (!opponentPlayer) return EMPTY_ROWS
    return {
      melee: opponentPlayer.board.MELEE.map(card => mapCardDtoToCardData(card)),
      ranged: opponentPlayer.board.RANGED.map(card => mapCardDtoToCardData(card)),
      siege: opponentPlayer.board.SIEGE.map(card => mapCardDtoToCardData(card)),
    }
  }, [opponentPlayer])

  const selectedCard = useMemo(
    () => hand.find((c) => c.id === selectedCardId) ?? null,
    [hand, selectedCardId]
  )

  const isMyTurn = gameState?.currentPlayer === playerId
  const iPassed = myPlayer?.passed ?? false
  const opponentPassed = opponentPlayer?.passed ?? false

  // Debug info
  useEffect(() => {
    console.log('Game state debug:', {
      playerId,
      currentPlayer: gameState?.currentPlayer,
      isMyTurn,
      iPassed,
      myPlayer: myPlayer ? { id: myPlayer.id, passed: myPlayer.passed, handSize: myPlayer.hand.length } : null,
      opponentPlayer: opponentPlayer ? { id: opponentPlayer.id, passed: opponentPlayer.passed } : null,
    })
  }, [playerId, gameState?.currentPlayer, isMyTurn, iPassed, myPlayer, opponentPlayer])

  function handleSelectCard(id: string) {
    console.log('handleSelectCard:', { id, isMyTurn, iPassed, playerId, currentPlayer: gameState?.currentPlayer })
    if (!isMyTurn || iPassed) {
      console.log('Cannot select card - not my turn or passed')
      return
    }
    setSelectedCardId((prev) => (prev === id ? null : id))
  }

  function handleRowClick(row: RowId) {
    console.log('handleRowClick:', { row, selectedCard, isMyTurn, iPassed, myPlayer })
    
    // Sprawdź wszystkie warunki przed wysłaniem komendy
    if (!selectedCard) {
      console.log('Cannot place card - no card selected')
      return
    }
    
    if (!isMyTurn) {
      console.log('Cannot place card - not my turn')
      return
    }
    
    if (iPassed) {
      console.log('Cannot place card - already passed')
      return
    }
    
    if (!myPlayer || myPlayer.passed) {
      console.log('Cannot place card - player has passed')
      return
    }
    
    // Sprawdź czy karta nadal jest w ręce
    const cardInHand = myPlayer.hand.find(c => c.id === selectedCard.id)
    if (!cardInHand) {
      console.log('Cannot place card - card not in hand anymore')
      setSelectedCardId(null) // Wyczyść wybór jeśli karta już nie jest w ręce
      return
    }

    // Konwertuj RowId na Row z backendu
    const rowMapping: Record<RowId, 'MELEE' | 'RANGED' | 'SIEGE'> = {
      melee: 'MELEE',
      ranged: 'RANGED',
      siege: 'SIEGE',
    }

    console.log('Emitting play_card:', { cardId: selectedCard.id, row: rowMapping[row], isSpy: selectedCard.isSpy })
    const gameSocket = connectSocket()
    gameSocket.emit('play_card', {
      cardId: selectedCard.id,
      row: rowMapping[row],
    })

    setSelectedCardId(null)
  }

  function handlePass() {
    console.log('handlePass:', { isMyTurn, iPassed, playerId, currentPlayer: gameState?.currentPlayer })
    if (!isMyTurn || iPassed) {
      console.log('Cannot pass - not my turn or already passed')
      return
    }
    console.log('Emitting pass')
    const gameSocket = connectSocket()
    gameSocket.emit('pass')
  }

  const playerScore = myPlayer?.score ?? 0
  const opponentScore = opponentPlayer?.score ?? 0

  // Sprawdź czy gra czeka na drugiego gracza
  const isWaiting = gameState?.status === "WAITING"
  const playersCount = gameState?.players.length ?? 0

  if (!gameState || !myPlayer || isWaiting) {
    return (
      <div className="game-screen">
        <div className="loading-screen">
          <p>Łączenie z grą...</p>
          <p className="game-code-display">Kod gry: {gameId}</p>
          {isWaiting && (
            <div className="waiting-message">
              <p className="waiting-text">
                {playersCount === 1 
                  ? "Czekasz na drugiego gracza..." 
                  : "Oczekiwanie na rozpoczęcie gry..."}
              </p>
              <div className="waiting-spinner"></div>
            </div>
          )}
          {error && <p className="error-message">Błąd: {error}</p>}
          {onLeaveGame && (
            <button className="leave-button" onClick={onLeaveGame}>
              Opuść grę
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen">
      <div className="game-main">
        <div className="game-header">
          <div className="score-section">
            <div className="game-code-header">Kod gry: {gameId}</div>
            <h2 className="player-score">Twoje punkty: {playerScore}</h2>
            <h2 className="opponent-score">Przeciwnik: {opponentScore}</h2>
            <div className="round-info">Runda: {gameState.round}</div>
            <div className="rounds-won">
              Wygrałeś: {myPlayer.roundsWon || 0} | Przeciwnik: {opponentPlayer?.roundsWon || 0}
            </div>
          </div>
          
          <div className="turn-status">
            {isMyTurn && !iPassed ? (
              <div className="turn-indicator your-turn">Twoja tura</div>
            ) : iPassed ? (
              <div className="turn-indicator passed">Spasowałeś</div>
            ) : (
              <div className="turn-indicator opponent-turn">Tura przeciwnika</div>
            )}
            {opponentPassed && !iPassed && (
              <div className="opponent-passed">Przeciwnik spasował</div>
            )}
          </div>

          <button 
            className={`pass-button ${!isMyTurn || iPassed ? 'disabled' : ''}`}
            onClick={handlePass}
            disabled={!isMyTurn || iPassed}
          >
            {iPassed ? 'SPASOWAŁEŚ' : 'PASUJ'}
          </button>
        </div>

        {/* Jedna plansza z dwoma połowami */}
        <div className="board-section">
          <div className="opponent-label">Przeciwnik {opponentPassed && '(Spasował)'}</div>
          <Board
            opponentRows={opponentRows}
            playerRows={rows}
            canPlaceCard={Boolean(selectedCard) && isMyTurn && !iPassed && !selectedCard?.isSpy}
            selectedCardRows={selectedCard?.rows ?? []}
            onRowClick={handleRowClick}
            selectedCardIsSpy={selectedCard?.isSpy ?? false}
          />
          <div className="player-label">Ty {iPassed && '(Spasowałeś)'}</div>
        </div>

        <Hand
          cards={hand}
          selectedCardId={selectedCardId}
          onSelectCard={handleSelectCard}
          disabled={!isMyTurn || iPassed}
        />

      </div>

      <aside className="preview-panel">
        {selectedCard ? (
          <>
            <p className="preview-title">Wybrana karta</p>

            <img
              src={selectedCard.handSrc || selectedCard.src} // W podglądzie pokazuj kartę z ręki
              alt={selectedCard.id}
              className="preview-card"
            />

            <p><strong>Moc:</strong> {selectedCard.power ?? 0}</p>
            <p><strong>Rzędy:</strong> {
              selectedCard.rows.map(row => 
                row === 'melee' ? 'WALKA WRĘCZ' : 
                row === 'ranged' ? 'DALECKI ZASIĘG' : 
                'OBLEŻENIE'
              ).join(', ')
            }</p>
          </>
        ) : (
          <p className="preview-empty">
            {isMyTurn && !iPassed 
              ? 'Kliknij kartę w ręce, następnie kliknij odpowiedni rząd na planszy.'
              : iPassed
                ? 'Spasowałeś. Czekasz na przeciwnika.'
                : 'Czekasz na swoją turę.'}
          </p>
        )}
      </aside>
    </div>
  )
}