import { GameEngine } from "@repo/game-engine/core/GameEngine";
import { GameState } from "@repo/game-engine/core/GameState";

export class GameManager {
  private games = new Map<string, GameEngine>();

  createGame(gameId: string, initialState: GameState) {
    const engine = new GameEngine(initialState);
    this.games.set(gameId, engine);
    return engine;
  }

  getGame(gameId: string) {
    return this.games.get(gameId);
  }

  removeGame(gameId: string) {
    this.games.delete(gameId);
  }
}

export const gameManager = new GameManager();