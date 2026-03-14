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
        socketId: undefined,
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
        socketId: undefined,
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
  if (!Array.isArray(dto.players)) {
    dto.players = Object.values(dto.players);
  }
  // console.log("Broadcasting state DTO:", JSON.stringify(dto, null, 2));

  io.to(gameId).emit("state_update", dto);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  function requireTurn(callback: () => void) {
    const gameId = socket.data.gameId;
    const playerId = socket.data.playerId;
    const engine = gameManager.getGame(gameId);
    if (!engine) return;
    if (engine.getState().currentPlayer !== playerId) {
      socket.emit("error", "Not your turn");
      return;
    }
    callback();
  }

  socket.on("join_game", ({ gameId }) => {
    let engine = gameManager.getGame(gameId);
    if (!engine) {
      console.log("Creating game:", gameId);

      const initialState = createInitialState();
      engine = gameManager.createGame(gameId, initialState);
      engine.initializeDecks();
      engine.startGame();
    }

    const state = engine.getState();
    console.log("Players sockets:", state.players.p1.socketId, state.players.p2.socketId);
    let playerId: "p1" | "p2";

    if (!state.players.p1.socketId) {
      playerId = "p1";
      state.players.p1.socketId = socket.id;
    } else if (!state.players.p2.socketId) {
      playerId = "p2";
      state.players.p2.socketId = socket.id;
    } else {
      socket.emit("error", "Game is full");
      return;
    }

    socket.data.playerId = playerId;
    socket.data.gameId = gameId;

    socket.join(gameId);

    gameManager.addSocket(gameId, socket.id);
    broadcastState(gameId);

    console.log(`Socket ${socket.id} joined as ${playerId}`);

    let dto = mapToDto(state);
    if (!Array.isArray(dto.players)) dto.players = Object.values(dto.players);

    io.to(gameId).emit("state_update", dto);
  });

  socket.on("play_card", ({ cardId, row }) => {
    requireTurn(() => {
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
    })
  });

  socket.on("pass", () => {
    requireTurn(() => {
      const gameId = socket.data.gameId;
      const playerId = socket.data.playerId;
      const engine = gameManager.getGame(gameId);
      if (!engine) return;

      engine.dispatch({ type: "PASS", playerId });
      broadcastState(gameId);
    })
  });

  socket.on("mulligan_card", ({ cardId }) => {
    requireTurn(() => {
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
    })
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
    const { gameId } = socket.data;
    gameManager.removeSocket(gameId, socket.id);
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});