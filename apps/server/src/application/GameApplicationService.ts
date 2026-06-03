import {
  createInitialGameState,
  DeckMode,
  GameEngine,
  type GameState,
} from "@repo/game-engine";
import type { GameCommand } from "@repo/shared/commands/GameCommand";
import type { Row } from "@repo/shared/types/Row";

import type {
  GameRepository,
  GameSession,
  PlayerConnection,
} from "./ports/GameRepository";

type PlayerSlot = "p1" | "p2";

export interface JoinGameResult {
  playerId: PlayerSlot;
  session: GameSession;
}

export class GameApplicationService {
  constructor(
    private readonly games: GameRepository,
    private readonly deckMode: DeckMode,
  ) {}

  joinGame(gameId: string, socketId: string): JoinGameResult {
    const session = this.getOrCreateSession(gameId);
    const playerId = this.assignPlayer(session, socketId);

    if (this.canStart(session)) {
      session.engine.startGame();
    }

    this.games.save(session);
    return { playerId, session };
  }

  playCard(gameId: string, playerId: string, cardId: string, row: Row): GameSession | undefined {
    return this.dispatch(gameId, { type: "PLAY_CARD", playerId, cardId, row });
  }

  pass(gameId: string, playerId: string): GameSession | undefined {
    return this.dispatch(gameId, { type: "PASS", playerId });
  }

  mulliganCard(gameId: string, playerId: string, cardId: string): GameSession | undefined {
    const session = this.games.findById(gameId);
    if (!session) return undefined;

    session.engine.mulliganCard(playerId, cardId);
    this.games.save(session);
    return session;
  }

  disconnect(gameId: string | undefined, socketId: string): GameSession | undefined {
    if (!gameId) return undefined;

    const session = this.games.findById(gameId);
    if (!session) return undefined;

    for (const connection of Object.values(session.connections)) {
      if (connection.socketId === socketId) {
        connection.socketId = undefined;
      }
    }

    if (Object.values(session.connections).every(connection => !connection.socketId)) {
      this.games.delete(gameId);
      return undefined;
    }

    this.games.save(session);
    return session;
  }

  findGame(gameId: string): GameSession | undefined {
    return this.games.findById(gameId);
  }

  ensurePlayerTurn(gameId: string, playerId: string): void {
    const state = this.getState(gameId);
    if (!state) return;

    if (state.currentPlayer !== playerId) {
      throw new Error("Not your turn");
    }
  }

  private dispatch(gameId: string, command: GameCommand): GameSession | undefined {
    const session = this.games.findById(gameId);
    if (!session) return undefined;

    session.engine.dispatch(command);
    this.games.save(session);
    return session;
  }

  private getState(gameId: string): GameState | undefined {
    return this.games.findById(gameId)?.engine.getState();
  }

  private getOrCreateSession(gameId: string): GameSession {
    const existing = this.games.findById(gameId);
    if (existing) return existing;

    const engine = new GameEngine(createInitialGameState());
    engine.initializeDecks(this.deckMode);

    return {
      id: gameId,
      engine,
      connections: {
        p1: { playerId: "p1" },
        p2: { playerId: "p2" },
      },
    };
  }

  private assignPlayer(session: GameSession, socketId: string): PlayerSlot {
    const sameSocket = this.findConnection(session, connection => connection.socketId === socketId);
    if (sameSocket) return sameSocket.playerId as PlayerSlot;

    const emptySlot = this.findConnection(session, connection => !connection.socketId);
    if (!emptySlot) {
      throw new Error("Game is full");
    }

    emptySlot.socketId = socketId;
    return emptySlot.playerId as PlayerSlot;
  }

  private canStart(session: GameSession): boolean {
    const state = session.engine.getState();
    const allPlayersConnected = Object.values(session.connections).every(connection => connection.socketId);

    return state.status === "WAITING" && allPlayersConnected;
  }

  private findConnection(
    session: GameSession,
    predicate: (connection: PlayerConnection) => boolean,
  ): PlayerConnection | undefined {
    return Object.values(session.connections).find(predicate);
  }
}
