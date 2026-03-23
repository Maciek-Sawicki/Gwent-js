import express from "express";
import http from "http";
import { Server } from "socket.io";

import { gameManager } from "./managers/GameManager";
import { mapToDto } from "./mappers/GameMapper";

import { GameState, CardRegistrySetup } from "@repo/game-engine";

CardRegistrySetup();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

function createInitialState(): GameState {
  return {
    round: 1,
    status: "WAITING",
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
      // NIE rozpoczynaj gry - czekaj na drugiego gracza
    }

    const state = engine.getState();
    console.log("Players sockets:", state.players.p1.socketId, state.players.p2.socketId);
    let playerId: "p1" | "p2";
    let shouldStartGame = false;

    // Sprawdź czy któryś z graczy ma już ten socket (reconnect)
    if (state.players.p1.socketId === socket.id) {
      playerId = "p1";
      console.log(`Socket ${socket.id} reconnected as p1`);
    } else if (state.players.p2.socketId === socket.id) {
      playerId = "p2";
      console.log(`Socket ${socket.id} reconnected as p2`);
    } else if (!state.players.p1.socketId) {
      // Pierwszy slot wolny
      playerId = "p1";
      state.players.p1.socketId = socket.id;
      console.log(`Socket ${socket.id} joined as p1`);
    } else if (!state.players.p2.socketId) {
      // Drugi slot wolny - teraz możemy rozpocząć grę!
      playerId = "p2";
      state.players.p2.socketId = socket.id;
      console.log(`Socket ${socket.id} joined as p2 - starting game!`);
      shouldStartGame = true;
    } else {
      // Gra pełna - resetuj grę jeśli obaj gracze się rozłączyli
      const p1Connected = state.players.p1.socketId && io.sockets.sockets.has(state.players.p1.socketId);
      const p2Connected = state.players.p2.socketId && io.sockets.sockets.has(state.players.p2.socketId);
      
      if (!p1Connected && !p2Connected) {
        // Wszyscy się rozłączyli - resetuj grę
        console.log("All players disconnected, resetting game");
        const initialState = createInitialState();
        engine = gameManager.createGame(gameId, initialState);
        engine.initializeDecks();
        // NIE rozpoczynaj gry - czekaj na drugiego gracza
        const newState = engine.getState();
        playerId = "p1";
        newState.players.p1.socketId = socket.id;
        console.log(`Socket ${socket.id} joined as p1 (reset game)`);
      } else {
        socket.emit("error", "Game is full");
        return;
      }
    }

    socket.data.playerId = playerId;
    socket.data.gameId = gameId;

    socket.join(gameId);

    gameManager.addSocket(gameId, socket.id);

    // Jeśli dołączył drugi gracz, rozpocznij grę
    if (shouldStartGame && state.status === "WAITING") {
      console.log("Both players joined, starting game!");
      engine.startGame();
      state.status = "IN_PROGRESS";
    }

    broadcastState(gameId);

    const currentState = engine.getState();
    let dto = mapToDto(currentState);
    if (!Array.isArray(dto.players)) dto.players = Object.values(dto.players);

    // Wyślij informację do gracza który właśnie dołączył, który gracz to "on"
    socket.emit("you_are_player", { playerId });
    
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
    const { gameId, playerId } = socket.data;
    
    if (gameId && playerId) {
      const engine = gameManager.getGame(gameId);
      if (engine) {
        const state = engine.getState();
        // Wyczyść socketId gracza który się rozłączył
        if (state.players[playerId]) {
          state.players[playerId].socketId = undefined;
          console.log(`Player ${playerId} disconnected, cleared socketId`);
        }
      }
    }
    
    gameManager.removeSocket(gameId, socket.id);
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});