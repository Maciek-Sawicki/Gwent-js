import express from "express";
import http from "http";
import { Server } from "socket.io";

import { resolveDeckModeFromEnv } from "./adapters/config/DeckModeFromEnv";
import { InMemoryGameRepository } from "./adapters/persistence/InMemoryGameRepository";
import { GameApplicationService } from "./application/GameApplicationService";
import { mapToDto } from "./mappers/GameMapper";

import { CardRegistrySetup } from "@repo/game-engine";

CardRegistrySetup();

const app = express();
const server = http.createServer(app);
const gameService = new GameApplicationService(
  new InMemoryGameRepository(),
  resolveDeckModeFromEnv(process.env),
);

const io = new Server(server, {
  cors: { origin: "*" },
});

function broadcastState(gameId: string) {
  const session = gameService.findGame(gameId);
  if (!session) return;

  let dto = mapToDto(session.engine.getState(), session.connections);
  if (!Array.isArray(dto.players)) {
    dto.players = Object.values(dto.players);
  }

  io.to(gameId).emit("state_update", dto);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  function requireTurn(callback: () => void) {
    const gameId = socket.data.gameId;
    const playerId = socket.data.playerId;
    if (!gameId || !playerId) return;

    try {
      gameService.ensurePlayerTurn(gameId, playerId);
    } catch (error) {
      socket.emit("error", getErrorMessage(error));
      return;
    }

    callback();
  }

  socket.on("join_game", ({ gameId }) => {
    try {
      const result = gameService.joinGame(gameId, socket.id);
      const { playerId } = result;

      socket.data.playerId = playerId;
      socket.data.gameId = gameId;

      socket.join(gameId);

      socket.emit("you_are_player", { playerId });

      broadcastState(gameId);
    } catch (error) {
      socket.emit("error", getErrorMessage(error));
    }
  });

  socket.on("play_card", ({ cardId, row }) => {
    requireTurn(() => {
      const gameId = socket.data.gameId;
      const playerId = socket.data.playerId;
      if (!gameId || !playerId) return;

      try {
        gameService.playCard(gameId, playerId, cardId, row);
        broadcastState(gameId);
      } catch (err) {
        socket.emit("error", getErrorMessage(err));
      }
    })
  });

  socket.on("pass", () => {
    requireTurn(() => {
      const gameId = socket.data.gameId;
      const playerId = socket.data.playerId;
      if (!gameId || !playerId) return;

      gameService.pass(gameId, playerId);
      broadcastState(gameId);
    })
  });

  socket.on("mulligan_card", ({ cardId }) => {
    requireTurn(() => {
      const gameId = socket.data.gameId;
      const playerId = socket.data.playerId;
      if (!gameId || !playerId) return;

      try {
        gameService.mulliganCard(gameId, playerId, cardId);
        broadcastState(gameId);
      } catch (err) {
        socket.emit("error", getErrorMessage(err));
      }
    })
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
    const { gameId } = socket.data;
    const session = gameService.disconnect(gameId, socket.id);

    if (gameId && session) {
      broadcastState(gameId);
    }
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});