import { useState } from 'react'
import './HomePage.css'

interface HomePageProps {
  onJoinGame: (gameId: string) => void
}

export function HomePage({ onJoinGame }: HomePageProps) {
  const [gameCode, setGameCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function generateGameCode(): string {
    // Generuj losowy 6-cyfrowy kod
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  function handleCreateGame() {
    const newGameCode = generateGameCode()
    onJoinGame(newGameCode)
  }

  function handleJoinGame() {
    const code = gameCode.trim()
    if (!code) {
      setError('Wprowadź kod gry')
      return
    }
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Kod musi składać się z 6 cyfr')
      return
    }
    setError(null)
    onJoinGame(code)
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="home-title">GWINT</h1>
        <p className="home-subtitle">Wiedźmińska gra karciana</p>

        <div className="home-actions">
          <button className="home-button create-button" onClick={handleCreateGame}>
            Utwórz grę
          </button>

          <div className="divider">
            <span>lub</span>
          </div>

          <div className="join-section">
            <input
              type="text"
              className="game-code-input"
              placeholder="Wprowadź kod gry (6 cyfr)"
              value={gameCode}
              onChange={(e) => {
                setGameCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                setError(null)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleJoinGame()
                }
              }}
              maxLength={6}
            />
            {error && <div className="error-message">{error}</div>}
            <button className="home-button join-button" onClick={handleJoinGame}>
              Dołącz do gry
            </button>
          </div>
        </div>

        <div className="home-info">
          <p>• Utwórz grę, aby otrzymać unikalny kod</p>
          <p>• Podaj kod drugiemu graczowi, aby dołączył</p>
          <p>• Gra rozpocznie się automatycznie gdy dołączą 2 graczy</p>
        </div>
      </div>
    </div>
  )
}
