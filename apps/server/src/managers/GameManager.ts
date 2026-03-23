import { GameEngine, type GameState } from "@repo/game-engine";

export class GameManager {
  private games = new Map<string, GameEngine>();
  private gameSockets = new Map<string, Set<string>>();

  createGame(gameId: string, initialState: GameState) {
    const engine = new GameEngine(initialState);
    this.games.set(gameId, engine);
    this.gameSockets.set(gameId, new Set());
    return engine;
  }

  getGame(gameId: string) {
    return this.games.get(gameId);
  }

  addSocket(gameId: string, socketId: string) {
    const set = this.gameSockets.get(gameId);
    if (set) {
      set.add(socketId);
    }
  }

  removeSocket(gameId: string, socketId: string) {
    const set = this.gameSockets.get(gameId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) {
      console.log(`All players disconnected. Removing game: ${gameId}`);
      this.removeGame(gameId);
      this.gameSockets.delete(gameId);
    }
  }

  removeGame(gameId: string) {
    this.games.delete(gameId);
  }
}

export const gameManager = new GameManager();