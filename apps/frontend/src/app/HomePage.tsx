import React from "react";
import { useState } from 'react'
import './HomePage.css'

interface HomePageProps {
  onJoinGame: (gameId: string) => void
}

export function HomePage({ onJoinGame }: HomePageProps) {
  const [gameCode, setGameCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function generateGameCode(): string {
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
        <h1 className="home-title" data-testid="home-title">
          GWINT
        </h1>
        <p className="home-subtitle" data-testid="home-subtitle">
          Wiedźmińska gra karciana
        </p>

        <div className="home-actions">
          <button
            type="button"
            className="home-button create-button"
            data-testid="home-create-game"
            onClick={handleCreateGame}
          >
            Utwórz grę
          </button>

          <div className="divider">
            <span>lub</span>
          </div>

          <div className="join-section">
            <input
              type="text"
              className="game-code-input"
              data-testid="home-game-code-input"
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
            {error && (
              <div className="error-message" data-testid="home-join-error">
                {error}
              </div>
            )}
            <button
              type="button"
              className="home-button join-button"
              data-testid="home-join-game"
              onClick={handleJoinGame}
            >
              Dołącz do gry
            </button>
          </div>
        </div>

        <div className="home-info" data-testid="home-info">
          <p>• Utwórz grę, aby otrzymać unikalny kod</p>
          <p>• Podaj kod drugiemu graczowi, aby dołączył</p>
          <p>• Gra rozpocznie się automatycznie gdy dołączą 2 graczy</p>
        </div>
      </div>
    </div>
  )
}
