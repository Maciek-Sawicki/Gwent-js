import type { GameEngine } from "@repo/game-engine";

export interface PlayerConnection {
  playerId: string;
  socketId?: string;
}

export interface GameSession {
  id: string;
  engine: GameEngine;
  connections: Record<string, PlayerConnection>;
}

export interface GameRepository {
  save(session: GameSession): void;
  findById(gameId: string): GameSession | undefined;
  delete(gameId: string): void;
}
