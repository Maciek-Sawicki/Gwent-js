import { useState } from 'react'
import './App.css'
import { HomePage } from './HomePage'
import { GameScreen } from '../game/game'
import { disconnectSocket } from '../network/socket'

function App() {
  const [gameId, setGameId] = useState<string | null>(null)

  function handleJoinGame(newGameId: string) {
    setGameId(newGameId)
  }

  function handleLeaveGame() {
    disconnectSocket()
    setGameId(null)
  }

  if (!gameId) {
    return (
      <main className="app">
        <HomePage onJoinGame={handleJoinGame} />
      </main>
    )
  }

  return (
    <main className="app">
      <GameScreen gameId={gameId} onLeaveGame={handleLeaveGame} />
    </main>
  )
}

export default App
