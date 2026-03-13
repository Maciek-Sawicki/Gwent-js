import express from "express";
import http from "http";
import { Server } from "socket.io";

import { gameManager } from "./managers/GameManager";
import { mapToDto } from "./mappers/GameMapper";

import { GameState } from "@repo/game-engine";
import { CardRegistrySetup } from "@repo/game-engine/cards/CardRegistrySetup";

CardRegistrySetup();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

function createInitialState(): GameState {
  return {
    round: 1,
    status: "IN_PROGRESS",
    currentPlayer: "p1",
    players: {
      p1: {
        id: "p1",
        deck: [],
        hand: [],
        board: { MELEE: [], RANGED: [], SIEGE: [] },
        passed: false,
        roundsWon: 0,
        faction: "NORTHERN_REALMS",
        graveyard: [],
        mulligansUsed: 0,
      },
      p2: {
        id: "p2",
        deck: [],
        hand: [],
        board: { MELEE: [], RANGED: [], SIEGE: [] },
        passed: false,
        roundsWon: 0,
        faction: "NORTHERN_REALMS",
        graveyard: [],
        mulligansUsed: 0,
      },
    },
  };
}

function broadcastState(gameId: string) {
  const engine = gameManager.getGame(gameId);
  if (!engine) return;

  let dto = mapToDto(engine.getState());
  // Konwertujemy players do tablicy, jeśli jest obiektem
  if (!Array.isArray(dto.players)) {
    dto.players = Object.values(dto.players);
  }
  console.log("Broadcasting state DTO:", JSON.stringify(dto, null, 2));

  io.to(gameId).emit("state_update", dto);
}


app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.on("join_game", ({ gameId, playerId }) => {
    let engine = gameManager.getGame(gameId);

    if (!engine) {
      console.log("Creating game:", gameId);

      const initialState = createInitialState();

      engine = gameManager.createGame(gameId, initialState);

      engine.initializeDecks();
      engine.startGame();
    }

    socket.data.playerId = playerId;
    socket.data.gameId = gameId;

    socket.join(gameId);

    // Emitujemy stan do wszystkich w grze (tablica players)
    let dto = mapToDto(engine.getState());
    if (!Array.isArray(dto.players)) dto.players = Object.values(dto.players);

    io.to(gameId).emit("state_update", dto);
  });

  socket.on("play_card", ({ cardId, row }) => {
    const gameId = socket.data.gameId;
    const playerId = socket.data.playerId;
    const engine = gameManager.getGame(gameId);
    if (!engine) return;

    try {
      engine.dispatch({ type: "PLAY_CARD", playerId, cardId, row });
      broadcastState(gameId);
    } catch (err) {
      socket.emit("error", String(err));
    }
  });

  socket.on("pass", () => {
    const gameId = socket.data.gameId;
    const playerId = socket.data.playerId;
    const engine = gameManager.getGame(gameId);
    if (!engine) return;

    engine.dispatch({ type: "PASS", playerId });
    broadcastState(gameId);
  });

  socket.on("mulligan_card", ({ cardId }) => {
    const gameId = socket.data.gameId;
    const playerId = socket.data.playerId;
    const engine = gameManager.getGame(gameId);
    if (!engine) return;

    try {
      engine.mulliganCard(playerId, cardId);
      broadcastState(gameId);
    } catch (err) {
      socket.emit("error", String(err));
    }
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});