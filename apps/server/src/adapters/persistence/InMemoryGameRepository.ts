import type { GameRepository, GameSession } from "../../application/ports/GameRepository";

export class InMemoryGameRepository implements GameRepository {
  private readonly sessions = new Map<string, GameSession>();

  save(session: GameSession): void {
    this.sessions.set(session.id, session);
  }

  findById(gameId: string): GameSession | undefined {
    return this.sessions.get(gameId);
  }

  delete(gameId: string): void {
    this.sessions.delete(gameId);
  }
}
